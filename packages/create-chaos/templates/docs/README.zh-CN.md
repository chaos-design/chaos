# docs（中文）

这是一个基于 Next.js + Fumadocs 的文档站点。

## 开发

```bash
npm run dev
# 或
pnpm dev
# 或
yarn dev
```

访问 http://localhost:3456 查看效果。

## 文档目录说明

- `content/docs/guides`：指南与使用教程。
- `content/docs/components`：组件说明与组件总览页面。
- `content/docs/blocks`：区块/版块类文档内容。
- `content/docs/guides/changelog.mdx`：更新日志页面入口，内容来自 `CHANGELOG.md`。
- `CHANGELOG.md`：变更记录源文件。

## 布局与渲染入口

- `app/docs/layout.tsx`：使用 `fumadocs-ui` 的 DocsLayout 作为文档布局入口。
- `app/docs/[...slug]/page.tsx`：渲染 MDX 内容并注入自定义组件。
- `utils/layout.shared.tsx`：布局共享配置。
- `utils/source.ts`：内容源适配与加载器。

## 路由

| 路由                      | 说明                             |
| ------------------------- | -------------------------------- |
| `app/(home)`              | Landing 与营销页入口             |
| `app/docs`                | 文档布局与页面                   |
| `app/api/search/route.ts` | 搜索接口                         |

## Fumadocs MDX

`source.config.ts` 用于配置 MDX 选项与 frontmatter schema。
更多信息请参考 [Fumadocs MDX 文档](https://fumadocs.dev/docs/mdx)。
