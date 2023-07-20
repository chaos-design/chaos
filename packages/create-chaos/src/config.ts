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
  name: string;
  display: string;
  color: ColorFunc;
  customCommand?: string;
}

export const FRAMEWORKS: Framework[] = [
  {
    name: 'react',
    display: 'React',
    color: lightCyan,
    variants: [
      {
        name: 'react-ts',
        display: 'React TypeScript',
        color: cyan,
      },
      {
        name: 'react-component-ts',
        display: 'React Component',
        color: blue,
      },
    ],
  },
  {
    name: 'library',
    display: 'Library',
    color: lightRed,
    variants: [
      {
        name: 'library-ts',
        display: 'TypeScript',
        color: red,
      },
      {
        name: 'library-react-component-ts',
        display: 'React Component Library',
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
        name: 'monorepo',
        display: 'Monorepo',
        color: green,
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
        display: 'Create By Custom ↗',
        color: yellow,
        customCommand: 'npm create vite-create@latest TARGET_DIR',
      },
    ],
  },
];

export const TEMPLATES = FRAMEWORKS.map(
  f => (f.variants && f.variants.map(v => v.name)) || [f.name],
).reduce((a, b) => a.concat(b), []);

/* eslint-disable quote-props */
export const renameFiles: Record<string, string | undefined> = {
  _github: '.github',
  _gitignore: '.gitignore',
  _editorconfig: '.editorconfig',
  _eslintignore: '.eslintignore',
  '_eslintrc.cjs': '.eslintrc.cjs',
  '_eslintrc.js': '.eslintrc.js',
  _gitattributes: '.gitattributes',
  _npmrc: '.npmrc',
  _prettierignore: '.prettierignore',
  '_prettierrc.json': '.prettierrc.json',
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

export const TEMPLATE_IGNORE = ['node_modules', '.git'];

export interface ChaosConfigOptions {
  name: string;
  path: string;

  ignore?: string[];
  renameFiles?: Record<string, string | undefined>;

  replace?: (file: string, content: string) => string;
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

  return config!;
}
