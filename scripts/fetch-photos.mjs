/**
 * Downloads the listing photography from Unsplash into public/photos/.
 *
 * LICENSING — the reason this script filters rather than just taking search results:
 *
 * Unsplash serves two different things through one search endpoint:
 *   - images.unsplash.com/photo-…          Unsplash License: free, commercial use OK
 *   - plus.unsplash.com/premium_photo-…    Unsplash+ : SUBSCRIPTION ONLY, not free
 *
 * Roughly a third of interior-design results are Unsplash+. Shipping one in a take-home
 * would be using a paid asset without a licence, so every candidate is checked and any
 * non-free URL is dropped. Attribution is recorded in public/photos/CREDITS.md even though
 * the Unsplash License does not require it — it costs nothing and makes provenance
 * auditable.
 *
 * Photos are downloaded and committed rather than hot-linked, so the app has no runtime
 * dependency on a third-party CDN and works offline.
 *
 * Run: npm run fetch-photos
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'photos');
const MANIFEST = path.join(ROOT, 'src', 'data', 'photo-manifest.json');

/** Room groups in reference order, with the counts measured off the live page (43 total). */
const GROUPS = [
  { name: 'Living room 1',     count: 5, queries: ['living room interior apartment', 'living room sofa window'] },
  { name: 'Living room 2',     count: 5, queries: ['modern living room daylight', 'lounge interior armchair'] },
  { name: 'Full kitchen',      count: 5, queries: ['modern kitchen interior apartment', 'kitchen counter cabinets'] },
  { name: 'Bedroom',           count: 5, queries: ['hotel bedroom interior bed', 'bedroom pillows linen'] },
  { name: 'Full bathroom',     count: 5, queries: ['modern bathroom interior', 'bathroom sink mirror tiles'] },
  { name: 'Gym',               count: 4, queries: ['gym dumbbells', 'fitness equipment treadmill', 'weights rack gym interior'] },
  { name: 'Exterior',          count: 5, queries: ['apartment balcony tropical view', 'building exterior palm trees'] },
  { name: 'Pool',              count: 5, queries: ['swimming pool resort sunny', 'pool sun loungers hotel'] },
  { name: 'Additional photos', count: 4, queries: ['apartment interior detail plant', 'interior decor shelf'] },
];

const WIDTH = 1600;
const HEIGHT = 1067; // 3:2, matching the tour grid; object-cover handles the tiles

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Free Unsplash License only. Unsplash+ (`plus.` / `premium_photo-`) is subscription-only. */
function isFreeLicence(photo) {
  const raw = photo?.urls?.raw ?? '';
  return raw.startsWith('https://images.unsplash.com/photo-') && !raw.includes('premium_photo-');
}

/**
 * Search with backoff. Paginating quickly across nine groups trips Unsplash's rate limit
 * (429); a plain throw there wastes every photo already downloaded, so retry patiently
 * instead. Cached to disk so a resumed run costs no further requests.
 */
const CACHE = path.join(ROOT, 'node_modules', '.cache', 'unsplash-search');

async function search(query, page = 1, perPage = 30) {
  const key = path.join(CACHE, `${Buffer.from(`${query}|${page}`).toString('base64url')}.json`);
  if (fs.existsSync(key)) return JSON.parse(fs.readFileSync(key, 'utf8'));

  const url =
    `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}` +
    `&per_page=${perPage}&page=${page}&orientation=landscape`;

  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const results = (await res.json()).results ?? [];
      fs.mkdirSync(CACHE, { recursive: true });
      fs.writeFileSync(key, JSON.stringify(results), 'utf8');
      return results;
    }
    if (res.status !== 429) throw new Error(`search "${query}" p${page} failed: ${res.status}`);
    const wait = 4000 * attempt;
    process.stdout.write(`    rate limited, waiting ${wait / 1000}s (attempt ${attempt}/5)
`);
    await sleep(wait);
  }
  throw new Error(`search "${query}" p${page}: still rate limited after 5 attempts`);
}

/**
 * Collect `need` free-licence, not-yet-used photos for a group.
 *
 * Walks the group's fallback queries and pages through each. Some categories are dominated
 * by Unsplash+ — "gym" yielded only 3 free results on the first page — so a single query
 * is not enough to fill a group without either duplicating or reaching for a paid asset.
 */
async function collect(group, seen, counters) {
  const picked = [];
  for (const query of group.queries) {
    for (let page = 1; page <= 3 && picked.length < group.count; page++) {
      const results = await search(query, page);
      if (!results.length) break;
      for (const photo of results) {
        if (picked.length >= group.count) break;
        if (!isFreeLicence(photo)) {
          counters.rejected++;
          continue;
        }
        if (seen.has(photo.id)) continue;
        seen.add(photo.id);
        picked.push(photo);
      }
      await sleep(1500);
    }
    if (picked.length >= group.count) break;
  }
  return picked;
}

async function download(photo, file) {
  // Ask the CDN for exactly the size we need rather than the 7000px original.
  const src = `${photo.urls.raw}&w=${WIDTH}&h=${HEIGHT}&fit=crop&crop=entropy&q=80&fm=jpg`;
  const res = await fetch(src);
  if (!res.ok) throw new Error(`download ${photo.id} failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 10_000) throw new Error(`download ${photo.id} suspiciously small`);
  fs.writeFileSync(file, buf);
  return buf.length;
}

fs.mkdirSync(OUT, { recursive: true });

const seen = new Set();
const manifest = [];
let index = 0;
let bytes = 0;

const counters = { rejected: 0 };

for (const group of GROUPS) {
  const picked = await collect(group, seen, counters);

  if (picked.length < group.count) {
    throw new Error(
      `"${group.name}": found only ${picked.length} free-licence photos across ` +
        `${group.queries.length} queries, need ${group.count}. Add another fallback query — ` +
        `do NOT relax the licence filter.`,
    );
  }

  for (const photo of picked) {
    index++;
    const name = `${String(index).padStart(2, '0')}.jpg`;
    const file = path.join(OUT, name);
    // Resume: a rate-limited run should not re-download what it already has.
    bytes += fs.existsSync(file) && fs.statSync(file).size > 10_000
      ? fs.statSync(file).size
      : await download(photo, file);

    manifest.push({
      file: `/photos/${name}`,
      group: group.name,
      // Unsplash's own description makes a far better alt than "photo 3 of 5".
      alt: photo.alt_description
        ? photo.alt_description.charAt(0).toUpperCase() + photo.alt_description.slice(1)
        : `${group.name} at this property`,
      unsplashId: photo.id,
      photographer: photo.user?.name ?? 'Unknown',
      photographerUrl: `https://unsplash.com/@${photo.user?.username ?? ''}`,
      sourceUrl: `https://unsplash.com/photos/${photo.id}`,
    });

    process.stdout.write(`  ${name}  ${group.name.padEnd(18)} ${photo.id}\n`);
    await sleep(120); // be polite
  }
  await sleep(1200);
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

const credits = [
  '# Photo credits',
  '',
  'All listing photography is from [Unsplash](https://unsplash.com) under the',
  '[Unsplash License](https://unsplash.com/license): free to use, including commercially,',
  'with no permission needed. Attribution is not required by the licence — it is recorded',
  'here anyway so the provenance of every asset in this submission is auditable.',
  '',
  '**Unsplash+ / premium assets were explicitly excluded.** Those are subscription-only and',
  'are served from `plus.unsplash.com` as `premium_photo-…`; `scripts/fetch-photos.mjs`',
  `filters them out (${counters.rejected} candidates rejected on the run that produced this file).`,
  '',
  '| # | Group | Photographer | Source |',
  '|---|---|---|---|',
  ...manifest.map(
    (m, i) =>
      `| ${i + 1} | ${m.group} | [${m.photographer}](${m.photographerUrl}) | [${m.unsplashId}](${m.sourceUrl}) |`,
  ),
  '',
];
fs.writeFileSync(path.join(OUT, 'CREDITS.md'), credits.join('\n'), 'utf8');

console.log(
  `\n${manifest.length} photos, ${(bytes / 1024 / 1024).toFixed(1)} MB, ` +
    `${counters.rejected} non-free candidates rejected`,
);
console.log(`manifest -> ${path.relative(ROOT, MANIFEST)}`);
console.log(`credits  -> ${path.relative(ROOT, path.join(OUT, 'CREDITS.md'))}`);
