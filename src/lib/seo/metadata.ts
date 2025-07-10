import { Metadata } from 'next';
import React from 'react';

// SEO configuration
export const SEO_CONFIG = {
  // Default metadata
  DEFAULT: {
    title: 'Meridian - AI-Powered Email Management',
    description: 'Transform communication chaos into clarity with intelligent email management, AI-powered prioritization, and elegant UX design.',
    keywords: 'email management, AI productivity, email prioritization, communication tools, AI assistant',
    author: 'Meridian AI',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1',
  },
  
  // Social media
  SOCIAL: {
    twitter: '@meridian_ai',
    facebook: 'meridian.ai',
    linkedin: 'company/meridian-ai',
  },
  
  // Performance targets
  PERFORMANCE: {
    LCP: 2500, // 2.5 seconds
    FID: 100, // 100ms
    CLS: 0.1, // 0.1
    TTFB: 800, // 800ms
  },
} as const;

// Page-specific metadata
export const PAGE_METADATA = {
  // Landing page
  landing: {
    title: 'Meridian - AI-Powered Email Management Platform',
    description: 'Transform your email workflow with AI-powered prioritization, intelligent replies, and elegant design. Get more done with less effort.',
    keywords: 'email management, AI productivity, email automation, communication tools',
    ogImage: '/og-landing.jpg',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Meridian',
      description: 'AI-powered email management platform',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  },
  
  // Dashboard
  dashboard: {
    title: 'Dashboard - Meridian',
    description: 'Manage your emails with AI-powered insights and intelligent prioritization.',
    keywords: 'email dashboard, email management, AI insights',
    robots: 'noindex, nofollow', // Private dashboard
  },
  
  // Pricing
  pricing: {
    title: 'Pricing - Meridian',
    description: 'Choose the perfect plan for your email management needs. Start free, scale as you grow.',
    keywords: 'pricing, plans, subscription, email management pricing',
    ogImage: '/og-pricing.jpg',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Meridian',
      description: 'AI-powered email management platform',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Plan',
          price: '0',
          priceCurrency: 'USD',
        },
        {
          '@type': 'Offer',
          name: 'Pro Plan',
          price: '29',
          priceCurrency: 'USD',
        },
        {
          '@type': 'Offer',
          name: 'Enterprise Plan',
          price: '99',
          priceCurrency: 'USD',
        },
      ],
    },
  },
  
  // Onboarding
  onboarding: {
    title: 'Get Started - Meridian',
    description: 'Set up your AI-powered email management experience in just a few steps.',
    keywords: 'onboarding, setup, email configuration',
    robots: 'noindex, nofollow',
  },
} as const;

// Generate metadata for pages
export const generateMetadata = (
  page: keyof typeof PAGE_METADATA,
  customData?: Partial<Metadata>
): Metadata => {
  const baseMetadata = PAGE_METADATA[page];
  
  return {
    title: {
      default: baseMetadata.title,
      template: '%s | Meridian',
    },
    description: baseMetadata.description,
    keywords: baseMetadata.keywords,
    authors: [{ name: SEO_CONFIG.DEFAULT.author }],
    creator: SEO_CONFIG.DEFAULT.author,
    publisher: SEO_CONFIG.DEFAULT.author,
    robots: (baseMetadata as any).robots || SEO_CONFIG.DEFAULT.robots,
    viewport: SEO_CONFIG.DEFAULT.viewport,
    
    // Open Graph
    openGraph: {
      title: baseMetadata.title,
      description: baseMetadata.description,
      type: 'website',
      locale: 'en_US',
      siteName: 'Meridian',
      images: (baseMetadata as any).ogImage ? [
        {
          url: (baseMetadata as any).ogImage,
          width: 1200,
          height: 630,
          alt: baseMetadata.title,
        },
      ] : undefined,
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: baseMetadata.title,
      description: baseMetadata.description,
      creator: SEO_CONFIG.SOCIAL.twitter,
      images: (baseMetadata as any).ogImage ? [(baseMetadata as any).ogImage] : undefined,
    },
    
    // Structured data
    other: {
      'application-name': 'Meridian',
      'apple-mobile-web-app-title': 'Meridian',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'format-detection': 'telephone=no',
      'mobile-web-app-capable': 'yes',
      'msapplication-config': '/browserconfig.xml',
      'msapplication-TileColor': '#000000',
      'theme-color': '#000000',
    },
    
    // Custom data
    ...customData,
  };
};

// Generate structured data
export const generateStructuredData = (
  type: string,
  data: Record<string, any>
): string => {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  });
};

// Organization structured data
export const ORGANIZATION_STRUCTURED_DATA = generateStructuredData('Organization', {
  name: 'Meridian AI',
  url: 'https://meridian.ai',
  logo: 'https://meridian.ai/logo.png',
  description: 'AI-powered email management platform',
  sameAs: [
    `https://twitter.com/${SEO_CONFIG.SOCIAL.twitter}`,
    `https://facebook.com/${SEO_CONFIG.SOCIAL.facebook}`,
    `https://linkedin.com/${SEO_CONFIG.SOCIAL.linkedin}`,
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'support@meridian.ai',
  },
});

// WebSite structured data
export const WEBSITE_STRUCTURED_DATA = generateStructuredData('WebSite', {
  name: 'Meridian',
  url: 'https://meridian.ai',
  description: 'AI-powered email management platform',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://meridian.ai/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
});

// Breadcrumb structured data
export const generateBreadcrumbData = (items: Array<{ name: string; url: string }>) => {
  return generateStructuredData('BreadcrumbList', {
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
};

// FAQ structured data
export const generateFAQData = (questions: Array<{ question: string; answer: string }>) => {
  return generateStructuredData('FAQPage', {
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  });
};

// Accessibility utilities
export const ACCESSIBILITY_CONFIG = {
  // Color contrast ratios
  CONTRAST: {
    NORMAL: 4.5,
    LARGE: 3.0,
  },
  
  // Focus indicators
  FOCUS: {
    VISIBLE: true,
    STYLE: '2px solid #D4AF37',
  },
  
  // Screen reader support
  SCREEN_READER: {
    SKIP_LINKS: true,
    ARIA_LABELS: true,
    SEMANTIC_HTML: true,
  },
} as const;

// Accessibility hook
export const useAccessibility = () => {
  React.useEffect(() => {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Focus management
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    };
    
    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
    };
    
    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
};

// Core Web Vitals optimization
export const CORE_WEB_VITALS_CONFIG = {
  // LCP optimization
  LCP: {
    PRIORITY_IMAGES: true,
    PRELOAD_CRITICAL_RESOURCES: true,
    OPTIMIZE_FONTS: true,
  },
  
  // FID optimization
  FID: {
    MINIMIZE_JAVASCRIPT: true,
    DEFER_NON_CRITICAL_JS: true,
    OPTIMIZE_EVENT_HANDLERS: true,
  },
  
  // CLS optimization
  CLS: {
    RESERVE_SPACE: true,
    AVOID_LAYOUT_SHIFTS: true,
    OPTIMIZE_IMAGES: true,
  },
} as const;

// Core Web Vitals optimization hook
export const useCoreWebVitals = () => {
  React.useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      const criticalResources = [
        '/fonts/helvetica-neue.woff2',
        '/images/hero-image.webp',
      ];
      
      criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.includes('.woff2') ? 'font' : 'image';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    };
    
    // Optimize images
    const optimizeImages = () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.loading) {
          img.loading = 'lazy';
        }
        if (!img.decoding) {
          img.decoding = 'async';
        }
      });
    };
    
    // Reserve space for dynamic content
    const reserveSpace = () => {
      const dynamicElements = document.querySelectorAll('[data-reserve-space]');
      dynamicElements.forEach(element => {
        const aspectRatio = element.getAttribute('data-aspect-ratio');
        if (aspectRatio) {
          const [width, height] = aspectRatio.split(':').map(Number);
          const paddingTop = (height / width) * 100;
          (element as HTMLElement).style.paddingTop = `${paddingTop}%`;
        }
      });
    };
    
    preloadCriticalResources();
    optimizeImages();
    reserveSpace();
  }, []);
};

// Export utilities
export const seoUtils = {
  generateMetadata,
  generateStructuredData,
  generateBreadcrumbData,
  generateFAQData,
  useAccessibility,
  useCoreWebVitals,
}; 

// Remove all invalid JSX/TSX from this file. If a Metadata React component is needed, define it as:
// export function Metadata({ title, description, image }: { title: string; description: string; image?: string }) {
//   return (
//     <>
//       <title>{title}</title>
//       <meta name="description" content={description} />
//       {image && <meta property="og:image" content={image} />}
//     </>
//   );
// }

// If not needed, do not export any React component from this file. 