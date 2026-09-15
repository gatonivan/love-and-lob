# Schedule Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `/schedule` program list heal itself when Sweatpals rotates a series under a new alias, and give Khari a phone-friendly `/studio` page to force that fix on demand.

**Architecture:** One pure classifier (`api/_reconcile.js`) decides what to add and remove, guarded so a Sweatpals outage can never empty the schedule. A GitHub Action runs it every 3 days, regenerates `api/schedule-slugs.js`, commits, and emails a summary; Vercel redeploys from `main`. `/studio` scans read-only and, on Apply, fires `workflow_dispatch` at that same Action — one write path, no long-lived token.

**Tech Stack:** Node 20 ESM, Vercel serverless (`@vercel/node`), React 19 + react-router 7, vitest (new), GitHub Actions, Brevo transactional email.

**Spec:** `docs/superpowers/specs/2026-09-15-schedule-studio-design.md`

## Global Constraints

- **ESM only.** `package.json` has `"type": "module"`. No `require()`, no `.cjs`.
- **Node 20** in CI (matches the runtime Vercel uses).
- **pnpm** is the package manager. Never `npm install`.
- **Conventional commits**, imperative mood, subject under 72 chars, **no AI attribution footers**.
- **Never `git add .` or `git add -A`.** Stage explicit paths only — the working tree carries untracked local assets that must not be committed (`src/assets/invitational/`, `src/assets/community/*.mov`, `src/assets/desktop/`).
- **Plain CSS**, co-located with the component. Must include a `480px` breakpoint.
- **Colors:** background `#0a0a0a`, text `#F1F0E2`, accent `#d8e84d`.
- **Never reintroduce scraping as a live data source.** The host-page scan is permitted *only* inside the reconcile job, never on a pageload path.
- `classify()` must stay **pure** — no `fetch`, no `Date.now()`; time enters as the `now` parameter.

---

## File Structure

| File | Responsibility |
|---|---|
| `api/schedule-slugs.js` | **Create.** Generated data module: two arrays + timestamp. Nothing else. |
| `api/_slugfile.js` | **Create.** `renderSlugsFile()` — turns a changeset into the text of the file above. |
| `api/_reconcile.js` | **Create.** Pure classifier + guards. The only place retirement policy lives. |
| `api/_sweatpals.js` | **Modify.** Re-export slugs from `schedule-slugs.js`; add `scanHostAliases()` / `probeSlug()`. |
| `api/_notify.js` | **Create.** Brevo email helper. |
| `api/studio.ts` | **Create.** Auth + `scan` / `apply` endpoint. |
| `scripts/reconcile-slugs.mjs` | **Create.** Cron entry: fetch → classify → write → commit → email. |
| `.github/workflows/reconcile-schedule.yml` | **Create.** Every 3 days + `workflow_dispatch`. |
| `src/components/ui/StudioPage.tsx` / `.css` | **Create.** Mobile-first debug page. |
| `src/App.tsx`, `src/App.css`, `CLAUDE.md` | **Modify.** Route, allowlists, documented exemption. |
| `tests/reconcile.test.js`, `tests/slugfile.test.js` | **Create.** vitest. |

---

## Task 1: vitest + extract the slug lists

**Files:**
- Create: `api/schedule-slugs.js`
- Modify: `api/_sweatpals.js` (lines 19–58, the two exported arrays)
- Modify: `vite.config.ts`, `package.json`
- Test: `tests/slugs.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `api/schedule-slugs.js` exporting `SPECIAL_EVENT_SLUGS: string[]`, `PROGRAM_SLUGS: string[]`, `UPDATED_AT: string`. `api/_sweatpals.js` re-exports both array names unchanged, so `fetchScheduleData()` and `scripts/fetch-events.js` keep working untouched.

- [ ] **Step 1: Install vitest**

```bash
pnpm add -D vitest@^3
```

- [ ] **Step 2: Add the test config and script**

In `vite.config.ts`, add a `test` block inside `defineConfig({...})` (alongside `base`, `plugins`, `build`):

```ts
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
```

In `package.json` `scripts`, add:

```json
    "test": "vitest run",
```

- [ ] **Step 3: Write the failing test**

Create `tests/slugs.test.js`:

```js
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
```

- [ ] **Step 4: Run it and watch it fail**

Run: `pnpm test`
Expected: FAIL — `Failed to resolve import "../api/schedule-slugs.js"`.

- [ ] **Step 5: Create the generated data module**

Create `api/schedule-slugs.js` with the values currently live in `_sweatpals.js`:

```js
// AUTO-GENERATED by the schedule reconcile job (scripts/reconcile-slugs.mjs).
// Safe to hand-edit in a pinch — keep the shape identical, the job rewrites
// the whole file from a template and never parses what is already here.
//
// SPECIAL_EVENT_SLUGS -> the featured card (tournaments, retreats).
// PROGRAM_SLUGS       -> the "Upcoming" list (weekly clinics and classes).
// The two must stay disjoint or an event renders twice.

export const SPECIAL_EVENT_SLUGS = []

export const PROGRAM_SLUGS = [
  "absolute-beginner-clinic-greenpoint",
  "beginner-clinic-brooklyn-college",
  "intermediate-clinic-brooklyn-college",
  "drill-play-greenpoint",
  "kids-clinic-ages-58-greenpoint",
  "ll-early-morning-sessions-5d58d2"
]

export const UPDATED_AT = "2026-09-15T00:00:00.000Z"
```

- [ ] **Step 6: Re-export from `_sweatpals.js`**

In `api/_sweatpals.js`, delete the two `export const SPECIAL_EVENT_SLUGS = [...]` and `export const PROGRAM_SLUGS = [...]` blocks **and their long comment blocks** (roughly lines 19–58), and replace with:

```js
// The curated lists live in their own module so the reconcile job can rewrite
// them wholesale without touching this file's logic. See schedule-slugs.js.
export { SPECIAL_EVENT_SLUGS, PROGRAM_SLUGS, UPDATED_AT } from './schedule-slugs.js'
import { SPECIAL_EVENT_SLUGS } from './schedule-slugs.js'
```

> The bare `import` is needed because `fetchScheduleEvents()` uses
> `SPECIAL_EVENT_SLUGS` as a default parameter; `export ... from` does not
> bind the name locally.

- [ ] **Step 7: Run the tests and the real fetch**

Run: `pnpm test`
Expected: PASS, 4 tests.

Run: `node scripts/fetch-events.js`
Expected: `[fetch-events] Featured: none | 6 upcoming clinics` — identical to before the refactor.

Run: `pnpm build`
Expected: `✓ built`.

- [ ] **Step 8: Commit**

```bash
git add api/schedule-slugs.js api/_sweatpals.js tests/slugs.test.js vite.config.ts package.json pnpm-lock.yaml
git commit -m "refactor(schedule): move curated slugs to their own module"
```

---

## Task 2: `renderSlugsFile()`

**Files:**
- Create: `api/_slugfile.js`
- Test: `tests/slugfile.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `renderSlugsFile({ special: string[], programs: string[], updatedAt: string }) => string` — the complete text of `api/schedule-slugs.js`.

- [ ] **Step 1: Write the failing test**

Create `tests/slugfile.test.js`:

```js
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
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm test tests/slugfile.test.js`
Expected: FAIL — cannot resolve `../api/_slugfile.js`.

- [ ] **Step 3: Implement**

Create `api/_slugfile.js`:

```js
/**
 * Renders the complete text of api/schedule-slugs.js.
 *
 * The reconcile job replaces that file WHOLESALE with this output — it never
 * parses, patches or regexes the existing file. That is the property that
 * makes an automated commit safe: the only way to produce a broken module is
 * to break this template, which the round-trip test guards.
 *
 * Slugs go through JSON.stringify, so a hostile alias becomes a string
 * literal rather than executable code.
 */
export function renderSlugsFile({ special, programs, updatedAt }) {
  const list = (arr) =>
    arr.length === 0 ? '[]' : `[\n${arr.map((s) => `  ${JSON.stringify(s)}`).join(',\n')}\n]`

  return `// AUTO-GENERATED by the schedule reconcile job (scripts/reconcile-slugs.mjs).
// Safe to hand-edit in a pinch — keep the shape identical, the job rewrites
// the whole file from a template and never parses what is already here.
//
// SPECIAL_EVENT_SLUGS -> the featured card (tournaments, retreats).
// PROGRAM_SLUGS       -> the "Upcoming" list (weekly clinics and classes).
// The two must stay disjoint or an event renders twice.

export const SPECIAL_EVENT_SLUGS = ${list(special)}

export const PROGRAM_SLUGS = ${list(programs)}

export const UPDATED_AT = ${JSON.stringify(updatedAt)}
`
}
```

- [ ] **Step 4: Run and verify pass**

Run: `pnpm test tests/slugfile.test.js`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add api/_slugfile.js tests/slugfile.test.js
git commit -m "feat(schedule): add slug file renderer"
```

---

## Task 3: `classify()` — the verdicts

**Files:**
- Create: `api/_reconcile.js`
- Test: `tests/reconcile.test.js`

**Interfaces:**
- Consumes: nothing (pure).
- Produces:

```
classify({ curated, discovered, probes, now }) => {
  verdicts: Array<{ slug, name, bucket, verdict }>,
  added:    Array<{ slug, name, bucket }>,
  removed:  Array<{ slug, name, bucket }>,
  next:     { special: string[], programs: string[] } | null,
  blocked:  { guard: string, reason: string } | null,
}
```

- `curated` — `{ special: string[], programs: string[] }`
- `discovered` — `string[]`, aliases scraped from the host page
- `probes` — plain object keyed by slug: `{ ok: boolean, name?: string, eventType?: string, nextEnd?: string }`
- `now` — `Date`
- `bucket` — `'special' | 'programs'`
- `verdict` — `'healthy' | 'dead' | 'new' | 'quiet' | 'orphan'`

`next` and `blocked` are mutually exclusive: when a guard trips, `next === null`. Guards land in Task 4; this task always returns a non-null `next`.

- [ ] **Step 1: Write the failing test**

Create `tests/reconcile.test.js`:

```js
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
```

- [ ] **Step 2: Run and watch it fail**

Run: `pnpm test tests/reconcile.test.js`
Expected: FAIL — cannot resolve `../api/_reconcile.js`.

- [ ] **Step 3: Implement**

Create `api/_reconcile.js`:

```js
/**
 * Pure drift classifier for the curated Sweatpals slug lists.
 *
 * This encodes the retirement rule that has lived in a comment since
 * 2026-08-20: a slug is retired only when it is BOTH delisted from the host
 * page AND out of future instances. Either condition alone is normal — a
 * listed series with no upcoming date is simply between publishes, and a
 * delisted series with future dates is still going to happen.
 *
 * Deliberately free of I/O: callers fetch, this decides. That is what makes
 * the highest-stakes logic in the repo cheap to test.
 */

const SPECIAL_TYPES = new Set(['EVENT', 'RETREAT'])

function hasFuture(probe, now) {
  if (!probe || !probe.ok || !probe.nextEnd) return false
  const end = Date.parse(probe.nextEnd)
  return !Number.isNaN(end) && end >= now.getTime()
}

function bucketFor(probe) {
  return SPECIAL_TYPES.has(probe?.eventType) ? 'special' : 'programs'
}

export function classify({ curated, discovered, probes, now }) {
  const listed = new Set(discovered)
  const curatedAll = [...curated.special, ...curated.programs]
  const verdicts = []
  const removed = []
  const added = []

  const next = { special: [], programs: [] }
  const place = (slug, bucket) => {
    if (next.special.includes(slug) || next.programs.includes(slug)) return
    next[bucket].push(slug)
  }

  for (const slug of curatedAll) {
    const probe = probes[slug]
    const wasSpecial = curated.special.includes(slug)
    const future = hasFuture(probe, now)
    const onPage = listed.has(slug)
    const name = probe?.name || slug
    // Keep a slug in the bucket it was curated into; a live series does not
    // change type, and re-bucketing on every run would thrash the file.
    const bucket = wasSpecial ? 'special' : 'programs'

    let verdict
    if (onPage && future) verdict = 'healthy'
    else if (onPage && !future) verdict = 'quiet'
    else if (!onPage && future) verdict = 'orphan'
    else verdict = 'dead'

    verdicts.push({ slug, name, bucket, verdict })

    if (verdict === 'dead') removed.push({ slug, name, bucket })
    else place(slug, bucket)
  }

  for (const slug of discovered) {
    if (curatedAll.includes(slug)) continue
    const probe = probes[slug]
    if (!hasFuture(probe, now)) continue
    const bucket = bucketFor(probe)
    const name = probe?.name || slug
    verdicts.push({ slug, name, bucket, verdict: 'new' })
    added.push({ slug, name, bucket })
    place(slug, bucket)
  }

  return { verdicts, added, removed, next, blocked: null }
}
```

- [ ] **Step 4: Run and verify pass**

Run: `pnpm test tests/reconcile.test.js`
Expected: PASS, 11 tests.

- [ ] **Step 5: Commit**

```bash
git add api/_reconcile.js tests/reconcile.test.js
git commit -m "feat(schedule): add pure slug drift classifier"
```

---

## Task 4: The guards

**Files:**
- Modify: `api/_reconcile.js`
- Test: `tests/reconcile.test.js` (append a second `describe`)

**Interfaces:**
- Consumes: `classify()` from Task 3.
- Produces: same signature; `blocked` becomes `{ guard, reason }` and `next` becomes `null` when a guard trips. `guard` is one of `'empty-scan'`, `'net-shrink'`.

> **Guard 2 guards NET size, not gross removals.** The real 2026-09-15 event was
> 5 of 6 programs dying while 5 new ones appeared — a rotation, net size held at
> 6. A gross-removal guard would have blocked the exact scenario this project
> exists to fix. Do not "simplify" this to count removals.

- [ ] **Step 1: Write the failing tests**

Append to `tests/reconcile.test.js`:

```js
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
```

- [ ] **Step 2: Run and watch the guard tests fail**

Run: `pnpm test tests/reconcile.test.js`
Expected: FAIL — `res.blocked` is `null` where a guard was expected.

- [ ] **Step 3: Implement the guards**

In `api/_reconcile.js`, add this constant near the top:

```js
// Below this the shrink ratio is meaningless — losing 1 of 2 is not a signal.
const MIN_LIST_FOR_RATIO_GUARD = 4
```

Then, immediately after `export function classify({ curated, discovered, probes, now }) {`, insert the empty-scan guard before any other work:

```js
  // GUARD 1: a scan that found nothing means Sweatpals is down or changed its
  // markup — NOT that every program was cancelled. Without this, one outage
  // empties the schedule.
  if (!discovered || discovered.length === 0) {
    return {
      verdicts: [],
      added: [],
      removed: [],
      next: null,
      blocked: {
        guard: 'empty-scan',
        reason: 'Host page scan returned no aliases; treating as a scan failure.',
      },
    }
  }
```

And replace the final `return { verdicts, added, removed, next, blocked: null }` with:

```js
  // GUARD 2: net size, not gross removals. A rotation (5 die, 5 born) is
  // healthy churn and must auto-apply; a collapse (5 die, 0 born) must not.
  const before = curatedAll.length
  const after = next.special.length + next.programs.length
  if (before >= MIN_LIST_FOR_RATIO_GUARD && after * 2 < before) {
    return {
      verdicts,
      added,
      removed,
      next: null,
      blocked: {
        guard: 'net-shrink',
        reason: `List would shrink from ${before} to ${after}; refusing to apply without review.`,
      },
    }
  }

  return { verdicts, added, removed, next, blocked: null }
```

- [ ] **Step 4: Run the full suite**

Run: `pnpm test`
Expected: PASS — 11 verdict tests + 6 guard tests + Tasks 1–2 tests.

- [ ] **Step 5: Commit**

```bash
git add api/_reconcile.js tests/reconcile.test.js
git commit -m "feat(schedule): guard the reconcile against outages and collapse"
```

---

## Task 5: Host scan + slug probe

**Files:**
- Modify: `api/_sweatpals.js`
- Test: `tests/scan.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces, both exported from `api/_sweatpals.js`:
  - `scanHostAliases(html: string) => string[]` — deduped, order preserved.
  - `probeSlug(slug: string) => Promise<{ ok, name?, eventType?, nextEnd? }>`
  - `HOST_PAGE_URL` — `'https://sweatpals.com/loveandlob'`

- [ ] **Step 1: Write the failing test**

Create `tests/scan.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { scanHostAliases } from '../api/_sweatpals.js'

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
```

- [ ] **Step 2: Run and watch it fail**

Run: `pnpm test tests/scan.test.js`
Expected: FAIL — `scanHostAliases is not a function`.

- [ ] **Step 3: Implement**

Append to `api/_sweatpals.js`:

```js
export const HOST_PAGE_URL = 'https://sweatpals.com/loveandlob'

// Slugs are lowercase alphanumerics and hyphens. Anything else in an `alias`
// field is not a slug we can fetch, so it is ignored rather than trusted.
const ALIAS_RE = /"alias":"([a-z0-9-]+)"/g

/**
 * Extract event aliases from the host page's embedded JSON.
 *
 * This is the one scrape in the codebase and it is deliberately confined to
 * the reconcile job — never a pageload path. It only ever *proposes* changes
 * that guards and a commit record keep honest, so when Sweatpals restructures
 * their markup the result is a failure email, not a wrong schedule.
 */
export function scanHostAliases(html) {
  if (!html) return []
  const seen = new Set()
  for (const m of String(html).matchAll(ALIAS_RE)) seen.add(m[1])
  return [...seen]
}

/**
 * Fetch one slug and reduce it to just what the classifier needs. Any failure
 * is reported as `{ ok: false }` rather than thrown — a dead slug is expected
 * input, not an error.
 */
export async function probeSlug(slug) {
  try {
    const ev = await fetchEventBySlug(slug)
    if (!ev) return { ok: false }
    return {
      ok: true,
      name: (ev.name || '').trim() || slug,
      eventType: ev.eventType,
      nextEnd: nextEnd(ev),
    }
  } catch {
    return { ok: false }
  }
}
```

- [ ] **Step 4: Run and verify pass**

Run: `pnpm test tests/scan.test.js`
Expected: PASS, 5 tests.

- [ ] **Step 5: Smoke-test against the real host page**

```bash
node -e "
import('./api/_sweatpals.js').then(async (m) => {
  const html = await fetch(m.HOST_PAGE_URL).then(r => r.text())
  const aliases = m.scanHostAliases(html)
  console.log('aliases:', aliases)
  console.log('probe:', await m.probeSlug(aliases[0]))
})"
```

Expected: a non-empty alias array and a probe with `ok: true`. **If the array is empty, stop — the markup changed and `ALIAS_RE` needs updating before continuing.**

- [ ] **Step 6: Commit**

```bash
git add api/_sweatpals.js tests/scan.test.js
git commit -m "feat(schedule): add host alias scan and slug probe"
```

---

## Task 6: Brevo notifier

**Files:**
- Create: `api/_notify.js`
- Test: `tests/notify.test.js`

**Interfaces:**
- Consumes: `classify()` result shape from Tasks 3–4.
- Produces:
  - `formatReport({ added, removed, blocked, scanOk }) => { subject: string, text: string }`
  - `sendReport(report, { apiKey, to }) => Promise<boolean>`

- [ ] **Step 1: Write the failing test**

Create `tests/notify.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { formatReport } from '../api/_notify.js'

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
})
```

- [ ] **Step 2: Run and watch it fail**

Run: `pnpm test tests/notify.test.js`
Expected: FAIL — cannot resolve `../api/_notify.js`.

- [ ] **Step 3: Implement**

Create `api/_notify.js`:

```js
const STUDIO_URL = 'https://www.loveandlob.co/studio'

/**
 * Turn a reconcile outcome into an email a human wants to read. Event NAMES
 * only — the whole point of this system is that nobody has to think about
 * slugs.
 */
export function formatReport({ added, removed, blocked, scanOk }) {
  if (!scanOk) {
    return {
      subject: 'Schedule: could not read Sweatpals',
      text: [
        'The reconcile job could not read the Sweatpals host page.',
        '',
        'The site is still serving the last known-good program list, so nothing',
        'is broken right now — but it will go stale if this keeps failing.',
        'Most likely Sweatpals changed their page structure.',
        '',
        `Check ${STUDIO_URL}`,
      ].join('\n'),
    }
  }

  if (blocked) {
    return {
      subject: 'Schedule: a change needs a look before it goes live',
      text: [
        'The reconcile job found a change big enough that it stopped rather',
        'than applying it automatically.',
        '',
        blocked.reason,
        '',
        `Review and apply it here: ${STUDIO_URL}`,
      ].join('\n'),
    }
  }

  const lines = ['The schedule was updated automatically.', '']
  if (added.length) {
    lines.push('Added:')
    for (const a of added) lines.push(`  + ${a.name}`)
    lines.push('')
  }
  if (removed.length) {
    lines.push('Removed (gone from Sweatpals and out of dates):')
    for (const r of removed) lines.push(`  - ${r.name}`)
    lines.push('')
  }
  lines.push('This is live on loveandlob.co/schedule within a couple of minutes.')

  return { subject: 'Schedule updated automatically', text: lines.join('\n') }
}

/**
 * Send via Brevo, reusing the key already used by api/subscribe.ts. Returns
 * false rather than throwing: a failed notification must never fail the job
 * that already committed a good change.
 */
export async function sendReport(report, { apiKey, to }) {
  if (!apiKey || !to?.length) return false
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: 'Love & Lob Schedule', email: 'info@loveandlob.co' },
        to: to.map((email) => ({ email })),
        subject: report.subject,
        textContent: report.text,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}
```

- [ ] **Step 4: Run and verify pass**

Run: `pnpm test tests/notify.test.js`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add api/_notify.js tests/notify.test.js
git commit -m "feat(schedule): add reconcile report formatting and delivery"
```

---

## Task 7: The reconcile script

**Files:**
- Create: `scripts/reconcile-slugs.mjs`
- Modify: `package.json` (add a `reconcile` script)

**Interfaces:**
- Consumes: `classify()`, `scanHostAliases()`, `probeSlug()`, `HOST_PAGE_URL`, `renderSlugsFile()`, `formatReport()`, `sendReport()`.
- Produces: a CLI. `--dry-run` prints the plan and writes nothing. Exit 0 = healthy (changed or not), exit 1 = scan failure or tripped guard.

- [ ] **Step 1: Write the script**

Create `scripts/reconcile-slugs.mjs`:

```js
#!/usr/bin/env node
/**
 * Reconcile the curated Sweatpals slug lists with what the host page actually
 * lists, and commit the result.
 *
 * Run by .github/workflows/reconcile-schedule.yml every 3 days, and on demand
 * when /studio fires a workflow_dispatch. Safe to run locally with --dry-run.
 */
import { writeFileSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { HOST_PAGE_URL, scanHostAliases, probeSlug } from '../api/_sweatpals.js'
import { SPECIAL_EVENT_SLUGS, PROGRAM_SLUGS } from '../api/schedule-slugs.js'
import { classify } from '../api/_reconcile.js'
import { renderSlugsFile } from '../api/_slugfile.js'
import { formatReport, sendReport } from '../api/_notify.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TARGET = join(ROOT, 'api', 'schedule-slugs.js')
const DRY = process.argv.includes('--dry-run')

const recipients = (process.env.RECONCILE_NOTIFY_TO || '')
  .split(',').map((s) => s.trim()).filter(Boolean)

async function notify(payload) {
  const report = formatReport(payload)
  console.log(`\n--- ${report.subject} ---\n${report.text}\n`)
  if (!DRY) await sendReport(report, { apiKey: process.env.BREVO_API_KEY, to: recipients })
}

async function main() {
  let html = ''
  try {
    const res = await fetch(HOST_PAGE_URL)
    if (res.ok) html = await res.text()
  } catch (err) {
    console.error('[reconcile] host fetch failed:', String(err))
  }

  const discovered = scanHostAliases(html)
  console.log(`[reconcile] host page lists ${discovered.length} aliases`)

  const curated = { special: SPECIAL_EVENT_SLUGS, programs: PROGRAM_SLUGS }
  const all = [...new Set([...curated.special, ...curated.programs, ...discovered])]
  const probes = Object.fromEntries(
    await Promise.all(all.map(async (s) => [s, await probeSlug(s)])),
  )

  const result = classify({ curated, discovered, probes, now: new Date() })

  if (result.blocked) {
    console.error(`[reconcile] BLOCKED (${result.blocked.guard}): ${result.blocked.reason}`)
    await notify({
      added: result.added,
      removed: result.removed,
      blocked: result.blocked,
      scanOk: result.blocked.guard !== 'empty-scan',
    })
    process.exit(1)
  }

  if (!result.added.length && !result.removed.length) {
    console.log('[reconcile] no changes')
    return
  }

  for (const a of result.added) console.log(`  + ${a.name}`)
  for (const r of result.removed) console.log(`  - ${r.name}`)

  const text = renderSlugsFile({
    special: result.next.special,
    programs: result.next.programs,
    updatedAt: new Date().toISOString(),
  })

  if (DRY) {
    console.log('\n[reconcile] --dry-run, not writing\n')
    console.log(text)
    return
  }

  if (readFileSync(TARGET, 'utf8') === text) {
    console.log('[reconcile] file already current')
    return
  }
  writeFileSync(TARGET, text)

  const summary = [
    result.added.length ? `+${result.added.length}` : null,
    result.removed.length ? `-${result.removed.length}` : null,
  ].filter(Boolean).join(' ')

  const body = [
    ...result.added.map((a) => `Added: ${a.name}`),
    ...result.removed.map((r) => `Removed: ${r.name}`),
  ].join('\n')

  const git = (...args) => execFileSync('git', args, { cwd: ROOT, stdio: 'inherit' })
  git('config', 'user.name', 'love-and-lob-bot')
  git('config', 'user.email', 'info@loveandlob.co')
  git('add', 'api/schedule-slugs.js')
  git('commit', '-m', `chore(schedule): sync Sweatpals programs (${summary})`, '-m', body)
  git('push')

  await notify({ added: result.added, removed: result.removed, blocked: null, scanOk: true })
}

main().catch((err) => {
  console.error('[reconcile] fatal:', err)
  process.exit(1)
})
```

- [ ] **Step 2: Add the npm script**

In `package.json` `scripts`:

```json
    "reconcile": "node scripts/reconcile-slugs.mjs",
```

- [ ] **Step 3: Verify dry-run against live Sweatpals**

Run: `node scripts/reconcile-slugs.mjs --dry-run`
Expected: prints the alias count, then either `[reconcile] no changes` or a `+`/`-` list followed by the rendered file. **Nothing is written and no commit is made.** Confirm with `git status` that `api/schedule-slugs.js` is unmodified.

- [ ] **Step 4: Commit**

```bash
git add scripts/reconcile-slugs.mjs package.json
git commit -m "feat(schedule): add the slug reconcile job"
```

---

## Task 8: The GitHub Action

**Files:**
- Create: `.github/workflows/reconcile-schedule.yml`

**Interfaces:**
- Consumes: `pnpm reconcile` from Task 7.
- Produces: a workflow named `reconcile-schedule.yml` with a `workflow_dispatch` trigger — Task 9's `apply` targets this exact filename.

Repo secrets required (Settings → Secrets → Actions): `BREVO_API_KEY`, `RECONCILE_NOTIFY_TO` (comma-separated emails).

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/reconcile-schedule.yml`:

```yaml
name: Reconcile schedule slugs

on:
  schedule:
    # Every ~3 days at 09:00 UTC. GitHub resets */3 at month boundaries, so the
    # gap can be 1-3 days around the 1st. Harmless here, documented so it is
    # not mistaken for a bug.
    - cron: '0 9 */3 * *'
  workflow_dispatch:

# Serialize: two runs committing to main at once would conflict.
concurrency:
  group: reconcile-schedule
  cancel-in-progress: false

permissions:
  contents: write

jobs:
  reconcile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      # Guard the guards: if the classifier is broken, do not let it commit.
      - name: Run tests
        run: pnpm test

      - name: Reconcile
        run: pnpm reconcile
        env:
          BREVO_API_KEY: ${{ secrets.BREVO_API_KEY }}
          RECONCILE_NOTIFY_TO: ${{ secrets.RECONCILE_NOTIFY_TO }}
```

- [ ] **Step 2: Commit and push**

```bash
git add .github/workflows/reconcile-schedule.yml
git commit -m "ci: run the schedule reconcile every three days"
git push origin main
```

- [ ] **Step 3: Trigger it manually and verify**

```bash
gh workflow run reconcile-schedule.yml
sleep 45 && gh run list --workflow=reconcile-schedule.yml --limit 1
```

Expected: the run completes. With no drift it logs `[reconcile] no changes` and makes no commit. Confirm with `git log origin/main -1` that nothing unexpected landed.

---

## Task 9: The studio endpoint

**Files:**
- Create: `api/studio.ts`

**Interfaces:**
- Consumes: `classify()`, `scanHostAliases()`, `probeSlug()`, `HOST_PAGE_URL`, `SPECIAL_EVENT_SLUGS`, `PROGRAM_SLUGS`.
- Produces: `POST /api/studio`, header `x-studio-key`.
  - `{action:'scan'}` → `200 { verdicts, added, removed, blocked, scanOk }`
  - `{action:'apply'}` → `202 { dispatched: true }`
  - `401` on bad key, `405` on non-POST, `400` on unknown action.

Vercel env vars required: `STUDIO_PASSPHRASE`, `GH_DISPATCH_TOKEN` (fine-grained
PAT, this repo only, **Actions: read and write — grant nothing else, especially
not Contents**). A dispatch-only token can start the guarded workflow but cannot
write to the repo.

> `apply` deliberately does not compute or send a changeset — it fires the
> Action, which re-scans. A stale browser tab therefore cannot apply stale
> conclusions, and there is exactly one code path that writes the file.

- [ ] **Step 1: Implement**

Create `api/studio.ts`:

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { timingSafeEqual } from 'node:crypto'
import { HOST_PAGE_URL, scanHostAliases, probeSlug } from './_sweatpals.js'
import { SPECIAL_EVENT_SLUGS, PROGRAM_SLUGS } from './schedule-slugs.js'
import { classify } from './_reconcile.js'

const REPO = 'gatonivan/love-and-lob'
const WORKFLOW = 'reconcile-schedule.yml'

function authorized(req: VercelRequest): boolean {
  const expected = process.env.STUDIO_PASSPHRASE
  const given = req.headers['x-studio-key']
  if (!expected || typeof given !== 'string') return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  // Compare lengths separately: timingSafeEqual throws on a length mismatch.
  return a.length === b.length && timingSafeEqual(a, b)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!authorized(req)) return res.status(401).json({ error: 'Not authorized' })

  const action = (req.body || {}).action

  if (action === 'scan') {
    let html = ''
    try {
      const r = await fetch(HOST_PAGE_URL)
      if (r.ok) html = await r.text()
    } catch {
      /* fall through to an empty scan, which guard 1 reports as a failure */
    }
    const discovered = scanHostAliases(html)
    const curated = { special: SPECIAL_EVENT_SLUGS, programs: PROGRAM_SLUGS }
    const all = [...new Set([...curated.special, ...curated.programs, ...discovered])]
    const probes = Object.fromEntries(
      await Promise.all(all.map(async (s) => [s, await probeSlug(s)])),
    )
    const result = classify({ curated, discovered, probes, now: new Date() })
    return res.status(200).json({
      verdicts: result.verdicts,
      added: result.added,
      removed: result.removed,
      blocked: result.blocked,
      scanOk: discovered.length > 0,
    })
  }

  if (action === 'apply') {
    const token = process.env.GH_DISPATCH_TOKEN
    if (!token) return res.status(500).json({ error: 'Server misconfigured' })
    const r = await fetch(
      `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
      {
        method: 'POST',
        headers: {
          accept: 'application/vnd.github+json',
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ ref: 'main' }),
      },
    )
    if (!r.ok) {
      return res.status(502).json({ error: 'Could not start the update', status: r.status })
    }
    return res.status(202).json({ dispatched: true })
  }

  return res.status(400).json({ error: 'Unknown action' })
}
```

- [ ] **Step 2: Make `api/` actually type-checked, then type-check**

`pnpm build` runs `tsc -b`, but **`api/` is in no tsconfig** — `tsconfig.app.json`
includes only `src`, `tsconfig.node.json` only `vite.config.ts`. Today a type
error in `api/studio.ts` would sail past the build and surface at deploy time.
Fix that before relying on the check.

Create `tsconfig.api.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowJs": true,
    "checkJs": false,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["api"]
}
```

Add it to the root `tsconfig.json` references:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.api.json" }
  ]
}
```

> `allowJs` with `checkJs: false` lets the `.ts` handlers import the `.js`
> modules without type-checking their bodies — the `.js` files are covered by
> vitest instead.

Run: `pnpm build`
Expected: `✓ built`, no TypeScript errors.

Sanity-check that the new project is really being compiled by breaking it on
purpose: add `const x: number = 'oops'` to `api/studio.ts`, run `pnpm build`,
confirm it **fails**, then remove the line and confirm it passes again. A
type-check that cannot fail is not a type-check.

- [ ] **Step 3: Commit and push, then set the env vars**

```bash
git add api/studio.ts tsconfig.api.json tsconfig.json
git commit -m "feat(studio): add the scan and apply endpoint"
git push origin main
```

Then in the Vercel dashboard add `STUDIO_PASSPHRASE` and `GH_DISPATCH_TOKEN` and redeploy.

- [ ] **Step 4: Verify auth against the deployed function**

```bash
curl -s -o /dev/null -w "no key   -> %{http_code}\n" -X POST https://www.loveandlob.co/api/studio \
  -H 'content-type: application/json' -d '{"action":"scan"}'
curl -s -o /dev/null -w "bad key  -> %{http_code}\n" -X POST https://www.loveandlob.co/api/studio \
  -H 'content-type: application/json' -H 'x-studio-key: wrong' -d '{"action":"scan"}'
curl -s -X POST https://www.loveandlob.co/api/studio \
  -H 'content-type: application/json' -H "x-studio-key: $STUDIO_PASSPHRASE" \
  -d '{"action":"scan"}' | head -c 300
```

Expected: `401`, `401`, then JSON with `verdicts`. **Do not proceed if an unauthenticated call returns 200.**

---

## Task 10: The studio page

**Files:**
- Create: `src/components/ui/StudioPage.tsx`, `src/components/ui/StudioPage.css`
- Modify: `src/App.tsx` (import + route), `src/App.css` (both allowlists), `CLAUDE.md`

**Interfaces:**
- Consumes: `POST /api/studio` from Task 9.
- Produces: the `/studio` route.

> **Documented exemption.** Every other page is a persistent canvas overlay.
> `/studio` is a plain route that covers the canvas, because it is a back-office
> tool: Khari should not wait on a camera transition, and it has no business
> pulling the Three.js bundle. `CLAUDE.md` gets the exemption written down in
> Step 5 so the rule is not left silently contradicted.

- [ ] **Step 1: Build the page**

Create `src/components/ui/StudioPage.tsx`:

```tsx
import { useState, useEffect, useCallback } from 'react'
import './StudioPage.css'

interface Item { slug: string; name: string; bucket: string }
interface ScanResult {
  verdicts: Array<Item & { verdict: string }>
  added: Item[]
  removed: Item[]
  blocked: { guard: string; reason: string } | null
  scanOk: boolean
}

const KEY_STORAGE = 'll-studio-key'

async function callStudio(key: string, action: string) {
  const res = await fetch('/api/studio', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-studio-key': key },
    body: JSON.stringify({ action }),
  })
  if (res.status === 401) throw new Error('unauthorized')
  if (!res.ok) throw new Error('failed')
  return res.json()
}

export function StudioPage() {
  const [key, setKey] = useState(() => localStorage.getItem(KEY_STORAGE) || '')
  const [entry, setEntry] = useState('')
  const [scan, setScan] = useState<ScanResult | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'applying' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Studio · Love & Lob'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => { document.head.removeChild(meta) }
  }, [])

  const runScan = useCallback(async (k: string) => {
    setStatus('loading'); setError('')
    try {
      setScan(await callStudio(k, 'scan'))
      setStatus('idle')
    } catch (err) {
      if ((err as Error).message === 'unauthorized') {
        localStorage.removeItem(KEY_STORAGE); setKey(''); setError('That passphrase did not work.')
      } else {
        setError('Could not reach the server. Try again in a minute.')
      }
      setStatus('error')
    }
  }, [])

  useEffect(() => { if (key) runScan(key) }, [key, runScan])

  const unlock = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem(KEY_STORAGE, entry)
    setKey(entry)
  }

  const apply = async () => {
    setStatus('applying')
    try {
      await callStudio(key, 'apply')
      setStatus('done')
    } catch {
      setError('Could not start the update.'); setStatus('error')
    }
  }

  if (!key) {
    return (
      <div className="studio-page">
        <form className="studio-gate" onSubmit={unlock}>
          <h1>Studio</h1>
          <input
            type="password" value={entry} autoFocus
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Passphrase" aria-label="Passphrase"
          />
          <button type="submit">Enter</button>
          {error && <p className="studio-error">{error}</p>}
        </form>
      </div>
    )
  }

  const changes = (scan?.added.length ?? 0) + (scan?.removed.length ?? 0)
  const healthy = scan?.verdicts.filter((v) => v.verdict === 'healthy' || v.verdict === 'quiet') ?? []

  return (
    <div className="studio-page">
      <header className="studio-header">
        <h1>Studio</h1>
        <p>Keeps the Schedule page in step with Sweatpals.</p>
      </header>

      {status === 'loading' && <p className="studio-note">Checking Sweatpals…</p>}
      {error && <p className="studio-error">{error}</p>}

      {scan && !scan.scanOk && (
        <p className="studio-error">
          Couldn&apos;t read Sweatpals right now. The site is still showing the last
          known-good list — nothing is broken. Try again later.
        </p>
      )}

      {scan?.blocked && (
        <p className="studio-warn">
          This change is big enough that it needs a human: {scan.blocked.reason}
        </p>
      )}

      {scan && scan.scanOk && (
        <>
          <ul className="studio-list">
            {scan.removed.map((r) => (
              <li key={r.slug} className="studio-item studio-item--out">
                <span aria-hidden="true">✕</span>
                <div><strong>{r.name}</strong><em>Gone from Sweatpals and out of dates</em></div>
              </li>
            ))}
            {scan.added.map((a) => (
              <li key={a.slug} className="studio-item studio-item--in">
                <span aria-hidden="true">+</span>
                <div><strong>{a.name}</strong><em>New on Sweatpals</em></div>
              </li>
            ))}
            {changes === 0 && (
              <li className="studio-item studio-item--ok">
                <span aria-hidden="true">✓</span>
                <div><strong>Everything matches</strong><em>{healthy.length} programs healthy</em></div>
              </li>
            )}
          </ul>

          {status === 'done' ? (
            <p className="studio-note">
              Started. The site updates in a couple of minutes — no need to stay on this page.
            </p>
          ) : (
            <button
              className="studio-apply" onClick={apply}
              disabled={changes === 0 || status === 'applying' || !!scan.blocked}
            >
              {status === 'applying' ? 'Starting…' : 'Update the site'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Style it, mobile-first**

Create `src/components/ui/StudioPage.css`:

```css
.studio-page {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 8rem 1.5rem 4rem;
  background: #0a0a0a;
  color: #F1F0E2;
  font-family: 'Inter', system-ui, sans-serif;
}

.studio-header h1,
.studio-gate h1 {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
  font-size: 2rem;
  margin: 0 0 0.5rem;
}

.studio-header p { opacity: 0.7; margin: 0 0 2rem; }

.studio-gate { display: flex; flex-direction: column; gap: 1rem; max-width: 22rem; }

.studio-gate input {
  padding: 0.9rem 1rem;
  background: transparent;
  border: 1px solid rgba(241, 240, 226, 0.3);
  border-radius: 6px;
  color: #F1F0E2;
  font-size: 1rem;
}

.studio-gate button,
.studio-apply {
  padding: 1rem 1.25rem;
  background: #d8e84d;
  color: #0a0a0a;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
}

.studio-apply { width: 100%; margin-top: 2rem; }
.studio-apply:disabled { opacity: 0.35; cursor: default; }

.studio-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }

.studio-item {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid rgba(241, 240, 226, 0.15);
  border-radius: 8px;
}

.studio-item strong { display: block; font-size: 1rem; }
.studio-item em { font-style: normal; opacity: 0.6; font-size: 0.85rem; }
.studio-item span { font-size: 1.1rem; line-height: 1.3; }

.studio-item--out span { color: #ff8a7a; }
.studio-item--in span { color: #d8e84d; }
.studio-item--ok span { color: #d8e84d; }

.studio-note { opacity: 0.7; margin-top: 1.5rem; }
.studio-error { color: #ff8a7a; margin-top: 1rem; }
.studio-warn { color: #d8e84d; margin-top: 1rem; }

@media (max-width: 480px) {
  .studio-page { padding: 6rem 1rem 3rem; }
  .studio-header h1, .studio-gate h1 { font-size: 1.6rem; }
}
```

- [ ] **Step 3: Wire the route**

In `src/App.tsx`, add the import beside the other UI imports:

```tsx
import { StudioPage } from './components/ui/StudioPage'
```

and the route immediately before the `path="*"` catch-all:

```tsx
        <Route path="/studio" element={<StudioPage />} />
```

- [ ] **Step 4: Register in both App.css allowlists**

`.studio-page` must be added to **both** blocks (the scroll allowlist near line 46 and the z-index block near line 78), or it will not scroll and will render under the canvas:

```css
.shop-page,
.product-detail,
.community-sub-page,
.manifesto-page,
.inv-page,
.sm-page,
.studio-page {
```

- [ ] **Step 5: Write down the exemption**

In `CLAUDE.md`, under **Persistent Overlays**, after "New pages MUST follow this pattern — never render a page as a route element that covers the canvas.", add:

```markdown
**Exception — internal tools.** `/studio` is a back-office debug page, not a
brand page: it renders as a plain route that covers the canvas. It should not
wait on a camera transition or pull the Three.js bundle. Any future internal
tool may follow it; brand pages may not.
```

- [ ] **Step 6: Verify**

Run: `pnpm build` → expect `✓ built`.
Run: `pnpm lint` → expect **exactly the 4 pre-existing errors** in `useBreakoutInput.ts`, `Navigation.tsx`, `useBottomScroll.ts`, `useDeferredUnmount.ts`. Any fifth error is yours.

Then, with `pnpm dev` running, screenshot the gate and the scanned state at 390px wide:

```js
// save as ./studio-shot.tmp.mjs, run from the repo root, delete afterwards
import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 1400 } })
await p.goto('http://localhost:5173/studio', { waitUntil: 'networkidle' })
await p.screenshot({ path: '/tmp/studio-gate.png' })
await b.close()
```

Confirm: the passphrase gate renders on a dark ground, nothing overflows horizontally, and the canvas is not visible behind it.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/StudioPage.tsx src/components/ui/StudioPage.css src/App.tsx src/App.css CLAUDE.md
git commit -m "feat(studio): add the schedule reconcile page"
git push origin main
```

- [ ] **Step 8: End-to-end check on production**

1. Open `https://www.loveandlob.co/studio` on a phone, enter the passphrase.
2. Confirm it shows either "Everything matches" or a list of named changes — **and no slugs anywhere on screen.**
3. If there are changes, tap **Update the site**, then `gh run list --workflow=reconcile-schedule.yml --limit 1` to confirm a run started.
4. After it completes, confirm the commit landed and `curl -sL https://www.loveandlob.co/api/events` reflects it.

---

## Deferred / out of scope

- `public/posts.json` is gitignored and its only consumers (both `WordsPage`
  components) are unrouted dead code. Either wire the page up or delete the
  components — tracked separately, not part of this plan.
- Migrating auth to Vercel Password Protection if the account moves to Pro.
