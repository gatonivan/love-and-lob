import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import './EventsOverlay.css'

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
  const apiKey = import.meta.env.VITE_LUMA_API_KEY
  if (!apiKey) return []

  const now = new Date()
  const afterParam = now.toISOString()
  const res = await fetch(
    `https://public-api.luma.com/v1/calendar/list-events?after=${afterParam}`,
    { headers: { 'x-luma-api-key': apiKey } },
  )
  if (!res.ok) return []

  const data = await res.json()

  return (data.entries || [])
    .map((entry: any) => {
      const ev = entry.event
      return {
        id: ev.id,
        name: ev.name,
        start_at: ev.start_at,
        end_at: ev.end_at,
        cover_url: ev.cover_url,
        url: ev.url,
        location: ev.geo_address_json?.address || ev.geo_address_json?.full_address || '',
      } as LumaEvent
    })
    .sort((a: LumaEvent, b: LumaEvent) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

interface EventsOverlayProps {
  visible: boolean
  onClose: () => void
}

export function EventsOverlay({ visible, onClose }: EventsOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [events, setEvents] = useState<LumaEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUpcomingEvents().then((evs) => {
      setEvents(evs)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!overlayRef.current) return

    if (visible) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
        onStart: () => {
          if (overlayRef.current) overlayRef.current.style.pointerEvents = 'auto'
        },
      })
    } else {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          if (overlayRef.current) overlayRef.current.style.pointerEvents = 'none'
        },
      })
    }
  }, [visible])

  return (
    <div
      ref={overlayRef}
      className="events-overlay"
      style={{ opacity: 0, pointerEvents: 'none' }}
    >
      <div className="events-overlay-scrim" onClick={onClose} />
      <div className="events-panel">
        <div className="events-header">
          <h2 className="events-title">Upcoming Events</h2>
          <button className="events-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        {loading ? (
          <div className="events-loading">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="events-empty">No upcoming events. Check back soon!</div>
        ) : (
          <div className="events-list">
            {events.map((ev) => (
              <a
                key={ev.id}
                href={ev.url}
                target="_blank"
                rel="noopener noreferrer"
                className="event-card"
              >
                {ev.cover_url && (
                  <img
                    className="event-cover"
                    src={ev.cover_url}
                    alt=""
                    loading="lazy"
                  />
                )}
                <div className="event-info">
                  <div className="event-date">
                    {formatDate(ev.start_at)} &middot; {formatTime(ev.start_at)}
                  </div>
                  <div className="event-name">{ev.name}</div>
                  {ev.location && (
                    <div className="event-location">{ev.location}</div>
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
          className="events-luma-link"
        >
          View all on Luma &rarr;
        </a>
      </div>
    </div>
  )
}
