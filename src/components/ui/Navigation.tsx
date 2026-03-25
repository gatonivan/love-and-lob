import { useCallback, useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import dropdownIconWhite from '../../assets/white_transparent_dropdown.png'
import dropdownIconGreen from '../../assets/green_transparent_dropdown.png'
import logoImg from '../../assets/love_and_lob_logo.png'
import './Navigation.css'

export function Navigation() {
  const pathname = useLocation().pathname
  const navigate = useNavigate()
  const overlayScrolled = useSceneStore((s) => s.overlayScrolled)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const cameraSettled = useSceneStore((s) => s.cameraSettled)
  const isHome = pathname === '/'
  const isCommunity = pathname === '/community'
  const isSubPage = pathname.startsWith('/community/') || pathname.startsWith('/shop/')
  const showIconMenu = !isHome && cameraSettled

  // Logo: visible on home only
  const hideLogo = !isHome

  // Links: visible on home, always hidden on community,
  // hidden on other pages until user scrolls to bottom
  const hideLinks = isCommunity || (!isHome && !overlayScrolled)

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

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

  const handleMenuNav = useCallback((e: React.MouseEvent, to: string) => {
    e.preventDefault()
    setMenuOpen(false)
    if (isSubPage) {
      useSceneStore.getState().setPageExiting(true)
      setTimeout(() => {
        useSceneStore.getState().setPageExiting(false)
        navigate(to)
      }, 300)
    } else {
      navigate(to)
    }
  }, [isSubPage, navigate])

  return (
    <nav className="nav">
      <Link to="/" className={`nav-logo ${hideLogo ? 'nav-logo--hidden' : ''}`} onClick={handleLogoClick}>
        <img src={logoImg} alt="Love & Lob" className="nav-logo-img" />
      </Link>

      {/* Icon menu for all pages except home */}
      {showIconMenu && (
        <div className="nav-icon-menu" ref={menuRef}>
          <button
            className={`nav-icon-btn ${menuOpen ? 'nav-icon-btn--active' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            <img src={isCommunity ? dropdownIconWhite : dropdownIconGreen} alt="" className="nav-icon-img" />
          </button>
          <div className={`nav-dropdown ${menuOpen ? 'nav-dropdown--open' : ''}`}>
            <a href="/" onClick={(e) => handleMenuNav(e, '/')}>Home</a>
            <a href="/community" onClick={(e) => handleMenuNav(e, '/community')}>Community</a>
            <a href="/shop" onClick={(e) => handleMenuNav(e, '/shop')}>Shop</a>
            <a href="/schedule" onClick={(e) => handleMenuNav(e, '/schedule')}>Schedule</a>
            <a href="/manifesto" onClick={(e) => handleMenuNav(e, '/manifesto')}>Manifesto</a>
          </div>
        </div>
      )}

      <div className={`nav-links ${hideLinks ? 'nav-links--hidden' : ''}`}>
        <Link to="/community">Community</Link>
        <Link to="/shop">Shop</Link>
        <Link to="/schedule">Schedule</Link>
        <Link to="/manifesto">Manifesto</Link>
      </div>
    </nav>
  )
}
