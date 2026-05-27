# Invitational Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mobile-first, data-driven `/community/invitational` event landing page for the Love & Lob Invitational Vol. 2 (Sat June 13, 2026), linked from the Community page like the other community items, with a `/invitational` redirect for the short URL.

**Architecture:** A community sub-route (`/community/invitational`) rendered over the 3D canvas, reusing the existing community sub-page plumbing: the `referee` camera mode (already mapped for `/community/*`), a **generalized** `SubPageWrapper` for the crossfade + community-to-community nav + logo handling, and an Invitational card added to the Community page. The page keeps a bespoke dark event-landing layout driven entirely by a single typed `invitationalData` object so the August re-run is just new data. The facility map is built as an interactive shell (legend + tappable hotspot zones) against a placeholder image, swappable for the final art later.

**Tech Stack:** React 19 + TypeScript (strict), React Router, Zustand (`sceneStore`), plain co-located CSS. (No camera/3D changes — the existing `referee` mode covers `/community/*`.)

> **Testing note (deliberate deviation from default TDD):** This repo has no unit-test runner (no vitest/jest) and zero existing tests; the feature is visual. Per "follow existing patterns" and the tomorrow deadline, verification gates are `pnpm build` (tsc type-check + vite build), `pnpm lint`, and a manual visual checklist (Task 11). Adding a vitest/Playwright harness is explicitly out of scope for this deadline — raise it with the user as a follow-up.

---

## File Structure

**Create:**
- `src/components/ui/invitational/invitationalData.ts` — typed content + map legend zones (single source of truth)
- `src/components/ui/invitational/InvitationalPage.tsx` — page shell (crossfade wrapper, section composition)
- `src/components/ui/invitational/InvitationalHero.tsx` — hero (title + date badge)
- `src/components/ui/invitational/TicketTiers.tsx` — two-column tickets (sold-out / available)
- `src/components/ui/invitational/ScheduleTimeline.tsx` — schedule cards
- `src/components/ui/invitational/FaqList.tsx` — FAQ accordion
- `src/components/ui/invitational/FacilityMap.tsx` — interactive map shell (legend + hotspots)
- `src/components/ui/invitational/invitational.css` — co-located styles (page fade + all sections)
- `src/assets/invitational/map-placeholder.svg` — placeholder map base image

**Modify:**
- `src/components/ui/community/SubPageWrapper.tsx` — add optional `className`/`contentClassName` props (backward-compatible defaults)
- `src/App.tsx` — import `InvitationalPage`, add `/community/invitational` route + `/invitational` redirect
- `src/components/ui/CommunityPage.tsx` — add an `Invitational` entry to the `sections` array

**No changes needed:** `RouteSync.tsx`, `sceneStore.ts`, `LandingExperience.tsx`, `Navigation.tsx` — the `referee` camera + `/community/*` sub-page behavior already cover this route.

---

## Task 1: Data model + content scaffold

**Files:**
- Create: `src/components/ui/invitational/invitationalData.ts`

- [ ] **Step 1: Create the data file with types + Vol. 1-scaffolded content**

All values needing real Vol. 2 input are marked `// TODO(content):` and listed in the header checklist.

```ts
// ── FILL-IN CHECKLIST (real Vol. 2 values) ───────────────────────────────
// [ ] Spectator pricing tiers
// [ ] Tennis + Spectator inclusion lists
// [ ] Schedule times within 12:30–6:30
// [ ] Sponsor list (+ Courtside Theory treatment)
// [ ] FAQ answers
// [ ] Directions / parking for 60 The Plz, Atlantic Beach, NY
// [ ] Final map art + per-zone hotspot coordinates
// ─────────────────────────────────────────────────────────────────────────

export type TicketStatus = 'sold-out' | 'available'

export interface TicketTier {
  title: string
  status: TicketStatus
  prices: string[]
  includes: string[]
  cta?: { label: string; href: string }
}

export interface ScheduleItem {
  time: string
  label: string
}

export interface Sponsor {
  name: string
  logo?: string
}

export interface Faq {
  q: string
  a: string
}

export interface MapZone {
  id: string
  label: string
  description: string
  /** Percentage coordinates over the map art (0–100). */
  hotspot: { x: number; y: number; w: number; h: number }
}

export interface InvitationalData {
  name: string
  feat?: string
  scriptLine: string
  dateLabel: string
  dateBadge: { weekday: string; month: string; day: string }
  timeLabel: string
  venue: { name?: string; address: string }
  intro: string[]
  tickets: TicketTier[]
  schedule: ScheduleItem[]
  sponsors: Sponsor[]
  faqs: Faq[]
  directions: { byCar?: string; byTrain?: string; parking?: string }
  map: { image?: string; alt: string; zones: MapZone[] }
}

export const invitationalData: InvitationalData = {
  name: 'Love & Lob Invitational Vol. 2',
  feat: 'Courtside Theory',
  scriptLine: 'Tennis at the',
  dateLabel: 'Saturday, June 13, 2026',
  dateBadge: { weekday: 'SAT', month: 'JUNE', day: '13' },
  timeLabel: '12:30 – 6:30 PM',
  venue: { address: '60 The Plz, Atlantic Beach, NY' },
  intro: [
    // TODO(content): confirm/adjust intro copy for Vol. 2
    "It's a day packed with non-stop tennis, food, & refreshing drinks. Whether you decide to hit the courts or simply relax courtside soaking up the sun, there's something for everyone to enjoy.",
    'We have 8–10 courts running all day with dedicated pros leading drills & games, Love&Lob style. Come groove with us as we close out the spring season.',
  ],
  tickets: [
    {
      title: 'Tennis Registration',
      status: 'sold-out',
      prices: [], // sold out — no active pricing shown
      includes: [
        // TODO(content): confirm Vol. 2 tennis inclusions
        'Full day of tennis',
        'Goodie bag + T-shirt',
        'Light bites',
        'Drinks',
      ],
    },
    {
      title: 'Spectator Ticket',
      status: 'available',
      prices: [
        // TODO(content): real Vol. 2 spectator pricing
        '$XX (Standard)',
        'Free (Kids, 7 & under)',
      ],
      includes: [
        // TODO(content): confirm Vol. 2 spectator inclusions
        'Entrance to the Invitational as a spectator',
        'Light bites',
        'Goodie bag',
        'Drinks',
      ],
      cta: { label: "Let's Eat & Drink!", href: 'https://lu.ma' }, // TODO(content): real ticketing URL (must be an external http(s) link so SubPageWrapper passes it through)
    },
  ],
  schedule: [
    // TODO(content): confirm Vol. 2 schedule within 12:30–6:30
    { time: '12:30 PM', label: 'Registration & Welcome' },
    { time: '1:00 PM', label: 'Non-Stop Tennis Begins' },
    { time: '4:00 PM', label: 'Après-Tennis / Tasting' },
    { time: '6:30 PM', label: "That's all, Folks!" },
  ],
  sponsors: [
    // TODO(content): real Vol. 2 sponsor list
    { name: 'Courtside Theory' },
  ],
  faqs: [
    // TODO(content): real Vol. 2 FAQ answers
    { q: 'Is the event sold out?', a: 'Tennis registration is sold out. Spectator tickets are still available.' },
    { q: 'What should I bring?', a: 'TODO(content): bring details.' },
  ],
  directions: {
    // TODO(content): real directions/parking for Atlantic Beach
    byCar: 'TODO(content): driving directions to 60 The Plz, Atlantic Beach, NY.',
    parking: 'TODO(content): parking details.',
  },
  map: {
    image: undefined, // set to imported placeholder in Task 9; final art later
    alt: 'Love & Lob Invitational facility map',
    zones: [
      // TODO(content): real zones + hotspot coords once final art arrives
      { id: 'courts', label: 'Courts 1–10', description: 'Main match courts', hotspot: { x: 20, y: 30, w: 30, h: 30 } },
      { id: 'food', label: 'Food & Drinks', description: 'Light bites + bar', hotspot: { x: 60, y: 20, w: 20, h: 15 } },
      { id: 'checkin', label: 'Check-In', description: 'Registration & welcome', hotspot: { x: 10, y: 70, w: 18, h: 12 } },
    ],
  },
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `pnpm build`
Expected: PASS (no type errors; file is not yet imported, so this only validates the module compiles).

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/invitational/invitationalData.ts
git commit -m "feat: add invitational page data model and content scaffold"
```

---

## Task 2: Generalize `SubPageWrapper` for reuse

**Files:**
- Modify: `src/components/ui/community/SubPageWrapper.tsx`

The wrapper hardcodes the `community-sub-page` / `community-sub-content` class names. Add optional `className` / `contentClassName` props defaulting to those, so the invitational page reuses the same crossfade + community-to-community instant nav + forced-logo-hidden behavior with its own dark layout. All 7 existing community sub-pages pass no props and are unaffected.

- [ ] **Step 1: Add the props**

Replace the props interface and the function signature in `SubPageWrapper.tsx`:

```tsx
interface SubPageWrapperProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function SubPageWrapper({
  children,
  className = 'community-sub-page',
  contentClassName = 'community-sub-content',
}: SubPageWrapperProps) {
```

Leave the `useEffect` logo logic and the `handleClick` handler exactly as they are.

- [ ] **Step 2: Use the props in the returned JSX**

Replace the returned JSX (the exit class is derived from `className` so it stays correct for both variants):

```tsx
  return (
    <div
      className={`${className}${exiting ? ` ${className}--exiting` : ''}`}
      onClick={handleClick}
    >
      <div className={contentClassName}>
        {children}
      </div>
    </div>
  )
```

- [ ] **Step 3: Verify build + lint, then regression-check**

Run: `pnpm build && pnpm lint`
Expected: PASS.

Run: `pnpm dev`, visit `/community/league` and one other sub-page.
Expected: each still fades in over the cream panel and animates out exactly as before (defaults preserved).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/community/SubPageWrapper.tsx
git commit -m "refactor: make SubPageWrapper class names configurable"
```

---

## Task 3: Page shell + community route + redirect + card

**Files:**
- Create: `src/components/ui/invitational/InvitationalPage.tsx`
- Create: `src/components/ui/invitational/invitational.css`
- Modify: `src/App.tsx`
- Modify: `src/components/ui/CommunityPage.tsx`

- [ ] **Step 1: Create the page shell with stubbed sections**

The shell reuses the generalized `SubPageWrapper` (which supplies the crossfade, forced-logo-hidden, and community-to-community instant nav), calls `useBottomScroll(true)` for the bottom nav-link reveal, and uses a "← Community" back link (intercepted by `SubPageWrapper` → instant nav, matching the other sub-pages). Sections are imported in later tasks; stub them here so the shell is testable now.

```tsx
import { Link } from 'react-router'
import { useBottomScroll } from '../../../hooks/useBottomScroll'
import { SubPageWrapper } from '../community/SubPageWrapper'
import { invitationalData } from './invitationalData'
import './invitational.css'

export function InvitationalPage() {
  useBottomScroll(true)
  const d = invitationalData

  return (
    <SubPageWrapper className="inv-page" contentClassName="inv-content">
      <Link to="/community" className="inv-back">&larr; Community</Link>

      {/* Sections added in later tasks */}
      <section className="inv-section inv-section--stub">
        <h1>{d.name}</h1>
        {d.feat && <p>ft. {d.feat}</p>}
        <p>{d.dateLabel} · {d.timeLabel}</p>
        <p>{d.venue.address}</p>
      </section>
    </SubPageWrapper>
  )
}
```

- [ ] **Step 2: Create the base CSS (page fade + container)**

```css
/* Page-level crossfade-over-canvas entry/exit (mirrors community-sub pattern,
   kept local to decouple invitational layout from community styles). */
.inv-page {
  min-height: 100vh;
  min-height: 100dvh;
  padding: 8rem 0 4rem;
  color: #F1F0E2;
  background: rgba(10, 10, 10, 0.96);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: inv-bg-in 0.6s ease forwards;
  transition: background 0.3s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease, opacity 0.3s ease;
}

.inv-page--exiting {
  opacity: 0;
  background: rgba(10, 10, 10, 0);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
}

@keyframes inv-bg-in {
  from { background: rgba(10, 10, 10, 0); backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); }
  to   { background: rgba(10, 10, 10, 0.96); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
}

.inv-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 4rem 4rem;
  animation: inv-content-in 0.5s ease 0.25s both;
}

@keyframes inv-content-in {
  from { opacity: 0; transform: translateY(1rem); }
  to   { opacity: 1; transform: translateY(0); }
}

.inv-back {
  display: inline-block;
  margin: 0 4rem 2rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(241, 240, 226, 0.55);
  text-decoration: none;
  transition: color 0.2s;
}
.inv-back:hover { color: #d8e84d; }

@media (max-width: 768px) {
  .inv-section { padding: 0 2rem 3rem; }
  .inv-back { margin: 0 2rem 1.5rem; }
}

@media (max-width: 480px) {
  .inv-page { padding: 5rem 0 3rem; }
  .inv-section { padding: 0 1.25rem 2.5rem; }
  .inv-back { margin: 0 1.25rem 1rem; font-size: 0.85rem; }
}
```

- [ ] **Step 3: Register the routes**

In `src/App.tsx`, add the import alongside the other UI imports:

```tsx
import { InvitationalPage } from './components/ui/invitational/InvitationalPage'
```

Add the canonical community route next to the other `/community/*` routes, and a redirect for the short URL (`Navigate` is already imported in `App.tsx` for the catch-all):

```tsx
        <Route path="/community/invitational" element={<InvitationalPage />} />
        <Route path="/invitational" element={<Navigate to="/community/invitational" replace />} />
```

- [ ] **Step 4: Add the Invitational card to the Community page**

In `src/components/ui/CommunityPage.tsx`, add an entry at the **top** of the `sections` array (the array starting at line 25). No media yet → it renders as a `--no-media` text card (poster art swapped in later).

```ts
const sections: Section[] = [
  { name: 'Invitational', path: '/community/invitational', subtitle: 'Vol. 2 ft. Courtside Theory — Sat June 13' },
  { name: 'Monthly Classic', path: '/community/monthly-classic', subtitle: 'Our infamous 2-hour clinics', media: monthlyClassicVideo, mediaType: 'video' },
  // ...remaining entries unchanged
]
```

- [ ] **Step 5: Verify build + lint, then manual check**

Run: `pnpm build && pnpm lint`
Expected: PASS.

Run: `pnpm dev`. On `/community`, confirm the Invitational card appears; clicking it opens `/community/invitational`, which fades in over the canvas (logo hidden, hamburger appears once the camera settles, "← Community" returns instantly). Visit `/invitational` directly → redirects to `/community/invitational`.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/invitational/InvitationalPage.tsx src/components/ui/invitational/invitational.css src/App.tsx src/components/ui/CommunityPage.tsx
git commit -m "feat: add invitational community sub-route, page shell, and card"
```

---

## Task 4: Hero section

**Files:**
- Create: `src/components/ui/invitational/InvitationalHero.tsx`
- Modify: `src/components/ui/invitational/invitational.css` (append hero styles)
- Modify: `src/components/ui/invitational/InvitationalPage.tsx` (use hero, remove stub)

- [ ] **Step 1: Create the hero component**

```tsx
import type { InvitationalData } from './invitationalData'

interface HeroProps {
  data: Pick<InvitationalData, 'name' | 'feat' | 'scriptLine' | 'dateBadge'>
}

export function InvitationalHero({ data }: HeroProps) {
  const { weekday, month, day } = data.dateBadge
  return (
    <header className="inv-hero">
      <p className="inv-hero-script">{data.scriptLine}</p>
      <h1 className="inv-hero-title">{data.name}</h1>
      <div className="inv-hero-badge" aria-hidden="true">
        <span className="inv-hero-badge-weekday">{weekday}</span>
        <span className="inv-hero-badge-day">{day}</span>
        <span className="inv-hero-badge-month">{month}</span>
      </div>
      {data.feat && <p className="inv-hero-feat">ft. {data.feat}</p>}
    </header>
  )
}
```

- [ ] **Step 2: Append hero styles to `invitational.css`**

```css
.inv-hero {
  max-width: 1100px;
  margin: 0 auto 3rem;
  padding: 0 4rem;
  text-align: center;
  animation: inv-content-in 0.5s ease 0.25s both;
}
.inv-hero-script {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: clamp(1.25rem, 4vw, 2rem);
  color: #d8e84d;
  margin-bottom: 0.5rem;
}
.inv-hero-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 900;
  font-size: clamp(2.5rem, 9vw, 6rem);
  line-height: 0.95;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  margin: 0;
}
.inv-hero-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: clamp(120px, 22vw, 180px);
  height: clamp(120px, 22vw, 180px);
  margin: 1.5rem auto;
  border: 2px solid #d8e84d;
  border-radius: 50%;
  color: #d8e84d;
  font-family: 'Playfair Display', Georgia, serif;
}
.inv-hero-badge-weekday,
.inv-hero-badge-month { font-size: 0.9rem; letter-spacing: 0.15em; }
.inv-hero-badge-day { font-size: clamp(2rem, 7vw, 3.25rem); font-weight: 900; line-height: 1; }
.inv-hero-feat {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(241, 240, 226, 0.7);
}

@media (max-width: 768px) { .inv-hero { padding: 0 2rem; } }
@media (max-width: 480px) { .inv-hero { padding: 0 1.25rem; margin-bottom: 2rem; } }
```

- [ ] **Step 3: Wire the hero into the page, remove the stub**

In `InvitationalPage.tsx`, import the hero and replace the stub `<section>` with:

```tsx
import { InvitationalHero } from './InvitationalHero'
// ...
      <InvitationalHero data={d} />

      <section className="inv-section">
        <p className="inv-venue">{d.venue.address}</p>
        <p className="inv-venue">{d.dateLabel} · {d.timeLabel}</p>
        {d.intro.map((p, i) => (
          <p key={i} className="inv-intro">{p}</p>
        ))}
      </section>
```

Append to `invitational.css`:

```css
.inv-venue { font-family: 'Inter', sans-serif; font-weight: 600; color: #d8e84d; margin-bottom: 0.25rem; }
.inv-intro { font-family: 'Inter', sans-serif; font-size: 1.1rem; line-height: 1.7; color: rgba(241, 240, 226, 0.85); margin: 1rem 0; }
@media (max-width: 480px) { .inv-intro { font-size: 0.95rem; } }
```

- [ ] **Step 4: Verify + commit**

Run: `pnpm build && pnpm lint`
Expected: PASS. Manual: hero title + circular date badge + feat line render centered.

```bash
git add src/components/ui/invitational/
git commit -m "feat: add invitational hero and welcome section"
```

---

## Task 5: Ticket tiers

**Files:**
- Create: `src/components/ui/invitational/TicketTiers.tsx`
- Modify: `src/components/ui/invitational/invitational.css` (append)
- Modify: `src/components/ui/invitational/InvitationalPage.tsx`

- [ ] **Step 1: Create the component**

```tsx
import type { TicketTier } from './invitationalData'

interface TicketTiersProps {
  tickets: TicketTier[]
}

export function TicketTiers({ tickets }: TicketTiersProps) {
  return (
    <section className="inv-section">
      <h2 className="inv-h2">Tickets</h2>
      <div className="inv-tickets">
        {tickets.map((t) => (
          <article key={t.title} className="inv-ticket">
            <div className="inv-ticket-head">
              <h3>{t.title}</h3>
              {t.status === 'sold-out' && <span className="inv-badge-soldout">Sold Out</span>}
            </div>
            {t.prices.map((p) => (
              <p key={p} className="inv-ticket-price">{p}</p>
            ))}
            <p className="inv-ticket-label">What&apos;s Included?</p>
            <ul className="inv-ticket-list">
              {t.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {t.status === 'available' && t.cta && (
              <a className="inv-ticket-cta" href={t.cta.href}>{t.cta.label}</a>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Append styles**

```css
.inv-h2 {
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 900;
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  text-transform: uppercase;
  color: #d8e84d;
  margin-bottom: 1.5rem;
}
.inv-tickets { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.inv-ticket {
  border: 1px solid rgba(216, 232, 77, 0.25);
  border-radius: 10px;
  padding: 1.75rem;
  background: rgba(241, 240, 226, 0.03);
}
.inv-ticket-head { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
.inv-ticket-head h3 { font-family: 'Playfair Display', Georgia, serif; font-size: 1.4rem; font-weight: 900; }
.inv-badge-soldout {
  font-family: 'Inter', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: #0a0a0a; background: #d8e84d; padding: 0.2rem 0.5rem; border-radius: 4px;
}
.inv-ticket-price { font-family: 'Inter', sans-serif; color: rgba(241, 240, 226, 0.8); margin: 0.2rem 0; }
.inv-ticket-label { font-family: 'Inter', sans-serif; font-weight: 700; font-style: italic; margin: 1rem 0 0.5rem; }
.inv-ticket-list { list-style: none; padding: 0; margin: 0; }
.inv-ticket-list li { font-family: 'Inter', sans-serif; color: rgba(241, 240, 226, 0.85); padding: 0.25rem 0 0.25rem 1.5rem; position: relative; }
.inv-ticket-list li::before { content: '✓'; position: absolute; left: 0; color: #d8e84d; }
.inv-ticket-cta {
  display: inline-block; margin-top: 1.25rem; padding: 0.7rem 1.5rem; border-radius: 999px;
  font-family: 'Inter', sans-serif; font-weight: 700; text-decoration: none;
  color: #0a0a0a; background: #d8e84d; transition: transform 0.15s, opacity 0.15s;
}
.inv-ticket-cta:hover { transform: translateY(-1px); opacity: 0.9; }

@media (max-width: 768px) { .inv-tickets { grid-template-columns: 1fr; gap: 1.25rem; } }
```

- [ ] **Step 3: Wire into page**

In `InvitationalPage.tsx`, import and render after the welcome section:

```tsx
import { TicketTiers } from './TicketTiers'
// ...
      <TicketTiers tickets={d.tickets} />
```

- [ ] **Step 4: Verify + commit**

Run: `pnpm build && pnpm lint`
Expected: PASS. Manual: two ticket cards; Tennis shows "Sold Out" badge and no CTA; Spectator shows CTA.

```bash
git add src/components/ui/invitational/
git commit -m "feat: add invitational ticket tiers section"
```

---

## Task 6: Schedule timeline

**Files:**
- Create: `src/components/ui/invitational/ScheduleTimeline.tsx`
- Modify: `src/components/ui/invitational/invitational.css` (append)
- Modify: `src/components/ui/invitational/InvitationalPage.tsx`

- [ ] **Step 1: Create the component**

```tsx
import type { ScheduleItem } from './invitationalData'

interface ScheduleTimelineProps {
  schedule: ScheduleItem[]
}

export function ScheduleTimeline({ schedule }: ScheduleTimelineProps) {
  return (
    <section className="inv-section">
      <h2 className="inv-h2">Schedule</h2>
      <ol className="inv-schedule">
        {schedule.map((s) => (
          <li key={s.time} className="inv-schedule-item">
            <span className="inv-schedule-time">{s.time}</span>
            <span className="inv-schedule-label">{s.label}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
```

- [ ] **Step 2: Append styles**

```css
.inv-schedule { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.inv-schedule-item {
  display: flex; align-items: baseline; gap: 1.25rem;
  border-left: 2px solid #d8e84d; padding: 0.75rem 0 0.75rem 1.25rem;
}
.inv-schedule-time { font-family: 'Playfair Display', Georgia, serif; font-weight: 900; font-size: 1.25rem; color: #d8e84d; min-width: 5.5rem; }
.inv-schedule-label { font-family: 'Inter', sans-serif; color: rgba(241, 240, 226, 0.9); }
@media (max-width: 480px) { .inv-schedule-time { font-size: 1.05rem; min-width: 4.5rem; } }
```

- [ ] **Step 3: Wire into page**

```tsx
import { ScheduleTimeline } from './ScheduleTimeline'
// ...
      <ScheduleTimeline schedule={d.schedule} />
```

- [ ] **Step 4: Verify + commit**

Run: `pnpm build && pnpm lint`
Expected: PASS. Manual: timeline renders in order.

```bash
git add src/components/ui/invitational/
git commit -m "feat: add invitational schedule timeline"
```

---

## Task 7: FAQ + Directions

**Files:**
- Create: `src/components/ui/invitational/FaqList.tsx`
- Modify: `src/components/ui/invitational/invitational.css` (append)
- Modify: `src/components/ui/invitational/InvitationalPage.tsx`

- [ ] **Step 1: Create the FAQ component (native `<details>` accordion)**

```tsx
import type { Faq } from './invitationalData'

interface FaqListProps {
  faqs: Faq[]
}

export function FaqList({ faqs }: FaqListProps) {
  return (
    <div className="inv-faqs">
      {faqs.map((f) => (
        <details key={f.q} className="inv-faq">
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Append styles**

```css
.inv-faqs { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 2.5rem; }
.inv-faq { border-bottom: 1px solid rgba(241, 240, 226, 0.15); padding: 0.75rem 0; }
.inv-faq summary { font-family: 'Inter', sans-serif; font-weight: 600; cursor: pointer; list-style: none; }
.inv-faq summary::-webkit-details-marker { display: none; }
.inv-faq summary::after { content: '+'; float: right; color: #d8e84d; }
.inv-faq[open] summary::after { content: '−'; }
.inv-faq p { font-family: 'Inter', sans-serif; color: rgba(241, 240, 226, 0.8); margin-top: 0.5rem; line-height: 1.6; }
.inv-directions p { font-family: 'Inter', sans-serif; color: rgba(241, 240, 226, 0.85); line-height: 1.7; margin: 0.5rem 0; }
.inv-directions strong { color: #d8e84d; }
```

- [ ] **Step 3: Wire into page (FAQ + directions block)**

```tsx
import { FaqList } from './FaqList'
// ...
      <section className="inv-section">
        <h2 className="inv-h2">FAQs</h2>
        <FaqList faqs={d.faqs} />

        <h2 className="inv-h2">Directions</h2>
        <div className="inv-directions">
          {d.directions.byCar && <p><strong>By Car:</strong> {d.directions.byCar}</p>}
          {d.directions.byTrain && <p><strong>By Train:</strong> {d.directions.byTrain}</p>}
          {d.directions.parking && <p><strong>Parking:</strong> {d.directions.parking}</p>}
        </div>
      </section>
```

- [ ] **Step 4: Verify + commit**

Run: `pnpm build && pnpm lint`
Expected: PASS. Manual: FAQ entries expand/collapse; directions render.

```bash
git add src/components/ui/invitational/
git commit -m "feat: add invitational FAQ and directions section"
```

---

## Task 8: Sponsors row

**Files:**
- Modify: `src/components/ui/invitational/invitational.css` (append)
- Modify: `src/components/ui/invitational/InvitationalPage.tsx`

- [ ] **Step 1: Render sponsors inline from data**

In `InvitationalPage.tsx`, add after the FAQ/Directions section:

```tsx
      <section className="inv-section inv-sponsors">
        <h2 className="inv-h2">Sponsored By</h2>
        <ul className="inv-sponsor-list">
          {d.sponsors.map((s) => (
            <li key={s.name} className="inv-sponsor">
              {s.logo ? <img src={s.logo} alt={s.name} /> : <span>{s.name}</span>}
            </li>
          ))}
        </ul>
      </section>
```

- [ ] **Step 2: Append styles**

```css
.inv-sponsor-list {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-wrap: wrap; gap: 2rem; align-items: center; justify-content: center;
}
.inv-sponsor span {
  font-family: 'Playfair Display', Georgia, serif; font-weight: 900; font-size: 1.25rem;
  color: rgba(241, 240, 226, 0.85); text-transform: uppercase; letter-spacing: 0.05em;
}
.inv-sponsor img { max-height: 48px; width: auto; filter: brightness(0) invert(1); opacity: 0.85; }
```

- [ ] **Step 3: Verify + commit**

Run: `pnpm build && pnpm lint`
Expected: PASS. Manual: sponsor names/logos render in a centered row.

```bash
git add src/components/ui/invitational/
git commit -m "feat: add invitational sponsors row"
```

---

## Task 9: Interactive facility map

**Files:**
- Create: `src/assets/invitational/map-placeholder.svg`
- Create: `src/components/ui/invitational/FacilityMap.tsx`
- Modify: `src/components/ui/invitational/invitational.css` (append)
- Modify: `src/components/ui/invitational/invitationalData.ts` (set `map.image`)
- Modify: `src/components/ui/invitational/InvitationalPage.tsx`

- [ ] **Step 1: Create the placeholder map SVG**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" role="img" aria-label="Facility map placeholder">
  <rect width="1000" height="600" fill="#13231a"/>
  <text x="500" y="300" fill="#d8e84d" font-family="Georgia, serif" font-size="36" text-anchor="middle" dominant-baseline="middle">Facility Map — art coming soon</text>
</svg>
```

- [ ] **Step 2: Point the data at the placeholder**

In `invitationalData.ts`, add the import at the top and set `map.image`:

```ts
import mapPlaceholder from '../../../assets/invitational/map-placeholder.svg'
// ...
  map: {
    image: mapPlaceholder,
    alt: 'Love & Lob Invitational facility map',
    zones: [ /* unchanged */ ],
  },
```

- [ ] **Step 3: Create the interactive map component**

Hover (desktop) and tap (mobile) both set the active zone via a single `activeId` state, so it works on touch. The legend lists every zone; selecting a legend item or a hotspot highlights both.

```tsx
import { useState } from 'react'
import type { MapZone } from './invitationalData'

interface FacilityMapProps {
  image?: string
  alt: string
  zones: MapZone[]
}

export function FacilityMap({ image, alt, zones }: FacilityMapProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  return (
    <section className="inv-section">
      <h2 className="inv-h2">Facility Map</h2>
      <div className="inv-map">
        <div className="inv-map-canvas">
          {image && <img className="inv-map-img" src={image} alt={alt} />}
          {zones.map((z) => (
            <button
              key={z.id}
              type="button"
              className={`inv-map-zone${activeId === z.id ? ' inv-map-zone--active' : ''}`}
              style={{ left: `${z.hotspot.x}%`, top: `${z.hotspot.y}%`, width: `${z.hotspot.w}%`, height: `${z.hotspot.h}%` }}
              onMouseEnter={() => setActiveId(z.id)}
              onMouseLeave={() => setActiveId(null)}
              onClick={() => setActiveId((cur) => (cur === z.id ? null : z.id))}
              aria-label={z.label}
            >
              <span className="inv-map-zone-tag">{z.label}</span>
            </button>
          ))}
        </div>
        <ul className="inv-map-legend">
          {zones.map((z) => (
            <li
              key={z.id}
              className={`inv-map-legend-item${activeId === z.id ? ' inv-map-legend-item--active' : ''}`}
              onMouseEnter={() => setActiveId(z.id)}
              onMouseLeave={() => setActiveId(null)}
              onClick={() => setActiveId((cur) => (cur === z.id ? null : z.id))}
            >
              <span className="inv-map-legend-label">{z.label}</span>
              <span className="inv-map-legend-desc">{z.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Append styles**

```css
.inv-map { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; align-items: start; }
.inv-map-canvas { position: relative; border-radius: 10px; overflow: hidden; }
.inv-map-img { width: 100%; display: block; }
.inv-map-zone {
  position: absolute; padding: 0; margin: 0; cursor: pointer;
  background: rgba(216, 232, 77, 0.08); border: 1.5px solid transparent; border-radius: 6px;
  transition: background 0.15s, border-color 0.15s;
}
.inv-map-zone:hover,
.inv-map-zone--active { background: rgba(216, 232, 77, 0.28); border-color: #d8e84d; }
.inv-map-zone-tag {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
  font-family: 'Inter', sans-serif; font-size: 0.7rem; font-weight: 700; color: #0a0a0a;
  background: #d8e84d; padding: 0.1rem 0.4rem; border-radius: 4px; white-space: nowrap;
  opacity: 0; transition: opacity 0.15s; pointer-events: none;
}
.inv-map-zone:hover .inv-map-zone-tag,
.inv-map-zone--active .inv-map-zone-tag { opacity: 1; }
.inv-map-legend { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.inv-map-legend-item {
  cursor: pointer; padding: 0.6rem 0.75rem; border-radius: 6px;
  border: 1px solid rgba(241, 240, 226, 0.12); transition: border-color 0.15s, background 0.15s;
}
.inv-map-legend-item:hover,
.inv-map-legend-item--active { border-color: #d8e84d; background: rgba(216, 232, 77, 0.08); }
.inv-map-legend-label { display: block; font-family: 'Inter', sans-serif; font-weight: 700; color: #d8e84d; }
.inv-map-legend-desc { display: block; font-family: 'Inter', sans-serif; font-size: 0.9rem; color: rgba(241, 240, 226, 0.8); }

@media (max-width: 768px) { .inv-map { grid-template-columns: 1fr; } }
```

- [ ] **Step 5: Wire into page (place map after the intro/welcome section, before tickets)**

```tsx
import { FacilityMap } from './FacilityMap'
// ...
      <FacilityMap image={d.map.image} alt={d.map.alt} zones={d.map.zones} />
```

- [ ] **Step 6: Verify + commit**

Run: `pnpm build && pnpm lint`
Expected: PASS. Manual: placeholder map shows; hovering a zone highlights it + its legend row; tapping toggles on mobile; legend lists all zones.

```bash
git add src/assets/invitational/ src/components/ui/invitational/
git commit -m "feat: add interactive facility map shell with placeholder art"
```

---

## Task 10: Section ordering + final composition review

**Files:**
- Modify: `src/components/ui/invitational/InvitationalPage.tsx`

- [ ] **Step 1: Confirm the final section order in `InvitationalPage.tsx`**

Order top → bottom: back link → `InvitationalHero` → welcome/venue+intro → `FacilityMap` → `TicketTiers` → `ScheduleTimeline` → FAQ+Directions → sponsors. Reorder the JSX if needed to match.

- [ ] **Step 2: Verify + commit (if changed)**

Run: `pnpm build && pnpm lint`
Expected: PASS.

```bash
git add src/components/ui/invitational/InvitationalPage.tsx
git commit -m "refactor: finalize invitational section ordering"
```

---

## Task 11: Mobile responsive pass + manual verification

**Files:**
- Modify: `src/components/ui/invitational/invitational.css` (only if gaps found)

- [ ] **Step 1: Run the full build + lint gate**

Run: `pnpm build && pnpm lint`
Expected: PASS, no warnings introduced.

- [ ] **Step 2: Manual verification checklist** (`pnpm dev`, then resize to 375px, 480px, 768px, desktop)

- [ ] Community page shows the Invitational card; clicking it opens `/community/invitational`. `/invitational` redirects there.
- [ ] `/community/invitational` fades in over the canvas with blur; exit fade plays when leaving via "← Community" / nav.
- [ ] The other community sub-pages (e.g. `/community/league`) still render and animate unchanged.
- [ ] Logo hidden throughout; hamburger menu appears after camera settles; nav links reveal at bottom scroll.
- [ ] Hero title scales without overflow; date badge stays circular.
- [ ] Tickets are two columns on desktop, stacked ≤768px; "Sold Out" badge on Tennis; CTA only on Spectator.
- [ ] Map is image+legend two-column on desktop, stacked ≤768px; zones tappable on touch.
- [ ] Schedule, FAQ accordion, directions, sponsors all render and are readable at 480px.
- [ ] No horizontal scroll at any breakpoint.

- [ ] **Step 3: Fix any responsive gaps found, then commit**

```bash
git add src/components/ui/invitational/invitational.css
git commit -m "fix: tighten invitational mobile layout"
```

---

## Post-implementation follow-ups (not blocking)

- Swap `map-placeholder.svg` for the final Vol. 2 map art and tune each `MapZone.hotspot` to the real artwork.
- Fill every `// TODO(content):` in `invitationalData.ts` with real Vol. 2 values (pricing, inclusions, schedule, sponsors, FAQ, directions).
- Optional: extract the shared page crossfade keyframes (`inv-bg-in` / community-sub equivalent) into a common stylesheet if a third such page appears (DRY — deferred per YAGNI).
- Optional: add a test harness (vitest + Playwright) — currently none in the repo.
