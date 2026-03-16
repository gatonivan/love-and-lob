import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import { useDeferredUnmount } from '../../hooks/useDeferredUnmount'
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
    description:
      'Never picked up a racket. We start from zero — grip, stance, and your first swing. No experience needed.',
  },
  {
    name: 'Beginner',
    description:
      'You\'ve hit a few balls but haven\'t played a real match. Building consistency on forehand, backhand, and serve fundamentals.',
  },
  {
    name: 'Intermediate',
    description:
      'You can rally and keep score. Working on shot placement, net play, and developing a game plan.',
  },
  {
    name: 'Advanced',
    description:
      'Competitive player with consistent strokes. Refining strategy, point construction, and match-level intensity.',
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
              <p className="schedule-season-dates">November &ndash; March</p>
              <p className="schedule-season-body">
                Indoor programming through the cold months. Clinics and private
                lessons to keep your game sharp year-round.
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
              <p className="schedule-season-dates">April &ndash; October</p>
              <p className="schedule-season-body">
                Outdoor clinics every Sunday at 9am. All levels welcome.
                $10 per session. Our home courts on the Upper West Side.
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
                  <h3 className="schedule-level-name">{level.name}</h3>
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
