export const siteConfig = {
  name: 'Chaos',
  description: '一个极简且干净的文档站点。',
  icon: '/chao.png',
  url: 'http://localhost:3456',
  links: {
    github: 'https://github.com/rain120/study-notes',
  },
  navItems: [
    {
      type: 'menu',
      label: 'Components',
      icon: 'layout-dashboard',
      defaultPreview: 'text',
      items: [
        {
          label: 'Foo',
          description: 'Foo component.',
          href: '/docs/components/foo',
          icon: 'type',
          previewSection: 'text',
        },
      ],
    },
    {
      type: 'link',
      label: 'Docs',
      href: '/docs/guides',
      icon: 'book',
    },
  ],
  github: {
    // INFO: config as needed
    owner: 'chaos-design',
    repo: 'site',
    paths: (type: 'component' | 'block', name: string) =>
      type === 'component'
        ? `packages/site/components/${name}/index.tsx`
        : `packages/site/blocks/${name}/index.tsx`,
    contentPath: 'apps/docs/content/docs',
  },
  preview: {
    sources: [
      {
        dir: 'examples',
        importer: 'examples',
      },
    ],
  },
  // docs/components/landing/features.tsx
  features: {
    name: 'Chaos Design',
    title: 'Why Choose ',
    items: [
      {
        title: 'React',
        description:
          '基于现代 React 模式构建，包括服务端组件、TypeScript 和 Hook，以实现最佳性能。',
        icon: 'react',
      },
      {
        title: 'Tailwindcss',
        description:
          '基于 Tailwind CSS v4 构建，采用最新的实用优先 CSS 框架，支持增强的暗黑模式和现代设计模式。',
        icon: 'tailwind',
      },
      {
        title: '兼容 shadcn/ui',
        description:
          '完全兼容 shadcn/ui 生态系统。易于集成到现有的 shadcn/ui 项目中，并遵循相同的开发模式。',
        icon: 'shadcn',
      },
    ],
  },
  author: 'Chaos',
  hero: {
    title: 'Chaos 文档站点',
    subtitle: '一个极简且干净的文档站点。',
    orbitSize: 360,
    coreSize: 22,
    imageScale: 16,
    centerImage: undefined,
  },
};
