import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
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
  const pathname = useLocation().pathname
  const settled = useSceneStore((s) => s.cameraMode === 'birdseye' && s.cameraSettled)
  const [events, setEvents] = useState<LumaEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [titleHidden, setTitleHidden] = useState(false)
  const [lumaVisible, setLumaVisible] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUpcomingEvents()
      .then((evs) => setEvents(evs))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const isSchedule = pathname === '/schedule'

  useEffect(() => {
    if (!isSchedule) {
      setTitleHidden(false)
      setLumaVisible(false)
      return
    }
    const overlay = overlayRef.current
    if (!overlay) return
    overlay.scrollTop = 0
    const onScroll = () => {
      const scrollTop = overlay.scrollTop
      const scrollMax = overlay.scrollHeight - overlay.clientHeight
      setTitleHidden(scrollTop > 40)
      setLumaVisible(scrollMax > 0 && scrollTop >= scrollMax - 40)
    }
    overlay.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => overlay.removeEventListener('scroll', onScroll)
  }, [isSchedule, loading])

  if (!isSchedule) return null

  return (
    <div ref={overlayRef} className={`schedule-overlay ${settled ? 'schedule-overlay--visible' : ''}`}>
      <div className={`schedule-content ${settled ? 'schedule-content--visible' : ''}`}>
        <h1 className={`schedule-title ${titleHidden ? 'schedule-title--hidden' : ''}`}>Schedule</h1>

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
          className={`schedule-luma-link ${lumaVisible ? 'schedule-luma-link--visible' : ''}`}
        >
          View all on Luma &rarr;
        </a>
      </div>
    </div>
  )
}
