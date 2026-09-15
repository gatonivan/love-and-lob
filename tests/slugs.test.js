import { describe, it, expect } from 'vitest'
import * as slugs from '../api/schedule-slugs.js'
import * as sweatpals from '../api/_sweatpals.js'

describe('schedule-slugs', () => {
  it('exports both curated lists as arrays of strings', () => {
    expect(Array.isArray(slugs.SPECIAL_EVENT_SLUGS)).toBe(true)
    expect(Array.isArray(slugs.PROGRAM_SLUGS)).toBe(true)
    for (const s of [...slugs.SPECIAL_EVENT_SLUGS, ...slugs.PROGRAM_SLUGS]) {
      expect(typeof s).toBe('string')
      expect(s.length).toBeGreaterThan(0)
    }
  })

  it('carries an ISO UPDATED_AT', () => {
    expect(Number.isNaN(Date.parse(slugs.UPDATED_AT))).toBe(false)
  })

  it('keeps the two lists disjoint', () => {
    const overlap = slugs.PROGRAM_SLUGS.filter((s) =>
      slugs.SPECIAL_EVENT_SLUGS.includes(s),
    )
    expect(overlap).toEqual([])
  })

  it('_sweatpals re-exports the same array identities', () => {
    expect(sweatpals.PROGRAM_SLUGS).toBe(slugs.PROGRAM_SLUGS)
    expect(sweatpals.SPECIAL_EVENT_SLUGS).toBe(slugs.SPECIAL_EVENT_SLUGS)
  })
})
