import { describe, it, expect } from 'vitest'
import { classify } from '../api/_reconcile.js'

const NOW = new Date('2026-09-15T12:00:00.000Z')
const future = { ok: true, nextEnd: '2026-09-20T15:00:00.000Z' }
const past = { ok: true, nextEnd: '2026-08-26T23:00:00.000Z' }
const gone = { ok: false }

const verdictFor = (res, slug) => res.verdicts.find((v) => v.slug === slug)?.verdict

describe('classify — verdicts', () => {
  it('keeps a curated slug that is listed and has a future instance', () => {
    const res = classify({
      curated: { special: [], programs: ['alpha'] },
      discovered: ['alpha'],
      probes: { alpha: { ...future, name: 'Alpha', eventType: 'CLASS' } },
      now: NOW,
    })
    expect(verdictFor(res, 'alpha')).toBe('healthy')
    expect(res.next.programs).toEqual(['alpha'])
    expect(res.removed).toEqual([])
  })

  it('removes a slug that is delisted AND out of future instances', () => {
    const res = classify({
      curated: { special: [], programs: ['alpha', 'stale'] },
      discovered: ['alpha'],
      probes: {
        alpha: { ...future, name: 'Alpha', eventType: 'CLASS' },
        stale: { ...past, name: 'Stale', eventType: 'CLASS' },
      },
      now: NOW,
    })
    expect(verdictFor(res, 'stale')).toBe('dead')
    expect(res.next.programs).toEqual(['alpha'])
    expect(res.removed.map((r) => r.slug)).toEqual(['stale'])
  })

  it('removes a slug whose probe 404s while delisted', () => {
    const res = classify({
      curated: { special: [], programs: ['alpha', 'missing'] },
      discovered: ['alpha'],
      probes: { alpha: { ...future, name: 'Alpha', eventType: 'CLASS' }, missing: gone },
      now: NOW,
    })
    expect(verdictFor(res, 'missing')).toBe('dead')
    expect(res.next.programs).toEqual(['alpha'])
  })

  it('KEEPS a listed slug with no future instance (series between publishes)', () => {
    const res = classify({
      curated: { special: [], programs: ['alpha', 'quiet'] },
      discovered: ['alpha', 'quiet'],
      probes: {
        alpha: { ...future, name: 'Alpha', eventType: 'CLASS' },
        quiet: { ...past, name: 'Quiet', eventType: 'CLASS' },
      },
      now: NOW,
    })
    expect(verdictFor(res, 'quiet')).toBe('quiet')
    expect(res.next.programs).toContain('quiet')
  })

  it('KEEPS a delisted slug that still has future instances (orphan)', () => {
    const res = classify({
      curated: { special: [], programs: ['alpha', 'orphan'] },
      discovered: ['alpha'],
      probes: {
        alpha: { ...future, name: 'Alpha', eventType: 'CLASS' },
        orphan: { ...future, name: 'Orphan', eventType: 'CLASS' },
      },
      now: NOW,
    })
    expect(verdictFor(res, 'orphan')).toBe('orphan')
    expect(res.next.programs).toContain('orphan')
  })

  it('adds a newly listed CLASS to programs', () => {
    const res = classify({
      curated: { special: [], programs: ['alpha'] },
      discovered: ['alpha', 'fresh'],
      probes: {
        alpha: { ...future, name: 'Alpha', eventType: 'CLASS' },
        fresh: { ...future, name: 'Fresh', eventType: 'CLASS' },
      },
      now: NOW,
    })
    expect(verdictFor(res, 'fresh')).toBe('new')
    expect(res.next.programs).toContain('fresh')
    expect(res.added.map((a) => a.slug)).toEqual(['fresh'])
  })

  it('routes a newly listed EVENT to special, not programs', () => {
    const res = classify({
      curated: { special: [], programs: ['alpha'] },
      discovered: ['alpha', 'tourney'],
      probes: {
        alpha: { ...future, name: 'Alpha', eventType: 'CLASS' },
        tourney: { ...future, name: 'Tourney', eventType: 'EVENT' },
      },
      now: NOW,
    })
    expect(res.next.special).toEqual(['tourney'])
    expect(res.next.programs).not.toContain('tourney')
  })

  it('routes a RETREAT to special', () => {
    const res = classify({
      curated: { special: [], programs: ['alpha'] },
      discovered: ['alpha', 'retreat'],
      probes: {
        alpha: { ...future, name: 'Alpha', eventType: 'CLASS' },
        retreat: { ...future, name: 'Retreat', eventType: 'RETREAT' },
      },
      now: NOW,
    })
    expect(res.next.special).toEqual(['retreat'])
  })

  it('does NOT add a newly listed series with no future instance', () => {
    const res = classify({
      curated: { special: [], programs: ['alpha'] },
      discovered: ['alpha', 'notyet'],
      probes: {
        alpha: { ...future, name: 'Alpha', eventType: 'CLASS' },
        notyet: { ...past, name: 'Not Yet', eventType: 'CLASS' },
      },
      now: NOW,
    })
    expect(res.next.programs).not.toContain('notyet')
    expect(res.added).toEqual([])
  })

  it('never lets a slug land in both buckets', () => {
    const res = classify({
      curated: { special: ['tourney'], programs: ['alpha'] },
      discovered: ['alpha', 'tourney'],
      probes: {
        alpha: { ...future, name: 'Alpha', eventType: 'CLASS' },
        tourney: { ...future, name: 'Tourney', eventType: 'EVENT' },
      },
      now: NOW,
    })
    const overlap = res.next.programs.filter((s) => res.next.special.includes(s))
    expect(overlap).toEqual([])
  })

  it('keeps a curated slug in its own bucket even when eventType disagrees', () => {
    const res = classify({
      curated: { special: [], programs: ['alpha', 'tourney'] },
      discovered: ['alpha', 'tourney'],
      probes: {
        alpha: { ...future, name: 'Alpha', eventType: 'CLASS' },
        tourney: { ...future, name: 'Tourney', eventType: 'EVENT' },
      },
      now: NOW,
    })
    expect(res.next.programs).toContain('tourney')
    expect(res.next.special).not.toContain('tourney')
  })

  it('treats an instance ending exactly at now as still future (orphan boundary)', () => {
    const res = classify({
      curated: { special: [], programs: ['alpha', 'boundary'] },
      discovered: ['alpha'],
      probes: {
        alpha: { ...future, name: 'Alpha', eventType: 'CLASS' },
        boundary: { ok: true, nextEnd: NOW.toISOString(), name: 'Boundary', eventType: 'CLASS' },
      },
      now: NOW,
    })
    expect(verdictFor(res, 'boundary')).toBe('orphan')
  })

  it('reports no change when everything is healthy', () => {
    const res = classify({
      curated: { special: [], programs: ['alpha'] },
      discovered: ['alpha'],
      probes: { alpha: { ...future, name: 'Alpha', eventType: 'CLASS' } },
      now: NOW,
    })
    expect(res.added).toEqual([])
    expect(res.removed).toEqual([])
  })
})

describe('classify — guards', () => {
  it('treats an empty scan as failure, NEVER as remove-everything', () => {
    const res = classify({
      curated: { special: [], programs: ['alpha', 'beta', 'gamma'] },
      discovered: [],
      probes: {
        alpha: { ...past, name: 'Alpha', eventType: 'CLASS' },
        beta: { ...past, name: 'Beta', eventType: 'CLASS' },
        gamma: { ...past, name: 'Gamma', eventType: 'CLASS' },
      },
      now: NOW,
    })
    expect(res.blocked).not.toBeNull()
    expect(res.blocked.guard).toBe('empty-scan')
    expect(res.next).toBeNull()
  })

  it('blocks when the list would shrink by more than half', () => {
    const res = classify({
      curated: { special: [], programs: ['a', 'b', 'c', 'd', 'e', 'f'] },
      discovered: ['a', 'b'],
      probes: {
        a: { ...future, name: 'A', eventType: 'CLASS' },
        b: { ...future, name: 'B', eventType: 'CLASS' },
        c: { ...past, name: 'C', eventType: 'CLASS' },
        d: { ...past, name: 'D', eventType: 'CLASS' },
        e: { ...past, name: 'E', eventType: 'CLASS' },
        f: { ...past, name: 'F', eventType: 'CLASS' },
      },
      now: NOW,
    })
    expect(res.blocked?.guard).toBe('net-shrink')
    expect(res.next).toBeNull()
  })

  it('ALLOWS a full rotation — the real 2026-09-15 event', () => {
    // 5 of 6 died and 5 new ones appeared. Net size holds at 6: heal it.
    const curated = { special: [], programs: ['old1', 'old2', 'old3', 'old4', 'old5', 'keep'] }
    const discovered = ['keep', 'new1', 'new2', 'new3', 'new4', 'new5']
    const probes = { keep: { ...future, name: 'Keep', eventType: 'CLASS' } }
    for (const s of ['old1', 'old2', 'old3', 'old4', 'old5']) {
      probes[s] = { ...past, name: s, eventType: 'CLASS' }
    }
    for (const s of ['new1', 'new2', 'new3', 'new4', 'new5']) {
      probes[s] = { ...future, name: s, eventType: 'CLASS' }
    }
    const res = classify({ curated, discovered, probes, now: NOW })
    expect(res.blocked).toBeNull()
    expect(res.next.programs).toHaveLength(6)
    expect(res.removed).toHaveLength(5)
    expect(res.added).toHaveLength(5)
  })

  it('blocks the same rotation when the replacements are withheld', () => {
    const curated = { special: [], programs: ['old1', 'old2', 'old3', 'old4', 'old5', 'keep'] }
    const probes = { keep: { ...future, name: 'Keep', eventType: 'CLASS' } }
    for (const s of ['old1', 'old2', 'old3', 'old4', 'old5']) {
      probes[s] = { ...past, name: s, eventType: 'CLASS' }
    }
    const res = classify({ curated, discovered: ['keep'], probes, now: NOW })
    expect(res.blocked?.guard).toBe('net-shrink')
  })

  it('allows shrinking from a small list without tripping the ratio', () => {
    const res = classify({
      curated: { special: [], programs: ['a', 'b'] },
      discovered: ['a'],
      probes: {
        a: { ...future, name: 'A', eventType: 'CLASS' },
        b: { ...past, name: 'B', eventType: 'CLASS' },
      },
      now: NOW,
    })
    expect(res.blocked).toBeNull()
    expect(res.next.programs).toEqual(['a'])
  })

  it('does not trip either guard when nothing changes', () => {
    const res = classify({
      curated: { special: [], programs: ['a'] },
      discovered: ['a'],
      probes: { a: { ...future, name: 'A', eventType: 'CLASS' } },
      now: NOW,
    })
    expect(res.blocked).toBeNull()
  })
})
