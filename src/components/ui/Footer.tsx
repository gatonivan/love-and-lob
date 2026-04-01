import { useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import './Footer.css'

export function Footer() {
  const pathname = useLocation().pathname
  const overlayScrolled = useSceneStore((s) => s.overlayScrolled)
  const isHome = pathname === '/'
  const isCommunity = pathname === '/community'

  // Show on home, hide on community main, show on overlay pages when scrolled to bottom
  const visible = isHome || (!isCommunity && overlayScrolled)

  return (
    <footer className={`site-footer ${visible ? 'site-footer--visible' : ''}`}>
      <div className="site-footer-inner">
        <div className="site-footer-socials">
          <a
            href="https://www.instagram.com/loveandlobnyc"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <a
            href="mailto:info@loveandlob.co"
          >
            Email
          </a>
          <a
            href="https://substack.com/@nycblazer"
            target="_blank"
            rel="noopener noreferrer"
          >
            Substack
          </a>
        </div>
        <span className="site-footer-sep">&middot;</span>
        <span className="site-footer-credit">
          Website Designed by{' '}
          <a
            href="https://de-nos.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            De Nos
          </a>
        </span>
      </div>
    </footer>
  )
}
