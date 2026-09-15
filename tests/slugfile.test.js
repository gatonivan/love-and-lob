import { describe, it, expect } from 'vitest'
import { renderSlugsFile } from '../api/_slugfile.js'

const sample = {
  special: ['ll-invitational-vol-4'],
  programs: ['drill-play-greenpoint', 'kids-clinic-ages-58-greenpoint'],
  updatedAt: '2026-09-18T09:00:00.000Z',
}

describe('renderSlugsFile', () => {
  it('round-trips through a real ESM import', async () => {
    const text = renderSlugsFile(sample)
    const mod = await import(
      'data:text/javascript;base64,' + Buffer.from(text).toString('base64')
    )
    expect(mod.SPECIAL_EVENT_SLUGS).toEqual(sample.special)
    expect(mod.PROGRAM_SLUGS).toEqual(sample.programs)
    expect(mod.UPDATED_AT).toBe(sample.updatedAt)
  })

  it('renders empty lists without producing invalid syntax', async () => {
    const text = renderSlugsFile({ special: [], programs: [], updatedAt: sample.updatedAt })
    const mod = await import(
      'data:text/javascript;base64,' + Buffer.from(text).toString('base64')
    )
    expect(mod.SPECIAL_EVENT_SLUGS).toEqual([])
    expect(mod.PROGRAM_SLUGS).toEqual([])
  })

  it('escapes hostile input rather than emitting raw code', async () => {
    const text = renderSlugsFile({
      special: [],
      programs: ['"]; globalThis.PWNED = true; const x = ["'],
      updatedAt: sample.updatedAt,
    })
    const mod = await import(
      'data:text/javascript;base64,' + Buffer.from(text).toString('base64')
    )
    expect(globalThis.PWNED).toBeUndefined()
    expect(mod.PROGRAM_SLUGS).toHaveLength(1)
  })

  it('is deterministic for identical input', () => {
    expect(renderSlugsFile(sample)).toBe(renderSlugsFile(sample))
  })

  it('ends with exactly one trailing newline', () => {
    const text = renderSlugsFile(sample)
    expect(text.endsWith('\n')).toBe(true)
    expect(text.endsWith('\n\n')).toBe(false)
  })
})
