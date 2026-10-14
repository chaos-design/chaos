#!/usr/bin/env node
/**
 * Regenerates site/src/data/templates.ts from the CLI's single source of truth:
 * the FRAMEWORKS array in packages/create-chaos/src/config.ts.
 *
 * The array is read as a literal (bracket matching, no TS toolchain) and
 * evaluated with stubbed color functions, so the generated file can never
 * drift from the templates the CLI actually ships.
 *
 * It also guards the hand-maintained inspector copy in
 * src/data/template-details.ts: every template must have an entry there, and no
 * entry may outlive its template.
 *
 * Usage:
 *   node site/scripts/sync-templates.mjs           # regenerate the data file
 *   node site/scripts/sync-templates.mjs --check   # fail if it is stale
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const configPath = path.join(
  repoRoot,
  "packages",
  "create-chaos",
  "src",
  "config.ts",
);
const outFile = path.resolve(here, "..", "src", "data", "templates.ts");
const detailsFile = path.resolve(here, "..", "src", "data", "template-details.ts");

// Color helpers referenced by the literal are runtime values from kolorist;
// the site only needs the data around them.
const COLOR_STUBS = [
  "blue",
  "cyan",
  "green",
  "lightCyan",
  "lightGreen",
  "lightRed",
  "lightMagenta",
  "magenta",
  "red",
  "yellow",
];

function extractFrameworks(source) {
  const start = source.indexOf("export const FRAMEWORKS");

  if (start === -1) {
    throw new Error("FRAMEWORKS declaration not found in config.ts");
  }

  // Skip the `Framework[]` type annotation: the literal starts after the `=`.
  const open = source.indexOf("[", source.indexOf("=", start));
  let depth = 0;
  let quote = null;

  for (let i = open; i < source.length; i += 1) {
    const char = source[i];

    if (quote) {
      if (char === "\\") {
        i += 1;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "[") {
      depth += 1;
    } else if (char === "]") {
      depth -= 1;

      if (depth === 0) {
        return source.slice(open, i + 1);
      }
    }
  }

  throw new Error("Unbalanced brackets while reading FRAMEWORKS");
}

function loadFrameworks(source) {
  const literal = extractFrameworks(source);
  // Each stub remembers its own kolorist name; config.ts stores the function
  // reference itself, so the map turns it back into a color name for the site.
  const stubNames = new Map();
  const stubs = COLOR_STUBS.map((name) => {
    const fn = () => name;
    stubNames.set(fn, name);
    return fn;
  });

  const frameworks = new Function(
    "TEMPLATE_IGNORE",
    ...COLOR_STUBS,
    `return ${literal};`,
  )(["node_modules", ".git", ".DS_Store"], ...stubs);

  return { frameworks, colorName: (fn) => stubNames.get(fn) ?? "default" };
}

function buildTemplates(frameworks, colorName) {
  const templates = [];

  for (const framework of frameworks) {
    for (const variant of framework.variants) {
      // `custom` has no template directory; it is a mode, not a template.
      if (!variant.path) {
        continue;
      }

      templates.push({
        id: variant.name,
        alias:
          variant.showName && variant.showName !== variant.name
            ? variant.showName
            : variant.name,
        // Directory inside packages/create-chaos/templates, shown in the
        // inspector so contributors can jump straight to the source.
        path: variant.path,
        category: framework.name,
        categoryLabel: framework.display,
        title: variant.display || variant.name,
        description: variant.description,
        // The color the CLI paints this template with (kolorist name).
        color: colorName(variant.color),
      });
    }
  }

  return templates;
}

// Entries in template-details.ts are written as `  'some-id': {` (or unquoted
// when the id is a plain identifier), so a shallow scan is enough to read them
// without pulling in a TypeScript parser.
function readDetailKeys() {
  const source = fs.readFileSync(detailsFile, "utf8");
  return new Set(
    [...source.matchAll(/^ {2}'?([\w-]+)'?:\s*\{\s*$/gm)].map(
      (match) => match[1],
    ),
  );
}

/**
 * The inspector copy is maintained by hand, so it can rot in both directions:
 * a new template renders an empty panel, and a removed template leaves dead
 * copy behind. Both fail the build rather than shipping quietly.
 */
function assertDetailsCoverage(templates) {
  const keys = readDetailKeys();
  const missing = templates.map((t) => t.id).filter((id) => !keys.has(id));
  const known = new Set(templates.map((t) => t.id));
  const orphaned = [...keys].filter((id) => !known.has(id));

  if (missing.length === 0 && orphaned.length === 0) {
    return;
  }

  const problems = [];
  if (missing.length > 0) {
    problems.push(
      `no entry for ${missing.join(", ")} (the inspector would show only the ` +
        "one-line description)",
    );
  }
  if (orphaned.length > 0) {
    problems.push(`stale entries for ${orphaned.join(", ")}`);
  }

  throw new Error(
    `src/data/template-details.ts is out of sync: ${problems.join("; ")}.`,
  );
}

// Serializes to the exact shape Biome's formatter produces (single quotes,
// 2-space indent, multiline objects), so the generated file stays lint-clean.
function serialize(value, depth) {
  const pad = "  ".repeat(depth);
  const padInner = "  ".repeat(depth + 1);

  if (Array.isArray(value)) {
    const items = value.map((item) => padInner + serialize(item, depth + 1));
    return `[\n${items.join(",\n")},\n${pad}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value).map(([key, item]) => {
      const serialized = serialize(item, depth + 1);
      const line = `${padInner}${key}: ${serialized}`;

      // Biome breaks `key: value` onto two lines once it passes 80 columns.
      return line.length > 80
        ? `${padInner}${key}:\n${padInner}  ${serialized}`
        : line;
    });
    return `{\n${entries.join(",\n")},\n${pad}}`;
  }

  if (typeof value === "string") {
    return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
  }

  return String(value);
}

function render(templates) {
  const header = [
    "// Generated by site/scripts/sync-templates.mjs from",
    "// packages/create-chaos/src/config.ts. Do not edit by hand;",
    "// run `node site/scripts/sync-templates.mjs` instead.",
    "import type { ChaosTemplate } from '@/lib/types';",
    "",
    "export const CHAOS_TEMPLATES: ChaosTemplate[] = ",
  ].join("\n");

  return `${header}${serialize(templates, 0)};\n`;
}

function main() {
  const source = fs.readFileSync(configPath, "utf8");
  const { frameworks, colorName } = loadFrameworks(source);
  const templates = buildTemplates(frameworks, colorName);
  const relative = path.relative(repoRoot, outFile);

  if (templates.length === 0) {
    throw new Error("No templates were generated; config.ts looks empty.");
  }

  assertDetailsCoverage(templates);

  const content = render(templates);

  if (process.argv.includes("--check")) {
    const current = fs.existsSync(outFile)
      ? fs.readFileSync(outFile, "utf8")
      : null;

    if (current !== content) {
      throw new Error(
        `${relative} is out of date. Run \`node site/scripts/sync-templates.mjs\`.`,
      );
    }

    console.log(`${relative} is up to date (${templates.length} templates)`);
    return;
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, content);
  console.log(`synced ${templates.length} templates -> ${relative}`);
}

main();
