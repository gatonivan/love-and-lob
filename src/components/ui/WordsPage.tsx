import { useEffect, useState } from 'react'
import './WordsPage.css'

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
    <div className="words-page">
      <div className="words-content">
        <h1 className="words-page-title">Words</h1>

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
