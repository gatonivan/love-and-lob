# Schedule Studio — self-healing slug reconcile + debug page

**Date:** 2026-09-15
**Status:** Approved for planning
**Owner:** Ivan (gatonivan) · **Primary user:** Khari

---

## 1. Problem

The `/schedule` page reads live from Sweatpals, but *which* series it reads is a
pair of hardcoded arrays in `api/_sweatpals.js` (`SPECIAL_EVENT_SLUGS`,
`PROGRAM_SLUGS`). Sweatpals periodically recreates a recurring series under a
fresh alias. The old alias keeps resolving but stops advancing, so the program
silently drops off the site — **no error, no empty state, just a shorter list.**

This has now happened three times (2026-08-20, 2026-08-31, 2026-09-15). On
2026-09-15 five of six curated programs were dead at once and the Upcoming list
was down to a single clinic. Each recovery required Ivan to hand-edit code and
push.

Two things are wrong with that:

1. **It fails silently.** Nobody finds out until someone looks at the page.
2. **It requires Ivan at a keyboard.** Khari, who runs the programming and knows
   first when a series changes, cannot fix his own schedule.

### What is *not* the problem

Event *data* already self-refreshes. `api/events.ts` calls `fetchScheduleData()`
on every request behind a 10-minute edge cache (`s-maxage=600`). Times, titles,
cover images and next-occurrence dates are live within 10 minutes with no
intervention. **Only slug rotation rots.** A "refresh the data" button would be
a no-op; this spec deliberately does not build one.

---

## 2. Goals

- The schedule **heals itself** without a human, on a cadence (~3 days).
- Khari is **told what happened**, and never has to ask Ivan.
- Khari has a **manual override** for when he can't wait 3 days, usable **from
  his phone**.
- Khari **never sees a slug.** Plain English only.
- A Sweatpals outage or markup change can **never** empty the schedule.

## 3. Non-goals

- Editing event content (titles, times, prices) — that stays in Sweatpals.
- Any general-purpose CMS or admin panel. This does one job.
- Per-user identity/audit. Two trusted people share one door.
- Fixing the broken GitHub Pages mirror (see §11).

---

## 4. Verified current state

Claims below were checked against the repo and the live site on 2026-09-15, per
the "verify before asserting" rule.

| Fact | Evidence |
|---|---|
| loveandlob.co is served by **Vercel** | `curl -sI https://loveandlob.co` → `server: Vercel` |
| Apex 307-redirects to `www` | same; use `-L` when verifying |
| Live API works and is current | `GET https://www.loveandlob.co/api/events` → 6 clinics |
| Event data is live, 10-min cached | `api/events.ts:8` `s-maxage=600, stale-while-revalidate=300` |
| Slug lists are hardcoded | `api/_sweatpals.js` `SPECIAL_EVENT_SLUGS`, `PROGRAM_SLUGS` |
| Retirement rule already documented | comment block above `PROGRAM_SLUGS` |
| Recurring series expose next date in `instance` | `nextStart()` / `nextEnd()` in `_sweatpals.js` |
| **No auth anywhere** in the repo | only `process.env` use is `BREVO_API_KEY` in `api/subscribe.ts:13` |
| **No test framework** installed | `package.json` devDependencies |
| Existing serverless pattern | `api/subscribe.ts` (Brevo, env secret, JSON in/out) |
| A daily GH Action already exists | `.github/workflows/deploy.yml`, `cron: '0 8 * * *'` |
| …but it deploys to the **broken** Pages mirror | base-path mismatch; not canonical (see §11) |
| …and still references **Luma** | `VITE_LUMA_API_KEY`, dead since the Sweatpals migration |

---

## 5. Architecture

Three moving parts, one shared brain.

```
                    ┌────────────────────────┐
                    │   api/_reconcile.js    │  pure functions, no I/O
                    │   classify + guards    │  ← the only place policy lives
                    └───────────┬────────────┘
                                │
              ┌─────────────────┴─────────────────┐
              │                                   │
   ┌──────────▼───────────┐          ┌────────────▼─────────────┐
   │ GH Action (every 3d) │          │  /studio  (Khari's page) │
   │ scripts/reconcile    │          │  scan = read-only diff   │
   │ writes + commits     │◄─────────┤  apply = workflow_dispatch│
   └──────────┬───────────┘  triggers└──────────────────────────┘
              │
      commit to main → Vercel redeploys → live
              │
      ┌───────▼────────┐
      │  Brevo email   │  "here's what changed" / "couldn't read Sweatpals"
      └────────────────┘
```

### 5.1 Why one write path

Both triggers end in **the same commit implementation**. `/studio`'s Apply does
not commit directly — it fires `workflow_dispatch` on the same Action. Reasons:

- **DRY.** One place that writes the file, one place to test, one place to
  secure. A second browser-side commit path would duplicate the riskiest code.
- **Weaker secrets.** No `contents: write` PAT in Vercel env — the commit uses
  the Action's built-in `GITHUB_TOKEN`, and Vercel holds only a dispatch-scoped
  token (see §7).
- **Safer.** The job re-scans at run time rather than trusting a diff the
  browser computed, so a stale tab can't apply stale conclusions.

Cost: Apply feels slower (~2–3 min to live vs ~90 s) and reports "kicked off"
rather than "done". Acceptable — the cron is the primary path; this is override.

---

## 6. Components

### 6.1 `api/schedule-slugs.js` *(new — generated data module)*

The curated lists move out of `_sweatpals.js` into a file with nothing but data:

```js
// AUTO-GENERATED by the schedule reconcile job. Safe to hand-edit — same shape.
export const SPECIAL_EVENT_SLUGS = []
export const PROGRAM_SLUGS = [
  "absolute-beginner-clinic-greenpoint",
  // …
]
export const UPDATED_AT = "2026-09-15T18:00:00.000Z"
```

`_sweatpals.js` re-exports these, so **every existing consumer is unchanged.**

Written by **regenerating the whole file from a template** (`renderSlugsFile()`)
— never parsed, never patched, no regex. `.js` rather than `.json` because JSON
imports need import assertions that vary across Node versions, and the deploy
should not depend on that.

### 6.2 `api/_reconcile.js` *(new — the brain, pure)*

No network calls inside the classifier; it takes fetched data and returns a
verdict, which is what makes it trivially testable.

- `scanHostAliases(html)` — extract aliases from the host page
- `classify(curated, discovered, probes, now)` → per-slug verdict:

| Verdict | Condition | Action |
|---|---|---|
| `healthy` | on host page **and** has future instance | keep |
| `dead` | delisted **and** (past **or** 404) | **remove** |
| `new` | on host, not curated, has future instance | **add** |
| `quiet` | on host, no future instance | keep — series between publishes |
| `orphan` | delisted, still has future instances | keep, flag in email |

This is the retirement rule **already written in the `PROGRAM_SLUGS` comment** —
automating existing policy, not inventing new policy.

New events bucket by `eventType`: `EVENT`/`RETREAT` → special, `CLASS` →
programs. This is what cleanly separated the tournaments from the clinics.

### 6.3 Safety guards — the part that matters most

`classify()` refuses to produce a changeset when:

1. **The scan returned zero aliases.** Treated as *scan failure*, never as
   "remove everything." Without this, a Sweatpals outage wipes the schedule.
2. **The list would shrink by more than half.** Guards *net* size, not gross
   removals — because the common real event is a **rotation**, not a deletion.
   On 2026-09-15 five of six programs died *and* five new ones appeared: net
   size held at 6, which is healthy churn that should auto-apply. Five deaths
   with zero replacements is a different animal and bails for review.
   A gross-removal guard would have blocked the exact scenario this project
   exists to fix — caught in spec review, noted so it isn't "simplified" back.
3. **A slug still has future instances.** Never removed, whatever the host page
   says.
4. **A candidate has no future instance.** Never added.
5. **Nothing changed.** Exit clean: no commit, no email, no deploy.

### 6.4 `scripts/reconcile-slugs.mjs` *(new — cron entry)*

Fetch host page → probe all slugs → `classify()` → if changeset: render file,
`git commit`, `git push` → email. If guard tripped or scan failed: email only,
exit non-zero.

### 6.5 `.github/workflows/reconcile-schedule.yml` *(new)*

```yaml
on:
  schedule:
    - cron: '0 9 */3 * *'   # ~every 3 days, 9:00 UTC
  workflow_dispatch:         # /studio's Apply fires this
permissions:
  contents: write
```

Separate workflow, **not** bolted onto `deploy.yml` — that one deploys to the
broken mirror (§11) and shouldn't gain responsibilities.

*Known wart:* GitHub's `*/3` day-of-month resets at month boundaries, so the gap
can be 1–3 days around the 1st. Harmless here; documented so it isn't mistaken
for a bug.

### 6.6 `api/studio.ts` *(new — endpoint)*

Follows the `api/subscribe.ts` shape.

- `POST {action:'scan'}` → read-only diff, no writes
- `POST {action:'apply'}` → `workflow_dispatch`, returns immediately

**Both** actions require `x-studio-key` matched against `STUDIO_PASSPHRASE` via
`crypto.timingSafeEqual`. Scan is gated too — otherwise it's an open proxy
hammering Sweatpals from your domain.

### 6.7 `src/components/ui/StudioPage.tsx` + `.css` *(new)*

Mobile-first — Khari will be on a phone. Passphrase once → localStorage. Cards
in plain English, no slugs:

> ❌ **Cardio Tennis (Brooklyn College)** — gone from Sweatpals, last class Aug 26
> ➕ **Drill & Play (Greenpoint)** — new, next one Sat Sep 19
> ✅ 5 others healthy

One **Update the site** button. Disabled when there's nothing to do or the scan
failed. `<meta name="robots" content="noindex">`.

---

## 7. Security

The passphrase can cause a commit to your repo, so state the blast radius
plainly: **worst case someone guesses it and reorders your clinic list, and you
`git revert`.** Bounded, recorded, reversible.

- `STUDIO_PASSPHRASE` in Vercel env — never in the client bundle
- Timing-safe comparison; generic failure message
- **Commits** use the Action's built-in `GITHUB_TOKEN` (`contents: write`),
  scoped to this repo by GitHub and expiring per-run.
- The **only** long-lived credential is `GH_DISPATCH_TOKEN`, a fine-grained PAT
  scoped to this repo with **`actions: write` and nothing else**. It cannot
  write repo contents — it can only *start* a workflow whose behaviour is fixed
  in committed, guarded, test-covered code. Stealing it buys an attacker the
  ability to make the schedule reconcile itself, which is what the button does
  anyway. Correcting an earlier draft of this spec that claimed no PAT was
  needed at all: one is, just a much weaker one than a `contents: write` PAT.
- `/studio` is `noindex` and unlinked from site navigation

---

## 8. Notifications (Brevo — reuses existing `BREVO_API_KEY`)

| Event | Email |
|---|---|
| Changes applied | what changed, in plain English, + link to the commit |
| Guard tripped | what it wanted to do and why it refused |
| Scan failed | "couldn't read Sweatpals — schedule may go stale" |
| No changes | **silent** |

The failure email is not optional: a self-healing job that goes quiet when it
breaks is worse than no job, because it manufactures false confidence.

---

## 9. Testing (vitest — net-new to this repo)

`classify()` is pure, and it decides what gets **deleted** from a live site, so
it gets real coverage. Fixtures captured from actual Sweatpals responses.

- All five verdicts, including the subtle two (`quiet` vs `dead`, `orphan`)
- `instance` vs `startDate` precedence — the 2026-08-20 regression, locked down
- Every guard in §6.3, each asserted to produce **no changeset**
- Empty scan ≠ wipe (highest-stakes assertion in the suite)
- `renderSlugsFile()` output parses as valid ESM and round-trips
- Replay of the real 2026-09-15 rotation (5 dead + 5 born) → expect it to
  **auto-apply**, since net size holds
- Same rotation with the 5 replacements withheld → expect **guard tripped**

---

## 10. Failure modes

| Failure | Behaviour |
|---|---|
| Sweatpals down / markup changed | scan fails, no changeset, failure email |
| Sweatpals returns partial list | guard 2 catches mass removal, email |
| GitHub API down | `/studio` shows error; nothing written |
| Action fails | GitHub's own failure notification + our email |
| Two applies at once | Action concurrency group; second waits |
| Bad commit reaches main | `git revert`; list is plain data |
| `/studio` broken entirely | cron keeps healing; site unaffected |

---

## 11. Related finding — `deploy.yml` is dead weight

Surfacing rather than silently fixing, since it's outside this spec's scope.

`.github/workflows/deploy.yml` runs **daily** and:

- deploys to `gatonivan.github.io/love-and-lob/`, which is **broken** by a
  base-path mismatch and is not the canonical site;
- still injects `VITE_LUMA_API_KEY` for a "Fetch upcoming events from **Luma**"
  step, dead since the Sweatpals migration;
- burns a build every day producing an artifact nobody loads.

Options: delete it, fix the base path if the mirror is wanted as a fallback, or
leave it. **Recommend deleting** — a broken mirror that looks maintained is
worse than no mirror. Ivan's call, tracked separately.

---

## 12. Decisions taken

| # | Decision | Rationale |
|---|---|---|
| 1 | Auto-apply, not notify-only | Must work with Ivan away from his PC |
| 2 | `/studio` exempt from the canvas-overlay rule | Debug tool, not a brand page; shouldn't pull Three.js or wait on a camera move. **Add the exemption to CLAUDE.md** rather than leave the rule silently contradicted |
| 3 | Scraping allowed *here*, narrowly | The ban was on scraping as the **live data source**. This is slow-cadence, guarded, committed to git, revertible — and never serves a pageload |
| 4 | Shared passphrase | Two trusted people; swappable for Vercel Password Protection if the account moves to Pro |
| 5 | Add vitest | The classifier deletes things from a live site |
| 6 | Single write path via `workflow_dispatch` | DRY; one secret, one tested code path |
| 7 | `UPCOMING_LIMIT` = 6 | Shipped 2026-09-15 per Khari ("first 5-6") |

## 13. Out of scope

Editing event content · multi-user identity · fixing the Pages mirror ·
replacing Sweatpals as source of truth
