import fs from 'node:fs';
import path from 'node:path';

export function formatTargetDir(targetDir: string | undefined) {
  return targetDir?.trim().replace(/\/+$/g, '');
}

export function copy(src: string, dest: string) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

export function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName,
  );
}

export function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z\d\-~]+/g, '-');
}

export function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true });

  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);

    copy(srcFile, destFile);
  }
}

export function isEmpty(path: string) {
  const files = fs.readdirSync(path);

  return files.length === 0 || (files.length === 1 && files[0] === '.git');
}

export function isObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const file of fs.readdirSync(dir)) {
    if (file === '.git') {
      continue;
    }

    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}

export function pkgFromUserAgent(userAgent: string | undefined) {
  if (!userAgent) {
    return undefined;
  }

  const pkgSpec = userAgent.split(' ')[0];
  const pkgSpecArr = pkgSpec.split('/');

  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
}

export function setupReactComponent(root: string, name: string) {
  editFile(path.resolve(root, 'index.tsx'), (content) => {
    return content
      .replace(
        /ComponentNameContainer/g,
        `${kebabCase2CamelCase(name)}Container`,
      )
      .replace(/ComponentName/g, kebabCase2UpperCamelCase(name));
  });

  editFile(path.resolve(root, 'index.module.scss'), (content) => {
    return content.replace(/ComponentName/g, kebabCase2CamelCase(name));
  });
}

// export function setupReactSwc(root: string, isTs: boolean) {
//   editFile(path.resolve(root, 'package.json'), (content) => {
//     return content.replace(
//       /"@vitejs\/plugin-react": ".+?"/,
//       '"@vitejs/plugin-react-swc": "^3.0.0"',
//     );
//   });

//   editFile(
//     path.resolve(root, `vite.config.${isTs ? 'ts' : 'js'}`),
//     (content) => {
//       return content.replace('@vitejs/plugin-react', '@vitejs/plugin-react-swc')
//     },
//   )
// }

export function editFile(file: string, callback: (content: string) => string) {
  const content = fs.readFileSync(file, 'utf-8');

  fs.writeFileSync(file, callback(content), 'utf-8');
}

export function kebabCase2UpperCamelCase(word: string) {
  return word.replace(/(^|\s|-)\w/g, (match: string) =>
    match.replace(/-|\s/g, '').toUpperCase(),
  );
}

export function kebabCase2CamelCase(word: string) {
  return word.replace(/-([a-zA-Z\d])/g, (match, letter) =>
    letter.toUpperCase(),
  );
}
