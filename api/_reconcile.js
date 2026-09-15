/**
 * Pure drift classifier for the curated Sweatpals slug lists.
 *
 * This encodes the retirement rule that has lived in a comment since
 * 2026-08-20: a slug is retired only when it is BOTH delisted from the host
 * page AND out of future instances. Either condition alone is normal — a
 * listed series with no upcoming date is simply between publishes, and a
 * delisted series with future dates is still going to happen.
 *
 * Deliberately free of I/O: callers fetch, this decides. That is what makes
 * the highest-stakes logic in the repo cheap to test.
 */

const SPECIAL_TYPES = new Set(['EVENT', 'RETREAT'])

function hasFuture(probe, now) {
  if (!probe || !probe.ok || !probe.nextEnd) return false
  const end = Date.parse(probe.nextEnd)
  return !Number.isNaN(end) && end >= now.getTime()
}

function bucketFor(probe) {
  return SPECIAL_TYPES.has(probe?.eventType) ? 'special' : 'programs'
}

export function classify({ curated, discovered, probes, now }) {
  const listed = new Set(discovered)
  const curatedAll = [...curated.special, ...curated.programs]
  const verdicts = []
  const removed = []
  const added = []

  const next = { special: [], programs: [] }
  const place = (slug, bucket) => {
    if (next.special.includes(slug) || next.programs.includes(slug)) return
    next[bucket].push(slug)
  }

  for (const slug of curatedAll) {
    const probe = probes[slug]
    const wasSpecial = curated.special.includes(slug)
    const future = hasFuture(probe, now)
    const onPage = listed.has(slug)
    const name = probe?.name || slug
    // Keep a slug in the bucket it was curated into; a live series does not
    // change type, and re-bucketing on every run would thrash the file.
    const bucket = wasSpecial ? 'special' : 'programs'

    let verdict
    if (onPage && future) verdict = 'healthy'
    else if (onPage && !future) verdict = 'quiet'
    else if (!onPage && future) verdict = 'orphan'
    else verdict = 'dead'

    verdicts.push({ slug, name, bucket, verdict })

    if (verdict === 'dead') removed.push({ slug, name, bucket })
    else place(slug, bucket)
  }

  for (const slug of discovered) {
    if (curatedAll.includes(slug)) continue
    const probe = probes[slug]
    if (!hasFuture(probe, now)) continue
    const bucket = bucketFor(probe)
    const name = probe?.name || slug
    verdicts.push({ slug, name, bucket, verdict: 'new' })
    added.push({ slug, name, bucket })
    place(slug, bucket)
  }

  return { verdicts, added, removed, next, blocked: null }
}
