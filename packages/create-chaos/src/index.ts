import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import spawn from 'cross-spawn';
import minimist from 'minimist';
import prompts from 'prompts';
import { red, reset, yellow } from 'kolorist';
import type { ChaosConfigOptions, Framework } from './config.ts';
import {
  DEFAULT_TARGET_DIR,
  FRAMEWORKS,
  TEMPLATES,
  TEMPLATES_MAP,
  TEMPLATE_IGNORE,
  colors,
  helpMessage,
  loadChaosConfig,
  renameFiles,
} from './config.ts';
import {
  copy,
  emptyDir,
  formatTargetDir,
  isEmpty,
  isValidPackageName,
  pkgFromUserAgent,
  setupReactComponent,
  setupWebpack,
  toValidPackageName,
} from './utils.ts';

// Avoids autoconversion to number of the project name by defining that the args
// non associated with an option ( _ ) needs to be parsed as a string. See #4606
const argv = minimist<{
  template?: string;
  help?: boolean;
}>(process.argv.slice(2), {
  default: { help: false },
  alias: {
    h: 'help',
    t: 'template',
  },
  string: ['_'],
});
const cwd = process.cwd();
// console.log('argv', argv);

async function init() {
  const argTargetDir = formatTargetDir(argv._[0]);
  const argTemplate = argv.template || argv.t;

  const help = argv.help;
  if (help) {
    console.log(helpMessage);
    return;
  }

  let targetDir = argTargetDir || DEFAULT_TARGET_DIR;
  const getProjectName = () =>
    targetDir === '.' ? path.basename(path.resolve()) : targetDir;

  let result: prompts.Answers<
    'projectName' | 'overwrite' | 'packageName' | 'framework' | 'variant'
  >;

  try {
    result = await prompts(
      [
        {
          type: argTargetDir ? null : 'text',
          name: 'projectName',
          message: reset('Project name:'),
          initial: DEFAULT_TARGET_DIR,
          onState: (state) => {
            targetDir = formatTargetDir(state.value) || DEFAULT_TARGET_DIR;
          },
        },
        {
          type: () =>
            !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : 'confirm',
          name: 'overwrite',
          message: () =>
            `❗️${
              targetDir === '.'
                ? 'Current directory'
                : `Target directory "${targetDir}"`
            } is not empty. Remove existing files and continue?`,
        },
        {
          type: (_, { overwrite }: { overwrite?: boolean }) => {
            if (overwrite === false) {
              throw new Error(`${red('✖')} Operation cancelled`);
            }

            return null;
          },
          name: 'overwriteChecker',
        },
        {
          type: () => (isValidPackageName(getProjectName()) ? null : 'text'),
          name: 'packageName',
          message: reset('Package name:'),
          initial: () => toValidPackageName(getProjectName()),
          validate: (dir: string) =>
            isValidPackageName(dir) || 'Invalid package.json name',
        },
        {
          type:
            argTemplate && TEMPLATES.includes(argTemplate) ? null : 'select',
          name: 'framework',
          message:
            typeof argTemplate === 'string' && !TEMPLATES.includes(argTemplate)
              ? reset(
                  `"${argTemplate}" isn't a valid template. Please choose from below: `,
              )
              : reset('Select a framework:'),
          initial: 0,
          choices: FRAMEWORKS.map((framework) => {
            const frameworkColor = framework.color;

            return {
              title: `🗂  ${frameworkColor(
                framework.display || framework.name,
              )}`,
              value: framework,
            };
          }),
        },
        {
          type: (framework: Framework) =>
            framework && framework.variants ? 'select' : null,
          name: 'variant',
          message: reset('Select a variant:'),
          choices: (framework: Framework) =>
            framework.variants.map((variant) => {
              const variantColor = variant.color;

              return {
                title: `📦 ${variantColor(variant.display || variant.name)}`,
                value: variant.name,
              };
            }),
        },
      ],
      {
        onCancel: () => {
          throw new Error(`${red('✖')} Operation cancelled`);
        },
      },
    );
  } catch (cancelled: any) {
    console.log(cancelled.message);

    return;
  }

  // user choice associated with prompts
  const { framework, overwrite, packageName, variant } = result;

  const root = path.join(cwd, targetDir);

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  const pkgManager = pkgInfo ? pkgInfo.name : 'pnpm';

  if (overwrite) {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  // determine template
  let template: string = variant || framework?.name || argTemplate;
  let isReactSwc = false;

  if (template === 'custom') {
    try {
      const config = await loadChaosConfig();

      const customResult = await prompts([
        {
          type: () =>
            argTemplate ? null : config?.template?.length ? null : 'text',
          name: 'templatePath',
          message: reset('Template path:'),
        },
        {
          type: () =>
            argTemplate
            && config.template.map(t => t.name).includes(argTemplate)
              ? null
              : 'select',
          name: 'template',
          message:
            typeof argTemplate === 'string'
            && !config?.template.map(t => t.name).includes(argTemplate)
              ? reset(
                  `"${argTemplate}" isn't a valid template. Please choose from below: `,
              )
              : reset('Select a framework:'),
          initial: 0,
          choices: (config?.template || []).map((t, i) => {
            const frameworkColor
              = colors[(Math.random() * colors.length - 1) | 0];

            if (!t.path) {
              console.log();
              throw new Error(
                `${yellow('Template config had lost path in')} ${red(t.name)}`,
              );
            }

            return {
              title: frameworkColor(t.name),
              value: { ...t },
            };
          }),
        },
      ]);

      const { templatePath = '', template = {} } = customResult;
      const {
        path: tPath,
        ignore = [],
        renameFiles: templateRenameFiles = {},
        replace,
      } = template;
      const templateDir = tPath || templatePath;

      if (!fs.existsSync(targetDir)) {
        console.log();
        throw new Error(
          `${yellow('The Path is not exist in')} ${red(targetDir)}.`,
        );
      }

      console.log(`\n🔍 Scaffolding project in ${root} ...`);
      const processFiles = (
        files: string[],
        templateDir: string,
        root: string,
        renameFiles: ChaosConfigOptions['renameFiles'] = {},
      ) => {
        for (const file of files.filter(
          f => ![...TEMPLATE_IGNORE, ...ignore].filter(Boolean).includes(f),
        )) {
          const targetPath = path.join(root, renameFiles[file] ?? file);
          const filePath = path.join(templateDir, file);

          try {
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              const content
                = typeof replace !== 'function'
                  ? ''
                  : replace(
                    file,
                    fs.readFileSync(filePath, 'utf-8'),
                    packageName,
                  );

              if (content) {
                fs.writeFileSync(targetPath, `${content}`);
              } else {
                copy(filePath, targetPath);
              }
            } else if (stats.isDirectory()) {
              const subFiles = fs.readdirSync(filePath);
              const subTemplateDir = path.join(templateDir, file);
              const subRoot = path.join(root, renameFiles[file] ?? file);

              fs.mkdirSync(subRoot);
              processFiles(
                subFiles,
                subTemplateDir,
                subRoot,
                templateRenameFiles,
              );
            }
          } catch (err) {
            console.error(`Error processing file: ${filePath}`, err);
          }
        }
      };

      processFiles(
        fs.readdirSync(templateDir),
        templateDir,
        root,
        templateRenameFiles,
      );

      writeDoneTip(root, pkgManager);
    } catch (cancelled: any) {
      console.log(cancelled.message);

      return;
    }

    process.exit();
  }

  if (template.includes('-swc')) {
    isReactSwc = true;
    template = template.replace('-swc', '');
  }
  const isYarn1 = pkgManager === 'yarn' && pkgInfo?.version.startsWith('1.');

  const { customCommand, ignore = [] }
    = FRAMEWORKS.flatMap(f => f.variants).find(
      v => v.showName === template || v.name === template,
    ) ?? {};

  if (customCommand) {
    const fullCustomCommand = customCommand
      .replace(/^npm create /, () => {
        // `bun create` uses it's own set of templates,
        // the closest alternative is using `bun x` directly on the package
        if (pkgManager === 'bun') {
          return 'bun x create-';
        }

        return `${pkgManager} create `;
      })
      // Only Yarn 1.x doesn't support `@version` in the `create` command
      .replace('@latest', () => (isYarn1 ? '' : '@latest'))
      .replace(/^npm exec/, () => {
        // Prefer `pnpm dlx`, `yarn dlx`, or `bun x`
        if (pkgManager === 'pnpm') {
          return 'pnpm dlx';
        }

        if (pkgManager === 'yarn' && !isYarn1) {
          return 'yarn dlx';
        }

        if (pkgManager === 'bun') {
          return 'bun x';
        }

        // Use `npm exec` in all other cases,
        // including Yarn 1.x and other custom npm clients.
        return 'npm exec';
      });

    const [command, ...args] = fullCustomCommand.split(' ');

    // we replace TARGET_DIR here because targetDir may include a space
    const replacedArgs = args.map(arg =>
      arg.replace('TARGET_DIR', targetDir),
    );

    const { status } = spawn.sync(command, replacedArgs, {
      stdio: 'inherit',
    });

    process.exit(status ?? 0);
  }

  console.log(`\n🔍 Scaffolding project in ${root}...`);
  template = TEMPLATES_MAP.get(template);

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    '../..',
    `template-${template}`,
  );

  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file);

    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  };

  const files = fs.readdirSync(templateDir);

  for (const file of files.filter(
    f => ![...ignore, 'package.json'].includes(f),
  )) {
    write(file);
  }

  if (template === 'react-component-ts') {
    setupReactComponent(root, getProjectName());
    console.log(template, '\n✅ Done. Now use it.\n');

    return;
  }

  if (template.includes('webpack')) {
    setupWebpack(root, getProjectName());
    console.log(template, '\n✅ Rename Done.\n');
  }

  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, 'package.json'), 'utf-8'),
  );

  pkg.name = packageName || getProjectName();

  write('package.json', `${JSON.stringify(pkg, null, 2)}\n`);

  // if (isReactSwc) {
  //   setupReactSwc(root, template.endsWith('-ts'));
  // }

  writeDoneTip(root, pkgManager);
}

export function writeDoneTip(root: string, pkgManager: string) {
  const cdProjectName = path.relative(cwd, root);
  console.log('\n✅ Done. Now run:\n');

  if (root !== cwd) {
    console.log(
      `  cd ${
        cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName
      }`,
    );
  }

  switch (pkgManager) {
    case 'yarn':
      console.log('  yarn');
      console.log('  yarn dev');
      break;
    default:
      console.log(`  ${pkgManager} install`);
      console.log(`  ${pkgManager} run dev`);
      break;
  }
  console.log();
}

init().catch((e) => {
  console.error(e);
});
