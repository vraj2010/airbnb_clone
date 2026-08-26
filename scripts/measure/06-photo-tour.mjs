/**
 * Measures the reference's Photo Tour overlay and captures it.
 *
 * Written as one script on purpose: attaching a fresh CDP session per probe wedges this
 * browser after a dozen or so connections, so everything the comparison needs is gathered
 * in a single attach.
 *
 * Usage: npm run tour
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { ensureChrome, CDP_URL, TARGET } from './cdp-launch.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'reference-teardown');
const TOUR_URL = `${TARGET}/?modal=PHOTO_TOUR_SCROLLABLE`;

await ensureChrome({ quiet: true });

const browser = await chromium.connectOverCDP({ endpointURL: CDP_URL, timeout: 60000 });
const ctx = browser.contexts()[0];
const page = ctx.pages().find((p) => p.url().includes('airbnb-clone-umber-two')) ?? ctx.pages()[0];
const cdp = await ctx.newCDPSession(page);

await cdp.send('Emulation.setDeviceMetricsOverride', {
  width: 1886, height: 900, deviceScaleFactor: 1, mobile: false,
});

await page.goto(TOUR_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
for (let i = 0; i < 25; i++) {
  const n = await page.evaluate(() => document.body?.querySelectorAll('*').length ?? 0);
  if (n > 300) break;
  await page.waitForTimeout(1000);
}
await page.waitForTimeout(2500);

// A previously-opened modal can survive in app state and sit on top of the tour.
for (let i = 0; i < 3; i++) {
  const stack = await page.evaluate(() =>
    [...document.querySelectorAll('[role=dialog]')].map((d) => d.getAttribute('aria-label')),
  );
  if (stack.length <= 1) break;
  await page.keyboard.press('Escape');
  await page.waitForTimeout(900);
}

const report = await page.evaluate(() => {
  const own = (el) =>
    [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
  const box = (e) => {
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const font = (e) => {
    if (!e) return null;
    const s = getComputedStyle(e);
    return `${s.fontSize}/${s.fontWeight} lh${s.lineHeight} ${s.color}`;
  };

  const dlg = [...document.querySelectorAll('[role=dialog]')][0];
  if (!dlg) return { none: true, url: location.href };

  const topButtons = [...dlg.querySelectorAll('button')]
    .filter((b) => box(b).y < 110 && box(b).w <= 60)
    .map((b) => ({ label: b.getAttribute('aria-label'), box: box(b) }));

  // The room chips are the buttons carrying a group name and a thumbnail.
  const chips = [...dlg.querySelectorAll('button')]
    .filter((b) => b.querySelector('img') && own(b).length === 0 && b.textContent.trim().length > 0)
    .map((b) => ({
      text: b.textContent.trim().slice(0, 20),
      box: box(b),
      img: box(b.querySelector('img')),
      caption: font([...b.querySelectorAll('*')].find((e) => own(e).length > 0)),
    }));

  const heads = [...dlg.querySelectorAll('h1,h2,h3')].map((e) => ({
    t: own(e) || e.textContent.trim().slice(0, 26),
    box: box(e),
    font: font(e),
  }));

  const photos = [...dlg.querySelectorAll('img')]
    .map(box)
    .filter((b) => b.w > 200)
    .slice(0, 6);

  return {
    url: location.href,
    dialog: box(dlg),
    background: getComputedStyle(dlg).backgroundColor,
    topButtons,
    chipCount: chips.length,
    chips: chips.slice(0, 4),
    headings: heads.slice(0, 6),
    bigPhotos: photos,
    totalImgs: dlg.querySelectorAll('img').length,
  };
});

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'tour-truth.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));

const { data } = await cdp.send('Page.captureScreenshot', {
  format: 'png',
  clip: { x: 0, y: 0, width: 1886, height: 900, scale: 1 },
  captureBeyondViewport: false,
});
fs.writeFileSync(path.join(OUT, 'tour-ref.png'), Buffer.from(data, 'base64'));
console.log('\nwrote tour-truth.json + tour-ref.png');

void browser;
process.exit(0);
