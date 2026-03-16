import { Link } from 'react-router'
import leagueSecondImg from '../../../assets/community/league_second_page.jpeg'
import './community-sub.css'

export function LeaguePage() {
  return (
    <div className="community-sub-page">
      <div className="community-sub-content">
        <Link to="/community" className="community-sub-back">
          &larr; Community
        </Link>
        <h1 className="community-sub-title">3v3 Team Singles League</h1>
        <p className="community-sub-intro">
          We held our first annual 3v3 Team Singles League in the Fall of 2025
          at our Home Courts. We had two divisions based on skill level: Love
          (Friendly) &amp; Lob (Competitive). Teams played 5 regular season
          matches, followed by a single-elimination playoff format for the
          postseason.
        </p>

        <div className="community-sub-section">
          <img className="community-sub-img" src={leagueSecondImg} alt="3v3 Team Singles League" />
          <h2>2025 Champions</h2>
          <p>
            The <strong>Lob Division</strong> had &ldquo;40 &ndash; No
            Love&rdquo; (lowest seed) fight their way to the top to claim the
            championship, while the <em>Vollets</em>, who served as the second
            seed in the <strong>Love Division</strong>, claim the 2025
            championship. Stay tuned for the 2026 season!
          </p>
        </div>
      </div>
    </div>
  )
}
