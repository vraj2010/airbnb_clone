---
name: originality-sentinel
description: Prevents any copying of the reference site's code. Use before fetching any URL, before inspecting page source or bundles, and when implementing behaviour observed on the reference.
---

# Originality Sentinel

The assignment states that direct lift-and-shift of the reference codebase can result in a
lower score or disqualification, and that plagiarism detection is in place. This is the
single highest-consequence rule in the repo — a visual imperfection costs a few marks, a
plagiarism hit costs the submission.

## Forbidden

- Viewing, fetching, saving or reading the reference's HTML source, JS bundles, source maps,
  CSS files, or Tailwind/utility class strings.
- Copying component names, file structure, prop names, or data shapes inferred from its code.
- Pasting any string of its markup into this repo.
- Using a scraper, `curl`, `wget`, "save page as", or DevTools source panel against it.

## Permitted

- Rendered pixels: screenshots, and computed styles read from the rendered DOM. These are
  measurements of appearance, not code.
- Geometry via `getBoundingClientRect`.
- Visible text content, typed out by hand into `data/listing.json`.
- Image asset URLs, for downloading photos into `/public`. Assets are not codebase, and the
  brief asks for identical assets.
- Behaviour described in prose in the spec docs, then implemented from scratch.

## The test

Before writing any component, ask: *could I have written this from a screenshot and a
written description alone?* If the answer needs their source, stop and re-derive it from
the spec.

## Naming

Do not mirror their likely internal naming. Choose names from the domain — `HeroGrid`,
`BookingCard`, `PhotoTourDialog` — arrived at independently. Convergent naming is fine and
expected; derived naming is not.

## If you slip

If you realise reference source has entered context, do not use it. Note it in
`docs/BLOCKERS.md`, and rewrite from the spec any component authored while it was in view.
