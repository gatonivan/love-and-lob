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
          Love &amp; Lob different.
        </p>

        <div className="community-sub-section">
          <div className="community-sub-placeholder" />
          <h2>Watch Parties</h2>
          <p>
            Hosting live watch events for major tennis events such as Roland
            Garros, Wimbledon, &amp; the US Open, connecting fans and players
            alike.
          </p>
        </div>

        <div className="community-sub-section">
          <div className="community-sub-placeholder" />
          <h2>Wine Parties</h2>
          <p>
            Intimate watch parties for smaller WTA/ATP tournaments that are
            centered around natural wine. These gatherings invite our community
            to connect over a bold, healthier palette that serves as a healthier
            wine alternative.
          </p>
        </div>
      </div>
    </div>
  )
}
