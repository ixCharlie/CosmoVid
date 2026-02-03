/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Empty = same origin (production). For local dev set NEXT_PUBLIC_API_URL=http://localhost:4000 in .env.local
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? '',
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
