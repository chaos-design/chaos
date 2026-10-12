# Chaos Template Gallery

一个零依赖的静态页面：以 create-chaos CLI 终端交互的同款样式浏览全部模板，
选中后即可复制一条可直接执行的 CLI 命令，基于该模板创建项目。

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

页面主体是一块模拟 `create-chaos` CLI 的终端窗口，按 `prompts` 选择器的
视觉语言呈现（品红 `?`、灰色 `›`、青色 `❯` 指针、✔ 完成态）：

1. `Filter templates:` 输入关键词，按标题 / 别名 / 分类 / 描述过滤模板。
2. `Project name:` 填写项目目录名（留空时回退为 CLI 默认值 `chaos-project`）。
3. `Package manager:` 点击 npm / pnpm / yarn / bun 中的任意一个切换。
4. `Select a template:` 悬停或按 ↑/↓ 移动 `❯` 指针，点击或按 Enter 提交；
   指针所在行会像真实 CLI 一样显示 `分类 | 名称 | 别名` 与模板描述。
5. 底部命令栏实时生成创建命令，点击「复制命令」粘贴执行即可。

命令形式与仓库 README 中的用法一致：npm 7+、yarn、pnpm 需要通过 `--` 传递
参数，bun 直接传递。

## 目录结构

```text
site/
|-- index.html                 # 页面
|-- assets/
|   |-- styles.css             # 样式（终端窗口 + prompts 选择器视觉）
|   `-- app.js                 # 光标移动、命令生成、复制逻辑
|-- data/
|   `-- templates.js           # 生成文件：模板数据（window.CHAOS_TEMPLATES）
`-- scripts/
    `-- sync-templates.mjs     # 从 CLI 配置重新生成 data/templates.js
```

## 数据同步

`data/templates.js` 由脚本从 CLI 的唯一数据源
`packages/create-chaos/src/config.ts` 的 `FRAMEWORKS` 数组生成，不会与 CLI
实际发布的模板脱节。每条记录还带有 CLI 渲染该模板标题所用的 kolorist 颜色名
（`color` 字段），页面据此把列表渲染成与终端一致的效果。在 CLI 中新增、修改
或删除模板后，重新生成并提交：

```bash
node site/scripts/sync-templates.mjs
```

脚本仅使用 Node 标准库，无需安装依赖。CI 或本地可用 `--check` 模式校验数据
文件是否与 CLI 配置一致（不一致时以非零退出码失败）：

```bash
node site/scripts/sync-templates.mjs --check
```

## 设计说明

- 模板列表复刻 CLI（`prompts` 包 select）的终端渲染规则：品红 `?` 提问符、
  粗体消息、灰色 `›` 分隔符与提示文字；`❯` 指针行标题加下划线，且仅在该行
  下方显示 `分类 | 名称 | 别名` 与描述；选中后提问符翻转为绿色 `✔`，行标题
  按 `config.ts` 中配置的 kolorist 颜色着色。
- 键盘可用：↑/↓ 移动指针、Enter 提交；模板行与包管理器均为原生 `<button>`，
  `aria-pressed` 标记选中态。
- 复制功能三级降级：优先 `navigator.clipboard`，其次 `execCommand('copy')`
  （`file://` 等非安全上下文），两者都不可用时自动选中命令文本，提示用户按
  Ctrl/⌘ + C。
- 页面外壳沿用 Chaos Composer 的设计变量（纸色背景、墨色文字、橙色强调色），
  终端窗口内使用深色配色。
