// Napoleon AI Platform - next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@clerk/nextjs'],
  images: {
    domains: ['images.clerk.dev', 'img.clerk.com'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

module.exports = nextConfig; 