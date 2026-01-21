import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const cliPath = path.join(cwd, 'packages/create-chaos/dist/index.mjs');

const shortCommands = [
  { name: 'react', expectedPath: 'src/App.tsx' },
  { name: 'reactc', expectedPath: 'index.tsx' },
  { name: 'lib', expectedPath: 'src/index.ts' },
  { name: 'libc', expectedPath: 'src/index.ts' },
  { name: 'wp', expectedPath: 'src/index.ts' }, // webpack-plugin
  { name: 'vse', expectedPath: 'src/extension.ts' }, // vscode-extension
  // 'skill' requires interactive selection, skipping automated test for now or need mock input
  // 'monorepo' doesn't have a short command in README table but is in config as 'monorepo'
];

console.log('Starting short command verification...');

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
    execSync(`node ${cliPath} ${projectName} --template ${cmd.name}`, { stdio: 'inherit' });

    // Verify project directory exists
    if (!fs.existsSync(projectPath)) {
      throw new Error(`Project directory not created: ${projectPath}`);
    }

    // Verify package.json
    const pkgPath = path.join(projectPath, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      throw new Error(`package.json not found in: ${projectPath}`);
    }

    // Verify expected file
    if (cmd.expectedPath) {
        const expectedFile = path.join(projectPath, cmd.expectedPath);
        if (!fs.existsSync(expectedFile)) {
             throw new Error(`Expected file not found: ${cmd.expectedPath}`);
        }
    }

    console.log(`✅ Short command ${cmd.name} verified successfully.`);

  } catch (error) {
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
