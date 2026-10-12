# Chaos Template Gallery

一个零依赖的静态页面：浏览 create-chaos 的全部模板，选中后即可复制一条可直接执行的 CLI 命令，基于该模板创建项目。

## 本地运行

站点为纯静态文件（无构建步骤、无运行时依赖），任意静态服务器均可：

```bash
# 方式一：Python（macOS / Linux 自带）
cd site
python3 -m http.server 5173
# 打开 http://localhost:5173

# 方式二：Node
npx serve site
```

也可以直接双击 `index.html` 在浏览器中打开（数据通过 `<script>` 注入，不使用 fetch，`file://` 协议下同样可用）。

## 使用方法

1. 选择包管理器（npm / pnpm / yarn / bun）。
2. 输入项目目录名（留空时回退为 CLI 默认值 `chaos-project`）。
3. 点击任意模板卡片，底部命令栏实时生成对应的创建命令。
4. 点击「复制命令」，在终端粘贴执行即可完成项目创建。

命令形式与仓库 README 中的用法一致：npm 7+、yarn、pnpm 需要通过 `--` 传递参数，bun 直接传递。

## 目录结构

```text
site/
|-- index.html                 # 页面
|-- assets/
|   |-- styles.css             # 样式（与 Web Composer 同一套设计变量）
|   `-- app.js                 # 模板渲染、命令生成、复制逻辑
|-- data/
|   `-- templates.js           # 生成文件：模板数据（window.CHAOS_TEMPLATES）
`-- scripts/
    `-- sync-templates.mjs     # 从 CLI 配置重新生成 data/templates.js
```

## 数据同步

`data/templates.js` 由脚本从 CLI 的唯一数据源
`packages/create-chaos/src/config.ts` 的 `FRAMEWORKS` 数组生成，不会与 CLI
实际发布的模板脱节。在 CLI 中新增、修改或删除模板后，重新生成并提交：

```bash
node site/scripts/sync-templates.mjs
```

脚本仅使用 Node 标准库，无需安装依赖。CI 或本地可用 `--check` 模式校验数据
文件是否与 CLI 配置一致（不一致时以非零退出码失败）：

```bash
node site/scripts/sync-templates.mjs --check
```

## 设计说明

- 视觉语言沿用 `create-chaos web`（Chaos Composer）的设计变量：纸色背景、
  墨色文字、橙色强调色，保证产品家族的一致性。
- 模板卡片为原生 `<button>`，支持键盘操作；筛选框按标题、别名、分类和描述
  过滤。
- 复制功能三级降级：优先 `navigator.clipboard`，其次 `execCommand('copy')`
  （`file://` 等非安全上下文），两者都不可用时自动选中命令文本，提示用户按
  Ctrl/⌘ + C。
