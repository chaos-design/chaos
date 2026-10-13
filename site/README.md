# Chaos Template Gallery

一个基于 **Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui** 的页面：
以 create-chaos CLI 终端交互的同款样式浏览全部模板，选中后即可复制一条可直接
执行的 CLI 命令，基于该模板创建项目。整站采用暗黑科技风——深色底、工程网格、
双色辉光，模板标题沿用 CLI 里真实的 kolorist 配色。

> 视觉预览可参考本地 `pnpm dev` 运行效果；本仓库暂不内置截图资源。

## 技术栈

- **Next.js 15 (App Router)** + **React 19** + **TypeScript**
- **Tailwind CSS** 负责主题与暗黑科技风样式
- **shadcn/ui** 提供 `Button` / `Input` / `Card` / `Badge` 等基础组件
- 数据由脚本从 CLI 配置生成，不手写（见「数据同步」）
- **GitHub Actions** 负责 CI（类型检查 + 构建），**Vercel** 负责部署

## 特性

- **终端级还原**：复刻 `prompts` 包 select 选择器的渲染规则——品红 `?` 提问符、
  粗体消息、灰色 `›` 分隔符、青色 `❯` 指针、选中后翻转为绿色 `✔`，与真实脚手架
  交互一致。
- **零布局跳动**：列表每行固定高度且不再内联展开描述，`❯` 指针由一条绝对定位的
  高亮条以 `translateY` 滑动绘制，因此移动指针只触发合成层动画，列表与页面高度
  纹丝不动。
- **独立检查面板**：右侧 `INSPECTOR` 面板以固定高度呈现当前指针所在模板的完整
  信息——技术栈标签、`template` / `alias` / `category` / 模板目录、包含内容、
  运行要求、下一步以及当前包管理器下的完整命令；内容超出时面板内部滚动，不会
  撑开页面。
- **CLI 真实配色**：模板数据携带 `config.ts` 中配置的 kolorist 颜色名，页面据此
  着色，标题颜色与终端里跑 `create-chaos` 时完全一致。
- **一键复制**：命令形式与仓库 README 用法一致（npm 7+ / yarn / pnpm 通过 `--`
  传参，bun 直接传参），复制后粘贴到终端即可创建项目。
- **即时筛选**：按标题 / 别名 / 分类 / 描述实时过滤，无匹配时黄色提示行 + 面板
  空状态提示，`Esc` 一键清空。
- **键盘友好**：`↑`/`↓`（或 `j`/`k`，越界回环）移动指针、`Home`/`End` 跳到首尾、
  `←`/`→` 切换包管理器、`Enter` 提交、`/` 聚焦筛选、`c` 复制命令、`Esc` 退出
  输入框或清空筛选；指针离开视口时才平滑滚动跟随。所有可点元素均为原生
  `<button>`，`aria-pressed` 标记选中态。
- **科幻氛围**：终端机身内有一条缓慢扫过的扫描线，高亮条带青色发光边框，命令栏
  带闪烁块状光标，切换模板时面板内容淡入。
- **动效尊重系统偏好**：`prefers-reduced-motion: reduce` 时关闭全部动画。

## 快速开始

```bash
cd site
pnpm install
pnpm dev          # http://localhost:3000
```

构建与本地预览：

```bash
pnpm build
pnpm start        # http://localhost:3000
```

## 使用方法

| 步骤 | 操作 |
| --- | --- |
| 1. 筛选模板（可选） | 在 `Filter templates:` 输入关键词，或按 `/` 直接聚焦、`Esc` 清空 |
| 2. 项目目录 | 在 `Project name:` 填写目录名（留空回退为 `chaos-project`） |
| 3. 包管理器 | 点击 npm / pnpm / yarn / bun，或用 `←`/`→` 循环切换 |
| 4. 浏览模板 | 悬停或 `↑`/`↓`（`j`/`k`）移动 `❯` 指针，右侧 `INSPECTOR` 同步显示详情 |
| 5. 提交模板 | 点击目标行、按 `Enter`，或点面板里的「选用此模板」 |
| 6. 复制执行 | 底部命令栏点「复制命令」（或按 `c`），粘贴到终端运行 |

键盘快捷键一览（在输入框内不生效，`Esc` 可退出输入框）：

| 按键 | 作用 |
| --- | --- |
| `↑` / `k`、`↓` / `j` | 上移 / 下移指针（首尾回环） |
| `Home` / `End` | 跳到列表首 / 尾 |
| `←` / `→` | 切换包管理器 |
| `Enter` | 提交当前指针所在模板 |
| `/` | 聚焦筛选输入框 |
| `Esc` | 退出输入框，或清空筛选 |
| `c` | 复制底部命令 |

命令示例（同一模板在不同包管理器下的形态）：

```bash
pnpm create chaos my-app --template next-supabase
npm create chaos@latest my-app -- --template next-supabase
bun create chaos my-app --template next-supabase
```

## 目录结构

```text
site/
|-- src/
|   |-- app/
|   |   |-- globals.css   # 暗黑主题：网格背景、辉光、动画与终端配色
|   |   |-- layout.tsx    # 根布局与 metadata
|   |   `-- page.tsx      # 页面：终端窗口 + 独立检查面板 + 命令栏（'use client'）
|   |-- components/
|   |   |-- template-inspector.tsx  # 固定高度的模板详情面板
|   |   `-- ui/           # shadcn/ui 组件（button / input / card / badge）
|   |-- lib/
|   |   |-- types.ts      # ChaosTemplate / TemplateDetail 类型
|   |   |-- template-ui.ts # 命令拼装、kolorist 配色、筛选等展示逻辑
|   |   `-- utils.ts      # cn() 工具（clsx + tailwind-merge）
|   `-- data/
|       |-- templates.ts  # 生成文件：模板数据（CHAOS_TEMPLATES）
|       `-- template-details.ts  # 手工维护：检查面板的补充说明
|-- scripts/
|   `-- sync-templates.mjs  # 从 CLI 配置重新生成 src/data/templates.ts
|-- components.json         # shadcn 配置
|-- tailwind.config.ts      # 主题、kolorist 配色映射与动效 keyframes
|-- next.config.mjs
|-- package.json
`-- vercel.json
```

### 可配置点

- **主题变量**：`src/app/globals.css` 顶部 `:root` 集中定义了背景、面板、品牌橙
  （`--primary`）、辉光与终端指针色，改一处即可整体换肤。
- **kolorist 映射**：`tailwind.config.ts` 的 `colors.kolorist` 把 CLI 的颜色名
  映射到深色背景下的近似色值，新增颜色时补一个条目，并在
  `src/lib/template-ui.ts` 的 `COLOR_CLASS` 中对应一行即可。
- **包管理器列表**：`src/lib/template-ui.ts` 顶部的 `PM_ORDER` 数组，增删一行
  即可（`←`/`→` 快捷键自动跟随）。
- **列表行高**：`src/app/page.tsx` 的 `ROW_HEIGHT` 常量同时决定行高与指针高亮条
  的位移步长，改这一个数字即可整体缩放。
- **动效开关**：所有动画与过渡都收敛在 `prefers-reduced-motion: reduce`
  媒体查询下，偏好减弱动效时自动关闭。

## 数据同步

`src/data/templates.ts` 由脚本从 CLI 的唯一数据源
`packages/create-chaos/src/config.ts` 的 `FRAMEWORKS` 数组生成，不会与 CLI 实际
发布的模板脱节。每条记录带有 CLI 渲染标题所用的 kolorist 颜色名（`color` 字段）
与模板目录（`path` 字段）。CLI 中新增、修改或删除模板后，重新生成并提交：

```bash
pnpm sync            # 等价于 node scripts/sync-templates.mjs
```

检查面板里的补充说明（技术栈、包含内容、运行要求、下一步）手工维护在
`src/data/template-details.ts`，文案与 `docs/templates.md` 保持一致；脚本会在生成
与校验时一并检查它——新增模板却没有写条目、或条目对应的模板已删除，都会报错退出。

脚本仅使用 Node 标准库。CI 或本地可用 `--check` 模式校验数据文件是否与 CLI 配置
一致（不一致时以非零退出码失败）：

```bash
pnpm sync:check      # 等价于 node scripts/sync-templates.mjs --check
```

## 持续集成与部署

- **GitHub Actions**（`.github/workflows/site.yml`）：在 PR / push 到 `main` 且
  改动涉及 `site/**` 时运行——`pnpm install` → 类型检查 → 数据 `--check` →
  `next build`。
- **Vercel 部署**：在 Vercel 中导入本仓库，将 **Root Directory** 设为 `site`，
  即可通过 Vercel 的 GitHub 集成自动部署（PR 预览、main 生产）。也可在仓库
  `Settings → Secrets` 配置 `VERCEL_TOKEN` / `VERCEL_ORG_ID` /
  `VERCEL_PROJECT_ID`，由同工作流的 `deploy` 任务在 push 到 main 时自动
  `vercel --prod` 发布（`site/vercel.json` 已声明 framework 为 nextjs）。

## 设计说明

- **暗黑科技风**：深色底（`#07090e`）叠加 44px 工程网格与橙 / 青两团辉光；终端
  窗口带入场浮动动画与缓慢扫过的扫描线；命令变化时命令文本闪现一次青色高亮，
  引导视线到更新处。
- **指针滑动的性能取舍**：所有随指针变化的视觉都用 `transform` / `opacity` 表达
  ——高亮条滑动、`❯` 淡入位移、面板内容淡入、提交时提示行微缩放——避免触碰
  `height` / `margin` 等会引发布局重算的属性，因此快速悬停浏览时不会有抖动。
- **复制三级降级**：`navigator.clipboard` → `execCommand('copy')`（非安全上下文）
  → 自动选中命令文本并提示按 Ctrl/⌘ + C。
- **动效尊重系统偏好**：`prefers-reduced-motion: reduce` 时关闭全部动画。
