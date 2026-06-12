# Invitational Vol. 2 — Content Fill + Atlantic Beach Map Rebuild

**Date:** 2026-06-11 · **Event:** Sat June 13, 2026, 12:30–6:30 PM, Atlantic Beach Tennis Center (60 The Plz)
**Source of truth:** Notion "Invitational Webpage" doc + owner's answers in session.
**Approved direction:** Option A — rebuild the interactive SVG facility map as a hand-drawn-style Atlantic Beach layout.

## Decisions made with the owner

- Overall event window is **12:30–6:30 PM** (owner decree; Notion's 12:00–7:00 block compressed to fit).
- Tennis Registration: **SOLD OUT** badge + full inclusions. Spectator: inclusions + CTA → SweatPals checkout link. No hard-coded spectator price (checkout page carries it).
- Flyer (provided in session) goes full-width under the hero.
- Sponsors: **text-based wall**. USTA Eastern = title sponsor, top billing with blurb. Broken Strings + Punto Grips included name-only (no blurbs supplied).
- Truncated Notion FAQ bullet ("If you w—") is dropped; rest of answer stands.
- Current map artwork/SVG was the US Open reference, not the venue — replaced entirely.

## Page order

Hero → Flyer → Venue/intro → Facility Map → Tickets → Schedule → How the Tennis Works (new) → FAQs + Directions → Sponsors.

## Schedule (compressed into 12:30–6:30; FAQ times synced to this)

12:30 Registration & Welcome · 1:25 Warmup & Drills · 2:15 Games (L&L vs. Courtside Theory) · 4:15 Lunch Break · 5:00 Game On, Again · 6:30 Winners Announced.

## Data model changes (`invitationalData.ts`)

- `Faq.answer: string` → `string[]` (multi-paragraph answers, shuttle schedule).
- `Sponsor` gains `blurb?` and `role?` ('Title Sponsor').
- New `narrative` block: lead + titled bullet groups (Drills / Games).
- New `flyer: { image, alt }`.
- `map.image` removed — SVG map is self-contained; US Open artwork figure deleted.
- `showOnSchedule` → `true` (featured card publishes on /schedule).

## Facility map (FacilityMap.tsx rebuild)

Stylized hand-drawn Atlantic Beach layout, truthful relationships: The Plaza road at top, main gate + check-in clubhouse, free parking lot with shuttle stop (Inwood LIRR), 10 clay courts in two clusters, pickleball courts = spectator Red Ball Zone, lunch area (Taqueria Ramirez), boardwalk south to Shores West Beach Club, sand + ocean strip at bottom. Palette pulled from the flyer (sand, sage greens, clay terracotta, sea blue, soft orange sun). Interactive zones keep the existing hover/tap + caption pattern; descriptions carry useful event facts (parking rules, beach pricing, shuttle last bus).

## Out of scope

- Real spectator pricing display (lives on SweatPals).
- AI-generated illustrated artwork version of the map (owner may supply later).
- Walkthrough-video-specific design notes (owner reviewing; revisit if he finds anything).

## Verification

`pnpm lint` + `pnpm build` clean; visual pass on map and mobile breakpoints (768/480).
