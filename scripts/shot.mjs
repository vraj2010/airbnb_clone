/**
 * Screenshots the LOCAL build. Nothing here touches the reference site.
 *
 * Pinned to 1440x900 @ DPR 1 to match the reference capture settings, so these baselines
 * are comparable with the (deferred) reference captures when those land.
 *
 * Usage: node scripts/shot.mjs [url-path] [out-name] [--full]
 */
import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'tests', 'baselines');

const urlPath = process.argv[2] ?? '/';
const name = process.argv[3] ?? 'listing';
const full = process.argv.includes('--full');

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: 'light',
  reducedMotion: 'reduce', // stable captures
});
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 200)}`);
});

await page.goto(`http://localhost:3000${urlPath}`, { waitUntil: 'networkidle', timeout: 60000 });
await page.evaluate(() => document.fonts.ready);

/*
 * Below-the-fold images are `loading="lazy"`, and neither `networkidle` nor Playwright's
 * own fullPage scroll waits for them to decode. Without this the bottom sections captured
 * as blank frames — a baseline that silently disagreed with what a real visitor sees.
 *
 * Scrolling `window` alone is not enough: with an overlay open, Radix scroll-locks the
 * body and the dialog scrolls its own element, so the tour's photos never enter view and
 * the wait below would sit there until it timed out. Scroll every scrollable container,
 * then return each to the top so sticky/resting states are captured consistently.
 */
await page.evaluate(async () => {
  const frame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 50)));

  const scrollers = [
    document.scrollingElement,
    ...[...document.querySelectorAll('*')].filter((el) => {
      const cs = getComputedStyle(el);
      return (
        /auto|scroll/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1
      );
    }),
  ].filter(Boolean);

  for (const el of scrollers) {
    const step = el.clientHeight || window.innerHeight;
    for (let y = 0; y < el.scrollHeight; y += step) {
      el.scrollTop = y;
      await frame();
    }
    el.scrollTop = 0;
    await frame();
  }
});

/*
 * Best-effort, not a gate. A single image that never decodes should not cost us the whole
 * capture — it should cost us an honest note in the report, so a baseline is never quietly
 * taken against a half-loaded page.
 */
let imagesIncomplete = 0;
try {
  await page.waitForFunction(() => [...document.images].every((im) => im.complete), null, {
    timeout: 15000,
  });
} catch {
  imagesIncomplete = await page.evaluate(
    () => [...document.images].filter((im) => !im.complete).length,
  );
  errors.push(`WARNING: ${imagesIncomplete} image(s) still loading at capture time`);
}
await page.waitForLoadState('networkidle');

const metrics = await page.evaluate(() => ({
  w: innerWidth,
  h: innerHeight,
  dpr: devicePixelRatio,
  scrollHeight: document.documentElement.scrollHeight,
  imgs: document.images.length,
  h1: document.querySelector('h1')?.textContent?.slice(0, 60) ?? null,
  headings: [...document.querySelectorAll('h1,h2,h3')].map((h) => `${h.tagName} ${h.textContent.trim().slice(0, 42)}`),
  landmarks: [...document.querySelectorAll('header,nav,main,aside,footer')].map((e) => e.tagName),
}));

const file = path.join(OUT, `${name}.png`);
await page.screenshot({ path: file, fullPage: full });

console.log(JSON.stringify({ urlPath, file: path.relative(ROOT, file), full, metrics, errors }, null, 2));

await browser.close();
if (errors.length) process.exitCode = 1;
