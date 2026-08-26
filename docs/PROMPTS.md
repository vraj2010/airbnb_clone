# Prompt Log

Every prompt that shaped this codebase, verbatim, in order. Maintained as the build
progresses — not reconstructed afterwards. The assignment brief asks for the prompt
sequence at submission.

Timestamps are UTC (ISO 8601), taken from the Claude Code session transcripts.
Assistant replies are not reproduced; only the human input is.

Sessions so far:
- `c4c389d9` — repo orientation, brainstorming, Phase 0 Part A
- `f938afac` — Phase 0 Part B (after a restart to pick up the plugin changes)

---

## 0 — Repo orientation (`/init`)

**2026-08-24T05:52:11.866Z** · session `c4c389d9` · slash command, not hand-written

````text
Please analyze this codebase and create a CLAUDE.md file, which will be given to future instances of Claude Code to operate in this repository.

What to add:
1. Commands that will be commonly used, such as how to build, lint, and run tests. Include the necessary commands to develop in this codebase, such as how to run a single test.
2. High-level code architecture and structure so that future instances can be productive more quickly. Focus on the "big picture" architecture that requires reading multiple files to understand.

Usage notes:
- If there's already a CLAUDE.md, suggest improvements to it.
- When you make the initial CLAUDE.md, do not repeat yourself and do not include obvious instructions like "Provide helpful error messages to users", "Write unit tests for all new utilities", "Never include sensitive information (API keys, tokens) in code or commits".
- Avoid listing every component or file structure that can be easily discovered.
- Don't include generic development practices.
- If there are Cursor rules (in .cursor/rules/ or .cursorrules) or Copilot rules (in .github/copilot-instructions.md), make sure to include the important parts.
- If there is a README.md, make sure to include the important parts.
- If you find an OpenAI Codex config (~/.codex/config.toml or ./.codex/) or a Gemini CLI config (~/.gemini/settings.json or ./.gemini/ or a GEMINI.md), offer to import it now — tell the user to reply `/import` to scan and list what's importable (MCP servers, slash commands, subagents, skills, instructions), then `/import --yes=<digest>` (the scan output names the digest) to apply the user-level items. Do NOT read the foreign-agent config files or write Claude Code config yourself — the deterministic import (triggered by `--yes`) applies the same safe-name and path-traversal guards as the terminal picker. If `/import` isn't available on this surface, tell the user to run `claude import` from a terminal instead.
- Do not make up information such as "Common Development Tasks", "Tips for Development", "Support and Documentation" unless this is expressly included in other files that you read.
- Be sure to prefix the file with the following text:

```
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
```
````

*Produced the first `CLAUDE.md`. A `superpowers:brainstorming` session followed
immediately after, which is what turned the brief into the Phase 0–8 plan recorded in
`CLAUDE-CODE-KICKOFF-PROMPT.md`.*

---

## 1 — Phase 0, Part A

**2026-08-24T07:13:46.910Z** · session `c4c389d9`

```text
You are working in the airbnb-clone project. This is Phase 0 of a build plan we already
agreed on. Do EXACTLY the steps below and nothing else. Do not start any Phase 2+ work,
do not write app code, do not touch the Next.js scaffold.

Read ./CLAUDE.md first for context.

--- STEP 1: fix two factual errors in ./CLAUDE.md ---
a) It says the assignment PDF is missing. It is not. The file exists as
   "Playpower Labs Assignment_ Airbnb-Clone App.pdf" (with spaces). Correct that line.
b) It implies Next.js/TypeScript/Tailwind is required by the brief. It is not. The brief
   says "You are free to choose the tech stack you are most comfortable with." Rewrite
   that section to separate EXTERNAL constraints (from the brief) from SELF-IMPOSED ones
   (our choice). External: desktop-only, three views, no public repo, zip submission,
   architecture diagram required, no lift-and-shift of reference source, backend optional.
   Self-imposed: Next.js + TS + Tailwind.

--- STEP 2: disable plugins that fight this task ---
Back up ~/.claude/settings.json to ~/.claude/settings.json.bak first.
Then READ it and report its actual structure to me before editing — do not assume the
key name or nesting. Set these four to false:
  - frontend-design@claude-plugins-official
  - ui-ux-pro-max@ui-ux-pro-max-skill
  - ruflo-core@ruflo
  - ruflo-neural-trader@ruflo
Leave superpowers, playwright, claude-md-management, github enabled.

Rationale for the log: the first two auto-fire on "building new UI" and push invented
design choices; this task is exact replication, where originality is a defect. ruflo-core
runs an npx subprocess on every Bash/Write/Edit call and its PreCompact hook injects
false project context ("54 agents", "SPARC") that does not describe this repo.

--- STEP 3: neutralise auto-firing personal skills ---
There is no per-skill toggle, so move these directories out of ~/.claude/skills/ into
~/.claude/skills-disabled/ (create it):
  rtk-tdd, tdd-rust, caveman, caveman-commit, caveman-compress, caveman-help,
  caveman-review, caveman-stats, cavecrew, supermemory
Leave the rest. Confirm each move succeeded by listing both directories afterwards.

--- STEP 4: verify and stop ---
Show me: the CLAUDE.md diff, the settings.json diff, and both skill directory listings.
Then STOP and tell me to restart Claude Code. Do not proceed to installs.
```

---

## 2 — Phase 0, Part B

**2026-08-24T07:38:48.227Z** · session `f938afac`

Two short questions preceded this one after the restart — *"are all the skills loaded i
just restarted?"* and *"i don't see any skill files in the code base how come?"* — both
answered without changing the repo.

```text
Continuing Phase 0/1 of the airbnb-clone build. Part A is done and you have restarted.

First: confirm the four plugins are actually disabled now (check that frontend-design and
ui-ux-pro-max skills are no longer in your available skill list). If any still appear,
stop and tell me — do not work around it.

--- STEP 5: install measurement + verification tooling ---
  npm init -y            (only if package.json does not already exist)
  npm i -D @playwright/test @axe-core/playwright
  npx playwright install chromium
Do NOT write the measurement script yet — that is Phase 2.

--- STEP 6: vendor the Karpathy guidelines into the project ---
Source: github.com/multica-ai/andrej-karpathy-skills (MIT).
Do not guess the file path. Inspect the repo tree first to find the actual location of
the skill file (it should be under skills/karpathy-guidelines/), fetch it, and READ IT
IN FULL before installing it. If the content does not match the four principles
(think before coding / simplicity first / surgical changes / goal-driven execution),
stop and show me what you found instead.

Install to: .claude/skills/karpathy-guidelines/SKILL.md
Prepend a short attribution header: source repo, MIT license, and one line on why it is
vendored here rather than installed globally (so it ships in the submission zip).

--- STEP 7: install taste-skill GLOBALLY ONLY ---
  npx -y skills add leonxlnx/taste-skill --skill high-end-visual-design --agent claude-code --global

Then run: ls -la .claude/skills/
If ANY taste-skill directory landed in the project .claude/skills/, delete it immediately
and tell me. It must not be in the zip.

This skill is scoped to Phase 8 (architecture diagram) only. Add a line to CLAUDE.md
stating that taste-skill must never be invoked for listing-page, overlay, or component
work — its defaults optimise for design variance and motion, which is the inverse of what
a pixel-fidelity clone needs.

--- STEP 8: author the six project configs ---
Create these. Each gets a tight description in its frontmatter so it triggers precisely,
and each stays under ~150 lines. Write real, specific instructions — not generic filler.
Every one of them must reference .claude/skills/karpathy-guidelines/SKILL.md for change
discipline, especially the two marked (*).

.claude/agents/reference-measurer.md
  Drives the Playwright harness against the live reference. Emits structured JSON only.
  Never writes app code. Owns REFERENCE-MEASURED.json.
  Must pin viewport 1440x900 and deviceScaleFactor 1 (the local Chrome runs at DPR 1.25;
  unpinned captures produce 25% noise in every diff).

.claude/agents/visual-diff-runner.md (*)
  Runs screenshot diffs against Phase 2 baselines. Reports per-region pixel deltas.
  Proposes the SMALLEST CSS change that closes each delta. Specify it goal-driven:
  success criterion is a delta threshold, and it loops until met or blocked.
  Explicitly forbidden from refactoring adjacent code while fixing a delta.

.claude/agents/a11y-overlay-auditor.md
  Verifies both overlays: focus trap, focus restore to trigger, scroll lock, Escape,
  left/right arrow nav, ARIA labelling, inert on background, prefers-reduced-motion.
  Runs axe. Reports pass/fail per criterion with evidence, never "looks fine".

.claude/agents/next-architecture-reviewer.md (*)
  Server Components by default; "use client" only on interactive leaves. next/image
  discipline. No hardcoded values that belong in the theme. Flags bundle bloat.

.claude/skills/token-guardian/SKILL.md
  Rejects any component containing a hardcoded hex, px, radius, shadow, or duration that
  belongs in the Tailwind theme. Triggers on component authoring and editing.

.claude/skills/originality-sentinel/SKILL.md
  HARD RULE: never read, fetch, copy, or adapt the reference site's source, bundles,
  minified CSS, or generated class names. Measured computed values and screenshots are
  permitted; source is not. Flags anything that looks lifted. Cite the brief: direct
  lift-and-shift "could result in lower score or disqualification" and they run
  plagiarism detection.

--- STEP 9: start the prompt log ---
Create docs/PROMPTS.md and log Parts A and B verbatim with timestamps. Append to this
file every session from here on — the brief says the prompt sequence may be requested
at submission, and reconstructing it later will look reconstructed.

--- STEP 10: verify and stop ---
Show me the full tree of .claude/, the Karpathy header you wrote, confirmation that
nothing from taste-skill is in the project, and the installed package versions.
Then STOP. Do not begin Phase 2. I will kick that off separately.
```

---

## 3 — Phase 2: measure the reference

**2026-08-24T07:58Z** · session `f938afac`

```text
Phase 2 of the airbnb-clone build. Phase 0/1 is complete: plugins pruned, Playwright
installed, six configs authored, karpathy-guidelines vendored.

Goal: produce REFERENCE-MEASURED.json — the single source of truth for every value used
in Phases 3-7. No app code this phase. No Tailwind theme yet.

Use the reference-measurer agent for this work. Log every prompt to docs/PROMPTS.md.

--- CONSTRAINTS (read before writing the script) ---
The reference is behind a Vercel Security Checkpoint. WebFetch returns 429, curl returns
the challenge page, and the Playwright MCP server gets re-challenged mid-session. The
claude-in-chrome extension loads the page but masks getComputedStyle and the CSSOM
(document.styleSheets.length === 0), so it CANNOT measure styles. Do not retry any of
those four paths — they have all been tested and they all fail.

The only working path is a local Playwright script using chromium.launchPersistentContext
with:
  userDataDir: './.pw-profile'   (gitignore it — checkpoint cookie persists between runs)
  channel: 'chrome'
  headless: false
  viewport: { width: 1440, height: 900 }
  deviceScaleFactor: 1           (my Chrome runs at DPR 1.25 — leaving this unpinned puts
                                  25% scaling noise into every screenshot diff)

--- STEP 1: bootstrap the profile ---
Write scripts/measure/00-bootstrap.mjs that opens the reference with the config above and
waits indefinitely. Run it, then STOP and tell me to clear the checkpoint by hand.
Wait for me to confirm before continuing. Do not attempt to solve or bypass the challenge
yourself.

--- STEP 2: measurement script ---
scripts/measure/01-measure.mjs. Reuses the same persistent profile. Captures:

TYPOGRAPHY — for every distinct text element: font-family, computed size in px, weight,
line-height, letter-spacing, color as rgb. Confirm whether Airbnb Cereal VF actually
loads (check document.fonts) and record every weight served.

COLOR — background-color, color, border-color for every distinct surface. Exact rgb/rgba,
no rounding, no "close enough" naming.

BOX — border-radius per corner, box-shadow full value, border widths, padding and margin
for section containers, gap values on every grid and flex container.

LAYOUT — getBoundingClientRect for the header, hero grid and each cell, content column,
sticky booking card, and each major section boundary. Plus document.scrollHeight and the
sticky top offset.

MOTION — transition-property, duration, and timing-function on every element that has
one. Then hover each interactive element and re-read computed style to capture the hover
end-state as a separate record. Same for focus-visible. Record any CSS animations.

CONTENT — visible text content for the listing data (title, location, host, amenities,
review text, price, ratings) and the src of every image.
IMPORTANT per originality-sentinel: extract rendered text and image URLs only. Do not
read, save, or imitate their source, bundles, minified CSS, DOM structure, or generated
class names. If you find yourself looking at their markup for structural guidance, stop.

Dedupe by computed-style signature so the output is a set of distinct styles rather than
one record per node. Output valid JSON to REFERENCE-MEASURED.json.

--- STEP 3: baseline screenshots ---
scripts/measure/02-screenshots.mjs, same profile and DPR pinning. Capture into
tests/baselines/:
  - listing page, full-page
  - listing page, above-the-fold at 1440x900
  - photo tour overlay, opened via "Show all photos"
  - photo tour overlay, opened via a hero image (verify it is the same view)
  - lightbox, opened from a gallery photo
  - lightbox after one right-arrow press
Also record: does Escape close each overlay, where focus lands on open, and where focus
returns on close. Write those to REFERENCE-BEHAVIOUR.md.

--- STEP 4: report gaps, do not fill them ---
List every value you could NOT capture and why. Do not estimate, infer, or substitute a
plausible value for anything you failed to measure — flag it and I will decide. A gap I
know about is fine; a guess I mistake for a measurement is not.

--- STEP 5: stop ---
Show me the JSON structure (keys and a sample, not the whole file), the screenshot list,
and the gap report. Then STOP. Do not start Phase 3.
```

---

## 4 - Phase 2 Step 1: checkpoint blocked the launched browser

**2026-08-24T08:31Z** · session `f938afac`

```text
Step 1 bootstrap failed: the checkpoint served "browser not supported". That is automation
fingerprint detection, not a Chrome version problem. Do not retry as-is.

--- DIAGNOSTIC (30 seconds, do this first) ---
Confirm which binary actually launched — print browser.version() and the executable path.
If Playwright fell back to bundled Chromium instead of real Chrome, that alone explains it
and channel:'chrome' needs fixing before anything else.

--- FIX A: strip automation flags (try first, one-line change) ---
In the exported context options in 00-bootstrap.mjs add:
  ignoreDefaultArgs: ['--enable-automation'],
  args: [
    '--disable-blink-features=AutomationControlled',
    '--force-device-scale-factor=1',
  ]
Keep everything else identical. Relaunch and report what the checkpoint serves.

--- FIX B: connect to a real Chrome I launch myself (if A still fails) ---
This removes the fingerprint entirely because Playwright never launches the browser —
it attaches to one I started by hand.

Rewrite 00-bootstrap.mjs to NOT launch anything. Instead:
  1. Print the exact command for me to run in a terminal, using the real Chrome path on
     this machine and a dedicated profile dir so it does not collide with my running Chrome:
       chrome.exe --remote-debugging-port=9222 --user-data-dir="D:\Projects\airbnb-clone\.pw-profile" --window-size=1440,900 --force-device-scale-factor=1
     Resolve the actual chrome.exe path rather than assuming it.
  2. Poll http://localhost:9222/json/version until it responds, then
     chromium.connectOverCDP('http://localhost:9222').
  3. Take the existing context and page — do not create a new context, that would lose
     the profile and the cookie.
  4. Pin metrics via CDP, since connectOverCDP contexts ignore the viewport option:
       const cdp = await page.context().newCDPSession(page);
       await cdp.send('Emulation.setDeviceMetricsOverride',
         { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
     Verify by reading back window.innerWidth and devicePixelRatio — they must be 1440
     and 1. If devicePixelRatio reports 1.25, stop and tell me; every downstream diff
     depends on this.
  5. Keep the same behavioural poll (sheets / main / imgs) and the same CHECKPOINT CLEARED
     verdict. Still never inspect the challenge markup.

Update 01-measure.mjs and 02-screenshots.mjs to import the connect-and-pin helper from
00-bootstrap.mjs so all three share one code path, as before.

Then STOP and give me the launch command. I will run it and clear the checkpoint by hand.
Do not attempt to solve or bypass the challenge.
```

Follow-up in the same step, after FIX A was applied and the checkpoint still blocked:

> it says browser could not be verified so i think you can't see url in that way

---

## 5 - Park Phase 2; build Phases 3, 4, 5 against swappable tokens

**2026-08-24T08:52Z** · session `f938afac`

```text
Change of plan for Phase 2. The checkpoint is still blocking and I don't want to spend
more time on it now. Skip measurement — we will do it later and retrofit.

Do NOT delete the measurement scripts or the debug notes. Leave 00-bootstrap.mjs and the
dead-path header intact; we are coming back to it.

--- CRITICAL CONSTRAINT: everything must be swappable ---
Because real values are coming later, the build must be structured so that replacing
estimates with measurements is a single-file change:
  - Every color, font size, weight, line-height, letter-spacing, radius, shadow, spacing
    step, and transition duration/easing lives in the Tailwind theme. No exceptions.
  - Zero hardcoded values in components. token-guardian enforces this — do not disable it,
    do not add escape hatches. If a value doesn't fit the scale, add a token, don't inline.
  - Create REFERENCE-MEASURED.json NOW as a placeholder, with every key we intend to
    measure, each marked "estimated" with the estimate as its value. The theme is
    generated from this file. When real measurements land, we overwrite the values,
    regenerate, and the whole app updates.
  - Log every estimate in docs/ESTIMATES.md with what it is and how confident you are.
    That becomes the punch list for the measurement pass.

--- PHASE 3: foundation ---
Next.js App Router + TypeScript + Tailwind v4. Tailwind @theme block generated from
REFERENCE-MEASURED.json. Font: Airbnb Cereal VF as --font-sans with fallback stack
Figtree, Inter, system-ui — note the licensing in the README.
data/listing.json seeded from the reference content (title "Romantic Jacuzzi 1BHK
Candolim | Mirashya UG10", Candolim India, entire serviced apartment, 4 guests /
1 bedroom / 1 bed / 1 bathroom). Type it with Zod.
Download the reference images into /public — image URLs only, per originality-sentinel.

--- PHASE 4: listing page ---
Server Components by default, "use client" only on interactive leaves.
Sections: header, hero image grid (1 large + 4 tiles, "Show all photos" button),
title block with share/save, host and property summary, amenities, description,
sticky booking card, reviews, footer.
Fan these out to parallel subagents where they don't share state.
next-architecture-reviewer runs before you call Phase 4 done.

--- PHASE 5: overlays ---
Radix Dialog for both photo tour and lightbox — gives focus trap, scroll lock, Escape,
focus restore and ARIA correctly for free. Add left/right keyboard nav and prev/next
arrows. Photo tour opens from "Show all photos" AND from any hero image. Lightbox opens
from any gallery photo.
a11y-overlay-auditor runs before you call Phase 5 done.

Work through 3, 4, 5 in order. Show me each phase before moving to the next.
Log prompts to docs/PROMPTS.md.
```

---

## 6 — Unattended run: execute Phases 1, 3–9

**2026-08-24T14:00Z** · session `f938afac` · also committed to the repo as `UNATTENDED-RUN-PROMPT.md`

`````text
You are running UNATTENDED for the next 2-3 hours. I am not at the keyboard and cannot
answer anything. Read ./IMPLEMENTATION-PLAN.md now — it is the authoritative spec for this
run. If that file does not exist, stop immediately and write the reason to
docs/BLOCKERS.md; do not improvise a plan.

Execute Phases 1, 3, 4, 5, 6, 7, 8, 9 in that order. Phase 2 (measurement) is deferred —
do not attempt it, do not delete its scripts.

=== OPERATING RULES — these override your normal habits ===

1. NEVER ask me a question. NEVER stop between phases for approval. If something is
   ambiguous, pick the most conservative reversible option, write the decision AND the
   alternative you rejected to docs/BLOCKERS.md, and keep going. An idle agent is the
   worst possible outcome of this session.

2. Do not end a turn with "let me know if you'd like me to continue." Continue.

3. After EVERY phase, append to docs/BUILD-LOG.md:
     ## Phase N — <name>
     Started HH:MM, finished HH:MM
     Shipped: ...
     Cut / deferred: ...
     Failed: ...
     Needs human eyes: ...
   Then: git add -A && git commit -m "phase(N): <summary>"
   Local commits only. NEVER git push, NEVER create a remote, NEVER gh repo create.
   A public repo is banned by the brief.

4. Time-box each phase to the budget in the plan. At 1.5x budget, ship that phase's
   Fallback version, log it, move on. A complete reduced build beats an incomplete
   perfect one — the brief says this in as many words.

5. If a phase gate fails twice, stop thrashing: revert to the last green commit, log it
   in docs/BLOCKERS.md, skip to the next independent phase.

6. Log every subagent prompt you issue, verbatim, into docs/PROMPTS.md. That file is graded.

7. Two hard rules, restated because they are the expensive ones:
   - Never open, fetch, or read the reference site's source, bundle, CSS, or class names.
     Rendered pixels, visible text, and image asset URLs only. originality-sentinel governs this.
   - Zero hardcoded design values in components. Every colour, size, weight, radius,
     shadow, spacing step, duration and easing is a theme token generated from
     REFERENCE-MEASURED.json. token-guardian governs this and has no escape hatches.

=== PARALLELISM ===

Phase 4 is the only true fan-out. Launch these six subagents CONCURRENTLY in one batch —
they share no state:

  sec-header   -> src/components/header/
  sec-hero     -> src/components/hero/
  sec-title    -> src/components/title/
  sec-detail   -> src/components/detail/
  sec-booking  -> src/components/booking/
  sec-reviews  -> src/components/reviews/

Give each one: its section of IMPLEMENTATION-PLAN.md, REFERENCE-MEASURED.json,
data/listing.json, and this instruction verbatim — "You own only your own directory. You
may not edit any file outside it. You may not edit src/app/page.tsx." You, the
orchestrator, write page.tsx yourself once all six report done. That file-ownership rule
is what stops six parallel agents colliding — do not relax it.

Phase 5 is SEQUENTIAL — both overlays share gallery state, so do not fan it out.

Phases 7 (API route handlers) and 8 (architecture diagram) are independent of each other;
run those two in parallel after Phase 6 is committed.

=== GATES — these replace my review ===

A phase is not done until all of these are true:
  npx tsc --noEmit        clean
  npm run build           passes
  the reviewer subagent named for that phase in the plan has passed
  docs/BUILD-LOG.md has its entry

next-architecture-reviewer must pass before Phases 4 and 7 close.
a11y-overlay-auditor must pass before Phases 5 and 6 close.
Run the axe-core Playwright check across all three views in Phase 6.

Never mark a gate green that you did not actually run.

=== PRIORITY IF YOU RUN OUT OF TIME ===

  1. Listing page renders at 1440x900, all sections present, no build errors
  2. Photo Tour + Lightbox open, close, Escape and Left/Right arrows work
  3. docs/BUILD-LOG.md honestly explains what happened, including failures
  4. The six .claude/ configs committed
  5. docs/architecture.png rendered
  6. Motion polish, API routes, README + docs/AI-WORKFLOW.md
  7. Zip built, excluding node_modules/.next/.git

Items 1-3 are the floor. Do not sacrifice them for anything below them.

Start now with Phase 1. Do not summarise the plan back to me first — I am not here to
read it. Begin.
`````

---

## 7 — Phase 4 fan-out: six section subagents, launched concurrently

**2026-08-24T14:08Z** · session `f938afac` · issued by the orchestrator, not the operator

All six were dispatched in a single batch so they ran in parallel. Each was given the
same file-ownership clause verbatim, its own slice of `IMPLEMENTATION-PLAN.md` §2 Phase 4,
and pointers to `docs/TOKENS.md`, `src/lib/listing.ts`, `src/data/listing.json` and
`REFERENCE-MEASURED.json`. All six ran on Sonnet.

`docs/TOKENS.md` was written immediately before this fan-out specifically to support it:
six agents inventing token names independently is the obvious failure mode, so they were
handed the closed set instead.

### 7.1 — `sec-header`

`````text
You are `sec-header`, building one section of an Airbnb listing-page clone (Next.js 15 App Router, TypeScript, Tailwind v4).

## FILE OWNERSHIP — ABSOLUTE
You own only your own directory. You may not edit any file outside it. You may not edit src/app/page.tsx.

Your directory is `src/components/header/`. Create it. Five other agents are working in parallel in their own directories right now; touching anything outside yours will collide with them and be reverted.

Do NOT run `npm run build`, `npm run dev`, or `npx tsc` — a dev server is already running and the orchestrator owns the gates. Just write correct code.

## READ FIRST
- `docs/TOKENS.md` — the complete set of design tokens. This is your palette.
- `src/lib/listing.ts` — the typed data (`Listing`, `Photo`, `listing`).
- `src/data/listing.json` — the seeded content.
- `REFERENCE-MEASURED.json` — source of truth for design values; `status: "measured"` entries are verified, `"estimated"` are placeholders.

## YOUR SECTION (from IMPLEMENTATION-PLAN.md Phase 4)
> `sec-header` | `components/header/` | Logo, nav, search pill, user menu. Sticky on scroll.

Measured: the header is **89px tall** (`h-header-height`), full-bleed, with a 1px bottom hairline. The content inside it aligns to the 1120px centred container (`w-content-width`).

## EXPORT CONTRACT — the orchestrator composes these, do not deviate
```ts
// src/components/header/index.ts
export { SiteHeader } from './SiteHeader';
```
`SiteHeader` takes no props.

## HARD RULES
1. **Zero hardcoded design values.** Every colour, font size, weight, line-height, letter-spacing, radius, shadow, spacing step, duration and easing must be a token from `docs/TOKENS.md`. No `#hex`, no `text-[15px]`, no `rounded-[12px]`, no `duration-200`, no inline `style={{}}` carrying a themeable value. If you need a value that does not exist, use the nearest token and note it in your final report — do NOT inline it and do NOT edit the theme.
   - Tailwind's plain numeric spacing (`p-4`, `gap-2`, `mt-6`) IS allowed for internal rhythm.
2. **Server Components by default.** `"use client"` only on a genuinely interactive leaf (needs state, effects, refs, or event handlers). If the user menu needs a dropdown, extract just that into its own small client component inside your directory and keep `SiteHeader` a server component.
3. **Never** look at the reference site's source, bundles, CSS, or class names. You are building from the written spec only.
4. Icons: `lucide-react` is installed. Use it. Do not add dependencies.
5. Accessibility is graded: real `<nav>`, `<header>`, proper button semantics, accessible names on icon-only buttons, visible focus states using token colours.

## WHAT TO BUILD
A white sticky header, 89px tall, hairline bottom border in `border-soft`:
- **Left:** an Airbnb-style logo mark (inline SVG you author yourself, in `text-primary`) plus the wordmark. Do not copy any SVG path from the reference — draw a simple rounded "bélo"-like mark or use a lucide icon; your own work only.
- **Centre:** a search pill — rounded-pill, 1px `border`, `shadow-system`, with segments like "Anywhere · Any week · Add guests" separated by thin dividers, and a small circular `bg-primary` search icon button on the right of the pill.
- **Right:** "Airbnb your home" text link, a globe icon button, and a user menu button (rounded-pill, border, hamburger + user avatar icon).

Sticky: `sticky top-0 z-50` with `bg-canvas`. Do not add a scroll-driven shadow — that is Phase 6's job.

## WHEN DONE
Reply with:
1. Files created (paths only).
2. Any `"use client"` you added and the one-line justification for each.
3. Any value you wanted but had no token for.
4. Anything you could not do.
Keep it under 200 words. Do not paste code.
`````

### 7.2 — `sec-hero`

`````text
You are `sec-hero`, building one section of an Airbnb listing-page clone (Next.js 15 App Router, TypeScript, Tailwind v4).

## FILE OWNERSHIP — ABSOLUTE
You own only your own directory. You may not edit any file outside it. You may not edit src/app/page.tsx.

Your directory is `src/components/hero/`. Create it. Five other agents are working in parallel in their own directories right now; touching anything outside yours will collide with them and be reverted.

Do NOT run `npm run build`, `npm run dev`, or `npx tsc` — a dev server is already running and the orchestrator owns the gates. Just write correct code.

## READ FIRST
- `docs/TOKENS.md` — the complete set of design tokens. This is your palette.
- `src/lib/listing.ts` — the typed data (`Listing`, `Photo`, `listing`).
- `REFERENCE-MEASURED.json` — source of truth; `status: "measured"` entries are verified.

## YOUR SECTION (from IMPLEMENTATION-PLAN.md Phase 4)
> `sec-hero` | `components/hero/` | 1 large + 4 tiles grid, rounded corners, "Show all photos" button, hover dim. Emits `onOpenTour(index)` callback only — does not own modal state.

## THE GEOMETRY IS MEASURED — BUILD TO IT EXACTLY
These are verified against the live reference, not estimates:

| | |
|---|---|
| whole mosaic | 1120 × 494 |
| large tile (left) | **560 × 494** |
| four small tiles | **272 × 243** each |
| gap | **exactly 8px, both axes** |

`560 + 8 + 272 + 8 + 272 = 1120` ✓ and `243 + 8 + 243 = 494` ✓

Tokens exist for all of these: `w-hero-tile-large-w`, `h-hero-tile-large-h`, `w-hero-tile-small-w`, `h-hero-tile-small-h`, `gap-hero-gap`, `h-hero-height`, `w-content-width`. **Use them — do not write `w-[560px]`.** A CSS grid with explicit column/row sizing from these tokens is the cleanest route.

Corner radius: only the mosaic's **outer** corners are rounded (`rounded-hero`); inner edges between tiles stay square. So the large tile rounds left corners only, top-right tile rounds top-right only, bottom-right tile rounds bottom-right only. `overflow-hidden` on a wrapper is the simplest way.

## EXPORT CONTRACT — the orchestrator composes these, do not deviate
```ts
// src/components/hero/index.ts
export { HeroGallery } from './HeroGallery';
```
```ts
type HeroGalleryProps = {
  photos: Photo[];               // pass listing.photos; use the first 5 for the mosaic
  onOpenTour?: (index: number) => void;   // optional — Phase 5 wires it
};
```
When `onOpenTour` is absent the tiles and button must still render and be focusable; they simply do nothing on click. Do NOT own modal state — Phase 5 adds that above you.

## HARD RULES
1. **Zero hardcoded design values.** Every colour, size, weight, radius, shadow, spacing step, duration and easing must be a token from `docs/TOKENS.md`. No `#hex`, no `w-[560px]`, no `duration-200`, no inline `style={{}}` carrying a themeable value. If you need something with no token, use the nearest one and report it — do NOT inline it, do NOT edit the theme.
2. **`next/image` discipline** — this is graded:
   - every photo through `next/image`, never a raw `<img>`
   - `priority` on the large hero tile ONLY (it is the LCP element); everything else lazy
   - a `sizes` attribute matching the real rendered width — the large tile renders at 560px and the small tiles at 272px, so `sizes` must say so, not `100vw`
   - meaningful `alt` from `photo.alt`
   - photos live at `/photos/NN.png`, 1200×800 each
3. **Server Components by default.** This component needs click handlers, so `"use client"` on `HeroGallery` is justified — but keep it the only one.
4. **Never** look at the reference site's source, bundles, CSS, or class names.
5. Accessibility: each tile is a real `<button>` with an accessible name ("View photo 1 of 43" style). Visible focus ring using token colours.

## ALSO BUILD
The **"Show all photos" button**: bottom-right of the mosaic, absolutely positioned, inset from the corner. White `bg-canvas`, 1px `border`, `rounded-sm`, `shadow-system`, small grid icon (`lucide-react`) + the label "Show all photos" in `text-button-md`. Clicking calls `onOpenTour(0)`.

Hover: tiles dim slightly on hover using a token colour overlay and `duration-fast ease-standard`. Motion is already gated behind `prefers-reduced-motion` globally — do not repeat that.

## WHEN DONE
Reply with:
1. Files created (paths only).
2. The exact `sizes` strings you used and why.
3. Any value you wanted but had no token for.
4. Anything you could not do.
Keep it under 200 words. Do not paste code.
`````

### 7.3 — `sec-title`

`````text
You are `sec-title`, building one section of an Airbnb listing-page clone (Next.js 15 App Router, TypeScript, Tailwind v4).

## FILE OWNERSHIP — ABSOLUTE
You own only your own directory. You may not edit any file outside it. You may not edit src/app/page.tsx.

Your directory is `src/components/title/`. Create it. Five other agents are working in parallel in their own directories right now; touching anything outside yours will collide with them and be reverted.

Do NOT run `npm run build`, `npm run dev`, or `npx tsc` — a dev server is already running and the orchestrator owns the gates. Just write correct code.

## READ FIRST
- `docs/TOKENS.md` — the complete set of design tokens. This is your palette.
- `src/lib/listing.ts` — the typed data (`Listing`, `Photo`, `listing`).
- `src/data/listing.json` — the seeded content. Note the `_provenance` block: some fields are verified from the live reference, others are placeholder copy.
- `REFERENCE-MEASURED.json` — source of truth for design values.

## YOUR SECTION (from IMPLEMENTATION-PLAN.md Phase 4)
> `sec-title` | `components/title/` | Title, share/save row, "Entire serviced apartment in Candolim, India", guest/bed/bath line, host row, highlights.

Measured: the title block sits above the hero gallery and is **84px tall** (`h-title-block-height` exists as a token, but let content determine height — use the token only if it helps). Content aligns to `w-content-width` (1120px), which the page shell already provides — build to fill the width you are given, do not re-centre.

## EXPORT CONTRACT — the orchestrator composes these, do not deviate
```ts
// src/components/title/index.ts
export { TitleBlock } from './TitleBlock';        // renders ABOVE the hero gallery
export { PropertySummary } from './PropertySummary'; // renders BELOW the hero, left column
```
```ts
type TitleBlockProps = { listing: Listing };
type PropertySummaryProps = { listing: Listing };
```

**`TitleBlock`** — the listing `<h1>` in `text-display-lg`, and on the same row pinned right: **Share** and **Save** actions (icon + underlined label, `text-body-sm`, underline on hover).

**`PropertySummary`** — everything between the hero and the description:
- `"{propertyType} in {location.city}, {location.country}"` as an `<h2>` in `text-display-sm`
- the stats line: `"{guests} guests · {bedrooms} bedroom · {beds} bed · {bathrooms} bathroom"` in `text-body-md text-muted`
- a **host row**: small circular avatar placeholder (`bg-surface`, `rounded-pill`), "Hosted by {host.name}", and "Superhost · {host.yearsHosting} years hosting" in `text-body-sm text-muted`. Separate it from what is above with a `border-border-soft` top border — the reference uses **zero `<hr>` elements**, dividers are CSS borders.
- the **green discount banner**: `listing.discount.label` ("Get 10% off your next stay") in `text-success`. Give it a `bg-surface rounded-sm` panel with padding.
- the **highlights** list from `listing.highlights` — each is `{ icon, title, body }`. Render icon (from `lucide-react`, map the `icon` string to a component — fall back to a sensible default for unknown names), `title` in `text-title-md`, `body` in `text-body-sm text-muted`.

## HARD RULES
1. **Zero hardcoded design values.** Every colour, font size, weight, line-height, letter-spacing, radius, shadow, spacing step, duration and easing must be a token from `docs/TOKENS.md`. No `#hex`, no `text-[15px]`, no `rounded-[12px]`, no `duration-200`, no inline `style={{}}` carrying a themeable value. If you need something with no token, use the nearest and report it — do NOT inline it, do NOT edit the theme.
   - Tailwind's plain numeric spacing (`p-4`, `gap-2`, `mt-6`) IS allowed for internal rhythm.
2. **Server Components by default.** Share/Save need click handlers — extract ONLY those into a small `"use client"` leaf inside your directory (e.g. `ShareSaveActions.tsx`) and keep `TitleBlock` and `PropertySummary` server components. Save can hold a local toggled state; Share can be a no-op button for now.
3. **Never** look at the reference site's source, bundles, CSS, or class names.
4. Icons from `lucide-react` only. Do not add dependencies.
5. Accessibility: one `<h1>` only, sensible heading order below it, accessible names on icon buttons, `aria-pressed` on the Save toggle, visible focus rings in token colours.

## WHEN DONE
Reply with:
1. Files created (paths only).
2. Any `"use client"` you added and the one-line justification for each.
3. Any value you wanted but had no token for.
4. Anything you could not do.
Keep it under 200 words. Do not paste code.
`````

### 7.4 — `sec-detail`

`````text
You are `sec-detail`, building one section of an Airbnb listing-page clone (Next.js 15 App Router, TypeScript, Tailwind v4).

## FILE OWNERSHIP — ABSOLUTE
You own only your own directory. You may not edit any file outside it. You may not edit src/app/page.tsx.

Your directory is `src/components/detail/`. Create it. Five other agents are working in parallel in their own directories right now; touching anything outside yours will collide with them and be reverted.

Do NOT run `npm run build`, `npm run dev`, or `npx tsc` — a dev server is already running and the orchestrator owns the gates. Just write correct code.

## READ FIRST
- `docs/TOKENS.md` — the complete set of design tokens. This is your palette.
- `src/lib/listing.ts` — the typed data (`Listing`, `Photo`, `listing`).
- `src/data/listing.json` — the seeded content.
- `REFERENCE-MEASURED.json` — source of truth for design values.

## YOUR SECTION (from IMPLEMENTATION-PLAN.md Phase 4)
> `sec-detail` | `components/detail/` | Description, amenities grid, "Show all amenities" button, sleeping arrangement.

## EXPORT CONTRACT — the orchestrator composes these, do not deviate
```ts
// src/components/detail/index.ts
export { Description } from './Description';
export { SleepingArrangement } from './SleepingArrangement';
export { Amenities } from './Amenities';
```
Each takes `{ listing }: { listing: Listing }`.

These render in the **left column (652px)** of a two-column layout. The page shell provides that width — build to fill what you are given, do not set your own column width.

Separate each section from the next with a **top border** in `border-border-soft`. The reference contains **zero `<hr>` elements** — dividers are CSS borders. Vertical rhythm between sections: use the `section-gap` spacing token where it fits.

## WHAT TO BUILD

**`Description`** — `listing.description` is a `string[]` of paragraphs. Render them in `text-body-md text-body`. Below, a **"Show more"** tertiary link (`text-body-md`, underlined, `text-ink`, with a chevron icon) that expands the full text. Clamp to roughly the first paragraph when collapsed.

**`SleepingArrangement`** — heading "Where you'll sleep" in `text-display-md`. Derive from `listing.capacity`: one card per bedroom, `rounded-card`, 1px `border`, padded, containing a bed icon (`lucide-react`), "Bedroom" in `text-title-md`, and "{beds} king bed" in `text-body-sm text-muted`.

**`Amenities`** — heading "What this place offers" in `text-display-md`. A **two-column grid** of `listing.amenities` (each `{ icon, label }`), icon from `lucide-react` (map the `icon` string to a component, with a sensible fallback for unknown names), label in `text-body-md`. Show the first 8; below the grid a **"Show all {n} amenities"** button — white `bg-canvas`, 1px `border-ink`, `rounded-sm`, `text-button-md`, which expands to show the rest.

## HARD RULES
1. **Zero hardcoded design values.** Every colour, font size, weight, line-height, letter-spacing, radius, shadow, spacing step, duration and easing must be a token from `docs/TOKENS.md`. No `#hex`, no `text-[15px]`, no `rounded-[12px]`, no `duration-200`, no inline `style={{}}` carrying a themeable value. If you need something with no token, use the nearest and report it — do NOT inline it, do NOT edit the theme.
   - Tailwind's plain numeric spacing (`p-4`, `gap-2`, `mt-6`) IS allowed for internal rhythm.
   - Line-clamping: `line-clamp-3` is a Tailwind built-in and is fine.
2. **Server Components by default.** "Show more" and "Show all amenities" need state — extract ONLY the expandable parts into small `"use client"` leaves inside your directory, and keep the section wrappers as server components where you can. A client leaf must receive its data as plain serializable props.
3. **Never** look at the reference site's source, bundles, CSS, or class names.
4. Icons from `lucide-react` only. Do not add dependencies.
5. Accessibility: correct heading levels (these sit under the page `<h1>`, so use `<h2>`), `aria-expanded` on both expand toggles, accessible names, visible focus rings in token colours.

## WHEN DONE
Reply with:
1. Files created (paths only).
2. Any `"use client"` you added and the one-line justification for each.
3. Any value you wanted but had no token for.
4. Anything you could not do.
Keep it under 200 words. Do not paste code.
`````

### 7.5 — `sec-booking`

`````text
You are `sec-booking`, building one section of an Airbnb listing-page clone (Next.js 15 App Router, TypeScript, Tailwind v4).

## FILE OWNERSHIP — ABSOLUTE
You own only your own directory. You may not edit any file outside it. You may not edit src/app/page.tsx.

Your directory is `src/components/booking/`. Create it. Five other agents are working in parallel in their own directories right now; touching anything outside yours will collide with them and be reverted.

Do NOT run `npm run build`, `npm run dev`, or `npx tsc` — a dev server is already running and the orchestrator owns the gates. Just write correct code.

## READ FIRST
- `docs/TOKENS.md` — the complete set of design tokens. This is your palette.
- `src/lib/listing.ts` — the typed data (`Listing`, `Photo`, `listing`).
- `src/data/listing.json` — the seeded content.
- `REFERENCE-MEASURED.json` — source of truth for design values.

## YOUR SECTION (from IMPLEMENTATION-PLAN.md Phase 4)
> `sec-booking` | `components/booking/` | Sticky reservation card, price, date/guest selects, Reserve CTA, rating row. `position: sticky`, correct top offset.

## MEASURED CONSTRAINTS
- Card width is **372px** — token `w-reservation-card-width`. It is the right column of `652 + 96 + 372 = 1120`. Set your own width from the token; the page shell gives you the column.
- Sticky top offset: token `spacing-sticky-top-offset` (120px). **This one is an estimate, not measured** — use the token anyway so it is swappable.
- Card: white `bg-canvas`, 1px `border`, `rounded-card`, `shadow-system`, generous internal padding. `shadow-system` is the ONLY shadow in this design system — there is no shadow ladder.

## EXPORT CONTRACT — the orchestrator composes these, do not deviate
```ts
// src/components/booking/index.ts
export { ReservationCard } from './ReservationCard';
```
```ts
type ReservationCardProps = { listing: Listing };
```
The component sets its own `sticky top-sticky-top-offset` positioning.

## WHAT TO BUILD
Use `listing.price` (`{ currency: 'INR', symbol: '₹', total: 28499, nights: 5, guests: 2 }`) and `listing.stay` (`{ from: '2026-10-18', to: '2026-10-23' }`) and `listing.rating`.

1. **Price row** — the per-night figure (derive: `total / nights`) in `text-display-md`, then "night" in `text-body-md text-muted`. Format currency with `Intl.NumberFormat('en-IN', { style: 'currency', currency: listing.price.currency, maximumFractionDigits: 0 })` — do not hand-roll comma placement.
2. **Date + guest selector** — a bordered box, `rounded-sm`, 1px `border`, split into a CHECK-IN / CHECKOUT row (two cells with a vertical divider) and a GUESTS row beneath with a horizontal divider. Labels in `text-badge` uppercase, values in `text-body-sm`. Dividers are CSS borders in `border` — the reference uses **zero `<hr>` elements**. These can be plain buttons that toggle nothing meaningful; a real date picker is out of scope.
3. **Reserve CTA** — full width, `bg-primary`, white text, `rounded-sm`, `text-button-md`, comfortable height. `hover:bg-primary-active` with `duration-fast ease-standard`.
4. **"You won't be charged yet"** in `text-body-sm text-muted`, centred.
5. **Fee breakdown** — a few rows in `text-body-md`: "₹X × {nights} nights", "Cleaning fee", "Airbnb service fee", each with the label underlined-on-hover on the left and the amount right. Then a `border-border-soft` top border and a **Total** row in `text-title-md`. Derive the numbers from `price.total` so they actually add up — invent a plausible split (e.g. base + cleaning + service) and make the arithmetic correct.
6. **Rating row** at the top of the card or just under the price: star icon, `listing.rating.overall`, "·", "{reviewCount} reviews" in `text-body-sm`.

## HARD RULES
1. **Zero hardcoded design values.** Every colour, font size, weight, line-height, letter-spacing, radius, shadow, spacing step, duration and easing must be a token from `docs/TOKENS.md`. No `#hex`, no `w-[372px]`, no `rounded-[12px]`, no `duration-200`, no inline `style={{}}` carrying a themeable value. If you need something with no token, use the nearest and report it — do NOT inline it, do NOT edit the theme.
   - Tailwind's plain numeric spacing (`p-4`, `gap-2`, `mt-6`) IS allowed for internal rhythm.
2. **Server Components by default.** The selects and CTA need handlers — put `"use client"` on the smallest leaf that needs it. If the whole card is static apart from a couple of buttons, keep `ReservationCard` a server component and extract the interactive bits.
3. **Never** look at the reference site's source, bundles, CSS, or class names.
4. Icons from `lucide-react` only. Do not add dependencies.
5. Accessibility is graded: real `<button>` semantics, accessible names on every control, label/value association on the date and guest cells, visible focus rings in token colours. Currency must be readable by a screen reader as a price, not a bare number.

## WHEN DONE
Reply with:
1. Files created (paths only).
2. Any `"use client"` you added and the one-line justification for each.
3. The fee arithmetic you chose and confirmation it sums to the total.
4. Any value you wanted but had no token for.
Keep it under 200 words. Do not paste code.
`````

### 7.6 — `sec-reviews`

`````text
You are `sec-reviews`, building one section of an Airbnb listing-page clone (Next.js 15 App Router, TypeScript, Tailwind v4).

## FILE OWNERSHIP — ABSOLUTE
You own only your own directory. You may not edit any file outside it. You may not edit src/app/page.tsx.

Your directory is `src/components/reviews/`. Create it. Five other agents are working in parallel in their own directories right now; touching anything outside yours will collide with them and be reverted.

Do NOT run `npm run build`, `npm run dev`, or `npx tsc` — a dev server is already running and the orchestrator owns the gates. Just write correct code.

## READ FIRST
- `docs/TOKENS.md` — the complete set of design tokens. This is your palette.
- `src/lib/listing.ts` — the typed data (`Listing`, `Photo`, `listing`).
- `src/data/listing.json` — the seeded content.
- `REFERENCE-MEASURED.json` — source of truth for design values.

## YOUR SECTION (from IMPLEMENTATION-PLAN.md Phase 4)
> `sec-reviews` | `components/reviews/` | Rating summary, category bars, review cards grid, footer.

## EXPORT CONTRACT — the orchestrator composes these, do not deviate
```ts
// src/components/reviews/index.ts
export { Reviews } from './Reviews';       // full-bleed-within-container section
export { SiteFooter } from './SiteFooter'; // page footer
```
Both take `{ listing }: { listing: Listing }`. (`SiteFooter` may ignore it if it does not need the data — keep the prop for a uniform contract.)

## WHAT TO BUILD

**`Reviews`** — uses `listing.rating` (`{ overall, reviewCount, isGuestFavourite }`), `listing.ratingBreakdown` (`{ label, score }[]`), and `listing.reviews`.

1. **Rating summary header** — the overall score large in `text-rating`, flanked by simple laurel-wreath ornaments you author yourself as inline SVG (do NOT copy any path from anywhere — a pair of simple curved leaf shapes, or omit them and use the score alone if you cannot draw them cleanly). Beneath: "Guest favourite" in `text-title-md` and a short line in `text-body-sm text-muted` explaining it is one of the most loved homes. Ratings are shown in ink, not gold stars — that is a deliberate brand choice, so use `text-ink`.
2. **Category bars** — one row per `ratingBreakdown` entry: label in `text-body-sm`, a thin horizontal track (`bg-surface`, `rounded-pill`) with a filled portion (`bg-ink`, `rounded-pill`) whose width is `score / 5`, and the numeric score in `text-body-sm`. Width must be computed — since a percentage width is layout, not a design token, an inline `style={{ width: '...%' }}` IS acceptable here and is the one permitted exception; everything else must be a token.
3. **Review cards grid** — two columns. Each card: circular avatar placeholder (`bg-surface rounded-pill`), author in `text-title-md`, location + date in `text-body-sm text-muted`, body in `text-body-md`, clamped to 4 lines (`line-clamp-4` is a Tailwind built-in and is fine). Separate the grid from the summary with a `border-border-soft` top border — the reference has **zero `<hr>` elements**, dividers are CSS borders.
4. A **"Show all {reviewCount} reviews"** button — white `bg-canvas`, 1px `border-ink`, `rounded-sm`, `text-button-md`.

**`SiteFooter`** — a `border-border-soft` top border, then a few columns of link lists (Support / Hosting / Airbnb) with headings in `text-title-md` and links in `text-body-sm text-muted` with underline-on-hover, then a bottom bar with a copyright line and "·"-separated legal links. Links can be `href="#"`.

## HARD RULES
1. **Zero hardcoded design values.** Every colour, font size, weight, line-height, letter-spacing, radius, shadow, spacing step, duration and easing must be a token from `docs/TOKENS.md`. No `#hex`, no `text-[15px]`, no `rounded-[12px]`, no `duration-200`. The ONLY permitted inline style in this whole section is the category-bar fill width described above. If you need something with no token, use the nearest and report it — do NOT inline it, do NOT edit the theme.
   - Tailwind's plain numeric spacing (`p-4`, `gap-2`, `mt-6`) IS allowed for internal rhythm.
2. **Server Components by default.** This section is almost entirely static — it should need NO `"use client"` at all. If you think you need one, justify it in your report.
3. **Never** look at the reference site's source, bundles, CSS, or class names.
4. Icons from `lucide-react` only. Do not add dependencies.
5. Accessibility is graded: correct heading levels (these sit under the page `<h1>`, so `<h2>`/`<h3>`), the category bars need an accessible text equivalent (the visible numeric score is enough if the bar itself is `aria-hidden`), `<footer>` landmark, visible focus rings in token colours.

## WHEN DONE
Reply with:
1. Files created (paths only).
2. Any `"use client"` you added and the one-line justification for each (ideally none).
3. Any value you wanted but had no token for.
4. Anything you could not do.
Keep it under 200 words. Do not paste code.
`````

---

## 8 — Phase 4 gate: `next-architecture-reviewer`

**2026-08-24T14:16Z** · session `f938afac` · issued by the orchestrator

`````text
Review the Phase 4 listing page implementation in this repo (D:\Projects\airbnb_clone).

Scope — everything under:
- `src/components/` (header, hero, title, detail, booking, reviews, plus `ListingPage.tsx`)
- `src/app/page.tsx`, `src/app/listing/[id]/page.tsx`, `src/app/layout.tsx`
- `src/lib/listing.ts`

Context you need:
- Six subagents built one directory each, in parallel. `ListingPage.tsx` and the two route files were written by the orchestrator afterwards.
- The design-token contract is `docs/TOKENS.md`, generated from `REFERENCE-MEASURED.json` into `src/app/theme.css`. `theme.css` is a generated file — do not review it as hand-written code, and do not propose editing it.
- Measured layout: content 1120px, header 89px, title block 84px, hero 494px with a 560x494 tile and four 272x243 tiles at exactly 8px gaps, left column 652 + gutter 96 + card 372. A geometry assertion script (`scripts/verify-geometry.mjs`) already confirms all 13 of these pass.
- Photos are placeholder PNGs at `/photos/NN.png`, 1200x800, because the reference images were unreachable. That is known and logged — do not report it as a finding.
- Overlays (photo tour, lightbox) are Phase 5 and deliberately not built yet. `HeroGallery` takes an optional `onOpenTour` that is currently unwired. Do not report that as a finding.

Apply your full checklist: Server/Client boundary placement, next/image discipline (including whether `sizes` matches the real rendered widths and whether `priority` is on exactly one element), token compliance, bundle weight, and layering.

Report findings with file:line and severity as your config specifies. You are reviewing, not editing — do not modify any file.

Finish with an explicit one-line verdict: PASS or FAIL for closing Phase 4.
`````

**Verdict: PASS**, conditional on closing one HIGH before Phase 5. It found that
`HeroGallery`'s `onOpenTour` function prop could not cross the Server Component boundary
— structurally unwireable, not merely unwired. That single finding reshaped Phase 5:
overlays became URL state via `next/link`, and `HeroGallery` became a Server Component.

---

## 9 — Phase 5 gate: `a11y-overlay-auditor`

**2026-08-24T14:52Z** · session `f938afac` · issued by the orchestrator

`````text
Audit both overlays in this repo (D:\Projects\airbnb_clone) for Phase 5 closure.

A dev server is ALREADY RUNNING on http://localhost:3000 — use it, do not start another.

URLs (overlay state lives in the URL, matching the reference):
- listing page:  http://localhost:3000/
- photo tour:    http://localhost:3000/?modal=PHOTO_TOUR_SCROLLABLE
- lightbox:      http://localhost:3000/?modal=PHOTO_TOUR_SCROLLABLE&modalItem=1000

Implementation: `src/components/overlay/Overlays.tsx`, both Radix `Dialog`. The URL contract is in `src/lib/overlay-state.ts`. Triggers are `next/link` anchors (role=link, NOT buttons) — the hero tiles and the "Show all photos" link. Inside the tour, gallery photos are buttons named "View photo N of 43" and open the lightbox layered on top, so `[role="dialog"]` matches TWO nodes when the lightbox is open; the lightbox is the last.

An existing spec at `tests/a11y.spec.ts` covers part of this and currently passes 14/14 (`npx playwright test tests/a11y.spec.ts --workers=1`). Treat it as prior work to VERIFY, not to trust — re-derive the evidence yourself with your own Playwright script. If you find a criterion it asserts weakly or wrongly, say so explicitly; that is a valuable finding.

Two things already decided, so do not report them as new findings:
- Two `color-contrast` violations are declared, documented exceptions (the brand wordmark under the WCAG 1.4.3 logotype exemption, and the Reserve CTA reproducing Airbnb's own #FF385C). They are printed on every run, never suppressed. Rationale is in `docs/BLOCKERS.md` B6. Do challenge whether that framing is honest if you think it is not.
- Photos are placeholder PNGs; the reference images were unreachable.

Run your full criterion table across BOTH overlays, plus axe with each overlay open. Pin viewport 1440x900, deviceScaleFactor 1.

Pay particular attention to these, which I consider the highest-risk:
1. Focus restore. Radix's default did NOT work here — the overlay opens via soft navigation, so Radix captured `<body>`. It is now handled by a custom `onCloseAutoFocus` plus a document-level click listener that remembers the triggering anchor. Verify it actually restores to the exact trigger for: the "Show all photos" link, a hero tile link, and after closing the lightbox back to the tour.
2. Background `inert` / `aria-hidden` — verify a background link is absent from BOTH the tab order and the accessibility tree.
3. `prefers-reduced-motion` — report the computed transition/animation durations under both settings.
4. Arrow-key nav in the lightbox, including that ArrowLeft on photo 1 is a genuine no-op with the prev control disabled, and ArrowRight on photo 43 likewise.

Report pass/fail/untested per criterion with the observed evidence, per your config. UNTESTED blocks closure exactly like FAIL. You audit, you do not fix — do not modify any file.

Finish with an explicit one-line verdict: PASS or FAIL for closing Phase 5.
`````

---

## 10 — Phase 5 gate, re-audit after fixes

**2026-08-24T15:18Z** · session `f938afac` · issued by the orchestrator

The first `a11y-overlay-auditor` run returned FAIL with three blocking defects. This
re-run verifies the fixes and re-checks the criteria the fixes could plausibly have
broken — the lightbox nesting change in particular is structural.

`````text
RE-AUDIT for Phases 5 and 6 closure (D:\Projects\airbnb_clone). You audited this build earlier and returned FAIL with three blocking defects. All three have been addressed. Verify them, and re-check the criteria your fixes could plausibly have broken.

A dev server is ALREADY RUNNING on http://localhost:3000 — use it, do not start another. Pin viewport 1440x900, deviceScaleFactor 1. As before, launch with `ignoreDefaultArgs: ['--hide-scrollbars']` so a real scrollbar exists.

URLs: `/`, `/?modal=PHOTO_TOUR_SCROLLABLE`, `/?modal=PHOTO_TOUR_SCROLLABLE&modalItem=1000`

## What changed

**D1 — lightbox focus restore landed on `<body>`.** Two separate trigger refs now: the tour is captured from `a[href*="modal="]`, the lightbox from a `[data-photo-trigger]` button. `onCloseAutoFocus` is wired on BOTH `Dialog.Content`s. Separately, when clicking Prev onto photo 1 (or Next onto 43) disables the focused control, `LightboxView` hands focus to the opposite arrow.

**D2 — deep-linked lightbox hid its own controls.** The lightbox `Dialog.Root` is now NESTED inside the tour's `Dialog.Content` rather than rendered as a sibling, so Radix applies nested-dialog handling instead of `hideOthers` descending into it to preserve the `aria-live` counter.

**D3 — `scrollIntoView` smooth under reduce.** `jumpTo` now checks `matchMedia('(prefers-reduced-motion: reduce)')` and passes `behavior: 'auto'`.

**Phase 6 additions you have not seen:** CSS overlay enter/exit animations driven by Radix `data-state` (no Framer Motion — it is not installed), and a scroll-driven sticky-header shadow behind `@supports (animation-timeline: scroll())`. Both emitted from `scripts/generate-theme.mjs` into the generated `src/app/theme.css`. Also added: `aria-atomic="true"` on the lightbox counter.

**Our gate was also hardened** using your four findings: `--hide-scrollbars` disabled so the layout-shift assertion is not vacuous (and the scrollbar is now measured BEFORE opening, since `overflow:hidden` removes it); the focus-trap test now walks 60 Tab stops plus a Shift+Tab wrap; lightbox focus-restore and deep-link tests added; `axeScan` now also reads `results.incomplete` for `aria-hidden-focus`. Overlay axe scans are scoped to `[role="dialog"]:not([aria-hidden="true"])` per your point that background findings overstated the overlays' faults. `tests/a11y.spec.ts` now passes 24/24.

## What I need

1. Re-verify D1, D2, D3 specifically, with your own evidence — do not take the above on trust.
2. Re-run your full criterion table on both overlays. The nesting change is structural and could plausibly have broken the trap, scroll lock, Escape, or background hiding.
3. Re-check axe on all three views, both click and deep-link paths, including `results.incomplete`.
4. Confirm reduced motion now suppresses BOTH the new overlay animation and the jump-nav scroll, and report computed durations under both settings.
5. Tell me if the hardened `tests/a11y.spec.ts` still asserts anything weakly, or if 24/24 is now load-bearing.

The two declared `color-contrast` exceptions (brand wordmark, Reserve CTA) remain deliberate; do not re-report them, though you may challenge the framing.

You audit, you do not fix — do not modify any file. Finish with an explicit one-line verdict: PASS or FAIL for closing Phases 5 and 6.
`````

---

## 11 — Phases 6 and 7 gate: `next-architecture-reviewer`

**2026-08-24T15:21Z** · session `f938afac` · issued by the orchestrator

`````text
Review the Phase 7 backend and the Phase 6 motion work in this repo (D:\Projects\airbnb_clone). You reviewed Phase 4 earlier and returned PASS; all of your findings from that pass were applied, so please spot-check that they stayed applied as well.

## Scope

**Phase 7 — Route Handlers (new):**
- `src/server/repository/listing-repository.ts`
- `src/server/services/listing-service.ts`
- `src/server/http.ts`
- `src/app/api/listings/[id]/route.ts` and the `photos/`, `reviews/`, `availability/` routes under it

**Phase 6 — motion (new):**
- `scripts/generate-theme.mjs` — now also emits overlay enter/exit keyframes driven by Radix `data-state`, and a scroll-driven sticky-header shadow behind `@supports (animation-timeline: scroll())`. Framer Motion is deliberately NOT installed; the plan's fallback is CSS transitions only.
- `src/app/theme.css` is the GENERATED output of that script. Review the generator, not the artifact, and do not propose editing `theme.css`.

**Changed:**
- `src/components/ListingPage.tsx` is now an async Server Component that reads through `getListing()` / `getPhotos()` from the service layer instead of importing the seed JSON. Both route files pass `listingId`.

## Context

- The plan required "the page reads through the API at build/request time, not by importing the JSON directly — otherwise the backend is decorative." I deliberately used the **shared service layer** rather than an HTTP self-fetch during SSR: same guarantee that page and API cannot disagree, without a pointless round trip or a dependency on the server's own origin. Tell me if you think that reading is wrong.
- Layering intent: `route.ts` (HTTP only) → service (business logic, no HTTP types) → repository (storage only). Swapping the JSON for Postgres should touch the repository alone.
- Verified working: 200/404/400 across all routes, one error shape `{error:{code,message,details?}}`, `limit` bounded to 50, `from > to` rejected.
- Photos are placeholder PNGs and 34 design values are estimates — both known and logged, not findings.

## What I want

Your full checklist on the new code: layering leaks, Server/Client boundary, error handling, input validation, bundle weight, and whether the service/repository split is real or ceremonial. Also flag anything in the generator that will break when the estimates are replaced by real measurements.

Report findings with file:line and severity. You are reviewing, not editing — do not modify any file.

Finish with an explicit one-line verdict: PASS or FAIL for closing Phases 6 and 7.
`````

**Verdict: FAIL.** It found an unauthenticated GET that returned a 128 MB body from an
uncapped date range, a 200-on-invalid-input, and an overlay animation selector that
matched nothing. It also endorsed the shared-service choice over an HTTP self-fetch
unprompted: *"I'd have flagged the self-fetch as the defect."*

---

## 12 — Phases 6 and 7 gate, re-review after fixes

**2026-08-24T15:39Z** · session `f938afac` · issued by the orchestrator

`````text
RE-REVIEW for Phases 6 and 7 closure (D:\Projects\airbnb_clone). You returned FAIL with one HIGH and several MEDIUMs. All findings have been addressed. Verify them with your own evidence — do not take this summary on trust — and check whether any fix introduced a new problem.

A dev server is ALREADY RUNNING on http://localhost:3000. Do not start another.

## What changed, finding by finding

1. **HIGH, unbounded availability range** — `src/app/api/listings/[id]/availability/route.ts` now caps the span at 365 days via a `.refine`, returning 400. Please re-run your `from=1000-01-01&to=9999-12-31` probe and confirm the response size collapses.
2. **Regex vs calendar** — dates must now round-trip through `Date` to be accepted, so `2026-99-99` and `2026-02-30` are 400.
3. **Dead `[data-slot="dialog-overlay"]` selector** — the attribute is now set on both `Dialog.Overlay` elements in `src/components/overlay/Overlays.tsx`. I verified the Overlay reports `animation-name: overlay-in` where it previously reported `none`.
4. **Repository bypass** — both `generateMetadata` functions now read through `getListing`; `DEFAULT_LISTING_ID` is exported from the service; `src/lib/listing`'s singleton is no longer imported by anything under `app/`.
5. **Three reads per render** — `getListing` is wrapped in React's `cache()`.
6. **`_provenance` in the API** — stripped in `getListing`; the field is now optional in the Zod schema. Regression test at `tests/api.spec.ts`.
7. **Generator silent drops / hardcoded names / duration units** — the generator now collects every skipped token and throws before writing. I verified it refuses to generate when a referenced token is renamed. Durations read their `unit`.
8. **Motion literals and z-index** — `scale(0.99)`, `4rem` and the z-index are now entries in `REFERENCE-MEASURED.json`. Note: `@utility z-lightbox` was **silently dropped** because `z` collides with Tailwind v4's own functional namespace — I caught that by grepping the compiled CSS for a class that never appeared, and renamed it `layer-lightbox`. Please confirm `.layer-lightbox` is present in the compiled output and that the elements actually stack correctly.
9. **`listListingIds()`** deleted.

Current state: `tsc --noEmit` clean, `npm run build` passes, `npx playwright test --workers=1` is 36/36, `node scripts/verify-geometry.mjs` is 13/13.

## What I want

- Confirm or refute each of the nine, with evidence.
- Check specifically whether `cache()` on `getListing` interacts badly with the Route Handlers, and whether stripping `_provenance` broke anything that read it.
- Re-check that the Phase 4 properties still hold (`sizes`, single `priority` on the hero, client-boundary placement, no hardcoded design values).
- Anything new the fixes introduced.

You review, you do not edit — do not modify any file. Finish with an explicit one-line verdict: PASS or FAIL for closing Phases 6 and 7.
`````

---

<!-- Append the next prompt below this line. Verbatim. Do not summarise. -->
