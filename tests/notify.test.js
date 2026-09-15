import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatReport, sendReport } from '../api/_notify.js'

describe('formatReport', () => {
  it('names what changed in plain English, with no slugs in the body', () => {
    const r = formatReport({
      added: [{ slug: 'drill-play-greenpoint', name: 'Drill & Play (Greenpoint)', bucket: 'programs' }],
      removed: [{ slug: 'cardio-tennis-brooklyn-college', name: 'Cardio Tennis', bucket: 'programs' }],
      blocked: null,
      scanOk: true,
    })
    expect(r.text).toContain('Drill & Play (Greenpoint)')
    expect(r.text).toContain('Cardio Tennis')
    expect(r.text).not.toContain('drill-play-greenpoint')
    expect(r.subject).toMatch(/updated/i)
  })

  it('explains a tripped guard instead of claiming success', () => {
    const r = formatReport({
      added: [],
      removed: [],
      blocked: { guard: 'net-shrink', reason: 'List would shrink from 6 to 2; refusing to apply without review.' },
      scanOk: true,
    })
    expect(r.subject).toMatch(/needs a look/i)
    expect(r.text).toContain('shrink from 6 to 2')
    expect(r.text).toContain('/studio')
  })

  it('reports a scan failure as a failure, not as no-changes', () => {
    const r = formatReport({ added: [], removed: [], blocked: null, scanOk: false })
    expect(r.subject).toMatch(/could not read/i)
    expect(r.text).toMatch(/stale/i)
  })

  it('still produces a report when only additions happened', () => {
    const r = formatReport({
      added: [{ slug: 'x', name: 'New Clinic', bucket: 'programs' }],
      removed: [],
      blocked: null,
      scanOk: true,
    })
    expect(r.text).toContain('New Clinic')
    expect(r.text).not.toMatch(/Removed/)
  })

  it('Fix 5: flags an orphan (delisted, still scheduled) even when nothing else changed', () => {
    const r = formatReport({
      added: [],
      removed: [],
      blocked: null,
      scanOk: true,
      verdicts: [
        { slug: 'cardio-tennis-brooklyn-college', name: 'Cardio Tennis', bucket: 'programs', verdict: 'orphan' },
        { slug: 'alpha', name: 'Alpha', bucket: 'programs', verdict: 'healthy' },
      ],
    })
    expect(r.text).toContain('Cardio Tennis')
    expect(r.text).toMatch(/delisted/i)
    expect(r.text).not.toContain('cardio-tennis-brooklyn-college')
    // Nothing was actually written, so this must not claim success the way
    // an actual update does.
    expect(r.subject).not.toMatch(/updated automatically/i)
    expect(r.text).not.toMatch(/live on loveandlob\.co\/schedule/i)
  })

  it('Fix 5: still lists an orphan alongside real added/removed changes', () => {
    const r = formatReport({
      added: [{ slug: 'new-clinic', name: 'New Clinic', bucket: 'programs' }],
      removed: [],
      blocked: null,
      scanOk: true,
      verdicts: [
        { slug: 'orphan-slug', name: 'Orphan Clinic', bucket: 'programs', verdict: 'orphan' },
      ],
    })
    expect(r.subject).toMatch(/updated/i)
    expect(r.text).toContain('New Clinic')
    expect(r.text).toContain('Orphan Clinic')
  })

  it('does not mention orphans when there are none', () => {
    const r = formatReport({
      added: [],
      removed: [],
      blocked: null,
      scanOk: true,
      verdicts: [{ slug: 'alpha', name: 'Alpha', bucket: 'programs', verdict: 'healthy' }],
    })
    expect(r.text).not.toMatch(/delisted/i)
  })

  it('Fix 4b: names the rejected alias values in a scan-failure email', () => {
    const r = formatReport({
      added: [],
      removed: [],
      blocked: null,
      scanOk: false,
      rejected: ['Khari_B', 'bad one!'],
    })
    expect(r.text).toContain('Khari_B')
    expect(r.text).toContain('bad one!')
  })

  it('omits the rejected-values aside from a scan-failure email when there are none', () => {
    const r = formatReport({ added: [], removed: [], blocked: null, scanOk: false, rejected: [] })
    expect(r.text).not.toMatch(/rejected/i)
  })

  it('does not throw when rejected/verdicts are omitted entirely', () => {
    expect(() => formatReport({ added: [], removed: [], blocked: null, scanOk: false })).not.toThrow()
    expect(() => formatReport({ added: [], removed: [], blocked: null, scanOk: true })).not.toThrow()
  })
})

describe('sendReport', () => {
  const originalFetch = globalThis.fetch
  const report = { subject: 'Schedule updated automatically', text: 'body' }

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('returns true when Brevo accepts the request', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true })
    const result = await sendReport(report, { apiKey: 'key', to: ['owner@example.com'] })
    expect(result).toBe(true)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.brevo.com/v3/smtp/email',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('returns false, not a throw, when Brevo rejects the request', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 400 })
    const result = await sendReport(report, { apiKey: 'key', to: ['owner@example.com'] })
    expect(result).toBe(false)
  })

  it('returns false, not a throw, when the network request throws', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network down'))
    await expect(sendReport(report, { apiKey: 'key', to: ['owner@example.com'] })).resolves.toBe(false)
  })

  it('returns false without calling fetch when apiKey or recipients are missing', async () => {
    globalThis.fetch = vi.fn()
    expect(await sendReport(report, { apiKey: '', to: ['owner@example.com'] })).toBe(false)
    expect(await sendReport(report, { apiKey: 'key', to: [] })).toBe(false)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })
})
