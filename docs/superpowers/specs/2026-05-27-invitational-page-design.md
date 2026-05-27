# Invitational Page — Design Spec

**Date:** 2026-05-27
**Route:** `/invitational`
**Status:** Draft for review
**Deadline:** May 28 (tomorrow)

## Goal

Add a standalone, mobile-first event landing page for the **Love & Lob Invitational Vol. 2 ft. Courtside Theory**. The page mirrors the structure of the Vol. 1 "Tennis on the Hudson" carrd reference (long-scroll event landing) but is rebuilt in the existing Love & Lob design language (dark canvas, cream content, accent `#d8e84d`, Playfair/Inter, crossfade-over-canvas entry).

The event is **already sold out** for tennis registration, so the page's job is wayfinding + information: directions, FAQ, schedule, sponsors, and a theme-park-style facility map. The model must be **reusable** — the same page will be re-skinned for a future invitational (Aug 1 or 8), so all content is data-driven.

## Confirmed Vol. 2 facts

| Field | Value |
|-------|-------|
| Name | Love & Lob Invitational Vol. 2 ft. Courtside Theory |
| Date | Saturday, June 13, 2026 |
| Time | 12:30 pm – 6:30 pm |
| Venue | 60 The Plz, Atlantic Beach, NY |
| Tennis registration | **SOLD OUT** — still list what the ticket includes |
| Spectator ticket | **Available** — list inclusions + active CTA |
| Hero graphic | Theme-park-style facility map (8–10 courts) + legend |
| Priority | Mobile-friendly first |

## Architecture decision

**Standalone route-element page at `/invitational`, data-driven, reusing the existing crossfade-over-canvas pattern** (the same approach as the `/community/*` sub-pages: `SubPageWrapper` + `community-sub.css` entry animation), **not** a heavy 3D-camera persistent overlay like Schedule/Shop/Manifesto.

**Rationale:**
- The reference is a flat scrolling landing page with opaque sections — full camera choreography adds work and buys nothing visible.
- The route-element pattern is the lightest and most replicable. Matches "keep data JSON-driven" preference.

**Alternatives considered:**
- *Full persistent 3D overlay + dedicated camera choreography* (Schedule/Shop style): overkill for a flat landing page; more code, more risk against a tomorrow deadline. Rejected.
- *Sub-page under `/community/invitational`*: user explicitly asked for the top-level `/invitational` path, and the invitational is a flagship event, not a community sub-item. Rejected.

## Integration touchpoints

1. **`src/App.tsx`** — add `<Route path="/invitational" element={<InvitationalPage />} />` and the import.
2. **`src/components/ui/RouteSync.tsx`** — map `pathname === '/invitational'` → new `'invitational'` camera mode.
3. **`src/stores/sceneStore.ts`** — extend the `CameraMode` union with `'invitational'`.
4. **Camera rig** (the component that positions the camera per mode — to be located during planning) — add an `'invitational'` case. Position can mirror an existing calm mode (e.g. `umpire` `(0, -4, 1.5)`) since page sections are opaque and the canvas is barely visible behind the blur. A distinct mode (vs reusing an existing one) keeps per-page gating clean and avoids cross-page show/hide surprises.
5. **`src/components/ui/Navigation.tsx`** — extend the logo-click exit-animation branch (currently `isSubPage = /community/* || /shop/*`) to also include `/invitational`, so leaving the page plays the crossfade-out. Logo-hide and link-reveal already behave correctly for a non-home path.

## Components & files

```
src/components/ui/invitational/
├── InvitationalPage.tsx        # Page shell: crossfade wrapper + section composition, useBottomScroll(true)
├── InvitationalHero.tsx        # Script line + giant title + circular date badge + "ft. Courtside Theory"
├── TicketTiers.tsx             # Two-column tickets (sold-out badge / available CTA), driven by data
├── ScheduleTimeline.tsx        # Timeline cards across 12:30–6:30
├── FacilityMap.tsx             # Interactive map: base image + positioned hotspot zones + legend
├── FaqList.tsx                 # FAQ accordion/list
├── invitationalData.ts         # All page content + map legend zones (the single source of truth)
└── invitational.css            # Co-located styles, mobile-first, 480/768 breakpoints
```

Sponsors and Directions are simple enough to render inline in `InvitationalPage.tsx` from data.

### Crossfade wrapper

Reuse the `community-sub.css` entry/exit animation (translucent cream bg + backdrop blur, content fades up; `pageExiting` flag drives exit). Either:
- Generalize `SubPageWrapper` to accept a configurable back-link target / exit-path rule, **or**
- Add a thin `InvitationalPage`-local wrapper that reuses the same CSS classes.

Decision deferred to the implementation plan; leaning toward a small local wrapper to avoid entangling community-specific link logic. The page is multi-section and full-bleed, so it will likely use its own `invitational.css` for section layout while borrowing the page-level fade keyframes.

## Data model

`invitationalData.ts` exports a typed object so Vol. 3 = a new data file (or a keyed entry), not a new component:

```ts
interface InvitationalData {
  name: string                 // "Love & Lob Invitational Vol. 2"
  feat?: string                // "Courtside Theory"
  dateLabel: string            // "Saturday, June 13"
  dateBadge: { weekday: string; month: string; day: string }
  timeLabel: string            // "12:30 – 6:30 PM"
  venue: { name?: string; address: string }
  intro: string[]              // paragraphs
  tickets: TicketTier[]        // { title, status: 'sold-out' | 'available', prices[], includes[], cta? }
  schedule: ScheduleItem[]     // { time, label }
  sponsors: Sponsor[]          // { name, logo? }
  faqs: Faq[]                  // { q, a }
  directions: { byCar?: string; byTrain?: string; parking?: string }
  map: { image?: string; zones: MapZone[] }
}

interface MapZone {
  id: string                   // "court-5"
  label: string                // "Court 5"
  description: string          // legend text
  hotspot: { x: number; y: number; w: number; h: number }  // % coords over the art
}
```

## Page sections (top → bottom)

1. **Hero** — script line ("Tennis at the…" style), giant Playfair title `INVITATIONAL VOL. 2`, circular date badge (`SAT · JUNE 13`), `ft. Courtside Theory` line. Full-bleed.
2. **Welcome / venue card** — short welcome + info card: `60 The Plz, Atlantic Beach, NY` · `12:30 – 6:30 PM`.
3. **Intro copy** — adapted from Vol. 1 ("It's a day packed with non-stop tennis, food & drinks…"), flagged for edits.
4. **Facility map** — `FacilityMap`: base art + interactive court-zone hotspots + legend. **Shipped as a shell** (placeholder base image, real legend/zone system) until final art arrives; see below.
5. **Tickets** — two columns: Tennis Registration (**SOLD OUT** badge, inclusions list, no active CTA) / Spectator Ticket (prices, inclusions, active CTA button).
6. **Schedule** — timeline cards across 12:30–6:30 (placeholder times from Vol. 1 cadence, flagged).
7. **FAQs + Directions** — FAQ list + directions to Atlantic Beach (By Car / parking; train is less relevant for Atlantic Beach than the Vol. 1 Hudson site — flagged).
8. **Sponsors** — "Sponsored by" logo row (placeholder list, flagged).

## Interactive facility map (phased)

Per user: they will **first produce a new map image** (Vol. 2 Atlantic Beach facility, redone legend), and **then** I replicate it as an **interactive map**.

To avoid blocking the page on the art:
- **Now:** build `FacilityMap` as a complete interactive shell against a placeholder base image — legend data array, positioned hotspot zones (`%`-based coords), hover (desktop) + tap (mobile) states linking a zone to its legend entry, mobile-first layout.
- **Later (quick swap):** drop the final map PNG into `src/assets/invitational/`, set `map.image`, and tune each zone's `hotspot` coords. No structural change.

Everything else on the page ships independently of the map art.

## Styling

- Tokens: bg `#0a0a0a`, cream `#F1F0E2`, accent `#d8e84d`, green `#004225` (consistent with existing pages).
- Typography: Playfair Display 900 (headings), Inter (body) — matching site, not the carrd reference's exact fonts.
- **Mobile-first**, with required `480px` and `768px` breakpoints per project standards.
- Top padding `8rem` consistent with secondary pages.
- Tickets collapse from two columns → stacked on mobile. Map legend sits below/beside the art responsively.

## Reusability (Vol. 3)

The page renders entirely from `invitationalData`. For the August event, create a new data object (or key the data by volume and read a route param later — YAGNI for now, single data file). No component changes needed for a re-run beyond swapping data + map art.

## Content sourcing

Per user: **scaffold all copy from Vol. 1** (seen in the reference video) as realistic placeholders, since the event is sold out the copy stays close. Every value that needs a real Vol. 2 input will be **flagged inline** with a `// TODO(content):` comment in `invitationalData.ts` and summarized in a checklist at the top of that file. Items to flag include: spectator pricing, ticket inclusions, schedule times, sponsor list, FAQ answers, directions/parking for Atlantic Beach.

## Open items (need user confirmation at review)

1. ~~Event year~~ — **Confirmed: Saturday, June 13, 2026.**
2. **Map art delivery** — user provides the final PNG; until then the page ships with the interactive shell + placeholder.

## Out of scope

- Generating the map illustration (user/AI provides the art).
- Real ticketing/payment integration (CTA links out to existing ticketing, same as Vol. 1).
- Any change to the home `/` 3D scene beyond the new camera mode.

## Testing notes

- Type-check + lint pass (`pnpm build`, `pnpm lint`).
- Manual: navigate to `/invitational` — crossfade entry plays, logo hidden, hamburger menu appears once camera settles, nav links reveal at bottom scroll, exit crossfade plays when leaving.
- Mobile: verify 480px and 768px layouts; tickets stack; map hotspots tappable.
- Data-driven: confirm changing a value in `invitationalData.ts` updates the page.
