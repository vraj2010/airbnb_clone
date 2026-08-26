/**
 * Reads real computed styles off the live reference over CDP and writes them to
 * reference-teardown/computed-truth.json.
 *
 * Two things make this the authoritative measurement path:
 *
 * 1. Values come from the engine, not from pixels, so browser zoom cannot skew them.
 *    (The earlier screenshot-derived pass was taken at ~124% zoom and inflated every
 *    number by that factor.)
 * 2. The reference masks `getComputedStyle` from page script — it returns a zero-length
 *    declaration and `document.styleSheets.length === 0`. So styles are read through the
 *    protocol's own `CSS.getComputedStyleForNode` instead, which is unaffected.
 *
 * Originality: this reads rendered geometry and computed values only. Elements are found
 * by their visible text and tagged with a temporary `data-probe` attribute so the protocol
 * can address them — no generated class name is ever read or relied on, and nothing about
 * the reference's markup, CSS, or bundle source is copied.
 *
 * Usage:  npm run cdp     (once, leaves Chrome open)
 *         npm run measure
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { ensureChrome, CDP_URL, TARGET } from './cdp-launch.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'reference-teardown');

/** Visible strings worth pinning, one per distinct role on the page. */
const TARGETS = [
  'Romantic Jacuzzi', 'Share', 'Save', 'Anywhere', 'Anytime', 'Add guests',
  'Become a host', 'Photos', 'Entire serviced', '3 guests', 'One of the most',
  'Hosted by', 'Outdoor entertainment', 'The pool and alfresco', "Where you'll sleep",
  'What this place offers', 'Get 10%', 'Terms apply', 'Claim', 'CHECK-IN', '10/18/2026',
  'Free cancellation', 'Reserve', 'You won', 'Report this', 'Show all photos',
  'for 5 nights', 'Meet your host', 'Things to know', 'Kitchen', 'Wifi',
];

await ensureChrome({ quiet: true });

const browser = await chromium.connectOverCDP(CDP_URL);
const ctx = browser.contexts()[0];
if (!ctx) throw new Error('Attached, but Chrome exposed no context.');

let page = ctx.pages().find((p) => p.url().includes('airbnb-clone-umber-two')) ?? ctx.pages()[0];
if (!page.url().includes('airbnb-clone-umber-two')) {
  await page.goto(TARGET, { waitUntil: 'domcontentloaded', timeout: 60000 });
}

const cdp = await ctx.newCDPSession(page);
await cdp.send('Emulation.setDeviceMetricsOverride', {
  width: 1901, height: 900, deviceScaleFactor: 1, mobile: false,
});

// The page renders client-side; wait for a real DOM rather than the SSR shell.
for (let i = 0; i < 20; i++) {
  const n = await page.evaluate(() => document.body?.querySelectorAll('*').length ?? 0);
  if (n > 200) break;
  await page.waitForTimeout(1000);
}

const probes = await page.evaluate((targets) => {
  const norm = (s) => (s ?? '').trim().replace(/\s+/g, ' ');
  const own = (el) =>
    [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();

  /*
   * Clear tags from any previous run first. This script attaches to a long-lived browser
   * and never reloads the page, so stale `data-probe` attributes survive between runs —
   * and `DOM.querySelector` returns the FIRST match in document order, which silently
   * pairs a label with the wrong element's computed style.
   */
  for (const el of document.querySelectorAll('[data-probe]')) el.removeAttribute('data-probe');

  /*
   * Several of these strings appear twice — the listing title and "Share" also show up in
   * the sticky sub-nav, at a smaller size. Taking the first match recorded the sub-nav
   * copy and mislabelled the H1 as 13px. Collect every match per label and keep the
   * tallest box, which is reliably the primary occurrence.
   */
  const best = new Map();
  for (const el of document.querySelectorAll('h1,h2,h3,p,span,button,a,div,li')) {
    const text = own(el);
    if (!text || text.length > 70) continue;
    const label = targets.find((t) => norm(text).toLowerCase().startsWith(t.toLowerCase()));
    if (!label) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const prev = best.get(label);
    if (!prev || r.height > prev.r.height) best.set(label, { el, r });
  }

  const out = [];
  let n = 0;
  for (const [label, { el, r }] of best) {
    el.setAttribute('data-probe', String(n));
    out.push({
      label, idx: n++, text: norm(own(el)).slice(0, 48), tag: el.tagName,
      x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
    });
  }
  return out;
}, TARGETS);

await cdp.send('DOM.enable');
await cdp.send('CSS.enable');
const { root } = await cdp.send('DOM.getDocument', { depth: -1 });

const WANT = ['font-size', 'font-weight', 'line-height', 'letter-spacing', 'color',
  'background-color', 'border-radius', 'padding-top', 'padding-left'];

const rows = [];
for (const probe of probes) {
  const { nodeId } = await cdp.send('DOM.querySelector', {
    nodeId: root.nodeId, selector: `[data-probe="${probe.idx}"]`,
  });
  if (!nodeId) continue;
  const { computedStyle } = await cdp.send('CSS.getComputedStyleForNode', { nodeId });
  const style = {};
  for (const c of computedStyle) if (WANT.includes(c.name)) style[c.name] = c.value;
  rows.push({ ...probe, style });
}

const layout = await page.evaluate(() => {
  const box = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: Math.round(b.x), w: Math.round(b.width), h: Math.round(b.height) };
  };
  return {
    client: document.documentElement.clientWidth,
    header: box(document.querySelector('header')),
    h1: box(document.querySelector('h1')),
    leftColumn: box(document.querySelector('main h2') ?? document.querySelector('h2')),
  };
});

fs.mkdirSync(OUT, { recursive: true });
const file = path.join(OUT, 'computed-truth.json');
fs.writeFileSync(file, JSON.stringify({ layout, rows }, null, 1));

console.log(`client width ${layout.client}  header ${JSON.stringify(layout.header)}`);
for (const r of rows) {
  console.log(
    r.label.padEnd(24),
    `${r.style['font-size']}/${r.style['font-weight']}`.padEnd(10),
    `lh ${r.style['line-height']}`.padEnd(14),
    r.style.color,
  );
}
console.log(`\nwrote ${path.relative(ROOT, file)}`);

// Never close over CDP — that would kill the hand-cleared browser session.
void browser;
process.exit(0);
