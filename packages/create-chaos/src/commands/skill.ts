import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { red, reset } from 'kolorist';
import prompts from 'prompts';
import { colors, renameFiles } from '../config.ts';
import { Command } from '../core/command.ts';
import { findPackageRoot } from '../utils.ts';

export class SkillCommand extends Command {
  async execute() {
    const { root, packageName } = this.context;

    const packageRoot = findPackageRoot(
      path.dirname(fileURLToPath(import.meta.url)),
    );
    const skillsDir = path.join(packageRoot, 'templates/skills');
    const skills = fs
      .readdirSync(skillsDir)
      .filter((f) => fs.statSync(path.join(skillsDir, f)).isDirectory());

    let skillName = '';
    try {
      const result = await prompts(
        [
          {
            type: 'autocomplete',
            name: 'skillName',
            message: reset('Select a skill:'),
            choices: skills.map((skill) => {
              const skillColor = colors[(Math.random() * colors.length) | 0];
              return {
                title: skillColor(skill),
                value: skill,
              };
            }),
            suggest: async (input: string, choices: any[]) => {
              const keyword = input.toLowerCase();
              return choices.filter((choice) =>
                choice.title.toLowerCase().includes(keyword),
              );
            },
          },
        ],
        {
          onCancel: () => {
            throw new Error(`${red('✖')} Operation cancelled`);
          },
        },
      );
      skillName = result.skillName;
    } catch (cancelled: any) {
      console.log(cancelled.message);
      return;
    }

    const templateDir = path.join(skillsDir, skillName);
    const projectName = packageName; // Use packageName from context

    const processSkillFiles = (srcDir: string, destDir: string) => {
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      const items = fs.readdirSync(srcDir);
      for (const item of items) {
        const srcPath = path.join(srcDir, item);
        const destPath = path.join(destDir, renameFiles[item] ?? item);
        const stat = fs.statSync(srcPath);

        if (stat.isDirectory()) {
          processSkillFiles(srcPath, destPath);
        } else {
          let content = fs.readFileSync(srcPath, 'utf-8');
          content = content.replace(/{{PROJECT_NAME}}/g, projectName);
          fs.writeFileSync(destPath, content);
        }
      }
    };

    // Create a new directory for the skill in the current root
    const targetSkillDir = path.join(root, skillName);

    processSkillFiles(templateDir, targetSkillDir);

    console.log(`\n✅ Skill "${skillName}" created in ${targetSkillDir}.`);
    console.log(
      '\nNow you can check the SKILL.md file for usage instructions.\n',
    );
  }
}
