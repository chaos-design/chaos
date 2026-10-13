<div align="center">
  <img src="assets/chaos-banner.png" alt="Chaos — 下一代前端工具链" width="100%" />
</div>

<div align="center">

[![npm version](https://img.shields.io/npm/v/create-chaos.svg?label=版本)](https://www.npmjs.com/package/create-chaos)
[![npm downloads](https://img.shields.io/npm/dm/create-chaos.svg)](https://www.npmjs.com/package/create-chaos)
[![license](https://img.shields.io/npm/l/create-chaos.svg)](./LICENSE)

**[简体中文](./README.md)** | [English](./README.en.md)

</div>

# Chaos ⚡

> 下一代前端工具链。一条命令，产出生产级工程。

Chaos 是一个 CLI 脚手架工具。一条命令即可得到一个**结构正确、依赖正确、默认配置正确**的
工程 —— 而不是给你一个还需要自己收尾的 `npm init` 空壳。

```bash
npm create chaos@latest my-app -- --template react
```

## 📋 目录

- [为什么选择 Chaos](#-为什么选择-chaos)
- [安装](#-安装)
- [使用](#-使用)
  - [交互模式](#交互模式)
  - [模板与短命令](#模板与短命令)
  - [可视化编排台](#可视化编排台)
  - [自定义模板](#自定义模板)
  - [Skills](#skills)
- [CLI 参数参考](#-cli-参数参考)
- [环境要求](#-环境要求)
- [项目结构](#-项目结构)
- [文档](#-文档)
- [参与贡献](#-参与贡献)
- [开源协议](#-开源协议)

## ✨ 为什么选择 Chaos

- **🚀 一条命令，一次到位** —— 每个模板都已配置好 Biome、TypeScript 和 `.gitignore`，
  不需要任何手动设置。
- **🧠 精选，而非爬取** —— 12 个模板，覆盖 React、Next.js、库、浏览器扩展、VS Code 扩展、
  Monorepo 与文档站，全部经过实战验证。
- **🖥️ 可视化编排台** —— 本地 Web UI 用来浏览模板、配置输出，并在生成前看到等价的 CLI 命令，
  所见即可所得。
- **🔌 可扩展** —— 通过配置文件把任意本地目录当作模板使用。
- **📦 极轻** —— CLI 内联自身依赖，安装后除 `c12` 外不引入额外依赖树。
- **🌍 中英双语界面** —— 可视化编排台支持中英切换。

## 📦 安装

无需全局安装，使用你习惯的包管理器 `create` 命令即可：

```bash
# npm
npm create chaos@latest

# pnpm
pnpm create chaos

# yarn
yarn create chaos

# bun
bun create chaos
```

也可以选择全局安装二进制（同时提供 `create-chaos` 和 `chaos` 两个命令）：

```bash
npm install -g create-chaos
```

## 🚀 使用

### 交互模式

不带参数运行，按提示作答：

```bash
npm create chaos@latest
```

你会先被询问项目名，然后在一个分组列表里选择模板。如果目标目录已存在且非空，Chaos
会先征求你的同意再删除其中内容。

同时传入**项目名和模板名**可以完全跳过交互：

```bash
npm create chaos@latest my-app --template react
```

> 使用 npm 6 时无需额外的 `--`；npm 7+ 以及 yarn / pnpm 请直接传递参数。

使用 `.` 作为项目名，可直接在当前目录创建工程：

```bash
npm create chaos@latest . --template lib
```

### 模板与短命令

每个模板都有长名称和短别名，两者都能用于 `--template` / `-t`。

| 分类 | 模板 | 短命令 | 生成内容 |
| --- | --- | --- | --- |
| **React** | `react-ts` | `react` | Vite + React + TypeScript 应用 |
| | `react-component-ts` | `reactc` | 单一 React 组件 + scoped Sass 样式 |
| **Next.js** | `react-next-shadcn` | `next-shadcn` | Next.js App Router + Tailwind + shadcn/ui |
| | `react-next-supabase` | `next-supabase` | Next.js + Supabase SSR 登录 + Tailwind + shadcn/ui |
| **Browser** | `browser-extension-wxt` | `wxt` | WXT + React + Tailwind 跨浏览器扩展 |
| **Library** | `library-ts` | `lib` | 可发布的 TypeScript 库（tsup） |
| | `library-react-component-ts` | `libc` | 带 playground 的 React 组件库 |
| **Webpack** | `webpack-plugin` | `wp` | 类型化 Webpack 插件 + 可运行 demo |
| **VS Code** | `vscode-extension` | `vse` | 带 React webview 的 VS Code 扩展 |
| **Repo** | `monorepo` | `monorepo` | pnpm workspace Monorepo |
| **Docs** | `docs` | `docs` | Next.js + Fumadocs 文档站 |
| **其他** | `custom` | — | 从你自己的本地模板生成 |

> Agent Skill 模板已移除，请前往 [chaos-design/skills](https://github.com/chaos-design/skills) 获取。

```bash
# Vite + React 应用
npm create chaos@latest my-app -t react

# VS Code 扩展
npm create chaos@latest my-ext -t vse

# 文档站
npm create chaos@latest my-docs -t docs
```

### 可视化编排台

一个零依赖的本地 Web UI，用来浏览模板、配置输出：

```bash
npm create chaos@latest web

# 指定端口启动且不自动打开浏览器
npm create chaos@latest web --no-open --port 4173

# 预填输出目录
npm create chaos@latest web my-app
```

编排台具备以下能力：

- 支持 **中文与 English** 切换；
- 显示当前选择对应的 **等价 CLI 命令**，所以在界面上配置好的结果可以直接写进脚本；
- 从你**启动命令时所在的确切目录**解析输出路径，且只会写入它的**子目录**
  （不允许 `.`、`..`、绝对路径，也不允许通过软链接逃逸）；
- 覆盖已存在的文件前必须明确确认。

它只绑定 `127.0.0.1`，并要求每个会话携带一次性 token，因此无法从局域网内的其他机器访问。

### 自定义模板

把任意本地目录当作模板。添加 `chaos.config.[js|mjs|cjs|ts]` 文件，或在
`package.json` 中添加 `chaos` 字段：

```jsonc
// package.json
{
  "chaos": {
    "template": [
      { "name": "gallery", "path": "../../templates/gallery" }
    ]
  }
}
```

```ts
// chaos.config.ts
export default {
  template: [
    {
      name: 'config gallery',
      path: '../../../gallery',
      ignore: ['node_modules', '.git'],
      renameFiles: { 'README.md': 'README.zh.md' },
      replace: (file, content, packageName) =>
        file.includes('gitignore') ? `${content}\nchaos` : content,
    },
  ],
};
```

然后：

```bash
npm create chaos@latest my-app --custom
```

指定已配置的模板名可以跳过选择器，位置参数或 `-t` 都行：

```bash
npm create chaos@latest my-app --custom gallery
npm create chaos@latest my-app -t gallery --custom
```

没有配置文件时，Chaos 会直接提示输入模板路径。当 `package.json#chaos` 与
`chaos.config.*` 文件同时存在时，两份配置会被合并。
完整选项见 [docs/custom-templates.md](docs/custom-templates.md)。

### Skills

Skill 模板已从 CLI 中移除。Agent Skill 现在在独立仓库中维护，请前往
**[chaos-design/skills](https://github.com/chaos-design/skills)** 浏览、安装与贡献。

## 🔧 CLI 参数参考

```
Usage: create-chaos [OPTION]... [DIRECTORY]

Options:
  -t, --template NAME        use a specific template
  -c, --custom               create from a local custom template
  -w, --web                  open the visual template composer
      --port NUMBER          use a specific composer port
      --no-open              start the composer without opening a browser
  -h, --help                 display this help
```

示例：

```bash
create-chaos                              # 完全交互式
create-chaos my-app -t react              # 非交互式
create-chaos . -t lib                     # 在当前目录创建
create-chaos my-app --custom              # 使用本地模板
create-chaos web --port 4173              # 可视化编排台
```

## 📋 环境要求

| 依赖 | 版本 |
| --- | --- |
| Node.js | **>= 24.0.0**（CLI 与全部模板的统一下限） |
| pnpm / npm / yarn / bun | 任意较新版本 |

CLI 会从 `npm_config_user_agent` 识别你使用的包管理器，并打印对应的安装 / 运行命令。

## 🏗️ 项目结构

```
chaos/
├── assets/                          # README 头图（SVG 源 + PNG 产物）
├── docs/                            # 扩展文档
├── packages/
│   └── create-chaos/                # 对外发布的 CLI 包
│       ├── src/
│       │   ├── index.ts             # 参数解析与交互流程
│       │   ├── config.ts            # 模板的唯一事实来源
│       │   ├── core/                # 命令执行与上下文
│       │   ├── commands/            # template / custom / web
│       │   └── web/web-app.ts       # 可视化编排台
│       └── templates/               # 会被复制进工程的全部内容
└── scripts/                         # 发布与校验脚本
    ├── verify-pack.mjs              # 断言 npm 包可发布
    └── render-banner.mjs            # 由 SVG 渲染 README 头图
```

## 📚 文档

| 文档 | 内容 |
| --- | --- |
| [docs/usage.md](docs/usage.md) | 各模式的完整使用指南 |
| [docs/templates.md](docs/templates.md) | 每个模板包含哪些内容 |
| [docs/custom-templates.md](docs/custom-templates.md) | 复用你自己的模板 |
| [docs/development.md](docs/development.md) | 本地开发与新增模板 |
| [docs/publishing.md](docs/publishing.md) | 版本管理与 npm 发布流程 |

## 🤝 参与贡献

```bash
git clone https://github.com/chaos-design/chaos.git
cd chaos
pnpm install
pnpm run build
```

| 命令 | 作用 |
| --- | --- |
| `pnpm run build` | 使用 unbuild 构建 CLI |
| `pnpm run typecheck` | 类型检查 CLI 源码 |
| `pnpm run lint` | Biome 检查 |
| `pnpm run format` | Biome 格式化 |
| `pnpm run verify:pack` | 断言 npm tarball 可发布 |
| `pnpm run verify:custom` | 校验 `--custom` 的错误处理与重命名 |
| `pnpm run banner` | 由 SVG 重新渲染 README 头图 |
| `pnpm test` | typecheck + lint + verify:pack + verify:custom |

代码风格与检查使用 [Biome](https://biomejs.dev/)。提交 Pull Request 前请先阅读
[CONTRIBUTING.md](CONTRIBUTING.md)。

## 📄 开源协议

[MIT](./LICENSE) © Chaos Design