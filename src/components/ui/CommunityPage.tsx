import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import './CommunityPage.css'

const sections = [
  { name: 'Radio', path: '/community/radio' },
  { name: 'Clinic', path: '/community/clinic' },
  { name: 'Experiences', path: '/community/experiences' },
  { name: 'Excursions', path: '/community/excursions' },
  { name: 'Words', path: '/community/words' },
]

export function CommunityPage() {
  const pathname = useLocation().pathname
  const settled = useSceneStore(
    (s) => s.cameraMode === 'referee' && s.cameraSettled
  )
  const overlayRef = useRef<HTMLDivElement>(null)
  const [nearBottom, setNearBottom] = useState(false)
  const active = pathname === '/community'

  const onScroll = useCallback(() => {
    const el = overlayRef.current
    if (!el) return
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 100
    setNearBottom(atBottom)
    useSceneStore.getState().setOverlayScrolled(el.scrollTop > 30)
  }, [])

  // Bind scroll listener when active
  useEffect(() => {
    if (!active) return
    const el = overlayRef.current
    if (!el) return
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [active, onScroll])

  // Reset all state when leaving community
  useEffect(() => {
    if (!active) {
      setNearBottom(false)
      useSceneStore.getState().setOverlayScrolled(false)
    }
  }, [active])

  // Also reset on unmount
  useEffect(() => {
    return () => {
      useSceneStore.getState().setOverlayScrolled(false)
    }
  }, [])

  if (!active) return null

  return (
    <>
      <div
        ref={overlayRef}
        className={`community-overlay ${settled ? 'community-overlay--visible' : ''}`}
      >
        <div
          className={`community-content ${settled ? 'community-content--visible' : ''}`}
        >
          <div className="community-photos">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="community-photo-placeholder" />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom sub-nav — outside overlay so position:fixed works */}
      <nav className={`community-bottom-nav ${nearBottom ? 'community-bottom-nav--visible' : ''}`}>
        {sections.map((s) => (
          <Link key={s.path} to={s.path} className="community-bottom-link">
            {s.name}
          </Link>
        ))}
      </nav>
    </>
  )
}
