#!/usr/bin/env node
/**
 * Renders assets/chaos-banner.svg to assets/chaos-banner.png.
 *
 * The SVG is the source of truth; the PNG exists because GitHub does not scale
 * SVG images in README badges/headers consistently across clients.
 *
 * Usage:
 *   node scripts/render-banner.mjs
 *
 * `sharp` is resolved from the pnpm store (it is a transitive dependency of the
 * docs template) so this script needs no extra install step.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const WIDTH = 1280;
const HEIGHT = 400;

/**
 * Locate sharp without adding it as a root dependency. Prefers an explicit
 * root install, then walks the pnpm virtual store for any version present.
 */
function loadSharp() {
  try {
    return require('sharp');
  } catch {
    /* fall through to the pnpm store lookup */
  }

  const store = path.join(root, 'node_modules', '.pnpm');
  if (!fs.existsSync(store)) {
    throw new Error('sharp not found. Run `pnpm install` first.');
  }

  const candidates = fs
    .readdirSync(store)
    .filter((entry) => entry.startsWith('sharp@'))
    .sort();

  for (const entry of candidates) {
    const entryPath = path.join(store, entry, 'node_modules', 'sharp');
    if (fs.existsSync(entryPath)) {
      return require(entryPath);
    }
  }

  throw new Error('sharp not found in the pnpm store. Run `pnpm install`.');
}

const sharp = loadSharp();
const svgPath = path.join(root, 'assets', 'chaos-banner.svg');
const pngPath = path.join(root, 'assets', 'chaos-banner.png');

if (!fs.existsSync(svgPath)) {
  throw new Error(`Missing source SVG: ${svgPath}`);
}

const info = await sharp(fs.readFileSync(svgPath), { density: 144 })
  .resize(WIDTH, HEIGHT)
  .png({ compressionLevel: 9 })
  .toFile(pngPath);

console.log(
  `Rendered ${path.relative(root, pngPath)} (${info.width}x${info.height}, ${Math.round(info.size / 1024)} kB)`,
);
