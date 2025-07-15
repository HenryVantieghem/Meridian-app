import { Metadata } from "next";

// Base SEO configuration
export const SEO_CONFIG = {
  // Default metadata
  DEFAULT: {
    title: "Napoleon - AI-Powered Email Management",
    description:
      "Transform communication chaos into clarity with intelligent email management, AI-powered prioritization, and elegant UX design.",
    keywords:
      "email management, AI productivity, email prioritization, communication tools, AI assistant",
    author: "Napoleon AI",
    robots: "index, follow",
    viewport: "width=device-width, initial-scale=1",
  },

  // Social media
  SOCIAL: {
    twitter: "@napoleon_ai",
    facebook: "napoleon.ai",
    linkedin: "company/napoleon-ai",
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
    title: "Napoleon - AI-Powered Email Management Platform",
    description:
      "Transform your email workflow with AI-powered prioritization, intelligent replies, and elegant design. Get more done with less effort.",
    keywords:
      "email management, AI productivity, email automation, communication tools",
    ogImage: "/og-landing.jpg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Napoleon",
      description: "AI-powered email management platform",
      applicationCategory: "ProductivityApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  },

  // Dashboard
  dashboard: {
    title: "Dashboard - Napoleon",
    description:
      "Manage your emails with AI-powered insights and intelligent prioritization.",
    keywords: "email dashboard, email management, AI insights",
    robots: "noindex, nofollow", // Private dashboard
  },

  // Pricing
  pricing: {
    title: "Pricing - Napoleon",
    description:
      "Choose the perfect plan for your email management needs. Start free, scale as you grow.",
    keywords: "pricing, plans, subscription, email management pricing",
    ogImage: "/og-pricing.jpg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Napoleon",
      description: "AI-powered email management platform",
      offers: [
        {
          "@type": "Offer",
          name: "Free Plan",
          price: "0",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Pro Plan",
          price: "29",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Enterprise Plan",
          price: "99",
          priceCurrency: "USD",
        },
      ],
    },
  },

  // Onboarding
  onboarding: {
    title: "Get Started - Napoleon",
    description:
      "Set up your AI-powered email management experience in just a few steps.",
    keywords: "onboarding, setup, email configuration",
    robots: "noindex, nofollow",
  },
} as const;

// Generate metadata for pages
export const generateMetadata = (
  page: keyof typeof PAGE_METADATA,
  customData?: Partial<Metadata>,
): Metadata => {
  const baseMetadata = PAGE_METADATA[page];

  return {
    title: {
      default: baseMetadata.title,
      template: "%s | Napoleon",
    },
    description: baseMetadata.description,
    keywords: baseMetadata.keywords,
    authors: [{ name: SEO_CONFIG.DEFAULT.author }],
    creator: SEO_CONFIG.DEFAULT.author,
    publisher: SEO_CONFIG.DEFAULT.author,
    robots:
      (baseMetadata as Record<string, unknown>).robots ||
      SEO_CONFIG.DEFAULT.robots,
    viewport: SEO_CONFIG.DEFAULT.viewport,

    // Open Graph
    openGraph: {
      title: baseMetadata.title,
      description: baseMetadata.description,
      type: "website",
      locale: "en_US",
      siteName: "Napoleon",
      images: (baseMetadata as Record<string, unknown>).ogImage
        ? [
            {
              url: (baseMetadata as Record<string, unknown>).ogImage as string,
              width: 1200,
              height: 630,
              alt: baseMetadata.title,
            },
          ]
        : undefined,
    },

    // Twitter
    twitter: {
      card: "summary_large_image",
      title: baseMetadata.title,
      description: baseMetadata.description,
      creator: SEO_CONFIG.SOCIAL.twitter,
      images: (baseMetadata as Record<string, unknown>).ogImage
        ? [(baseMetadata as Record<string, unknown>).ogImage as string]
        : undefined,
    },

    // Structured data
    other: {
      "application-name": "Napoleon",
      "apple-mobile-web-app-title": "Napoleon",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "format-detection": "telephone=no",
      "mobile-web-app-capable": "yes",
      "msapplication-config": "/browserconfig.xml",
      "msapplication-TileColor": "#000000",
      "theme-color": "#000000",
    },

    // Custom data
    ...customData,
  };
};

// Generate structured data
export const generateStructuredData = (
  type: string,
  data: Record<string, unknown>,
): string => {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  });
};

// Organization structured data
export const ORGANIZATION_STRUCTURED_DATA = generateStructuredData(
  "Organization",
  {
    name: "Napoleon AI",
    url: "https://napoleon.ai",
    logo: "https://napoleon.ai/logo.png",
    description: "AI-powered email management platform",
    sameAs: [
      `https://twitter.com/${SEO_CONFIG.SOCIAL.twitter}`,
      `https://facebook.com/${SEO_CONFIG.SOCIAL.facebook}`,
      `https://linkedin.com/${SEO_CONFIG.SOCIAL.linkedin}`,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@napoleon.ai",
    },
  },
);

// WebSite structured data
export const WEBSITE_STRUCTURED_DATA = generateStructuredData("WebSite", {
  name: "Super Intelligence",
  url: "https://super-intelligence.ai",
  description: "AI-powered email management platform",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://super-intelligence.ai/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
});

// Breadcrumb structured data
export const generateBreadcrumbData = (
  items: Array<{ name: string; url: string }>,
) => {
  return generateStructuredData("BreadcrumbList", {
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
};

// FAQ structured data
export const generateFAQData = (
  questions: Array<{ question: string; answer: string }>,
) => {
  return generateStructuredData("FAQPage", {
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
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
    STYLE: "2px solid #D4AF37",
  },

  // Screen reader support
  SCREEN_READER: {
    SKIP_LINKS: true,
    ARIA_LABELS: true,
    SEMANTIC_HTML: true,
  },
} as const;

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

// Export utilities
export const seoUtils = {
  generateMetadata,
  generateStructuredData,
  generateBreadcrumbData,
  generateFAQData,
};
