# Blockers and unattended decisions

Decisions taken without the operator, and things that genuinely blocked. Each entry says
what was chosen, what was rejected, and why — so any of them can be reversed cheaply.

---

## B1 — Reference measurement is blocked (pre-existing, Phase 2 deferred)

**Status:** blocked, deferred by instruction.

The reference sits behind a Vercel Security Checkpoint that rejects automated browsers.
Six approaches were tried and all failed; they are enumerated in the header of
`scripts/measure/00-bootstrap.mjs`. The last one — attaching over CDP to a Chrome the
operator launches and unlocks by hand — is written and ready but needs a human.

**Consequence:** 34 of 55 design values are estimates, tracked in `docs/ESTIMATES.md`.
The whole build is structured so replacing them is a one-line edit in
`REFERENCE-MEASURED.json` plus `npm run theme`, touching no component.

---

## B2 — Reference photos could not be downloaded — **RESOLVED with licensed stock**

**Update:** the listing now ships 43 real photographs from Unsplash, downloaded by
`npm run fetch-photos` and committed to `public/photos/`. They are **not** the reference
listing's own photos — those remain unreachable — but they are real interior photography
matched to the nine measured room groups, so the page reads as a genuine listing rather
than a wireframe.

**Licensing, which needed care:** Unsplash serves two things through one search endpoint —
free `images.unsplash.com/photo-…` assets under the Unsplash License, and
`plus.unsplash.com/premium_photo-…`, which is **Unsplash+ and subscription-only**. Roughly
a third of interior-design results are the paid kind. `scripts/fetch-photos.mjs` rejects
every non-free URL (18 rejected on the run that produced the current set) and refuses to
fill a group rather than reach for a paid asset — which it did, on "Gym", until fallback
queries were added. Attribution for all 43 is in `public/photos/CREDITS.md`.

Photos are committed rather than hot-linked, so there is no runtime dependency on a
third-party CDN and the app works offline.

`npm run photos` still generates the dependency-free placeholder set, kept as the offline
fallback if the fetch ever cannot run.

### Original entry


**Chosen:** 43 generated placeholder PNGs at 1200×800 in `public/photos/`, grouped and
tinted per room group, written by a dependency-free encoder (`npm run photos`).

**Rejected:** stubbing images out entirely, or pulling stand-ins from a third-party image
host. The first would leave the hero mosaic, `next/image` sizing and the lightbox
untestable; the second adds a network dependency and an unclear licence to a submission
that is graded partly on judgement.

**Why it is safe:** filenames, dimensions, count and group structure all match what the
real photos will need, so swapping them in is a drop-in with no code change.

**Needs human eyes:** yes — the real photos must be fetched once the checkpoint is
cleared. Same session as the measurement pass.

---

## B3 — Theme generator filename differs from the plan

**Chosen:** keep `scripts/generate-theme.mjs`.

**Rejected:** renaming to `scripts/gen-theme.mjs` to match §2 Phase 3 of
`IMPLEMENTATION-PLAN.md` verbatim.

**Why:** the file already exists under the longer name, is wired into `package.json`
(`npm run theme`) and referenced from the README and the generated header of
`src/app/theme.css`. Renaming touches four files to satisfy a cosmetic difference. The
behaviour the plan specifies — a single generator that is the only writer of theme
values — is exactly what is implemented. Trivially reversible if the operator prefers the
shorter name.

---

## B4 — Some listing copy is authored, not captured

**Chosen:** write plausible placeholder copy for description, amenities, host, reviews
and house rules, and record precisely which fields are real in the `_provenance` block of
`src/data/listing.json`.

**Rejected:** leaving those sections empty. The listing page has to render all its
sections at 1440×900 — that is priority 1 in both the plan and the operator's brief — and
empty sections would fail that while also making layout impossible to judge.

**Verified content:** title, location, property type, capacity, photo count, room groups,
the 10% discount, and the ₹28,499 / 5-night / 2-guest price were all read off the live
page in the earlier browser session.

**Needs human eyes:** yes — swap in real copy during the measurement retrofit.

---
## B5 — Duplicate config drafts arrived in the handoff

**Found:** six of the operator's own draft configs landed in the working tree alongside
the ones authored in the previous session — four at the repo root
(`a11y-overlay-auditor.md`, `next-architecture-reviewer.md`, `reference-measurer.md`,
`visual-diff-runner.md`) and two flat in `.claude/skills/` as `SKILL.md` and `SKILL1.md`.

Two of these were actively harmful, not merely redundant:
- Agent configs at the repo root do not register at all — Claude Code only reads
  `.claude/agents/`.
- `.claude/skills/SKILL.md` declares `name: token-guardian`, colliding with the real
  `.claude/skills/token-guardian/SKILL.md`, and `SKILL1.md` collides with
  `originality-sentinel` the same way. A skill needs its own directory; two skills
  claiming one name is ambiguous.

**Chosen:** `git mv` all six into `docs/handoff-configs/*.draft.md`. Nothing deleted, full
history preserved, collisions gone, and the submission ships one unambiguous set.

**Rejected:** (a) deleting them — irreversible and discards the operator's intent;
(b) replacing the existing configs with them — the drafts are 28–52 lines against the
committed 68–99, and carry none of the specifics the gates depend on (the pinned
1440×900 / DPR 1 capture settings, the per-criterion a11y evidence table, the
smallest-change ranking, the token exception rule); (c) leaving them in place — keeps a
live name collision in a directory that is directly graded.

**Merged from the drafts:** they specified `model: sonnet` on all four agents, which the
committed versions did not. That is a deliberate operator choice and costs nothing, so it
has been added to the four `.claude/agents/` configs. Their narrower `tools:` lists were
not adopted — the committed lists are a superset needed by the gate work (e.g. the
auditor needs `Bash` to run axe).

**Needs human eyes:** low priority. If the operator prefers their own drafts, the
originals are intact under `docs/handoff-configs/`.

---
## B6 — Colour contrast vs. brand fidelity (open, decided in Phase 6)

The axe gate reports **3 serious `color-contrast` violations** on the listing page. All
three trace to *estimated* brand colours, not to markup errors:

| element | colours | issue |
|---|---|---|
| `.text-primary.text-title-md` | `#FF385C` on `#FFFFFF` | the "airbnb" wordmark — ~3.4:1 |
| `.text-success` | `#008A05` on `#F7F7F7` | discount banner — marginal |
| Reserve button | `#FFFFFF` on `#FF385C` | ~3.4:1 at 16px |

This is a genuine conflict, not an oversight. Airbnb's real Rausch `#FF385C` **does** fail
WCAG AA for normal-weight body text on white; reproducing the palette faithfully means
reproducing that failure. The brief grades fidelity *and* accessibility.

**Deferred to Phase 6**, which owns the axe gate. The intended resolution:
- **Wordmark** — a logotype is explicitly exempt from WCAG 1.4.3. The fix is to mark the
  logo `role="img"` with an accessible name, which is correct markup independent of the
  contrast question, rather than to recolour the brand.
- **`success` green** — a low-confidence estimate with no measurement behind it. Choosing
  a green that passes AA is strictly better than keeping a guess that fails; it will be
  re-measured later like every other estimate.
- **Reserve button** — the honest options are (a) keep `#FF385C` and record a known AA
  failure inherited from the reference, or (b) use the already-tokenised
  `primary-active` `#E00B41`, which passes at ~5:1. Decision and reasoning go in the
  Phase 6 log; the gate will not be marked green on an exemption that hides a real defect.

**Fixed in Phase 4 (was also serious):** `aria-prohibited-attr` ×6 — `aria-label` on `<p>`
and `<div>` in the reservation card, with every child `aria-hidden`. Those elements expose
no role that supports an accessible name, so the label could be dropped entirely and the
price rows would have been silent to a screen reader. Replaced with exposed visible text
plus `aria-hidden` on decorative separators only.

---
## B7 — Two commits contain more than their message says

**What happened:** `git add -A` before the Phase 5 commit swept in `docs/architecture.mmd`,
`docs/architecture.png` and `docs/AI-WORKFLOW.md`, which had been drafted early while
blocked on a gate. The same thing then put Phase 6 and 7 work into the Phase 8 commit.

**Chosen:** amend the tip commit's message to state its real contents, and record the map
below. Authorship history is graded, so an accurate message on a mixed commit beats a tidy
message that is false.

| commit | actually contains |
|---|---|
| `dc79cc4` phase(5) | overlays **+** `architecture.mmd`, `architecture.png`, `AI-WORKFLOW.md` |
| `37d52fe` phase(6,7,8) | motion, API routes, `ARCHITECTURE.md`, `API.md`, packaging script |

**Rejected:** rewriting history to split them. `git rebase -i` is unavailable in this
environment, and a non-interactive reconstruction risks losing work during an unattended
run for a purely cosmetic gain.

**Prevention:** stage explicitly per phase rather than `git add -A` when work for a later
phase has been drafted early.

---
