import { Link } from 'react-router'
import './community-sub.css'

export function CommunityDayPage() {
  return (
    <div className="community-sub-page">
      <div className="community-sub-content">
        <Link to="/community" className="community-sub-back">
          &larr; Community
        </Link>
        <h1 className="community-sub-title">Community Day</h1>
        <p className="community-sub-intro">
          We believe in giving back to the community that serves us. We hosted a
          free day of tennis programming in October 2025, to highlight the
          positive impact of tennis in the neighborhood.
        </p>

        <div className="community-sub-section">
          <div className="community-sub-placeholder" />
          <p>
            We provided free Vietnamese coffee by Phin First Phin, &amp;
            pastries by Mottley Kitchen while people of all ages &amp; skill
            levels participated in tennis &amp; soccer. Community Day raised
            awareness of maintaining vital open spaces for gathering.
          </p>
        </div>
      </div>
    </div>
  )
}
