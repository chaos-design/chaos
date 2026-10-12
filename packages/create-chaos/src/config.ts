import { loadConfig } from 'c12';
import {
  blue,
  cyan,
  green,
  lightCyan,
  lightGreen,
  lightMagenta,
  lightRed,
  magenta,
  red,
  yellow,
} from 'kolorist';

export type ColorFunc = (str: string | number) => string;

export interface Framework {
  name: string;
  display: string;
  color: ColorFunc;
  variants: FrameworkVariant[];
}

export interface FrameworkVariant {
  showName?: string;
  name: string;
  path: string;
  display: string;
  description: string;
  color: ColorFunc;
  customCommand?: string;
  ignore?: string[];
}

export interface TemplatePreset extends FrameworkVariant {
  category: string;
  categoryDisplay: string;
}

export const TEMPLATE_IGNORE = ['node_modules', '.git', '.DS_Store'];

export const FRAMEWORKS: Framework[] = [
  {
    name: 'react',
    display: 'React',
    color: lightCyan,
    variants: [
      {
        showName: 'react',
        name: 'react-ts',
        path: 'react/ts',
        display: 'TypeScript Project',
        description: 'Vite, React, and TypeScript for browser applications.',
        color: cyan,
      },
      {
        showName: 'reactc',
        name: 'react-component-ts',
        path: 'react/component',
        display: 'Component',
        description: 'A focused React component with scoped Sass styles.',
        color: blue,
      },
    ],
  },
  {
    name: 'next',
    display: 'Next.js',
    color: lightCyan,
    variants: [
      {
        showName: 'next-shadcn',
        name: 'react-next-shadcn',
        path: 'next/next-shadcn',
        display: 'Next.js + shadcn/ui',
        description: 'Next.js App Router with Tailwind CSS and shadcn/ui.',
        color: blue,
        ignore: ['.next', 'next-env.d.ts', 'out', 'tsconfig.tsbuildinfo'],
      },
      {
        showName: 'next-supabase',
        name: 'react-next-supabase',
        path: 'next/next-supabase',
        display: 'Next.js + Supabase',
        description:
          'Next.js App Router with Supabase SSR auth, Tailwind CSS, and shadcn/ui.',
        color: green,
        ignore: [
          '.env',
          '.env.local',
          '.next',
          '.next-dev',
          'coverage',
          'next-env.d.ts',
          'out',
          'test-results',
          'tsconfig.tsbuildinfo',
        ],
      },
    ],
  },
  {
    name: 'browser',
    display: 'Browser',
    color: lightMagenta,
    variants: [
      {
        showName: 'wxt',
        name: 'browser-extension-wxt',
        path: 'browser/extension-wxt',
        display: 'WXT Browser Extension',
        description:
          'A cross-browser extension with React, TypeScript, Tailwind CSS, and shadcn/ui.',
        color: magenta,
        ignore: [
          '.artifacts',
          '.output',
          '.wxt',
          'package-lock.json',
          ...TEMPLATE_IGNORE,
        ],
      },
    ],
  },
  {
    name: 'library',
    display: 'Library',
    color: lightRed,
    variants: [
      {
        showName: 'lib',
        name: 'library-ts',
        path: 'library/ts',
        display: 'TypeScript',
        description: 'A publishable TypeScript library built with tsup.',
        color: red,
      },
      {
        showName: 'libc',
        name: 'library-react-component-ts',
        path: 'library/react-component',
        display: 'React Component',
        description: 'A tested React component library with a playground.',
        color: magenta,
      },
    ],
  },
  {
    name: 'webpack',
    display: 'Webpack',
    color: lightRed,
    variants: [
      {
        showName: 'wp',
        name: 'webpack-plugin',
        path: 'webpack/plugin',
        display: 'Webpack Plugin',
        description: 'A typed Webpack plugin with an executable demo.',
        color: red,
        ignore: ['lib', 'dist', ...TEMPLATE_IGNORE],
      },
    ],
  },
  {
    name: 'vscode',
    display: 'VS Code',
    color: lightRed,
    variants: [
      {
        showName: 'vse',
        name: 'vscode-extension',
        path: 'vscode/extension',
        display: 'VS Code Extension',
        description: 'A VS Code extension with a React-powered webview.',
        color: red,
        ignore: ['lib', 'dist', ...TEMPLATE_IGNORE],
      },
    ],
  },
  {
    name: 'skill',
    display: 'Skill',
    color: lightMagenta,
    variants: [
      {
        showName: 'skill',
        name: 'skill',
        path: 'skills',
        display: 'Skill Project',
        description: 'An agent skill package with usage instructions.',
        color: magenta,
      },
    ],
  },
  {
    name: 'repository',
    color: lightGreen,
    display: 'Repository',
    variants: [
      {
        showName: 'monorepo',
        name: 'monorepo',
        path: 'repo/monorepo',
        display: 'Monorepo',
        description: 'A pnpm workspace with shared repository tooling.',
        color: green,
      },
    ],
  },
  {
    name: 'docs',
    display: 'Docs',
    color: lightCyan,
    variants: [
      {
        showName: 'docs',
        name: 'docs',
        path: 'docs',
        display: 'Documentation Site',
        description: 'A Next.js documentation site powered by Fumadocs.',
        color: yellow,
        ignore: ['.next', 'next-env.d.ts'],
      },
    ],
  },
  {
    name: 'others',
    display: 'Others',
    color: lightMagenta,
    variants: [
      {
        name: 'custom',
        path: '',
        display: 'Create By Custom ↗',
        description: 'Create a project from a local custom template.',
        color: yellow,
      },
    ],
  },
];

export const TEMPLATE_PRESETS: TemplatePreset[] = FRAMEWORKS.flatMap(
  (framework) =>
    framework.variants.map((variant) => ({
      ...variant,
      category: framework.name,
      categoryDisplay: framework.display,
    })),
);

export const TEMPLATES_MAP = new Map<string, string>(
  TEMPLATE_PRESETS.flatMap((preset) => {
    const entries: [string, string][] = [[preset.name, preset.path]];

    if (preset.showName) {
      entries.push([preset.showName, preset.path]);
    }

    return entries;
  }),
);

export const TEMPLATES = [...TEMPLATES_MAP.keys()];

export function resolveTemplate(template: string | undefined) {
  if (!template) {
    return undefined;
  }

  return TEMPLATE_PRESETS.find(
    (preset) => preset.name === template || preset.showName === template,
  );
}

const availableTemplates = TEMPLATE_PRESETS.filter(
  (preset) => preset.name !== 'custom',
)
  .map((preset) => {
    const name = preset.color(preset.name.padEnd(34));
    const alias =
      preset.showName && preset.showName !== preset.name
        ? ` ${preset.showName}`
        : '';

    return `  ${name}${alias}`;
  })
  .join('\n');

export const helpMessage = `\
Usage: create-chaos [OPTION]... [DIRECTORY]

Options:
  -t, --template NAME        use a specific template
  -c, --custom               create from a local custom template
  -s, --skill                create a skill project
  -w, --web                  open the visual template composer
      --port NUMBER          use a specific composer port
      --no-open              start the composer without opening a browser
  -h, --help                 display this help

Available templates:
${availableTemplates}

Examples:
  create-chaos my-app --template react
  create-chaos my-docs -t docs
  create-chaos my-skill --skill
  create-chaos web
  create-chaos --web my-app`;

export const renameFiles: Record<string, string | undefined> = {
  '_biome.json': 'biome.json',
  '_env.example': '.env.example',
  _vscode: '.vscode',
  _github: '.github',
  _gitignore: '.gitignore',
  _editorconfig: '.editorconfig',
  _gitattributes: '.gitattributes',
  _npmrc: '.npmrc',
  // Required under these exact names by vsce and @vscode/test-cli.
  _vscodeignore: '.vscodeignore',
  '_vscode-test.mjs': '.vscode-test.mjs',
};

export const DEFAULT_TARGET_DIR = 'chaos-project';

export const DEFAULT_CONFIG_NAME = 'chaos';

export const DEFAULT_CONFIG_FILES = [
  'chaos.config.js',
  'chaos.config.mjs',
  'chaos.config.ts',
  'chaos.config.cjs',
  'chaos.config.mts',
  'chaos.config.cts',
];

export const colors = [
  blue,
  cyan,
  green,
  lightCyan,
  lightGreen,
  lightRed,
  lightMagenta,
  magenta,
  red,
  yellow,
];

export interface ChaosConfigOptions {
  name: string;
  path: string;

  ignore?: string[];
  renameFiles?: Record<string, string | undefined>;

  /**
   * Transform a file while it is copied.
   *
   * Returning an empty string keeps the original content, which lets a hook act
   * as a filter as well as a transformer.
   */
  replace?: (file: string, content: string, packageName: string) => string;
}

export interface ChaosConfig {
  template: ChaosConfigOptions[];
}

export async function loadChaosConfig(
  overrides?: Partial<ChaosConfigOptions>,
  cwd = process.cwd(),
) {
  const { config } = await loadConfig<ChaosConfig>({
    name: DEFAULT_CONFIG_NAME,
    packageJson: true,
    cwd,
    overrides: {
      ...(overrides as ChaosConfig),
    },
  });

  // c12 resolves to `{}` when no config exists, so normalise to an empty list
  // instead of handing callers an object with a missing `template` key.
  return { ...config, template: config?.template ?? [] };
}
