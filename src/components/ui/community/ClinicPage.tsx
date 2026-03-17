import { Link } from 'react-router'
import { useBottomScroll } from '../../../hooks/useBottomScroll'
import { SubPageWrapper } from './SubPageWrapper'
import clinicSecondImg from '../../../assets/community/clinic_second.jpeg'
import './community-sub.css'

export function ClinicPage() {
  useBottomScroll(true)
  return (
    <SubPageWrapper>
      <Link to="/community" className="community-sub-back">
        &larr; Community
      </Link>
      <div className="community-sub-hero">
        <img className="community-sub-hero-img" src={clinicSecondImg} alt="Absolute Beginner Clinic" />
        <div className="community-sub-hero-overlay">
          <h1 className="community-sub-title">Absolute Beginner Clinic</h1>
          <p className="community-sub-hero-text">
            Want to pick up tennis, but unsure where to start? Our Absolute
            Beginner Clinic is designed for complete newcomers who want to learn
            the fundamentals in a welcoming, low-pressure environment.
          </p>
        </div>
      </div>

      <div className="community-sub-section">
        <h2>Details</h2>
        <p>
          Every Sunday, 9am. $10 per session. Yes, $10. No experience
          necessary&mdash;just bring a racket (you can rent one for $5 too)
          &amp; good energy. We&rsquo;ll cover how to hold a racket, basic
          swing mechanics, and fundamental movement patterns.
        </p>
      </div>
    </SubPageWrapper>
  )
}
