/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Empty = same origin (production). For local dev set NEXT_PUBLIC_API_URL=http://localhost:4000 in .env.local
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? '',
  },
  async rewrites() {
    // When NEXT_PUBLIC_API_URL is unset, proxy /api to backend so same-origin requests work in dev
    if (process.env.NEXT_PUBLIC_API_URL) return [];
    const backend = process.env.BACKEND_URL || 'http://localhost:4000';
    return [{ source: '/api/:path*', destination: `${backend}/api/:path*` }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.tiktokcdn.com', pathname: '/**' },
      { protocol: 'https', hostname: '**.tiktokv.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.tiktok.com', pathname: '/**' },
      { protocol: 'https', hostname: '**', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;
