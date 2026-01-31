/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
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
