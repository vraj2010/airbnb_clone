/**
 * Builds a manifest of the reference's image assets, attributed to the slot each one
 * fills: tour photos in room order, hero tiles, nearby-stay cards, host/co-host/reviewer
 * avatars.
 *
 * Reading image asset URLs is the one exception IMPLEMENTATION-PLAN.md carves out of the
 * "never fetch from the reference" rule, and Phase 3 calls for the files to be pulled into
 * /public/photos. Nothing here reads markup, CSS or bundle source.
 *
 * The tour has to be opened by clicking "Show all photos" — the ?modal= deep link mounts
 * the dialog without painting it, and an unpainted dialog reports useless geometry.
 *
 * Usage: npm run images:manifest
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

const settle = async () => {
  for (let i = 0; i < 30; i++) {
    const n = await page.evaluate(() => document.body?.querySelectorAll('*').length ?? 0);
    if (n > 300) break;
    await page.waitForTimeout(1000);
  }
  await page.waitForTimeout(2000);
};

const warm = async (root) => {
  await page.evaluate(async (sel) => {
    const frame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 60)));
    const host = sel ? document.querySelector(sel) : null;
    const scroller = host
      ? ([...host.querySelectorAll('*')].find((e) => e.scrollHeight > e.clientHeight + 50) ?? host)
      : document.scrollingElement;
    for (let y = 0; y < scroller.scrollHeight; y += 600) {
      scroller.scrollTop = y;
      await frame();
    }
    scroller.scrollTop = 0;
    await frame();
  }, root);
  await page.waitForTimeout(2000);
};

await page.goto(`${TARGET}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await settle();
await warm(null);

// -- listing page: hero, nearby stays, avatars ------------------------------------------
const listing = await page.evaluate(() => {
  const raw = (u) => {
    const m = u.match(/[?&]url=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : u;
  };
  const abs = (u) => new URL(raw(u), location.origin).href;
  const box = (e) => {
    const r = e.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.top + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) };
  };
  return [...document.images]
    .map((im) => ({ src: abs(im.currentSrc || im.src), alt: im.alt || '', ...box(im) }))
    .filter((i) => i.w > 0);
});

// -- photo tour: every photo, in room order ---------------------------------------------
await page.evaluate(() => {
  const el = [...document.querySelectorAll('button,a')].find((e) =>
    /Show all photos/i.test(e.textContent.trim()),
  );
  el?.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(600);
await page.evaluate(() => {
  const el = [...document.querySelectorAll('button,a')].find((e) =>
    /Show all photos/i.test(e.textContent.trim()),
  );
  el?.click();
});
await page.waitForTimeout(2500);
await warm('[role=dialog]');

const tour = await page.evaluate(() => {
  const raw = (u) => {
    const m = u.match(/[?&]url=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : u;
  };
  const abs = (u) => new URL(raw(u), location.origin).href;
  const own = (el) =>
    [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();

  const dlg = [...document.querySelectorAll('[role=dialog]')].find(
    (d) => d.getAttribute('aria-label') === 'Photo tour',
  );
  if (!dlg) return { none: true };
  const scroller =
    [...dlg.querySelectorAll('*')].find((e) => e.scrollHeight > e.clientHeight + 50) ?? dlg;
  const top = scroller.getBoundingClientRect().top - scroller.scrollTop;

  const ROOMS = /^(Living room 1|Living room 2|Full kitchen|Bedroom|Full bathroom|Gym|Exterior|Pool|Additional photos)$/;
  // Room labels in the body sit in the left column (x < 900); the chips are up top.
  const labels = [...dlg.querySelectorAll('*')]
    .filter((e) => ROOMS.test(own(e)))
    .map((e) => ({ name: own(e), y: Math.round(e.getBoundingClientRect().top - top), x: Math.round(e.getBoundingClientRect().x) }))
    .filter((l) => l.y > 200)
    .sort((a, b) => a.y - b.y);

  const photos = [...dlg.querySelectorAll('img')]
    .map((im) => {
      const r = im.getBoundingClientRect();
      return {
        src: abs(im.currentSrc || im.src),
        alt: im.alt || '',
        y: Math.round(r.top - top),
        x: Math.round(r.x),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    })
    .filter((p) => p.w > 150)
    .sort((a, b) => a.y - b.y || a.x - b.x);

  const groupFor = (y) => {
    let name = null;
    for (const l of labels) if (l.y <= y + 8) name = l.name;
    return name;
  };

  return { labels, photos: photos.map((p) => ({ ...p, group: groupFor(p.y) })) };
});

fs.mkdirSync(OUT, { recursive: true });
const manifest = { listing, tour };
fs.writeFileSync(path.join(OUT, 'image-manifest.json'), JSON.stringify(manifest, null, 1));

console.log(`listing images: ${listing.length}`);
console.log(`tour labels   : ${tour.labels?.length ?? 0}`);
console.log(`tour photos   : ${tour.photos?.length ?? 0}`);
const byGroup = {};
for (const p of tour.photos ?? []) byGroup[p.group ?? '(none)'] = (byGroup[p.group ?? '(none)'] ?? 0) + 1;
console.log('per group     :', JSON.stringify(byGroup));
console.log(`\nwrote ${path.relative(ROOT, path.join(OUT, 'image-manifest.json'))}`);

void browser;
process.exit(0);
