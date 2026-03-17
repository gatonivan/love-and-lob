import { Link } from 'react-router'
import { useBottomScroll } from '../../../hooks/useBottomScroll'
import { SubPageWrapper } from './SubPageWrapper'
import './community-sub.css'

export function RadioPage() {
  useBottomScroll(true)
  return (
    <SubPageWrapper>
      <Link to="/community" className="community-sub-back">
        &larr; Community
      </Link>
      <h1 className="community-sub-title">Radio</h1>
      <p className="community-sub-intro">
        Intimate live DJ sets coming soon.
      </p>

      <div className="community-sub-section">
        <h2>Playlists</h2>
        <p>Now That&rsquo;s What I Call L&amp;L Vol. 1</p>
        <div className="community-sub-links">
          <a
            href="https://open.spotify.com/playlist/6XGFhxsvfjlcU2ykvVkybw?si=oNFXwd3XQXGfeikr1NH3ew&pi=B_tIrw-4Rj-As"
            target="_blank"
            rel="noopener noreferrer"
            className="community-sub-link"
          >
            Spotify &rarr;
          </a>
          <a
            href="https://music.apple.com/us/playlist/now-thats-what-i-call-l-l-vol-1/pl.u-JPAZx5VtDLo7Ad"
            target="_blank"
            rel="noopener noreferrer"
            className="community-sub-link"
          >
            Apple Music &rarr;
          </a>
        </div>
      </div>

      <div className="community-sub-section">
        <h2>DJ Sets</h2>
        <p>Coming soon.</p>
      </div>
    </SubPageWrapper>
  )
}
