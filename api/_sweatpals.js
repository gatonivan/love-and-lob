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

// Featured special event(s) — rendered as the big card at the top of the page.
// The soonest active one is featured.
export const SPECIAL_EVENT_SLUGS = ['ll-invitational-vol-3']

// Recurring programming — rendered as the "Upcoming" list. Keep disjoint from
// SPECIAL_EVENT_SLUGS so nothing shows twice.
export const PROGRAM_SLUGS = [
  'll-early-morning-sessions',
  'll-x-rcta-mixed-doubles-tourney',
  'absolute-beginner-clinic-b8cc',
  'advanced-beginner-clinic-32e',
  'advanced-beginner-clinic-0c7a5c',
  'beginner-clinic-1e7f',
  'beginner-clinic-ed6',
  'intermediate-clinic-56',
  'cardio-tennis-b3c8',
  'kids-clinic-ages-58',
  'liveball-intermediateadvanced-5eacce',
  'liveball-bronx-intermediateadvanced',
]

// Max programs shown in the Upcoming list (soonest-first); the rest live behind
// the "View all on Sweatpals" link.
const UPCOMING_LIMIT = 8

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

/** A raw Sweatpals event is "active" when it's published and not yet finished. */
export function isActive(ev, now = new Date()) {
  if (ev.publishingState !== 'published') return false
  const end = new Date(ev.endDate || ev.startDate)
  return end >= now
}

/** Map a raw Sweatpals event to the events.json schema the client consumes. */
export function normalizeEvent(ev) {
  return {
    id: ev.id,
    name: ev.name,
    start_at: ev.startDate,
    end_at: ev.endDate,
    cover_url: coverUrl(ev),
    url: eventUrl(ev),
    location: ev.city?.name || ev.addressName || '',
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
  const featuredIds = new Set(special.map((ev) => ev.id))
  const upcoming = programs
    .filter((ev) => !featuredIds.has(ev.id))
    .slice(0, UPCOMING_LIMIT)
  return { featured, upcoming }
}
