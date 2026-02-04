import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.resolve(__dirname, '../templates');

const KNOWN_CONFIG_FILES = [
  'package.json',
  'tsconfig.json',
  'jsconfig.json',
  'pnpm-workspace.yaml',
  'lerna.json',
  'turbo.json',
  'nx.json',
  'bunfig.toml',
  'vercel.json',
  'netlify.toml',
  'procfile',
  'dockerfile',
  'docker-compose.yml',
];

const CONFIG_PATTERNS = [
  /^\..+rc(\..+)?$/, // .eslintrc, .prettierrc.json
  /\.config\.(js|ts|mjs|cjs|json)$/, // vite.config.ts, tailwind.config.js
  /^\.editorconfig$/,
  /^\.gitignore$/,
  /^\.npmrc$/,
  /^\.env(\..+)?$/,
];

const DEFAULT_IGNORES = [
  'node_modules',
  'dist',
  '.DS_Store',
  'Thumbs.db',
  '.git',
  '.idea',
  '.vscode',
  'coverage',
  '.next',
  '.nuxt',
  '.output',
  'build',
  'temp',
  'tmp',
];

function isConfigFile(filename) {
  if (KNOWN_CONFIG_FILES.includes(filename.toLowerCase())) return true;
  if (CONFIG_PATTERNS.some((pattern) => pattern.test(filename))) return true;
  return false;
}

function getTemplateDirs(dir) {
  const results = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Check if it's a leaf template directory (contains package.json or is known leaf)
      // or if we should recurse.
      // Current structure suggests:
      // templates/docs -> template
      // templates/library/react-component -> template
      // templates/library/ts -> template
      // ...

      // Heuristic: if directory has package.json or SKILL.md or is a known template root, add it.
      // But some intermediate folders might be categories.

      const hasPackageJson = fs.existsSync(path.join(fullPath, 'package.json'));
      const hasSkillMd = fs.existsSync(path.join(fullPath, 'SKILL.md'));

      if (hasPackageJson || hasSkillMd) {
        results.push(fullPath);
      } else {
        // Recurse
        const subResults = getTemplateDirs(fullPath);
        if (subResults.length > 0) {
          results.push(...subResults);
        }
      }
    }
  }
  return results;
}

function generateMetadata() {
  const templatePaths = getTemplateDirs(templatesDir);

  for (const templatePath of templatePaths) {
    const files = fs.readdirSync(templatePath);
    const configs = files.filter((file) => isConfigFile(file));

    // Sort configs for consistency
    configs.sort();

    const metadataPath = path.join(templatePath, 'metadata.json');
    let existingMetadata = {};
    if (fs.existsSync(metadataPath)) {
      try {
        existingMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      } catch (e) {
        console.warn(`Failed to parse existing metadata for ${templatePath}`);
      }
    }

    const metadata = {
      configs,
      ignores: existingMetadata.ignores || DEFAULT_IGNORES,
    };

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n');
    console.log(
      `Generated metadata.json for ${path.relative(templatesDir, templatePath)}`,
    );
  }
}

generateMetadata();
