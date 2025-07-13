import { NextRequest, NextResponse } from 'next/server';

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

// Log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  duration?: number;
  error?: Error;
}

// Logger class
export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private isProduction: boolean;

  constructor() {
    const logLevelStr = process.env.LOG_LEVEL?.toUpperCase();
    const logLevelMap: Record<string, LogLevel> = {
      'DEBUG': LogLevel.DEBUG,
      'INFO': LogLevel.INFO,
      'WARN': LogLevel.WARN,
      'ERROR': LogLevel.ERROR,
      'FATAL': LogLevel.FATAL,
    };
    this.logLevel = logLevelStr && logLevelMap[logLevelStr] !== undefined ? logLevelMap[logLevelStr] : LogLevel.INFO;
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (level < this.logLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    if (this.isProduction) {
      // In production, send to external logging service
      this.sendToExternalService(entry);
    } else {
      // In development, console log
      this.consoleLog(entry);
    }
  }

  private consoleLog(entry: LogEntry): void {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
    const colors = ['\x1b[36m', '\x1b[32m', '\x1b[33m', '\x1b[31m', '\x1b[35m'];
    const reset = '\x1b[0m';

    const color = colors[entry.level];
    const levelName = levelNames[entry.level];

    console.log(
      `${color}[${levelName}]${reset} ${entry.timestamp} - ${entry.message}`,
      entry.context ? JSON.stringify(entry.context, null, 2) : ''
    );
  }

  private sendToExternalService(entry: LogEntry): void {
    // Send to external logging service (e.g., Sentry, LogRocket, etc.)
    // This would integrate with your chosen logging service
    fetch(process.env.LOGGING_WEBHOOK_URL || '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(() => {
      // Fallback to console if external service fails
      this.consoleLog(entry);
    });
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, { ...context, error: error?.stack });
  }

  fatal(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.FATAL, message, { ...context, error: error?.stack });
  }
}

// Request logging middleware
export const withRequestLogging = (
  handler: (req: NextRequest) => Promise<NextResponse>
) => {
  return async (req: NextRequest): Promise<NextResponse> => {
    const logger = Logger.getInstance();
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    // Log request start
    logger.info('Request started', {
      method: req.method,
      url: req.url,
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for'),
      requestId,
    });

    try {
      const response = await handler(req);
      const duration = Date.now() - startTime;

      // Log successful request
      logger.info('Request completed', {
        method: req.method,
        url: req.url,
        status: response.status,
        duration,
        requestId,
      });

      // Add request ID to response headers
      response.headers.set('X-Request-ID', requestId);
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error
      logger.error('Request failed', error as Error, {
        method: req.method,
        url: req.url,
        duration,
        requestId,
      });

      throw error;
    }
  };
};

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getMetricStats(name: string): { avg: number; min: number; max: number; count: number } {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { avg, min, max, count: values.length };
  }

  recordAPIPerformance(endpoint: string, duration: number): void {
    this.recordMetric(`api.${endpoint}`, duration);
  }

  recordDatabaseQuery(table: string, duration: number): void {
    this.recordMetric(`db.${table}`, duration);
  }

  recordAIOperation(operation: string, duration: number): void {
    this.recordMetric(`ai.${operation}`, duration);
  }

  getPerformanceReport(): Record<string, unknown> {
    const report: Record<string, unknown> = {};
    
    for (const [name] of this.metrics.entries()) {
      report[name] = this.getMetricStats(name);
    }

    return report;
  }
}

// Error tracking
export class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: Error[] = [];

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  trackError(error: Error, context?: Record<string, unknown>): void {
    const logger = Logger.getInstance();
    logger.error('Application error', error, context);
    
    this.errors.push(error);

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(error, context);
    }
  }

  private sendToErrorService(error: Error, context?: Record<string, unknown>): void {
    // Send to error tracking service (e.g., Sentry)
    fetch(process.env.ERROR_TRACKING_WEBHOOK_URL || '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Fallback if error service fails
    });
  }

  getErrorStats(): { total: number; recent: number } {
    // const now = Date.now();
    // const oneHourAgo = now - 60 * 60 * 1000;
    
    const recent = this.errors.filter(() => {
      // This is a simplified check - in practice you'd store timestamps
      return true; // Assume all errors are recent for demo
    }).length;

    return {
      total: this.errors.length,
      recent,
    };
  }
}

// User analytics
export class UserAnalytics {
  private static instance: UserAnalytics;
  private events: Array<{
    userId: string;
    event: string;
    properties: Record<string, unknown>;
    timestamp: string;
  }> = [];

  static getInstance(): UserAnalytics {
    if (!UserAnalytics.instance) {
      UserAnalytics.instance = new UserAnalytics();
    }
    return UserAnalytics.instance;
  }

  trackEvent(userId: string, event: string, properties: Record<string, unknown> = {}): void {
    this.events.push({ userId, event, properties, timestamp: new Date().toISOString() });
    this.sendToAnalyticsService({ userId, event, properties });
  }

  private sendToAnalyticsService(eventData: unknown): void {
    // Send to analytics service
    if (process.env.NODE_ENV === 'production') {
      fetch(process.env.ANALYTICS_WEBHOOK_URL || '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      }).catch(() => {
        // Fallback if analytics service fails
      });
    }
  }

  getUserEvents(userId: string): unknown[] {
    return this.events.filter(e => e.userId === userId);
  }

  getEventStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    for (const event of this.events) {
      stats[event.event] = (stats[event.event] || 0) + 1;
    }

    return stats;
  }
}

// Health check monitoring
export class HealthMonitor {
  private static instance: HealthMonitor;
  private checks: Map<string, () => Promise<boolean>> = new Map();

  static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  addHealthCheck(name: string, check: () => Promise<boolean>): void {
    this.checks.set(name, check);
  }

  async runHealthChecks(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [name, check] of this.checks.entries()) {
      try {
        results[name] = await check();
      } catch (error) {
        results[name] = false;
      }
    }

    return results;
  }

  async isHealthy(): Promise<boolean> {
    const checks = await this.runHealthChecks();
    return Object.values(checks).every(result => result);
  }
}

// Security event logging
export class SecurityLogger {
  private static instance: SecurityLogger;
  private events: Array<{
    type: string;
    details: Record<string, unknown>;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> = [];

  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  logSecurityEvent(
    type: string,
    details: Record<string, unknown>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    this.events.push({ type, details, timestamp: new Date().toISOString(), severity });
    this.sendToSecurityService({ type, details, severity });
  }

  private sendToSecurityService(event: unknown): void {
    // Send to security service
    if (process.env.NODE_ENV === 'production') {
      fetch(process.env.SECURITY_WEBHOOK_URL || '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch(() => {
        // Fallback if security service fails
      });
    }
  }

  getSecurityEvents(): unknown[] {
    return this.events;
  }

  getSecurityStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    for (const event of this.events) {
      stats[event.type] = (stats[event.type] || 0) + 1;
    }

    return stats;
  }
}

// Export singleton instances
export const logger = Logger.getInstance();
export const performanceMonitor = PerformanceMonitor.getInstance();
export const errorTracker = ErrorTracker.getInstance();
export const userAnalytics = UserAnalytics.getInstance();
export const healthMonitor = HealthMonitor.getInstance();
export const securityLogger = SecurityLogger.getInstance(); 