# Usage Guide

Complete reference for every mode of `create-chaos`.

- [How a project is created](#how-a-project-is-created)
- [Interactive mode](#interactive-mode)
- [Non-interactive mode](#non-interactive-mode)
- [Package manager detection](#package-manager-detection)
- [Web Composer](#web-composer)
- [Custom templates](#custom-templates)
- [Skills](#skills)
- [Template file conventions](#template-file-conventions)
- [Troubleshooting](#troubleshooting)

## How a project is created

1. The CLI resolves a **template preset** from `packages/create-chaos/src/config.ts`.
   Each preset carries a name, a short alias, a category and a path inside
   `templates/`.
2. The template directory is copied into the target directory.
3. Files matching the underscore convention are renamed (`_gitignore` →
   `.gitignore`).
4. Nested files go through the same rename pass, so a template can contain
   several independent packages.
5. The template's `package.json` `name` is replaced with your project name.
6. The next commands (`cd`, install, dev) are printed for your package manager.

## Interactive mode

```bash
npm create chaos@latest
```

Prompts, in order:

| Prompt | Shown when | Notes |
| --- | --- | --- |
| `Project name` | no directory argument | defaults to `chaos-project` |
| `Target directory ... is not empty` | target exists and is not empty | answers `no` to cancel |
| `Package name` | directory name is not a valid npm name | validated |
| `Select a template` | no valid `--template` was passed | grouped by category |

Cancelling with `Ctrl+C` exits cleanly with a message and a non-zero-free status.

## Non-interactive mode

Provide **both** a directory and a template to skip all prompts:

```bash
npm create chaos@latest my-app --template react
```

npm 6 takes flags directly. npm 7+, yarn and pnpm need an extra `--` for npm:

```bash
npm create chaos@latest my-app -- --template react
```

Scaffold into the current directory with `.`:

```bash
npm create chaos@latest . -t lib
```

When the directory is `.`, the package name defaults to the current directory's
basename.

### Template names vs aliases

Both forms are accepted by `--template` / `-t`:

```bash
npm create chaos@latest my-app -t react        # alias
npm create chaos@latest my-app -t react-ts     # canonical name
```

An unknown template name is not a hard error: Chaos prints
`"..." isn't a valid template. Choose one below:` and falls back to the
interactive picker, so scripts can still be resumed by hand.

## Package manager detection

Chaos reads `npm_config_user_agent` to decide which commands to print and
whether the project uses yarn 1:

| Detected | Printed install | Notes |
| --- | --- | --- |
| `npm` | `npm install` | |
| `pnpm` | `pnpm install` | |
| `yarn` 1.x | `yarn` | `--no-git-checks` style flags dropped for yarn 1 |
| `yarn` ≥ 2 | `yarn install` | |
| `bun` | `bun install` | |
| unknown | `pnpm install` | fallback |

The first of `dev`, `start`, `compile` found in the generated `package.json`
scripts is printed as the run command. Templates without any of those (for
example `react-component-ts`) print nothing extra.

## Web Composer

```bash
npm create chaos@latest web [DIRECTORY] [--port NUMBER] [--no-open]
```

| Flag | Effect |
| --- | --- |
| `--port NUMBER` | listen on a fixed port; `0` (or omitted) picks a free one |
| `--no-open` | do not launch the default browser |

The composer lets you:

- search and filter templates by category;
- switch the UI language between English and Chinese;
- choose the output directory and package name;
- read the CLI command that reproduces the current selection;
- generate the project.

### Safety model

The composer is a local tool and treats the filesystem as hostile input:

- binds to `127.0.0.1` only;
- requires a session token generated per run, so another process on the machine
  cannot drive it;
- refuses output paths that are `.`, absolute, contain `..`, or contain
  characters outside `[a-zA-Z0-9._\-/]`;
- refuses to write outside the directory the command was started in, after
  resolving symlinks on every existing ancestor;
- asks for confirmation before overwriting existing files;
- caps request bodies at 32 kB.

## Custom templates

```bash
npm create chaos@latest my-app --custom
```

Chaos looks for configuration in this order and merges the results:

1. `chaos.config.js`, `.mjs`, `.cjs`, `.ts`, `.mts`, `.cts` in the working
   directory;
2. the `chaos` field of the nearest `package.json`.

```ts
// chaos.config.ts
export default {
  template: [
    {
      name: 'gallery',
      path: './templates/gallery',
      ignore: ['node_modules', '.git'],
      renameFiles: { 'README.md': 'README.zh.md' },
      replace: (file, content) => content,
    },
  ],
};
```

| Option | Type | Meaning |
| --- | --- | --- |
| `name` | `string` | label shown in the picker |
| `path` | `string` | directory to copy; relative to the working directory |
| `ignore` | `string[]` | extra top-level names to skip |
| `renameFiles` | `Record<string, string>` | filename renames applied during the copy |
| `replace` | `(file, content) => string` | transform file contents; return `''` to keep the original file |

With no configuration at all, Chaos simply prompts for a template path.

See [custom-templates.md](./custom-templates.md) for a full walkthrough.

## Skills

Skill templates were removed from this CLI. Agent skills now live in their own
repository — browse and install them at
**[chaos-design/skills](https://github.com/chaos-design/skills)**.

## Template file conventions

Templates are shipped inside the npm tarball, so they must avoid filenames npm
strips at **any** depth:

| Never use | Use instead | Why |
| --- | --- | --- |
| `.gitignore` | `_gitignore` | npm strips it from the tarball |
| `.npmrc` | `_npmrc` | npm strips it from the tarball |
| `.DS_Store` | — | macOS noise, stripped anyway |
| `.git/` | — | never commit |

`npm run verify:pack` fails the build if any of these appear, so a template can
never silently lose a file.

The same underscores are also used for other files that need renaming:

| Template file | Generated as |
| --- | --- |
| `_gitignore` | `.gitignore` |
| `_npmrc` | `.npmrc` |
| `_biome.json` | `biome.json` |
| `_editorconfig` | `.editorconfig` |
| `_gitattributes` | `.gitattributes` |
| `_env.example` | `.env.example` |
| `_github/` | `.github/` |
| `_vscode/` | `.vscode/` |

## Troubleshooting

**`create-chaos: command not found`**
Node.js below 24.0.0. Run `node -v` and upgrade, or use `npm create chaos@latest`
which fetches a matching runtime.

**The target directory is not empty**
Chaos asks before deleting. Answer `no` to abort, or pass a different directory.

**`"my-template" isn't a valid template`**
The name is not in the template list. Run `create-chaos --help` to print every
available template and alias.

**A generated project has no `.gitignore`**
It would mean a template used a literal `.gitignore` filename. Run
`pnpm run verify:pack` in the repo; it detects this. Templates must use
`_gitignore`.

**The web composer does not open a browser**
Some terminals cannot launch a browser. Open the printed URL manually, or pass
`--no-open` and navigate yourself.

**`wxt` template fails to install**
It requires Node.js >= 22.0.0 on its own, but the CLI already requires 24.0.0,
so this should not be reachable. If it happens, check `node -v`.