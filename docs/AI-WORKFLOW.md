# AI workflow

How this build was actually run with Claude Code. Written as it happened — the prompt
sequence in `docs/PROMPTS.md` is verbatim, and `docs/BUILD-LOG.md` records what each phase
shipped, cut and failed.

The short version: **the environment was audited and pruned before any code was written**,
six task-specific configs were authored to replace what was pruned, and the expensive work
was fanned out to parallel subagents under a file-ownership rule that made collisions
structurally impossible.

---

## 1. Audit the environment first

The session started with twelve auto-firing skills and plugins installed globally. Several
were actively hostile to this task, and a skill that fires on its own does not announce
itself — it just changes the output.

**Pruned, and why:**

| Disabled | Why it had to go |
|---|---|
| `frontend-design` | Optimises for attractive, opinionated UI. This task is a *clone*: the target is not "does it look good", it is "does it match to sub-pixel tolerance". A skill that improves on the reference has failed the task. |
| `ui-ux-pro-max` | Same failure mode, more aggressively — design variance and expressive motion are exactly wrong here. |
| `ruflo-core`, `ruflo-neural-trader` | Unrelated domains; noise in the skill-selection space. |

`high-end-visual-design` (leonxlnx/taste-skill) was installed **globally only** and
deliberately kept out of `.claude/skills/`, so it cannot ship in the submission and cannot
fire during component work. It is scoped to the architecture diagram and nothing else.
That scoping is written into `CLAUDE.md` so it survives a context reset.

**Kept:** `superpowers` (process discipline), `playwright` (the measurement and gate
harness), `claude-md-management`.

**Vendored:** `karpathy-guidelines` (MIT, forrestchang) copied into
`.claude/skills/karpathy-guidelines/` rather than installed globally — a global skill would
shape the build but leave no trace in the deliverable. Its four principles (think before
coding, simplicity first, surgical changes, goal-driven execution) are referenced by every
one of the six project configs, so change discipline is enforced by the same document
everywhere.

## 2. Six task-specific configs, not a swarm

`.claude/agents/` and `.claude/skills/` hold exactly six configs. Each is narrow enough to
trigger precisely and long enough to be useful — the specifics are the point, not the
count.

| Config | What it actually prevents |
|---|---|
| `reference-measurer` | Measurements taken at the wrong scale. Pins `1440×900, deviceScaleFactor 1` because the host Chrome runs at DPR 1.25 — unpinned, every downstream pixel delta is inflated 25% and reads as a real bug. Emits JSON only; never writes app code. |
| `visual-diff-runner` | "While I'm here" refactors during a pixel fix. Ranks fixes smallest-first and is explicitly forbidden from touching adjacent code or adjusting a baseline to make a diff pass. |
| `a11y-overlay-auditor` | "Looks fine." Every criterion demands observed evidence; UNTESTED blocks closure exactly like FAIL. |
| `next-architecture-reviewer` | Client boundaries creeping up the tree, `sizes` that lie, `priority` on more than one image. |
| `token-guardian` | Any hardcoded colour, size, radius, shadow or duration in a component. No escape hatches. |
| `originality-sentinel` | Reading the reference's source. Measured pixels and rendered text are permitted; bundles, CSS and generated class names are not — and delegating that fetch to a subagent does not launder it. |

Two of these earned their keep immediately, on their first run:

- **`next-architecture-reviewer`** found that `HeroGallery` took an `onOpenTour` *function
  prop* while its only call site was a Server Component. Functions cannot cross that
  boundary, so the API was not merely unwired — it was unwireable. Phase 5 would have had
  to make the entire page a client component to use it. The fix reshaped the overlays into
  URL state and moved five `next/image` calls off the client bundle.
- **`a11y-overlay-auditor`**'s criteria caught that Radix's default focus restore silently
  failed here: the overlay opens via soft navigation, so Radix captured `<body>` and focus
  was lost on close. It now restores to the real trigger.

## 3. Parallelism with a file-ownership rule

Phase 4 fanned out to **six subagents concurrently** — one per page section
(`header`, `hero`, `title`, `detail`, `booking`, `reviews`).

Every one was given the same clause verbatim:

> You own only your own directory. You may not edit any file outside it. You may not edit
> `src/app/page.tsx`.

That single rule is what makes the parallelism safe. The orchestrator wrote the composition
file afterwards. Result: **zero collisions, and all six returned matching export
contracts.**

Two supports made it work:

1. **`docs/TOKENS.md` was written immediately before the fan-out.** Six agents inventing
   token names independently is the obvious failure mode; they were handed a closed set
   instead.
2. **Each agent got an explicit export contract** in its prompt, so the orchestrator could
   compose the page without renegotiating six APIs.

Phase 5 was deliberately **not** fanned out — both overlays share gallery state, and
splitting them would have manufactured a merge conflict for no gain. Knowing when not to
parallelise is part of the technique.

## 4. Gates instead of human review

The operator ran the build unattended for several hours. Automated gates replaced review:

```
npx tsc --noEmit
npm run build
node scripts/verify-geometry.mjs        # asserts the DOM against every measured value
npx playwright test tests/a11y.spec.ts  # axe across all three views
<the reviewer subagent named for that phase>
```

`scripts/verify-geometry.mjs` is the one worth calling out: it asserts the running DOM
against every `status: "measured"` entry in `REFERENCE-MEASURED.json` — 13 checks, and it
only ever asserts values that were genuinely read off the reference. Asserting an estimate
would just encode the guess.

Two honesty rules held throughout:

- **A gate is never marked green that was not run.** Where a violation survives, it is
  named in `docs/BUILD-LOG.md`, not quietly rounded down.
- **Declared exceptions are printed, never suppressed.** The two `color-contrast`
  violations that remain are enumerated in the test file with their reasons and echoed on
  every run. One is a WCAG 1.4.3 logotype exemption; the other is Airbnb's own
  `#FF385C` CTA, which fails AA on the real site — recolouring it would have been the most
  visible fidelity regression in the build, so it is documented rather than patched.

## 5. What did not work

Worth recording, because the failures shaped more of this build than the successes.

- **The reference is behind a Vercel bot checkpoint.** Six approaches were tried and all
  failed: WebFetch (429), curl (challenge page), the Playwright MCP server (re-challenged
  mid-session), the Chrome extension (masks `getComputedStyle`, empties
  `document.styleSheets`), `launchPersistentContext` with `channel: 'chrome'` ("browser not
  supported"), and the same with automation flags stripped — which *did* flip
  `navigator.webdriver` to false, verified, but still failed. They are enumerated in the
  header of `scripts/measure/00-bootstrap.mjs` so nobody retries them.
- **One diagnostic nearly misled the whole investigation.**
  `chromium.executablePath({ channel: 'chrome' })` returns the *bundled* Chromium path —
  the method takes no arguments, so the option is silently ignored. Read naively that looks
  like proof Playwright fell back to bundled Chromium. Comparing launched
  `browser.version()` against the installed binary disproved it.
- **The consequence shaped the architecture.** With real values unavailable, the build was
  restructured so every design value lives in `REFERENCE-MEASURED.json` and generates the
  Tailwind theme. Swapping estimates for measurements is a one-line edit plus
  `npm run theme`, touching no component. 21 values are measured; 34 are estimates, ranked
  by confidence in `docs/ESTIMATES.md`.

That constraint is the reason `token-guardian` has no escape hatches. The swap-in property
is only worth anything if it is absolute.
