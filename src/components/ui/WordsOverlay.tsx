import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import './WordsOverlay.css'

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
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface WordsOverlayProps {
  visible: boolean
  onClose: () => void
}

export function WordsOverlay({ visible, onClose }: WordsOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
      .then((p) => setPosts(p))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!overlayRef.current) return

    if (visible) {
      overlayRef.current.style.pointerEvents = 'auto'
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      })
    } else {
      overlayRef.current.style.pointerEvents = 'none'
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      })
    }
  }, [visible])

  return (
    <div
      ref={overlayRef}
      className="words-overlay"
      style={{ opacity: 0, pointerEvents: 'none' }}
    >
      <div className="words-overlay-scrim" onClick={onClose} />
      <div className="words-panel">
        <div className="words-header">
          <h2 className="words-title">Words</h2>
          <button className="words-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        {loading ? (
          <div className="words-loading">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="words-empty">No posts yet. Check back soon!</div>
        ) : (
          <div className="words-list">
            {posts.map((post) => (
              <a
                key={post.link}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="post-card"
              >
                {post.cover_url && (
                  <img
                    className="post-cover"
                    src={post.cover_url}
                    alt=""
                    loading="lazy"
                  />
                )}
                <div className="post-info">
                  <div className="post-date">{formatDate(post.published_at)}</div>
                  <div className="post-title">{post.title}</div>
                  {post.description && (
                    <div className="post-description">{post.description}</div>
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
          className="words-substack-link"
        >
          View all on Substack &rarr;
        </a>
      </div>
    </div>
  )
}
