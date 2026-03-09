import { useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import './CommunityPage.css'

const sections = [
  { name: 'Radio', path: '/community/radio', subtitle: 'Curated playlists and DJ sets for the court and beyond' },
  { name: 'Clinic', path: '/community/clinic', subtitle: 'No experience needed — just show up and learn the game' },
  { name: 'Experiences', path: '/community/experiences', subtitle: 'Watch parties, wine nights, and off-court culture' },
  { name: 'Excursions', path: '/community/excursions', subtitle: 'Day trips and weekend getaways to new courts' },
  { name: 'Words', path: '/community/words', subtitle: 'Stories and dispatches from the community' },
]

export function CommunityPage() {
  const pathname = useLocation().pathname
  const settled = useSceneStore(
    (s) => s.cameraMode === 'referee' && s.cameraSettled
  )
  const active = pathname === '/community'

  useEffect(() => {
    if (!active) {
      useSceneStore.getState().setOverlayScrolled(false)
    }
  }, [active])

  useEffect(() => {
    return () => {
      useSceneStore.getState().setOverlayScrolled(false)
    }
  }, [])

  if (!active) return null

  return (
    <div className={`community-overlay ${settled ? 'community-overlay--visible' : ''}`}>
      <div className={`community-sections ${settled ? 'community-sections--visible' : ''}`}>
        {sections.map((s) => (
          <Link key={s.path} to={s.path} className="community-section">
            <span className="community-section-name">{s.name}</span>
            <span className="community-section-subtitle">{s.subtitle}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
