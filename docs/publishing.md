# Publishing

How `create-chaos` is versioned, built and released.

- [Versioning policy](#versioning-policy)
- [The release flow](#the-release-flow)
- [Release checklist](#release-checklist)
- [What ships in the tarball](#what-ships-in-the-tarball)
- [Why templates are not workspace members](#why-templates-are-not-workspace-members)
- [Troubleshooting a publish](#troubleshooting-a-publish)

## Versioning policy

| Package | Version | Published |
| --- | --- | --- |
| `@chaos-design/chaos` (root) | `0.0.1` | no — `"private": true` |
| `create-chaos` | `0.1.1` | yes — the only published package |
| every `templates/**/package.json` | `0.0.1` | never — `"private": true` |

Only `create-chaos` reaches npm. It follows semver, so:

- **patch** (`0.1.1 → 0.1.2`) — bug fixes and template fixes;
- **minor** (`0.1.1 → 0.2.0`) — new templates, new flags, new composer features;
- **major** — reserved for breaking CLI changes.

Template `package.json` versions stay pinned at `0.0.1`. They exist so the files
are valid manifests, not so they can be released. The version a user gets is
determined by the `create-chaos` version they installed.

## The release flow

`main` is the release branch. On every push to `main`,
`.github/workflows/npm-publish.yml`:

1. installs with `--frozen-lockfile`;
2. runs `lint`, `typecheck`, `build`;
3. runs `scripts/verify-pack.mjs`;
4. checks whether `create-chaos@<version>` already exists on npm;
5. publishes only if it does not.

`prepublishOnly` rebuilds `dist`, so a tarball can never contain a stale build
even if the CI build step were skipped.

Tagging `v*` triggers `release.yml`, which creates the GitHub release and
changelog from commit messages. It deliberately does **not** publish to npm —
one publisher, no race.

### Manual publish

```bash
pnpm install
pnpm run build
pnpm run verify:pack

# from the package directory
cd packages/create-chaos
npm publish --access public
```

Or use the helper script, which is what CI does:

```bash
pnpm run publish-pkg
```

## Release checklist

1. `pnpm test` — typecheck, lint and tarball invariants.
2. `pnpm run build` — regenerate `dist`.
3. `pnpm run verify:short` — scaffold every template alias and assert key files.
4. Bump the version:

   ```bash
   pnpm run release            # prompts for the version, runs bumpp
   ```

5. Update `CHANGELOG.md` if the release is notable.
6. Commit and push to `main`; CI publishes.
7. Tag and push:

   ```bash
   git tag v0.1.2 && git push --tags
   ```

Never publish a version twice — npm rejects it, and CI skips it silently by
design.

## What ships in the tarball

`files` in `packages/create-chaos/package.json`:

```jsonc
"files": [
  "index.js",
  "dist",
  "templates",
  "!templates/**/node_modules",
  "!templates/**/.wxt",
  "!templates/**/dist",
  "!templates/**/.output",
  "!templates/**/.next",
  "!templates/**/coverage",
  "!templates/**/*.tsbuildinfo",
  "!templates/**/next-env.d.ts",
  "!templates/**/cache-changed-pkg-path.sh"
]
```

Note what is **not** excluded: `lib`. Several templates use `lib/` as a source
directory (`react/next-shadcn/lib`, `browser/extension-wxt/lib`,
`react/next-supabase/src/lib`, `docs/app/lib`). Excluding it would silently delete
real source files. Only `.gitignore` excludes `lib` for the two templates where it
is build output.

The last entry matters more than it looks. The monorepo template's own pre-commit
hook (`getchanged`) writes `cache-changed-pkg-path.sh` into `templates/`. It is
gitignored, so it never appears in a diff or a review, but npm packs whatever is
on disk — it shipped a 30 kB file containing the maintainer's local paths to every
user until it was excluded. `verify-pack.mjs` now fails if any generated scratch
file reaches the tarball.

Two npm behaviours drive these rules:

1. **npm does not strip nested `node_modules` when a parent directory is listed
   in `files`.** The exclusions above are the only thing keeping installed
   dependencies out of the tarball.
2. **npm always strips `.gitignore`, `.npmrc`, `.git` and `.DS_Store` at any
   depth.** Templates therefore ship dotfiles as `_gitignore` / `_npmrc` and the
   CLI renames them on the way out. `verify-pack.mjs` fails if a template ever
   reintroduces a literal `.gitignore`.

## Why templates are not workspace members

`pnpm-workspace.yaml` lists only `packages/*`. Earlier it was `packages/**`, which
pulled every template into the workspace. That caused four separate problems:

1. **Dependencies were installed for all 12 templates** on every `pnpm install`,
   adding minutes to every setup and CI run.
2. **`node_modules` directories appeared inside `templates/`**, and npm shipped
   them into the tarball — 62 stray `.bin` symlinks at one point.
3. **`pnpm publish -r` would attempt to publish templates.** `release.yml` used
   that command, so a tag could have pushed `demo@0.0.1` and
   `webview-ui@1.0.0` to npm.
4. **Template dependency versions drifted silently**, because workspace hoisting
   made it ambiguous which versions were actually tested.

Templates are payload, not packages. Keeping them out of the workspace makes all
four failures structurally impossible rather than merely unlikely.

## Troubleshooting a publish

**`403` during publish** — the token in `NPM_TOKEN` lacks publish scope for the
package, or two-factor authentication is required. For 2FA, use an automation
token (CI publishes) or `--otp` locally.

**`You cannot publish over the previously published versions`** — the version
already exists. Bump it; you cannot unpublish a version once 24 hours have
passed.

**The tarball is missing files** — run `pnpm run verify:pack`. It diffs the
filesystem against `npm pack --dry-run` and names the missing files.

**A published version is broken** — publish a patch. Do not unpublish; that
breaks anyone who already installed it.