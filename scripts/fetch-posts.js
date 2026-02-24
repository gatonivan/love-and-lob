/**
 * Fetches posts from Substack RSS at build time and writes them
 * to public/posts.json so the client can read them without CORS issues.
 */

const RSS_URL = 'https://nycblazer.substack.com/feed'

async function main() {
  const res = await fetch(RSS_URL)

  if (!res.ok) {
    console.error(`[fetch-posts] RSS returned ${res.status}`)
    await writePosts([])
    return
  }

  const xml = await res.text()
  const posts = parseRSS(xml)

  console.log(`[fetch-posts] Fetched ${posts.length} posts`)
  await writePosts(posts)
}

function parseRSS(xml) {
  const items = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1]
    const title = extractCDATA(content, 'title')
    const description = extractCDATA(content, 'description')
    const link = extractTag(content, 'link')
    const pubDate = extractTag(content, 'pubDate')

    // Extract cover image from enclosure tag
    const enclosureMatch = content.match(/<enclosure\s+url="([^"]*)"/)
    const coverUrl = enclosureMatch ? enclosureMatch[1] : null

    items.push({
      title,
      description,
      link,
      published_at: pubDate,
      cover_url: coverUrl,
    })
  }

  return items
}

function extractCDATA(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`))
  return match ? match[1] : extractTag(xml, tag)
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))
  return match ? match[1].trim() : ''
}

async function writePosts(posts) {
  const fs = await import('node:fs/promises')
  const path = await import('node:path')
  const outPath = path.join(import.meta.dirname, '..', 'public', 'posts.json')
  await fs.writeFile(outPath, JSON.stringify(posts, null, 2))
  console.log(`[fetch-posts] Wrote ${outPath}`)
}

main().catch((err) => {
  console.error('[fetch-posts]', err)
  process.exit(1)
})
