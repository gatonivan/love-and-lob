import './Navigation.css'

export function Navigation() {
  return (
    <nav className="nav">
      <div className="nav-logo">Love & Lob</div>
      <div className="nav-links">
        <a href="/">Home</a>
        <a href="/shop">Shop</a>
        <a href="#events">Events</a>
      </div>
    </nav>
  )
}
