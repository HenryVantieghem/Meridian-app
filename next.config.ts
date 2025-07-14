['OPENAI_API_KEY','SUPABASE_SERVICE_ROLE_KEY','STRIPE_SECRET_KEY'].forEach(k=>{if(!process.env[k]) throw new Error(`❌ Missing env: ${k}`);});
// Napoleon AI Platform - next.config.ts
import type { NextConfig } from 'next';

// Sentry configuration
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    'googleapis',
    'google-auth-library',
    'gaxios',
    'gcp-metadata',
    '@clerk/nextjs'
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
  images: {
    unoptimized: true,
    domains: [
      'lh3.googleusercontent.com', 
      'avatars.slack-edge.com',
      'images.clerk.dev', 
      'img.clerk.com'
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
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
      {
        source: '/api/auth/sign-in',
        destination: '/sign-in',
        permanent: false,
      },
      {
        source: '/api/auth/sign-up',
        destination: '/sign-up',
        permanent: false,
      },
    ];
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  silent: true,
  org: "napoleon-ai",
  project: "napoleon-ai-platform",
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
