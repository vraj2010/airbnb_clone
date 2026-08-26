# Token reference

The complete set of design tokens available to components. The tokens themselves are
generated from `REFERENCE-MEASURED.json` into `src/app/theme.css` by `npm run theme`;
this document is the hand-maintained guide to using them.

**No component may use a value that is not in this list.** If something you need is
missing, add it to `REFERENCE-MEASURED.json` and regenerate — do not inline it.
`.claude/skills/token-guardian` governs this and has no escape hatches.

## Colour → `text-*`, `bg-*`, `border-*`

| token | role |
|---|---|
| `ink` | primary text, never pure black |
| `body` | long-form copy |
| `muted` | sub-labels, metadata |
| `canvas` | page background |
| `surface` | hover surfaces, disabled fields |
| `border` | card borders |
| `border-soft` | section dividers (the reference has zero `<hr>` — use CSS borders) |
| `primary` | Rausch: Reserve CTA, active save heart |
| `primary-active` | pressed state |
| `success` | discount banner |
| `error` | validation |
| `lightbox-backdrop` | lightbox backdrop — **white**, measured |
| `overlay-scrim` | photo tour scrim |

## Type → `text-*`

Each carries size + weight + line-height + letter-spacing as one tuple. Never pair a
type token with a separate `font-*`/`leading-*`/`tracking-*` utility unless you
deliberately intend to override the tuple.

| token | role |
|---|---|
| `text-rating` | large rating number |
| `text-display-lg` | listing H1 |
| `text-display-md` | section headings, nightly price |
| `text-display-sm` | sub-section titles |
| `text-title-md` | card/block titles |
| `text-body-md` | running body copy |
| `text-body-sm` | meta lines, dates, prices |
| `text-badge` | small badges |
| `text-button-md` | CTA labels |

## Radius → `rounded-*`

`rounded-sm` (buttons/inputs) · `rounded-card` (reservation card) · `rounded-image`
(tour/lightbox photos) · `rounded-hero` (hero mosaic **outer** corners only — inner edges
stay square) · `rounded-pill` (badges, circular arrows)

## Shadow → `shadow-system`

The design system has exactly **one** shadow. There is no `shadow-sm`/`shadow-lg` ladder.

## Spacing → `w-*`, `h-*`, `p-*`, `m-*`, `gap-*`

Measured structural dimensions, exposed as spacing tokens so no component needs an
arbitrary value like `w-[652px]`:

`content-width` 1120 · `header-height` 89 · `title-block-height` 84 · `hero-height` 494 ·
`hero-gap` 8 · `hero-tile-large-w` 560 · `hero-tile-large-h` 494 · `hero-tile-small-w` 272 ·
`hero-tile-small-h` 243 · `hero-to-body-gap` 48 · `left-column-width` 652 ·
`column-gutter` 96 · `reservation-card-width` 372 · `sticky-top-offset` 120 *(estimated)* ·
`section-gap` 48 *(estimated)*

Tailwind's own numeric spacing scale (`p-4`, `gap-2`, …) remains available for ordinary
internal rhythm. The tokens above are for the measured page skeleton.

## Motion

Duration: `duration-fast` · `duration-base` · `duration-modal`
Easing: `ease-standard` · `ease-out`

`duration-*` are custom `@utility` classes — Tailwind v4 has no `--duration-*` theme
namespace, so bare `duration-200` would be a hardcoded value. All motion is already gated
behind `prefers-reduced-motion: reduce` globally in `theme.css`; you do not need to repeat
that per component.

## Font

`font-sans` — `'Airbnb Cereal VF', Figtree, Inter, system-ui, …`. Applied on `<body>`;
you rarely need it again.

## Opacity modifiers on colour tokens

Tailwind's opacity modifier on a **token** — `bg-ink/10`, `text-ink/60` — is **in policy**.
The colour still comes from the theme; only its alpha is adjusted at the call site, the
same way `hover:` adjusts state. `bg-[#22222219]` is not in policy and never will be.

Use this for scrims and subtle overlays where minting a whole token for one alpha step
would bloat the palette. If the same alpha appears in three or more places, it has earned
a token — add it to `REFERENCE-MEASURED.json` and regenerate.
