import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  // API rate limits
  API: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // 100 requests per window
  },

  // Authentication rate limits
  AUTH: {
    WINDOW_MS: 5 * 60 * 1000, // 5 minutes
    MAX_REQUESTS: 5, // 5 attempts per window
  },

  // AI operation rate limits
  AI: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 10, // 10 requests per minute
  },

  // Email sending rate limits
  EMAIL: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 5, // 5 emails per minute
  },
} as const;

// Rate limiter class
export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();

  constructor(
    private windowMs: number,
    private maxRequests: number,
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      // First request or window expired
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record) return this.maxRequests;
    return Math.max(0, this.maxRequests - record.count);
  }

  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier);
    return record?.resetTime || Date.now();
  }

  // Clean up expired records
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Rate limiters for different endpoints
export const rateLimiters = {
  api: new RateLimiter(
    RATE_LIMIT_CONFIG.API.WINDOW_MS,
    RATE_LIMIT_CONFIG.API.MAX_REQUESTS,
  ),
  auth: new RateLimiter(
    RATE_LIMIT_CONFIG.AUTH.WINDOW_MS,
    RATE_LIMIT_CONFIG.AUTH.MAX_REQUESTS,
  ),
  ai: new RateLimiter(
    RATE_LIMIT_CONFIG.AI.WINDOW_MS,
    RATE_LIMIT_CONFIG.AI.MAX_REQUESTS,
  ),
  email: new RateLimiter(
    RATE_LIMIT_CONFIG.EMAIL.WINDOW_MS,
    RATE_LIMIT_CONFIG.EMAIL.MAX_REQUESTS,
  ),
};

// Rate limiting middleware
export const withRateLimiting = (
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    type: keyof typeof rateLimiters;
    getIdentifier?: (req: NextRequest) => string;
  },
) => {
  return async (req: NextRequest): Promise<NextResponse> => {
    const limiter = rateLimiters[options.type];
    const identifier =
      options.getIdentifier?.(req) ||
      req.headers.get("x-forwarded-for") ||
      "unknown";

    if (!limiter.isAllowed(identifier)) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: Math.ceil(
            (limiter.getResetTime(identifier) - Date.now()) / 1000,
          ),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (limiter.getResetTime(identifier) - Date.now()) / 1000,
            ).toString(),
            "X-RateLimit-Limit": "100", // Use default value
            "X-RateLimit-Remaining": limiter
              .getRemainingRequests(identifier)
              .toString(),
            "X-RateLimit-Reset": limiter.getResetTime(identifier).toString(),
          },
        },
      );
    }

    const response = await handler(req);

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", "100"); // Use default value
    response.headers.set(
      "X-RateLimit-Remaining",
      limiter.getRemainingRequests(identifier).toString(),
    );
    response.headers.set(
      "X-RateLimit-Reset",
      limiter.getResetTime(identifier).toString(),
    );

    return response;
  };
};

// Input validation schemas
export const validationSchemas = {
  // Email validation
  email: z.object({
    to: z.string().email(),
    subject: z.string().min(1).max(200),
    content: z.string().min(1).max(10000),
  }),

  // User profile validation
  userProfile: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    avatar: z.string().url().optional(),
    preferences: z.object({
      theme: z.enum(["light", "dark"]),
      notifications: z.boolean(),
    }),
  }),

  // AI request validation
  aiRequest: z.object({
    prompt: z.string().min(1).max(5000),
    model: z.enum(["gpt-4o", "gpt-4o-mini"]).optional(),
    maxTokens: z.number().min(1).max(4000).optional(),
    temperature: z.number().min(0).max(2).optional(),
  }),

  // Payment validation
  payment: z.object({
    amount: z.number().positive(),
    currency: z.enum(["usd", "eur", "gbp"]),
    description: z.string().min(1).max(200),
  }),

  // Slack message validation
  slackMessage: z.object({
    channel: z.string().min(1),
    text: z.string().min(1).max(3000),
    threadTs: z.string().optional(),
  }),
};

// Input validation middleware
export const withInputValidation = <T extends z.ZodSchema>(
  handler: (req: NextRequest, data: z.infer<T>) => Promise<NextResponse>,
  schema: T,
) => {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      let data: z.infer<T>;

      if (req.method === "GET") {
        const url = new URL(req.url);
        data = schema.parse(Object.fromEntries(url.searchParams));
      } else {
        const body = await req.json();
        data = schema.parse(body);
      }

      return await handler(req, data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: error.errors,
          },
          { status: 400 },
        );
      }
      throw error;
    }
  };
};

// Security headers middleware
export const withSecurityHeaders = (
  handler: (req: NextRequest) => Promise<NextResponse>,
) => {
  return async (req: NextRequest): Promise<NextResponse> => {
    const response = await handler(req);

    // Security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );

    // Content Security Policy
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.openai.com https://api.stripe.com https://api.slack.com https://www.googleapis.com https://graph.microsoft.com; frame-src https://js.stripe.com https://checkout.stripe.com;",
    );

    return response;
  };
};

// CORS middleware
export const withCORS = (
  handler: (req: NextRequest) => Promise<NextResponse>,
) => {
  return async (req: NextRequest): Promise<NextResponse> => {
    const response = await handler(req);

    // CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    return response;
  };
};

// DDoS protection middleware
export const withDDoSProtection = (
  handler: (req: NextRequest) => Promise<NextResponse>,
) => {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Check for suspicious patterns
    const userAgent = req.headers.get("user-agent") || "";
    const suspiciousPatterns = [/bot/i, /crawler/i, /spider/i, /scraper/i];

    const isSuspicious = suspiciousPatterns.some((pattern) =>
      pattern.test(userAgent),
    );

    if (isSuspicious) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check request size
    const contentLength = parseInt(req.headers.get("content-length") || "0");
    if (contentLength > 10 * 1024 * 1024) {
      // 10MB limit
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    return await handler(req);
  };
};

// Authentication middleware
export const withAuthentication = (
  handler: (req: NextRequest) => Promise<NextResponse>,
) => {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const _token = authHeader.substring(7);

    // Validate token (this would integrate with Clerk)
    try {
      // Token validation logic here
      return await handler(req);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  };
};

// Comprehensive security middleware
export const withSecurity = (
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    rateLimit?: keyof typeof rateLimiters;
    validateInput?: z.ZodSchema;
    requireAuth?: boolean;
  } = {},
) => {
  let securedHandler = handler;

  // Add rate limiting
  if (options.rateLimit) {
    securedHandler = withRateLimiting(securedHandler, {
      type: options.rateLimit,
    });
  }

  // Add input validation
  if (options.validateInput) {
    securedHandler = withInputValidation(securedHandler, options.validateInput);
  }

  // Add authentication
  if (options.requireAuth) {
    securedHandler = withAuthentication(securedHandler);
  }

  // Add security headers
  securedHandler = withSecurityHeaders(securedHandler);

  // Add CORS
  securedHandler = withCORS(securedHandler);

  // Add DDoS protection
  securedHandler = withDDoSProtection(securedHandler);

  return securedHandler;
};

// Cleanup expired rate limit records periodically
setInterval(() => {
  Object.values(rateLimiters).forEach((limiter) => limiter.cleanup());
}, 60000); // Every minute
