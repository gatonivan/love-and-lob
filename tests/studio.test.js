import { describe, it, expect } from 'vitest'
import { human } from '../api/studio.js'

// The studio page's audience is one non-technical person: a slug must never
// render on screen. classify()/probeSlug() fall back to the raw slug (or
// leave the name blank) when Sweatpals has no name for an event — most
// commonly on a `removed` item, whose probe frequently failed outright. This
// pins the boundary fix in api/studio.ts that strips that fallback before it
// crosses the wire to the page.
describe('human', () => {
  it('nulls the name when it fell back to the slug', () => {
    const item = { slug: 'll-early-morning-sessions-5d58d2', name: 'll-early-morning-sessions-5d58d2', bucket: 'programs' }
    expect(human(item)).toEqual({ slug: item.slug, name: null, bucket: 'programs' })
  })

  it('nulls an empty-string name', () => {
    const item = { slug: 'some-slug', name: '', bucket: 'special' }
    expect(human(item).name).toBeNull()
  })

  it('keeps a real, human name untouched', () => {
    const item = { slug: 'drill-play-greenpoint', name: 'Drill & Play (Greenpoint)', bucket: 'programs' }
    expect(human(item)).toEqual(item)
  })

  it('never returns a payload where name equals slug', () => {
    const items = [
      { slug: 'a', name: 'a', bucket: 'programs' },
      { slug: 'b', name: '', bucket: 'programs' },
      { slug: 'c', name: 'Cardio Tennis', bucket: 'programs' },
    ]
    for (const mapped of items.map(human)) {
      expect(mapped.name).not.toBe(mapped.slug)
    }
  })
})
