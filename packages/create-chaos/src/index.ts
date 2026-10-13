import fs from 'node:fs';
import path from 'node:path';
import spawn from 'cross-spawn';
import { red, reset } from 'kolorist';
import minimist from 'minimist';
import prompts from 'prompts';
import {
  CustomCommand,
  parseWebPort,
  TemplateCommand,
  WebCommand,
} from './commands';
import {
  DEFAULT_TARGET_DIR,
  helpMessage,
  resolveTemplate,
  TEMPLATE_PRESETS,
  TEMPLATES,
} from './config.ts';
import type { CommandContext } from './core/context.ts';
import {
  emptyDir,
  formatTargetDir,
  isEmpty,
  isValidPackageName,
  pkgFromUserAgent,
  toValidPackageName,
} from './utils.ts';

// Avoids autoconversion to number of the project name by defining that the args
// non associated with an option ( _ ) needs to be parsed as a string. See #4606
const argv = minimist<{
  template?: string;
  help?: boolean;
  custom?: boolean;
  web?: boolean;
  open?: boolean;
  port?: string;
}>(process.argv.slice(2), {
  default: { help: false, open: true },
  alias: {
    h: 'help',
    t: 'template',
    c: 'custom',
    w: 'web',
  },
  boolean: ['help', 'custom', 'web', 'open'],
  string: ['_', 'template', 'port'],
});
const cwd = process.cwd();

async function init() {
  if (argv.help) {
    console.log(helpMessage);
    return;
  }

  const usesWebSubcommand = argv._[0] === 'web';
  if (argv.web || usesWebSubcommand) {
    const initialTargetDir = formatTargetDir(argv._[usesWebSubcommand ? 1 : 0]);
    const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);

    await new WebCommand({
      cwd,
      initialTargetDir: initialTargetDir || DEFAULT_TARGET_DIR,
      openBrowser: argv.open !== false,
      packageManager: pkgInfo?.name || 'pnpm',
      port: parseWebPort(argv.port),
    }).execute();
    return;
  }

  const argTargetDir = formatTargetDir(argv._[0]);

  // `--custom` selects a mode, while a template name names something inside
  // that mode. The name can arrive either as `-t <name>` or as a bare
  // positional after the directory (`create-chaos app --custom gallery`), so
  // both must be read. Routing the mode first is what prevents `-t gallery` from
  // silently overriding `--custom`.
  const modeTemplate = argv.custom ? 'custom' : null;
  const namedTemplate =
    modeTemplate === null ? argv.template : argv.template || argv._[1];
  const argTemplate = modeTemplate ?? (argv.template || undefined);
  const customTemplateName =
    modeTemplate === 'custom' ? namedTemplate : undefined;

  let targetDir = argTargetDir || DEFAULT_TARGET_DIR;
  const getProjectName = () =>
    targetDir === '.' ? path.basename(path.resolve()) : targetDir;

  let result: prompts.Answers<
    'projectName' | 'overwrite' | 'packageName' | 'template'
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
          // The built-in picker must not intercept an explicit --custom,
          // because those modes run their own selection flow.
          type:
            modeTemplate !== null ||
            (argTemplate && TEMPLATES.includes(argTemplate))
              ? null
              : 'select',
          name: 'template',
          message:
            typeof argTemplate === 'string' &&
            !TEMPLATES.includes(argTemplate) &&
            modeTemplate === null
              ? reset(
                  `"${argTemplate}" isn't a valid template. Choose one below:`,
                )
              : reset('Select a template:'),
          initial: 0,
          choices: TEMPLATE_PRESETS.map((preset) => {
            const alias =
              preset.showName && preset.showName !== preset.name
                ? ` | ${preset.showName}`
                : '';
            return {
              title: preset.color(preset.display || preset.name),
              description: `${preset.categoryDisplay} | ${preset.name}${alias}`,
              value: preset.name,
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
  } catch (cancelled: unknown) {
    const message =
      cancelled instanceof Error ? cancelled.message : 'Operation cancelled';
    console.log(message);

    return;
  }

  const { overwrite, packageName } = result;
  const preset = resolveTemplate(result.template || argTemplate);

  if (!preset) {
    throw new Error('No template was selected.');
  }

  const template = preset.name;

  const root = path.join(cwd, targetDir);

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  const pkgManager = pkgInfo ? pkgInfo.name : 'pnpm';

  if (overwrite) {
    emptyDir(root);
  } else if (!fs.existsSync(root) && template !== 'custom') {
    // CustomCommand creates the root only once the template actually resolves,
    // so a failed run does not leave an empty directory behind.
    fs.mkdirSync(root, { recursive: true });
  }

  const isYarn1 = pkgManager === 'yarn' && pkgInfo?.version?.startsWith('1.');
  const { customCommand, ignore = [] } = preset;

  if (customCommand) {
    const fullCustomCommand = customCommand
      .replace(/^npm create /, () => {
        if (pkgManager === 'bun') return 'bun x create-';
        return `${pkgManager} create `;
      })
      .replace('@latest', () => (isYarn1 ? '' : '@latest'))
      .replace(/^npm exec/, () => {
        if (pkgManager === 'pnpm') return 'pnpm dlx';
        if (pkgManager === 'yarn' && !isYarn1) return 'yarn dlx';
        if (pkgManager === 'bun') return 'bun x';
        return 'npm exec';
      });

    const [command, ...args] = fullCustomCommand.split(' ');
    const replacedArgs = args.map((arg) =>
      arg.replace('TARGET_DIR', targetDir),
    );

    const { status } = spawn.sync(command, replacedArgs, {
      stdio: 'inherit',
    });

    process.exitCode = status ?? 1;
    return;
  }

  const context: CommandContext = {
    root,
    targetDir,
    packageName: packageName || getProjectName(),
    template,
    pkgManager,
    ignore,
    argTemplate: template === 'custom' ? customTemplateName : undefined,
  };

  if (template === 'custom') {
    await new CustomCommand(context).execute();
  } else {
    await new TemplateCommand(context).execute();
  }
}

init().catch((e) => {
  const message = e instanceof Error ? e.message : String(e);
  console.error(`${red('✖')} ${message}`);
  process.exitCode = 1;
});
