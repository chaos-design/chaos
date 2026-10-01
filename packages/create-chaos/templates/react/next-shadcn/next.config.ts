import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const basePath = process.env.PAGES_BASE_PATH ?? '';

const nextConfig: NextConfig = isGitHubPages
  ? {
      basePath,
      images: {
        unoptimized: true,
      },
      output: 'export',
      trailingSlash: true,
    }
  : {};

export default nextConfig;
