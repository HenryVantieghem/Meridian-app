import { NextRequest } from "next/server";

export interface HealthMetrics {
  timestamp: string;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  activeConnections: number;
  responseTime: number;
  errorRate: number;
  requestCount: number;
}

export interface ErrorReport {
  timestamp: string;
  error: string;
  stack?: string;
  userId?: string;
  sessionId?: string;
  url: string;
  userAgent: string;
  ip: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface PerformanceMetrics {
  timestamp: string;
  pageLoadTime: number;
  apiResponseTime: number;
  databaseQueryTime: number;
  aiProcessingTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

class ProductionMonitor {
  private static instance: ProductionMonitor;
  private healthMetrics: HealthMetrics[] = [];
  private errorReports: ErrorReport[] = [];
  private performanceMetrics: PerformanceMetrics[] = [];
  private startTime: number = Date.now();

  private constructor() {
    this.initializeMonitoring();
  }

  public static getInstance(): ProductionMonitor {
    if (!ProductionMonitor.instance) {
      ProductionMonitor.instance = new ProductionMonitor();
    }
    return ProductionMonitor.instance;
  }

  private initializeMonitoring(): void {
    // Set up periodic health checks
    setInterval(() => {
      this.collectHealthMetrics();
    }, 60000); // Every minute

    // Set up error tracking
    this.setupErrorHandling();

    // Set up performance monitoring
    this.setupPerformanceMonitoring();
  }

  private collectHealthMetrics(): void {
    const metrics: HealthMetrics = {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      activeConnections: 0, // Would need to track actual connections
      responseTime: 0, // Would need to track actual response times
      errorRate: this.calculateErrorRate(),
      requestCount: 0, // Would need to track actual request count
    };

    this.healthMetrics.push(metrics);

    // Keep only last 24 hours of metrics
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.healthMetrics = this.healthMetrics.filter(
      (m) => new Date(m.timestamp).getTime() > oneDayAgo,
    );

    // Send to monitoring service if configured
    this.sendToMonitoringService(metrics);
  }

  private calculateErrorRate(): number {
    const lastHour = Date.now() - 60 * 60 * 1000;
    const recentErrors = this.errorReports.filter(
      (e) => new Date(e.timestamp).getTime() > lastHour,
    );
    return recentErrors.length;
  }

  private setupErrorHandling(): void {
    process.on("uncaughtException", (error) => {
      this.reportError({
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        url: "server",
        userAgent: "server",
        ip: "server",
        severity: "critical",
      });
    });

    process.on("unhandledRejection", (reason) => {
      this.reportError({
        timestamp: new Date().toISOString(),
        error: String(reason),
        url: "server",
        userAgent: "server",
        ip: "server",
        severity: "high",
      });
    });
  }

  private setupPerformanceMonitoring(): void {
    // Monitor memory usage
    setInterval(() => {
      const usage = process.memoryUsage();
      if (usage.heapUsed > 1024 * 1024 * 1024) {
        // 1GB
        this.reportError({
          timestamp: new Date().toISOString(),
          error: "High memory usage detected",
          url: "server",
          userAgent: "server",
          ip: "server",
          severity: "medium",
        });
      }
    }, 30000); // Every 30 seconds
  }

  public reportError(error: ErrorReport): void {
    this.errorReports.push(error);

    // Keep only last 24 hours of errors
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.errorReports = this.errorReports.filter(
      (e) => new Date(e.timestamp).getTime() > oneDayAgo,
    );

    // Send critical errors immediately
    if (error.severity === "critical") {
      this.sendErrorAlert(error);
    }

    // Send to monitoring service
    this.sendToMonitoringService(error);
  }

  public trackPerformance(metrics: PerformanceMetrics): void {
    this.performanceMetrics.push(metrics);

    // Keep only last 24 hours of metrics
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.performanceMetrics = this.performanceMetrics.filter(
      (m) => new Date(m.timestamp).getTime() > oneDayAgo,
    );

    // Alert on poor performance
    if (metrics.pageLoadTime > 5000) {
      // 5 seconds
      this.reportError({
        timestamp: new Date().toISOString(),
        error: `Slow page load: ${metrics.pageLoadTime}ms`,
        url: "performance",
        userAgent: "monitor",
        ip: "monitor",
        severity: "medium",
      });
    }
  }

  public getHealthStatus(): {
    status: "healthy" | "warning" | "critical";
    metrics: HealthMetrics;
    recentErrors: ErrorReport[];
  } {
    const latestMetrics = this.healthMetrics[this.healthMetrics.length - 1];
    const recentErrors = this.errorReports.slice(-10); // Last 10 errors

    let status: "healthy" | "warning" | "critical" = "healthy";

    if (latestMetrics) {
      if (
        latestMetrics.errorRate > 10 ||
        latestMetrics.memoryUsage.heapUsed > 1024 * 1024 * 1024
      ) {
        status = "critical";
      } else if (latestMetrics.errorRate > 5) {
        status = "warning";
      }
    }

    return {
      status,
      metrics: latestMetrics || this.getDefaultMetrics(),
      recentErrors,
    };
  }

  private getDefaultMetrics(): HealthMetrics {
    return {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      activeConnections: 0,
      responseTime: 0,
      errorRate: 0,
      requestCount: 0,
    };
  }

  private sendToMonitoringService(data: unknown): void {
    // Send to configured monitoring service (e.g., Sentry, DataDog, etc.)
    const webhookUrl = process.env.MONITORING_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).catch(console.error);
    }
  }

  private sendErrorAlert(error: ErrorReport): void {
    // Send immediate alerts for critical errors
    const alertWebhook = process.env.ALERT_WEBHOOK_URL;
    if (alertWebhook) {
      fetch(alertWebhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: `🚨 Critical Error: ${error.error}`,
          timestamp: error.timestamp,
          severity: error.severity,
        }),
      }).catch(console.error);
    }
  }

  public getMetrics(): {
    health: HealthMetrics[];
    errors: ErrorReport[];
    performance: PerformanceMetrics[];
  } {
    return {
      health: this.healthMetrics,
      errors: this.errorReports,
      performance: this.performanceMetrics,
    };
  }

  async reportIncident(_incident: unknown): Promise<void> {
    // Implementation here
  }
}

export const productionMonitor = ProductionMonitor.getInstance();

// Middleware for tracking requests
export function trackRequest(req: NextRequest, responseTime: number): void {
  const error = req.nextUrl.searchParams.get("error");
  if (error) {
    productionMonitor.reportError({
      timestamp: new Date().toISOString(),
      error,
      url: req.url,
      userAgent: req.headers.get("user-agent") || "unknown",
      ip: req.headers.get("x-forwarded-for") || "unknown",
      severity: "medium",
    });
  }

  // Track performance
  productionMonitor.trackPerformance({
    timestamp: new Date().toISOString(),
    pageLoadTime: responseTime,
    apiResponseTime: responseTime,
    databaseQueryTime: 0, // Would need to track actual DB queries
    aiProcessingTime: 0, // Would need to track actual AI processing
    memoryUsage: process.memoryUsage().heapUsed,
    cpuUsage: process.cpuUsage().user,
  });
}
