import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { resolveTemplate, TEMPLATE_PRESETS } from '../config.ts';
import type { CommandContext } from '../core/context.ts';
import {
  emptyDir,
  formatTargetDir,
  isEmpty,
  isValidPackageName,
  toValidPackageName,
} from '../utils.ts';
import { getWebAppHtml, type WebTemplateOption } from '../web/web-app.ts';
import { TemplateCommand } from './template.ts';

const HOST = '127.0.0.1';
const MAX_BODY_SIZE = 32 * 1024;
const WEB_TEMPLATE_EXCLUSIONS = new Set(['custom', 'skill']);
const PACKAGE_MANAGERS = new Set(['npm', 'pnpm', 'yarn', 'bun']);
const WEB_CATEGORY_LABELS_ZH: Record<string, string> = {
  browser: '浏览器',
  docs: '文档',
  library: '库',
  react: 'React',
  repository: '仓库',
  vscode: 'VS Code',
  webpack: 'Webpack',
};
const WEB_TEMPLATE_COPY_ZH: Record<
  string,
  { description: string; title: string }
> = {
  'browser-extension-wxt': {
    title: 'WXT 浏览器扩展',
    description:
      '基于 React、TypeScript、Tailwind CSS 和 shadcn/ui 的跨浏览器扩展。',
  },
  'react-ts': {
    title: 'TypeScript 项目',
    description: '基于 Vite、React 和 TypeScript 的前端项目。',
  },
  'react-component-ts': {
    title: 'React 组件',
    description: '包含局部 Sass 样式的轻量 React 组件模板。',
  },
  'react-next-shadcn': {
    title: 'Next.js + shadcn/ui',
    description: '集成 App Router、Tailwind CSS 和 shadcn/ui。',
  },
  'react-next-supabase': {
    title: 'Next.js + Supabase',
    description: '集成 Supabase SSR 邮箱认证、App Router 和 shadcn/ui。',
  },
  'library-ts': {
    title: 'TypeScript 库',
    description: '使用 tsup 构建的可发布 TypeScript 库。',
  },
  'library-react-component-ts': {
    title: 'React 组件库',
    description: '包含测试和调试演示环境的 React 组件库。',
  },
  'webpack-plugin': {
    title: 'Webpack 插件',
    description: '包含类型定义和可运行示例的 Webpack 插件。',
  },
  'vscode-extension': {
    title: 'VS Code 扩展',
    description: '包含 React Webview 的 VS Code 扩展模板。',
  },
  monorepo: {
    title: 'Monorepo 仓库',
    description: '包含共享工程配置的 pnpm workspace 仓库。',
  },
  docs: {
    title: '文档站点',
    description: '基于 Next.js 和 Fumadocs 的文档站点。',
  },
};

interface WebCommandOptions {
  cwd: string;
  initialTargetDir: string;
  openBrowser: boolean;
  packageManager: string;
  port: number;
}

interface GenerateRequest {
  overwrite?: boolean;
  packageManager?: string;
  packageName?: string;
  targetDir?: string;
  template?: string;
}

class WebRequestError extends Error {
  code: string;
  root?: string;
  status: number;

  constructor(status: number, code: string, message: string, root?: string) {
    super(message);
    this.name = 'WebRequestError';
    this.status = status;
    this.code = code;
    this.root = root;
  }
}

function isPathInside(parent: string, candidate: string) {
  const relative = path.relative(parent, candidate);
  return (
    relative === '' ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== '..' &&
      !path.isAbsolute(relative))
  );
}

function getDisplayCwd(cwd: string) {
  const resolvedCwd = fs.realpathSync(cwd);
  const homeDir = fs.realpathSync(os.homedir());

  if (resolvedCwd === homeDir) {
    return '~';
  }

  if (isPathInside(homeDir, resolvedCwd)) {
    const relativePath = path.relative(homeDir, resolvedCwd);
    return `~/${relativePath.split(path.sep).join('/')}`;
  }

  return resolvedCwd.split(path.sep).join('/');
}

function findExistingAncestor(target: string) {
  let current = target;

  while (!fs.existsSync(current)) {
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return current;
}

function hasSymbolicLink(parent: string, target: string) {
  const relative = path.relative(parent, target);
  let current = parent;

  for (const segment of relative.split(path.sep)) {
    current = path.join(current, segment);

    if (!fs.existsSync(current)) {
      return false;
    }

    if (fs.lstatSync(current).isSymbolicLink()) {
      return true;
    }
  }

  return false;
}

function resolveTargetRoot(cwd: string, rawTargetDir: string) {
  const targetDir = formatTargetDir(rawTargetDir);

  if (!targetDir) {
    throw new WebRequestError(
      400,
      'INVALID_TARGET',
      'Enter an output directory.',
    );
  }

  if (targetDir === '.' || path.isAbsolute(targetDir)) {
    throw new WebRequestError(
      400,
      'INVALID_TARGET',
      'The web composer only writes to a child directory.',
    );
  }

  if (
    targetDir.split(/[\\/]/).includes('..') ||
    !/^[a-zA-Z0-9._\-/]+$/.test(targetDir)
  ) {
    throw new WebRequestError(
      400,
      'INVALID_TARGET',
      'The output directory contains unsupported characters.',
    );
  }

  const resolvedCwd = fs.realpathSync(cwd);
  const root = path.resolve(resolvedCwd, targetDir);

  if (root === resolvedCwd || !isPathInside(resolvedCwd, root)) {
    throw new WebRequestError(
      400,
      'INVALID_TARGET',
      'The output directory must be inside the working directory.',
    );
  }

  if (hasSymbolicLink(resolvedCwd, root)) {
    throw new WebRequestError(
      400,
      'INVALID_TARGET',
      'Symbolic links are not supported in the output directory.',
    );
  }

  const ancestorPath = findExistingAncestor(root);
  const existingAncestor = fs.realpathSync(ancestorPath);
  if (!isPathInside(resolvedCwd, existingAncestor)) {
    throw new WebRequestError(
      400,
      'INVALID_TARGET',
      'The output directory resolves outside the working directory.',
    );
  }

  return { root, targetDir };
}

function getWebTemplates() {
  return TEMPLATE_PRESETS.filter(
    (preset) =>
      !WEB_TEMPLATE_EXCLUSIONS.has(preset.name) && !preset.customCommand,
  ).map<WebTemplateOption>((preset) => {
    const copyZh = WEB_TEMPLATE_COPY_ZH[preset.name];

    return {
      alias: preset.showName || preset.name,
      category: preset.category,
      categoryLabel: preset.categoryDisplay,
      categoryLabelZh:
        WEB_CATEGORY_LABELS_ZH[preset.category] || preset.categoryDisplay,
      description: preset.description,
      descriptionZh: copyZh?.description || preset.description,
      id: preset.name,
      title: preset.display,
      titleZh: copyZh?.title || preset.display,
    };
  });
}

function getDefaultPackageManager(packageManager: string) {
  return PACKAGE_MANAGERS.has(packageManager) ? packageManager : 'pnpm';
}

function getNextCommands(
  root: string,
  targetDir: string,
  packageManager: string,
) {
  const commands = [`cd ${targetDir}`];
  const packageJsonPath = path.join(root, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return commands;
  }

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as {
    scripts?: Record<string, string>;
  };
  const nextScript = ['dev', 'start', 'compile'].find(
    (script) => pkg.scripts?.[script],
  );

  commands.push(
    packageManager === 'yarn' ? 'yarn' : `${packageManager} install`,
  );

  if (nextScript) {
    commands.push(
      packageManager === 'yarn'
        ? `yarn ${nextScript}`
        : `${packageManager} run ${nextScript}`,
    );
  }

  return commands;
}

async function readJsonBody(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;

    if (size > MAX_BODY_SIZE) {
      throw new WebRequestError(
        413,
        'BODY_TOO_LARGE',
        'The request body is too large.',
      );
    }

    chunks.push(buffer);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf-8')) as unknown;
  } catch {
    throw new WebRequestError(
      400,
      'INVALID_JSON',
      'The request body must be valid JSON.',
    );
  }
}

function sendJson(
  response: ServerResponse,
  status: number,
  body: Record<string, unknown>,
) {
  response.writeHead(status, {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify(body));
}

function sendError(response: ServerResponse, error: unknown) {
  if (error instanceof WebRequestError) {
    sendJson(response, error.status, {
      code: error.code,
      message: error.message,
      ...(error.root ? { root: error.root } : {}),
    });
    return;
  }

  const message = error instanceof Error ? error.message : String(error);
  sendJson(response, 500, {
    code: 'GENERATION_FAILED',
    message,
  });
}

function validateGenerateRequest(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new WebRequestError(
      400,
      'INVALID_REQUEST',
      'The request body must be an object.',
    );
  }

  return value as GenerateRequest;
}

function resolveWebPreset(template: string | undefined) {
  const preset = resolveTemplate(template);

  if (
    !preset ||
    WEB_TEMPLATE_EXCLUSIONS.has(preset.name) ||
    preset.customCommand
  ) {
    throw new WebRequestError(
      400,
      'INVALID_TEMPLATE',
      'Select a template available in the web composer.',
    );
  }

  return preset;
}

function getDisplayRoot(cwd: string, targetDir: string) {
  const displayCwd = getDisplayCwd(cwd).replace(/\/+$/, '');
  return `${displayCwd}/${targetDir.replaceAll('\\', '/')}`;
}

function ensureWritableTarget(
  root: string,
  overwrite: boolean,
  displayRoot: string,
) {
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
    return;
  }

  if (!fs.statSync(root).isDirectory()) {
    throw new WebRequestError(
      400,
      'TARGET_IS_FILE',
      'The output path points to a file.',
      displayRoot,
    );
  }

  if (isEmpty(root)) {
    return;
  }

  if (!overwrite) {
    throw new WebRequestError(
      409,
      'TARGET_NOT_EMPTY',
      'The output directory is not empty.',
      displayRoot,
    );
  }

  emptyDir(root);
}

async function generateTemplate(
  body: GenerateRequest,
  options: WebCommandOptions,
) {
  const preset = resolveWebPreset(body.template);
  const { root, targetDir } = resolveTargetRoot(
    options.cwd,
    body.targetDir || '',
  );
  const packageName =
    typeof body.packageName === 'string' ? body.packageName.trim() : '';

  if (!isValidPackageName(packageName)) {
    throw new WebRequestError(
      400,
      'INVALID_PACKAGE_NAME',
      'Enter a valid lowercase npm package name.',
    );
  }

  const packageManager =
    typeof body.packageManager === 'string' &&
    PACKAGE_MANAGERS.has(body.packageManager)
      ? body.packageManager
      : options.packageManager;
  const displayRoot = getDisplayRoot(options.cwd, targetDir);

  ensureWritableTarget(root, body.overwrite === true, displayRoot);

  const context: CommandContext = {
    root,
    targetDir,
    packageName,
    template: preset.name,
    pkgManager: packageManager,
    ignore: preset.ignore,
  };

  await new TemplateCommand(context).execute();

  return {
    nextCommands: getNextCommands(root, targetDir, packageManager),
    packageName,
    root: displayRoot,
    targetDir,
    template: preset.name,
  };
}

function openBrowser(url: string) {
  const command =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'cmd'
        : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  const child = spawn(command, args, {
    detached: true,
    stdio: 'ignore',
    windowsVerbatimArguments: process.platform === 'win32',
  });

  child.once('error', () => {
    console.log(`Could not open the browser automatically. Open ${url}`);
  });
  child.unref();
}

function getInitialPackageName(targetDir: string) {
  const basename = path.basename(targetDir);
  return toValidPackageName(basename) || 'chaos-project';
}

function isAllowedOrigin(request: IncomingMessage, origin: string) {
  const requestOrigin = request.headers.origin;
  return !requestOrigin || requestOrigin === origin;
}

function hasValidToken(request: IncomingMessage, token: string) {
  return request.headers['x-chaos-token'] === token;
}

export class WebCommand {
  private options: WebCommandOptions;

  constructor(options: WebCommandOptions) {
    this.options = {
      ...options,
      packageManager: getDefaultPackageManager(options.packageManager),
    };
  }

  async execute() {
    const token = randomBytes(24).toString('base64url');
    let origin = '';
    const server = createServer((request, response) => {
      void this.handleRequest(request, response, origin, token).catch(
        (error: unknown) => {
          sendError(response, error);
        },
      );
    });

    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(this.options.port, HOST, () => {
        server.off('error', reject);
        resolve();
      });
    });

    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Could not determine the web composer address.');
    }

    origin = `http://${HOST}:${address.port}`;
    console.log(`\nChaos Composer is running at ${origin}`);
    console.log('Press Ctrl+C to stop it.\n');

    if (this.options.openBrowser) {
      openBrowser(origin);
    }

    await new Promise<void>((resolve) => {
      let closing = false;
      const close = () => {
        if (closing) {
          return;
        }
        closing = true;
        server.close(() => resolve());
      };

      process.once('SIGINT', close);
      process.once('SIGTERM', close);
    });
  }

  private async handleRequest(
    request: IncomingMessage,
    response: ServerResponse,
    origin: string,
    token: string,
  ) {
    const url = new URL(request.url || '/', origin || `http://${HOST}`);

    if (request.method === 'GET' && url.pathname === '/') {
      const initialTargetDir =
        formatTargetDir(this.options.initialTargetDir) || 'chaos-project';
      const html = getWebAppHtml({
        defaultPackageManager: this.options.packageManager,
        displayCwd: getDisplayCwd(this.options.cwd),
        initialPackageName: getInitialPackageName(initialTargetDir),
        initialTargetDir,
        templates: getWebTemplates(),
        token,
      });

      response.writeHead(200, {
        'cache-control': 'no-store',
        'content-security-policy': `default-src 'none'; script-src 'nonce-${token}'; style-src 'unsafe-inline'; connect-src 'self'; img-src data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
        'content-type': 'text/html; charset=utf-8',
        'referrer-policy': 'no-referrer',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
      });
      response.end(html);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/health') {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/favicon.ico') {
      response.writeHead(204, { 'cache-control': 'public, max-age=86400' });
      response.end();
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/generate') {
      if (!isAllowedOrigin(request, origin) || !hasValidToken(request, token)) {
        throw new WebRequestError(
          403,
          'FORBIDDEN',
          'The local session token is invalid.',
        );
      }

      if (!request.headers['content-type']?.startsWith('application/json')) {
        throw new WebRequestError(
          415,
          'UNSUPPORTED_MEDIA_TYPE',
          'Use application/json for generation requests.',
        );
      }

      const body = validateGenerateRequest(await readJsonBody(request));
      const result = await generateTemplate(body, this.options);
      sendJson(response, 201, { success: true, ...result });
      return;
    }

    sendJson(response, 404, {
      code: 'NOT_FOUND',
      message: 'Route not found.',
    });
  }
}

export function parseWebPort(value: string | undefined) {
  if (value === undefined) {
    return 0;
  }

  if (!/^\d+$/.test(value)) {
    throw new Error('The web composer port must be a number.');
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new Error('The web composer port must be between 0 and 65535.');
  }

  return port;
}
