import { useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import { useDeferredUnmount } from '../../hooks/useDeferredUnmount'
import { useBottomScroll } from '../../hooks/useBottomScroll'
import aboutImg from '../../assets/manifesto/first_image.png'
import whatWeDoImg from '../../assets/manifesto/third_image.jpeg'
import closingImg from '../../assets/manifesto/sixth_image.png'
import original9Img from '../../assets/community/substack_loveandlob.jpg'
import howBornImg from '../../assets/community/nycblazer_substack.jpg'
import './ManifestoPage.css'

export function ManifestoPage() {
  const pathname = useLocation().pathname
  const settled = useSceneStore((s) => s.cameraMode === 'umpire' && s.cameraSettled)
  const isManifesto = pathname === '/manifesto'
  const [shouldRender, isVisible] = useDeferredUnmount(isManifesto)
  const show = isVisible && settled
  const overlayRef = useRef<HTMLDivElement>(null)

  useBottomScroll(isManifesto, overlayRef)

  if (!shouldRender) return null

  return (
    <div ref={overlayRef} className={`manifesto-overlay ${show ? 'manifesto-overlay--visible' : ''}`}>
      <div className={`manifesto-content ${show ? 'manifesto-content--visible' : ''}`}>

        {/* ABOUT US */}
        <section className="manifesto-section">
          <h1 className="manifesto-title">About Us</h1>
          <p className="manifesto-body">
            Love &amp; Lob is a NYC-based tennis &amp; lifestyle collective
            building community on the court &amp; culture off it.
          </p>
          <img className="manifesto-img" src={aboutImg} alt="Love & Lob clinic on the courts" />
        </section>

        {/* WHAT WE DO */}
        <section className="manifesto-section">
          <h2 className="manifesto-heading">What We Do</h2>
          <p className="manifesto-body">
            On court, we run affordable clinics for players of every level.
            Off it, we build the culture around the game&nbsp;&mdash; through
            watch parties, music, &amp; photography.
          </p>
          <img className="manifesto-img" src={whatWeDoImg} alt="Love & Lob off-court culture" />
        </section>

        {/* CLOSING */}
        <section className="manifesto-section">
          <p className="manifesto-body manifesto-body--closing">
            Tennis shaped our lives and impacts us daily. Now, we&rsquo;re
            making sure it can help shape everyone.
          </p>
          <img className="manifesto-img" src={closingImg} alt="Love & Lob community group" />
        </section>

        {/* SERVICES */}
        <section className="manifesto-section">
          <h2 className="manifesto-heading">Services</h2>
          <ul className="manifesto-services">
            <li>Content Production</li>
            <li>Partnerships &amp; Collaborations</li>
            <li>Campaigns</li>
          </ul>

          <h3 className="manifesto-subheading">Everything We Do</h3>
          <ul className="manifesto-services">
            <li>Group Tennis Clinics</li>
            <li>Private Lessons</li>
          </ul>
        </section>

        {/* WORDS — Featured Articles */}
        <section className="manifesto-section">
          <h2 className="manifesto-heading">Words</h2>

          <div className="manifesto-featured">
            <a
              href="https://nycblazer.substack.com/p/story-of-the-original-9-and-love"
              target="_blank"
              rel="noopener noreferrer"
              className="manifesto-featured-card"
            >
              <img
                className="manifesto-featured-img"
                src={original9Img}
                alt="Story of the Original 9 & Love & Lob"
              />
              <div className="manifesto-featured-overlay">
                <span className="manifesto-featured-label">Read on Substack</span>
              </div>
            </a>

            <a
              href="https://nycblazer.substack.com/p/how-love-and-lob-was-born"
              target="_blank"
              rel="noopener noreferrer"
              className="manifesto-featured-card"
            >
              <img
                className="manifesto-featured-img"
                src={howBornImg}
                alt="How Love & Lob was Born"
              />
              <div className="manifesto-featured-overlay">
                <span className="manifesto-featured-label">Read on Substack</span>
              </div>
            </a>
          </div>

          <a
            href="https://substack.com/@nycblazer"
            target="_blank"
            rel="noopener noreferrer"
            className="manifesto-substack-link"
          >
            View all on Substack &rarr;
          </a>
        </section>

        {/* CONTACT */}
        <section className="manifesto-section manifesto-section--contact">
          <h2 className="manifesto-heading">Get in Touch</h2>
          <div className="manifesto-contact-row">
            <div className="manifesto-contact-links">
              <a href="mailto:info@loveandlob.co" className="manifesto-contact-item">
                info@loveandlob.co
              </a>
              <a
                href="https://www.instagram.com/loveandlobnyc"
                target="_blank"
                rel="noopener noreferrer"
                className="manifesto-contact-item"
              >
                Instagram
              </a>
              <a
                href="https://substack.com/@nycblazer"
                target="_blank"
                rel="noopener noreferrer"
                className="manifesto-contact-item"
              >
                Substack
              </a>
            </div>
            <ManifestoSubscribe />
          </div>
        </section>

      </div>
    </div>
  )
}

function ManifestoSubscribe() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch {
      // Don't block UX on failure
    }
    setSubmitted(true)
  }

  return (
    <div className="manifesto-subscribe">
      <h3 className="manifesto-subscribe-heading">Stay in the Loop</h3>
      {submitted ? (
        <p className="manifesto-subscribe-thanks">Thanks for subscribing.</p>
      ) : (
        <form className="manifesto-subscribe-form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="manifesto-subscribe-input"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="manifesto-subscribe-btn">
            Subscribe
          </button>
        </form>
      )}
    </div>
  )
}
