import { Link } from 'react-router'
import { useBottomScroll } from '../../../hooks/useBottomScroll'
import { SubPageWrapper } from './SubPageWrapper'
import communityDaySecondImg from '../../../assets/community/community_day_second.jpeg'
import communityDayThirdImg from '../../../assets/community/community_day_third.jpeg'
import './community-sub.css'

export function CommunityDayPage() {
  useBottomScroll(true)
  return (
    <SubPageWrapper>
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
        <img className="community-sub-img" src={communityDaySecondImg} alt="Community Day" />
        <p>
          We provided free Vietnamese coffee by Phin First Phin, &amp;
          pastries by Mottley Kitchen while people of all ages &amp; skill
          levels participated in tennis &amp; soccer. Community Day raised
          awareness of maintaining vital open spaces for gathering.
        </p>
        <img className="community-sub-img" src={communityDayThirdImg} alt="Community Day" style={{ marginTop: '1.5rem' }} />
      </div>
    </SubPageWrapper>
  )
}
