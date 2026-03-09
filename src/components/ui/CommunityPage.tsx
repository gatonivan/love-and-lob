import { Link, useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import './CommunityPage.css'

const sections = [
  {
    name: 'Radio',
    desc: 'Playlists & DJ sets',
    path: '/community/radio',
  },
  {
    name: 'Absolute Beginner Clinic',
    desc: '$10 every Sunday at our courts',
    path: '/community/clinic',
  },
  {
    name: 'Experiences',
    desc: 'Watch parties, wine parties & more',
    path: '/community/experiences',
  },
  {
    name: 'Excursions',
    desc: 'Westchester, Long Island, Woodstock',
    path: '/community/excursions',
  },
  {
    name: 'Words',
    desc: 'Stories from the community',
    path: '/community/words',
  },
]

export function CommunityPage() {
  const pathname = useLocation().pathname
  const settled = useSceneStore(
    (s) => s.cameraMode === 'referee' && s.cameraSettled
  )

  if (pathname !== '/community') return null

  return (
    <div
      className={`community-overlay ${settled ? 'community-overlay--visible' : ''}`}
    >
      <div
        className={`community-content ${settled ? 'community-content--visible' : ''}`}
      >
        <h1 className="community-title">Community</h1>
        <p className="community-subtitle">
          Building community on the court & culture off it.
        </p>

        {/* Photo grid — swap placeholders for real images later */}
        <div className="community-photos">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="community-photo-placeholder" />
          ))}
        </div>

        <div className="community-sections">
          {sections.map((s) => (
            <Link key={s.path} to={s.path} className="community-section-link">
              <div>
                <div className="community-section-name">{s.name}</div>
                <div className="community-section-desc">{s.desc}</div>
              </div>
              <span className="community-section-arrow">&rarr;</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
