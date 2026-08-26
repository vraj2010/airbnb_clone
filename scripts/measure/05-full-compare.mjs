/**
 * One full-page capture of each build, sliced into aligned side-by-side bands.
 *
 * Replaces the per-section scroll approach, which was both slow and unreliable against
 * the reference: it lazy-loads as you scroll, so the anchor kept sliding out from under
 * the capture and each section needed several settle passes.
 *
 * Here each page is captured once at full height, the anchor offsets are read from the
 * DOM in the same pass, and the bands are cut offline — no scrolling during capture, so
 * the two sides are aligned on the same landmark by construction.
 *
 * Usage: npm run compare
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { ensureChrome, CDP_URL, TARGET } from './cdp-launch.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'reference-teardown');
const LOCAL = process.env.LOCAL_URL ?? 'http://localhost:3000/';
const W = 1886;
const BAND = 900;

/** Landmarks present in both builds; each becomes one aligned comparison band. */
const ANCHORS = [
  { name: '1-top', text: null },
  { name: '2-summary', text: 'Entire serviced apartment' },
  { name: '3-amenities', text: 'What this place offers' },
  { name: '4-reviews', text: 'Guest favourite' },
  { name: '5-location', text: 'Where you’ll be' },
  { name: '6-host', text: 'Meet your host' },
];

/** Absolute document Y of each anchor, by its own text (not textContent). */
const OFFSETS = (anchors) => {
  const own = (el) =>
    [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
  const out = {};
  for (const a of anchors) {
    if (!a.text) { out[a.name] = 0; continue; }
    const el = [...document.querySelectorAll('h1,h2,h3,p,span,div')].find(
      (e) => own(e).startsWith(a.text) && e.getBoundingClientRect().height > 8,
    );
    out[a.name] = el
      ? Math.round(el.getBoundingClientRect().top + document.scrollingElement.scrollTop - 60)
      : null;
  }
  return out;
};

/** Scroll the whole page once so lazy images decode before the full-height capture. */
const warm = async (page) => {
  await page.evaluate(async () => {
    const frame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 60)));
    const el = document.scrollingElement;
    for (let y = 0; y < el.scrollHeight; y += 600) { el.scrollTop = y; await frame(); }
    el.scrollTop = 0;
    await frame();
  });
  await page.waitForTimeout(1200);
};

await ensureChrome({ quiet: true });

// -- reference -------------------------------------------------------------------------
const refBrowser = await chromium.connectOverCDP(CDP_URL);
const refCtx = refBrowser.contexts()[0];
let ref = refCtx.pages().find((p) => p.url().includes('airbnb-clone-umber-two')) ?? refCtx.pages()[0];
if (!ref.url().includes('airbnb-clone-umber-two')) {
  await ref.goto(TARGET, { waitUntil: 'domcontentloaded', timeout: 60000 });
}
const cdp = await refCtx.newCDPSession(ref);
await cdp.send('Emulation.setDeviceMetricsOverride', {
  width: 1901, height: BAND, deviceScaleFactor: 1, mobile: false,
});
for (let i = 0; i < 20; i++) {
  if ((await ref.evaluate(() => document.body?.querySelectorAll('*').length ?? 0)) > 200) break;
  await ref.waitForTimeout(1000);
}
await warm(ref);
const refOffsets = await ref.evaluate(OFFSETS, ANCHORS);
const refHeight = await ref.evaluate(() => document.documentElement.scrollHeight);
const refShot = Buffer.from(
  (await cdp.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: W, height: refHeight, scale: 1 },
  })).data,
  'base64',
);
console.log(`reference: ${refHeight}px tall`);

// -- this build ------------------------------------------------------------------------
const localBrowser = await chromium.launch();
const localCtx = await localBrowser.newContext({
  viewport: { width: W, height: BAND }, deviceScaleFactor: 1, reducedMotion: 'reduce',
});
const local = await localCtx.newPage();
await local.goto(LOCAL, { waitUntil: 'networkidle' });
await local.evaluate(() => document.fonts.ready);
await warm(local);
const localOffsets = await local.evaluate(OFFSETS, ANCHORS);
const localShot = await local.screenshot({ fullPage: true });
const localHeight = await local.evaluate(() => document.documentElement.scrollHeight);
console.log(`ours:      ${localHeight}px tall`);

fs.mkdirSync(OUT, { recursive: true });

const LABEL_H = 34;
const label = (text, width) =>
  Buffer.from(
    `<svg width="${width}" height="${LABEL_H}"><rect width="100%" height="100%" fill="#222"/>` +
      `<text x="12" y="23" font-family="sans-serif" font-size="15" fill="#fff">${text}</text></svg>`,
  );

const band = async (buf, top, total) => {
  const y = Math.max(0, Math.min(top, Math.max(0, total - BAND)));
  return sharp(buf).extract({ left: 0, top: y, width: W, height: Math.min(BAND, total - y) }).toBuffer();
};

for (const a of ANCHORS) {
  const rTop = refOffsets[a.name];
  const lTop = localOffsets[a.name];
  if (rTop === null || lTop === null) {
    console.warn(`  ! ${a.name}: anchor missing (ref=${rTop} ours=${lTop}) — skipped`);
    continue;
  }
  const [rb, lb] = await Promise.all([
    band(refShot, rTop, refHeight),
    band(localShot, lTop, localHeight),
  ]);
  const half = Math.round(W / 2);
  const [rs, ls] = await Promise.all([
    sharp(rb).resize({ width: half }).toBuffer(),
    sharp(lb).resize({ width: half }).toBuffer(),
  ]);
  const h = Math.max(
    (await sharp(rs).metadata()).height,
    (await sharp(ls).metadata()).height,
  );
  await sharp({
    create: { width: half * 2, height: h + LABEL_H, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([
      { input: label('REFERENCE (live)', half), top: 0, left: 0 },
      { input: label('OURS', half), top: 0, left: half },
      { input: rs, top: LABEL_H, left: 0 },
      { input: ls, top: LABEL_H, left: half },
    ])
    .png()
    .toFile(path.join(OUT, `cmp-${a.name}.png`));
  console.log(`wrote cmp-${a.name}.png   (ref y=${rTop}, ours y=${lTop})`);
}

await localBrowser.close();
void refBrowser; // never close the hand-launched reference session
process.exit(0);
