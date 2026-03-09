import { Link, useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import './Navigation.css'

export function Navigation() {
  const pathname = useLocation().pathname
  const hideLinks = pathname === '/community'
  const hideLogo = useSceneStore((s) => s.overlayScrolled)

  return (
    <nav className="nav">
      <Link to="/" className={`nav-logo ${hideLinks && hideLogo ? 'nav-logo--hidden' : ''}`}>
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
