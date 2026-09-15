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
// them wholesale without touching this file's logic. See _schedule-slugs.js.
export { SPECIAL_EVENT_SLUGS, PROGRAM_SLUGS, UPDATED_AT } from './_schedule-slugs.js'
import { SPECIAL_EVENT_SLUGS, PROGRAM_SLUGS } from './_schedule-slugs.js'
import { MIN_LIST_FOR_RATIO_GUARD } from './_reconcile.js'

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

// The last path segment of HOST_PAGE_URL — this venue's slug on Sweatpals
// ('loveandlob'). Used by fetchHostScan to tell "Sweatpals restructured its
// own URL scheme around this same venue" (fine — e.g. sweatpals.com/loveandlob
// redirecting to sweatpals.com/host/loveandlob, observed in production) apart
// from "the request left this venue's page entirely" (not fine — see there).
const HOST_SLUG = new URL(HOST_PAGE_URL).pathname.split('/').filter(Boolean).pop()

// Slugs are lowercase alphanumerics and hyphens. Anything else in an `alias`
// field is not a slug we can fetch, so it is ignored rather than trusted.
const ALIAS_RE = /"alias":"([a-z0-9-]+)"/g

// Same key, captures any NON-EMPTY value — used only to detect when ALIAS_RE
// silently dropped a value (see the warning below). An `"alias":""` value is
// deliberately NOT drift: there is no character in it for the charset to have
// rejected, so it says nothing about a charset problem and must not count as
// one (see scanAliasValues).
const ALIAS_ANY_RE = /"alias":"([^"]+)"/g

const SLUG_CHARSET_RE = /^[a-z0-9-]+$/

/**
 * Split every `"alias":"..."` occurrence in `str` into `accepted` (charset-
 * valid slugs, de-duplicated, first-seen order) and `rejected` (de-duplicated
 * non-empty values the slug charset does not accept). Shared by
 * scanHostAliases and scanLooksHealthy so the two never disagree about what
 * counts as a rejection.
 */
function scanAliasValues(str) {
  const accepted = []
  const seenAccepted = new Set()
  for (const m of str.matchAll(ALIAS_RE)) {
    if (seenAccepted.has(m[1])) continue
    seenAccepted.add(m[1])
    accepted.push(m[1])
  }

  const rejected = []
  const seenRejected = new Set()
  for (const m of str.matchAll(ALIAS_ANY_RE)) {
    const raw = m[1]
    if (SLUG_CHARSET_RE.test(raw)) continue
    if (seenRejected.has(raw)) continue
    seenRejected.add(raw)
    rejected.push(raw)
  }

  return { accepted, rejected }
}

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
  const { accepted, rejected } = scanAliasValues(String(html))

  // At least one non-empty alias value contained a character outside
  // [a-z0-9-] and was silently excluded rather than trusted. That should be
  // rare — log it, and name the values, so a slow charset drift doesn't go
  // unnoticed and isn't undiagnosable when it happens. (scanLooksHealthy
  // recomputes this exact split as its secondary health check, so a
  // rejection here can also fail a scan closed.)
  if (rejected.length > 0) {
    console.warn(
      `scanHostAliases: ${rejected.length} alias value(s) rejected by the slug charset: ` +
        rejected.map((v) => JSON.stringify(v)).join(', '),
    )
  }

  return accepted
}

/**
 * The non-empty alias values rejected by the slug charset — the exact signal
 * scanHostAliases's own warning is built from, exposed separately so
 * fetchHostScan can hand the actual values to the failure email. A human
 * needs to see WHAT tripped the check, not just that something did.
 */
export function rejectedAliasValues(html) {
  if (!html) return []
  return scanAliasValues(String(html)).rejected
}

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
 * check on page content structurally cannot catch (an event's whole JSON
 * block, alias and all, disappearing from the page). Threshold: unhealthy
 * when discovered aliases are fewer than half of what's curated — the same
 * "more than half missing is a red flag" threshold `classify()`'s own
 * net-shrink guard uses, so the two guards agree on what "drastic" means.
 * `expectedCount === 0` (a first run, or an empty curated list) can't mean
 * "everything is suspect", so the check is skipped in that case (the
 * charset-drop check below still runs and can independently catch a badly
 * degraded first-run parse).
 *
 * The anchor is floored at `MIN_LIST_FOR_RATIO_GUARD`, not used as
 * `expectedCount` raw. `expectedCount` is drawn from the CURRENTLY CURATED
 * list, and the curated list is exactly what a persistently degraded scan
 * keeps shrinking (each unhealthy-but-not-quite-caught run that still
 * commits walks it down — 6 → 3 → 2 → 1) — so an un-floored anchor lets the
 * guard tune itself into irrelevance by its own output: at expectedCount=1
 * the threshold is "fewer than 0.5", which `aliases.length === 0` already
 * fails on its own above, making the count check permanently unable to fire.
 * Flooring the anchor at the same "a ratio below this many is meaningless"
 * constant `classify()`'s own shrink guard uses keeps the check meaningful
 * no matter how far a degraded parse has already dragged the curated count
 * down.
 *
 * SECONDARY check: did the slug charset silently drop an alias value? Reuses
 * the exact `accepted`/`rejected` split `scanHostAliases` already computes
 * for its `console.warn` (see `scanAliasValues`). If any non-empty alias
 * value was rejected, at least one alias contained a character outside
 * [a-z0-9-] and was silently excluded while its surrounding event JSON
 * parsed fine, which the expectedCount comparison above cannot see (the
 * curated count doesn't move). An `"alias":""` value is explicitly NOT a
 * rejection — there is no character in it for the charset to have rejected,
 * so it cannot be evidence of charset drift and must not trip this check on
 * its own. Any genuine (non-empty) rejection fails the check — no margin,
 * no tuning constant. That's deliberate: this signal is exact (a rejected
 * value IS a charset rejection, not a proxy for one, unlike a marker-count
 * ratio would be), so there is no calibration to get wrong, and the
 * asymmetry favors failing loud — the cost of a false alarm is one email to
 * a human, while the cost of missing a real one is a silently wrong
 * schedule. (An earlier version of this check compared alias counts against
 * `eventType`/`publishingState` marker counts using a tuned ratio. That was
 * replaced: a ratio is a proxy that depends on how many times the page
 * happens to embed each event's JSON today, so tightening it enough to
 * catch 1–2 dropped slugs left zero headroom against that embedding count
 * ever changing — and a ratio that's too tight fails *closed*, blocking
 * every future reconcile until a human notices and retunes the constant.
 * This exact comparison has no such failure mode.)
 *
 * ACCEPTED RESIDUAL, decided deliberately rather than fixed: a parse that
 * recovers 3, 4, or 5 of 6 curated events (i.e. loses 1–3 to a partial
 * markup change, without hitting the charset-rejection case above) still
 * reports healthy, because it doesn't cross the expectedCount/2 line. This
 * is NOT a coverage gap someone forgot to close — it was measured and
 * accepted because the blast radius is small and self-healing:
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

  if (expectedCount > 0) {
    const anchor = Math.max(expectedCount, MIN_LIST_FOR_RATIO_GUARD)
    if (aliases.length < anchor / 2) return false
  }

  if (rejectedAliasValues(html).length > 0) return false

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
 * (network error, non-OK response, or a redirect away from the host page —
 * see below) reports as `{ aliases: [], healthy: false, rejected: [] }`
 * rather than throwing: an unreachable host and a broken parse both need to
 * fail closed the same way, which is the entire point of `scanLooksHealthy`
 * existing.
 *
 * `res.url` (the FINAL url after redirects) is checked against this venue's
 * slug because `fetch` follows redirects transparently: if Sweatpals ever
 * 301s this path to a global feed (account change, soft-404, routing
 * change), `res.ok` is still true and the page still "looks" healthy — a
 * global feed typically has *more* aliases than expected, not fewer, so the
 * count guard above would not catch it. Scanning past a redirect like that
 * would mix other venues' events into this one's schedule.
 *
 * The check is deliberately not an exact/prefix match on `HOST_PAGE_URL`:
 * Sweatpals is observed, in production, 308-redirecting
 * `sweatpals.com/loveandlob` to `sweatpals.com/host/loveandlob` — a
 * same-venue URL-scheme change, not a hijack. `staysOnHostPage` instead
 * requires the final URL to be on `sweatpals.com` AND to still carry
 * `HOST_SLUG` as one of its path segments, which accepts that kind of
 * restructuring while still rejecting a redirect to an unrelated path (a
 * global feed, another venue's page, or a different domain entirely).
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
function staysOnHostPage(finalUrl) {
  try {
    const u = new URL(finalUrl)
    if (u.hostname !== 'sweatpals.com') return false
    return u.pathname.split('/').filter(Boolean).includes(HOST_SLUG)
  } catch {
    return false
  }
}

export async function fetchHostScan(
  expectedCount = SPECIAL_EVENT_SLUGS.length + PROGRAM_SLUGS.length,
) {
  try {
    const res = await fetch(HOST_PAGE_URL)
    if (!res.ok || !staysOnHostPage(res.url)) {
      return { aliases: [], healthy: false, rejected: [] }
    }
    const html = await res.text()
    const aliases = scanHostAliases(html)
    const rejected = rejectedAliasValues(html)
    return { aliases, healthy: scanLooksHealthy(html, aliases, expectedCount), rejected }
  } catch {
    return { aliases: [], healthy: false, rejected: [] }
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
