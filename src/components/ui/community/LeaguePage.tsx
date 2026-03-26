import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { useBottomScroll } from '../../../hooks/useBottomScroll'
import { useIsDesktop } from '../../../hooks/useIsDesktop'
import { SubPageWrapper } from './SubPageWrapper'
import leagueSecondImg from '../../../assets/community/league_second_page.jpeg'
import leagueDesktopVideo from '../../../assets/desktop/singles_league_desktop.mp4'
import championsVideo from '../../../assets/community/champions_3v3.mp4'
import championsDesktopImg from '../../../assets/desktop/3v3_team_singles_2.jpeg'
import './community-sub.css'

export function LeaguePage() {
  useBottomScroll(true)
  const isDesktop = useIsDesktop()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = 12

    const onTimeUpdate = () => {
      if (video.currentTime < 12 || video.ended) {
        video.currentTime = 12
      }
    }
    video.addEventListener('timeupdate', onTimeUpdate)

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
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      observer.disconnect()
    }
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
      <p className="community-sub-intro" style={{ marginTop: '1rem' }}>
        The <strong>Lob Division</strong> had 40 &ndash; No Love (6th seed)
        fight their way to the top to claim the Lob Championship, while
        the <em>Vollets</em>, who served as the 2nd seed in the <strong>Love
        Division</strong>, claimed the 2025 Love Division Championship.
        Stay tuned for the 2026 season!
      </p>

      <div className="community-sub-section">
        {isDesktop ? (
          <video className="community-sub-img" src={leagueDesktopVideo} autoPlay loop muted playsInline />
        ) : (
          <img className="community-sub-img" src={leagueSecondImg} alt="3v3 Team Singles League" />
        )}
        <h2>2025 Champions</h2>
        <p>
          The <strong>Lob Division</strong> had &ldquo;40 &ndash; No
          Love&rdquo; (lowest seed) fight their way to the top to claim the
          championship, while the <em>Vollets</em>, who served as the second
          seed in the <strong>Love Division</strong>, claim the 2025
          championship. Stay tuned for the 2026 season!
        </p>
        {isDesktop ? (
          <img className="community-sub-img" src={championsDesktopImg} alt="2025 Champions" style={{ marginTop: '1.5rem' }} />
        ) : (
          <video
            ref={videoRef}
            className="community-sub-img"
            src={championsVideo}
            loop
            muted
            playsInline
            preload="metadata"
            style={{ marginTop: '1.5rem' }}
          />
        )}
      </div>
    </SubPageWrapper>
  )
}
