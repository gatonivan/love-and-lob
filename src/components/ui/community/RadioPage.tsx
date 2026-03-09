import { Link } from 'react-router'
import './community-sub.css'

export function RadioPage() {
  return (
    <div className="community-sub-page">
      <div className="community-sub-content">
        <Link to="/community" className="community-sub-back">
          &larr; Community
        </Link>
        <h1 className="community-sub-title">Radio</h1>
        <p className="community-sub-intro">
          Love & Lob playlists and DJ sets. Curated sounds for on and off the
          court. DJ sets launching mid-April.
        </p>

        <div className="community-sub-section">
          <h2>Playlists</h2>
          <p>Coming soon.</p>
        </div>

        <div className="community-sub-section">
          <h2>DJ Sets</h2>
          <p>Coming soon.</p>
        </div>
      </div>
    </div>
  )
}
