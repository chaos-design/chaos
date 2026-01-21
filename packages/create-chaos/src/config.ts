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
  color: ColorFunc;
  customCommand?: string;
  ignore?: string[];
}

export const TEMPLATE_IGNORE = ['node_modules', '.git'];

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
        color: cyan,
      },
      {
        showName: 'reactc',
        name: 'react-component-ts',
        path: 'react/component',
        display: 'Component',
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
        showName: 'lib',
        name: 'library-ts',
        path: 'library/ts',
        display: 'TypeScript',
        color: red,
      },
      {
        showName: 'libc',
        name: 'library-react-component-ts',
        path: 'library/react-component',
        display: 'React Component',
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
        display: 'Vscode Extension',
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
        path: '',
        display: 'Create By Custom ↗',
        color: yellow,
      },
    ],
  },
];

export const TEMPLATES_MAP = new Map<string, string>(); // Map template name/alias to path

export const TEMPLATES = FRAMEWORKS.map((f) => {
  if (f.variants) {
    return f.variants.map((v) => {
      if (v.showName) {
        TEMPLATES_MAP.set(v.showName, v.path);
      }
      TEMPLATES_MAP.set(v.name, v.path);

      return v.showName || v.name;
    });
  }

  return [f.name];
}).reduce((a, b) => a.concat(b), []);

export const helpMessage = `\
Usage: create-chaos [OPTION]... [DIRECTORY]

Options:
  -t, --template NAME        use a specific template

Available templates:
${yellow('react-ts                      react         ')}
${green('react-component-ts            reactc        ')}
${cyan('library-ts                    lib           ')}
${cyan('library-react-component-ts    libc          ')}
${magenta('webpack-plugin                wp            ')}
${lightRed('vscode-extension              vse           ')}
${magenta('skill                         skill         ')}
${red('monorepo                      monorepo      ')}`;

export const renameFiles: Record<string, string | undefined> = {
  _vscode: '.vscode',
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
  _prettierrc: '.prettierrc',
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
