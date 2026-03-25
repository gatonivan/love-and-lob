import { Link } from 'react-router'
import { useBottomScroll } from '../../../hooks/useBottomScroll'
import { useIsDesktop } from '../../../hooks/useIsDesktop'
import { SubPageWrapper } from './SubPageWrapper'
import watchPartiesImg from '../../../assets/community/experience_second_page_1.jpeg'
import winePartiesImg from '../../../assets/community/experiences_second_page_2.jpeg'
import watchPartiesDesktop from '../../../assets/desktop/watch_party_1.jpeg'
import winePartiesDesktop from '../../../assets/desktop/watch_party_desktop.jpeg'
import './community-sub.css'

export function ExperiencesPage() {
  useBottomScroll(true)
  const isDesktop = useIsDesktop()
  return (
    <SubPageWrapper>
      <Link to="/community" className="community-sub-back">
        &larr; Community
      </Link>
      <h1 className="community-sub-title">Experiences</h1>
      <p className="community-sub-intro">
        Tennis is the starting point. What happens around it is what makes
        Love &amp; Lob different.
      </p>

      <div className="community-sub-section">
        <img className="community-sub-img" src={isDesktop ? watchPartiesDesktop : watchPartiesImg} alt="Watch Parties" />
        <h2>Watch Parties</h2>
        <p>
          Hosting live watch events for major tennis events such as Roland
          Garros, Wimbledon, &amp; the US Open, connecting fans and players
          alike.
        </p>
      </div>

      <div className="community-sub-section">
        <img className="community-sub-img" src={isDesktop ? winePartiesDesktop : winePartiesImg} alt="Wine Parties" />
        <h2>Wine Parties</h2>
        <p>
          Intimate watch parties for smaller WTA/ATP tournaments that are
          centered around natural wine. These gatherings invite our community
          to connect over a bold, healthier palette that serves as a healthier
          wine alternative.
        </p>
      </div>
    </SubPageWrapper>
  )
}
