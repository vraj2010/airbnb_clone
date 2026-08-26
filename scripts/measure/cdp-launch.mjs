/**
 * Launches Chrome with the remote-debugging port open, so the measurement scripts can
 * attach over CDP.
 *
 * Why this exists: every value in REFERENCE-MEASURED.json used to be derived from
 * screenshots, and screenshots carry the browser's zoom level. A set of captures taken at
 * ~124% zoom inflated every measurement by that factor — a 89px header read as 110px, a
 * 1120px container as 1400px — and the whole design drifted 24% large. Reading computed
 * values over CDP removes that entire class of error: the numbers come from the engine,
 * not from pixels.
 *
 * This script only starts a browser. It never solves, bypasses, or automates the bot
 * checkpoint the reference sometimes shows — if one appears, clear it by hand in the
 * window this opens, then re-run the extractor.
 *
 * Usage: npm run cdp
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const PROFILE = path.join(ROOT, '.pw-profile');
/*
 * 127.0.0.1, not `localhost`. Chrome binds the debugging port to IPv4 only, while Node's
 * fetch (undici) resolves `localhost` to ::1 first and then fails outright — so a probe
 * against `localhost` reports the endpoint down even while curl reaches it fine.
 */
export const CDP_URL = 'http://127.0.0.1:9222';
export const TARGET = 'https://airbnb-clone-umber-two.vercel.app';

export function resolveChrome() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA ?? '', 'Google\\Chrome\\Application\\chrome.exe'),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
  ];
  const found = candidates.find((p) => p && fs.existsSync(p));
  if (!found) throw new Error('Could not find Chrome. Checked:\n  ' + candidates.join('\n  '));
  return found;
}

/** True once the CDP endpoint answers. */
export async function cdpUp() {
  try {
    const res = await fetch(`${CDP_URL}/json/version`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function ensureChrome({ quiet = false } = {}) {
  if (await cdpUp()) {
    if (!quiet) console.log('CDP already up on ' + CDP_URL);
    return;
  }
  const chrome = resolveChrome();
  if (!quiet) console.log('launching ' + chrome);
  spawn(
    chrome,
    [
      '--remote-debugging-port=9222',
      `--user-data-dir=${PROFILE}`,
      '--window-size=1440,900',
      '--force-device-scale-factor=1',
      '--no-first-run',
      '--no-default-browser-check',
      TARGET,
    ],
    { detached: true, stdio: 'ignore' },
  ).unref();

  for (let i = 0; i < 30; i++) {
    if (await cdpUp()) {
      if (!quiet) console.log('CDP up on ' + CDP_URL);
      return;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('Chrome started but no CDP endpoint appeared on ' + CDP_URL);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await ensureChrome();
  console.log('\nLeave this Chrome window open. If it shows a bot checkpoint, clear it by');
  console.log('hand, then run:  npm run measure');
}
