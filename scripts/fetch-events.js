/**
 * Fetches upcoming events from Luma at build time and writes them
 * to public/events.json so the client can read them without CORS issues.
 */

const API_URL = 'https://public-api.luma.com/v1/calendar/list-events'

async function main() {
  const apiKey = process.env.VITE_LUMA_API_KEY
  if (!apiKey) {
    console.warn('[fetch-events] VITE_LUMA_API_KEY not set, writing empty events')
    await writeEvents([])
    return
  }

  const now = new Date().toISOString()
  const res = await fetch(`${API_URL}?after=${now}`, {
    headers: { 'x-luma-api-key': apiKey },
  })

  if (!res.ok) {
    console.error(`[fetch-events] API returned ${res.status}`)
    await writeEvents([])
    return
  }

  const data = await res.json()
  const events = (data.entries || [])
    .filter((entry) => entry.event.visibility === 'public')
    .map((entry) => {
      const ev = entry.event
      return {
        id: ev.id,
        name: ev.name,
        start_at: ev.start_at,
        end_at: ev.end_at,
        cover_url: ev.cover_url,
        url: ev.url,
        location:
          ev.geo_address_json?.address ||
          ev.geo_address_json?.full_address ||
          '',
      }
    })
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())

  console.log(`[fetch-events] Fetched ${events.length} upcoming events`)
  await writeEvents(events)
}

async function writeEvents(events) {
  const fs = await import('node:fs/promises')
  const path = await import('node:path')
  const outPath = path.join(import.meta.dirname, '..', 'public', 'events.json')
  await fs.writeFile(outPath, JSON.stringify(events, null, 2))
  console.log(`[fetch-events] Wrote ${outPath}`)
}

main().catch((err) => {
  console.error('[fetch-events]', err)
  process.exit(1)
})
