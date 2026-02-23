import { useSceneStore } from '../../stores/sceneStore'
import './FooterNav.css'

const SECTIONS = [
  { label: 'Home', id: 'hero' },
  { label: 'Court', id: 'court' },
  { label: 'Events', id: 'jumbotron' },
  { label: 'Shop', id: 'shop' },
] as const

export function FooterNav() {
  const currentSection = useSceneStore((s) => s.currentSection)

  return (
    <nav className="footer-nav" aria-label="Section navigation">
      {SECTIONS.map((section) => (
        <a
          key={section.id}
          href={section.id === 'shop' ? '/shop' : `#${section.id}`}
          className={`footer-nav-item ${currentSection === section.id ? 'active' : ''}`}
        >
          <span className="footer-nav-label">{section.label}</span>
        </a>
      ))}
    </nav>
  )
}
