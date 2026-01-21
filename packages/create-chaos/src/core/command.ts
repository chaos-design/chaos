import fs from 'node:fs';
import path from 'node:path';
import { copy } from '../utils.ts';
import type { CommandContext } from './context.ts';

export abstract class Command {
  protected context: CommandContext;

  constructor(context: CommandContext) {
    this.context = context;
  }

  abstract execute(): Promise<void>;

  protected write(templateDir: string, file: string, content?: string) {
    const { root } = this.context;
    const targetPath = path.join(root, file);

    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  }
}
