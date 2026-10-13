/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // The site has its own lint story; type-checking + build are the CI gate.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
