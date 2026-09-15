import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  scanHostAliases,
  scanLooksHealthy,
  fetchHostScan,
  HOST_PAGE_URL,
} from '../api/_sweatpals.js'

// A trimmed, byte-for-byte slice of a real fetch of HOST_PAGE_URL
// (2026-09-15) — see the comment at the top of the fixture file for what was
// cut and why. Using a committed snapshot instead of a live fetch keeps the
// default suite deterministic; tests/live/scan.live.test.js covers the real
// network. It also pins the marker-ratio assumption baked into
// scanLooksHealthy to real data: if Sweatpals' page shape moves, regenerating
// this fixture will change the counts and fail these tests loudly instead of
// letting the assumption quietly rot.
const FIXTURE_PATH = fileURLToPath(new URL('./fixtures/sweatpals-host.html', import.meta.url))
const REAL_HTML = readFileSync(FIXTURE_PATH, 'utf8')
const REAL_ALIASES = [
  'absolute-beginner-clinic-greenpoint',
  'll-early-morning-sessions-5d58d2',
  'kids-clinic-ages-58-greenpoint',
  'drill-play-greenpoint',
  'beginner-clinic-brooklyn-college',
  'intermediate-clinic-brooklyn-college',
]

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

  it('warns when a charset-rejected alias makes the raw and accepted counts diverge', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const html = `{"alias":"good-one"} {"alias":"Bad_Value!"}`
    expect(scanHostAliases(html)).toEqual(['good-one'])
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toMatch(/rejected/)
    warn.mockRestore()
  })

  it('does not warn when every alias value is accepted', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    scanHostAliases(REAL_HTML)
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('extracts the real fixture faithfully', () => {
    expect(scanHostAliases(REAL_HTML)).toEqual(REAL_ALIASES)
  })
})

// Builds a synthetic page in the real host page's shape: each event object is
// embedded twice (SSR + hydration), and each embedding carries "eventType"
// and "publishingState" alongside "alias" — the same marker fields
// scanLooksHealthy's secondary check cross-references.
function buildEventBlock(alias) {
  return `{"id":"${alias}-id","alias":"${alias}","eventType":"CLASS","publishingState":"published"}`
}

function buildHostPage(aliases, { filler = 20000 } = {}) {
  const pad = 'x'.repeat(filler)
  const blocks = aliases.flatMap((alias) => [buildEventBlock(alias), buildEventBlock(alias)])
  return `<html><body><script>${blocks.join('\n')}</script><!--${pad}--></body></html>`
}

// Simulates the real degradation scenario Critical B is about: events
// migrate to a new component with renamed keys ("alias" -> "slug",
// "eventType" -> "kind", "publishingState" -> "status"), so BOTH the alias
// AND its markers vanish from the page together for every event except
// `keepAlias`. Operates on the real fixture, splitting at each raw alias
// occurrence (the same boundary scanHostAliases's matches fall on) so the
// rename only touches the event block it belongs to.
function degradeMarkupExcept(html, keepAlias) {
  const matches = [...html.matchAll(/"alias":"([a-z0-9-]+)"/g)]
  let result = ''
  let cursor = 0
  for (let i = 0; i < matches.length; i++) {
    const segEnd = i + 1 < matches.length ? matches[i + 1].index : html.length
    let segment = html.slice(cursor, segEnd)
    if (matches[i][1] !== keepAlias) {
      segment = segment
        .replaceAll('"alias":', '"slug":')
        .replaceAll('"eventType":', '"kind":')
        .replaceAll('"publishingState":', '"status":')
    }
    result += segment
    cursor = segEnd
  }
  return result
}

describe('scanLooksHealthy', () => {
  it('treats the committed real-page fixture as healthy', () => {
    expect(scanLooksHealthy(REAL_HTML, REAL_ALIASES, REAL_ALIASES.length)).toBe(true)
  })

  it('flags a page as unhealthy when the alias JSON is absent but the HTML is otherwise large and valid', () => {
    // Rename every event's "alias" key away (eventType/publishingState left
    // alone), so scanHostAliases finds nothing even though the page still
    // plainly contains event data.
    const html = REAL_HTML.replaceAll('"alias":', '"slug":')
    expect(html.length).toBeGreaterThan(50000)
    const aliases = scanHostAliases(html)
    expect(aliases).toEqual([])
    expect(scanLooksHealthy(html, aliases, REAL_ALIASES.length)).toBe(false)
  })

  it('flags a markup-driven degradation as unhealthy via expectedCount, even though markers shrink right along with aliases', () => {
    // The literal Critical-B scenario: 5 of 6 events move to a new component
    // shape, taking their eventType/publishingState markers down with their
    // alias. A same-page marker cross-check cannot see this — both sides of
    // its ratio shrink together — which is exactly why expectedCount (drawn
    // from the curated list, not the page) is the primary signal.
    const degraded = degradeMarkupExcept(REAL_HTML, 'absolute-beginner-clinic-greenpoint')
    const aliases = scanHostAliases(degraded)
    expect(aliases).toEqual(['absolute-beginner-clinic-greenpoint'])

    // Demonstrates the gap: without expectedCount, the marker check alone
    // does NOT catch this (markers shrank in lockstep with aliases).
    expect(scanLooksHealthy(degraded, aliases)).toBe(true)

    // With expectedCount wired in (the curated list had 6 slugs), it's
    // caught: 1 discovered alias is fewer than half of 6.
    expect(scanLooksHealthy(degraded, aliases, 6)).toBe(false)
  })

  it('returns false for an empty string or nullish html', () => {
    expect(scanLooksHealthy('', ['a'], 1)).toBe(false)
    expect(scanLooksHealthy(null, ['a'], 1)).toBe(false)
    expect(scanLooksHealthy(undefined, ['a'], 1)).toBe(false)
  })

  it('treats a genuinely small listing, in the expected shape, as healthy', () => {
    const aliases = ['absolute-beginner-clinic-greenpoint', 'drill-play-greenpoint']
    const html = buildHostPage(aliases)
    expect(scanHostAliases(html)).toEqual(aliases)
    // Curated list is also 2 — a real quiet week, not a drop from a bigger list.
    expect(scanLooksHealthy(html, scanHostAliases(html), 2)).toBe(true)
  })

  it('treats an empty alias list as unhealthy even with no other evidence', () => {
    expect(scanLooksHealthy('<html><body>nope</body></html>', [], 0)).toBe(false)
  })

  it('skips the expectedCount check on a first run (expectedCount === 0)', () => {
    const aliases = ['only-one']
    const html = buildHostPage(aliases)
    // Nothing curated yet, so a single discovered alias can't be "drastically
    // fewer" than a list that doesn't exist yet.
    expect(scanLooksHealthy(html, scanHostAliases(html), 0)).toBe(true)
  })

  it('flags a drastic drop against a large curated list even when markers look proportionate', () => {
    // 1 of 6 curated slugs discovered, with markers scaled proportionately
    // (i.e. not a charset issue) — still unhealthy because of expectedCount.
    const html = buildHostPage(['absolute-beginner-clinic-greenpoint'])
    const aliases = scanHostAliases(html)
    expect(scanLooksHealthy(html, aliases, 6)).toBe(false)
  })

  it('stays healthy for a wholesale alias migration (new identities, same count)', () => {
    // All-new slugs, none overlapping the curated list — must not be
    // penalized. scanLooksHealthy never compares identities, only counts.
    const migratedAliases = [
      'new-beginner-clinic',
      'new-kids-clinic',
      'new-drill-play',
      'new-brooklyn-beginner',
      'new-brooklyn-intermediate',
      'new-early-morning',
    ]
    const html = buildHostPage(migratedAliases)
    expect(scanLooksHealthy(html, scanHostAliases(html), 6)).toBe(true)
  })
})

describe('fetchHostScan', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('reports { aliases: [], healthy: false } when the fetch throws', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network down'))
    const result = await fetchHostScan(6)
    expect(result).toEqual({ aliases: [], healthy: false })
    expect(globalThis.fetch).toHaveBeenCalledWith(HOST_PAGE_URL)
  })

  it('reports { aliases: [], healthy: false } on a non-OK response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 })
    const result = await fetchHostScan(6)
    expect(result).toEqual({ aliases: [], healthy: false })
  })

  it('returns the scan and a true health verdict for a healthy page', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => REAL_HTML })
    const result = await fetchHostScan(REAL_ALIASES.length)
    expect(result).toEqual({ aliases: REAL_ALIASES, healthy: true })
  })
})
