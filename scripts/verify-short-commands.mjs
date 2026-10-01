import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const cliPath = path.join(cwd, 'packages/create-chaos/dist/index.mjs');

const shortCommands = [
  { name: 'react', expectedPath: 'src/App.tsx', expectFiles: ['.gitignore'] },
  {
    name: 'reactc',
    expectedPath: 'index.tsx',
    hasPackageJson: false,
  },
  {
    name: 'next-shadcn',
    expectedPath: 'components.json',
    expectFiles: ['.github/workflows/deploy.yml'],
  },
  { name: 'next-supabase', expectedPath: 'supabase/platform.sql' },
  {
    name: 'wxt',
    expectedPath: 'wxt.config.ts',
    expectFiles: ['.gitignore'],
  },
  {
    name: 'lib',
    expectedPath: 'src/index.ts',
    expectFiles: ['.npmrc'],
  },
  { name: 'libc', expectedPath: 'src/index.ts' },
  { name: 'wp', expectedPath: 'src/index.ts' }, // webpack-plugin
  {
    name: 'vse',
    expectedPath: 'src/extension.ts',
    // Nested dotfiles must be renamed too, not just those at the template root.
    expectFiles: ['webview-ui/.gitignore', '.vscodeignore', '.vscode-test.mjs'],
  },
  { name: 'monorepo', expectedPath: 'pnpm-workspace.yaml' },
  {
    name: 'docs',
    expectedPath: 'source.config.ts',
    expectFiles: ['.gitignore'],
  },
  // 'skill' needs interactive selection, so it is not scaffolded here.
];

console.log('Starting short command verification...');
let hasFailures = false;

for (const cmd of shortCommands) {
  const projectName = `test-short-${cmd.name}`;
  const projectPath = path.join(cwd, projectName);

  console.log(`\nTesting short command: ${cmd.name}`);

  try {
    // Clean up if exists
    if (fs.existsSync(projectPath)) {
      fs.rmSync(projectPath, { recursive: true, force: true });
    }

    // Run create-chaos command with short template name
    // Assuming short names are mapped in config and can be passed via --template
    execFileSync(
      process.execPath,
      [cliPath, projectName, '--template', cmd.name],
      {
        stdio: 'inherit',
      },
    );

    // Verify project directory exists
    if (!fs.existsSync(projectPath)) {
      throw new Error(`Project directory not created: ${projectPath}`);
    }

    // Verify package.json
    const pkgPath = path.join(projectPath, 'package.json');
    if (cmd.hasPackageJson !== false && !fs.existsSync(pkgPath)) {
      throw new Error(`package.json not found in: ${projectPath}`);
    }

    // Verify expected file
    if (cmd.expectedPath) {
      const expectedFile = path.join(projectPath, cmd.expectedPath);
      if (!fs.existsSync(expectedFile)) {
        throw new Error(`Expected file not found: ${cmd.expectedPath}`);
      }
    }

    // Verify dotfiles were restored from their underscore-prefixed form. npm
    // strips literal `.gitignore` from tarballs, so a template that forgets the
    // `_` prefix silently ships a project without one.
    if (cmd.expectFiles) {
      for (const relative of cmd.expectFiles) {
        const file = path.join(projectPath, relative);
        if (!fs.existsSync(file)) {
          throw new Error(`Expected file not found: ${relative}`);
        }
      }
    }

    // No underscore-prefixed file should survive generation.
    const leftovers = [];
    (function walk(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.startsWith('_')) {
          leftovers.push(path.relative(projectPath, full));
        }
      }
    })(projectPath);

    if (leftovers.length > 0) {
      throw new Error(`Un-renamed template files: ${leftovers.join(', ')}`);
    }

    console.log(`✅ Short command ${cmd.name} verified successfully.`);
  } catch (error) {
    hasFailures = true;
    console.error(`❌ Failed to verify short command ${cmd.name}:`, error);
  } finally {
    // Cleanup
    if (fs.existsSync(projectPath)) {
      console.log(`  Cleaning up ${projectName}...`);
      fs.rmSync(projectPath, { recursive: true, force: true });
    }
  }
}

console.log('\nShort command verification completed.');

if (hasFailures) {
  process.exitCode = 1;
}
