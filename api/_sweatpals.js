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
