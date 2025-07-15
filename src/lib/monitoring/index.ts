// Monitoring and Observability System
// Central export for all monitoring utilities

import { performanceMonitoring } from "./performance-monitoring";
import { errorTracking, AppError } from "./error-tracking";
import { UserEventType } from "./user-analytics";
import { userAnalytics } from "./user-analytics";
import { rateLimiters } from "../security/rate-limiter";
import { encryptionService } from "../security/encryption";
import { performanceMiddleware } from "./performance-monitoring";
import { securityMiddleware } from "../security/rate-limiter";
import { analyticsMiddleware } from "./user-analytics";
import { dataRetentionService } from "../security/data-retention";

// Error Tracking
export {
  ErrorTrackingService,
  AppError,
  ErrorType,
  ErrorSeverity,
  createError,
  errorTracking,
} from "./error-tracking";

// Performance Monitoring
export {
  PerformanceMonitoringService,
  performanceMonitoring,
} from "./performance-monitoring";
export type {
  PerformanceMetrics,
  CoreWebVitals,
} from "./performance-monitoring";

// User Analytics
export {
  UserAnalyticsService,
  UserEventType,
  userAnalytics,
} from "./user-analytics";
export type { UserProperties, UserEvent } from "./user-analytics";

// Security Monitoring
export {
  rateLimiters,
  createRateLimitMiddleware,
  DDoSProtection,
  RequestSizeLimiter,
  securityHeaders,
  validateInput,
  securityMiddleware,
} from "../security/rate-limiter";

// Input Validation
export {
  schemas,
  createValidationMiddleware,
  createQueryValidationMiddleware,
  createPathValidationMiddleware,
  sanitizers,
  formatValidationError,
} from "../security/input-validation";

// Encryption and Security
export {
  EncryptionService,
  SecureKeyManager,
  DataProtection,
  encryptionService,
  secureKeyManager,
  dataProtection,
} from "../security/encryption";

// Backup and Recovery
export {
  BackupRecoveryService,
  backupRecoveryService,
} from "../security/backup-recovery";
export type { Backup, Recovery } from "../security/backup-recovery";

// Data Retention
export {
  DataRetentionService,
  dataRetentionService,
} from "../security/data-retention";
export type {
  RetentionPolicy,
  DataCategory,
  RetentionRule,
} from "../security/data-retention";

// Monitoring Utilities
export const monitoringUtils = {
  // Performance tracking
  trackApiPerformance: (req: unknown, res: unknown, startTime: number) => {
    return performanceMonitoring.trackApiPerformance(req, res, startTime);
  },

  // Error tracking
  captureError: (error: Error | AppError, context?: unknown) => {
    return errorTracking.captureError(error, context);
  },

  // User analytics
  trackEvent: (
    userId: string,
    sessionId: string,
    type: UserEventType,
    properties?: unknown,
  ) => {
    return userAnalytics.trackEvent(userId, sessionId, type, properties);
  },

  // Security monitoring
  checkRateLimit: (type: keyof typeof rateLimiters, req: unknown) => {
    return rateLimiters[type].middleware(req);
  },

  // Data protection
  encryptData: (data: string) => {
    return encryptionService.encrypt(data);
  },

  decryptData: (encryptedData: string) => {
    return encryptionService.decrypt(encryptedData);
  },
};

// Monitoring Middleware
export const monitoringMiddleware = {
  // Performance middleware
  performance: performanceMiddleware,

  // Security middleware
  security: (req: unknown) => {
    return securityMiddleware(req);
  },

  // Analytics middleware
  analytics: analyticsMiddleware,
};

// Monitoring Configuration
export const monitoringConfig = {
  // Error tracking
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.APP_VERSION,
  },

  // Performance monitoring
  performance: {
    sampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  },

  // Rate limiting
  rateLimiting: {
    api: { windowMs: 60000, maxRequests: 100 },
    auth: { windowMs: 900000, maxRequests: 5 },
    ai: { windowMs: 60000, maxRequests: 10 },
    email: { windowMs: 300000, maxRequests: 50 },
  },

  // Data retention
  retention: {
    emailData: "365_days",
    aiAnalysis: "90_days",
    auditLogs: "90_days",
    errorLogs: "30_days",
    analytics: "365_days",
    backupData: "90_days",
  },
};

// Health Check Utilities
export const healthCheck = {
  // Database health
  async checkDatabase(): Promise<boolean> {
    try {
      // Implementation would check database connectivity
      return true;
    } catch (error) {
      return false;
    }
  },

  // External services health
  async checkExternalServices(): Promise<Record<string, boolean>> {
    const services = {
      openai: false,
      stripe: false,
      resend: false,
      supabase: false,
    };

    try {
      // Check OpenAI
      // Check Stripe
      // Check Resend
      // Check Supabase
    } catch (error) {
      console.error("Health check failed:", error);
    }

    return services;
  },

  // Overall system health
  async checkSystemHealth(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    checks: Record<string, boolean>;
    timestamp: Date;
  }> {
    const dbHealth = await this.checkDatabase();
    const externalHealth = await this.checkExternalServices();

    const allChecks = {
      database: dbHealth,
      ...externalHealth,
    };

    const healthyChecks = Object.values(allChecks).filter(Boolean).length;
    const totalChecks = Object.keys(allChecks).length;

    let status: "healthy" | "degraded" | "unhealthy";
    if (healthyChecks === totalChecks) {
      status = "healthy";
    } else if (healthyChecks >= totalChecks * 0.8) {
      status = "degraded";
    } else {
      status = "unhealthy";
    }

    return {
      status,
      checks: allChecks,
      timestamp: new Date(),
    };
  },
};

// Monitoring Dashboard Data
export const getMonitoringDashboardData = async () => {
  const [
    errorStats,
    performanceStats,
    userStats,
    securityStats,
    retentionStats,
    systemHealth,
  ] = await Promise.all([
    { total: 0, recent: 0 }, // Placeholder for error stats
    performanceMonitoring.getPerformanceSummary(),
    userAnalytics.getUserEngagement("all"),
    { rateLimitHits: 0, securityEvents: 0 },
    { retentionStats: { total: 0, processed: 0, deleted: 0 } }, // Placeholder for retention stats
    healthCheck.checkSystemHealth(),
  ]);

  return {
    errors: errorStats,
    performance: performanceStats,
    users: userStats,
    security: securityStats,
    retention: retentionStats,
    health: systemHealth,
    timestamp: new Date(),
  };
};

// Export default monitoring instance
export default {
  errorTracking,
  performanceMonitoring,
  userAnalytics,
  encryptionService,
  dataRetentionService,
  monitoringUtils,
  monitoringMiddleware,
  monitoringConfig,
  healthCheck,
  getMonitoringDashboardData,
};
