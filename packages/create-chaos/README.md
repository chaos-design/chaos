<div align="center">
  <img src="https://raw.githubusercontent.com/chaos-design/chaos/main/assets/chaos-banner.png" alt="Chaos — Next Generation Frontend Tooling" width="100%" />
</div>

# create-chaos

> Scaffold a production-shaped frontend project in one command.

[![npm version](https://img.shields.io/npm/v/create-chaos.svg)](https://www.npmjs.com/package/create-chaos)
[![npm downloads](https://img.shields.io/npm/dm/create-chaos.svg)](https://www.npmjs.com/package/create-chaos)
[![license](https://img.shields.io/npm/l/create-chaos.svg)](https://github.com/chaos-design/chaos/blob/main/LICENSE)

## Install

No global install needed:

```bash
npm create chaos@latest     # npm
pnpm create chaos           # pnpm
yarn create chaos           # yarn
bun create chaos            # bun
```

Or install the binary, which provides both `create-chaos` and `chaos`:

```bash
npm install -g create-chaos
```

## Usage

```bash
# interactive
npm create chaos@latest

# non-interactive: directory + template
npm create chaos@latest my-app --template react
npm create chaos@latest my-app -t react

# into the current directory
npm create chaos@latest . -t lib

# visual composer
npm create chaos@latest web
```

With npm 6 flags are passed directly; npm 7+, yarn and pnpm need an extra `--`:

```bash
npm create chaos@latest my-app -- --template react
```

## Templates

| Alias | Template | What you get |
| --- | --- | --- |
| `react` | `react-ts` | Vite + React + TypeScript app |
| `reactc` | `react-component-ts` | Single React component with scoped Sass |
| `next-shadcn` | `react-next-shadcn` | Next.js App Router + Tailwind + shadcn/ui |
| `next-supabase` | `react-next-supabase` | Next.js + Supabase SSR auth |
| `wxt` | `browser-extension-wxt` | WXT cross-browser extension |
| `lib` | `library-ts` | Publishable TypeScript library (tsup) |
| `libc` | `library-react-component-ts` | React component library + playground |
| `wp` | `webpack-plugin` | Typed Webpack plugin + demo |
| `vse` | `vscode-extension` | VS Code extension with React webview |
| `monorepo` | `monorepo` | pnpm workspace monorepo |
| `docs` | `docs` | Next.js + Fumadocs documentation site |
| `skill` | `skill` | Agent skill package |
| — | `custom` | Build from your own local template |

Every template ships with Biome, TypeScript, `.npmrc` and `.gitignore` already
configured.

## CLI options

```
Usage: create-chaos [OPTION]... [DIRECTORY]

Options:
  -t, --template NAME        use a specific template
  -c, --custom               create from a local custom template
  -s, --skill                create a skill project
  -w, --web                  open the visual template composer
      --port NUMBER          use a specific composer port (0-65535)
      --no-open              start the composer without opening a browser
  -h, --help                 display this help
```

## Web Composer

```bash
npm create chaos@latest web my-app --port 4173
npm create chaos@latest web --no-open
```

A local, dependency-free UI to browse templates, configure the output, and see the
equivalent CLI command. Supports English and Chinese. Binds to `127.0.0.1` with a
per-session token, only writes to child directories of the directory you launched
it from, and confirms before overwriting existing files.

## Custom templates

Reuse any local directory as a template via `chaos.config.ts` or a `chaos` field
in `package.json`:

```ts
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

```bash
npm create chaos@latest my-app --custom
```

## Requirements

| | Version |
| --- | --- |
| Node.js | >= 24.0.0 |

## License

[MIT](https://github.com/chaos-design/chaos/blob/main/LICENSE) © Chaos Design

Full documentation: [github.com/chaos-design/chaos](https://github.com/chaos-design/chaos#readme)