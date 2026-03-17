import { useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import './Navigation.css'

export function Navigation() {
  const pathname = useLocation().pathname
  const navigate = useNavigate()
  const overlayScrolled = useSceneStore((s) => s.overlayScrolled)
  const logoHidden = useSceneStore((s) => s.logoHidden)
  const isHome = pathname === '/'
  const isCommunity = pathname === '/community'
  const isSubPage = pathname.startsWith('/community/') || pathname.startsWith('/shop/')

  // Logo: visible on home, hides on scroll elsewhere (including community)
  const hideLogo = !isHome && logoHidden

  // Links: visible on home, always hidden on community,
  // hidden on other pages until user scrolls to bottom
  const hideLinks = isCommunity || (!isHome && !overlayScrolled)

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    if (isHome) return // normal link behavior

    // On sub-pages, play exit animation before navigating
    if (isSubPage) {
      e.preventDefault()
      useSceneStore.getState().setPageExiting(true)
      setTimeout(() => {
        useSceneStore.getState().setPageExiting(false)
        navigate('/')
      }, 300)
    }
  }, [isHome, isSubPage, navigate])

  return (
    <nav className="nav">
      <Link to="/" className={`nav-logo ${hideLogo ? 'nav-logo--hidden' : ''}`} onClick={handleLogoClick}>
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
