import { Link } from 'react-router'
import './community-sub.css'

export function ExcursionsPage() {
  return (
    <div className="community-sub-page">
      <div className="community-sub-content">
        <Link to="/community" className="community-sub-back">
          &larr; Community
        </Link>
        <h1 className="community-sub-title">Excursions</h1>
        <p className="community-sub-intro">
          We take the community beyond the city courts. Each excursion is its
          own vibe.
        </p>

        <div className="community-sub-section">
          <div className="community-sub-placeholder" />
          <h2>Westchester</h2>
          <p>Coming soon.</p>
        </div>

        <div className="community-sub-section">
          <div className="community-sub-placeholder" />
          <h2>Long Island</h2>
          <p>Coming soon.</p>
        </div>

        <div className="community-sub-section">
          <div className="community-sub-placeholder" />
          <h2>Woodstock</h2>
          <p>Coming soon.</p>
        </div>
      </div>
    </div>
  )
}
