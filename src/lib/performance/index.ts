import React from 'react';

// Performance Optimization System
// Central export for all performance utilities

// Caching
export { 
  CacheManager,
  withApiCaching,
  withQueryCaching,
  staticAssetCaching,
  invalidateCache,
  invalidateUserCache,
  invalidateEmailCache
} from './caching';

// Code Splitting
export { 
  createLazyComponent,
  routeComponents,
  featureModules,
  withPerformanceTracking,
  analyzeBundleSize,
  preloadCriticalComponents,
  useIntersectionObserver,
  usePerformanceMonitoring
} from './code-splitting';

// Performance Monitoring
export { 
  PerformanceMonitoringService
} from '../monitoring/performance-monitoring';

export type { 
  PerformanceMetrics,
  CoreWebVitals
} from '../monitoring/performance-monitoring';

// Performance Utilities
export const performanceUtils = {
  // Debounce function calls
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function calls
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Memoize expensive calculations
  memoize: <T extends (...args: any[]) => any>(
    func: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T => {
    const cache = new Map<string, ReturnType<T>>();
    
    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key)!;
      }
      
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },

  // Batch operations
  batch: <T>(
    items: T[],
    batchSize: number,
    processor: (batch: T[]) => Promise<void>
  ): Promise<void> => {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    return batches.reduce(
      (promise, batch) => promise.then(() => processor(batch)),
      Promise.resolve()
    );
  },

  // Retry with exponential backoff
  retry: async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i === maxRetries) break;
        
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  },

  // Measure execution time
  measureTime: async <T>(
    fn: () => Promise<T>,
    label: string = 'Operation'
  ): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      console.log(`${label} took ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`${label} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  },

  // Optimize images
  optimizeImage: (url: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}): string => {
    const params = new URLSearchParams();
    
    if (options.width) params.append('w', options.width.toString());
    if (options.height) params.append('h', options.height.toString());
    if (options.quality) params.append('q', options.quality.toString());
    if (options.format) params.append('f', options.format);
    
    return `${url}?${params.toString()}`;
  },

  // Preload resources
  preload: (resources: Array<{
    href: string;
    as?: string;
    type?: string;
    crossorigin?: boolean;
  }>): void => {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      if (resource.as) link.setAttribute('as', resource.as);
      if (resource.type) link.type = resource.type;
      if (resource.crossorigin) link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }
};

// Performance Configuration
export const performanceConfig = {
  // Caching
  caching: {
    redis: {
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
      ttl: 3600 // 1 hour default
    },
    memory: {
      maxSize: 100, // Maximum number of items
      ttl: 300 // 5 minutes default
    }
  },

  // Code splitting
  codeSplitting: {
    chunkSize: 244 * 1024, // 244KB chunks
    maxChunks: 10,
    minChunkSize: 20 * 1024 // 20KB minimum
  },

  // Image optimization
  images: {
    formats: ['webp', 'jpeg'],
    sizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    quality: 80,
    placeholder: 'blur'
  },

  // Bundle analysis
  bundle: {
    analyze: process.env.NODE_ENV === 'development',
    reportPath: './bundle-analysis.html',
    exclude: ['node_modules']
  },

  // Performance budgets
  budgets: {
    javascript: {
      size: '500KB',
      time: '3s'
    },
    css: {
      size: '100KB',
      time: '1s'
    },
    images: {
      size: '1MB',
      time: '2s'
    }
  }
};

// Performance Monitoring
export const performanceMonitoring = {
  // Track Core Web Vitals
  trackCoreWebVitals: () => {
    if (typeof window !== 'undefined') {
      // LCP (Largest Contentful Paint)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (First Input Delay)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if ('processingStart' in entry) {
            const eventEntry = entry as PerformanceEventTiming;
            console.log('FID:', eventEntry.processingStart - eventEntry.startTime);
          }
        });
      }).observe({ entryTypes: ['first-input'] });

      // CLS (Cumulative Layout Shift)
      new PerformanceObserver((list) => {
        let cls = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        });
        console.log('CLS:', cls);
      }).observe({ entryTypes: ['layout-shift'] });
    }
  },

  // Track API performance
  trackApiPerformance: (req: any, res: any, startTime: number) => {
    const duration = Date.now() - startTime;
    const path = req.url;
    const method = req.method;
    
    console.log(`API ${method} ${path} took ${duration}ms`);
    
    // Send to monitoring service
    if (duration > 1000) {
      console.warn(`Slow API call: ${method} ${path} (${duration}ms)`);
    }
  },

  // Track component render time
  trackComponentRender: (componentName: string, renderTime: number) => {
    console.log(`Component ${componentName} rendered in ${renderTime}ms`);
    
    if (renderTime > 16) { // 60fps threshold
      console.warn(`Slow component render: ${componentName} (${renderTime}ms)`);
    }
  },

  // Track bundle size
  trackBundleSize: (bundleStats: any) => {
    const totalSize = bundleStats.totalSize;
    const budget = 500 * 1024; // 500KB budget
    
    console.log(`Bundle size: ${(totalSize / 1024).toFixed(2)}KB`);
    
    if (totalSize > budget) {
      console.warn(`Bundle size exceeds budget: ${(totalSize / 1024).toFixed(2)}KB > ${(budget / 1024).toFixed(2)}KB`);
    }
  }
};

// Performance Optimization Hooks
export const usePerformanceOptimizations = () => {
  // React hooks for performance optimization
  return {
    // Memoize expensive calculations
    useMemoizedValue: <T>(value: T, deps: any[]): T => {
      const [memoizedValue, setMemoizedValue] = React.useState<T>(value);
      
      React.useEffect(() => {
        setMemoizedValue(value);
      }, deps);
      
      return memoizedValue;
    },

    // Debounce user input
    useDebouncedValue: <T>(value: T, delay: number): T => {
      const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
      
      React.useEffect(() => {
        const handler = setTimeout(() => {
          setDebouncedValue(value);
        }, delay);
        
        return () => {
          clearTimeout(handler);
        };
      }, [value, delay]);
      
      return debouncedValue;
    },

    // Intersection observer for lazy loading
    useIntersectionObserver: (options: IntersectionObserverInit = {}) => {
      const [isIntersecting, setIsIntersecting] = React.useState(false);
      const [ref, setRef] = React.useState<HTMLElement | null>(null);
      
      React.useEffect(() => {
        if (!ref) return;
        
        const observer = new IntersectionObserver(([entry]) => {
          setIsIntersecting(entry.isIntersecting);
        }, options);
        
        observer.observe(ref);
        
        return () => {
          observer.disconnect();
        };
      }, [ref, options]);
      
      return [setRef, isIntersecting] as const;
    }
  };
};

// Export default performance instance
export default {
  performanceMonitoring,
  performanceUtils,
  performanceConfig,
  usePerformanceOptimizations
}; 