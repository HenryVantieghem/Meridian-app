import { z } from 'zod';

// Environment variable schema for production
const envSchema = z.object({
  // Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default('/onboarding'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default('/onboarding'),

  // Database
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),

  // AI
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_ORG_ID: z.string().optional(),

  // Payments
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),

  // Email Service
  RESEND_API_KEY: z.string().min(1),

  // Google APIs
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url(),

  // Microsoft APIs
  MICROSOFT_CLIENT_ID: z.string().min(1),
  MICROSOFT_CLIENT_SECRET: z.string().min(1),
  MICROSOFT_REDIRECT_URI: z.string().url(),
  MICROSOFT_TENANT_ID: z.string().min(1),

  // Slack API
  SLACK_CLIENT_ID: z.string().min(1),
  SLACK_CLIENT_SECRET: z.string().min(1),
  SLACK_SIGNING_SECRET: z.string().min(1),
  SLACK_BOT_TOKEN: z.string().min(1),
  SLACK_USER_TOKEN: z.string().min(1),
  SLACK_REDIRECT_URI: z.string().url(),

  // App Configuration
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().default('Meridian'),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),

  // Webhook URLs
  WEBHOOK_BASE_URL: z.string().url(),

  // Monitoring and Logging
  LOGGING_WEBHOOK_URL: z.string().url().optional(),
  ERROR_TRACKING_WEBHOOK_URL: z.string().url().optional(),
  ANALYTICS_WEBHOOK_URL: z.string().url().optional(),
  SECURITY_WEBHOOK_URL: z.string().url().optional(),
});

// Production configuration
export const productionConfig = {
  // Security settings
  security: {
    // Rate limiting
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    },
    
    // CORS settings
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },

    // Content Security Policy
    csp: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", 'https://js.stripe.com', 'https://www.googletagmanager.com'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'img-src': ["'self'", 'data:', 'https:', 'blob:'],
      'connect-src': [
        "'self'",
        'https://api.openai.com',
        'https://api.stripe.com',
        'https://api.resend.com',
        'https://api.slack.com',
        'https://www.googleapis.com',
        'https://graph.microsoft.com',
        'wss://localhost:3001', // WebSocket for development
      ],
      'frame-src': ["'self'", 'https://js.stripe.com'],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
    },

    // Headers
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },

  // Performance settings
  performance: {
    // Caching
    cache: {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      staleWhileRevalidate: 60 * 60 * 24, // 1 day
    },

    // Compression
    compression: {
      level: 6,
      threshold: 1024,
    },

    // Image optimization
    images: {
      domains: ['localhost', 'vercel.app', 'your-domain.com'],
      formats: ['image/webp', 'image/avif'],
      sizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    },
  },

  // Database settings
  database: {
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
    ssl: process.env.NODE_ENV === 'production',
  },

  // AI settings
  ai: {
    model: 'gpt-4o',
    maxTokens: 4000,
    temperature: 0.7,
    timeout: 30000,
    retries: 3,
  },

  // Email settings
  email: {
    from: 'noreply@meridian.ai',
    replyTo: 'support@meridian.ai',
    maxRetries: 3,
    batchSize: 100,
  },

  // Real-time settings
  realtime: {
    heartbeat: 30000, // 30 seconds
    reconnectAttempts: 5,
    reconnectDelay: 1000,
  },

  // Monitoring settings
  monitoring: {
    // Error tracking
    errorTracking: {
      enabled: true,
      sampleRate: 0.1, // 10% of errors
      maxErrorsPerMinute: 100,
    },

    // Performance monitoring
    performance: {
      enabled: true,
      sampleRate: 0.01, // 1% of page loads
      metrics: ['fcp', 'lcp', 'fid', 'cls', 'ttfb'],
    },

    // User analytics
    analytics: {
      enabled: true,
      sampleRate: 0.1, // 10% of users
      events: ['page_view', 'button_click', 'form_submit', 'error'],
    },
  },

  // Feature flags
  features: {
    aiAnalysis: true,
    realtimeUpdates: true,
    emailAutomation: true,
    slackIntegration: true,
    gmailIntegration: true,
    outlookIntegration: true,
    stripePayments: true,
    performanceMonitoring: true,
    errorTracking: true,
  },
};

// Validate environment variables
export function validateEnvironment() {
  try {
    envSchema.parse(process.env);
    return { valid: true, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return { valid: false, errors };
    }
    return { valid: false, errors: [{ path: 'unknown', message: 'Unknown validation error' }] };
  }
}

// Get validated environment variables
export function getValidatedEnv() {
  const result = validateEnvironment();
  if (!result.valid) {
    throw new Error(`Environment validation failed: ${JSON.stringify(result.errors, null, 2)}`);
  }
  return envSchema.parse(process.env);
}

// Production-specific utilities
export const productionUtils = {
  // Sanitize sensitive data for logging
  sanitizeForLogging: (data: any): any => {
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...data };
    
    for (const key of sensitiveKeys) {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]';
      }
    }
    
    return sanitized;
  },

  // Generate secure random string
  generateSecureToken: (length: number = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Validate API key format
  validateApiKey: (key: string, type: 'openai' | 'stripe' | 'slack' | 'google' | 'microsoft'): boolean => {
    const patterns = {
      openai: /^sk-[a-zA-Z0-9]{48}$/,
      stripe: /^(pk_|sk_)[a-zA-Z0-9]{24}$/,
      slack: /^xox[abp]-[a-zA-Z0-9-]+$/,
      google: /^[a-zA-Z0-9-]+\.apps\.googleusercontent\.com$/,
      microsoft: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
    };
    
    return patterns[type].test(key);
  },

  // Check if running in production
  isProduction: (): boolean => {
    return process.env.NODE_ENV === 'production';
  },

  // Get environment-specific configuration
  getConfig: () => {
    if (productionUtils.isProduction()) {
      return productionConfig;
    }
    return {
      ...productionConfig,
      security: {
        ...productionConfig.security,
        rateLimit: {
          ...productionConfig.security.rateLimit,
          max: 1000, // Higher limit for development
        },
      },
      monitoring: {
        ...productionConfig.monitoring,
        errorTracking: {
          ...productionConfig.monitoring.errorTracking,
          sampleRate: 1, // Track all errors in development
        },
      },
    };
  },
}; 