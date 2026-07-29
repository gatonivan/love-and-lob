/**
 * Shared Sweatpals data layer for the /schedule page.
 *
 * Special events (Invitationals and other one-offs) are curated by slug and
 * pulled from Sweatpals' public, no-auth event endpoint. This is intentionally
 * NOT driven by Sweatpals' host feed: that feed contains only the recurring
 * weekly clinics (CLASS type) and excludes RETREAT-type events, so the
 * Invitationals never appear there. Fetching curated slugs is the only reliable
 * way to surface the featured/special events.
 *
 * Consumed by both scripts/fetch-events.js (build time) and api/events.ts
 * (Vercel serverless, live). Keep this the single source of truth.
 */

// Curated special-event slugs. Add a slug here to feature a new special event
// on /schedule. Soonest-first ordering is derived at runtime from the dates.
export const SPECIAL_EVENT_SLUGS = ['ll-invitational-vol-3']

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
 * Fetch a single special event by slug from Sweatpals' public endpoint.
 * Returns the raw Sweatpals event object, or null if unavailable.
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
 * Fetch all curated special events, keep only active ones, and return them
 * normalized and sorted soonest-first. The first item is the "featured" event.
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

const HOST_PAGE = 'https://sweatpals.com/host/loveandlob'

/**
 * Fetch the host's recurring programming (weekly clinics/classes) for the
 * "Upcoming" list. Sweatpals' public search endpoint ignores the host filter
 * (returns a global feed), so the only reliable host-scoped source is the
 * upcoming-events query embedded in the host page's server-rendered data.
 * Returns normalized, active, soonest-first events (empty array on any failure).
 */
export async function fetchHostUpcoming(limit = 8) {
  let html
  try {
    const res = await fetch(HOST_PAGE, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; LoveAndLobBot/1.0)' },
    })
    if (!res.ok) return []
    html = await res.text()
  } catch {
    return []
  }

  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!match) return []
  let data
  try {
    data = JSON.parse(match[1])
  } catch {
    return []
  }

  const queries = data?.props?.pageProps?.dehydratedState?.queries || []
  const q = queries.find(
    (query) => query.queryKey?.[0] === 'events' && query.queryKey?.[2] === 'upcoming-events',
  )
  const items = (q?.state?.data?.pages || []).flatMap((page) => page.data || [])

  const now = new Date()
  return items
    .filter((ev) => isActive(ev, now))
    .map(normalizeEvent)
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
    .slice(0, limit)
}

/**
 * The full /schedule payload: the curated featured special event (or null) plus
 * the recurring programming feed. Consumed by both the build script and the
 * serverless function; written to public/events.json.
 */
export async function fetchScheduleData() {
  const [special, upcoming] = await Promise.all([
    fetchScheduleEvents(),
    fetchHostUpcoming(),
  ])
  return { featured: special[0] || null, upcoming }
}
