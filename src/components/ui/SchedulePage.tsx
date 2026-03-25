import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import { useDeferredUnmount } from '../../hooks/useDeferredUnmount'
import { useBottomScroll } from '../../hooks/useBottomScroll'
import './SchedulePage.css'

interface LumaEvent {
  id: string
  name: string
  start_at: string
  end_at: string
  cover_url: string | null
  url: string
  location: string
}

async function fetchUpcomingEvents(): Promise<LumaEvent[]> {
  // Try live API first, fall back to static JSON
  try {
    const res = await fetch('/api/events')
    if (res.ok) return await res.json()
  } catch { /* fall through */ }
  const res = await fetch(`${import.meta.env.BASE_URL}events.json`)
  if (!res.ok) return []
  const events: LumaEvent[] = await res.json()
  const now = new Date()
  return events.filter((ev) => new Date(ev.start_at) >= now)
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
  const [events, setEvents] = useState<LumaEvent[]>([])
  const [loading, setLoading] = useState(true)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUpcomingEvents()
      .then((evs) => setEvents(evs))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const isSchedule = pathname === '/schedule'
  const [shouldRender, isVisible] = useDeferredUnmount(isSchedule)
  const show = isVisible && settled

  useBottomScroll(isSchedule, overlayRef)

  if (!shouldRender) return null

  return (
    <div ref={overlayRef} className={`schedule-overlay ${show ? 'schedule-overlay--visible' : ''}`}>
      <div className={`schedule-content ${show ? 'schedule-content--visible' : ''}`}>

        {/* ── TOP: Season Header ── */}
        <section className="schedule-header">
          <h1 className="schedule-title">Schedule</h1>

          <div className="schedule-seasons">
            <div className="schedule-season">
              <h2 className="schedule-season-name">Winter Season</h2>
              <p className="schedule-season-dates">November &ndash; April</p>
              <p className="schedule-season-body">
                Indoor programming through the cold months. Clinics to keep
                your game sharp year-round.
              </p>
              <a
                href="https://lu.ma/loveandlob"
                target="_blank"
                rel="noopener noreferrer"
                className="schedule-season-link"
              >
                View on Luma &rarr;
              </a>
            </div>

            <div className="schedule-season-divider" />

            <div className="schedule-season">
              <h2 className="schedule-season-name">Summer Season</h2>
              <p className="schedule-season-dates">May &ndash; October</p>
              <p className="schedule-season-body">
                Details coming soon.
              </p>
              <a
                href="https://lu.ma/loveandlob"
                target="_blank"
                rel="noopener noreferrer"
                className="schedule-season-link"
              >
                View on Luma &rarr;
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
            ) : events.length === 0 ? (
              <div className="schedule-empty">Nothing scheduled yet. Check back soon!</div>
            ) : (
              <div className="schedule-list">
                {events.map((ev) => (
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
              href="https://lu.ma/loveandlob"
              target="_blank"
              rel="noopener noreferrer"
              className="schedule-luma-link"
            >
              View all on Luma &rarr;
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
