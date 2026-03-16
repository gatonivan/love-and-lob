import { Link, useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import './Navigation.css'

export function Navigation() {
  const pathname = useLocation().pathname
  const overlayScrolled = useSceneStore((s) => s.overlayScrolled)
  const isHome = pathname === '/'
  const isCommunity = pathname === '/community'

  // Community: links always hidden, logo hides when scrolled
  // Other non-home pages: links hidden until user scrolls to bottom
  // Home: everything visible
  const hideLinks = isCommunity || (!isHome && !overlayScrolled)
  const hideLogo = isCommunity && overlayScrolled

  return (
    <nav className="nav">
      <Link to="/" className={`nav-logo ${hideLogo ? 'nav-logo--hidden' : ''}`}>
        Love & Lob
      </Link>
      <div className={`nav-links ${hideLinks ? 'nav-links--hidden' : ''}`}>
        <Link to="/community">Community</Link>
        <Link to="/shop">Shop</Link>
        <Link to="/schedule">Schedule</Link>
        <Link to="/manifesto">Manifesto</Link>
      </div>
    </nav>
  )
}
