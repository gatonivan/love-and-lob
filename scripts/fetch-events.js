/**
 * Fetches active special events (Invitationals, etc.) from Sweatpals at build
 * time and writes them to public/events.json so the client can read them
 * without CORS issues. Data source and mapping live in ../api/_sweatpals.js.
 */

import { fetchScheduleData } from '../api/_sweatpals.js'

async function main() {
  const data = await fetchScheduleData()
  console.log(
    `[fetch-events] Featured: ${data.featured ? data.featured.name : 'none'} | ` +
      `${data.upcoming.length} upcoming clinics`,
  )
  await writeEvents(data)
}

async function writeEvents(data) {
  const fs = await import('node:fs/promises')
  const path = await import('node:path')
  const outPath = path.join(import.meta.dirname, '..', 'public', 'events.json')
  await fs.writeFile(outPath, JSON.stringify(data, null, 2))
  console.log(`[fetch-events] Wrote ${outPath}`)
}

main().catch((err) => {
  console.error('[fetch-events]', err)
  process.exit(1)
})
