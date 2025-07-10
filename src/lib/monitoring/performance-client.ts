"use client";
import React, { useEffect } from 'react';
import { logger } from '@/lib/monitoring/logging';
import { performanceMonitor } from './performance';

interface PerformanceMonitoringOptions {
  name: string;
  trackMetrics?: boolean;
}

export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  options: PerformanceMonitoringOptions = { name: 'Unknown' }
) {
  return function PerformanceMonitoredComponent(props: P) {
    const componentName = Component.displayName || Component.name || 'Unknown';
    
    useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Log performance metrics
        logger.info('Component Performance', {
          component: componentName,
          duration,
          timestamp: new Date().toISOString(),
        });
        
        // Send to monitoring service if configured
        if (process.env.NEXT_PUBLIC_PERFORMANCE_MONITORING_URL) {
          fetch(process.env.NEXT_PUBLIC_PERFORMANCE_MONITORING_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              component: componentName,
              duration,
              timestamp: new Date().toISOString(),
            }),
          }).catch(console.error);
        }
      };
    }, [componentName]);
    
    return React.createElement(Component, props);
  };
}

// Web Vitals tracking hook
export const useWebVitals = () => {
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track LCP
    const trackLCP = () => {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          performanceMonitor.trackWebVitals({
            lcp: entry.startTime,
          });
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    };

    // Track FID
    const trackFID = () => {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // FID is only available on PerformanceEventTiming
          if ('processingStart' in entry) {
            const eventEntry = entry as PerformanceEventTiming;
            performanceMonitor.trackWebVitals({
              fid: eventEntry.processingStart - eventEntry.startTime,
            });
          }
        }
      }).observe({ entryTypes: ['first-input'] });
    };

    // Track CLS
    const trackCLS = () => {
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        performanceMonitor.trackWebVitals({
          cls: clsValue,
        });
      }).observe({ entryTypes: ['layout-shift'] });
    };

    trackLCP();
    trackFID();
    trackCLS();
  }, []);
};

// Error boundary with monitoring
export const withErrorMonitoring = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P) => {
    React.useEffect(() => {
      const handleError = (error: ErrorEvent) => {
        performanceMonitor.trackError({
          message: error.message,
          severity: 'high',
          context: { type: 'unhandled_error' },
        });
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        performanceMonitor.trackError({
          message: event.reason?.message || 'Unhandled promise rejection',
          severity: 'high',
          context: { type: 'unhandled_rejection' },
        });
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }, []);

    return React.createElement(Component, props);
  };
}; 