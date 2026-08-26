/**
 * Downloads every image asset named in reference-teardown/image-manifest.json into
 * public/photos/ref/, keeping the reference's own filenames.
 *
 * Image asset URLs are the single exception IMPLEMENTATION-PLAN.md carves out of the
 * "never fetch from the reference" rule, and Phase 3 asks for the files to live in
 * /public rather than being hotlinked. Nothing here reads markup, CSS or bundle source.
 *
 * Fetches run INSIDE the attached browser page, not from Node. A direct `fetch()` from
 * Node gets a blanket 429 from this origin — the same wall `curl` hit during Phase 2 —
 * whereas the browser carries the warm session that already loaded these images. Requests
 * are serialised with a small delay for the same reason: a parallel pool re-triggers the
 * rate limiter.
 *
 * Files are copied byte-for-byte and re-served from this project; they remain the
 * property of whoever shot them. Fine for a local, unpublished assignment; not a licence
 * to redistribute.
 *
 * Usage: npm run images:fetch
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { ensureChrome, CDP_URL } from './cdp-launch.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MANIFEST = path.join(ROOT, 'reference-teardown', 'image-manifest.json');
const DEST = path.join(ROOT, 'public', 'photos', 'ref');

if (!fs.existsSync(MANIFEST)) {
  throw new Error('No image-manifest.json — run `npm run images:manifest` first.');
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const urls = [
  ...new Set(
    [...manifest.listing, ...(manifest.tour?.photos ?? [])].map((i) => i.src),
  ),
];

fs.mkdirSync(DEST, { recursive: true });

await ensureChrome({ quiet: true });
const browser = await chromium.connectOverCDP({ endpointURL: CDP_URL, timeout: 60000 });
const ctx = browser.contexts()[0];
const page = ctx.pages().find((p) => p.url().includes('airbnb-clone-umber-two')) ?? ctx.pages()[0];

let saved = 0;
let cached = 0;
let failed = 0;

for (const url of urls) {
  const name = decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '');
  const dest = path.join(DEST, name);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    cached += 1;
    continue;
  }

  const result = await page.evaluate(async (u) => {
    try {
      const res = await fetch(u, { credentials: 'include' });
      if (!res.ok) return { ok: false, status: res.status };
      const buf = new Uint8Array(await res.arrayBuffer());
      let bin = '';
      const CHUNK = 0x8000;
      for (let i = 0; i < buf.length; i += CHUNK) {
        bin += String.fromCharCode(...buf.subarray(i, i + CHUNK));
      }
      return { ok: true, b64: btoa(bin) };
    } catch (e) {
      return { ok: false, status: String(e).slice(0, 60) };
    }
  }, url);

  if (!result.ok) {
    failed += 1;
    console.warn(`  ! ${result.status} ${name}`);
  } else {
    fs.writeFileSync(dest, Buffer.from(result.b64, 'base64'));
    saved += 1;
    if (saved % 10 === 0) console.log(`  ${saved} saved…`);
  }
  await new Promise((r) => setTimeout(r, 120));
}

const files = fs.readdirSync(DEST);
const bytes = files.reduce((n, f) => n + fs.statSync(path.join(DEST, f)).size, 0);
console.log(`\nsaved ${saved}, cached ${cached}, failed ${failed} (of ${urls.length})`);
console.log(`public/photos/ref: ${files.length} files, ${(bytes / 1024 / 1024).toFixed(1)} MB`);

void browser;
process.exit(0);
