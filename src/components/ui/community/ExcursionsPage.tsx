import { Link } from 'react-router'
import { useBottomScroll } from '../../../hooks/useBottomScroll'
import { SubPageWrapper } from './SubPageWrapper'
import westchesterVideo from '../../../assets/community/westchester_video.mp4'
import longIslandVideo from '../../../assets/community/long_island.mp4'
import './community-sub.css'

export function ExcursionsPage() {
  useBottomScroll(true)
  return (
    <SubPageWrapper>
      <Link to="/community" className="community-sub-back">
        &larr; Community
      </Link>
      <h1 className="community-sub-title">Excursions</h1>
      <p className="community-sub-intro">
        We take the community beyond the city courts. Each excursion is its
        own vibe.
      </p>

      <div className="community-sub-section">
        <video
          className="community-sub-img"
          src={westchesterVideo}
          autoPlay
          loop
          muted
          playsInline
        />
        <h2>Westchester</h2>
        <p>
          Hosted our first L&amp;L Invitational at the beautiful waterfront
          Tennis Club of Hastings in Hastings-on-Hudson, NY. 2 hours of
          instructional drill &amp; play on the American green clay. Powered
          by Harlem Center for Aesthetic Dentistry. Special thanks to sponsors
          Casta&ntilde;o Group, Vacations, Inc., Leisure Hydration, &amp;
          Uncle Nearest. Food provided by Layla&rsquo;s Falafel.
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
          Co-hosted the Ryde or Die Cup alongside Bageled NYC. Based on the
          infamous Davis Cup, we had Team Love vs Team Lox go head-to-head in
          differing team formats across Tennis &amp; Pickleball at the
          prestigious Vanderbilt-Strathmore Country Club in Manhasset, NY.
        </p>
        <p style={{ marginTop: '1rem' }}>
          Thanks to our sponsors Acme Smoked Fish, Bagelfest, Giri Nathan,
          Greenberg Bagels, Leisure Hydration, Michael Kosta, Nick Pachelli,
          Weedsport, &amp; Weltpocket.
        </p>
      </div>

      <div className="community-sub-section">
        <h2>Woodstock</h2>
        <p>Details coming soon.</p>
      </div>
    </SubPageWrapper>
  )
}
