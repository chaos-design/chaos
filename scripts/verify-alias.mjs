import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const cliPath = path.join(cwd, 'packages/create-chaos/dist/index.mjs');

console.log('Starting alias verification...');

const projectName = 'test-alias-react';
const projectPath = path.join(cwd, projectName);

try {
  // Clean up if exists
  if (fs.existsSync(projectPath)) {
    fs.rmSync(projectPath, { recursive: true, force: true });
  }

  console.log(`Testing alias -t react...`);

  // Run create-chaos command with -t alias
  execSync(`node ${cliPath} ${projectName} -t react`, { stdio: 'inherit' });

  // Verify project directory exists
  if (!fs.existsSync(projectPath)) {
    throw new Error(`Project directory not created: ${projectPath}`);
  }

  // Verify package.json exists (basic check that template was copied)
  const pkgPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    throw new Error(`package.json not found in: ${projectPath}`);
  }

  console.log(`✅ Alias -t verified successfully.`);
} catch (error) {
  console.error(`❌ Failed to verify alias:`, error);
  process.exit(1);
} finally {
  // Cleanup
  if (fs.existsSync(projectPath)) {
    console.log(`  Cleaning up ${projectName}...`);
    fs.rmSync(projectPath, { recursive: true, force: true });
  }
}
