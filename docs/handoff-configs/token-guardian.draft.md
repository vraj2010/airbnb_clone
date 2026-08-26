---
name: token-guardian
description: Enforces that every design value in this repo lives in the Tailwind theme rather than in a component. Use when writing or editing any file under src/components or src/app, when adding styles, or when reviewing a diff for hardcoded values.
---

# Token Guardian

Real measurements of the reference are arriving late in this project. The entire build
strategy depends on being able to swap estimated values for measured ones by editing one
file. A single hardcoded value in a component breaks that guarantee silently.

## Rule

No design value appears in a component. Ever. This covers:

colours, font sizes, font weights, line heights, letter spacing, border radii, box shadows,
spacing (padding, margin, gap), border widths, z-index, transition durations, easing curves,
and breakpoints.

## What this looks like

Rejected:
```tsx
<div className="text-[15px] text-[#222222] rounded-[12px] p-[24px]" />
<div style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }} />
transition: 'all 200ms ease-in-out'
```

Accepted:
```tsx
<div className="text-body text-ink rounded-card p-6" />
<div className="shadow-card transition-hover" />
```

## When a value has no token

Add a named token to the `@theme` block — do **not** inline it, and do **not** round to the
nearest existing token and hope nobody notices. Name it for its role, not its value:
`--color-ink-muted`, not `--color-gray-717171`. Then record it in `docs/ESTIMATES.md` with
the estimate and your confidence, so the measurement pass has a punch list.

## Generated theme

`REFERENCE-MEASURED.json` is the source. `scripts/gen-theme.mjs` is the only writer of the
`@theme` block. Never hand-edit the generated output — it will be overwritten and the change
will vanish without warning.

## No escape hatches

Do not add an "exception for this one case". Do not disable this skill to move faster.
If you believe a value genuinely cannot be tokenised, write the reason in
`docs/BLOCKERS.md` and use a token anyway.
