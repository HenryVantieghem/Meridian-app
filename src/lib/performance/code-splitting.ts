import React, { ComponentType } from 'react';
import dynamic from 'next/dynamic';

// Performance monitoring
export interface PerformanceMetrics {
  loadTime: number;
  bundleSize: number;
  componentCount: number;
  cacheHitRate: number;
}

// Lazy loading with performance tracking
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    loading?: ComponentType<any>;
    ssr?: boolean;
    preload?: boolean;
  } = {}
) => {
  // const LazyComponent = lazy(importFn);
  
  return dynamic(() => importFn(), {
    loading: options.loading ? () => React.createElement(options.loading!) : undefined,
    ssr: options.ssr ?? true,
  });
};

// Route-based code splitting
export const routeComponents = {
  // Dashboard components
  Dashboard: createLazyComponent(() => import('@/app/(dashboard)/dashboard/page')),
  // Settings: createLazyComponent(() => import('@/app/(dashboard)/settings/page')),
  // Profile: createLazyComponent(() => import('@/app/(dashboard)/profile/page')),
  
  // Onboarding components
  // Onboarding: createLazyComponent(() => import('@/app/onboarding/page')),
  // Persona: createLazyComponent(() => import('@/app/onboarding/persona/page')),
  // Preferences: createLazyComponent(() => import('@/app/onboarding/preferences/page')),
  // Preview: createLazyComponent(() => import('@/app/onboarding/preview/page')),
  
  // Marketing components
  Landing: createLazyComponent(() => import('@/app/page')),
  Pricing: createLazyComponent(() => import('@/components/marketing/Pricing')),
  
  // Email components
  EmailComposer: createLazyComponent(() => import('@/components/email/ReplyComposer')),
  // EmailTemplates: createLazyComponent(() => import('@/components/email')),
  
  // AI components
  // AIAnalyzer: createLazyComponent(() => import('@/components/ai/EmailAnalyzer')),
  // AIGenerator: createLazyComponent(() => import('@/components/ai/ReplyGenerator')),
  
  // Billing components
  BillingPortal: createLazyComponent(() => import('@/components/billing/BillingPortal')),
  PricingCards: createLazyComponent(() => import('@/components/billing/PricingCard')),
} as const;

// Feature-based code splitting
export const featureModules = {
  // Email processing
  emailProcessing: () => import('@/lib/email'),
  
  // AI services
  // aiServices: () => import('@/lib/ai'),
  
  // Billing services
  // billingServices: () => import('@/lib/stripe'),
  
  // Database operations
  // databaseOps: () => import('@/lib/db'),
  
  // Authentication
  // authServices: () => import('@/lib/auth'),
} as const;

// Performance-aware component wrapper
export const withPerformanceTracking = <P extends object>(
  Component: ComponentType<P>,
  options: {
    name: string;
    priority?: 'high' | 'normal' | 'low';
    preload?: boolean;
  }
) => {
  const WrappedComponent = (props: P) => {
    const startTime = performance.now();
    
    // Track component load time
    React.useEffect(() => {
      const loadTime = performance.now() - startTime;
      
      // Report to analytics
      if (typeof window !== 'undefined') {
        window.gtag?.('event', 'component_load', {
          component_name: options.name,
          load_time: loadTime,
          priority: options.priority || 'normal',
        });
      }
    }, []);
    
    return React.createElement(Component, props);
  };
  
  WrappedComponent.displayName = `withPerformanceTracking(${options.name})`;
  
  return WrappedComponent;
};

// Bundle size analyzer
export const analyzeBundleSize = async (): Promise<{
  totalSize: number;
  chunks: Array<{ name: string; size: number; percentage: number }>;
  recommendations: string[];
}> => {
  // This would integrate with webpack-bundle-analyzer or similar
  return {
    totalSize: 0,
    chunks: [],
    recommendations: [],
  };
};

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload dashboard components
  // routeComponents.Dashboard.preload?.();
  // routeComponents.Settings.preload?.();
  
  // Preload core features
  // featureModules.emailProcessing();
  // featureModules.aiServices();
};

// Lazy loading with intersection observer
export const useIntersectionObserver = (
  ref: React.RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );
    
    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
    };
  }, [ref, options]);
  
  return isIntersecting;
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({
    loadTime: 0,
    bundleSize: 0,
    componentCount: 0,
    cacheHitRate: 0,
  });
  
  React.useEffect(() => {
    // Monitor page load performance
    if (typeof window !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            setMetrics(prev => ({
              ...prev,
              loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
            }));
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      
      return () => observer.disconnect();
    }
  }, []);
  
  return metrics;
};

// Export types
export type RouteComponentKey = keyof typeof routeComponents;
export type FeatureModuleKey = keyof typeof featureModules; 