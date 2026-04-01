import { Link } from 'react-router'
import { useBottomScroll } from '../../../hooks/useBottomScroll'
import { SubPageWrapper } from './SubPageWrapper'
import pic1Img from '../../../assets/community/pic_1_monthly.jpeg'
import pic2Img from '../../../assets/community/pic1_monthly.jpeg'
import pic3Img from '../../../assets/community/pic_3_monthly.jpeg'
import './community-sub.css'

export function MonthlyClassicPage() {
  useBottomScroll(true)
  return (
    <SubPageWrapper>
      <Link to="/community" className="community-sub-back">
        &larr; Community
      </Link>
      <h1 className="community-sub-title">Monthly Classic</h1>
      <p className="community-sub-intro">Our infamous 2-hour clinics</p>

      <div className="community-sub-section">
        <img className="community-sub-img" src={pic1Img} alt="Monthly Classic" />
        <p>
          How Love &amp; Lob came to age: The Classic offers an affordable
          tennis clinic for attendees to improve their game with top-class
          coaching while in a relaxed environment, usually in Brooklyn.
        </p>
      </div>

      <div className="community-sub-section">
        <img className="community-sub-img" src={pic2Img} alt="Monthly Classic" />
        <p>
          The Classic spans 2 hours: 1 hour of drills &amp; 1 hour of games,
          split by level from Absolute Beginner (zero experience) to Advanced
          (former high school/college standout), followed by food &amp; rapport
          at a neighboring bar.
        </p>
      </div>

      <div className="community-sub-section">
        <img className="community-sub-img" src={pic3Img} alt="Uptown Special" />
        <p>
          We also host a parallel program in the Bronx following a similar
          format called the Uptown Special.
        </p>
      </div>
    </SubPageWrapper>
  )
}
