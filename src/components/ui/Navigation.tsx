import { Link, useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import './Navigation.css'

export function Navigation() {
  const pathname = useLocation().pathname
  const overlayScrolled = useSceneStore((s) => s.overlayScrolled)
  const logoHidden = useSceneStore((s) => s.logoHidden)
  const isHome = pathname === '/'
  const isCommunity = pathname === '/community'

  // Logo: visible on home, hides on scroll for all other pages
  const hideLogo = !isHome && logoHidden

  // Links: visible on home, always hidden on community,
  // hidden on other pages until user scrolls to bottom
  const hideLinks = isCommunity || (!isHome && !overlayScrolled)

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
