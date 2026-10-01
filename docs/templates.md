# Template Catalogue

Every template, what it contains, and what to do next. Canonical names and short
aliases are interchangeable on the command line.

| Alias | Template | Category |
| --- | --- | --- |
| `react` | `react-ts` | React |
| `reactc` | `react-component-ts` | React |
| `next-shadcn` | `react-next-shadcn` | React |
| `next-supabase` | `react-next-supabase` | React |
| `wxt` | `browser-extension-wxt` | Browser |
| `lib` | `library-ts` | Library |
| `libc` | `library-react-component-ts` | Library |
| `wp` | `webpack-plugin` | Webpack |
| `vse` | `vscode-extension` | VS Code |
| `monorepo` | `monorepo` | Repository |
| `docs` | `docs` | Docs |
| `skill` | `skill` | Skill |
| — | `custom` | Others |

---

## React

### `react` — Vite + React + TypeScript

The default starting point for a browser application.

**Contains** `vite.config.ts`, `index.html`, `src/` (`main.tsx`, `App.tsx`,
`index.css`), `tsconfig.json`, `biome.json`, `.gitignore`, `.npmrc`.

**Scripts** `dev`, `build`, `preview`, `lint`, `format`, `typecheck`.

**Next** add routing (`react-router`), state (`zustand`), or Tailwind CSS
(`pnpm dlx shadcn@latest init`).

---

### `reactc` — Single React component

A single droppable component with a co-located stylesheet. Two files, nothing
else — meant to be copied into an existing codebase.

**Contains** `index.tsx`, `index.module.scss`.

There is no `package.json`, so nothing is installed. `ComponentName` in both
files is rewritten to your project name.

**Next** drop it into your app and import it.

---

### `next-shadcn` — Next.js + shadcn/ui

Next.js App Router with Tailwind CSS and shadcn/ui wired up.

**Contains** `app/` (layout, page, globals, favicon), `components/ui/`
(badge, button, card), `components/theme-provider.tsx`, `components.json`,
`lib/utils.ts`, `next.config.ts`, `postcss.config.mjs`, `vercel.json`,
`.github/workflows/deploy.yml`, `AGENTS.md`.

**Requires** Node.js >= 20.9.0.

**Next** `pnpm dlx shadcn@latest add <component>` to pull in more primitives.

---

### `next-supabase` — Next.js + Supabase auth

Full SSR authentication: email confirmation, magic links, password reset, and
route protection via middleware.

**Contains** `src/app/auth/**`, `src/app/(pages)` (login, register,
forgot-password, reset-password, workspace, legal pages), `src/features/auth/**`,
`src/server/auth/**`, `src/lib/supabase/**`, `src/proxy.ts`,
`supabase/` (`config.toml`, `platform.sql`, email templates), `scripts/` to
create and configure the Supabase project, `docs/style-guide.md`.

**Next** run `pnpm run create:project` to provision the Supabase project, then
`pnpm run setup:project` to wire up the environment.

---

## Browser

### `wxt` — Cross-browser extension

WXT + React + TypeScript + Tailwind CSS + shadcn/ui.

**Contains** `entrypoints/` (background, content, popup, options, sidepanel),
`components/`, `hooks/`, `lib/`, `styles/`, `wxt.config.ts`,
`assets/icon-source.svg`, `public/icon/*.png`, `scripts/setup-project.mjs`.

**Requires** Node.js **>= 22.0.0** (WXT's own requirement). In practice you
will be on 24 or newer, since that is what the CLI requires.

**Scripts** `dev`, `dev:firefox`, `build`, `build:firefox`, `zip`, `zip:firefox`.
`postinstall` runs `wxt prepare` to generate `.wxt/` types.

**Next** `pnpm run setup` to customise the manifest, name and icons.

---

## Library

### `lib` — TypeScript library

A publishable library built with tsup.

**Contains** `src/index.ts`, `index.d.ts`, `tsup.config.ts`, `biome.json`.

**Scripts** `dev` (watch), `build`, `typecheck`, `release` (bumpp).

**Next** set `name`, `description` and `exports` in `package.json`, then
`pnpm run release`.

---

### `libc` — React component library

A component library with a Vite playground for visual iteration.

**Contains** `src/counter/` (component + module.scss), `src/index.ts`,
`playground/` (Vite app), `vite.config.ts`, `index.html`.

**Scripts** `dev` (playground), `build`, `typecheck`.

**Next** replace `src/counter` with your own components.

---

## Webpack

### `wp` — Webpack plugin

A typed Webpack plugin plus a runnable demo project that consumes it.

**Contains** `src/index.ts`, `index.d.ts`, `tsup.config.ts`, `README.md`, and
`demo/` (its own `package.json`, `webpack.config.js`, `src/index.ts`).

Class name and package name are rewritten from your project name in
`src/index.ts`, `demo/package.json`, `demo/webpack.config.js` and `README.md`.

**Scripts** `dev`, `build`, `release`.

**Next** `cd demo && npm install && npm run dev` to see it work.

---

## VS Code

### `vse` — VS Code extension

An extension with a React-powered webview, bundled as a pnpm workspace.

**Contains** `src/extension.ts`, `src/commands/`, `src/create/` (webview
provider with nonce + CSP), `src/utils/`, `static/images/`, and
`webview-ui/` (Rsbuild + React app with its own `.gitignore`).

**Requires** VS Code `^1.85.0`.

**Scripts** `vscode:prepublish`, `build`, `compile`, `watch`, `pretest`, `lint`,
`test`.

**Next** `pnpm run compile` to type-check, then press `F5` to launch an Extension
Development Host.

---

## Repository

### `monorepo` — pnpm workspace

A monorepo skeleton with shared tooling and release automation.

**Contains** `pnpm-workspace.yaml`, `biome.json`, `.editorconfig`,
`.gitattributes`, `.vscode/`, `.github/workflows/` (release, semantic PR,
issue management), `scripts/` (`bump-version.mjs`, `get-package-info.mjs`,
`get-changed-pkg-path.sh`, `publish-to-npm.sh`).

**Scripts** `build`, `dev`, `typecheck`, `lint`, `format`, `getchanged`,
`release-all`, `release`, `publish-pkg`.

**Next** create `packages/<name>/package.json` and run `pnpm install`.

---

## Docs

### `docs` — Documentation site

A Next.js + Fumadocs site with MDX content, search, OG image generation,
`llms.txt` routes and a component registry.

**Contains** `app/` (docs routes, OG generation, `llms-full.txt`, sitemap,
manifest, search API), `components/` (landing page, sidebar, preview, MDX
helpers), `content/docs/`, `examples/`, `hooks/`, `utils/`, `source.config.ts`,
`fumadocs.config.ts`, `radix-ui.ts`, `vercel.json`.

**Scripts** `dev`, `build`, `start`, `lint`, `format`, `typecheck`.

**Next** add MDX files under `content/docs/` and update `source.config.ts`.

---

## Skill

### `skill` — Agent skill package

Generates an instruction package for coding agents rather than a runnable app.

**Contains** `SKILL.md` with YAML frontmatter (`title`, `description`) and a
`data/` directory of reference material. `{{PROJECT_NAME}}` placeholders are
substituted during generation.

Bundled skill: **`technology-selection`** — helps an agent choose a technology
stack and architecture for a new project.

**Next** edit `SKILL.md` and the `data/` files to match your own workflow.