import { useEffect, useState } from 'react'
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

export function SchedulePage() {
  const [events, setEvents] = useState<LumaEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUpcomingEvents()
      .then((evs) => setEvents(evs))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="schedule-page">
      <div className="schedule-content">
        <h1 className="schedule-title">Schedule</h1>

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
      </div>
    </div>
  )
}
