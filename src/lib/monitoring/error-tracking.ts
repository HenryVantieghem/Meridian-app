import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
// import { BrowserTracing } from '@sentry/tracing';
// import { Replay } from '@sentry/replay';

// Error types
export enum ErrorType {
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  RATE_LIMIT = "rate_limit",
  API_ERROR = "api_error",
  DATABASE_ERROR = "database_error",
  AI_ERROR = "ai_error",
  EMAIL_ERROR = "email_error",
  PAYMENT_ERROR = "payment_error",
  NETWORK_ERROR = "network_error",
  UNKNOWN = "unknown",
}

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Error context interface
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  params?: Record<string, unknown>;
  body?: unknown;
  headers?: Record<string, string>;
  timestamp: Date;
  environment: string;
  version: string;
}

// Custom error class
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly isOperational: boolean;
  public readonly retryable: boolean;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: Partial<ErrorContext> = {},
    isOperational: boolean = true,
    retryable: boolean = false,
  ) {
    super(message);
    this.name = "AppError";
    this.type = type;
    this.severity = severity;
    this.context = {
      timestamp: new Date(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.APP_VERSION || "1.0.0",
      ...context,
    };
    this.isOperational = isOperational;
    this.retryable = retryable;
  }
}

// Error tracking service
export class ErrorTrackingService {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;

    // Initialize Sentry
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",
      release: process.env.APP_VERSION || "1.0.0",
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      // integrations: [
      //   new BrowserTracing({
      //     tracePropagationTargets: ['localhost', 'your-domain.com'],
      //   }),
      //   new Replay({
      //     maskAllText: true,
      //     blockAllMedia: true,
      //   }),
      // ],
    });

    this.isInitialized = true;
  }

  /**
   * Capture and track an error
   */
  captureError(error: Error | AppError, context?: Partial<ErrorContext>): void {
    try {
      if (error instanceof AppError) {
        // Set Sentry tags
        Sentry.setTag("error.type", error.type);
        Sentry.setTag("error.severity", error.severity);
        Sentry.setTag("error.operational", error.isOperational);
        Sentry.setTag("error.retryable", error.retryable);

        // Set Sentry context
        Sentry.setContext("error", {
          type: error.type,
          severity: error.severity,
          isOperational: error.isOperational,
          retryable: error.retryable,
          ...error.context,
          ...context,
        });
      }

      // Capture error in Sentry
      Sentry.captureException(error);

      // Log error locally
      this.logError(error, context);

      // Send alerts for critical errors
      if (
        error instanceof AppError &&
        error.severity === ErrorSeverity.CRITICAL
      ) {
        this.sendAlert(error, context);
      }
    } catch (trackingError) {
      console.error("Error tracking failed:", trackingError);
    }
  }

  /**
   * Capture and track a message
   */
  captureMessage(
    message: string,
    level: Sentry.SeverityLevel = "info",
    context?: Partial<ErrorContext>,
  ): void {
    try {
      Sentry.setContext("message", {
        ...context,
        timestamp: new Date(),
        environment: process.env.NODE_ENV || "development",
      });

      Sentry.captureMessage(message, level);
    } catch (trackingError) {
      console.error("Message tracking failed:", trackingError);
    }
  }

  /**
   * Set user context for error tracking
   */
  setUser(userId: string, email?: string, name?: string): void {
    try {
      Sentry.setUser({
        id: userId,
        email,
        username: name,
      });
    } catch (error) {
      console.error("Failed to set user context:", error);
    }
  }

  /**
   * Set request context for error tracking
   */
  setRequestContext(req: NextRequest): void {
    try {
      Sentry.setContext("request", {
        method: req.method,
        url: req.url,
        headers: Object.fromEntries(req.headers.entries()),
        ip: req.headers.get("x-forwarded-for"),
        userAgent: req.headers.get("user-agent"),
      });
    } catch (error) {
      console.error("Failed to set request context:", error);
    }
  }

  /**
   * Log error locally
   */
  private logError(
    error: Error | AppError,
    context?: Partial<ErrorContext>,
  ): void {
    const logData = {
      message: error.message,
      stack: error.stack,
      type: error instanceof AppError ? error.type : ErrorType.UNKNOWN,
      severity:
        error instanceof AppError ? error.severity : ErrorSeverity.MEDIUM,
      context: {
        ...(error instanceof AppError ? error.context : {}),
        ...context,
      },
      timestamp: new Date().toISOString(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error tracked:", logData);
    }

    // Log to file in production
    if (process.env.NODE_ENV === "production") {
      // In production, you might want to log to a file or external service
      console.error("Error tracked:", JSON.stringify(logData));
    }
  }

  /**
   * Send alert for critical errors
   */
  private async sendAlert(
    error: AppError,
    context?: Partial<ErrorContext>,
  ): Promise<void> {
    try {
      // Send to Slack
      if (process.env.SLACK_WEBHOOK_URL) {
        await this.sendSlackAlert(error, context);
      }

      // Send to email
      if (process.env.ALERT_EMAIL) {
        await this.sendEmailAlert(error, context);
      }

      // Send to PagerDuty
      if (process.env.PAGERDUTY_API_KEY) {
        await this.sendPagerDutyAlert(error, context);
      }
    } catch (alertError) {
      console.error("Failed to send alert:", alertError);
    }
  }

  /**
   * Send Slack alert
   */
  private async sendSlackAlert(
    error: AppError,
    _context?: Partial<ErrorContext>,
  ): Promise<void> {
    try {
      const webhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (!webhookUrl) {
        console.warn("Slack webhook URL not configured");
        return;
      }

      const message = {
        text: `🚨 Critical Error Alert`,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `Critical Error: ${error.type}`,
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Error:*\n${error.message}`,
              },
              {
                type: "mrkdwn",
                text: `*Severity:*\n${error.severity}`,
              },
              {
                type: "mrkdwn",
                text: `*Environment:*\n${error.context.environment}`,
              },
              {
                type: "mrkdwn",
                text: `*Timestamp:*\n${error.context.timestamp.toISOString()}`,
              },
            ],
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Stack Trace:*\n\`\`\`${error.stack}\`\`\``,
            },
          },
        ],
      };

      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });
    } catch (alertError) {
      console.error("Failed to send Slack alert:", alertError);
    }
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(
    error: AppError,
    _context?: Partial<ErrorContext>,
  ): Promise<void> {
    // Implementation would depend on your email service
    console.log("Email alert sent for critical error:", error.message);
  }

  /**
   * Send PagerDuty alert
   */
  private async sendPagerDutyAlert(
    error: AppError,
    _context?: Partial<ErrorContext>,
  ): Promise<void> {
    // Implementation would depend on PagerDuty API
    console.log("PagerDuty alert sent for critical error:", error.message);
  }

  /**
   * Flush pending events
   */
  async flush(): Promise<void> {
    try {
      await Sentry.flush(2000);
    } catch (error) {
      console.error("Failed to flush Sentry events:", error);
    }
  }
}

// Error middleware for API routes
export function errorMiddleware(
  error: Error | AppError,
  req: NextRequest,
): NextResponse {
  const errorTracking = new ErrorTrackingService();

  // Set request context
  errorTracking.setRequestContext(req);

  // Capture error
  errorTracking.captureError(error);

  // Create appropriate response
  if (error instanceof AppError) {
    const statusCode = getStatusCode(error.type);

    return NextResponse.json(
      {
        error: error.message,
        type: error.type,
        retryable: error.retryable,
      },
      { status: statusCode },
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: "Internal server error",
      type: ErrorType.UNKNOWN,
      retryable: false,
    },
    { status: 500 },
  );
}

// Get HTTP status code for error type
function getStatusCode(errorType: ErrorType): number {
  switch (errorType) {
    case ErrorType.VALIDATION:
      return 400;
    case ErrorType.AUTHENTICATION:
      return 401;
    case ErrorType.AUTHORIZATION:
      return 403;
    case ErrorType.RATE_LIMIT:
      return 429;
    case ErrorType.API_ERROR:
      return 502;
    case ErrorType.DATABASE_ERROR:
      return 503;
    case ErrorType.AI_ERROR:
      return 503;
    case ErrorType.EMAIL_ERROR:
      return 503;
    case ErrorType.PAYMENT_ERROR:
      return 400;
    case ErrorType.NETWORK_ERROR:
      return 503;
    default:
      return 500;
  }
}

// Error factory functions
export const createError = {
  validation: (message: string, context?: Partial<ErrorContext>) =>
    new AppError(
      message,
      ErrorType.VALIDATION,
      ErrorSeverity.LOW,
      context,
      true,
      false,
    ),

  authentication: (message: string, context?: Partial<ErrorContext>) =>
    new AppError(
      message,
      ErrorType.AUTHENTICATION,
      ErrorSeverity.MEDIUM,
      context,
      true,
      false,
    ),

  authorization: (message: string, context?: Partial<ErrorContext>) =>
    new AppError(
      message,
      ErrorType.AUTHORIZATION,
      ErrorSeverity.MEDIUM,
      context,
      true,
      false,
    ),

  rateLimit: (message: string, context?: Partial<ErrorContext>) =>
    new AppError(
      message,
      ErrorType.RATE_LIMIT,
      ErrorSeverity.LOW,
      context,
      true,
      true,
    ),

  apiError: (message: string, context?: Partial<ErrorContext>) =>
    new AppError(
      message,
      ErrorType.API_ERROR,
      ErrorSeverity.HIGH,
      context,
      true,
      true,
    ),

  databaseError: (message: string, context?: Partial<ErrorContext>) =>
    new AppError(
      message,
      ErrorType.DATABASE_ERROR,
      ErrorSeverity.HIGH,
      context,
      true,
      true,
    ),

  aiError: (message: string, context?: Partial<ErrorContext>) =>
    new AppError(
      message,
      ErrorType.AI_ERROR,
      ErrorSeverity.MEDIUM,
      context,
      true,
      true,
    ),

  emailError: (message: string, context?: Partial<ErrorContext>) =>
    new AppError(
      message,
      ErrorType.EMAIL_ERROR,
      ErrorSeverity.MEDIUM,
      context,
      true,
      true,
    ),

  paymentError: (message: string, context?: Partial<ErrorContext>) =>
    new AppError(
      message,
      ErrorType.PAYMENT_ERROR,
      ErrorSeverity.HIGH,
      context,
      true,
      false,
    ),

  networkError: (message: string, context?: Partial<ErrorContext>) =>
    new AppError(
      message,
      ErrorType.NETWORK_ERROR,
      ErrorSeverity.MEDIUM,
      context,
      true,
      true,
    ),

  critical: (message: string, context?: Partial<ErrorContext>) =>
    new AppError(
      message,
      ErrorType.UNKNOWN,
      ErrorSeverity.CRITICAL,
      context,
      false,
      false,
    ),
};

// Export singleton
export const errorTracking = new ErrorTrackingService();
