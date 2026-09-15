import { describe, it, expect } from 'vitest'
import {
  scanHostAliases,
  scanLooksHealthy,
  fetchHostScan,
  HOST_PAGE_URL,
  SPECIAL_EVENT_SLUGS,
  PROGRAM_SLUGS,
} from '../../api/_sweatpals.js'

const CURATED_COUNT = SPECIAL_EVENT_SLUGS.length + PROGRAM_SLUGS.length

// Hits the real network — the current Sweatpals host page. Deliberately kept
// out of the default suite (see vite.config.ts's test.exclude and
// vitest.live.config.ts) so `pnpm test` — which a later task wires as the
// gate on a workflow that can commit to main — never goes red because of a
// Sweatpals outage, an offline machine, or a legitimately quiet week. Run
// with `pnpm test:live`. tests/scan.test.js exercises the same shape
// deterministically against a committed fixture.
describe('live: scanHostAliases + scanLooksHealthy against the real host page', () => {
  it(
    'treats the real host page as healthy against the actual curated list size',
    async () => {
      const html = await fetch(HOST_PAGE_URL).then((r) => r.text())
      const aliases = scanHostAliases(html)
      expect(aliases.length).toBeGreaterThan(0)
      expect(scanLooksHealthy(html, aliases, CURATED_COUNT)).toBe(true)
    },
    15000,
  )

  it(
    'fetchHostScan returns a healthy scan end to end',
    async () => {
      const result = await fetchHostScan(CURATED_COUNT)
      expect(result.healthy).toBe(true)
      expect(result.aliases.length).toBeGreaterThan(0)
    },
    15000,
  )
})
