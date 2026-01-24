// eslint-disable-next-line import/no-nodejs-modules

import { execSync } from 'node:child_process';
import { getChangedPackages } from '@chaos-design/utils-pkg';
import { fs } from 'zx';

const changedPackages = getChangedPackages();

const changed = changedPackages.map((c) => c.path).join(' ');
const bv_cmd = `npx bumpp -r ${changed} --quiet`;

const build = (changedPackages || [])
  .map((item) => {
    const pathArray = item.path.split('/');
    pathArray.pop();

    return pathArray.join('/');
  })
  .filter(Boolean)
  .map((item) => `--filter="./${item}"`);

const buildConfig = `#!/bin/bash

pnpm -r ${build.join(' ')} exec pnpm publish --access public --no-git-checks
`;

await fs.writeFileSync('./scripts/publish-to-npm.sh', buildConfig);

execSync('chmod +x ./scripts/publish-to-npm.sh');

console.log(`execSync ${bv_cmd}`);

execSync(bv_cmd, { stdio: 'inherit' });
