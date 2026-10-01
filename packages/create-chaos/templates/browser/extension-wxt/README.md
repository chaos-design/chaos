# Browser Extension Scaffold

一个干净的浏览器扩展脚手架，基于 WXT、React、TypeScript、Tailwind CSS
和 Biome 构建。

## 内置入口

- `popup`：支持在设置页调整宽度和高度
- `sidepanel`：可与 popup 同时设为浏览器工具栏入口
- `content`：仅向配置的域名注入可拖拽、自动吸边的页面悬浮球
- `options`：在新标签页打开的完整设置页，配置保存在本地

设置页侧栏支持折叠，折叠后可通过图标 Tooltip 识别各菜单。右上角的主题菜单
可切换暗色、亮色或跟随系统，选择结果保存在 `browser.storage.local`。

## 项目配置

项目元信息集中在 [`config/app-config.json`](config/app-config.json)：

| 配置 | 用途 |
| --- | --- |
| `name` / `shortName` | 扩展清单、设置页与 Popup 中展示的名称 |
| `description` | 扩展清单描述与 About 页面说明 |
| `github.repositoryUrl` | GitHub 仓库入口与扩展 `homepage_url` |
| `contentScript.matches` | 内容脚本允许注入的页面 |
| `surfaces` | Popup、侧边栏与悬浮球的默认行为 |

配置 `github.repositoryUrl` 后，About 页面会显示“查看仓库”按钮，构建出的
扩展清单会包含 `homepage_url`。`npm run setup` 还会同步更新
`package.json` 中的 `repository`、`homepage` 和 `bugs`；在交互提示中输入
`-` 可清空 GitHub 配置。仓库地址格式应为
`https://github.com/<owner>/<repository>`。

## 测试域名

内容脚本只对 [`config/app-config.json`](config/app-config.json) 中
`contentScript.matches` 配置的地址生效，当前仅包含
`https://example.com/*`。匹配规则使用浏览器扩展的
[Match pattern](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/Match_patterns)
格式；修改后需要重新启动开发服务或重新加载扩展。

## 开始使用

需要 Node.js 22 或更高版本。

```bash
npm install
npm run setup
npm run dev
```

`npm run setup` 可交互配置扩展名称、npm 包名、描述、GitHub 仓库和图标。
也可以将示例中的 `npm` 替换为 pnpm、yarn 或 bun。

## 常用命令

```bash
npm run dev
npm run check
npm run format
npm run build
npm run zip
```

各模式入口位于 `entrypoints/`，共享界面位于 `components/`。扩展清单配置
位于 `wxt.config.ts`，项目元信息、GitHub 仓库和入口默认值位于
`config/app-config.json`。

## Firefox 发布配置

Firefox 构建通过 `data_collection_permissions.required: ["none"]`
声明扩展不会收集或向浏览器外传输用户数据。需要自托管更新或固定扩展身份时，
请在 `wxt.config.ts` 的 `browser_specific_settings.gecko` 中配置唯一 ID；
扩展发布后不得修改该 ID。
