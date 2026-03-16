import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import { useDeferredUnmount } from '../../hooks/useDeferredUnmount'
import aboutImg from '../../assets/manifesto/first_image.png'
import whatWeDoImg from '../../assets/manifesto/third_image.jpeg'
import closingImg from '../../assets/manifesto/sixth_image.png'
import './ManifestoPage.css'

interface Post {
  title: string
  description: string
  link: string
  published_at: string
  cover_url: string | null
}

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}posts.json`)
  if (!res.ok) return []
  return res.json()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ManifestoPage() {
  const pathname = useLocation().pathname
  const settled = useSceneStore((s) => s.cameraMode === 'umpire' && s.cameraSettled)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const isManifesto = pathname === '/manifesto'
  const [shouldRender, isVisible] = useDeferredUnmount(isManifesto)
  const show = isVisible && settled
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchPosts()
      .then((p) => setPosts(p))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!isManifesto) {
      useSceneStore.getState().setOverlayScrolled(false)
      return
    }
    const overlay = overlayRef.current
    if (!overlay) return
    const onScroll = () => {
      useSceneStore.getState().setOverlayScrolled(overlay.scrollTop > 40)
    }
    overlay.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => overlay.removeEventListener('scroll', onScroll)
  }, [isManifesto])

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

        {/* WORDS — Substack */}
        <section className="manifesto-section">
          <h2 className="manifesto-heading">Words</h2>

          {loading ? (
            <p className="manifesto-loading">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="manifesto-loading">No posts yet. Check back soon!</p>
          ) : (
            <div className="manifesto-list">
              {posts.map((post) => (
                <a
                  key={post.link}
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="manifesto-card"
                >
                  {post.cover_url && (
                    <img
                      className="manifesto-card-cover"
                      src={post.cover_url}
                      alt=""
                      loading="lazy"
                    />
                  )}
                  <div className="manifesto-card-info">
                    <div className="manifesto-card-date">
                      {formatDate(post.published_at)}
                    </div>
                    <div className="manifesto-card-title">{post.title}</div>
                    {post.description && (
                      <div className="manifesto-card-desc">{post.description}</div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}

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
          <div className="manifesto-contact-links">
            <a href="mailto:info@loveandlob.co" className="manifesto-contact-item">
              info@loveandlob.co
            </a>
            <a
              href="https://www.instagram.com/loveandlob"
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
        </section>

      </div>
    </div>
  )
}
