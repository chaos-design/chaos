#!/usr/bin/env node
/**
 * Verifies the create-chaos npm tarball before it is published.
 *
 * Publishing is the only step a user cannot undo, so the invariants that matter
 * are asserted here instead of being assumed:
 *
 *  1. `dist/index.mjs` exists (the CLI entry actually ships).
 *  2. No `node_modules` inside the tarball. npm keeps nested node_modules when
 *     a parent directory is listed in `files`, and pnpm's workspace used to put
 *     them inside templates/. They bloat the tarball and break installs.
 *  3. No template file is silently dropped. npm always strips `.gitignore`,
 *     `.npmrc`, `.git` and `.DS_Store`, which is why templates use the
 *     `_gitignore` / `_npmrc` convention instead.
 *  4. Every template declared in src/config.ts is present in the tarball.
 *
 * Usage:
 *   node scripts/verify-pack.mjs [--strict]
 *
 * --strict also fails when untracked build output exists in templates/.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkgDir = path.join(root, 'packages', 'create-chaos');
const templatesDir = path.join(pkgDir, 'templates');
const strict = process.argv.includes('--strict');

const pkg = JSON.parse(
  fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'),
);
const problems = [];
const notes = [];

function fail(message) {
  problems.push(message);
}

function rel(from, to) {
  return path.relative(from, to).split(path.sep).join('/');
}

// npm ignores these at any depth when building a tarball. Templates must never
// contain them, or the file silently disappears from the published package.
const ALWAYS_STRIPPED = new Set(['.gitignore', '.npmrc', '.git', '.DS_Store']);

// 1. dist must exist and be non-trivial.
const distEntry = path.join(pkgDir, 'dist', 'index.mjs');
if (!fs.existsSync(distEntry)) {
  fail('dist/index.mjs is missing. Run `pnpm run build` before verifying.');
} else {
  const bytes = fs.statSync(distEntry).size;
  if (bytes < 1024) {
    fail(
      `dist/index.mjs is only ${bytes} bytes, which looks like a stub build.`,
    );
  } else {
    notes.push(`dist/index.mjs ${Math.round(bytes / 1024)} kB`);
  }
}

// Collect every file that lives on disk under templates/.
function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const onDisk = walk(templatesDir).map((file) => rel(templatesDir, file));

// 2. no node_modules may live inside templates/.
const nestedModules = onDisk.filter((file) =>
  file.split('/').includes('node_modules'),
);
if (nestedModules.length > 0) {
  fail(
    `templates/ still contains ${nestedModules.length} node_modules file(s), e.g. ${nestedModules[0]}. ` +
      'They would be published. Remove them and keep templates out of pnpm-workspace.',
  );
}

// 3. no npm-stripped filename may exist on disk.
const stripped = onDisk.filter((file) =>
  ALWAYS_STRIPPED.has(file.split('/').at(-1)),
);
if (stripped.length > 0) {
  fail(
    `npm strips these filenames from tarballs, so they would never ship: ${stripped.join(', ')}. ` +
      'Rename them to the underscore convention (_gitignore, _npmrc).',
  );
}

if (strict) {
  // Build output that would otherwise be published alongside the sources.
  const artifacts = onDisk.filter(
    (file) =>
      /(^|\/)(\.wxt|dist|build|coverage)\//.test(file) ||
      /\.(tsbuildinfo|map)$/.test(file),
  );
  if (artifacts.length > 0) {
    fail(
      `templates/ contains build artifacts: ${artifacts.slice(0, 5).join(', ')}. ` +
        'Committing them ships stale output to users.',
    );
  }

  // `tsc` emits next to the source whenever a tsconfig lacks `noEmit`, so the
  // output never reaches dist/ and the rules above stay blind to it. Matching
  // "a compiled file whose TypeScript source sits beside it" is exact rather
  // than heuristic, which keeps hand-written config files and JS-only
  // templates from being reported.
  const sources = new Set(
    onDisk.filter((file) => /\.(?:m|c)?tsx?$/.test(file)),
  );
  const emittedByTsc = /\.(?:js|mjs|cjs)$|\.d\.[cm]?ts$/;
  const emitted = onDisk.filter((file) => {
    if (!emittedByTsc.test(file)) return false;
    const base = file.replace(emittedByTsc, '');
    return [`${base}.ts`, `${base}.tsx`, `${base}.mts`, `${base}.cts`].some(
      (candidate) => sources.has(candidate),
    );
  });
  if (emitted.length > 0) {
    fail(
      `templates/ contains compiled output sitting beside its TypeScript source: ` +
        `${emitted.slice(0, 5).join(', ')}. ` +
        'Add "noEmit": true (or an outDir) to that tsconfig and delete these files.',
    );
  }
}

// 4. every configured template must be present in the tarball.
const configSource = fs.readFileSync(
  path.join(pkgDir, 'src', 'config.ts'),
  'utf8',
);
const declared = [...configSource.matchAll(/path:\s*'([^']+)'/g)]
  .map((match) => match[1])
  .filter((value) => value !== '');

for (const templatePath of new Set(declared)) {
  const dir = path.join(templatesDir, templatePath);
  if (!fs.existsSync(dir)) {
    fail(
      `Template directory declared in config.ts is missing: templates/${templatePath}`,
    );
  }
}
notes.push(`${new Set(declared).size} template path(s) declared in config.ts`);

// Read the actual packlist, which is the only authoritative view of the tarball.
let packed = [];
try {
  const raw = execFileSync(
    'npm',
    ['pack', '--dry-run', '--json', '--pack-destination', os_tmp()],
    { cwd: pkgDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
  );
  packed = JSON.parse(raw)[0].files.map((file) => file.path);
} catch (error) {
  fail(`\`npm pack --dry-run\` failed: ${error.message}`);
}

if (packed.length > 0) {
  const packedModules = packed.filter((file) => file.includes('node_modules'));
  if (packedModules.length > 0) {
    fail(
      `${packedModules.length} node_modules path(s) are in the tarball, e.g. ${packedModules[0]}.`,
    );
  }

  // Nothing under templates/ should be missing from the tarball.
  const packedSet = new Set(packed);
  const missing = onDisk
    .map((file) => `templates/${file}`)
    .filter((file) => !packedSet.has(file));
  if (missing.length > 0) {
    fail(
      `${missing.length} template file(s) exist on disk but not in the tarball: ${missing.slice(0, 10).join(', ')}`,
    );
  }

  notes.push(`${packed.length} file(s) in tarball`);
}

// Report.
for (const note of notes) {
  console.log(`  ok  ${note}`);
}

if (problems.length > 0) {
  console.error('\nPack verification failed:');
  for (const problem of problems) {
    console.error(`  x  ${problem}`);
  }
  process.exit(1);
}

console.log(
  `\ncreate-chaos@${pkg.version} tarball looks publishable (npm pack size ~${await packSize()} kB).`,
);

function os_tmp() {
  return fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'chaos-pack-'));
}

async function packSize() {
  try {
    const raw = execFileSync(
      'npm',
      ['pack', '--dry-run', '--json', '--pack-destination', os_tmp()],
      { cwd: pkgDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
    return Math.round(JSON.parse(raw)[0].size / 1024);
  } catch {
    return '?';
  }
}
