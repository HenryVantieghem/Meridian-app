// import { NextRequest, NextResponse } from 'next/server';
// import { logger } from '@/lib/monitoring/logging';

// Performance monitoring configuration
export const MONITORING_CONFIG = {
  // Performance thresholds
  THRESHOLDS: {
    PAGE_LOAD: 2000, // 2 seconds
    API_RESPONSE: 500, // 500ms
    DATABASE_QUERY: 100, // 100ms
    BUNDLE_SIZE: 500000, // 500KB
  },
  
  // Error monitoring
  ERROR: {
    MAX_ERRORS_PER_MINUTE: 10,
    ERROR_SAMPLING_RATE: 0.1, // 10%
  },
  
  // Analytics
  ANALYTICS: {
    SAMPLE_RATE: 0.1, // 10%
    BATCH_SIZE: 10,
    FLUSH_INTERVAL: 30000, // 30 seconds
  },
} as const;

// Performance metrics interface
export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  fcp?: number; // First Contentful Paint
  
  // Custom metrics
  pageLoadTime?: number;
  apiResponseTime?: number;
  databaseQueryTime?: number;
  bundleSize?: number;
  cacheHitRate?: number;
  
  // User experience
  interactionTime?: number;
  scrollDepth?: number;
  sessionDuration?: number;

  // Timestamp
  timestamp?: Date;
}

// Error tracking interface
export interface ErrorEvent {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

// Analytics event interface
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

// Performance monitoring class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private errors: ErrorEvent[] = [];
  private analytics: AnalyticsEvent[] = [];
  private flushTimer?: NodeJS.Timeout;

  private constructor() {
    this.startPeriodicFlush();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track Core Web Vitals
  trackWebVitals(metrics: Partial<PerformanceMetrics>): void {
    this.metrics.push({
      ...metrics,
      timestamp: new Date(),
    });

    // Check thresholds
    this.checkThresholds(metrics);
  }

  // Track API performance
  trackApiPerformance(
    endpoint: string,
    duration: number,
    status: number,
    userId?: string
  ): void {
    const metric: PerformanceMetrics = {
      apiResponseTime: duration,
      timestamp: new Date(),
    };

    this.metrics.push(metric);

    // Track to analytics
    this.trackEvent('api_performance', {
      endpoint,
      duration,
      status,
      userId,
    });

    // Alert on slow APIs
    if (duration > MONITORING_CONFIG.THRESHOLDS.API_RESPONSE) {
      this.trackError({
        message: `Slow API response: ${endpoint}`,
        severity: 'medium',
        context: { endpoint, duration, status },
      });
    }
  }

  // Track database performance
  trackDatabasePerformance(
    query: string,
    duration: number,
    userId?: string
  ): void {
    const metric: PerformanceMetrics = {
      databaseQueryTime: duration,
      timestamp: new Date(),
    };

    this.metrics.push(metric);

    // Track to analytics
    this.trackEvent('database_performance', {
      query: query.substring(0, 100), // Truncate long queries
      duration,
      userId,
    });

    // Alert on slow queries
    if (duration > MONITORING_CONFIG.THRESHOLDS.DATABASE_QUERY) {
      this.trackError({
        message: `Slow database query`,
        severity: 'medium',
        context: { query: query.substring(0, 100), duration },
      });
    }
  }

  // Track errors
  trackError(error: Omit<ErrorEvent, 'timestamp' | 'url' | 'userAgent'>): void {
    const errorEvent: ErrorEvent = {
      ...error,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    };

    this.errors.push(errorEvent);

    // Check error rate
    this.checkErrorRate();

    // Track to analytics
    this.trackEvent('error', {
      message: error.message,
      severity: error.severity,
      context: error.context,
    });
  }

  // Track analytics events
  trackEvent(name: string, properties: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
    };

    this.analytics.push(event);
  }

  // Track AI operations
  trackAIOperation(
    operation: string,
    duration: number,
    success: boolean,
    tokensUsed?: number,
    cost?: number
  ): void {
    this.trackEvent('ai_operation', {
      operation,
      duration,
      success,
      tokensUsed,
      cost,
    });

    // Alert on slow AI operations
    if (duration > 5000) { // 5 seconds
      this.trackError({
        message: `Slow AI operation: ${operation}`,
        severity: 'medium',
        context: { operation, duration, success },
      });
    }
  }

  // Track user interactions
  trackUserInteraction(
    action: string,
    duration: number,
    success: boolean
  ): void {
    this.trackEvent('user_interaction', {
      action,
      duration,
      success,
    });
  }

  // Check performance thresholds
  private checkThresholds(metrics: Partial<PerformanceMetrics>): void {
    if (metrics.pageLoadTime && metrics.pageLoadTime > MONITORING_CONFIG.THRESHOLDS.PAGE_LOAD) {
      this.trackError({
        message: 'Page load time exceeded threshold',
        severity: 'high',
        context: { pageLoadTime: metrics.pageLoadTime },
      });
    }

    if (metrics.bundleSize && metrics.bundleSize > MONITORING_CONFIG.THRESHOLDS.BUNDLE_SIZE) {
      this.trackError({
        message: 'Bundle size exceeded threshold',
        severity: 'medium',
        context: { bundleSize: metrics.bundleSize },
      });
    }
  }

  // Check error rate
  private checkErrorRate(): void {
    const oneMinuteAgo = Date.now() - 60000;
    const recentErrors = this.errors.filter(
      error => error.timestamp > oneMinuteAgo
    );

    if (recentErrors.length > MONITORING_CONFIG.ERROR.MAX_ERRORS_PER_MINUTE) {
      console.warn('High error rate detected:', recentErrors.length, 'errors in the last minute');
      
      // Could trigger alerts here
      this.trackEvent('high_error_rate', {
        errorCount: recentErrors.length,
        timeWindow: '1 minute',
      });
    }
  }

  // Get user ID
  private getUserId(): string | undefined {
    // Implementation would get from auth context
    return undefined;
  }

  // Get session ID
  private getSessionId(): string | undefined {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('sessionId') || undefined;
    }
    return undefined;
  }

  // Start periodic flush
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, MONITORING_CONFIG.ANALYTICS.FLUSH_INTERVAL);
  }

  // Flush data to external services
  private async flush(): Promise<void> {
    try {
      // Flush metrics
      if (this.metrics.length > 0) {
        await this.sendMetrics(this.metrics);
        this.metrics = [];
      }

      // Flush errors
      if (this.errors.length > 0) {
        await this.sendErrors(this.errors);
        this.errors = [];
      }

      // Flush analytics
      if (this.analytics.length > 0) {
        await this.sendAnalytics(this.analytics);
        this.analytics = [];
      }
    } catch (error) {
      console.error('Failed to flush monitoring data:', error);
    }
  }

  // Send metrics to external service
  private async sendMetrics(metrics: PerformanceMetrics[]): Promise<void> {
    // Implementation would send to monitoring service
    console.log('Sending metrics:', metrics.length);
  }

  // Send errors to external service
  private async sendErrors(errors: ErrorEvent[]): Promise<void> {
    // Implementation would send to error tracking service
    console.log('Sending errors:', errors.length);
  }

  // Send analytics to external service
  private async sendAnalytics(events: AnalyticsEvent[]): Promise<void> {
    // Implementation would send to analytics service
    console.log('Sending analytics:', events.length);
  }

  // Get monitoring statistics
  getStats(): {
    metricsCount: number;
    errorsCount: number;
    analyticsCount: number;
    errorRate: number;
  } {
    const oneMinuteAgo = Date.now() - 60000;
    const recentErrors = this.errors.filter(
      error => error.timestamp > oneMinuteAgo
    );

    return {
      metricsCount: this.metrics.length,
      errorsCount: this.errors.length,
      analyticsCount: this.analytics.length,
      errorRate: recentErrors.length,
    };
  }

  // Cleanup
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
  }
}

// Export singleton
export const performanceMonitor = PerformanceMonitor.getInstance(); 