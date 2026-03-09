import { useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import './CommunityPage.css'

import radioImg from '../../assets/community/radio_cover.jpeg'
import clinicImg from '../../assets/community/clinic_cover.jpeg'
import experiencesImg from '../../assets/community/experiences.jpeg'
import excursionsImg from '../../assets/community/excursions.jpeg'

interface Section {
  name: string
  path: string
  subtitle: string
  media?: string
  mediaType?: 'image' | 'video'
}

const sections: Section[] = [
  { name: 'Radio', path: '/community/radio', subtitle: 'Curated playlists and DJ sets for the court and beyond', media: radioImg, mediaType: 'image' },
  { name: 'Clinic', path: '/community/clinic', subtitle: 'No experience needed — just show up and learn the game', media: clinicImg, mediaType: 'image' },
  { name: 'Experiences', path: '/community/experiences', subtitle: 'Watch parties, wine nights, and off-court culture', media: experiencesImg, mediaType: 'image' },
  { name: 'Excursions', path: '/community/excursions', subtitle: 'Day trips and weekend getaways to new courts', media: excursionsImg, mediaType: 'image' },
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
            {s.media && s.mediaType === 'video' ? (
              <video
                className="community-section-bg"
                src={s.media}
                autoPlay
                loop
                muted
                playsInline
              />
            ) : s.media ? (
              <img
                className="community-section-bg"
                src={s.media}
                alt=""
                loading="lazy"
              />
            ) : null}
            <div className="community-section-overlay" />
            <div className="community-section-text">
              <span className="community-section-name">{s.name}</span>
              <span className="community-section-subtitle">{s.subtitle}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
