import {
  copyFile,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const appConfigPath = path.join(projectRoot, 'config/app-config.json');
const packageJsonPath = path.join(projectRoot, 'package.json');
const packageLockPath = path.join(projectRoot, 'package-lock.json');
const iconOutputPath = path.join(projectRoot, 'public/icon');
const iconSizes = [16, 32, 48, 96, 128];
const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function slugify(value) {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createShortName(value) {
  return value.trim().split(/\s+/)[0]?.toUpperCase().slice(0, 12) ?? '';
}

function isPackageName(value) {
  return /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(value);
}

function normalizeGithubRepositoryUrl(value) {
  return value
    .trim()
    .replace(/\/+$/, '')
    .replace(/\.git$/i, '');
}

function isGithubRepositoryUrl(value) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    return (
      url.protocol === 'https:' &&
      url.hostname === 'github.com' &&
      pathSegments.length === 2 &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function readJsonIfExists(filePath) {
  try {
    return await readJson(filePath);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

async function writeJsonAtomic(filePath, value) {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temporaryPath, filePath);
}

async function askText(message, defaultValue, validate = Boolean) {
  while (true) {
    const answer = (
      await readline.question(`${message} (${defaultValue}): `)
    ).trim();
    const value = answer || defaultValue;

    if (validate(value)) {
      return value;
    }

    console.log('输入值格式不正确，请重新输入。');
  }
}

async function askOptionalText(message, defaultValue, validate) {
  while (true) {
    const hint = defaultValue ? `${defaultValue}，输入 - 清空` : '可留空';
    const answer = (await readline.question(`${message} (${hint}): `)).trim();
    const value = answer === '-' ? '' : answer || defaultValue;

    if (validate(value)) {
      return value;
    }

    console.log('输入值格式不正确，请重新输入。');
  }
}

async function askIconPath() {
  while (true) {
    const answer = (
      await readline.question('图标源文件路径（留空则保留）：')
    ).trim();

    if (!answer) {
      return undefined;
    }

    const filePath = path.resolve(process.cwd(), answer);
    try {
      const metadata = await sharp(filePath).metadata();
      if (['jpeg', 'png', 'svg', 'webp'].includes(metadata.format)) {
        return filePath;
      }
    } catch {
      // The validation message below covers unreadable files.
    }

    console.log('请输入有效的 PNG、JPEG、WebP 或 SVG 文件路径。');
  }
}

async function writeIcons(sourcePath) {
  if (!sourcePath) {
    return;
  }

  const temporaryPath = path.join(
    projectRoot,
    '.artifacts',
    `setup-icons-${process.pid}`,
  );
  await mkdir(temporaryPath, { recursive: true });

  try {
    await Promise.all(
      iconSizes.map((size) =>
        sharp(sourcePath)
          .resize(size, size, {
            background: { alpha: 0, b: 0, g: 0, r: 0 },
            fit: 'contain',
          })
          .png()
          .toFile(path.join(temporaryPath, `${size}.png`)),
      ),
    );
    await mkdir(iconOutputPath, { recursive: true });
    await Promise.all(
      iconSizes.map((size) =>
        copyFile(
          path.join(temporaryPath, `${size}.png`),
          path.join(iconOutputPath, `${size}.png`),
        ),
      ),
    );
  } finally {
    await rm(temporaryPath, { force: true, recursive: true });
  }
}

try {
  const [currentConfig, packageJson, packageLock] = await Promise.all([
    readJson(appConfigPath),
    readJson(packageJsonPath),
    readJsonIfExists(packageLockPath),
  ]);

  console.log('项目初始化\n');
  const name = await askText('扩展名称', currentConfig.name);
  const packageName = await askText(
    'npm 包名',
    packageJson.name || slugify(name),
    isPackageName,
  );
  const shortName = await askText(
    '扩展简称（最多 12 个字符）',
    createShortName(name) || currentConfig.shortName,
    (value) => value.length > 0 && value.length <= 12,
  );
  const description = await askText('扩展描述', currentConfig.description);
  const githubRepositoryUrl = normalizeGithubRepositoryUrl(
    await askOptionalText(
      'GitHub 仓库地址',
      currentConfig.github?.repositoryUrl ?? '',
      isGithubRepositoryUrl,
    ),
  );
  const iconSourcePath = await askIconPath();
  const nextPackageJson = {
    ...packageJson,
    description,
    name: packageName,
  };

  if (githubRepositoryUrl) {
    nextPackageJson.bugs = {
      url: `${githubRepositoryUrl}/issues`,
    };
    nextPackageJson.homepage = `${githubRepositoryUrl}#readme`;
    nextPackageJson.repository = {
      type: 'git',
      url: `git+${githubRepositoryUrl}.git`,
    };
  } else {
    delete nextPackageJson.bugs;
    delete nextPackageJson.homepage;
    delete nextPackageJson.repository;
  }

  const writes = [
    writeJsonAtomic(appConfigPath, {
      ...currentConfig,
      description,
      documentTitle: name,
      github: {
        ...currentConfig.github,
        repositoryUrl: githubRepositoryUrl,
      },
      name,
      shortName,
    }),
    writeJsonAtomic(packageJsonPath, nextPackageJson),
    writeIcons(iconSourcePath),
  ];

  if (packageLock) {
    writes.push(
      writeJsonAtomic(packageLockPath, {
        ...packageLock,
        name: packageName,
        packages: {
          ...packageLock.packages,
          '': {
            ...packageLock.packages[''],
            name: packageName,
          },
        },
      }),
    );
  }

  await Promise.all(writes);

  console.log('\n项目配置已更新。请运行 check 脚本验证项目。');
} finally {
  readline.close();
}
