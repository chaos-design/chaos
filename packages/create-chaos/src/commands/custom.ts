import fs from 'node:fs';
import path from 'node:path';
import { red, reset } from 'kolorist';
import prompts from 'prompts';
import type { ChaosConfigOptions } from '../config.ts';
import { colors, loadChaosConfig, TEMPLATE_IGNORE } from '../config.ts';
import { Command } from '../core/command.ts';
import { writeDoneTip } from '../utils.ts';

export class CustomCommand extends Command {
  async execute() {
    const { root, packageName, argTemplate, pkgManager } = this.context;

    const config = await loadChaosConfig();
    const templates = config?.template ?? [];

    if (templates.length === 0 && !argTemplate) {
      // Nothing configured and nothing requested: ask for a path directly
      // instead of showing an empty picker.
      const { templatePath } = await this.promptPath();

      if (!templatePath) {
        return;
      }

      this.scaffold(root, packageName, pkgManager, {
        name: 'custom',
        path: templatePath,
      });

      return;
    }

    if (templates.length === 0) {
      // `--custom <name>` was passed but no config declares it. Say so plainly
      // rather than dereferencing config.template and dying on a TypeError.
      this.fail(
        `No custom templates are configured, so "${argTemplate}" cannot be resolved. ` +
          'Add a chaos.config.* file or a "chaos" field in package.json.',
      );
      process.exitCode = 1;
      return;
    }

    const knownNames = new Set(templates.map((entry) => entry.name));
    const template = await this.promptTemplate(templates, knownNames);

    if (!template) {
      return;
    }

    this.scaffold(root, packageName, pkgManager, template);
  }

  private async promptPath(): Promise<{ templatePath?: string }> {
    try {
      return await prompts<'templatePath'>({
        type: 'text',
        name: 'templatePath',
        message: reset('Template path:'),
      });
    } catch (cancelled: unknown) {
      this.reportCancelled(cancelled);
      return {};
    }
  }

  private async promptTemplate(
    templates: ChaosConfigOptions[],
    knownNames: Set<string>,
  ) {
    const { argTemplate } = this.context;

    // A name that matches the config skips the picker entirely.
    if (argTemplate) {
      const match = templates.find((entry) => entry.name === argTemplate);
      if (match) {
        return match;
      }
    }

    try {
      const result = await prompts<'template'>({
        type: 'autocomplete',
        name: 'template',
        message:
          typeof argTemplate === 'string' && !knownNames.has(argTemplate)
            ? reset(
                `"${argTemplate}" isn't a valid template. Please choose from below: `,
              )
            : reset('Select a framework:'),
        initial: 0,
        choices: templates.map((entry) => ({
          title: colors[(Math.random() * colors.length - 1) | 0](entry.name),
          value: entry,
        })),
        suggest: async (input: string, choices: prompts.Choice[]) => {
          const keyword = input.toLowerCase();
          return choices.filter((choice) =>
            choice.title.toLowerCase().includes(keyword),
          );
        },
      });

      return result.template as ChaosConfigOptions | undefined;
    } catch (cancelled: unknown) {
      this.reportCancelled(cancelled);
      return undefined;
    }
  }

  private scaffold(
    root: string,
    packageName: string,
    pkgManager: string,
    template: ChaosConfigOptions,
  ) {
    const {
      path: templatePath = '',
      ignore = [],
      renameFiles,
      replace,
    } = template;
    const templateRenameFiles = renameFiles ?? {};

    if (!templatePath) {
      this.fail('The selected template has no "path" configured.');
      process.exitCode = 1;
      return;
    }

    const templateDir = path.resolve(process.cwd(), templatePath);

    if (
      !fs.existsSync(templateDir) ||
      !fs.statSync(templateDir).isDirectory()
    ) {
      this.fail(`The template path does not exist: ${templatePath}`);
      process.exitCode = 1;
      return;
    }

    console.log(`\n🔍 Scaffolding project in ${root} ...`);

    // Collect failures instead of printing per-file errors and continuing, so a
    // broken template cannot produce a silently half-generated project.
    const failures: string[] = [];

    const processFiles = (
      dir: string,
      destDir: string,
      renameMap: Record<string, string | undefined>,
    ) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (
          [...TEMPLATE_IGNORE, ...ignore].filter(Boolean).includes(entry.name)
        )
          continue;

        const source = path.join(dir, entry.name);
        const dest = path.join(destDir, renameMap[entry.name] ?? entry.name);

        try {
          if (entry.isDirectory()) {
            fs.mkdirSync(dest, { recursive: true });
            processFiles(source, dest, renameMap);
            continue;
          }

          if (!entry.isFile()) {
            // Symlinks and sockets cannot be copied meaningfully.
            failures.push(
              `${source} (unsupported file type: ${entry.isSymbolicLink() ? 'symlink' : 'other'})`,
            );
            continue;
          }

          const original = fs.readFileSync(source, 'utf-8');
          const content =
            typeof replace === 'function'
              ? replace(entry.name, original, packageName)
              : original;

          // `replace` returning an empty string means "keep the original",
          // which mirrors create-vite and lets a hook filter files out.
          fs.writeFileSync(dest, content || original);
        } catch (error) {
          failures.push(
            `${source} (${error instanceof Error ? error.message : String(error)})`,
          );
        }
      }
    };

    fs.mkdirSync(root, { recursive: true });
    processFiles(templateDir, root, templateRenameFiles);

    if (failures.length > 0) {
      this.fail(
        `Failed to copy ${failures.length} entr${failures.length === 1 ? 'y' : 'ies'}:`,
      );
      for (const failure of failures) {
        console.error(`  ${red('x')} ${failure}`);
      }
      process.exitCode = 1;
      return;
    }

    writeDoneTip(root, pkgManager);
  }

  private fail(message: string) {
    console.error(`${red('✖')} ${message}`);
  }

  private reportCancelled(error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Operation cancelled';
    console.log(message);
  }
}
