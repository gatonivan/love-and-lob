import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import { useDeferredUnmount } from '../../hooks/useDeferredUnmount'
import { useBottomScroll } from '../../hooks/useBottomScroll'
import './SchedulePage.css'

interface ScheduleEvent {
  id: string
  name: string
  start_at: string
  end_at: string
  cover_url: string | null
  url: string
  location: string
}

// Sweatpals host page — recurring weekly clinics live here.
const SWEATPALS_HOST_URL = 'https://sweatpals.com/host/loveandlob'

/**
 * A featured event we host ourselves, so there is no Sweatpals slug to curate.
 * It outranks the Sweatpals special event while it runs, then retires itself.
 *
 * The hazard the section comment below warns about is a static card with no end
 * date, which keeps advertising a date that has passed. This one carries
 * `endsAt` and disappears on its own, at which point the Sweatpals special
 * event takes the slot back with no code change.
 */
const LOCAL_FEATURED = {
  name: 'Love & Lob Swap Meet',
  meta: 'Thursday, September 3 – Friday, September 4 · Moxy Williamsburg, Brooklyn',
  to: '/swapmeet',
  cta: 'See the lineup',
  // ~11:59PM ET on Friday Sept 4, when the marketplace closes.
  endsAt: '2026-09-05T03:59:00.000Z',
}

interface ScheduleData {
  featured: ScheduleEvent | null
  upcoming: ScheduleEvent[]
}

const EMPTY_SCHEDULE: ScheduleData = { featured: null, upcoming: [] }

// Drop anything already past (guards the frozen static file). Upcoming clinics
// go once they've started; the featured event survives until it has ended, so
// an in-progress special event still headlines the page.
function pruneUpcoming(data: ScheduleData): ScheduleData {
  const now = new Date()
  const featured = data.featured
  const featuredEnd = featured && new Date(featured.end_at || featured.start_at)
  return {
    featured: featuredEnd && featuredEnd >= now ? featured : null,
    upcoming: (data.upcoming ?? []).filter((ev) => new Date(ev.start_at) >= now),
  }
}

async function fetchJson(url: string): Promise<ScheduleData | null> {
  try {
    const res = await fetch(url)
    if (res.ok) return await res.json()
  } catch { /* ignore */ }
  return null
}

async function fetchSchedule(): Promise<ScheduleData> {
  // The static events.json is the reliable source for the recurring-clinic
  // list — it's built where Sweatpals' host page is reachable. The live API
  // only freshens the featured event; its clinic scrape returns empty from
  // Vercel's datacenter, so we never let an empty live list shadow the static
  // clinics.
  const [staticData, live] = await Promise.all([
    fetchJson(`${import.meta.env.BASE_URL}events.json`),
    fetchJson('/api/events'),
  ])
  const base = staticData ?? EMPTY_SCHEDULE
  return pruneUpcoming({
    featured: live?.featured ?? base.featured,
    upcoming: live?.upcoming?.length ? live.upcoming : base.upcoming,
  })
}

// "Saturday, August 8 · 12:00 – 6:00 PM · Hastings-on-Hudson"
function formatFeaturedMeta(ev: ScheduleEvent): string {
  const day = new Date(ev.start_at).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  const parts = [`${day} · ${formatTime(ev.start_at)} – ${formatTime(ev.end_at)}`]
  if (ev.location) parts.push(ev.location)
  return parts.join(' · ')
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

const SKILL_LEVELS = [
  {
    name: 'Absolute Beginner',
    subtitle: 'Starting Level',
    description:
      'Complete newcomers who need to learn how to hold a racket properly, basic swing mechanics, & fundamental movement patterns. They\'re just beginning to make consistent contact with the ball.',
  },
  {
    name: 'Beginner',
    description:
      'Players who can make basic contact with the ball and understand court positioning, but their shots lack consistency and power. They can sustain short rallies on a smaller court with cooperative partners.',
  },
  {
    name: 'Advanced Beginner',
    description:
      'Players who have developed more reliable ball contact and can keep rallies going on a full court, though their shot placement & power are still developing. They understand basic strategy, but execution remains inconsistent. (USTA 2.0–3.0)',
  },
  {
    name: 'Low-Intermediate',
    description:
      'Players with solid fundamental technique who can execute all basic strokes (forehand, backhand, serve, volley) but with varying degrees of success. Their consistency fluctuates during matches, & they\'re still refining their shot selection. (USTA 3.0–3.5)',
  },
  {
    name: 'High-Intermediate',
    description:
      'Consistent players with good technique across all strokes who can execute most shots reliably under pressure. They understand court positioning, basic tactics, & can compete effectively in recreational leagues. (USTA 3.5–4.0)',
  },
  {
    name: 'Advanced',
    description:
      'Highly consistent players who excel in match situations, capable of executing advanced shots and strategies. You compete at USTA 4.0+ levels.',
  },
  {
    name: 'I\'m Nice',
    description:
      'Former high-level competitive players (high school/college) with exceptional technique, court sense, and match experience. You play at USTA 4.5+ levels with advanced shot-making ability.',
  },
]

export function SchedulePage() {
  const pathname = useLocation().pathname
  const settled = useSceneStore((s) => s.cameraMode === 'birdseye' && s.cameraSettled)
  const [schedule, setSchedule] = useState<ScheduleData>(EMPTY_SCHEDULE)
  const [loading, setLoading] = useState(true)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchSchedule()
      .then((data) => setSchedule(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const isSchedule = pathname === '/schedule'
  const [shouldRender, isVisible] = useDeferredUnmount(isSchedule)
  const show = isVisible && settled

  // Featured = curated special event; upcoming = weekly clinics.
  const { featured, upcoming } = schedule

  // The self-hosted card wins the featured slot while it is still live.
  const localFeatured =
    new Date(LOCAL_FEATURED.endsAt) >= new Date() ? LOCAL_FEATURED : null

  // Demote rather than drop: without this the Sweatpals special event would
  // vanish from the page entirely while the local card holds the slot.
  const upcomingList =
    localFeatured && featured
      ? [...upcoming, featured].sort(
          (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
        )
      : upcoming

  useBottomScroll(isSchedule, overlayRef)

  if (!shouldRender) return null

  return (
    <div ref={overlayRef} className={`schedule-overlay ${show ? 'schedule-overlay--visible' : ''}`}>
      <div className={`schedule-content ${show ? 'schedule-content--visible' : ''}`}>

        {/* ── TOP: Season Header ── */}
        <section className="schedule-header">
          <h1 className="schedule-title">Schedule</h1>

          {/* ── Featured event (own section, above the seasons) ── */}
          {/* Dynamic from the soonest active special event in SPECIAL_EVENT_SLUGS.
              No static fallback on purpose: a hardcoded card outlives its event
              and advertises a date that has already passed. Between special
              events the section simply doesn't render. */}
          {localFeatured ? (
            <section className="schedule-invitational">
              <Link to={localFeatured.to} className="schedule-invitational-card">
                <span className="schedule-invitational-tag">Featured Event</span>
                <h2 className="schedule-invitational-name">{localFeatured.name}</h2>
                <p className="schedule-invitational-meta">{localFeatured.meta}</p>
                <span className="schedule-invitational-cta">{localFeatured.cta} &rarr;</span>
              </Link>
            </section>
          ) : featured ? (
            <section className="schedule-invitational">
              <a
                href={featured.url}
                target="_blank"
                rel="noopener noreferrer"
                className="schedule-invitational-card"
              >
                <span className="schedule-invitational-tag">Featured Event</span>
                <h2 className="schedule-invitational-name">{featured.name}</h2>
                <p className="schedule-invitational-meta">{formatFeaturedMeta(featured)}</p>
                <span className="schedule-invitational-cta">Register on Sweatpals &rarr;</span>
              </a>
            </section>
          ) : null}

          <div className="schedule-seasons">
            <div className="schedule-season">
              <h2 className="schedule-season-name">Winter Season</h2>
              <p className="schedule-season-dates">November &ndash; April</p>
              <p className="schedule-season-body">
                Indoor programming, such as our infamous Monthly Classic &amp; Uptown Special, to keep your game sharp through the cold months.
              </p>
              <a
                href={SWEATPALS_HOST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="schedule-season-link"
              >
                View on Sweatpals &rarr;
              </a>
            </div>

            <div className="schedule-season-divider" />

            <div className="schedule-season">
              <h2 className="schedule-season-name">Summer Season</h2>
              <p className="schedule-season-dates">June &ndash; October</p>
              <p className="schedule-season-body">
                Outdoor programming with a variety of classes such as Cardio, Liveball, dedicated 90-minute Beginner to Intermediate level sessions, &amp; special events such as our L&amp;L Invitationals, &amp; more at the following locations:
              </p>
              <ul className="schedule-season-locations">
                <li>Lehman College (The Bronx)</li>
                <li>Greenpoint (Brooklyn)</li>
                <li>Brooklyn College (Brooklyn)</li>
              </ul>
              <a
                href={SWEATPALS_HOST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="schedule-season-link"
              >
                View on Sweatpals &rarr;
              </a>
            </div>
          </div>
        </section>

        {/* ── BOTTOM: Split layout ── */}
        <div className="schedule-bottom">

          {/* Lower Left: Calendar */}
          <section className="schedule-calendar">
            <h2 className="schedule-section-heading">Upcoming</h2>

            {loading ? (
              <div className="schedule-loading">Loading schedule...</div>
            ) : upcomingList.length === 0 ? (
              <div className="schedule-empty">Nothing scheduled yet. Check back soon!</div>
            ) : (
              <div className="schedule-list">
                {upcomingList.map((ev) => (
                  <a
                    key={ev.id}
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="schedule-card"
                  >
                    {ev.cover_url && (
                      <img
                        className="schedule-card-cover"
                        src={ev.cover_url}
                        alt=""
                        loading="lazy"
                      />
                    )}
                    <div className="schedule-card-info">
                      <div className="schedule-card-date">
                        {formatDate(ev.start_at)} &middot; {formatTime(ev.start_at)}
                      </div>
                      <div className="schedule-card-name">{ev.name}</div>
                      {ev.location && (
                        <div className="schedule-card-location">{ev.location}</div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}

            <a
              href={SWEATPALS_HOST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="schedule-sweatpals-link"
            >
              View all on Sweatpals &rarr;
            </a>
          </section>

          {/* Lower Right: Skill Levels */}
          <section className="schedule-levels">
            <h2 className="schedule-section-heading">Skill Levels</h2>

            <div className="schedule-levels-list">
              {SKILL_LEVELS.map((level) => (
                <div key={level.name} className="schedule-level">
                  <h3 className="schedule-level-name">
                    {level.name}
                    {'subtitle' in level && level.subtitle && (
                      <span className="schedule-level-subtitle"> ({level.subtitle})</span>
                    )}
                  </h3>
                  <p className="schedule-level-desc">{level.description}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}
