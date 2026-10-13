// Curated presentation metadata for the inspector panel, keyed by the template
// id generated into `templates.ts`. The copy mirrors `docs/templates.md` — keep
// the two in sync when a template changes.
//
// Ids/aliases/descriptions are NOT repeated here: those stay generated from
// packages/create-chaos/src/config.ts. `site/scripts/sync-templates.mjs` fails
// when a template ships without an entry below, so a new template can never
// silently render an empty panel.
import type { ChaosTemplate, TemplateDetail } from '@/lib/types';

export const TEMPLATE_DETAILS: Record<string, TemplateDetail> = {
  'react-ts': {
    stack: ['Vite', 'React', 'TypeScript'],
    includes: [
      'vite.config.ts / index.html / tsconfig.json',
      'src/ — main.tsx, App.tsx, index.css',
      'biome.json / .gitignore / .npmrc',
    ],
    next: 'Add routing (react-router), state (zustand) or Tailwind (shadcn init).',
  },
  'react-component-ts': {
    stack: ['React', 'TypeScript', 'Sass'],
    includes: ['index.tsx', 'index.module.scss'],
    next: 'Drop the folder into an existing app and import it.',
  },
  'react-next-shadcn': {
    stack: ['Next.js', 'App Router', 'Tailwind CSS', 'shadcn/ui'],
    includes: [
      'app/ — layout, page, globals, favicon',
      'components/ui/ — badge, button, card',
      'components/theme-provider.tsx / components.json',
      'vercel.json + GitHub Actions deploy workflow',
    ],
    requires: 'Node.js >= 20.9.0',
    next: 'pnpm dlx shadcn@latest add <component> to pull in more primitives.',
  },
  'react-next-supabase': {
    stack: ['Next.js', 'Supabase SSR', 'Tailwind CSS', 'shadcn/ui'],
    includes: [
      'src/app/auth/** — email confirmation, magic links, password reset',
      'src/app/(pages) — login, register, workspace, legal pages',
      'src/server/auth/** + middleware route protection',
      'supabase/ — config.toml, platform.sql, email templates',
      'scripts/ to create and configure the Supabase project',
    ],
    next: 'pnpm run create:project, then pnpm run setup:project.',
  },
  'browser-extension-wxt': {
    stack: ['WXT', 'React', 'TypeScript', 'Tailwind CSS', 'shadcn/ui'],
    includes: [
      'entrypoints/ — background, content, popup, options, sidepanel',
      'components/ + hooks/ + lib/ + styles/',
      'wxt.config.ts / scripts/setup-project.mjs',
    ],
    requires: 'Node.js >= 22.0.0 (WXT requirement; the CLI needs 24+)',
    next: 'pnpm run setup to customise the manifest, name and icons.',
  },
  'library-ts': {
    stack: ['TypeScript', 'tsup'],
    includes: ['src/index.ts', 'index.d.ts', 'tsup.config.ts', 'biome.json'],
    next: 'Set name/description/exports in package.json, then pnpm run release.',
  },
  'library-react-component-ts': {
    stack: ['React', 'TypeScript', 'Vite playground'],
    includes: [
      'src/counter/ — component + module.scss',
      'src/index.ts',
      'playground/ — Vite app for visual iteration',
    ],
    next: 'Replace src/counter with your own components.',
  },
  'webpack-plugin': {
    stack: ['TypeScript', 'Webpack', 'tsup'],
    includes: [
      'src/index.ts / index.d.ts / tsup.config.ts',
      'demo/ — its own package.json + webpack.config.js',
    ],
    next: 'cd demo && npm install && npm run dev to see it work.',
  },
  'vscode-extension': {
    stack: ['VS Code API', 'React webview', 'Rsbuild', 'pnpm workspace'],
    includes: [
      'src/extension.ts + src/commands/ + src/utils/',
      'src/create/ — webview provider with nonce + CSP',
      'webview-ui/ — Rsbuild + React app',
      'static/images/',
    ],
    requires: 'VS Code ^1.85.0',
    next: 'pnpm run compile to type-check, then press F5 for the Extension Host.',
  },
  monorepo: {
    stack: ['pnpm workspaces', 'Biome', 'GitHub Actions'],
    includes: [
      'pnpm-workspace.yaml / biome.json / .editorconfig',
      '.github/workflows/ — release, semantic PR, issue management',
      'scripts/ — bump-version, get-package-info, publish-to-npm',
    ],
    next: 'Create packages/<name>/package.json and run pnpm install.',
  },
  docs: {
    stack: ['Next.js', 'Fumadocs', 'MDX'],
    includes: [
      'app/ — docs routes, OG generation, llms-full.txt, search API',
      'components/ — landing page, sidebar, preview, MDX helpers',
      'content/docs/ + examples/ + source.config.ts',
    ],
    next: 'Add MDX files under content/docs/ and update source.config.ts.',
  },
};

/**
 * Lookup with a safe fallback: an unknown id still renders a panel built from
 * the generated description alone instead of crashing the page.
 */
export function getTemplateDetail(template: ChaosTemplate): TemplateDetail {
  return (
    TEMPLATE_DETAILS[template.id] ?? {
      stack: [],
      includes: [],
      next: '',
    }
  );
}
