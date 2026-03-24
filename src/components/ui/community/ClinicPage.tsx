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
        </div>
      </div>

      <div className="community-sub-section">
        <h2>Details</h2>
        <p>
          Every Sunday, 9am. $10 per session. Yes, $10. No experience
          necessary &mdash; just bring a racket (or rent one for $5) &amp;
          good energy. This 1-hour class is designed for complete newcomers
          who want to learn the fundamentals in a welcoming, low-pressure
          environment.
        </p>
      </div>
    </SubPageWrapper>
  )
}
