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

// Below this the shrink ratio is meaningless — losing 1 of 2 is not a signal.
const MIN_LIST_FOR_RATIO_GUARD = 4

function hasFuture(probe, now) {
  if (!probe || !probe.ok || !probe.nextEnd) return false
  const end = Date.parse(probe.nextEnd)
  return !Number.isNaN(end) && end >= now.getTime()
}

function bucketFor(probe) {
  return SPECIAL_TYPES.has(probe?.eventType) ? 'special' : 'programs'
}

export function classify({ curated, discovered, probes, now }) {
  // GUARD 1: a scan that found nothing means Sweatpals is down or changed its
  // markup — NOT that every program was cancelled. Without this, one outage
  // empties the schedule.
  if (!discovered || discovered.length === 0) {
    return {
      verdicts: [],
      added: [],
      removed: [],
      next: null,
      blocked: {
        guard: 'empty-scan',
        reason: 'Host page scan returned no aliases; treating as a scan failure.',
      },
    }
  }

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

  // GUARD 2: net size, not gross removals. A rotation (5 die, 5 born) is
  // healthy churn and must auto-apply; a collapse (5 die, 0 born) must not.
  const before = curatedAll.length
  const after = next.special.length + next.programs.length
  if (before >= MIN_LIST_FOR_RATIO_GUARD && after * 2 < before) {
    return {
      verdicts,
      added,
      removed,
      next: null,
      blocked: {
        guard: 'net-shrink',
        reason: `List would shrink from ${before} to ${after}; refusing to apply without review.`,
      },
    }
  }

  return { verdicts, added, removed, next, blocked: null }
}
