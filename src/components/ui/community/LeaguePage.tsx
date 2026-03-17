import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { useBottomScroll } from '../../../hooks/useBottomScroll'
import { SubPageWrapper } from './SubPageWrapper'
import leagueSecondImg from '../../../assets/community/league_second_page.jpeg'
import championsVideo from '../../../assets/community/champions_3v3.mp4'
import './community-sub.css'

export function LeaguePage() {
  useBottomScroll(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play()
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <SubPageWrapper>
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
        <video
          ref={videoRef}
          className="community-sub-img"
          src={championsVideo}
          muted
          playsInline
          preload="metadata"
          style={{ marginTop: '1.5rem' }}
        />
      </div>
    </SubPageWrapper>
  )
}
