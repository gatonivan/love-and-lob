import { Link } from 'react-router'
import './community-sub.css'

export function ExperiencesPage() {
  return (
    <div className="community-sub-page">
      <div className="community-sub-content">
        <Link to="/community" className="community-sub-back">
          &larr; Community
        </Link>
        <h1 className="community-sub-title">Experiences</h1>
        <p className="community-sub-intro">
          Tennis is the starting point. What happens around it is what makes
          Love & Lob different.
        </p>

        <div className="community-sub-section">
          <div className="community-sub-placeholder" />
          <h2>Watch Parties</h2>
          <p>Coming soon.</p>
        </div>

        <div className="community-sub-section">
          <div className="community-sub-placeholder" />
          <h2>Wine Parties</h2>
          <p>Coming soon.</p>
        </div>
      </div>
    </div>
  )
}
