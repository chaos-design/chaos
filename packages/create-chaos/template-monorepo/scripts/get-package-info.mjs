import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * 递归获取指定路径下的所有包的名称和版本
 * @param {string} dir - 当前目录路径
 * @param {Array} packages - 存放包信息的数组
 * @returns {Array} - 包名称和版本的数组
 */

const ignore = ['node_modules'];

function getPackages(dir, packages = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const itemPath = path.join(dir, item);

    if (ignore.includes(item)) {
      continue;
    }

    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      getPackages(itemPath, packages);
    } else if (item === 'package.json') {
      const pkgJson = JSON.parse(fs.readFileSync(itemPath, 'utf-8'));

      packages.push({
        name: pkgJson.name,
        version: pkgJson.version,
        description: pkgJson.description,
      });
    }
  }

  return packages;
}

function main() {
  const workspacePath = path.resolve('packages');
  const packages = getPackages(workspacePath);

  let markdownTable =
    '# 包版本信息\n\n| Package Name | Description | Version    |\n|--------------|------------|------------|\n';

  packages.forEach((pkg) => {
    markdownTable += `| ${pkg.name || 'Who am I?😱'} | ${
      pkg.description || 'The information has gone, 💣 ...'
    } | ${pkg.version || "I don't know too. 😳"} |\n`;
  });

  console.log(packages, markdownTable);

  fs.writeFileSync('packages.md', markdownTable, 'utf-8');
}

main();
