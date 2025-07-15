import * as Sentry from "@sentry/nextjs";

// Initialize Sentry
export function initializeSentry() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      profilesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: process.env.NODE_ENV || "development",
      debug: process.env.NODE_ENV === "development",
    });
  }
}

// Capture errors
export function captureError(error: Error, context?: Record<string, unknown>) {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
}

// Capture messages
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
) {
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level,
    });
  }
}

// Set user context
export function setUserContext(userId: string, email?: string) {
  if (process.env.SENTRY_DSN) {
    Sentry.setUser({
      id: userId,
      email,
    });
  }
}

// Set tag
export function setTag(key: string, value: string) {
  if (process.env.SENTRY_DSN) {
    Sentry.setTag(key, value);
  }
}

// Set extra context
export function setExtra(key: string, value: unknown) {
  if (process.env.SENTRY_DSN) {
    Sentry.setExtra(key, value);
  }
}

// Initialize on module load
initializeSentry();
