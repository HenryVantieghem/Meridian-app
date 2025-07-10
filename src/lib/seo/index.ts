// SEO and Metadata System
// Central export for all SEO utilities

// SEO Utilities
export const seoUtils = {
  // Generate metadata for pages
  generateMetadata: (page: {
    title: string;
    description: string;
    keywords?: string[];
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
  }) => {
    const {
      title,
      description,
      keywords = [],
      image,
      url,
      type = 'website',
      author,
      publishedTime,
      modifiedTime,
      section,
      tags = []
    } = page;

    const metadata = {
      title: `${title} | Meridian`,
      description,
      keywords: keywords.join(', '),
      openGraph: {
        title: `${title} | Meridian`,
        description,
        url,
        siteName: 'Meridian',
        images: image ? [{ url: image, width: 1200, height: 630 }] : [],
        locale: 'en_US',
        type
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | Meridian`,
        description,
        images: image ? [image] : []
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1
        }
      },
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
        yandex: process.env.YANDEX_VERIFICATION,
        yahoo: process.env.YAHOO_VERIFICATION
      }
    };

    // Add article-specific metadata
    if (type === 'article') {
      (metadata.openGraph as any).article = {
        publishedTime,
        modifiedTime,
        author,
        section,
        tags
      };
    }

    return metadata;
  },

  // Generate structured data
  generateStructuredData: (type: 'organization' | 'website' | 'article' | 'product', data: any) => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': type.charAt(0).toUpperCase() + type.slice(1)
    };

    switch (type) {
      case 'organization':
        return {
          ...baseData,
          name: 'Meridian',
          url: 'https://meridian.ai',
          logo: 'https://meridian.ai/logo.png',
          description: 'AI-powered productivity platform that transforms communication chaos into clarity',
          sameAs: [
            'https://twitter.com/meridian_ai',
            'https://linkedin.com/company/meridian-ai'
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+1-555-0123',
            contactType: 'customer service',
            email: 'support@meridian.ai'
          }
        };

      case 'website':
        return {
          ...baseData,
          name: 'Meridian',
          url: 'https://meridian.ai',
          description: 'AI-powered productivity platform',
          publisher: {
            '@type': 'Organization',
            name: 'Meridian',
            logo: {
              '@type': 'ImageObject',
              url: 'https://meridian.ai/logo.png'
            }
          }
        };

      case 'article':
        return {
          ...baseData,
          headline: data.title,
          description: data.description,
          image: data.image,
          author: {
            '@type': 'Person',
            name: data.author
          },
          publisher: {
            '@type': 'Organization',
            name: 'Meridian',
            logo: {
              '@type': 'ImageObject',
              url: 'https://meridian.ai/logo.png'
            }
          },
          datePublished: data.publishedTime,
          dateModified: data.modifiedTime
        };

      case 'product':
        return {
          ...baseData,
          name: data.name,
          description: data.description,
          image: data.image,
          offers: {
            '@type': 'Offer',
            price: data.price,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
          }
        };

      default:
        return baseData;
    }
  },

  // Generate sitemap
  generateSitemap: (pages: Array<{
    url: string;
    lastModified: string;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
  }>) => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return sitemap;
  },

  // Generate robots.txt
  generateRobotsTxt: (options: {
    allowAll?: boolean;
    disallowPaths?: string[];
    sitemapUrl?: string;
    crawlDelay?: number;
  } = {}) => {
    const {
      allowAll = true,
      disallowPaths = ['/api/', '/admin/', '/private/'],
      sitemapUrl = 'https://meridian.ai/sitemap.xml',
      crawlDelay = 1
    } = options;

    let robotsTxt = 'User-agent: *\n';

    if (allowAll) {
      robotsTxt += 'Allow: /\n';
    }

    disallowPaths.forEach(path => {
      robotsTxt += `Disallow: ${path}\n`;
    });

    robotsTxt += `Crawl-delay: ${crawlDelay}\n`;
    robotsTxt += `Sitemap: ${sitemapUrl}\n`;

    return robotsTxt;
  },

  // Optimize images for SEO
  optimizeImage: (imageUrl: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    alt?: string;
  } = {}) => {
    const {
      width = 1200,
      height = 630,
      quality = 80,
      format = 'webp',
      alt = ''
    } = options;

    // Add image optimization parameters
    const optimizedUrl = `${imageUrl}?w=${width}&h=${height}&q=${quality}&f=${format}`;

    return {
      src: optimizedUrl,
      alt,
      width,
      height,
      loading: 'lazy' as const
    };
  },

  // Generate canonical URL
  generateCanonicalUrl: (path: string, baseUrl: string = 'https://meridian.ai') => {
    return `${baseUrl}${path}`;
  },

  // Generate breadcrumb structured data
  generateBreadcrumbData: (breadcrumbs: Array<{
    name: string;
    url: string;
  }>) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((breadcrumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: breadcrumb.name,
        item: breadcrumb.url
      }))
    };
  },

  // Generate FAQ structured data
  generateFAQData: (faqs: Array<{
    question: string;
    answer: string;
  }>) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };
  },

  // Generate review structured data
  generateReviewData: (review: {
    rating: number;
    reviewCount: number;
    bestRating: number;
    worstRating: number;
  }) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Meridian',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: review.rating,
        reviewCount: review.reviewCount,
        bestRating: review.bestRating,
        worstRating: review.worstRating
      }
    };
  }
};

// SEO Configuration
export const seoConfig = {
  // Default metadata
  default: {
    title: 'Meridian - AI-Powered Productivity Platform',
    description: 'Transform communication chaos into clarity with AI-powered email management, prioritization, and intelligent automation.',
    keywords: ['AI', 'productivity', 'email management', 'automation', 'communication'],
    image: 'https://meridian.ai/og-image.png',
    url: 'https://meridian.ai'
  },

  // Page-specific metadata
  pages: {
    home: {
      title: 'Meridian - AI-Powered Productivity Platform',
      description: 'Transform communication chaos into clarity with AI-powered email management, prioritization, and intelligent automation.',
      keywords: ['AI', 'productivity', 'email management', 'automation'],
      type: 'website' as const
    },
    pricing: {
      title: 'Pricing - Meridian',
      description: 'Choose the perfect plan for your productivity needs. Start free or upgrade to unlock advanced AI features.',
      keywords: ['pricing', 'plans', 'subscription', 'features'],
      type: 'website' as const
    },
    dashboard: {
      title: 'Dashboard - Meridian',
      description: 'Your AI-powered productivity dashboard. Manage emails, track priorities, and stay organized.',
      keywords: ['dashboard', 'email management', 'productivity'],
      type: 'website' as const
    },
    onboarding: {
      title: 'Get Started - Meridian',
      description: 'Set up your AI productivity assistant in minutes. Connect your email and start organizing.',
      keywords: ['onboarding', 'setup', 'getting started'],
      type: 'website' as const
    }
  },

  // Social media
  social: {
    twitter: {
      handle: '@meridian_ai',
      site: '@meridian_ai'
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID
    }
  },

  // Analytics
  analytics: {
    google: process.env.GOOGLE_ANALYTICS_ID,
    facebook: process.env.FACEBOOK_PIXEL_ID,
    hotjar: process.env.HOTJAR_ID
  },

  // Search console
  searchConsole: {
    google: process.env.GOOGLE_SEARCH_CONSOLE_VERIFICATION,
    bing: process.env.BING_WEBMASTER_VERIFICATION
  }
};

// SEO Monitoring
export const seoMonitoring = {
  // Track page views
  trackPageView: (page: string, title: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.GOOGLE_ANALYTICS_ID!, {
        page_title: title,
        page_location: page
      });
    }
  },

  // Track custom events
  trackEvent: (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  },

  // Track conversions
  trackConversion: (conversionType: 'signup' | 'purchase' | 'trial', value?: number) => {
    seoMonitoring.trackEvent('conversion', conversionType, undefined, value);
  },

  // Track engagement
  trackEngagement: (engagementType: 'scroll' | 'click' | 'time_on_page', value?: number) => {
    seoMonitoring.trackEvent('engagement', engagementType, undefined, value);
  }
};

// SEO Hooks
export const useSEO = (page: keyof typeof seoConfig.pages) => {
  const pageConfig = seoConfig.pages[page];
  
  return {
    metadata: seoUtils.generateMetadata(pageConfig),
    structuredData: seoUtils.generateStructuredData('website', {
      name: pageConfig.title,
      description: pageConfig.description,
      url: `${seoConfig.default.url}/${page}`
    }),
    trackPageView: () => seoMonitoring.trackPageView(`/${page}`, pageConfig.title)
  };
};

// Export default SEO instance
export default {
  seoUtils,
  seoConfig,
  seoMonitoring,
  useSEO
}; 