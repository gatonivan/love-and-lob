import { Link } from 'react-router'
import './Navigation.css'

export function Navigation() {
  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">
        Love & Lob
      </Link>
      <div className="nav-links">
        <Link to="/community">Community</Link>
        <Link to="/shop">Shop</Link>
        <Link to="/schedule">Schedule</Link>
        <Link to="/manifesto">Manifesto</Link>
      </div>
    </nav>
  )
}
