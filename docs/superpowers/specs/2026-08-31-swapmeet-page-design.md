# /swapmeet — Love & Lob Swap Meet page

**Date:** 2026-08-31
**Event:** Thu Sep 3 – Fri Sep 4, 2026 · Moxy Williamsburg, Brooklyn NY 11211
**Ship deadline:** Wed Sep 2 (event opens the following day)

## Goal

A public event page at `/swapmeet` for people deciding whether to show up —
what the Swap Meet is, when and where, what happens, and who is vending.

Structurally modeled on [advantagefair.com](https://advantagefair.com/): one
long scroll, no sub-routes, a named-zone section that turns a vendor list into
an experience, and a single small vend/partner CTA at the bottom.

## Source material and what we take from it

**Canva deck** "L&L Swap Meet Ivan Edits" (24 pages, 8 active: 1, 2, 5, 6, 7, 8,
9, 10). The deck is a *sponsor pitch*, not an event page — most slides address a
brand deciding whether to buy a booth, not an attendee deciding whether to come.

| Slide | Decision |
|---|---|
| 1 Cover | Tagline only — "Tennis On Court. Culture Off It." |
| 2 About | **Use** — the L&L one-liner |
| 5 Audience (9% IG engagement, 73% BIPOC, 62/38 W/M, 1,000+ attendees) | **Omit.** Media-kit material; publishing audience demographics on a public invite reads as audience-for-sale. Owner approved omitting on 2026-08-31. |
| 6 The Activation | **Use** — core "what it is" copy |
| 7 The Venue | **Use** — the day/night room split |
| 8 Brand Partnerships | **Use** — featured roster (past-partner logos omitted) |
| 9 Vendor Packages | **Collapse** to a single "vend or partner with us" CTA. No tier breakdown, no pricing. |
| 10 Founders + contact | **Collapse** into the same CTA — contact details only, founder bios omitted |

**Flyer** (`src/assets/swapmeet/flyer.jpg`): dates, venue, 2PM start, the six
activity names, and four roster brands the deck omits.

## Theme

Site palette, **not** flyer palette. The flyer's cream/black/neon-green is
hero *artwork* on the page; a full-page treatment in those colors would fight
the rest of the site. Page chrome matches `/invitational`:

- background `rgba(0, 66, 37, 0.96)`, text `#F1F0E2`, accent `#d8e84d`
- headings Playfair Display 900, body Inter
- `data-page="swapmeet"` boot flag on `documentElement` so `body`/`#root` are
  green before React mounts (no cream flash), mirroring `/invitational`

Convenient: the deck's own slides are already deep green with white type, so
deck copy and site chrome agree without retouching.

## Architecture

New directory `src/components/ui/swapmeet/`, a sibling of `invitational/` and
following the same data-driven shape — one typed data module holds every string,
and each component is a dumb renderer over a slice of it.

```
src/components/ui/swapmeet/
├── swapMeetData.ts     # all copy, roster, schedule, zones — single source of truth
├── SwapMeetPage.tsx    # composition only
├── SwapMeetHero.tsx    # title, tagline, date badge, venue line
├── DayCards.tsx        # Sep 3 / Sep 4 two-up
├── ExpectGrid.tsx      # the six flyer activities
├── BrandRoster.tsx     # logo wall + blurbs, text fallback
└── swapmeet.css
```

Reused unchanged: `SubPageWrapper` (exit animation, logo hiding, link
interception) and `useBottomScroll` (nav link reveal). No new hooks, no store
changes.

### Registration points (all four verified 2026-08-31)

| File | Change |
|---|---|
| `src/App.tsx` | import `SwapMeetPage`; `<Route path="/swapmeet" element={<SwapMeetPage />} />` beside the `/invitational` route |
| `src/components/ui/RouteSync.tsx` | `pathname === '/swapmeet' ? 'birdseye'`; extend the `data-page` branch to cover both green pages |
| `src/components/ui/Navigation.tsx` | add `/swapmeet` to `isDarkPage` (line 18) and `isSubPage` (line 19) |
| `src/App.css` | add `.sm-page` to both allowlists (scroll, line 47; z-index, line 79) |

`birdseye` is shared with `/schedule` and `/invitational`, so navigating between
them needs no camera move.

## Page sections

1. **Hero** — "Love & Lob Swap Meet" / *Tennis On Court. Culture Off It.* /
   Sep 3–4 2026 / Moxy Williamsburg · Brooklyn, NY 11211.
2. **Flyer** — full-bleed image, its own section (same treatment as
   `/invitational`'s `.inv-flyer`).
3. **What it is** — slide 6 near-verbatim: *"A curated marketplace engineered
   for emerging and independent tennis labels to gain direct consumer discovery
   without legacy corporate marketing budgets. Spotlighting brands producing
   small-run apparel, design-forward equipment, and lifestyle goods."* Closes on
   the slide-6 kicker (*"a high-vibe marketplace that rewards design identity
   and community over mega-budget advertising"*) plus the slide-2 L&L
   one-liner. The US Open timing note is **reframed for attendees** — peak
   tennis week in NYC — rather than the deck's "reaching local tastemakers and
   visiting tennis tourists," which is sponsor-facing.
4. **Two nights, two rooms** — the Advantage Day 1 / Day 2 slot, done with real
   content instead of their "programming TBA":
   - **Thu Sep 3 — The Launch Party**, Lillistar Rooftop. Indoor-outdoor
     layout, panoramic skyline views of the Williamsburg Bridge, live DJ sets,
     signature cocktails.
   - **Fri Sep 4 — The Marketplace**, The Garden / Courtyard. Doors 2PM.
     Browsable room layout, zero dead space.
5. **What to expect** — the six flyer activities as a card grid: Embroidery,
   Video Games, Shops, Panel, Trading Cards, Trivia. One short blurb each,
   newly written. This is the section doing the work Advantage's four named
   zones do — it is what makes a vendor list read as a designed experience.
6. **The roster** — logo wall reusing `/invitational`'s cream-knockout CSS
   (`filter: brightness(0) invert(1)`), one-line blurb per brand, text-name
   fallback for any logo that cannot be sourced in time.
7. **Venue** — address, map link, and the day/night room split restated as
   logistics.
8. **Vend or partner with us** — one block: `info@loveandlob.co`,
   `@loveandlobnyc`. Everything from slides 9 and 10 that belongs in public.

## Brand roster

Eight brands: four from deck slide 8's "Swap Meet Featured Roster" (Video Game
Amateurs, Sigrún, Grey Goose, EC), four more from the flyer's logo row (Bageled
NYC, Racquet, Vibe Tennis, Players NYC).

**Names and logos only — no per-brand blurbs.** Drafted blurbs were cut on
2026-08-31 at the owner's direction. Five of the eight could only be described
by inference from the flyer and deck, and per project convention we do not
publish invented copy about a real business; a wordmark wall says exactly what
is true (these brands are in the room) and nothing that is not.

`RosterBrand` carries an optional `logo` field wired to the same cream-knockout
treatment `/invitational` uses (`filter: brightness(0) invert(1)`), with the
brand name set as a wordmark when no logo is present. Every brand currently
falls back to its name; dropping files into `src/assets/swapmeet/brands/` and
importing them in `swapMeetData.ts` is the only change needed to light them up.

Past-partner logos from slide 8 (Mottley, Leisure Hydration, Bronx Brewery,
Pablo's Mate, Furi Sport) are **not** on this page — they are pitch credibility,
not Swap Meet attendees.

## Ticketing

The Swap Meet is **not on Sweatpals** as of 2026-08-31. The host page lists
seven slugs, none matching; six likely slug spellings return 404. Therefore:

- the page CTA is attend-and-pull-up, with no RSVP link
- `SPECIAL_EVENT_SLUGS` in `api/_sweatpals.js` is **not** modified

If the event is later published on Sweatpals, adding its slug to
`SPECIAL_EVENT_SLUGS` is the only change needed to make it the featured card on
`/schedule`.

## Assumptions

Two, both flagged to the owner and neither blocking:

1. **Thu Sep 3 is the rooftop launch party; Fri Sep 4 is the daytime
   marketplace at 2PM.** Derived from the owner's own framing plus deck slide
   7's day/night split. Sep 4 renders "Doors 2PM" (from the flyer); Sep 3's
   start time is written as evening-unspecified rather than invented.
2. **No RSVP or ticket link exists** (verified above).

## Out of scope

- Any change to the 3D scene, camera modes beyond registration, or the store.
- A facility map. `/invitational` has one; a hotel courtyard does not need one.

## Related fix (separate commit)

`PROGRAM_SLUGS` in `api/_sweatpals.js` had gone stale — Sweatpals had recreated
four series under fresh slugs, so `/schedule`'s Upcoming list was rendering 2
programs instead of 6. Refreshed 2026-08-31 against the host scan; each retired
slug failed both documented retirement conditions (delisted from the host page
*and* last instance in the past). `public/events.json` regenerated. Unrelated to
the Swap Meet page and committed on its own.

## Testing

- `pnpm build` (type-check + production build) and `pnpm lint` clean.
- Playwright screenshot verification per project convention: run from repo
  root, tall viewport rather than `fullPage`, against `http://localhost:5173`.
  Verify at desktop and at the 480px mobile breakpoint.
- Route checks: `/swapmeet` renders green with no cream flash on hard load;
  nav uses the light icon; the logo hides; nav links appear at scroll bottom;
  navigating `/swapmeet` → `/schedule` does not move the camera.

## Design pass (2026-08-31, after first build)

The first build read as generic. Audited against Jacob Perks, "How to stop your
frontend looking AI-generated" (Bootcamp, Aug 2026), fixing by domain rather
than by page. Palette held fixed at the owner's instruction and verified by
pixel sample: plain green reads `rgb(7,70,43)` without grain and `rgb(7,72,45)`
with it, a 2/255 drift.

**Layout.** Hero de-centred into an asymmetric grid (type 1.15fr left, flyer
0.85fr right, bottom-aligned) — symmetry was the "nobody made a decision" tell.
"What to expect" moved off a three-across card grid onto an indexed 01–06 run
sheet. Roster moved off a 4×2 grid onto a flowing wordmark strip. Venue and CTA
merged into one two-up closing section. Card chrome (border + fill + radius)
dropped everywhere; rules and spacing carry the structure instead.

**Baseline alignment.** The two day cards drifted because only Friday had a door
time. Both now render a time slot (Thursday reads "Time to be announced" until
the owner supplies it) and `grid-template-rows: subgrid` pins every line across
both cards. Regression-checked in the verify script.

**Type.** An eight-step scale lives in custom properties on `.sm-page`; every
size references it, replacing ad-hoc values (0.85/0.95/1.05/1.1/1.15/1.35rem).
`text-wrap: balance` on headings, `pretty` on paragraphs — the h1 now breaks
"LOVE & LOB / SWAP MEET" like the flyer instead of orphaning the ampersand.
Italic emphasis removed.

**Surface.** Depth from an `feTurbulence` film grain (0.14, `soft-light`), not a
gradient — it also echoes the flyer's distressed print. No gradients existed.

**Copy.** Five em dashes removed. "High-vibe" and "zero dead space" cut. Links
name their outcome ("Open the venue in Maps", "Email info@loveandlob.co").

**Accessibility.** The hero was a `<header>` inside a plain div, registering as a
banner landmark competing with the site nav; it is now
`<section aria-labelledby>`. Added a `prefers-reduced-motion` block and
`:focus-visible` states, both previously missing.

**Font kept deliberately.** The article bans Inter. Playfair Display 900 over
Inter is the site-wide pairing and is already the display-over-quiet-body
contrast the article endorses; changing it on one page would isolate
`/swapmeet` from every other page. Recorded as a decision, not a default.

**Bug found during the pass:** at one column `.sm-days` still declared five
explicit grid rows, leaving ~7.5rem of dead space below the cards on mobile.
