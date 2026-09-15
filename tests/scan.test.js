import { describe, it, expect } from 'vitest'
import { scanHostAliases, scanLooksHealthy, HOST_PAGE_URL } from '../api/_sweatpals.js'

describe('scanHostAliases', () => {
  it('pulls aliases out of the embedded JSON', () => {
    const html = `<script>{"alias":"drill-play-greenpoint","x":1}
      {"alias":"kids-clinic-ages-58-greenpoint"}</script>`
    expect(scanHostAliases(html)).toEqual([
      'drill-play-greenpoint',
      'kids-clinic-ages-58-greenpoint',
    ])
  })

  it('dedupes repeated aliases, preserving first-seen order', () => {
    const html = `{"alias":"b"} {"alias":"a"} {"alias":"b"}`
    expect(scanHostAliases(html)).toEqual(['b', 'a'])
  })

  it('returns an empty array when the markup has no aliases', () => {
    expect(scanHostAliases('<html><body>nope</body></html>')).toEqual([])
  })

  it('returns an empty array for empty or nullish input', () => {
    expect(scanHostAliases('')).toEqual([])
    expect(scanHostAliases(null)).toEqual([])
    expect(scanHostAliases(undefined)).toEqual([])
  })

  it('ignores aliases containing characters a slug cannot have', () => {
    const html = `{"alias":"good-one"} {"alias":"bad one!"} {"alias":""}`
    expect(scanHostAliases(html)).toEqual(['good-one'])
  })
})

// Builds a synthetic page that mirrors the real host page's structure: each
// event object is embedded twice (SSR + hydration), and each embedding
// carries "eventType" and "publishingState" alongside "alias" — the same
// marker fields scanLooksHealthy cross-checks against. `filler` pads the
// page to a realistic size so "large and valid" tests aren't tiny strings.
function buildEventBlock(alias) {
  return `{"id":"${alias}-id","alias":"${alias}","eventType":"CLASS","publishingState":"published"}`
}

function buildHostPage(aliases, { includeAlias = true, filler = 60000 } = {}) {
  const pad = 'x'.repeat(filler)
  const blocks = aliases
    .flatMap((alias) => [buildEventBlock(alias), buildEventBlock(alias)])
    .map((block) =>
      includeAlias ? block : block.replace(/"alias":"[^"]*",?/, ''),
    )
  return `<html><body><script>${blocks.join('\n')}</script><!--${pad}--></body></html>`
}

describe('scanLooksHealthy', () => {
  it('flags a page as unhealthy when the alias JSON is absent but the HTML is otherwise large and valid', () => {
    const aliases = [
      'absolute-beginner-clinic-greenpoint',
      'kids-clinic-ages-58-greenpoint',
      'drill-play-greenpoint',
      'beginner-clinic-brooklyn-college',
      'intermediate-clinic-brooklyn-college',
      'll-early-morning-sessions-5d58d2',
    ]
    // "alias" field renamed/removed; eventType/publishingState markers remain,
    // so the page still shows plenty of evidence of events.
    const html = buildHostPage(aliases, { includeAlias: false })
    expect(html.length).toBeGreaterThan(50000)
    expect(scanHostAliases(html)).toEqual([])
    expect(scanLooksHealthy(html, scanHostAliases(html))).toBe(false)
  })

  it('flags a partial parse — only some events survive extraction — as unhealthy', () => {
    // The exact scenario this guard exists for: markup drift leaves 1 of 6
    // events parseable while the page still evidences all 6.
    const aliases = [
      'absolute-beginner-clinic-greenpoint',
      'kids-clinic-ages-58-greenpoint',
      'drill-play-greenpoint',
      'beginner-clinic-brooklyn-college',
      'intermediate-clinic-brooklyn-college',
      'll-early-morning-sessions-5d58d2',
    ]
    const fullHtml = buildHostPage(aliases)
    // Simulate a scan that only managed to extract the first alias, even
    // though the page's marker evidence (eventType/publishingState) reflects
    // all six events.
    const degradedAliases = ['absolute-beginner-clinic-greenpoint']
    expect(scanLooksHealthy(fullHtml, degradedAliases)).toBe(false)
  })

  it('returns false for an empty string or nullish html', () => {
    expect(scanLooksHealthy('', ['a'])).toBe(false)
    expect(scanLooksHealthy(null, ['a'])).toBe(false)
    expect(scanLooksHealthy(undefined, ['a'])).toBe(false)
  })

  it('treats a genuinely small listing, in the expected shape, as healthy', () => {
    const aliases = ['absolute-beginner-clinic-greenpoint', 'drill-play-greenpoint']
    const html = buildHostPage(aliases)
    expect(scanHostAliases(html)).toEqual(aliases)
    expect(scanLooksHealthy(html, scanHostAliases(html))).toBe(true)
  })

  it('treats an empty alias list as unhealthy even with no other evidence', () => {
    expect(scanLooksHealthy('<html><body>nope</body></html>', [])).toBe(false)
  })

  it(
    'treats the real host page, fetched live, as healthy',
    async () => {
      const html = await fetch(HOST_PAGE_URL).then((r) => r.text())
      const aliases = scanHostAliases(html)
      expect(aliases.length).toBeGreaterThan(0)
      expect(scanLooksHealthy(html, aliases)).toBe(true)
    },
    15000,
  )
})
