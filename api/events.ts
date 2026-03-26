import type { VercelRequest, VercelResponse } from '@vercel/node'

const API_URL = 'https://public-api.luma.com/v1/calendar/list-events'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.LUMA_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'LUMA_API_KEY not set' })
  }

  try {
    const now = new Date().toISOString()
    const response = await fetch(`${API_URL}?after=${now}`, {
      headers: { 'x-luma-api-key': apiKey },
    })

    if (!response.ok) {
      return res.status(502).json({ error: `Luma API returned ${response.status}` })
    }

    const data = await response.json()
    const events = (data.entries || [])
      .filter((entry: any) => entry.event.visibility === 'public')
      .map((entry: any) => {
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
      .sort((a: any, b: any) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())

    // Cache for 10 minutes, limit to 5 events
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300')
    return res.status(200).json(events.slice(0, 5))
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch events', detail: String(err) })
  }
}
