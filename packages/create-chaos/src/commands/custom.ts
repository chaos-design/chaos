import fs from 'node:fs';
import path from 'node:path';
import { red, reset, yellow } from 'kolorist';
import prompts from 'prompts';
import type { ChaosConfigOptions } from '../config.ts';
import { colors, loadChaosConfig, TEMPLATE_IGNORE } from '../config.ts';
import { Command } from '../core/command.ts';
import { copy, writeDoneTip } from '../utils.ts';

export class CustomCommand extends Command {
  async execute() {
    const { root, packageName, argTemplate, pkgManager } = this.context;

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
            argTemplate &&
            config.template.map((t) => t.name).includes(argTemplate)
              ? null
              : 'autocomplete',
          name: 'template',
          message:
            typeof argTemplate === 'string' &&
            !config?.template.map((t) => t.name).includes(argTemplate)
              ? reset(
                  `"${argTemplate}" isn't a valid template. Please choose from below: `,
                )
              : reset('Select a framework:'),
          initial: 0,
          choices: (config?.template || []).map((t) => {
            const frameworkColor =
              colors[(Math.random() * colors.length - 1) | 0];

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
          suggest: async (input: string, choices: any[]) => {
            const keyword = input.toLowerCase();
            return choices.filter((choice) =>
              choice.title.toLowerCase().includes(keyword),
            );
          },
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

      // Note: targetDir check logic might need adjustment if we want strict separation
      // but keeping it close to original logic for now.
      // In original code, targetDir is used for existence check of template path?
      // Wait, original code:
      // if (!fs.existsSync(targetDir)) { ... throw Error ... }
      // It seems it was checking if the TEMPLATE directory exists, but using targetDir variable?
      // Actually looking at original code:
      // const templateDir = tPath || templatePath;
      // if (!fs.existsSync(targetDir)) ...
      // This looks like a bug in original code or I misunderstood.
      // If templatePath is relative, it should be resolved.
      // But assuming standard usage:

      if (!fs.existsSync(templateDir)) {
        // It seems the original code might have meant templateDir?
        // "The Path is not exist in targetDir" -> likely checking template source.
        // Let's assume we check templateDir here.
        console.log();
        throw new Error(
          `${yellow('The Path is not exist in')} ${red(templateDir)}.`,
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
          (f) => ![...TEMPLATE_IGNORE, ...ignore].filter(Boolean).includes(f),
        )) {
          const targetPath = path.join(root, renameFiles[file] ?? file);
          const filePath = path.join(templateDir, file);

          try {
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              const content =
                typeof replace !== 'function'
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
}
