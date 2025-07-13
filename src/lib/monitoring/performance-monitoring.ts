import { NextRequest, NextResponse } from 'next/server';

// Performance metrics interface
export interface PerformanceMetrics {
  timestamp: Date;
  requestId: string;
  userId?: string;
  sessionId?: string;
  url: string;
  method: string;
  userAgent?: string;
  ip?: string;
  
  // Timing metrics
  totalTime: number;
  serverTime: number;
  databaseTime: number;
  aiTime: number;
  emailTime: number;
  
  // Resource metrics
  memoryUsage: number;
  cpuUsage: number;
  
  // Response metrics
  statusCode: number;
  responseSize: number;
  
  // Error metrics
  hasError: boolean;
  errorType?: string;
  
  // Custom metrics
  customMetrics?: Record<string, number>;
}

// Core Web Vitals interface
export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

// Performance monitoring service
export class PerformanceMonitoringService {
  private metrics: PerformanceMetrics[] = [];
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;

    // Set up performance observers
    if (typeof window !== 'undefined') {
      this.setupWebVitalsObserver();
      this.setupResourceObserver();
      this.setupNavigationObserver();
    }

    this.isInitialized = true;
  }

  /**
   * Track API performance
   */
  async trackApiPerformance(
    req: NextRequest,
    res: NextResponse,
    startTime: number,
    customMetrics?: Record<string, number>
  ): Promise<void> {
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    const metrics: PerformanceMetrics = {
      timestamp: new Date(),
      requestId: this.generateRequestId(),
      userId: req.headers.get('x-user-id') || undefined,
      sessionId: req.headers.get('x-session-id') || undefined,
      url: req.url,
      method: req.method,
      userAgent: req.headers.get('user-agent') || undefined,
      ip: req.headers.get('x-forwarded-for') || undefined,
      totalTime,
      serverTime: totalTime, // Will be updated with actual breakdown
      databaseTime: 0,
      aiTime: 0,
      emailTime: 0,
      memoryUsage: process.memoryUsage().heapUsed,
      cpuUsage: 0, // Would need additional monitoring
      statusCode: res.status,
      responseSize: parseInt(res.headers.get('content-length') || '0'),
      hasError: res.status >= 400,
      customMetrics
    };

    this.metrics.push(metrics);
    await this.sendMetrics(metrics);
  }

  /**
   * Track database query performance
   */
  trackDatabaseQuery(
    query: string,
    duration: number,
    requestId: string
  ): void {
    const metric = {
      type: 'database_query',
      query: this.sanitizeQuery(query),
      duration,
      requestId,
      timestamp: new Date()
    };

    this.sendMetric(metric);
  }

  /**
   * Track AI operation performance
   */
  trackAIOperation(
    operation: string,
    duration: number,
    tokensUsed: number,
    requestId: string
  ): void {
    const metric = {
      type: 'ai_operation',
      operation,
      duration,
      tokensUsed,
      requestId,
      timestamp: new Date()
    };

    this.sendMetric(metric);
  }

  /**
   * Track email operation performance
   */
  trackEmailOperation(
    operation: string,
    duration: number,
    emailCount: number,
    requestId: string
  ): void {
    const metric = {
      type: 'email_operation',
      operation,
      duration,
      emailCount,
      requestId,
      timestamp: new Date()
    };

    this.sendMetric(metric);
  }

  /**
   * Track Core Web Vitals
   */
  trackWebVitals(vitals: CoreWebVitals): void {
    const metric = {
      type: 'web_vitals',
      ...vitals,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.sendMetric(metric);
  }

  /**
   * Track user interaction
   */
  trackUserInteraction(
    action: string,
    element: string,
    duration?: number
  ): void {
    const metric = {
      type: 'user_interaction',
      action,
      element,
      duration,
      timestamp: new Date(),
      url: window.location.href
    };

    this.sendMetric(metric);
  }

  /**
   * Track page load performance
   */
  trackPageLoad(): void {
    if (typeof window === 'undefined') return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const metric = {
        type: 'page_load',
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
        timestamp: new Date(),
        url: window.location.href
      };

      this.sendMetric(metric);
    }
  }

  /**
   * Track resource loading performance
   */
  trackResourceLoad(): void {
    if (typeof window === 'undefined') return;

    const resources = performance.getEntriesByType('resource');
    
    resources.forEach(resource => {
      let size = 0;
      if ('transferSize' in resource) {
        size = (resource as PerformanceResourceTiming).transferSize;
      }
      let initiatorType = '';
      if ('initiatorType' in resource) {
        initiatorType = (resource as PerformanceResourceTiming).initiatorType;
      }
      const metric = {
        type: 'resource_load',
        name: resource.name,
        duration: resource.duration,
        size,
        initiatorType,
        timestamp: new Date()
      };

      this.sendMetric(metric);
    });
  }

  /**
   * Set up Core Web Vitals observer
   */
  private setupWebVitalsObserver(): void {
    if (typeof window === 'undefined') return;

    // LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.trackWebVitals({
        lcp: lastEntry.startTime,
        fid: 0, // Will be updated by FID observer
        cls: 0, // Will be updated by CLS observer
        fcp: 0, // Will be updated by FCP observer
        ttfb: 0 // Will be updated by navigation observer
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // FID (First Input Delay)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if ('processingStart' in entry) {
          const eventEntry = entry as PerformanceEventTiming;
          this.trackWebVitals({
            lcp: 0,
            fid: eventEntry.processingStart - eventEntry.startTime,
            cls: 0,
            fcp: 0,
            ttfb: 0
          });
        }
      });
    }).observe({ entryTypes: ['first-input'] });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if ('hadRecentInput' in entry && !(entry as { hadRecentInput?: boolean }).hadRecentInput) {
          clsValue += (entry as { value?: number }).value || 0;
        }
      });
      
      this.trackWebVitals({
        lcp: 0,
        fid: 0,
        cls: clsValue,
        fcp: 0,
        ttfb: 0
      });
    }).observe({ entryTypes: ['layout-shift'] });

    // FCP (First Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.trackWebVitals({
          lcp: 0,
          fid: 0,
          cls: 0,
          fcp: entry.startTime,
          ttfb: 0
        });
      });
    }).observe({ entryTypes: ['paint'] });
  }

  /**
   * Set up resource observer
   */
  private setupResourceObserver(): void {
    if (typeof window === 'undefined') return;

    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(_entry => {
        this.trackResourceLoad();
      });
    }).observe({ entryTypes: ['resource'] });
  }

  /**
   * Set up navigation observer
   */
  private setupNavigationObserver(): void {
    if (typeof window === 'undefined') return;

    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        const navigation = entry as PerformanceNavigationTiming;
        this.trackWebVitals({
          lcp: 0,
          fid: 0,
          cls: 0,
          fcp: 0,
          ttfb: navigation.responseStart - navigation.requestStart
        });
      });
    }).observe({ entryTypes: ['navigation'] });
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sanitize database query for logging
   */
  private sanitizeQuery(query: string): string {
    return query
      .replace(/\s+/g, ' ')
      .replace(/['"]/g, '?')
      .substring(0, 200);
  }

  /**
   * Send metrics to monitoring service
   */
  private async sendMetrics(metrics: PerformanceMetrics): Promise<void> {
    try {
      // Send to external monitoring service (e.g., DataDog, New Relic, etc.)
      if (process.env.MONITORING_ENDPOINT) {
        await fetch(process.env.MONITORING_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MONITORING_API_KEY}`
          },
          body: JSON.stringify(metrics)
        });
      }

      // Log locally in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Performance metric:', metrics);
      }
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }

  /**
   * Send individual metric
   */
  private async sendMetric(metric: unknown): Promise<void> {
    try {
      // Send to external monitoring service
      if (process.env.MONITORING_ENDPOINT) {
        await fetch(process.env.MONITORING_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MONITORING_API_KEY}`
          },
          body: JSON.stringify(metric)
        });
      }

      // Log locally in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Performance metric:', metric);
      }
    } catch (error) {
      console.error('Failed to send performance metric:', error);
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    topSlowEndpoints: Array<{ url: string; avgTime: number }>;
  } {
    const totalRequests = this.metrics.length;
    const averageResponseTime = this.metrics.reduce((sum, m) => sum + m.totalTime, 0) / totalRequests;
    const errorRate = this.metrics.filter(m => m.hasError).length / totalRequests;

    // Group by URL and calculate average time
    const endpointTimes = this.metrics.reduce((acc, metric) => {
      const url = metric.url;
      if (!acc[url]) {
        acc[url] = { count: 0, totalTime: 0 };
      }
      acc[url].count++;
      acc[url].totalTime += metric.totalTime;
      return acc;
    }, {} as Record<string, { count: number; totalTime: number }>);

    const topSlowEndpoints = Object.entries(endpointTimes)
      .map(([url, data]) => ({
        url,
        avgTime: data.totalTime / data.count
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10);

    return {
      totalRequests,
      averageResponseTime,
      errorRate,
      topSlowEndpoints
    };
  }

  /**
   * Clear old metrics
   */
  clearOldMetrics(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = new Date(Date.now() - maxAge);
    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoff);
  }
}

// Performance middleware for API routes
export function performanceMiddleware(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const monitoring = new PerformanceMonitoringService();
  const startTime = Date.now();

  return handler(req).then(async (response) => {
    await monitoring.trackApiPerformance(req, response, startTime);
    return response;
  }).catch(async (error) => {
    const errorResponse = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    await monitoring.trackApiPerformance(req, errorResponse, startTime, {
      errorType: error.constructor.name
    });
    throw error;
  });
}

// Export singleton
export const performanceMonitoring = new PerformanceMonitoringService(); 