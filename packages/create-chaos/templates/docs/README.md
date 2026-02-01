# docs

This is a documentation site built with Next.js + Fumadocs.

## Development

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open http://localhost:3456 to see the result.

## Documentation Content

- Content directories:
  - `content/docs/guides`: Guides and how-to documentation.
  - `content/docs/components`: Component documentation and overview pages.
  - `content/docs/blocks`: Blocks/sections documentation.
- Changelog rendering:
  - `content/docs/guides/changelog.mdx` renders from `CHANGELOG.md`.
- Layout entry:
  - `app/docs/layout.tsx` uses `fumadocs-ui` DocsLayout.
  - `app/docs/[...slug]/page.tsx` renders MDX and injects custom components.
  - `utils/layout.shared.tsx` shared layout configuration.

## Key Files

- `utils/source.ts`: Content source adapter and loader.
- `components/changelog-from-file.tsx`: Renders changelog entries from a file path.
- `components/landing`: Landing page visual effects and hero components.

## Routes

| Route                     | Description                     |
| ------------------------- | ------------------------------- |
| `app/(home)`              | Landing and marketing pages.    |
| `app/docs`                | Documentation layout and pages. |
| `app/api/search/route.ts` | Search API handler.             |

## Fumadocs MDX

`source.config.ts` configures MDX options and frontmatter schema.
Read the [Fumadocs MDX docs](https://fumadocs.dev/docs/mdx) for details.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Learn](https://nextjs.org/learn)
- [Fumadocs](https://fumadocs.dev)
