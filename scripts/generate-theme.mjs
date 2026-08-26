/**
 * Generates src/app/theme.css from REFERENCE-MEASURED.json.
 *
 * REFERENCE-MEASURED.json is the single source of truth for every design value.
 * theme.css is a build artifact - never hand-edit it. When real measurements replace
 * the estimates, overwrite the values in the JSON, run `npm run theme`, and every
 * component picks up the change without being touched.
 *
 * Also emits a status banner so a stale theme is obvious at a glance, and
 * docs/ESTIMATES.md so the punch list can never drift from the data.
 *
 * Run: npm run theme
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'REFERENCE-MEASURED.json');
const OUT_CSS = path.join(ROOT, 'src', 'app', 'theme.css');
const OUT_MD = path.join(ROOT, 'docs', 'ESTIMATES.md');

const data = JSON.parse(fs.readFileSync(SRC, 'utf8'));

/**
 * Anything this generator declines to emit. A dropped token becomes `var(--missing)` with
 * no fallback, which renders as nothing — the component silently loses its styling and
 * neither the script, the build, nor the test suite says a word. Since the whole point of
 * this file is that a future measurement pass can rewrite REFERENCE-MEASURED.json freely,
 * a shape change MUST be loud. Collected here and thrown at the end.
 */
const skipped = [];

/** Every leaf entry with a `status`, flattened to `group.key`. */
function entries() {
  const out = [];
  for (const [group, members] of Object.entries(data)) {
    if (group === 'meta' || typeof members !== 'object') continue;
    for (const [key, entry] of Object.entries(members)) {
      if (entry && typeof entry === 'object' && 'status' in entry) {
        out.push({ group, key, ...entry });
      } else {
        out.push({ group, key, __malformed: true });
      }
    }
  }
  return out;
}

const all = entries().filter((e) => {
  if (e.__malformed) {
    skipped.push(`${e.group}.${e.key}: no \`status\` field - cannot tell measured from estimated`);
    return false;
  }
  return true;
});
const estimated = all.filter((e) => e.status === 'estimated');
const measured = all.filter((e) => e.status === 'measured');

const px = (v) => (typeof v === 'number' ? `${v}px` : v);

/** Durations carry a unit in the JSON; do not assume bare numbers are milliseconds. */
function duration(key, entry) {
  const { value, unit } = entry;
  if (typeof value === 'string') return value; // already carries its unit, e.g. "0.2s"
  if (typeof value !== 'number') {
    skipped.push(`motion.${key}: expected number or string, got ${typeof value}`);
    return null;
  }
  if (unit && unit !== 'ms') {
    skipped.push(`motion.${key}: unit "${unit}" not handled - expected ms`);
    return null;
  }
  return `${value}ms`;
}

/** Tokens the tail blocks below reference by name. Renaming one in the JSON must fail. */
function requireTokens(group, keys) {
  for (const k of keys) {
    if (!data[group]?.[k]) skipped.push(`${group}.${k} is referenced by generated CSS but missing`);
  }
}

// -- CSS ------------------------------------------------------------------------------
const L = [];
L.push('/*');
L.push(' * GENERATED FILE - DO NOT EDIT.');
L.push(' * Source: REFERENCE-MEASURED.json   Regenerate: npm run theme');
L.push(' *');
L.push(` * ${measured.length} measured / ${estimated.length} estimated.`);
L.push(' * Estimated values are placeholders awaiting the Phase 2 measurement pass.');
L.push(' * Punch list: docs/ESTIMATES.md');
L.push(' */');
L.push('');
L.push('@import "tailwindcss";');
L.push('');
L.push('@theme {');

L.push('  /* font */');
for (const [k, v] of Object.entries(data.font)) L.push(`  --font-${k}: ${v.value};`);

L.push('');
L.push('  /* color */');
for (const [k, v] of Object.entries(data.color)) {
  L.push(`  --color-${k}: ${v.value};${v.status === 'estimated' ? ' /* estimated */' : ''}`);
}

L.push('');
L.push('  /* type scale - size + weight + line-height + letter-spacing travel together */');
for (const [k, v] of Object.entries(data.type)) {
  const t = v.value;
  L.push(`  --text-${k}: ${px(t.size)};${v.status === 'estimated' ? ' /* estimated */' : ''}`);
  L.push(`  --text-${k}--line-height: ${t.lineHeight};`);
  L.push(`  --text-${k}--font-weight: ${t.weight};`);
  L.push(`  --text-${k}--letter-spacing: ${t.letterSpacing};`);
}

L.push('');
L.push('  /* radius */');
for (const [k, v] of Object.entries(data.radius)) {
  L.push(`  --radius-${k}: ${px(v.value)};${v.status === 'estimated' ? ' /* estimated */' : ''}`);
}

L.push('');
L.push('  /* shadow - the design system has exactly one */');
for (const [k, v] of Object.entries(data.shadow)) {
  L.push(`  --shadow-${k}: ${v.value};${v.status === 'estimated' ? ' /* estimated */' : ''}`);
}

L.push('');
L.push('  /* motion */');
for (const [k, v] of Object.entries(data.motion)) {
  if (k.startsWith('ease-')) L.push(`  --${k}: ${v.value};${v.status === 'estimated' ? ' /* estimated */' : ''}`);
}
for (const [k, v] of Object.entries(data.motion)) {
  if (!k.startsWith('duration-')) continue;
  const d = duration(k, v);
  if (d) L.push(`  --${k}: ${d};`);
}

for (const [k, v] of Object.entries(data.motion)) {
  if (k.startsWith('ease-') || k.startsWith('duration-')) continue;
  L.push(`  --motion-${k}: ${v.value};${v.status === 'estimated' ? ' /* estimated */' : ''}`);
}

L.push('');
L.push('  /* z-index */');
for (const [k, v] of Object.entries(data.zIndex ?? {})) {
  L.push(`  --z-${k}: ${v.value};${v.status === 'estimated' ? ' /* estimated */' : ''}`);
}

L.push('');
L.push('  /* layout - measured structural dimensions, exposed as spacing tokens so no');
L.push('     component ever needs an arbitrary value like w-[652px] */');
for (const [k, v] of Object.entries(data.layout)) {
  if (typeof v.value !== 'number') continue;
  if (k === 'documentScrollHeight') continue; // informational, not a token
  const kebab = k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
  L.push(`  --spacing-${kebab}: ${px(v.value)};${v.status === 'estimated' ? ' /* estimated */' : ''}`);
}
for (const key of ['heroTileLarge', 'heroTileSmall']) {
  const v = data.layout[key];
  const kebab = key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
  L.push(`  --spacing-${kebab}-w: ${px(v.value.w)};`);
  L.push(`  --spacing-${kebab}-h: ${px(v.value.h)};`);
}

L.push('}');
L.push('');
L.push('/* Duration utilities. Tailwind v4 has no --duration-* theme namespace, so bare');
L.push('   `duration-200` would be a hardcoded value in a component - which token-guardian');
L.push('   rejects. These give every duration a name instead. */');
for (const [k, v] of Object.entries(data.motion)) {
  if (!k.startsWith('duration-')) continue;
  L.push(`@utility ${k} {`);
  L.push(`  transition-duration: var(--${k});`);
  L.push('}');
}
requireTokens('motion', ['duration-modal', 'duration-fast', 'ease-out', 'ease-standard',
  'overlay-enter-scale', 'header-lift-range']);
requireTokens('shadow', ['system']);
requireTokens('zIndex', ['lightbox']);

/* ---------------------------------------------------------------------------
   Layout utilities.

   The reference container is responsive and its two columns are proportional — see the
   notes on layout.contentMaxWidth and layout.leftColumnWidth. Both facts are derived here
   from the measured numbers rather than written out by hand, so re-measuring the source
   values is still the only edit anyone has to make.
   --------------------------------------------------------------------------- */
requireTokens('layout', ['contentWidth', 'contentMaxWidth', 'contentSideGutter',
  'leftColumnWidth', 'columnGutter', 'reservationCardWidth', 'mapHeight', 'mapGridCell',
  'heroGap', 'heroHeight', 'headerSideGutter']);
requireTokens('color', ['map-grid', 'map-water', 'map-land', 'map-park']);
requireTokens('radius', ['image']);

{
  const left = data.layout.leftColumnWidth.value;
  const card = data.layout.reservationCardWidth.value;
  const gutter = data.layout.columnGutter.value;
  const content = data.layout.contentWidth.value;

  // Reduce left:card to lowest terms so the fr ratio reads as intent, not as two big numbers.
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const g = gcd(left, card);
  const gapPercent = Math.round((gutter / content) * 1e7) / 1e5;

  L.push('');
  L.push('/* Centred body container. Measured over CDP: a fixed 1120px cap, not fluid. */');
  L.push('@utility container-page {');
  L.push('  width: min(');
  L.push('    var(--spacing-content-max-width),');
  L.push('    100% - 2 * var(--spacing-content-side-gutter)');
  L.push('  );');
  L.push('  margin-inline: auto;');
  L.push('}');
  L.push('');
  L.push('/* The header is full-bleed with a fixed side gutter - NOT a centred max-width');
  L.push('   container. Measured: logo at x=80, last icon button ending at x=1806 in an');
  L.push('   1886px client, i.e. 80px either side of the full width. */');
  L.push('@utility container-header {');
  L.push('  width: 100%;');
  L.push('  padding-inline: var(--spacing-header-side-gutter);');
  L.push('}');
  L.push('');
  L.push(`/* Two-column body split. ${left}fr:${card}fr reduces to ${left / g}:${card / g};`);
  L.push(`   the gap is ${gutter}/${content} of the container, so all three scale together. */`);
  L.push('@utility layout-two-column {');
  L.push('  display: grid;');
  L.push(`  grid-template-columns: ${left / g}fr ${card / g}fr;`);
  L.push(`  gap: ${gapPercent}%;`);
  /*
   * No `align-items: start`. Grid's default `stretch` is load-bearing here: it makes the
   * reservation <aside> as tall as the left column, which is the travel room its sticky
   * child needs. With `start` the aside collapsed to its content height and the card
   * could never actually stick.
   */
  L.push('}');

  /*
   * Photo gallery grid. Measured at both container widths: the large tile is exactly half
   * the container, and the 8px gap at 1120 is a 10px gap at 1400 — the mosaic is one
   * scaled drawing, not a fixed pixel layout. `cqw` expresses that, and unlike a
   * percentage it applies to the ROW gap too (percentage row-gap resolves against height).
   * The corner radius sits on the container with overflow hidden, so the four tiles need
   * no per-corner rounding of their own.
   */
  const heroGapCqw = Math.round((data.layout.heroGap.value / content) * 1e7) / 1e5;
  L.push('');
  L.push('@utility hero-frame {');
  L.push('  container-type: inline-size;');
  L.push('}');
  L.push('@utility hero-mosaic {');
  L.push('  display: grid;');
  L.push('  grid-template-columns: 35fr 17fr 17fr;');
  L.push('  grid-template-rows: 1fr 1fr;');
  L.push(`  gap: ${heroGapCqw}cqw;`);
  L.push(`  aspect-ratio: ${content} / ${data.layout.heroHeight.value};`);
  L.push('  border-radius: var(--radius-image);');
  L.push('  overflow: hidden;');
  L.push('}');
  L.push('@utility hero-tile-large {');
  L.push('  grid-row: span 2;');
  L.push('}');

  /*
   * Map panel. Measured 600px tall at a 1400 container and 480 at 1120 — the same ratio,
   * so it is an aspect box, not a fixed height. The grid overlay inside it reads `cqw`
   * from this container so its cells stay square at any width.
   */
  const mapH = data.layout.mapHeight.value;
  const cell = Math.round((data.layout.mapGridCell.value / content) * 1e7) / 1e5;
  L.push('');
  L.push('@utility map-panel {');
  L.push('  container-type: inline-size;');
  L.push(`  aspect-ratio: ${content} / ${mapH};`);
  L.push('}');
  L.push('@utility map-grid {');
  L.push('  background-image:');
  L.push('    linear-gradient(to right, var(--color-map-grid) 1px, transparent 1px),');
  L.push('    linear-gradient(to bottom, var(--color-map-grid) 1px, transparent 1px);');
  L.push(`  background-size: ${cell}cqw ${cell}cqw;`);
  L.push('}');
}

L.push('');
L.push('/* Stacking utilities. Named layer-*, not z-*: `z` collides with Tailwind v4 own');
L.push('   functional utility namespace, and the custom utility is then silently dropped -');
L.push('   verified by grepping the compiled CSS for a class that never appeared. */');
for (const k of Object.keys(data.zIndex ?? {})) {
  L.push(`@utility layer-${k} {`);
  L.push(`  z-index: var(--z-${k});`);
  L.push('}');
}

L.push('');
L.push('/* ---------------------------------------------------------------------------');
L.push('   Overlay enter/exit.');
L.push('');
L.push('   CSS, not Framer Motion. Radix drives these through data-state and waits for the');
L.push('   animation to finish before unmounting, so a dependency would buy nothing here but');
L.push('   client-bundle weight for two transitions. Durations and easing come from the same');
L.push('   tokens as everything else.');
L.push('   --------------------------------------------------------------------------- */');
L.push('@keyframes overlay-in  { from { opacity: 0 } to { opacity: 1 } }');
L.push('@keyframes overlay-out { from { opacity: 1 } to { opacity: 0 } }');
L.push('@keyframes content-in  { from { opacity: 0; transform: scale(var(--motion-overlay-enter-scale)) } to { opacity: 1; transform: none } }');
L.push('@keyframes content-out { from { opacity: 1; transform: none } to { opacity: 0; transform: scale(var(--motion-overlay-enter-scale)) } }');
L.push('');
L.push('[data-slot="dialog-overlay"][data-state="open"],');
L.push('[role="dialog"][data-state="open"] {');
L.push('  animation: overlay-in var(--duration-modal) var(--ease-out);');
L.push('}');
L.push('[data-slot="dialog-overlay"][data-state="closed"],');
L.push('[role="dialog"][data-state="closed"] {');
L.push('  animation: overlay-out var(--duration-fast) var(--ease-standard);');
L.push('}');
L.push('[role="dialog"][data-state="open"]  { animation-name: overlay-in, content-in; }');
L.push('[role="dialog"][data-state="closed"] { animation-name: overlay-out, content-out; }');
L.push('');
L.push('/* ---------------------------------------------------------------------------');
L.push('   Sticky header shadow.');
L.push('');
L.push('   A scroll-driven animation rather than a scroll listener, so the header stays a');
L.push('   Server Component and ships no JS for this. Wrapped in @supports: browsers without');
L.push('   scroll-timeline simply keep a flat header, which is a fine resting state.');
L.push('   --------------------------------------------------------------------------- */');
L.push('@supports (animation-timeline: scroll()) {');
L.push('  @keyframes header-lift {');
L.push('    from { box-shadow: none; }');
L.push('    to   { box-shadow: var(--shadow-system); }');
L.push('  }');
L.push('  header[data-sticky-header] {');
L.push('    animation: header-lift linear both;');
L.push('    animation-timeline: scroll();');
L.push('    animation-range: 0 var(--motion-header-lift-range);');
L.push('  }');
L.push('}');
L.push('');
L.push('/* Motion is opt-out globally, per the accessibility requirement. */');
L.push('@media (prefers-reduced-motion: reduce) {');
L.push('  *,');
L.push('  *::before,');
L.push('  *::after {');
L.push('    animation-duration: 0.01ms !important;');
L.push('    animation-iteration-count: 1 !important;');
L.push('    transition-duration: 0.01ms !important;');
L.push('    scroll-behavior: auto !important;');
L.push('  }');
L.push('}');
L.push('');

if (skipped.length) {
  console.error('Refusing to generate a silently incomplete theme:');
  for (const line of skipped) console.error(`  ${line}`);
  throw new Error(`${skipped.length} token(s) could not be emitted - see above`);
}

fs.mkdirSync(path.dirname(OUT_CSS), { recursive: true });
fs.writeFileSync(OUT_CSS, L.join('\n'), 'utf8');

// -- ESTIMATES.md ---------------------------------------------------------------------
const byConfidence = (c) => estimated.filter((e) => (e.confidence ?? 'unknown') === c);
const fmt = (v) => (typeof v === 'object' ? JSON.stringify(v) : String(v));

const M = [];
M.push('# Estimates — the measurement punch list');
M.push('');
M.push('**Generated from `REFERENCE-MEASURED.json` by `npm run theme`. Do not hand-edit.**');
M.push('');
M.push(
  `Phase 2 measurement was blocked by the reference's Vercel checkpoint (see the dead-path ` +
    `header in \`scripts/measure/00-bootstrap.mjs\`). Layout geometry had already been captured ` +
    `in a live browser session and is trustworthy. Everything else below is a placeholder.`,
);
M.push('');
M.push(`| | count |`);
M.push(`|---|---|`);
M.push(`| measured | **${measured.length}** |`);
M.push(`| estimated | **${estimated.length}** |`);
M.push('');
M.push('Replacing an estimate is a one-line change in `REFERENCE-MEASURED.json` followed by');
M.push('`npm run theme`. No component is touched.');
M.push('');

for (const conf of ['low', 'medium', 'high']) {
  const rows = byConfidence(conf);
  if (!rows.length) continue;
  M.push(`## Confidence: ${conf} — ${rows.length} value${rows.length === 1 ? '' : 's'}`);
  M.push('');
  if (conf === 'low') M.push('_Measure these first. Most likely to be visibly wrong._');
  if (conf === 'high') M.push('_Still unverified, but well-attested for Airbnb generally._');
  M.push('');
  M.push('| token | estimate | role / note |');
  M.push('|---|---|---|');
  for (const e of rows) {
    M.push(`| \`${e.group}.${e.key}\` | \`${fmt(e.value)}\` | ${e.role ?? e.note ?? ''} |`);
  }
  M.push('');
}

M.push('## Measured — verified against the live reference');
M.push('');
M.push('| token | value | note |');
M.push('|---|---|---|');
for (const e of measured) {
  M.push(`| \`${e.group}.${e.key}\` | \`${fmt(e.value)}\` | ${e.note ?? e.role ?? ''} |`);
}
M.push('');

fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
fs.writeFileSync(OUT_MD, M.join('\n'), 'utf8');

console.log(`theme.css     <- ${measured.length} measured / ${estimated.length} estimated`);
console.log(`ESTIMATES.md  <- ${estimated.length} rows`);
