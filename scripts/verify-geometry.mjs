/**
 * Asserts the LOCAL build matches the measured page skeleton in REFERENCE-MEASURED.json.
 *
 * These are the values that were actually read off the live reference (status
 * "measured"), so they are the only ones worth asserting hard. Estimated values are not
 * checked here — asserting a guess would just encode the guess.
 *
 * Nothing here touches the reference site.
 *
 * Usage: node scripts/verify-geometry.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ref = JSON.parse(fs.readFileSync(path.join(ROOT, 'REFERENCE-MEASURED.json'), 'utf8'));
const L = ref.layout;

const browser = await chromium.launch();
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
).newPage();
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 });
await page.evaluate(() => document.fonts.ready);

const g = await page.evaluate(() => {
  const box = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
  };
  const tiles = [...document.querySelectorAll('main img')].slice(0, 5).map((i) => {
    const b = i.getBoundingClientRect();
    return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
  });
  return {
    header: box('header'),
    main: box('main'),
    aside: box('main aside'),
    hrCount: document.querySelectorAll('hr').length,
    tiles,
  };
});
await browser.close();

const checks = [];
const check = (name, actual, expected, tol = 1) => {
  const ok = actual !== null && Math.abs(actual - expected) <= tol;
  checks.push({ name, expected, actual, ok });
};

check('header height', g.header?.h, L.headerHeight.value);
check('content width', g.main?.w, L.contentWidth.value);
check('content centred x', g.main?.x, (1440 - L.contentWidth.value) / 2);
check('reservation card width', g.aside?.w, L.reservationCardWidth.value);

if (g.tiles.length >= 5) {
  const [big, ...small] = g.tiles;
  check('hero large tile w', big.w, L.heroTileLarge.value.w);
  check('hero large tile h', big.h, L.heroTileLarge.value.h);
  check('hero small tile w', small[0].w, L.heroTileSmall.value.w);
  check('hero small tile h', small[0].h, L.heroTileSmall.value.h);
  check('hero gap (x)', small[0].x - (big.x + big.w), L.heroGap.value);
  check('hero gap (y)', small[2].y - (small[0].y + small[0].h), L.heroGap.value);
  check('hero total height', big.h, L.heroHeight.value);
  check('hero starts after title block', big.y, L.headerHeight.value + L.titleBlockHeight.value, 2);
} else {
  checks.push({ name: 'hero tiles found', expected: 5, actual: g.tiles.length, ok: false });
}

// The reference contains zero <hr> elements - dividers are CSS borders.
checks.push({ name: '<hr> count', expected: 0, actual: g.hrCount, ok: g.hrCount === 0 });

const pad = (s, n) => String(s).padEnd(n);
console.log(`${pad('check', 34)}${pad('expected', 10)}${pad('actual', 10)}result`);
for (const c of checks) {
  console.log(`${pad(c.name, 34)}${pad(c.expected, 10)}${pad(c.actual, 10)}${c.ok ? 'PASS' : 'FAIL'}`);
}
const failed = checks.filter((c) => !c.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} measured-geometry checks pass`);
if (failed.length) process.exitCode = 1;
