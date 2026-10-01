import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renameFiles, TEMPLATE_IGNORE, TEMPLATES_MAP } from '../config.ts';
import { Command } from '../core/command.ts';
import {
  copy,
  findPackageRoot,
  setupReactComponent,
  setupWebpack,
  writeDoneTip,
} from '../utils.ts';

export class TemplateCommand extends Command {
  async execute() {
    const { template } = this.context;
    const { root, packageName, pkgManager, ignore = [] } = this.context;

    console.log(`\n🔍 Creating ${template} in ${root}...`);

    const templateRelativePath = TEMPLATES_MAP.get(template);

    if (!templateRelativePath) {
      throw new Error(`Template path not found for: ${template}`);
    }

    const packageRoot = findPackageRoot(
      path.dirname(fileURLToPath(import.meta.url)),
    );
    const templateDir = path.join(
      packageRoot,
      'templates',
      templateRelativePath,
    );

    if (!fs.existsSync(templateDir)) {
      throw new Error(`Template directory not found at: ${templateDir}`);
    }

    const write = (file: string, content?: string) => {
      const targetPath = path.join(root, renameFiles[file] ?? file);

      if (content !== undefined) {
        fs.writeFileSync(targetPath, content);
      } else {
        copy(
          path.join(templateDir, file),
          targetPath,
          [...ignore, ...TEMPLATE_IGNORE],
          renameFiles,
        );
      }
    };

    const files = fs.readdirSync(templateDir);

    for (const file of files.filter(
      (f) => ![...ignore, ...TEMPLATE_IGNORE, 'package.json'].includes(f),
    )) {
      write(file);
    }

    if (template === 'react-component-ts') {
      setupReactComponent(root, packageName);
      writeDoneTip(root, pkgManager);
      return;
    }

    if (template === 'webpack-plugin') {
      setupWebpack(root, packageName);
    }

    const pkg = JSON.parse(
      fs.readFileSync(path.join(templateDir, 'package.json'), 'utf-8'),
    );

    pkg.name = packageName;

    write('package.json', `${JSON.stringify(pkg, null, 2)}\n`);

    writeDoneTip(root, pkgManager);
  }
}
