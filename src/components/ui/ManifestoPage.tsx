import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { useSceneStore } from '../../stores/sceneStore'
import { useDeferredUnmount } from '../../hooks/useDeferredUnmount'
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

  useEffect(() => {
    fetchPosts()
      .then((p) => setPosts(p))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (!shouldRender) return null

  return (
    <div className={`manifesto-overlay ${show ? 'manifesto-overlay--visible' : ''}`}>
      <div className={`manifesto-content ${show ? 'manifesto-content--visible' : ''}`}>
        <h1 className="manifesto-title">Manifesto</h1>

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
      </div>
    </div>
  )
}
