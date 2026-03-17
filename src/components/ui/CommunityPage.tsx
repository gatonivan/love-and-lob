import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import { useDeferredUnmount } from '../../hooks/useDeferredUnmount'
import './CommunityPage.css'

import radioImg from '../../assets/community/radio_cover.jpeg'
import clinicImg from '../../assets/community/clinic_cover_absolute.jpeg'
import experiencesImg from '../../assets/community/experiences.jpeg'
import excursionsImg from '../../assets/community/excursions.jpeg'
import communityDayImg from '../../assets/community/community_day.jpeg'
import leagueVideo from '../../assets/community/league_front.mp4'

interface Section {
  name: string
  path: string
  subtitle: string
  media?: string
  mediaType?: 'image' | 'video'
  objectPosition?: string
  mobileObjectPosition?: string
}

const sections: Section[] = [
  { name: 'Absolute Beginner Clinic', path: '/community/clinic', subtitle: 'No experience needed — just show up and learn the game', media: clinicImg, mediaType: 'image', mobileObjectPosition: '65% center' },
  { name: 'Experiences', path: '/community/experiences', subtitle: 'Watch parties, wine nights, and off-court culture', media: experiencesImg, mediaType: 'image', objectPosition: 'center bottom' },
  { name: 'League', path: '/community/league', subtitle: '3v3 Team Singles — Love & Lob divisions', media: leagueVideo, mediaType: 'video' },
  { name: 'Community Day', path: '/community/community-day', subtitle: 'Free tennis programming for the neighborhood', media: communityDayImg, mediaType: 'image' },
  { name: 'Excursions', path: '/community/excursions', subtitle: 'Day trips and weekend getaways to new courts', media: excursionsImg, mediaType: 'image', objectPosition: 'center 65%' },
  { name: 'Radio', path: '/community/radio', subtitle: 'Curated playlists and DJ sets for the court and beyond', media: radioImg, mediaType: 'image' },
  { name: 'Woodstock', path: '/community/woodstock', subtitle: 'Details coming soon' },
]

export function CommunityPage() {
  const pathname = useLocation().pathname
  const settled = useSceneStore(
    (s) => s.cameraMode === 'referee' && s.cameraSettled
  )
  const active = pathname === '/community'
  const [shouldRender, isVisible] = useDeferredUnmount(active)
  const show = isVisible && settled
  const overlayRef = useRef<HTMLDivElement>(null)

  // Community uses its own scroll tracking — logo hides on scroll, links always hidden
  useEffect(() => {
    if (!active) {
      useSceneStore.getState().setOverlayScrolled(false)
      return
    }
    const overlay = overlayRef.current
    if (!overlay) return
    const onScroll = () => {
      useSceneStore.getState().setOverlayScrolled(overlay.scrollTop > 40)
    }
    overlay.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      overlay.removeEventListener('scroll', onScroll)
      useSceneStore.getState().setOverlayScrolled(false)
    }
  }, [active])

  if (!shouldRender) return null

  return (
    <div ref={overlayRef} className={`community-overlay ${show ? 'community-overlay--visible' : ''}`}>
      <div className={`community-sections ${show ? 'community-sections--visible' : ''}`}>
        {sections.map((s) => (
          <Link key={s.path} to={s.path} className={`community-section${!s.media ? ' community-section--no-media' : ''}`}>
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
                className={`community-section-bg${s.mobileObjectPosition ? ' community-section-bg--mobile-reposition' : ''}`}
                src={s.media}
                alt=""
                loading="lazy"
                style={{
                  ...(s.objectPosition ? { objectPosition: s.objectPosition } : {}),
                  ...(s.mobileObjectPosition ? { '--mobile-obj-pos': s.mobileObjectPosition } as React.CSSProperties : {}),
                }}
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
