/**
 * Writes 43 placeholder photos to public/photos/.
 *
 * The real reference images could not be downloaded - the Vercel checkpoint blocks the
 * site, so we never captured their URLs. These stand in so the layout, next/image sizing,
 * aspect ratios and the lightbox can all be built and diffed for real. Swapping them is
 * a drop-in: same filenames, same dimensions.
 *
 * Solid-colour PNGs, encoded here rather than pulling in sharp - a placeholder generator
 * does not justify a native image dependency.
 *
 * Run: npm run photos
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'photos');

const W = 1200;
const H = 800;

// One hue per room group, so the mosaic and the photo tour are readable at a glance.
const GROUP_COLOURS = [
  [198, 214, 226], // Living room 1
  [206, 220, 214], // Living room 2
  [226, 218, 200], // Full kitchen
  [214, 204, 220], // Bedroom
  [204, 216, 224], // Full bathroom
  [216, 212, 206], // Gym
  [200, 218, 208], // Exterior
  [196, 216, 228], // Pool
  [214, 214, 214], // Additional photos
];
const GROUP_SIZES = [5, 5, 5, 5, 5, 4, 5, 5, 4];

const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** Solid fill with a subtle vertical gradient so tiles are not visually flat. */
function png(width, height, [r, g, b]) {
  const raw = Buffer.alloc(height * (width * 3 + 1));
  let o = 0;
  for (let y = 0; y < height; y++) {
    raw[o++] = 0; // filter: none
    const shade = 1 - (y / height) * 0.12;
    const rr = Math.round(r * shade);
    const gg = Math.round(g * shade);
    const bb = Math.round(b * shade);
    for (let x = 0; x < width; x++) {
      raw[o++] = rr;
      raw[o++] = gg;
      raw[o++] = bb;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

fs.mkdirSync(OUT, { recursive: true });

let n = 0;
let bytes = 0;
GROUP_SIZES.forEach((count, gi) => {
  const [r, g, b] = GROUP_COLOURS[gi];
  for (let i = 0; i < count; i++) {
    // Nudge each photo within its group so adjacent tiles are distinguishable.
    const k = 1 - i * 0.035;
    const buf = png(W, H, [Math.round(r * k), Math.round(g * k), Math.round(b * k)]);
    const file = path.join(OUT, `${String(n + 1).padStart(2, '0')}.png`);
    fs.writeFileSync(file, buf);
    bytes += buf.length;
    n++;
  }
});

console.log(`${n} placeholder photos -> public/photos/ (${(bytes / 1024).toFixed(0)} KB total, ${W}x${H})`);
