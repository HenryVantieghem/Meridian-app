import { Metadata } from 'next'

// Base metadata configuration
export const baseMetadata: Metadata = {
  title: 'Napoleon - AI-Powered Email Management',
  description: 'Transform communication chaos into clarity through intelligent email management, AI-powered prioritization, and elegant UX design.',
  keywords: ['AI email management', 'productivity', 'email automation', 'AI assistant', 'email prioritization'],
  authors: [{ name: 'Napoleon AI' }],
  creator: 'Napoleon AI',
  publisher: 'Napoleon AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://napoleon.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://napoleon.ai',
    siteName: 'Napoleon',
    title: 'Napoleon - AI-Powered Email Management Platform',
    description: 'Transform communication chaos into clarity through intelligent email management, AI-powered prioritization, and elegant UX design.',
    images: [
      {
        url: 'https://napoleon.ai/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Napoleon - AI-Powered Email Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Napoleon - AI-Powered Email Management',
    description: 'Transform communication chaos into clarity through intelligent email management, AI-powered prioritization, and elegant UX design.',
    images: ['https://napoleon.ai/og-image.png'],
    creator: '@napoleon_ai',
    site: '@napoleon_ai',
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
    title: 'Napoleon - AI-Powered Email Management Platform',
    description: 'Transform communication chaos into clarity through intelligent email management, AI-powered prioritization, and elegant UX design.',
    keywords: ['AI email management', 'productivity', 'email automation', 'AI assistant'],
  },
  dashboard: {
    title: 'Dashboard - Napoleon',
    description: 'Your AI-powered dashboard for intelligent email management and productivity insights.',
    keywords: ['dashboard', 'email management', 'productivity', 'AI insights'],
  },
  pricing: {
    title: 'Pricing - Napoleon',
    description: 'Choose the perfect plan for your AI-powered email management needs.',
    keywords: ['pricing', 'plans', 'subscription', 'AI email management'],
  },
  signIn: {
    title: 'Sign In - Napoleon',
    description: 'Sign in to your Napoleon account and access your AI-powered email management dashboard.',
    keywords: ['sign in', 'login', 'authentication', 'AI email management'],
  },
  signUp: {
    title: 'Get Started - Napoleon',
    description: 'Join Napoleon and transform your email management with AI-powered productivity tools.',
    keywords: ['sign up', 'register', 'AI email management', 'productivity'],
  },
}

// Structured data for SEO
export const structuredData = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Napoleon',
    url: 'https://napoleon.ai',
    logo: 'https://napoleon.ai/logo.png',
    sameAs: [
      'https://twitter.com/napoleon_ai',
      'https://linkedin.com/company/napoleon-ai',
      'https://facebook.com/napoleon-ai',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-NAPOLEON',
      contactType: 'customer service',
      email: 'support@napoleon.ai',
    },
  },
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Napoleon',
    url: 'https://napoleon.ai',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://napoleon.ai/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
  webApplication: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Napoleon',
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
  name: 'Napoleon',
  short_name: 'Napoleon',
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
      template: '%s | Napoleon',
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