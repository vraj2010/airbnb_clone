# IMPLEMENTATION-PLAN.md

Airbnb listing-page clone — Playpower Labs take-home.
This file is the single source of truth for the build. Claude Code reads it at the start
of every session and appends to `docs/BUILD-LOG.md` after every phase.

---

## 0. Non-negotiable constraints

**External (from the brief — violating these costs marks):**
- Desktop only. No mobile breakpoints required, none will be built.
- Three views: Listing Page, Photo Tour overlay, Lightbox overlay.
- No lift-and-shift of the reference codebase. Plagiarism detection is in place.
- Do **not** push to a public GitHub repository. Local commits only.
- Deliverable is a zip: code + architecture diagram (image/pdf).
- Sub-agent / skill config files must be inside the submission.
- Backend optional.

**Self-imposed (our choice, defensible in interview):**
- Next.js 15 App Router + TypeScript + Tailwind v4.
- Radix Dialog for both overlays.
- Backend as Next.js Route Handlers, not a second service.

**Hard rules for every agent in this repo:**
1. Never open, fetch, view-source, or inspect the bundle/class names of
   `airbnb-clone-umber-two.vercel.app`. Behaviour is described from the spec docs only.
   Image asset URLs are the sole permitted exception.
2. Zero hardcoded design values in components. Every colour, size, weight, line-height,
   letter-spacing, radius, shadow, spacing step, duration and easing lives in the Tailwind
   `@theme` block, generated from `REFERENCE-MEASURED.json`.
3. Server Components by default. `"use client"` only on interactive leaves.

---

## 1. Unattended operating protocol

The operator is away for 2–3 hours and cannot answer questions. Therefore:

- **Never stop to ask.** If a decision is genuinely ambiguous, pick the most conservative
  option that preserves reversibility, write the decision and the alternative to
  `docs/BLOCKERS.md`, and continue. Do not idle.
- **Never wait for approval between phases.** The gates in §3 replace human review.
- **Append to `docs/BUILD-LOG.md` after every phase**, with: phase name, wall-clock
  start/end, what shipped, what was cut, what failed, what needs human eyes.
- **Time-box.** Each phase has a budget in §2. At 1.5× budget, ship the reduced-scope
  version described in that phase's *Fallback* line, log it, and move on. A complete
  reduced build beats an incomplete perfect one — the brief says this explicitly.
- **Commit after every phase**, locally, message `phase(N): <summary>`. Never `git push`,
  never `gh repo create`.
- **Log every prompt** issued to a subagent into `docs/PROMPTS.md` verbatim. This is a
  graded artefact.
- If a phase's gate fails twice, do not thrash. Revert to the last green commit, log the
  failure, skip to the next independent phase.

---

## 2. Phases

### Phase 1 — Author the graded `.claude/` configs — 15 min
Six files, already drafted (see `.claude/` in this handoff). Drop them in, verify Claude
Code lists them (`/agents`), commit.
- `agents/reference-measurer.md`
- `agents/visual-diff-runner.md`
- `agents/a11y-overlay-auditor.md`
- `agents/next-architecture-reviewer.md`
- `skills/token-guardian/SKILL.md`
- `skills/originality-sentinel/SKILL.md`

*Gate:* all six files exist and are syntactically valid frontmatter.
*Fallback:* none — this is cheap and graded directly.

### Phase 2 — Measurement — DEFERRED
The Playwright persistent-context harness is blocked on a bot checkpoint. Keep
`scripts/00-bootstrap.mjs` and the debug notes intact. `REFERENCE-MEASURED.json` exists as
a placeholder with every intended key marked `"estimated"`. Do not delete. Do not retry
during the unattended run — it needs a human to clear the checkpoint.

### Phase 3 — Foundation — 25 min
- Next.js 15 + TS + Tailwind v4 scaffold, `src/` layout.
- `@theme` block generated from `REFERENCE-MEASURED.json` by `scripts/gen-theme.mjs`.
  The generator is the only writer of theme values; never hand-edit the output.
- Font: Airbnb Cereal VF as `--font-sans`, fallback `Figtree, Inter, system-ui`.
  README notes it is Airbnb-proprietary, used for evaluation fidelity only.
- `data/listing.json`, typed with Zod. Content: *Romantic Jacuzzi 1BHK Candolim |
  Mirashya UG10*, Candolim, India. Entire serviced apartment. 4 guests · 1 bedroom ·
  1 bed · 1 bathroom. 43 photos across rooms: Living room, Full kitchen, Bedroom,
  Full bathroom, Pool, Exterior, Additional photos.
- Reference images downloaded to `/public/photos/`. URLs only — no markup, no CSS.

*Gate:* `npm run build` passes, `tsc --noEmit` clean, `gen-theme.mjs` runs idempotently.
*Fallback:* if font licensing/loading fails, ship Figtree and log it.

### Phase 4 — Listing page — 70 min — **PARALLEL**
Fan out to six subagents. They share `data/listing.json` and the theme, and nothing else.
Each owns its own directory under `src/components/` and touches no file outside it except
to append one import line to `src/app/page.tsx`.

| Subagent | Owns | Notes |
|---|---|---|
| `sec-header` | `components/header/` | Logo, nav, search pill, user menu. Sticky on scroll. |
| `sec-hero` | `components/hero/` | 1 large + 4 tiles grid, rounded corners, "Show all photos" button, hover dim. Emits `onOpenTour(index)` callback only — does not own modal state. |
| `sec-title` | `components/title/` | Title, share/save row, "Entire serviced apartment in Candolim, India", guest/bed/bath line, host row, highlights. |
| `sec-detail` | `components/detail/` | Description, amenities grid, "Show all amenities" button, sleeping arrangement. |
| `sec-booking` | `components/booking/` | Sticky reservation card, price, date/guest selects, Reserve CTA, rating row. `position: sticky`, correct top offset. |
| `sec-reviews` | `components/reviews/` | Rating summary, category bars, review cards grid, footer. |

Conflict rule: `src/app/page.tsx` is written by the **orchestrator only**, after all six
report done. Subagents never edit it.

*Gate:* build passes; `next-architecture-reviewer` runs and reports zero `"use client"` on
non-interactive components; `token-guardian` reports zero hardcoded values.
*Fallback:* if a section overruns, ship it structurally correct with estimated spacing and
add it to `docs/ESTIMATES.md` punch list.

### Phase 5 — Overlays — 45 min — **SEQUENTIAL**
Shared gallery state, so no fan-out here.
- Radix `Dialog` for both. Gives focus trap, scroll lock, Escape, focus restore, ARIA.
- **Photo Tour**: full-screen grid, photos grouped by room with captions
  (e.g. "Living room 1", "Sofa · Air conditioning · Ceiling fan · TV"). Opens from
  "Show all photos" **and** from any hero image.
- **Lightbox**: single photo, prev/next arrows, ←/→ keyboard nav, "n of 43" counter,
  close returns focus to the originating thumbnail.
- URL state: reflect the open overlay and current index in the query string so back/forward
  works. Do not full-reload.

*Gate:* `a11y-overlay-auditor` passes on focus trap, focus restore, scroll lock, Escape,
←/→, `aria-modal`, labelled dialog, `inert` on background, `prefers-reduced-motion`.
*Fallback:* if URL sync is fiddly, ship local state and log it. Keyboard nav is not optional.

### Phase 6 — Motion + accessibility polish — 30 min
- Hover: image scale/dim, button lift, underline transitions.
- Scroll: sticky header shadow, sticky card behaviour.
- Modal enter/exit via Framer Motion, everything else CSS transitions.
- All motion gated behind `prefers-reduced-motion: reduce`.
- Visible focus rings everywhere, logical tab order, skip link.

*Gate:* `@axe-core/playwright` run reports zero critical/serious violations on all three views.
*Fallback:* drop Framer Motion, use CSS transitions only.

### Phase 7 — Backend (bonus) — 25 min
Next.js Route Handlers under `src/app/api/`:
- `GET /api/listings/[id]` — listing detail
- `GET /api/listings/[id]/photos` — gallery, grouped by room
- `GET /api/listings/[id]/reviews` — paginated
- `GET /api/listings/[id]/availability` — date range → available/blocked

Layering: `route.ts` → service → repository (JSON-backed). Zod schemas shared with the
frontend as the typed contract. Proper status codes, a single error shape, input validation.
Page reads through the API at build/request time, not by importing the JSON directly —
otherwise the backend is decorative.

*Gate:* build passes; each route returns valid typed JSON.
*Fallback:* skip entirely and log. This is bonus; never let it break Phases 3–6.

### Phase 8 — Architecture diagram — 20 min
`docs/architecture.mmd` rendered to `docs/architecture.png` via `@mermaid-js/mermaid-cli`.
Must show, as a production-scale vacation-rental marketplace:
- Edge: CDN + image resize pipeline, WAF, API gateway.
- Frontend: Next.js on edge runtime, ISR for listing pages, RSC.
- Services (SOA): listing, search, booking, pricing, reviews, messaging, payments.
- **Split read/write paths** — this is the point most candidates miss. Elasticsearch/
  OpenSearch geo + availability index on the read side, fed asynchronously by Kafka/CDC
  from a strongly-consistent relational booking DB on the write side.
- Booking correctness: atomic availability constraint + idempotency keys, saga for
  multi-step booking.
- Redis cache, read replicas, sharding note.
- Payments: escrow-style split payout, third-party processor, PCI scope kept out.
- Observability, rate limiting, multi-region failover.

*Gate:* PNG renders and is legible at 100%.
*Fallback:* commit the `.mmd` source and note that rendering needs a human.

### Phase 9 — Submission package — 20 min
- `README.md`: stack rationale, how to run, what's implemented, known gaps, font licensing note.
- `docs/AI-WORKFLOW.md`: the environment audit → pruned 12 auto-firing skills that fought
  the spec → authored 6 task-specific configs. Include why each pruned plugin was pruned.
  This is the strongest AI-native signal in the submission.
- `docs/PROMPTS.md`: full prompt sequence, verbatim.
- `docs/ESTIMATES.md`: every estimated value + confidence — the measurement punch list.
- `docs/BUILD-LOG.md`, `docs/BLOCKERS.md`.
- Zip excluding `node_modules`, `.next`, `.git`.

*Gate:* zip opens clean, `npm i && npm run build` works from the extracted copy.

---

## 3. Automated gates (replacing human review)

Run before declaring any phase complete:

```bash
npx tsc --noEmit
npm run build
npx playwright test tests/a11y.spec.ts   # phases 5, 6 onward
```

Plus the reviewer subagents named in each phase. A phase is not done until its gate is
green and `docs/BUILD-LOG.md` has an entry.

---

## 4. What must be true when the operator returns

Ranked. If time runs out, this is the order to have got through:

1. Listing page renders at 1440×900 with all sections present and no build errors.
2. Photo Tour and Lightbox open, close, and support ←/→ and Escape.
3. `docs/BUILD-LOG.md` explains exactly what happened, including failures.
4. Six `.claude/` configs committed.
5. Architecture diagram rendered.
6. Motion polish, backend routes, README/AI-WORKFLOW.
7. Zip built.

Items 1–3 are the floor. Everything else is upside.
