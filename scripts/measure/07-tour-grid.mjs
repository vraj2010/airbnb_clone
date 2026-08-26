/**
 * Dumps the reference Photo Tour's ACTUAL photo grid — every image box, grouped by the
 * section heading above it — and captures the overlay full-height.
 *
 * Why a second tour script: 06 sampled only the first handful of images and inferred a
 * uniform two-column grid from them. The sample showed 458-wide boxes interleaved with
 * 223-wide pairs, which a uniform grid cannot produce. This one takes every box so the
 * real pattern is visible rather than guessed.
 *
 * It also verifies the overlay is genuinely painted before capturing: the earlier attempt
 * screenshotted the listing page underneath because it never checked.
 *
 * Usage: npm run tour:grid
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { ensureChrome, CDP_URL, TARGET } from './cdp-launch.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'reference-teardown');

await ensureChrome({ quiet: true });
const browser = await chromium.connectOverCDP({ endpointURL: CDP_URL, timeout: 60000 });
const ctx = browser.contexts()[0];
const page = ctx.pages().find((p) => p.url().includes('airbnb-clone-umber-two')) ?? ctx.pages()[0];
const cdp = await ctx.newCDPSession(page);

await cdp.send('Emulation.setDeviceMetricsOverride', {
  width: 1886, height: 900, deviceScaleFactor: 1, mobile: false,
});

await page.goto(`${TARGET}/?modal=PHOTO_TOUR_SCROLLABLE`, {
  waitUntil: 'domcontentloaded', timeout: 60000,
});
for (let i = 0; i < 30; i++) {
  const n = await page.evaluate(() => document.body?.querySelectorAll('*').length ?? 0);
  if (n > 300) break;
  await page.waitForTimeout(1000);
}
await page.waitForTimeout(2500);

// Close any modal stacked above the tour (app state survives navigation here).
for (let i = 0; i < 3; i++) {
  const labels = await page.evaluate(() =>
    [...document.querySelectorAll('[role=dialog]')].map((d) => d.getAttribute('aria-label')),
  );
  if (labels.length <= 1) break;
  await page.keyboard.press('Escape');
  await page.waitForTimeout(900);
}

// Walk the tour's own scroller so every lazy image decodes and reports a real box.
const scrolled = await page.evaluate(async () => {
  const frame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 80)));
  const dlg = [...document.querySelectorAll('[role=dialog]')][0];
  if (!dlg) return { ok: false };
  const scroller =
    [...dlg.querySelectorAll('*')].find((e) => e.scrollHeight > e.clientHeight + 50) ?? dlg;
  for (let y = 0; y < scroller.scrollHeight; y += 600) {
    scroller.scrollTop = y;
    await frame();
  }
  scroller.scrollTop = 0;
  await frame();
  return { ok: true, scrollHeight: scroller.scrollHeight, clientHeight: scroller.clientHeight };
});
await page.waitForTimeout(1500);

const report = await page.evaluate(() => {
  const own = (el) =>
    [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
  const dlg = [...document.querySelectorAll('[role=dialog]')][0];
  if (!dlg) return { none: true };

  const cs = getComputedStyle(dlg);
  const visible = {
    opacity: cs.opacity,
    visibility: cs.visibility,
    display: cs.display,
    position: cs.position,
    background: cs.backgroundColor,
    zIndex: cs.zIndex,
  };

  const scroller =
    [...dlg.querySelectorAll('*')].find((e) => e.scrollHeight > e.clientHeight + 50) ?? dlg;
  const top = scroller.getBoundingClientRect().top - scroller.scrollTop;

  // Section headings, so each photo can be attributed to a room.
  const heads = [...dlg.querySelectorAll('h1,h2,h3')]
    .map((e) => ({ t: own(e) || e.textContent.trim(), y: Math.round(e.getBoundingClientRect().top - top) }))
    .filter((h) => h.t && h.t !== 'Photo tour');

  const photos = [...dlg.querySelectorAll('img')]
    .map((im) => {
      const r = im.getBoundingClientRect();
      return {
        x: Math.round(r.x),
        y: Math.round(r.top - top),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    })
    .filter((b) => b.w > 150)
    .sort((a, b) => a.y - b.y || a.x - b.x);

  const group = (y) => {
    let name = '(before first heading)';
    for (const h of heads) if (h.y <= y) name = h.t;
    return name;
  };

  const rows = [];
  for (const p of photos) {
    const row = rows.find((r) => Math.abs(r.y - p.y) < 12);
    if (row) row.items.push(p);
    else rows.push({ y: p.y, group: group(p.y), items: [p] });
  }

  return {
    visible,
    scroller: { h: scroller.scrollHeight, client: scroller.clientHeight },
    widths: [...new Set(photos.map((p) => p.w))].sort((a, b) => a - b),
    photoCount: photos.length,
    rows: rows.slice(0, 14).map((r) => ({
      group: r.group,
      y: r.y,
      boxes: r.items.map((i) => `${i.x},${i.w}x${i.h}`),
    })),
  };
});

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'tour-grid.json'), JSON.stringify(report, null, 1));
console.log('scrolled:', JSON.stringify(scrolled));
console.log(JSON.stringify(report, null, 1));

const { data } = await cdp.send('Page.captureScreenshot', {
  format: 'png',
  clip: { x: 0, y: 0, width: 1886, height: 900, scale: 1 },
  captureBeyondViewport: false,
});
fs.writeFileSync(path.join(OUT, 'tour-ref.png'), Buffer.from(data, 'base64'));
console.log('\nwrote tour-grid.json + tour-ref.png');

void browser;
process.exit(0);
