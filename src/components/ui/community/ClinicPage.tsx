import { Link } from 'react-router'
import './community-sub.css'

export function ClinicPage() {
  return (
    <div className="community-sub-page">
      <div className="community-sub-content">
        <Link to="/community" className="community-sub-back">
          &larr; Community
        </Link>
        <h1 className="community-sub-title">Absolute Beginner Clinic</h1>
        <p className="community-sub-intro">
          Brand new to tennis? Our Absolute Beginner Clinic is designed for
          complete newcomers who want to learn the fundamentals in a welcoming,
          low-pressure environment.
        </p>

        <div className="community-sub-section">
          <div className="community-sub-placeholder" />
          <h2>Details</h2>
          <p>
            Every Sunday at our courts. $10 per session. No experience
            necessary&mdash;just bring a racket and good energy. We&rsquo;ll
            cover how to hold a racket, basic swing mechanics, and fundamental
            movement patterns.
          </p>
        </div>
      </div>
    </div>
  )
}
