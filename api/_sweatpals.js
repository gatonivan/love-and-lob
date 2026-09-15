/**
 * Shared Sweatpals data layer for the /schedule page.
 *
 * Everything is fetched by curated slug from Sweatpals' public, no-auth event
 * endpoint (`/events/public/nearest/instance?alias=<slug>`). Slugs are STABLE
 * per recurring series and the endpoint returns each series' next upcoming
 * instance, so this list is self-updating week to week — you only edit it when
 * a program is added or retired. We deliberately do NOT scrape the Sweatpals
 * host page: its structure changes without notice and its public search
 * endpoint ignores the host filter (returns a global feed), so scraping is
 * unreliable. Slugs are the only stable, host-scoped source.
 *
 * Consumed by both scripts/fetch-events.js (build time) and api/events.ts
 * (Vercel serverless, live). Keep this the single source of truth.
 *
 * To add an event: open its Sweatpals page, copy the slug from the URL
 * (`sweatpals.com/<type>/<slug>`), and add it below.
 */

// The curated lists live in their own module so the reconcile job can rewrite
// them wholesale without touching this file's logic. See schedule-slugs.js.
export { SPECIAL_EVENT_SLUGS, PROGRAM_SLUGS, UPDATED_AT } from './schedule-slugs.js'
import { SPECIAL_EVENT_SLUGS, PROGRAM_SLUGS } from './schedule-slugs.js'

// Max programs shown in the Upcoming list (soonest-first); the rest live behind
// the "View all on Sweatpals" link, which deep-links to the host calendar view.
// Held at 6 deliberately: the list is a preview of the next few days, not a
// full calendar, and past 6 it outgrows the column beside the skill levels.
const UPCOMING_LIMIT = 6

const EVENT_API = 'https://ilove.sweatpals.com/api/events/public/nearest/instance'
const FILE_API = 'https://ilove.sweatpals.com/api/files'

// Sweatpals event types map to different public URL paths.
const TYPE_PATHS = { RETREAT: 'retreat', EVENT: 'event', CLASS: 'event' }

function eventUrl(ev) {
  const path = TYPE_PATHS[ev.eventType] || 'event'
  return `https://sweatpals.com/${path}/${ev.alias}`
}

function coverUrl(ev) {
  const fileId = ev.avatarId || ev.galleryFiles?.[0]?.id
  return fileId ? `${FILE_API}/${fileId}?variant=l` : null
}

/**
 * Fetch a single event by slug from Sweatpals' public endpoint (returns the
 * next upcoming instance for recurring series). Returns the raw Sweatpals event
 * object, or null if unavailable.
 */
export async function fetchEventBySlug(slug) {
  const res = await fetch(`${EVENT_API}?alias=${encodeURIComponent(slug)}`)
  if (!res.ok) return null
  const ev = await res.json()
  return ev && ev.id ? ev : null
}

/**
 * When a recurring series is returned, `startDate`/`endDate` describe the
 * series' FIRST instance — which goes into the past and stays there — while
 * `instance`/`instanceEndDate` carry the next upcoming occurrence. Reading the
 * former silently ages every weekly clinic out of the schedule a week after the
 * series was created. Always prefer the instance fields; one-off events set
 * both to the same value, so this is safe across event types.
 */
export function nextStart(ev) {
  return ev.instance || ev.startDate
}

export function nextEnd(ev) {
  return ev.instanceEndDate || ev.endDate || nextStart(ev)
}

/** A raw Sweatpals event is "active" when it's published and not yet finished. */
export function isActive(ev, now = new Date()) {
  if (ev.publishingState !== 'published') return false
  return new Date(nextEnd(ev)) >= now
}

/**
 * Map a raw Sweatpals event to the events.json schema the client consumes.
 *
 * Names are trimmed: organizers sometimes save a title with leading/trailing
 * spaces (e.g. `" Intermediate Clinic (Brooklyn College) "`), which renders as
 * visible gaps in the Upcoming list.
 */
export function normalizeEvent(ev) {
  return {
    id: ev.id,
    name: (ev.name || '').trim(),
    start_at: nextStart(ev),
    end_at: nextEnd(ev),
    cover_url: coverUrl(ev),
    url: eventUrl(ev),
    location: (ev.city?.name || ev.addressName || '').trim(),
  }
}

/**
 * Fetch a set of slugs, keep only active ones, and return them normalized and
 * sorted soonest-first. Failed/unavailable slugs are dropped silently.
 */
export async function fetchScheduleEvents(slugs = SPECIAL_EVENT_SLUGS) {
  const raw = await Promise.all(
    slugs.map((slug) => fetchEventBySlug(slug).catch(() => null)),
  )
  const now = new Date()
  return raw
    .filter((ev) => ev && isActive(ev, now))
    .map(normalizeEvent)
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
}

export const HOST_PAGE_URL = 'https://sweatpals.com/loveandlob'

// Slugs are lowercase alphanumerics and hyphens. Anything else in an `alias`
// field is not a slug we can fetch, so it is ignored rather than trusted.
const ALIAS_RE = /"alias":"([a-z0-9-]+)"/g

// Same key, no charset restriction — used only to detect when ALIAS_RE
// silently dropped a value (see the warning below).
const ALIAS_ANY_RE = /"alias":"[^"]*"/g

/**
 * Extract event aliases from the host page's embedded JSON.
 *
 * This is the one scrape in the codebase and it is deliberately confined to
 * the reconcile job — never a pageload path. It only ever *proposes* changes
 * that guards and a commit record keep honest, so when Sweatpals restructures
 * their markup the result is a failure email, not a wrong schedule.
 */
export function scanHostAliases(html) {
  if (!html) return []
  const str = String(html)
  const seen = new Set()
  for (const m of str.matchAll(ALIAS_RE)) seen.add(m[1])

  // If the permissive pattern found more raw `"alias":"..."` occurrences than
  // the charset-restricted one matched, at least one alias value contained a
  // character outside [a-z0-9-] and was silently excluded rather than
  // trusted. That should be rare — log it so a slow charset drift doesn't go
  // unnoticed. (scanLooksHealthy's marker check is the second line of
  // defense if this undercounting gets bad enough to matter.)
  const rawCount = (str.match(ALIAS_ANY_RE) || []).length
  const acceptedCount = [...str.matchAll(ALIAS_RE)].length
  if (rawCount > acceptedCount) {
    console.warn(
      `scanHostAliases: ${rawCount - acceptedCount} alias value(s) rejected by the slug charset`,
    )
  }

  return [...seen]
}

// Confirmed against the live host page on 2026-09-15: 6 unique aliases, and
// `"eventType":` / `"publishingState":` together matched 24 times (12 each —
// every event's JSON is embedded twice, once for SSR and once for
// hydration), i.e. ~4 combined marker hits per unique alias. This is a
// SECONDARY, narrower check than scanLooksHealthy's primary expectedCount
// comparison below: it exists to catch the one failure the count check
// structurally cannot — an alias value rejected by ALIAS_RE's charset (see
// the warning in scanHostAliases) while the surrounding event JSON,
// including its eventType/publishingState fields, still parses fine. A
// rejected alias never shrinks expectedCount's comparison (the curated
// count doesn't move), so only a page-shape signal can catch it.
//
// It is NOT relied on to catch a structural markup change, because a change
// that drops an event's entire JSON representation drops its markers along
// with its alias — both sides of this ratio shrink together and it reads
// as "healthy". That structural case is what the expectedCount check exists
// to catch instead.
//
// MARKER_TO_ALIAS_RATIO is set to 4 — the EXACT combined marker-per-alias
// ratio measured on the live host page on 2026-09-15 (24 combined
// eventType/publishingState hits / 6 unique aliases), with NO headroom.
// That is deliberate, not an oversight: a ratio of 6 (the original value)
// left 1.5x headroom over the true ratio of 4 and never fired in practice;
// a ratio of 12 (the "corrected" value from the following review round)
// gave 3x headroom and became unreachable — every case it could catch, the
// expectedCount check already caught first. Reaching down to 1–2
// charset-rejected slugs out of 6 requires cutting headroom to exactly the
// observed ratio (proven with tests: `markerCount > aliases.length * R`
// only flags 1-of-6 rejected when R < 4.8, i.e. R <= 4 for an integer).
// The accepted tradeoff: this check has ZERO slack against future
// structural drift. If Sweatpals' rendering ever changes how many times
// each event's JSON is embedded (currently 2x: SSR + hydration), this
// constant will need recalibrating against a fresh live fetch, or a
// perfectly healthy page will start reading as unhealthy. That is
// considered acceptable because (a) the primary expectedCount check does
// not depend on this ratio at all and keeps working regardless, and (b) a
// false "unhealthy" here fails closed — a blocked run needing review, never
// a wrong deletion.
const EVENT_MARKER_RE = /"eventType":|"publishingState":/g
const MARKER_TO_ALIAS_RATIO = 4

/**
 * Sanity-check a scan's own result: does the page look like it was actually
 * understood, or does the evidence suggest a broken/partial parse?
 *
 * This exists because `classify()`'s empty-scan guard only catches a scan
 * that found *zero* aliases. A scan that finds *some* — say the host changed
 * markup so only 1 of 6 events still parses — looks non-empty to that guard,
 * so the 5 that silently failed to parse read as "delisted." Any of those
 * that are merely quiet (published, no upcoming instance right now) then get
 * reclassified as retired and removed from the live site, which is exactly
 * what the retirement rule says must never happen on absence alone. Only the
 * scanner has the raw HTML to tell the difference, so the check lives here.
 *
 * `expectedCount` is the size of the CURRENTLY CURATED list, passed in by the
 * caller — never the discovered aliases' identities. Comparing identities
 * would flag a legitimate wholesale alias migration (Sweatpals renames every
 * slug at once) as broken, which is exactly the scenario this project exists
 * to heal. Comparing *counts* sidesteps that: a migration that produces N
 * brand-new aliases when N were curated stays healthy, while a parse that
 * recovers far fewer aliases than we already know exist is suspect
 * regardless of what the markup looks like — including the case a same-page
 * marker check structurally cannot catch (an event's whole JSON block, alias
 * and markers together, disappearing from the page). Threshold: unhealthy
 * when discovered aliases are fewer than half of what's curated — the same
 * "more than half missing is a red flag" threshold `classify()`'s own
 * net-shrink guard uses, so the two guards agree on what "drastic" means.
 * `expectedCount === 0` (a first run, or an empty curated list) can't mean
 * "everything is suspect", so the check is skipped in that case (the marker
 * check below still runs and can independently catch a badly degraded
 * first-run parse).
 *
 * ACCEPTED RESIDUAL, decided deliberately rather than fixed: a parse that
 * recovers 3, 4, or 5 of 6 curated events (i.e. loses 1–3 to a partial
 * markup change, without hitting the charset-rejection case the marker
 * check below covers) still reports healthy, because it doesn't cross the
 * expectedCount/2 line. This is NOT a coverage gap someone forgot to close
 * — it was measured and accepted because the blast radius is small and
 * self-healing:
 *   - A curated slug that fails to parse can only be *deleted* if it is
 *     BOTH unparsed AND `quiet` (no future instance) in `classify()`. An
 *     unparsed slug with a future date classifies `orphan` and is kept
 *     unconditionally (`classify()` guard 4).
 *   - `fetchScheduleEvents()` filters everything through `isActive()`,
 *     which requires `nextEnd >= now` — so a `quiet` program already
 *     renders nothing on the live site today. Losing it deletes an
 *     already-invisible curated entry, not something a visitor can see.
 *   - When that program's series next publishes a future instance, it
 *     reappears in `discovered` and is re-added as `new`. The list
 *     self-heals on the next healthy scan.
 * The alternative considered and rejected — requiring `probe.ok === false`
 * before ever retiring a slug — was checked against real September 2026
 * retirements: most genuinely-retired series still resolve `ok: true` with
 * a past date (only one actually 404'd), so that rule would retire almost
 * nothing and the curated list would grow without bound.
 */
export function scanLooksHealthy(html, aliases, expectedCount = 0) {
  if (!html) return false
  // No aliases is never "healthy" on its own terms — there is nothing to
  // reconcile against, and an automated run should not treat a mysteriously
  // empty page as reality. (classify()'s own empty-scan guard also rejects
  // this case; agreeing here keeps the two guards consistent.)
  if (!Array.isArray(aliases) || aliases.length === 0) return false

  if (expectedCount > 0 && aliases.length < expectedCount / 2) return false

  const markerCount = (String(html).match(EVENT_MARKER_RE) || []).length
  if (markerCount > aliases.length * MARKER_TO_ALIAS_RATIO) return false

  return true
}

/**
 * Fetch one slug and reduce it to just what the classifier needs. Any failure
 * is reported as `{ ok: false }` rather than thrown — a dead slug is expected
 * input, not an error.
 */
export async function probeSlug(slug) {
  try {
    const ev = await fetchEventBySlug(slug)
    if (!ev) return { ok: false }
    return {
      ok: true,
      name: (ev.name || '').trim() || slug,
      eventType: ev.eventType,
      nextEnd: nextEnd(ev),
    }
  } catch {
    return { ok: false }
  }
}

/**
 * Fetch the host page, scan it, and judge whether the scan looks trustworthy
 * — the single call the reconcile job (later tasks) needs. Any failure
 * (network error, non-OK response) reports as `{ aliases: [], healthy: false
 * }` rather than throwing: an unreachable host and a broken parse both need
 * to fail closed the same way, which is the entire point of
 * `scanLooksHealthy` existing.
 *
 * `expectedCount` defaults to the size of the current curated lists — every
 * real caller wants that value anyway, and this guard has already failed
 * open three times over the course of review. An omitted argument must not
 * silently disable the primary health check (it would, if this defaulted to
 * 0: `scanLooksHealthy` reads `expectedCount === 0` as "skip the count
 * check," meaning a call with no argument would report a 1-event page as
 * healthy). Pass an explicit `expectedCount` only to deliberately bypass the
 * count check (e.g. a genuine first run with nothing curated yet).
 */
export async function fetchHostScan(
  expectedCount = SPECIAL_EVENT_SLUGS.length + PROGRAM_SLUGS.length,
) {
  try {
    const res = await fetch(HOST_PAGE_URL)
    if (!res.ok) return { aliases: [], healthy: false }
    const html = await res.text()
    const aliases = scanHostAliases(html)
    return { aliases, healthy: scanLooksHealthy(html, aliases, expectedCount) }
  } catch {
    return { aliases: [], healthy: false }
  }
}

/**
 * The full /schedule payload: the featured special event (or null) plus the
 * recurring programming list. Consumed by both the build script and the
 * serverless function; written to public/events.json.
 */
export async function fetchScheduleData() {
  const [special, programs] = await Promise.all([
    fetchScheduleEvents(SPECIAL_EVENT_SLUGS),
    fetchScheduleEvents(PROGRAM_SLUGS),
  ])
  const featured = special[0] || null
  // Only the featured event is held out of the list. Any remaining special
  // events merge into Upcoming alongside the clinics — dropping them would
  // hide a scheduled tournament from the page entirely.
  const rest = special.slice(1)
  const upcoming = [...rest, ...programs]
    .filter((ev) => !featured || ev.id !== featured.id)
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
    .slice(0, UPCOMING_LIMIT)
  return { featured, upcoming }
}
