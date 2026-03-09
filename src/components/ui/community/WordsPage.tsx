import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import './community-sub.css'

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

export function WordsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
      .then((p) => setPosts(p))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="community-sub-page">
      <div className="community-sub-content">
        <Link to="/community" className="community-sub-back">
          &larr; Community
        </Link>
        <h1 className="community-sub-title">Words</h1>
        <p className="community-sub-intro">
          Stories from the community. Written on Substack.
        </p>

        {loading ? (
          <p style={{ color: 'rgba(241,240,226,0.4)', fontSize: '0.875rem' }}>
            Loading posts...
          </p>
        ) : posts.length === 0 ? (
          <p style={{ color: 'rgba(241,240,226,0.4)', fontSize: '0.875rem' }}>
            No posts yet. Check back soon!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {posts.map((post) => (
              <a
                key={post.link}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="community-section-link"
                style={{ textDecoration: 'none', color: '#F1F0E2' }}
              >
                {post.cover_url && (
                  <img
                    src={post.cover_url}
                    alt=""
                    loading="lazy"
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 6,
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                )}
                <div>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'rgba(241,240,226,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {formatDate(post.published_at)}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.3 }}>
                    {post.title}
                  </div>
                  {post.description && (
                    <div style={{ fontSize: '0.75rem', color: 'rgba(241,240,226,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.description}
                    </div>
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
          style={{
            display: 'block',
            padding: '2rem 0',
            textAlign: 'center',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#F1F0E2',
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          View all on Substack &rarr;
        </a>
      </div>
    </div>
  )
}
