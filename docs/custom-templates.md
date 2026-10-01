# Custom Templates

Use any local directory as a Chaos template. This is how teams share an
internal starter without publishing it to npm.

- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Option reference](#option-reference)
- [`replace` semantics](#replace-semantics)
- [How files are copied](#how-files-are-copied)
- [Gotchas](#gotchas)
- [Publishing a template as a package](#publishing-a-template-as-a-package)

## Quick start

With no configuration, Chaos simply asks for a path:

```bash
npm create chaos@latest my-app --custom
# ? Template path: ./my-template
```

To skip the prompt, configure the template first.

## Configuration

Chaos reads configuration from the current working directory and merges
whatever it finds:

1. `chaos.config.js`, `chaos.config.mjs`, `chaos.config.cjs`, `chaos.config.ts`,
   `chaos.config.mts`, `chaos.config.cts`
2. the `chaos` field of the nearest `package.json`

Configuration is loaded with [c12](https://github.com/unjs/c12), so a `.ts`
config works without a build step.

### In `package.json`

```json
{
  "chaos": {
    "template": [
      {
        "name": "gallery",
        "path": "./templates/gallery"
      }
    ]
  }
}
```

### In `chaos.config.ts`

```ts
export default {
  template: [
    {
      name: 'internal starter',
      path: './templates/starter',
      ignore: ['node_modules', '.git', 'coverage'],
      renameFiles: {
        '_gitignore': '.gitignore',
        'README.md': 'README.zh.md',
      },
      replace: (file, content) => {
        if (file === 'package.json') {
          return content.replace('"name": "starter"', '"name": "@acme/app"');
        }
        return content;
      },
    },
  ],
};
```

Then:

```bash
npm create chaos@latest my-app --custom
# ? Select a framework:  internal starter
```

Pass the configured name to skip the picker. Both forms work:

```bash
npm create chaos@latest my-app --custom gallery
npm create chaos@latest my-app -t gallery --custom
```

A name that does not match any configured entry falls back to the picker with a
message rather than failing, so a script can still be resumed by hand.

## Option reference

| Option | Type | Required | Default | Meaning |
| --- | --- | --- | --- | --- |
| `name` | `string` | yes | — | label shown in the picker |
| `path` | `string` | yes* | — | directory to copy, relative to the working directory |
| `ignore` | `string[]` | no | `[]` | extra top-level names to skip |
| `renameFiles` | `Record<string, string>` | no | `{}` | filename renames applied during the copy |
| `replace` | `(file, content, packageName) => string` | no | — | transform file contents |

\* `path` may be omitted if you always supply the path interactively. A
configured template without a `path` throws, because there would be nothing to
copy.

`node_modules`, `.git` and `.DS_Store` are **always** ignored, regardless of
configuration.

## `replace` semantics

This is the part that surprises people. For each file:

- return a **non-empty string** → the file is written with that content;
- return `''` (empty string) → the **original file is copied unchanged**.

So `replace` is a filter-and-transform hook, not an unconditional transform:

```ts
replace: (file, content) => {
  // Drop the CI workflow from the generated project.
  if (file === 'deploy.yml') return '';

  // Append a line to .gitignore.
  if (file === '_gitignore') return `${content}\n.turbo`;

  return '';
}
```

> **`file` is the basename, not the path.** For `src/components/Button.tsx` you
> receive `Button.tsx`, not `src/components/Button.tsx`. If you need the full
> relative path, match on content instead.

Returning `undefined`/`null` also falls through to copying the original, but
returning `''` is explicit and clearer.

`packageName` is passed as a third argument if you need the name Chaos derived
from the directory:

```ts
replace: (file, content, packageName) =>
  file === 'package.json'
    ? content.replace('"name": "starter"', `"name": "${packageName}"`)
    : '',
```

### Failure handling

`replace` runs inside a per-file try/catch. If your hook throws, Chaos collects
the failure, reports **every** offending path at the end, and exits non-zero
instead of leaving a silently half-generated project behind.

## How files are copied

1. Read the template directory.
2. Skip `node_modules`, `.git`, `.DS_Store` and anything in `ignore`.
3. For a directory, recurse and create the matching subdirectory.
4. For a file, apply `replace`; write the result or copy the original.
5. Apply `renameFiles` to the destination name.

Note that `ignore` entries are matched against **each level's** basename during
the recursive walk, so `ignore: ['dist']` also skips `packages/a/dist`. It is not
a path-prefix match.

## Gotchas

**`path` is relative to where you run the command**, not to the config file. Run
Chaos from your repository root and use paths relative to that.

**Dotfiles cannot be shipped by npm.** If your template lives inside an npm
package, name dotfiles with an underscore prefix (`_gitignore`, `_npmrc`) and map
them through `renameFiles`. npm strips literal `.gitignore` and `.npmrc` from
tarballs at any depth.

**`renameFiles` replaces the map, it does not merge.** List every rename you
need.

**Symlinks are followed as plain files** by `fs.copyFileSync`, which can fail on
dangling links. Remove them or point `path` at real files.

## Publishing a template as a package

A template can also be an npm package with a `customCommand`. This is how
ecosystem tools expose "create" entry points. Declare the command in
`src/config.ts`:

```ts
{
  name: 'my-template',
  path: '',
  display: 'My Template',
  description: 'A third-party starter.',
  customCommand: 'npm create my-template@latest TARGET_DIR',
}
```

Chaos rewrites the package manager prefix to match the one you are using
(`pnpm create`, `yarn create`, `bun x create-`) and then executes the command for
you, replacing `TARGET_DIR` with your directory.