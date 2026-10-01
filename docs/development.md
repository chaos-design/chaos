# Development

- [Requirements](#requirements)
- [Repository layout](#repository-layout)
- [Common tasks](#common-tasks)
- [Adding a template](#adding-a-template)
- [Adding a CLI flag](#adding-a-cli-flag)
- [The Web Composer](#the-web-composer)
- [Verification scripts](#verification-scripts)
- [Code style](#code-style)
- [CI](#ci)

## Requirements

| Tool | Version |
| --- | --- |
| Node.js | >= 24.0.0 |
| pnpm | >= 8 (the repo pins a version via `packageManager`) |

`pnpm install` runs `only-allow pnpm`, so npm and yarn are rejected on purpose —
the workspace relies on pnpm semantics.

## Repository layout

```
chaos/
├── assets/
│   ├── chaos-banner.svg          # banner source of truth
│   └── chaos-banner.png          # generated, committed for README
├── docs/                         # extended documentation
├── packages/
│   └── create-chaos/
│       ├── build.config.ts       # unbuild config
│       ├── index.js              # bin entry -> dist/index.mjs
│       ├── src/
│       │   ├── index.ts          # argument parsing, prompt flow
│       │   ├── config.ts         # single source of truth for templates
│       │   ├── utils.ts          # fs + naming helpers
│       │   ├── commands/
│       │   │   ├── template.ts   # built-in templates
│       │   │   ├── custom.ts     # local custom templates
│       │   │   ├── skill.ts      # agent skill packages
│       │   │   └── web.ts        # web composer server
│       │   ├── core/             # Command base class + context type
│       │   └── web/web-app.ts    # composer UI (HTML/CSS/JS as a string)
│       ├── templates/            # everything copied into user projects
│       └── utils/                # banners and small helpers
└── scripts/
    ├── render-banner.mjs         # SVG -> PNG
    ├── verify-pack.mjs           # tarball invariants
    ├── verify-alias.mjs          # smoke test: alias scaffolding
    └── verify-short-commands.mjs # smoke test: every alias
```

`pnpm-workspace.yaml` contains only `packages/*`. **Templates are deliberately
not workspace members** — see [publishing.md](./publishing.md#why-templates-are-not-workspace-members).

## Common tasks

| Command | Description |
| --- | --- |
| `pnpm install` | install dependencies |
| `pnpm run build` | build the CLI into `packages/create-chaos/dist` |
| `pnpm run dev` | unbuild in stub mode, for fast iteration |
| `pnpm run typecheck` | `tsc --noEmit` on the CLI sources |
| `pnpm run lint` | Biome check |
| `pnpm run lint:fix` | Biome check with autofix |
| `pnpm run format` | Biome format |
| `pnpm test` | typecheck + lint + verify:pack + verify:custom |
| `pnpm run verify:pack` | tarball invariants only |
| `pnpm run verify:custom` | `--custom` behaviour: config errors, renames, `replace` |
| `pnpm run verify:alias` | scaffold a project via a short alias |
| `pnpm run verify:short` | scaffold every alias and assert key files |
| `pnpm run banner` | re-render the README banner PNG |

A pre-commit hook runs `lint-staged`, so `biome check --write` runs on staged
files.

## Adding a template

1. Create the directory under `packages/create-chaos/templates/<category>/<name>`.
2. Add a preset to `FRAMEWORKS` in `packages/create-chaos/src/config.ts`:

   ```ts
   {
     showName: 'my-tpl',            // short alias
     name: 'my-template',           // canonical name
     path: 'my-category/my-template',
     display: 'My Template',
     description: 'One line shown in the picker.',
     color: cyan,
     // ignore: ['dist'],          // extra build output to skip
   }
   ```

3. Name dotfiles with an underscore prefix (`_gitignore`, `_npmrc`,
   `_biome.json`). They are renamed on the way out, and the underscore also
   survives npm packaging.
4. Set the template `package.json` `version` to `0.0.1` and mark it
   `"private": true` — templates must never be published.
5. If the template needs to keep build output out of the tarball, list it under
   the `files` exclusions in `packages/create-chaos/package.json` and
   `.gitignore`.
6. Verify:

   ```bash
   pnpm run build
   pnpm run verify:pack
   node packages/create-chaos/index.js my-test -t my-tpl
   ```

Adding the template to `FRAMEWORKS` automatically makes it available in the
CLI, in `--help`, in the web composer, and to `verify-short-commands.mjs`.

### Adding a translated label

The web composer renders bilingual copy. Add the entries to
`WEB_TEMPLATE_COPY_ZH` and `WEB_CATEGORY_LABELS_ZH` in
`packages/create-chaos/src/commands/web.ts`.

## Adding a CLI flag

1. Declare it in the `minimist` options in `src/index.ts` — both the generic
   type parameter and the `alias` / `boolean` / `string` maps.
2. Handle it in `init()`.
3. Add a line to `helpMessage` in `src/config.ts`.

## The Web Composer

The composer is a single self-contained HTML document returned by
`getWebAppHtml()` in `src/web/web-app.ts`. There is no bundler and no frontend
framework: the string is served as-is, which keeps the published tarball free of
web assets.

The server (`src/commands/web.ts`) enforces:

- `127.0.0.1` binding only;
- a per-session token, injected into the page and required by `/api/generate`;
- a 32 kB request body cap;
- output paths confined to child directories of the launch directory, validated
  after resolving symlinks.

Keep those invariants when extending it — they are what makes it safe to run.

## Verification scripts

Two scripts guard behaviour that is easy to break and hard to notice.

`scripts/verify-pack.mjs` asserts:

1. `dist/index.mjs` exists on disk and is not a stub build.
2. No `node_modules` anywhere under `templates/`.
3. No filename npm strips at pack time (`.gitignore`, `.npmrc`, `.git`,
   `.DS_Store`) exists under `templates/`.
4. Every path declared in `config.ts` exists on disk.
5. Against the real `npm pack --dry-run` list: the tarball contains
   `dist/index.mjs`, `index.js` and `package.json`; every `bin` target is
   present; no `node_modules` and no generated scratch file is included; and
   nothing on disk was silently dropped.

Points 1 and 5 are deliberately different checks. A missing `dist/` on disk is a
"forgot to build" mistake, while a missing `dist/` in the tarball is a `files`
mistake — the second produces a package that installs cleanly and then fails on
first run, which is much harder to notice.

`cache-changed-pkg-path.sh` is worth calling out: the monorepo template's own
pre-commit hook writes it into `templates/`, and because it is gitignored it never
appears in a diff — but npm packs whatever is on disk. It carried local
filesystem paths into the published package until it was excluded.

Run `verify-pack` before every release.

`scripts/verify-custom.mjs` covers the `--custom` path, which is unreachable by
hand because it sits behind interactive prompts. It asserts that a missing config,
a bad `path`, an entry without a `path`, and a throwing `replace` hook each fail
loudly with a non-zero exit code, and that `renameFiles`, `ignore` and `replace`
are all honoured. These paths used to swallow their errors and exit 0.

## Code style

Biome, configured in `biome.json`:

- 2-space indent, 80-column lines, single quotes, semicolons, trailing commas;
- templates under `react/next-supabase` intentionally use double quotes and no
  semicolons (they mirror an upstream Supabase example), with an 88-column width.

Do not reformat templates to match the root style.

## CI

`.github/workflows/npm-publish.yml` runs on every PR and on pushes to `main`:

`pnpm install --frozen-lockfile` → `lint` → `typecheck` → `build` →
`verify-pack` → publish.

Publishing is skipped when the version already exists on the registry, and a
`concurrency` group prevents two releases racing.

`.github/workflows/release.yml` only creates the GitHub release and changelog from
tags, so there is a single publisher.