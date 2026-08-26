/**
 * Builds the submission zip.
 *
 * Excludes node_modules, .next, .git and the Playwright profile/artifacts. Deliberately
 * INCLUDES `.claude/` — the subagent and skill configs are a graded deliverable, and the
 * obvious mistake is to let a dotfile filter eat them.
 *
 * Run: npm run package
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'submission');
const NAME = 'airbnb-clone-submission';

const EXCLUDE_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  '.pw-profile',
  'test-results',
  'playwright-report',
  '.playwright-mcp',
  'submission',
  'out',
  'build',
]);

const EXCLUDE_FILES = new Set(['tsconfig.tsbuildinfo', '.DS_Store', 'Thumbs.db']);

/** Files that MUST be present, or the submission is incomplete. */
const REQUIRED = [
  'README.md',
  'package.json',
  'REFERENCE-MEASURED.json',
  'docs/PROMPTS.md',
  'docs/BUILD-LOG.md',
  'docs/BLOCKERS.md',
  'docs/ESTIMATES.md',
  'docs/AI-WORKFLOW.md',
  'docs/ARCHITECTURE.md',
  'docs/architecture.png',
  '.claude/agents/reference-measurer.md',
  '.claude/agents/visual-diff-runner.md',
  '.claude/agents/a11y-overlay-auditor.md',
  '.claude/agents/next-architecture-reviewer.md',
  '.claude/skills/token-guardian/SKILL.md',
  '.claude/skills/originality-sentinel/SKILL.md',
  'src/app/page.tsx',
  'src/components/ListingPage.tsx',
];

const missing = REQUIRED.filter((f) => !fs.existsSync(path.join(ROOT, f)));
if (missing.length) {
  console.error('Refusing to package - required files missing:');
  for (const m of missing) console.error(`  ${m}`);
  process.exit(1);
}

function collect(dir, rel = '') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      out.push(...collect(path.join(dir, entry.name), relPath));
    } else {
      if (EXCLUDE_FILES.has(entry.name)) continue;
      if (entry.name.endsWith('.tsbuildinfo')) continue;
      out.push(relPath);
    }
  }
  return out;
}

const files = collect(ROOT);
fs.mkdirSync(OUT, { recursive: true });

const zipPath = path.join(OUT, `${NAME}.zip`);
fs.rmSync(zipPath, { force: true });

// Staging dir, so the archive has one clean top-level folder rather than loose files.
const stage = path.join(OUT, NAME);
fs.rmSync(stage, { recursive: true, force: true });
for (const f of files) {
  const dest = path.join(stage, f);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(ROOT, f), dest);
}

/**
 * Zip with what the OS already provides rather than adding an archiver dependency.
 * `powershell` is not on the PATH Node inherits when this is launched from Git Bash, so
 * resolve it absolutely; bsdtar (shipped with Windows 10+) is the fallback, and it also
 * covers macOS/Linux if this is ever run there.
 */
function zip() {
  const ps = process.env.SystemRoot
    ? path.join(process.env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
    : null;

  if (ps && fs.existsSync(ps)) {
    execFileSync(
      ps,
      ['-NoProfile', '-Command', `Compress-Archive -Path "${stage}" -DestinationPath "${zipPath}" -Force`],
      { stdio: 'inherit' },
    );
    return 'Compress-Archive';
  }

  execFileSync('tar', ['-a', '-c', '-f', zipPath, '-C', OUT, NAME], { stdio: 'inherit' });
  return 'tar';
}

const archiver = zip();

fs.rmSync(stage, { recursive: true, force: true });

const sizeMb = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(2);
console.log(`${path.relative(ROOT, zipPath)}  —  ${files.length} files, ${sizeMb} MB  (via ${archiver})`);
console.log(`.claude/ configs included: ${files.filter((f) => f.startsWith('.claude/')).length}`);
