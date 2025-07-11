import { Metadata } from 'next'

// Base metadata configuration
export const baseMetadata: Metadata = {
  title: 'Super Intelligence - AI-Powered Email Management',
  description: 'Transform communication chaos into clarity through intelligent email management, AI-powered prioritization, and elegant UX design.',
  keywords: ['AI email management', 'productivity', 'email automation', 'AI assistant', 'email prioritization'],
  authors: [{ name: 'Super Intelligence AI' }],
  creator: 'Super Intelligence AI',
  publisher: 'Super Intelligence AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://super-intelligence.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://super-intelligence.ai',
    siteName: 'Super Intelligence',
    title: 'Super Intelligence - AI-Powered Email Management Platform',
    description: 'Transform communication chaos into clarity through intelligent email management, AI-powered prioritization, and elegant UX design.',
    images: [
      {
        url: 'https://super-intelligence.ai/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Super Intelligence - AI-Powered Email Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Super Intelligence - AI-Powered Email Management',
    description: 'Transform communication chaos into clarity through intelligent email management, AI-powered prioritization, and elegant UX design.',
    images: ['https://super-intelligence.ai/og-image.png'],
    creator: '@super_intelligence_ai',
    site: '@super_intelligence_ai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

// Page-specific metadata
export const pageMetadata = {
  home: {
    title: 'Super Intelligence - AI-Powered Email Management Platform',
    description: 'Transform communication chaos into clarity through intelligent email management, AI-powered prioritization, and elegant UX design.',
    keywords: ['AI email management', 'productivity', 'email automation', 'AI assistant'],
  },
  dashboard: {
    title: 'Dashboard - Super Intelligence',
    description: 'Your AI-powered dashboard for intelligent email management and productivity insights.',
    keywords: ['dashboard', 'email management', 'productivity', 'AI insights'],
  },
  pricing: {
    title: 'Pricing - Super Intelligence',
    description: 'Choose the perfect plan for your AI-powered email management needs.',
    keywords: ['pricing', 'plans', 'subscription', 'AI email management'],
  },
  signIn: {
    title: 'Sign In - Super Intelligence',
    description: 'Sign in to your Super Intelligence account and access your AI-powered email management dashboard.',
    keywords: ['sign in', 'login', 'authentication', 'AI email management'],
  },
  signUp: {
    title: 'Get Started - Super Intelligence',
    description: 'Join Super Intelligence and transform your email management with AI-powered productivity tools.',
    keywords: ['sign up', 'register', 'AI email management', 'productivity'],
  },
}

// Structured data for SEO
export const structuredData = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Super Intelligence',
    url: 'https://super-intelligence.ai',
    logo: 'https://super-intelligence.ai/logo.png',
    sameAs: [
      'https://twitter.com/super_intelligence_ai',
      'https://linkedin.com/company/super-intelligence-ai',
      'https://facebook.com/super-intelligence-ai',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-SUPER-INT',
      contactType: 'customer service',
      email: 'support@super-intelligence.ai',
    },
  },
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Super Intelligence',
    url: 'https://super-intelligence.ai',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://super-intelligence.ai/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
  webApplication: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Super Intelligence',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  },
}

// App manifest for PWA
export const appManifest = {
  name: 'Super Intelligence',
  short_name: 'Super Intelligence',
  description: 'AI-Powered Email Management Platform',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#000000',
  icons: [
    {
      src: '/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],
}

// Generate metadata for a specific page
export function generateMetadata(page: keyof typeof pageMetadata): Metadata {
  const pageMeta = pageMetadata[page]
  
  return {
    ...baseMetadata,
    title: {
      default: pageMeta.title,
      template: '%s | Super Intelligence',
    },
    description: pageMeta.description,
    keywords: pageMeta.keywords,
    openGraph: {
      ...baseMetadata.openGraph,
      title: pageMeta.title,
      description: pageMeta.description,
    },
    twitter: {
      ...baseMetadata.twitter,
      title: pageMeta.title,
      description: pageMeta.description,
    },
  }
}

// Generate structured data for a specific page
export function generateStructuredData(type: keyof typeof structuredData) {
  return structuredData[type]
} 