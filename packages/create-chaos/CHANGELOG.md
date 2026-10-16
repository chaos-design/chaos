# create-chaos

## Unreleased

### CI

- Split the npm publish step out of the general pipeline. `.github/workflows/ci.yml`
  now holds the "other flows" (lint, typecheck, build, tarball verification) on
  every pull request and push to `main`/`master`, and never publishes.
  `.github/workflows/npm-publish.yml` is now the single dedicated publisher and
  runs only on push to the `release` branch, so publishing is an explicit,
  opt-in act.

## 0.1.1

### Fixes

- `--custom <name>` now actually resolves a configured custom template. The mode
  flag was being overridden by `--template`, and a bare name after the directory
  was never parsed, so `create-chaos app --custom gallery` fell through to the
  built-in template picker. Both `--custom gallery` and `-t gallery --custom`
  work now.
- A missing `chaos.config.*` no longer crashes. `config.template.map(...)` threw a
  `TypeError` that the outer `catch` swallowed, leaving an empty output directory
  and exit code 0. Chaos now reports the problem and exits non-zero.
- A failed custom run no longer leaves an empty output directory behind, because
  the target directory is created only after the template resolves.
- `--custom` and `--skill` are no longer intercepted by the built-in template
  picker; those modes run their own selection flow.
- Custom template failures are aggregated: if `replace` or a copy throws, every
  offending path is reported and the exit code is non-zero, instead of printing
  one error per file and continuing into a half-generated project.
- `process.exit()` was removed from the custom command. It could truncate output
  before stdout flushed. The exit code is now set via `process.exitCode`.
- `renameFiles` and `replace` now report the basename rather than an undefined
  key, and a template entry without a `path` fails with a clear message instead
  of dereferencing `undefined`.
- `loadChaosConfig` now always returns a `template` array. c12 resolves to `{}`
  when no config file exists, which previously made the declared return type a
  lie.
- The `replace` type signature now includes its third `packageName` argument,
  which the runtime has always passed.
- Templates ship dotfiles correctly. `templates/docs/.gitignore` and
  `templates/vscode/extension/webview-ui/.gitignore` were named literally, and npm
  strips `.gitignore` from tarballs at any depth — both files were silently missing
  from the published package. They are now `_gitignore`, and `copyDir` applies the
  rename map at every depth instead of only at the template root.
- `_vscode-test.mjs` and `_vscodeignore` were copied with their literal
  underscores, but `vsce` and `@vscode/test-cli` require `.vscode-test.mjs` and
  `.vscodeignore`.
- Templates are no longer pnpm workspace members (`pnpm-workspace.yaml` is
  `packages/*`, not `packages/**`). This stops `pnpm install` from installing all 12
  templates' dependencies, keeps `node_modules` out of the npm tarball, and prevents
  `pnpm publish -r` from ever attempting to publish a template.
- All template `package.json` files are pinned to `0.0.1` and marked
  `"private": true`, so a template can never be published by accident.
- Removed the unused `user` dependency.
- `engines.node` corrected from a guessed `>=16.0.0` to `>=24.0.0`, the current
  LTS. Node 20 reached end of life in April 2026, and Node 22 is already in
  maintenance, so requiring 24 keeps the CLI on a supported runtime.
- Added `LICENSE` to the package. npm includes it automatically, but its absence
  left the package page without a license.
- `.gitignore` now covers template build output (`.wxt/`, `dist/`, `.output/`,
  `coverage/`, `*.tsbuildinfo`), so generated files cannot be committed or shipped.

### Packaging

- Added `scripts/verify-pack.mjs`, which asserts the tarball is publishable: `dist`
  is present and not a stub, the tarball actually contains `dist/index.mjs`,
  `index.js` and every `bin` target, no `node_modules`, npm-stripped filenames or
  generated scratch files are included, every path declared in `config.ts` exists,
  and the real `npm pack --dry-run` list drops nothing from disk. Wired into
  `pnpm test` and CI.
- `cache-changed-pkg-path.sh` no longer ships. The monorepo template's own
  pre-commit hook writes it into `templates/`; it is gitignored, so it was
  invisible in diffs, but npm packed it and shipped a 30 kB file containing local
  filesystem paths to every user.
- Added `scripts/verify-custom.mjs`, which covers the `--custom` paths that the
  interactive prompts make hard to reach by hand.
- `files` excludes template build output; `lib` is deliberately **not** excluded
  because several templates use `lib/` as a source directory.

### CI

- `npm-publish.yml` pins Node 22 and pnpm 4 actions, installs with
  `--frozen-lockfile`, runs the pack verification, and publishes only
  `create-chaos` when that exact version is not already on npm.
- `release.yml` now only creates the GitHub release and changelog. npm publishing
  happens in exactly one workflow, so the two cannot race.

### Docs

- Added a README banner (`assets/chaos-banner.svg` + generated PNG, re-render with
  `pnpm run banner`).
- Added `docs/`: usage, templates, custom templates, development, publishing.
- Documented that `replace` receives a basename, not a path.

## 0.1.0

- Initial public release of the Chaos scaffolder.