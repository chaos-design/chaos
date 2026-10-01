#!/usr/bin/env node
/**
 * Verifies the `--custom` code path.
 *
 * These paths are hard to reach through the interactive prompts, and they used
 * to fail silently: a missing `chaos.config.*` produced a `TypeError` that the
 * outer `catch` swallowed, leaving an empty output directory and exit code 0.
 *
 * Usage:
 *   node scripts/verify-custom.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cliPath = path.join(
  root,
  'packages',
  'create-chaos',
  'dist',
  'index.mjs',
);

if (!fs.existsSync(cliPath)) {
  console.error('dist/index.mjs is missing. Run `pnpm run build` first.');
  process.exit(1);
}

const failures = [];
let checks = 0;

function check(name, fn) {
  checks += 1;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'chaos-custom-'));

  try {
    fn(dir);
    console.log(`  ok  ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.error(`  x   ${name}`);
    console.error(`       ${error.message}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function run(cwd, args, env = {}) {
  try {
    return {
      status: 0,
      stdout: execFileSync(process.execPath, [cliPath, ...args], {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, ...env },
        timeout: 20_000,
      }),
    };
  } catch (error) {
    return {
      status: error.status ?? 1,
      stdout: `${error.stdout ?? ''}${error.stderr ?? ''}`,
    };
  }
}

function makeTemplate(dir) {
  const tpl = path.join(dir, 'tpl');
  fs.mkdirSync(path.join(tpl, 'src'), { recursive: true });
  fs.writeFileSync(path.join(tpl, 'README.md'), '# original\n');
  fs.writeFileSync(path.join(tpl, '_gitignore'), 'node_modules\n');
  fs.writeFileSync(path.join(tpl, 'src', 'a.ts'), 'export const a = 1;\n');
  fs.writeFileSync(path.join(tpl, 'ignored.txt'), 'should be skipped\n');
  return tpl;
}

// A missing config must not crash, and must not leave an empty output dir that
// looks like success.
check('missing config reports an error instead of throwing', (dir) => {
  makeTemplate(dir);
  const result = run(dir, ['app', '-t', 'ghost', '--custom']);

  if (result.status === 0) {
    throw new Error('expected a non-zero exit code');
  }
  if (/TypeError|Cannot read propert/.test(result.stdout)) {
    throw new Error(`crashed with a TypeError:\n${result.stdout}`);
  }
  if (!/No custom templates are configured/.test(result.stdout)) {
    throw new Error(`expected a clear diagnostic, got:\n${result.stdout}`);
  }
  if (fs.existsSync(path.join(dir, 'app'))) {
    throw new Error('an empty output directory was created');
  }
});

// A template whose path does not exist must fail loudly.
check('missing template path fails loudly', (dir) => {
  fs.writeFileSync(
    path.join(dir, 'chaos.config.ts'),
    `export default { template: [{ name: 'broken', path: './nope' }] };`,
  );
  const result = run(dir, ['app', '--custom', 'broken']);

  if (result.status === 0) {
    throw new Error('expected a non-zero exit code');
  }
  if (!/does not exist/.test(result.stdout)) {
    throw new Error(
      `expected a "does not exist" message, got:\n${result.stdout}`,
    );
  }
});

// renameFiles and replace must both be honoured.
check('renameFiles and replace are applied', (dir) => {
  makeTemplate(dir);
  fs.writeFileSync(
    path.join(dir, 'chaos.config.ts'),
    `export default {
  template: [
    {
      name: 'demo',
      path: './tpl',
      ignore: ['ignored.txt'],
      renameFiles: { 'README.md': 'DOCS.md', '_gitignore': '.gitignore' },
      replace: (file: string, content: string, packageName: string) => {
        if (file === 'a.ts') return '';
        if (file === 'ignored.txt') return '';
        return \`\${content}/* \${packageName} */\`;
      },
    },
  ],
};`,
  );

  const result = run(dir, ['app', '--custom', 'demo']);
  if (result.status !== 0) {
    throw new Error(`expected success, got:\n${result.stdout}`);
  }

  const out = path.join(dir, 'app');
  const read = (rel) => {
    const file = path.join(out, rel);
    return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  };

  if (!read('DOCS.md')) throw new Error('renameFiles did not rename README.md');
  if (read('README.md')) throw new Error('the original README.md still exists');
  if (!read('.gitignore'))
    throw new Error('renameFiles did not rename _gitignore');

  // `replace` receives the basename, not the path relative to the template.
  if (read('src/a.ts') !== 'export const a = 1;\n') {
    throw new Error(
      `replace returning '' did not preserve the original file, got: ${JSON.stringify(read('src/a.ts'))}`,
    );
  }

  if (read('ignored.txt') !== null) {
    throw new Error('ignore did not skip ignored.txt');
  }

  // The third replace argument is the package name.
  if (!read('DOCS.md').includes('/* app */')) {
    throw new Error(
      'replace did not receive packageName as its third argument',
    );
  }
});

// A replace hook that throws must not produce a half-written project.
check('a throwing replace is reported, not swallowed', (dir) => {
  makeTemplate(dir);
  fs.writeFileSync(
    path.join(dir, 'chaos.config.ts'),
    `export default {
  template: [
    {
      name: 'boom',
      path: './tpl',
      replace: () => { throw new Error('replace exploded'); },
    },
  ],
};`,
  );

  const result = run(dir, ['app', '--custom', 'boom']);
  if (result.status === 0) {
    throw new Error('expected a non-zero exit code');
  }
  if (!/replace exploded/.test(result.stdout)) {
    throw new Error(
      `expected the failure to be surfaced, got:\n${result.stdout}`,
    );
  }
});

// A config entry missing its path must fail, not crash.
check('a config entry without a path is rejected', (dir) => {
  fs.writeFileSync(
    path.join(dir, 'chaos.config.ts'),
    `export default { template: [{ name: 'nopath' }] };`,
  );
  const result = run(dir, ['app', '--custom', 'nopath']);

  if (result.status === 0) {
    throw new Error('expected a non-zero exit code');
  }
  if (/TypeError|Cannot read propert/.test(result.stdout)) {
    throw new Error(`crashed with a TypeError:\n${result.stdout}`);
  }
});

if (failures.length > 0) {
  console.error(
    `\n${failures.length} of ${checks} custom-template checks failed.`,
  );
  process.exit(1);
}

console.log(`\nAll ${checks} custom-template checks passed.`);
