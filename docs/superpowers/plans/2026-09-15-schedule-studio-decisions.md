# Decisions taken during the schedule-studio build

These are every ruling the build process made autonomously, in order. They are
recorded so they can be audited and reversed — a decision made on your behalf
that you never see is a decision you never actually made.

Spec: `docs/superpowers/specs/2026-09-15-schedule-studio-design.md`  
Plan: `docs/superpowers/plans/2026-09-15-schedule-studio.md`  
Branch: `feat/schedule-studio` (20 commits)

---

### 1. implementers push NOTHING. All commits stay local on
`feat/schedule-studio`; the branch is pushed and merged only after the final
review, by the human partner's decision via finishing-a-development-branch.
Every dispatch carries "do not run git push". — Cost if wrong: none; a push
deferred is trivially recoverable, a premature push to main is not.

### 2. implementers do the local half (write the code, type-check it) and
SKIP the production curl/screenshot steps; those move to a post-merge
checklist surfaced at finish. Task 9 keeps the deliberate-break type-check
sanity test, which is local and does work. — Cost if wrong: production auth
verification happens after merge instead of before; mitigated by making it a
blocking checklist item the human partner sees.

### 3. skip; folded into the same post-merge checklist as F2. — Cost if
wrong: the workflow's first real run is its manual post-merge trigger rather
than a rehearsal.

### 4. the value is a GitHub secret set by hand and appears in no committed
file, so nothing blocks. Docs say "your two addresses" rather than naming
any. — Cost if wrong: none; a secret's value is not a code artifact.

### 5. concern 1 (vite.config `defineConfig` must come from `vitest/config`,
not `vite`) — ACCEPT the deviation. The brief's snippet was wrong; `test` is
not a known Vite config key without Vitest's type augmentation, so `tsc -b`
fails as written. The implementer's fix is the documented Vitest idiom.
— Cost if wrong: none, it is the vendor-recommended form.

### 6. concern 2 (brief's Step 6 re-export was incomplete — `PROGRAM_SLUGS`
is referenced directly inside `fetchScheduleData()`, not only as a default
parameter, so the literal brief produces a runtime ReferenceError) — ACCEPT
the deviation; the brief had a genuine defect my pre-flight scan missed. I
checked the `SPECIAL_EVENT_SLUGS` default-parameter binding and did not check
for direct references to `PROGRAM_SLUGS`. Verified by the implementer running
scripts/fetch-events.js. — Cost if wrong: none; without it the schedule
pipeline throws at runtime.

### 7. Important #1 (playwright devDep commingled into the refactor commit)
— FIX IT, fix round 1. The finding is plan-mandated (my brief's Step 8 listed
package.json/pnpm-lock.yaml), so it is mine to rule on. Splitting is chosen
over parking because the branch is unpushed, making this the cheapest it will
ever be, and because an unrelated dependency landing under a
`refactor(schedule):` subject misleads future git archaeology. The dependency
itself STAYS -- playwright is genuinely the project's screenshot tool -- it
just gets its own commit. — Cost if wrong: one extra fix round spent on
history hygiene.

### 8. Minor #2 (double quotes / no trailing comma in schedule-slugs.js
differ from codebase single-quote style) — REJECT, do not "fix". The reviewer
could not know this: `api/schedule-slugs.js` is MACHINE-GENERATED from Task
2's renderSlugsFile(), which emits slugs via JSON.stringify and therefore
double quotes. Converting this file to single quotes would make the very
first reconcile run rewrite the whole file, producing phantom diff churn and
obscuring real slug changes. The current style is correct precisely BECAUSE
it matches the generator. — Cost if wrong: a cosmetic inconsistency with
neighbouring hand-written files, which is the lesser evil.

### 9. Minor #3 (disjointness test is trivially satisfied while
SPECIAL_EVENT_SLUGS is empty) — ACCEPT as deferred. The invariant is real and
will be exercised the moment a tournament is published; the assertion costs
nothing and guards a real failure mode (an event rendering twice). Not worth
synthetic fixture data at this layer — Task 3's classifier tests cover
bucket-disjointness directly with populated lists. — Cost if wrong: one test
that passes vacuously until the next tournament.

### 10. skipped the dispatched scoped re-review for this round. The fix was a
pure history rewrite: `git diff 0bbd375 7cbe4b1` is EMPTY, so the tree a
reviewer would examine is byte-identical to the one already reviewed Spec ✅ /
quality Approved. Verified directly instead: exactly 2 commits in order,
playwright confined to 570c681 (package.json +1, lockfile +29), and zero
playwright lines in 7cbe4b1. Dispatching a reviewer at an empty diff buys
nothing. — Cost if wrong: a content change could hide inside a rewrite I
mis-verified; mitigated because the emptiness check is exactly the assertion
that rules that out.

### 11. Minor #1 (renderSlugsFile does no disjointness validation between the
two slug arrays, despite its own header comment warning they must stay
disjoint) — NO ACTION, correct as designed. renderSlugsFile is a dumb
template; enforcing invariants there would put policy in the wrong layer.
Disjointness is already guaranteed upstream by Task 3's `place()` helper,
which refuses to add a slug already present in either bucket, and is asserted
by T3's "never lets a slug land in both buckets" test. Validating twice would
split one rule across two files. — Cost if wrong: a hand-edited
schedule-slugs.js could introduce a duplicate that only the classifier would
later correct.

### 12. Minor #2 (process note — reports should inline actual diff output
rather than asserting "IDENTICAL") — ACCEPT for future dispatches; not a code
defect, nothing to fix here. — Cost if wrong: reviewers keep re-deriving
claims, which this reviewer did anyway and which is the safer default.

### 13. Important #1/#2 (the "never lets a slug land in both buckets" test is
vacuous — it curates `tourney` into `special` AND gives it eventType 'EVENT',
so the curated bucket and the eventType-derived bucket coincidentally agree;
the test would still pass if a refactor let eventType override the curated
bucket) — FIX, fix round 1. Plan-mandated, so mine to rule on: the defect is
in the brief's prescribed test, not implementer deviation. Fixing now rather
than parking because Task 4 modifies this exact file and builds guard logic on
top of this classifier -- a vacuous test here is a regression hole directly
underneath the next task. Reviewer confirmed the IMPLEMENTATION is correct
(curated bucket wins on a genuine mismatch); only the proof is missing.
— Cost if wrong: one round spent tightening a test on already-correct code.

### 14. Minor #3 (hasFuture's boundary — an event ending exactly at `now`
counts as future — is untested and unstated in the brief) — FIX in the same
round. Normally a minor would defer, but it costs one assertion, it is in the
same file the fix round already touches, and Task 4's guards do arithmetic on
exactly this predicate, so pinning the boundary before that is worth more than
the round it saves. Matches the stated project preference for too many tests
over too few. — Cost if wrong: negligible.

### 15. Critical #1 (a total wipe passes both guards whenever before <= 3,
because `before >= MIN_LIST_FOR_RATIO_GUARD` short-circuits the ratio and
leaves NO lower bound — 3->0 is permitted) — FIX, fix round 1. This is my spec
defect, not implementer deviation: the brief dictated MIN=4 and the ratio
design. It is live, not theoretical: the real list holds 6, 6->3 is allowed
(exactly half), and the next run then sees before=3 where 3->0 is allowed.
TWO unattended runs, days apart, empty the schedule with both guards green --
the precise catastrophe these guards exist to prevent. Reachable whenever the
listing endpoint answers but per-series probes fail, which is a commoner
partial-outage shape than a blackout. Fix is the reviewer's: an unconditional
`after === 0 && before > 0` floor placed AHEAD of the MIN exemption. A
legitimate total shutdown (a real winter break) then requires one human
confirmation, which is correct. — Cost if wrong: a genuine full-stop of
programming needs a manual apply instead of auto-applying.

### 16. Critical #2 (MIN_LIST_FOR_RATIO_GUARD is pinned by no test — deleting
the clause, or setting MIN=2, both pass 19/19) — FIX same round. Mutation
testing proved the constant that CAUSES Critical #1 is the one thing the suite
does not constrain. — Cost if wrong: none; these are additive tests.

### 17. Important #1 (exact-half boundary untested; `<` -> `<=` passes 19/19,
and that mutation would permanently stall the job on a legitimate half-trim)
and #2 (withheld-replacements test omits the `next === null` assertion that
the other guard path has) — FIX same round, both trivial and both guard the
stated catastrophic failure mode.

### 18. Minor #2 (guard 1 does not `Array.isArray(discovered)`; a mis-shaped
string response yields per-character "slugs") — FIX same round. Normally
deferred, but it is one expression inside the outage guard itself, and the
whole point of that guard is surviving a malformed upstream.

### 19. Minor #1 (a wholesale swap to an unrelated venue's listings is
indistinguishable from a healthy rotation and auto-applies) — ACCEPT as
designed, no code change. It is the unavoidable dual of allowing rotations,
which is the system's core purpose. Mitigate in Task 6's notification: the
email already names every added and removed item, so a 100% swap is visible to
a human the same day. — Cost if wrong: a redirect or wrong-venue scrape
replaces the schedule for up to one notification cycle.

### 20. Minor #3 (a slug duplicated across both curated buckets inflates
`before` because curatedAll concats while place() dedupes) — ACCEPT, no
change. It errs toward over-blocking, which is the safe direction, and
disjointness is enforced upstream by place(). — Cost if wrong: one spuriously
blocked run on a hand-corrupted file.

### 21. R1 (NEW Critical from the coverage hunt — guard 1 rejects empty and
non-array scans, but a NON-EMPTY JUNK scan still destroys data: every curated
slug looks delisted, so every `quiet` slug (listed but between publishes,
which the retirement rule says must never be removed) is reclassified `dead`
and deleted) — REAL and LOAD-BEARING, but the fix belongs in Task 5, not a
Task 4 round 2. Reasoning: guard 1 can only ask "is this scan trustworthy",
and the component that can actually answer is the scanner. Task 5 builds
`scanHostAliases()` and owns scan shape. Note the reviewer's literal repro
(`['<!doctype html>']`) is NOT reachable through the real pipeline, because
Task 5's ALIAS_RE `/"alias":"([a-z0-9-]+)"/g` can only ever emit well-formed
slugs — but a PARTIAL parse (markup changes so only 1 of 6 events still
matches the old shape) is reachable and has the same effect. Carried into
Task 5's dispatch as an explicit requirement rather than parked.
— Cost if wrong: a degraded-but-non-empty scan deletes quiet programs for one
cycle; bounded below by the zero-floor and visible in Task 6's email, which
names every removal.

### 22. deferred "added slugs can mask a 100% removal" (6 curated all die, 3
new appear -> after=3, exactly half, green, every originally-curated entry
gone in one run) — ACCEPT as designed, no code change. It is the same
net-vs-gross tradeoff the spec defends: indistinguishable from the rotation
the system exists to heal, and the survivors are real upcoming series, so the
site is never empty or wrong. — Cost if wrong: a wholesale venue change
replaces the schedule a cycle before a human reads the email.

### 23. deferred "spec guard 1 text says only 'returned zero aliases' and
omits the new Array.isArray type check" — FIX in Task 5's spec touch, where
scan-shape validation is already being documented. Code blocks a strictly
larger input set than the spec describes; an omission, not a misstatement.

### 24. Critical #1+#2+#3 (the ratio heuristic fails open exactly where it
matters — 4-of-6 and 5-of-6, the region guard 2 cannot see; it fails open on
heterogeneous markup change, which is the literal motivating scenario; and its
stated anchor is arithmetically wrong, observed ratio is 4 not 2, headroom
1.5x not 3x) — FIX, fix round 1, but NOT with the reviewer's proposed
equality check. Reasoning: equality on same-page markers still fails Critical
#2, because a markup change that moves an event's whole JSON representation
removes its markers AND its alias together, keeping the derived count equal.
No same-page cross-check can detect that. The signal must be INDEPENDENT of
page shape, so: compare discovered count against the CURATED list size passed
in by the caller. This catches heterogeneous drift (1 discovered vs 6 known =
unhealthy), still permits wholesale alias migration (6 new aliases vs 6 known
= healthy, which the forbidden-intersection rule exists to protect), and is
explainable in one sentence. Keep the marker check as a secondary signal — it
genuinely catches the alias-charset rejection case where markers survive.
— Cost if wrong: a legitimate large seasonal retirement blocks and emails a
human instead of auto-applying, which is the safe direction.

### 25. Critical #4 (scanLooksHealthy has NO caller and the downstream briefs
never add one — it is dead code, and the spec edit claims a guard that will
not ship) — FIX. Amend Task 7 and Task 9 briefs to call it. A guard nobody
invokes is worse than no guard: it manufactures confidence. Severity noted —
this would have shipped as documented-but-absent protection.

### 26. Important #5 (live network fetch in the default suite, while Task 8
makes `pnpm test` the gate on a workflow with contents:write — a Sweatpals
outage or a legitimately quiet week turns the commit gate red) — FIX. Move to
an excluded `tests/live/` path behind `pnpm test:live`, and commit a saved
HTML fixture so the default suite is deterministic AND the marker-ratio
assumption is pinned by real data. — Cost if wrong: live drift is caught by
the scheduled canary a cycle later rather than by every local test run.

### 27. Minor #11 (commit d1f52dc carries `Co-Authored-By: Claude` and
`Claude-Session:` footers) — FIX, and this one is not minor to the project
owner. CLAUDE.md states "NO AI attribution footers ever" twice (user-global
and project). The session-level attribution config says the opposite; user
instructions win. Verified the other 7 commits on this branch are clean, so
this is a single-commit deviation, amendable while unpushed. — Cost if wrong:
none.

### 28. Minor #7 (the new block was INSERTED mid-file, orphaning
fetchScheduleData's docstring above HOST_PAGE_URL) — FIX, one-line move.

### 29. Minor #10 (over-discovery: any "alias" anywhere on the page is
accepted, so a future recommended-events widget would inject foreign slugs;
guard 2 only guards shrink, not growth) — DEFER to final review. Real, but
pre-existing in the plan's design and not reachable from today's page.

### 30. Minor #9 (silent alias-charset rejection) — FIX cheaply via the
logging line, since it is the input to the case #1 waves through.

### 31. Critical A (a degraded parse recovering 3, 4 or 5 of 6 events still
reports healthy, because the new threshold `aliases.length < expectedCount/2`
is IDENTICAL to classify()'s net-shrink threshold and therefore covers nothing
the shrink guard did not already cover) — ACCEPT THE RESIDUAL, document it,
stop redesigning. This is the reviewer's own option (a), chosen after checking
the actual blast radius:

### 32. the secondary marker check is now UNREACHABLE (raising the ratio 6->12
made it weaker than the primary, so it can only fire when expectedCount===0),
while still being documented as catching charset rejection — FIX. A check that
cannot fire but reads as protection is the same defect as Critical C, and this
is the second instance. Either restore it to a threshold where it fires, or
delete it and its claim.

### 33. fetchHostScan() with no argument silently disables the primary guard —
FIX, must fail closed. This guard has now failed open three times; an
easy-to-misuse signature is not acceptable on it.

### 34. expectedCount===0 detection regression introduced by the ratio change
— FIX with the above.

### 35. console.warn noise on what becomes a main-committing gate — FIX.

### 36. deferred — fixture is one unreviewable 160KB line; spec 6.2 misfiles
scanHostAliases under _reconcile.js. Both to final review.

### 37. adopt the IMPLEMENTER's proposed third mechanism over both options I
offered. It flagged that MARKER_TO_ALIAS_RATIO=4 has zero headroom by design
and suggested instead comparing RAW `"alias":"` hits against ACCEPTED alias
count -- a value already computed for the charset warning. That is strictly
better than my two options: it detects charset rejection EXACTLY (raw 12 vs
accepted 10 means two were dropped, full stop), needs no tuning, and does not
depend on the page's SSR/hydration duplication factor. The current ratio does:
the reviewer established that 4 is an accident of today's double embedding,
and one extra embedding takes it to 6, which at zero headroom would block
EVERY reconcile permanently -- "fails closed" sounds safe but a guard stuck
closed forever is an outage, not a safeguard. Round 3 authorised to make this
swap. — Cost if wrong: one more round on a guard already reworked three times;
mitigated because this mechanism removes tuning entirely rather than retuning.

### 38. Minor (no test for sendReport with a malformed report object) — NO
ACTION. The reviewer proved the path is structurally unreachable as a throw:
report field access and to.map() are all inside the single expression passed
to fetch(), which sits inside the try, so any access error is caught exactly
like a network error. Adding a test for a provably-safe path is padding.
— Cost if wrong: none.
Task 6: complete (commits 1fbb47e..58ca31d, review clean)

### 39. Critical #1 (af4196f carries Co-Authored-By/Claude-Session footers —
SECOND occurrence; the other 12 commits are clean) — FIX. Same ruling as
before: the repo owner's CLAUDE.md forbids them twice over and that governs
their history. Recurrence means the tooling default reasserts itself per
agent, so every remaining dispatch gets an explicit pre-commit check, not just
an instruction. — Cost if wrong: none, branch unpushed.

### 40. Important #2 (`git add <path>` then bare `git commit` commits the
WHOLE INDEX, not just that path — reproduced: a pre-staged unrelated file rode
along) — FIX with `git commit --only api/schedule-slugs.js`. Latent in CI
where checkout is clean, but `pnpm reconcile` is a local entry point too, and
this is a script that pushes to main. — Cost if wrong: an unrelated staged
file lands in an automated commit.

### 41. Important #3 (`git config user.name/user.email` permanently rewrites
the LOCAL repo identity — verified it persists after the run, so one local
non-dry run silently hijacks the developer's committer identity in that clone)
— FIX by scoping to the invocation with `git -c user.name=... -c
user.email=... commit` and deleting the two config calls. — Cost if wrong: a
developer's subsequent manual commits are attributed to the bot.

### 42. Important #4 (a push race exits non-zero but never reaches notify() —
CI goes red while the notification channel says nothing) — FIX. This is the
silent-failure mode the whole project exists to eliminate, reappearing in the
job's own error path. Mitigated today by the commit being local-only and
discarded, and it never emails "updated" without pushing — but silence is the
defect. — Cost if wrong: a push failure is visible only to whoever checks CI.

### 43. Important #5 (no branch guard — `pnpm reconcile` without --dry-run on
a feature branch will write, commit and PUSH that branch) — FIX, bundled with
#3. — Cost if wrong: an accidental local run pushes a feature branch.

### 44. Minor #6 (the `readFileSync(TARGET) === text` short-circuit can never
be true, because renderSlugsFile stamps a fresh UPDATED_AT every run) — FIX by
deleting it. It reads as a safety net that does not exist, which is the same
class of defect as the dead guard found in Task 5.

### 45. Minor #7 (eslint.config.js scopes rules to '**/*.{ts,tsx}', so
scripts/*.mjs AND every api/*.js module in this project are NOT LINTED AT ALL
— every task's "no new lint errors" claim was vacuous for the new code) —
REAL and broader than this task. Defer the config change to final review
rather than widen Task 7's scope, but record it loudly: it means nine tasks'
worth of new JavaScript has never been linted.

### 46. Minor #9 (process.exit right after console.log can truncate piped CI
output) — FIX, cheap, and CI logs are how a human diagnoses a blocked run.

### 47. Minor #8, #10, #11 — NO ACTION (file mode irrelevant under `node`;
empty-curated first run verified additive-only and documented as intended;
forward-reference to the Task 8 workflow resolves next task).

### 48. the implementer's unrequested `ref: main` deviation — KEEP. It lands
on the branch-name path (not the SHA path), pins workflow_dispatch regardless
of the ref it was fired from, and matches the script's main-only guard.
Tradeoff accepted: it removes the ability to smoke-test a workflow change from
a feature branch harmlessly, because a dispatch from any ref now reconciles
`main` for real. — Cost if wrong: workflow changes must be tested post-merge.

### 49. Minor #1 (missing secrets fail SILENTLY GREEN — sendReport early-
returns false when BREVO_API_KEY or RECONCILE_NOTIFY_TO is unset, so an
unconfigured repo runs, commits, and reports success while nobody is emailed)
— NO CODE CHANGE, but promote to a BLOCKING post-merge checklist item. This
is script behaviour from Task 6 and is correct there (email failure must never
fail a good commit); the hazard is purely operational.

### 50. Minor #2 (branch protection on main would fail the bot push; handled
— script catches, emails, exits 1) — post-merge checklist item: confirm main
accepts direct pushes from GITHUB_TOKEN.

### 51. Minor #3 (ref: main means a dispatch from any branch commits to main)
— accepted, see deviation ruling above.

### 52. Minor #4 (GITHUB_TOKEN pushes do not trigger other workflows; Vercel
deploys via its own Git integration so unaffected) — NO ACTION, informational.

### 53. Critical C1 (`"DOM"` added to tsconfig.api.json's lib to silence a
pre-existing api/subscribe.ts error) — FIX by removing DOM and narrowing
subscribe.ts. Reviewer settled all four sub-questions empirically against the
repo's real @types/node 24.10.13: global `fetch` compiles WITHOUT DOM (Node's
own undici typings provide it, so the "needed for fetch" justification is
actually an argument against DOM); WITHOUT DOM, `.json()` returns `unknown`,
which is the CORRECT typing since Brevo can return a body with no `code`
field; WITH DOM it returns `any`, so `data.code.toUpperCase().nope()` would
also compile; and DOM makes `document.querySelector`, `window.innerWidth` and
`alert` compile clean in a Node-only config, so a handler calling them builds
green and ReferenceErrors on the first production request. Exactly one error
exists without DOM. This is the defect correction #2 was written to prevent,
reintroduced one layer down — a type-check loosened until it passes.
— Cost if wrong: two lines of narrowing in a file outside the task's original
scope, which is far cheaper than a permanently fictional runtime.

### 54. Important I2 (apply's fetch has no try/catch — the ONLY unprotected
path, and it is the repo-write path; a DNS blip yields Vercel's opaque
FUNCTION_INVOCATION_FAILED instead of the designed 502) — FIX.

### 55. Important I3 (tsconfig.api.json omits tsBuildInfoFile, so `tsc -b`
drops tsconfig.api.tsbuildinfo in the REPO ROOT, untracked and NOT gitignored,
while both sibling projects route theirs to node_modules/.tmp) — FIX. In a
repo already carrying 9 untracked media files this is a live `git add .`
hazard. Came from my brief's template, not the implementer.

### 56. Important I4 (no throttling on a passphrase that authorizes a repo
write — unlimited online guessing) — DEFER to the post-merge checklist as a
follow-up, with the mitigation being a long random passphrase. Out of scope
for this task and not a blocker; recorded so it is a decision, not an
oversight.

### 57. Minor M6 (api/ held to looser flags than its siblings — no
noUnusedLocals/noUnusedParameters/verbatimModuleSyntax etc.) — FIX opportun-
istically, with an escape hatch: if tightening surfaces anything beyond a
trivial fix, stop and report rather than sprawl.

### 58. Minor M5 (apply echoes GitHub's HTTP status post-auth) — KEEP, a
deliberate and useful debugging aid reachable only after authentication.

### 59. Minor M7, M8 — NO ACTION (behaviourally safe; M8's divergence is
unreachable because scanLooksHealthy already rejects an empty alias list).

### 60. the one noted divergence (a non-201/204 Brevo response whose body is
the bare JSON token `null`: old code threw a TypeError caught by the outer
handler, new code falls through to the Brevo-error branch) — NO ACTION. Both
return HTTP 500; the new behaviour is arguably better since it no longer
relies on an exception for control flow; and Brevo's documented contact-API
error format is always a {code,message} object, so the input is unreachable.
For every shape Brevo actually sends, including the real duplicate_parameter
case, behaviour is byte-identical. — Cost if wrong: a 500's `error` string
differs on an input Brevo does not produce.
Task 9: complete (commits 34a2884..df98025, review clean)

### 61. Critical #1 (A SLUG DOES RENDER — reproduced on screen) — FIX. The
component is clean; the `name || slug` fallback lives one layer up, across the
network boundary where the page's types cannot see it: probeSlug does
`name: (ev.name||'').trim() || slug` and classify does `const name =
probe?.name || slug`. A `removed` item is by definition delisted AND out of
dates, so its probe commonly returns {ok:false} -> no name -> name === slug.
That is the MOST LIKELY row on the page, and it renders in bold exactly where
the client reads what is about to be deleted from his site. Fix at the API
boundary in api/studio.ts (null the name when it equals the slug; page renders
a human fallback), keep slug in the payload for the React key, leave the EMAIL
report's slug fallback alone since its audience is technical, and add a test
asserting no studio-payload item has name === slug.
NOTE FOR THE RECORD: the implementer's verification claim ("slug is used only
as the React key... confirmed by DOM text extraction") was run against the
GATE screen with no scan data, so it could not have detected this. A
verification that cannot detect the thing it certifies is worse than none —
this is the second false-confidence defect in the run, after the guard with no
caller. — Cost if wrong: none, the fix is additive.

### 62. Important #2 (queueMicrotask is lint EVASION) — FIX with the
reviewer's verified restructure, not by reverting to the brief and not by
keeping the workaround. Reviewer tested all three variants against ESLint:
React drains microtasks before paint, so the cascading extra render the rule
warns about is fully intact — only detectability changed. Adding an honest
5th violation would at least keep the signal; the workaround removes the
signal and keeps the cost. The restructure seeds the loading state in
useState's initializer (no set-in-effect at all), moves the first setState
after an await, and adds a cancel flag that closes an unmount/race hole
present in BOTH earlier versions. Lints and type-checks clean. — Cost if
wrong: slightly more code in exchange for a real fix over a suppression.

### 63. Important #3 (the CLAUDE.md exemption I ordered claims /studio "should
not pull the Three.js bundle" — but App.tsx renders <Canvas> OUTSIDE <Routes>
with a static import, so /studio downloads three-*.js at 1.23MB/339KB gz and
runs the WebGL scene behind the opaque page on the client's phone) — FIX THE
DOC to state what is true (it skips the camera transition and overlay gating).
This is exactly the project's own "verify before asserting" rule: a design doc
must not assert behaviour the implementation contradicts. Defer the actual
canvas-skip optimisation to the final review — it touches core App.tsx
rendering and is not this task's job. — Cost if wrong: the perf win waits.

### 64. Important #4 (a 401 on APPLY does not clear the stored passphrase, so
a rotated key leaves the client at a dead end) — FIX, route through scan's
existing 401 branch.

### 65. Minor #5 (empty name renders a title-less card) — FIX, same fallback
as #1. Minor #8 (document.title never restored on unmount) — FIX, cheap.

### 66. Minors #6 (no response shape validation), #7 (blocked.reason is
engineer voice), #9 (no re-scan after done), #10 (EmailSubscribe chrome on the
back-office page) — DEFER to final review.

### 67. accepted the implementer's deviation on Critical C1 over my own ticket
text. I specified `res.url.startsWith(HOST_PAGE_URL)`; Sweatpals ALREADY 301s
/loveandlob -> /host/loveandlob in production (confirmed by curl, 1 redirect),
so my literal code would have flagged the live site unhealthy on EVERY run,
permanently disabling both the cron and the page. The implementer tested
against production instead of trusting the ticket and wrote staysOnHostPage()
— same host plus the venue slug as an exact path SEGMENT. Re-reviewer drove 23
URL shapes through it: blocks other venues, /explore, /events, a segment that
merely contains the slug, subdomain and userinfo@ tricks, query/fragment
carriers; accepts the real production redirect. — Cost if wrong: it fails
closed on a future www. or percent-encoded variant, needing a code edit.

### 68. third and final occurrence of AI attribution footers — stripped, same
reasoning as before; all 20 branch commits verified clean.

### 69. residuals 1-7 from the final re-review (guard-3 backstop is not
airtight for a <=2x foreign feed when every curated slug is simultaneously
quiet; a blocked run has no in-product remedy because /studio disables Apply
while the email says to use it; staysOnHostPage fails closed on www.) — NOT
fixed, surfaced to the human partner instead. Per the process there is no
second fix wave; these are follow-up tickets, and items 1-3 are the ones worth
writing up.
