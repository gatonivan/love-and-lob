import type { VercelRequest, VercelResponse } from '@vercel/node'
import { fetchScheduleData } from './_sweatpals.js'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const data = await fetchScheduleData()
    // Cache for 10 minutes
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300')
    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch events', detail: String(err) })
  }
}
