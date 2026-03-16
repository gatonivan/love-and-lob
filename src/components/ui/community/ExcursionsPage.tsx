import { Link } from 'react-router'
import { useBottomScroll } from '../../../hooks/useBottomScroll'
import westchesterImg from '../../../assets/community/westchester.jpeg'
import longIslandVideo from '../../../assets/community/long_island.mp4'
import './community-sub.css'

export function ExcursionsPage() {
  useBottomScroll(true)
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
          <img className="community-sub-img" src={westchesterImg} alt="Westchester excursion" />
          <h2>Westchester</h2>
          <p>
            Hosted our first L&amp;L Invitational at the beautiful waterfront
            Tennis Club of Hastings in Hastings-on-Hudson, NY. 2 hours of
            instructional drill &amp; play on the American green clay. Special
            thanks to sponsors Casta&ntilde;o Group, Vacations, Inc., Leisure
            Hydration, &amp; Uncle Nearest. Food provided by Layla&rsquo;s
            Falafel.
          </p>
        </div>

        <div className="community-sub-section">
          <video
            className="community-sub-img"
            src={longIslandVideo}
            autoPlay
            loop
            muted
            playsInline
          />
          <h2>Long Island</h2>
          <p>
            Co-hosted the Ryde or Die Cup alongside Bageled NYC. Based off the
            infamous Davis Cup, we had two teams competing against each other in
            differing team formats across Tennis &amp; Pickleball at the
            prestigious Vanderbilt-Strathmore Country Club in Manhasset, NY.
          </p>
        </div>
      </div>
    </div>
  )
}
