import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  scanHostAliases,
  scanLooksHealthy,
  rejectedAliasValues,
  fetchHostScan,
  HOST_PAGE_URL,
} from '../api/_sweatpals.js'
import { MIN_LIST_FOR_RATIO_GUARD } from '../api/_reconcile.js'

// A trimmed, byte-for-byte slice of a real fetch of HOST_PAGE_URL
// (2026-09-15) — see the comment at the top of the fixture file for what was
// cut and why. Using a committed snapshot instead of a live fetch keeps the
// default suite deterministic; tests/live/scan.live.test.js covers the real
// network. It also pins scanHostAliases's real-page behavior to real data:
// if Sweatpals' page shape moves, regenerating this fixture will change the
// counts and fail these tests loudly instead of letting assumptions rot.
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
    // Suppressed: this input deliberately trips the charset-rejection warn
    // (see the dedicated test for that below) and shouldn't spam stderr on
    // every `pnpm test` run.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const html = `{"alias":"good-one"} {"alias":"bad one!"} {"alias":""}`
    expect(scanHostAliases(html)).toEqual(['good-one'])
    warn.mockRestore()
  })

  it('Fix 4a: does not treat a lone empty alias value as charset drift', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const html = `{"alias":"good-one"} {"alias":""}`
    expect(scanHostAliases(html)).toEqual(['good-one'])
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
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
// and "publishingState" alongside "alias" for realism, though scanLooksHealthy
// no longer reads those two fields (see the charset-comparison check below).
function buildEventBlock(alias) {
  return `{"id":"${alias}-id","alias":"${alias}","eventType":"CLASS","publishingState":"published"}`
}

function buildHostPage(aliases, { filler = 20000 } = {}) {
  const pad = 'x'.repeat(filler)
  const blocks = aliases.flatMap((alias) => [buildEventBlock(alias), buildEventBlock(alias)])
  return `<html><body><script>${blocks.join('\n')}</script><!--${pad}--></body></html>`
}

// Renames the "alias" KEY (not value) for every event except `keepAlias`,
// simulating a markup migration where most events move to a new component
// shape entirely — scanHostAliases can no longer find them at all. Distinct
// from corruptAliasValues below, which keeps the key intact and corrupts
// only the value (the charset-rejection case).
function degradeMarkupExcept(html, keepAlias) {
  return html.replace(/"alias":"([a-z0-9-]+)"/g, (match, alias) =>
    alias === keepAlias ? match : match.replace('"alias":', '"notalias":'),
  )
}

// Corrupts the VALUE of every raw occurrence (both the SSR and hydration
// copy) of each alias in `targetAliases` by appending a character outside
// the slug charset, so ALIAS_RE can no longer match it while the permissive
// ALIAS_ANY_RE still does — simulating a slug value Sweatpals accepts but
// scanHostAliases must reject. This is exactly scanLooksHealthy's secondary
// check's motivating case.
function corruptAliasValues(html, targetAliases) {
  return html.replace(/"alias":"([a-z0-9-]+)"/g, (match, alias) =>
    targetAliases.includes(alias) ? `"alias":"${alias}!"` : match,
  )
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

  it('flags a markup-driven degradation as unhealthy via expectedCount', () => {
    // The literal Critical-B scenario: 5 of 6 events move to a new component
    // shape entirely, so their "alias" key disappears along with everything
    // else — there's no charset mismatch to detect (the key is just gone),
    // so only expectedCount (drawn from the curated list, not the page) can
    // catch this.
    const degraded = degradeMarkupExcept(REAL_HTML, 'absolute-beginner-clinic-greenpoint')
    const aliases = scanHostAliases(degraded)
    expect(aliases).toEqual(['absolute-beginner-clinic-greenpoint'])

    // Demonstrates the gap: without expectedCount, nothing else catches
    // this — the single surviving alias has no raw/accepted mismatch.
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

  it('flags a drastic drop against a large curated list via expectedCount', () => {
    // 1 of 6 curated slugs discovered — unhealthy because of expectedCount,
    // independent of the charset-comparison secondary check (no rejection
    // is involved here at all).
    const html = buildHostPage(['absolute-beginner-clinic-greenpoint'])
    const aliases = scanHostAliases(html)
    expect(scanLooksHealthy(html, aliases, 6)).toBe(false)
  })

  it('flags 1 charset-rejected alias out of 6 as unhealthy via the secondary check, isolated from expectedCount', () => {
    const html = corruptAliasValues(REAL_HTML, ['absolute-beginner-clinic-greenpoint'])
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const aliases = scanHostAliases(html)
    warn.mockRestore()
    expect(aliases).toHaveLength(5)
    // expectedCount = 6 (the real curated size): the primary check's
    // threshold is aliases.length < 3, and 5 doesn't cross it — so if this
    // is false, it's the secondary check firing: raw "alias":"..." hits
    // stay at 12 (unaffected by a value-only corruption) while accepted
    // (charset-valid) hits drop to 10, and 12 > 10 is a real mismatch.
    expect(scanLooksHealthy(html, aliases, 6)).toBe(false)
  })

  it('flags 2 charset-rejected aliases out of 6 as unhealthy via the secondary check, isolated from expectedCount', () => {
    const html = corruptAliasValues(REAL_HTML, [
      'absolute-beginner-clinic-greenpoint',
      'drill-play-greenpoint',
    ])
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const aliases = scanHostAliases(html)
    warn.mockRestore()
    expect(aliases).toHaveLength(4)
    // Same isolation: 4 is still not < 3, so this failing proves the
    // secondary check (raw 12 > accepted 8) caught it, not expectedCount.
    expect(scanLooksHealthy(html, aliases, 6)).toBe(false)
  })

  it('still catches a badly degraded first-run parse when expectedCount is 0 (Fix 3)', () => {
    // expectedCount = 0 disables the primary count check entirely (a first
    // run has no curated list to compare against) — this must still be
    // caught, or a first run against a badly broken parse silently ships a
    // near-empty schedule instead of blocking for review.
    const html = corruptAliasValues(REAL_HTML, [
      'absolute-beginner-clinic-greenpoint',
      'll-early-morning-sessions-5d58d2',
      'kids-clinic-ages-58-greenpoint',
      'drill-play-greenpoint',
    ])
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const aliases = scanHostAliases(html)
    warn.mockRestore()
    expect(aliases).toHaveLength(2)
    expect(scanLooksHealthy(html, aliases, 0)).toBe(false)
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

  it('Fix 4a: a stray empty alias value anywhere on the page does not fail the health check', () => {
    // The literal repro from the bug report: a single "alias":"" sitting
    // anywhere on the page must not trip the secondary (charset) check —
    // an empty value carries no character for the charset to have rejected.
    const html = `${REAL_HTML}<script>{"alias":""}</script>`
    expect(rejectedAliasValues(html)).toEqual([])
    expect(scanLooksHealthy(html, REAL_ALIASES, REAL_ALIASES.length)).toBe(true)
  })

  it('Fix 6: the guard still fires once expectedCount has been ratcheted down to 1', () => {
    // Simulates the end state of a persistently degraded parse that walked
    // the curated list down to a single slug over several runs. With an
    // un-floored anchor, expectedCount=1 makes the threshold "fewer than
    // 0.5", which no non-empty aliases array can ever be below — the guard
    // would be permanently, structurally dead. Flooring the anchor at
    // MIN_LIST_FOR_RATIO_GUARD keeps it able to fire.
    const html = buildHostPage(['only-one-event'])
    const aliases = scanHostAliases(html)
    expect(aliases).toEqual(['only-one-event'])
    expect(scanLooksHealthy(html, aliases, 1)).toBe(false)
  })

  it('Fix 6: the floor does not change behavior once expectedCount already meets it', () => {
    expect(MIN_LIST_FOR_RATIO_GUARD).toBeLessThanOrEqual(REAL_ALIASES.length)
    expect(scanLooksHealthy(REAL_HTML, REAL_ALIASES, REAL_ALIASES.length)).toBe(true)
  })
})

describe('rejectedAliasValues', () => {
  it('returns unique, non-empty charset-rejected values', () => {
    const html = `{"alias":"good"} {"alias":"Bad!"} {"alias":"Bad!"} {"alias":""}`
    expect(rejectedAliasValues(html)).toEqual(['Bad!'])
  })

  it('returns an empty array for empty or nullish input', () => {
    expect(rejectedAliasValues('')).toEqual([])
    expect(rejectedAliasValues(null)).toEqual([])
    expect(rejectedAliasValues(undefined)).toEqual([])
  })
})

describe('fetchHostScan', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('reports { aliases: [], healthy: false, rejected: [] } when the fetch throws', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network down'))
    const result = await fetchHostScan(6)
    expect(result).toEqual({ aliases: [], healthy: false, rejected: [] })
    expect(globalThis.fetch).toHaveBeenCalledWith(HOST_PAGE_URL)
  })

  it('reports { aliases: [], healthy: false, rejected: [] } on a non-OK response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 })
    const result = await fetchHostScan(6)
    expect(result).toEqual({ aliases: [], healthy: false, rejected: [] })
  })

  it('returns the scan and a true health verdict for a healthy page', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, url: HOST_PAGE_URL, text: async () => REAL_HTML })
    const result = await fetchHostScan(REAL_ALIASES.length)
    expect(result).toEqual({ aliases: REAL_ALIASES, healthy: true, rejected: [] })
  })

  it('Fix 1: reports { aliases: [], healthy: false, rejected: [] } when the final URL left the host page (a redirect)', async () => {
    // A 301 (account change, soft-404, routing change) can land on a
    // global feed while still returning ok:true — a stranger's events
    // must never be scanned as if they were this venue's. fetch() follows
    // redirects transparently, so the only signal left is res.url.
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      url: 'https://sweatpals.com/discover/global-feed',
      text: async () => REAL_HTML,
    })
    const result = await fetchHostScan(REAL_ALIASES.length)
    expect(result).toEqual({ aliases: [], healthy: false, rejected: [] })
  })

  it('Fix 1: also blocks a redirect to a different Sweatpals venue entirely', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      url: 'https://sweatpals.com/some-other-venue',
      text: async () => REAL_HTML,
    })
    const result = await fetchHostScan(REAL_ALIASES.length)
    expect(result).toEqual({ aliases: [], healthy: false, rejected: [] })
  })

  it('Fix 1: does NOT block a same-venue redirect (Sweatpals restructuring its own URL scheme)', async () => {
    // Observed in production: sweatpals.com/loveandlob 308-redirects to
    // sweatpals.com/host/loveandlob. That is Sweatpals moving this exact
    // venue's page, not a hijack, and must not be treated as one.
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      url: 'https://sweatpals.com/host/loveandlob',
      text: async () => REAL_HTML,
    })
    const result = await fetchHostScan(REAL_ALIASES.length)
    expect(result).toEqual({ aliases: REAL_ALIASES, healthy: true, rejected: [] })
  })

  it('Fix 1: blocks a redirect off the sweatpals.com domain entirely', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      url: 'https://evil.example.com/loveandlob',
      text: async () => REAL_HTML,
    })
    const result = await fetchHostScan(REAL_ALIASES.length)
    expect(result).toEqual({ aliases: [], healthy: false, rejected: [] })
  })

  it('Fix 2: does not silently disable the primary guard when called with no argument', async () => {
    // A 1-event page must NOT read as healthy just because the caller
    // forgot to pass expectedCount. Before Fix 2, an omitted argument
    // defaulted scanLooksHealthy's expectedCount to 0, which skips the
    // primary check entirely.
    const html = buildHostPage(['only-one-event'])
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, url: HOST_PAGE_URL, text: async () => html })
    const result = await fetchHostScan()
    expect(result.healthy).toBe(false)
  })

  it('Fix 2: defaults to the real curated count and is healthy for the real fixture', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, url: HOST_PAGE_URL, text: async () => REAL_HTML })
    const result = await fetchHostScan()
    expect(result).toEqual({ aliases: REAL_ALIASES, healthy: true, rejected: [] })
  })
})
