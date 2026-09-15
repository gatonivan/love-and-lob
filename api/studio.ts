import type { VercelRequest, VercelResponse } from '@vercel/node'
import { timingSafeEqual } from 'node:crypto'
import { fetchHostScan, probeSlug } from './_sweatpals.js'
import { SPECIAL_EVENT_SLUGS, PROGRAM_SLUGS } from './schedule-slugs.js'
import { classify } from './_reconcile.js'

const REPO = 'gatonivan/love-and-lob'
const WORKFLOW = 'reconcile-schedule.yml'

// The studio page's audience is one non-technical person: a slug must never
// render on screen. classify()/probeSlug() fall back to the slug (or leave
// an empty string) when Sweatpals has no name for an event — most often on a
// `removed` item, whose probe commonly failed entirely. Strip that fallback
// at the wire boundary so the page can render a plain-English placeholder
// instead. `api/_notify.js`'s email digest is a technical audience and keeps
// the slug fallback — do not touch it.
export const human = <T extends { slug: string; name: string }>(it: T) =>
  ({ ...it, name: it.name === it.slug || !it.name ? null : it.name })

function authorized(req: VercelRequest): boolean {
  const expected = process.env.STUDIO_PASSPHRASE
  const given = req.headers['x-studio-key']
  if (!expected || typeof given !== 'string') return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  // Compare lengths separately: timingSafeEqual throws on a length mismatch.
  return a.length === b.length && timingSafeEqual(a, b)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!authorized(req)) return res.status(401).json({ error: 'Not authorized' })

  const action = (req.body || {}).action

  if (action === 'scan') {
    const curated = { special: SPECIAL_EVENT_SLUGS, programs: PROGRAM_SLUGS }
    const expectedCount = curated.special.length + curated.programs.length

    // Same wrapper the reconcile job uses, so this endpoint and the cron job
    // never disagree about whether a scan can be trusted. A degraded scan
    // must not be classified — that is how live programming gets deleted.
    const { aliases: discovered, healthy } = await fetchHostScan(expectedCount)

    if (!healthy) {
      return res.status(200).json({
        verdicts: [],
        added: [],
        removed: [],
        blocked: null,
        scanOk: false,
      })
    }

    const all = [...new Set([...curated.special, ...curated.programs, ...discovered])]
    const probes = Object.fromEntries(
      await Promise.all(all.map(async (s) => [s, await probeSlug(s)])),
    )
    const result = classify({ curated, discovered, probes, now: new Date() })
    return res.status(200).json({
      verdicts: result.verdicts,
      added: result.added.map(human),
      removed: result.removed.map(human),
      blocked: result.blocked,
      scanOk: true,
    })
  }

  if (action === 'apply') {
    const token = process.env.GH_DISPATCH_TOKEN
    if (!token) return res.status(500).json({ error: 'Server misconfigured' })
    try {
      const r = await fetch(
        `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
        {
          method: 'POST',
          headers: {
            accept: 'application/vnd.github+json',
            authorization: `Bearer ${token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ ref: 'main' }),
        },
      )
      if (!r.ok) {
        return res.status(502).json({ error: 'Could not start the update', status: r.status })
      }
      return res.status(202).json({ dispatched: true })
    } catch {
      return res.status(502).json({ error: 'Could not start the update' })
    }
  }

  return res.status(400).json({ error: 'Unknown action' })
}
