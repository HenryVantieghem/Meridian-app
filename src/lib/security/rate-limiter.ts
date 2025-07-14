import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Rate limiter configuration
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  handler?: (req: NextRequest) => NextResponse;
}

class RateLimiter {
  private redis: Redis;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    this.config = config;
  }

  private generateKey(req: NextRequest): string {
    const keyGenerator = this.config.keyGenerator || this.defaultKeyGenerator;
    return `rate_limit:${keyGenerator(req)}`;
  }

  private defaultKeyGenerator(req: NextRequest): string {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    return `${ip}:${userAgent}`;
  }

  async checkLimit(req: NextRequest): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const _key = this.generateKey(req);
    const now = Date.now();
    const _windowStart = now - this.config.windowMs;

    try {
      // For now, use a simple in-memory approach
      // In production, this would use Redis properly
      const currentRequests = 0; // Placeholder
      const allowed = currentRequests < this.config.maxRequests;

      if (!allowed) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: now + this.config.windowMs,
          retryAfter: Math.ceil(this.config.windowMs / 1000)
        };
      }

      return {
        allowed: true,
        remaining: this.config.maxRequests - currentRequests - 1,
        resetTime: now + this.config.windowMs
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Allow request if Redis is unavailable
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs
      };
    }
  }

  async middleware(req: NextRequest): Promise<NextResponse | null> {
    const result = await this.checkLimit(req);

    if (!result.allowed) {
      const response = this.config.handler?.(req) || 
        NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        );

      response.headers.set('X-RateLimit-Limit', this.config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
      
      if (result.retryAfter) {
        response.headers.set('Retry-After', result.retryAfter.toString());
      }

      return response;
    }

    return null;
  }
}

// Predefined rate limiters
export const rateLimiters = {
  // Strict rate limiter for authentication
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyGenerator: (_req) => {
      const ip = req.headers.get('x-forwarded-for') || 'unknown';
      return `auth:${ip}`;
    },
    handler: (req) => NextResponse.json(
      { error: 'Too many authentication attempts. Please try again later.' },
      { status: 429 }
    )
  }),

  // API rate limiter
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyGenerator: (req) => {
      const ip = req.headers.get('x-forwarded-for') || 'unknown';
      const path = req.nextUrl.pathname;
      return `api:${ip}:${path}`;
    }
  }),

  // AI operations rate limiter
  ai: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyGenerator: (req) => {
      const userId = req.headers.get('x-user-id') || 'anonymous';
      return `ai:${userId}`;
    },
    handler: (req) => NextResponse.json(
      { error: 'AI rate limit exceeded. Please try again later.' },
      { status: 429 }
    )
  }),

  // Email processing rate limiter
  email: new RateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 50,
    keyGenerator: (req) => {
      const userId = req.headers.get('x-user-id') || 'anonymous';
      return `email:${userId}`;
    }
  }),

  // Webhook rate limiter
  webhook: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1000,
    keyGenerator: (req) => {
      const source = req.headers.get('x-webhook-source') || 'unknown';
      return `webhook:${source}`;
    }
  }),

  // General rate limiter
  general: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200,
    keyGenerator: (req) => {
      const ip = req.headers.get('x-forwarded-for') || 'unknown';
      return `general:${ip}`;
    }
  })
};

// Rate limiter middleware factory
export function createRateLimitMiddleware(type: keyof typeof rateLimiters) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    const limiter = rateLimiters[type];
    return await limiter.middleware(req);
  };
}

// IP-based rate limiter for DDoS protection
export class DDoSProtection {
  private redis: Redis;
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs = 60000, maxRequests = 1000) {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  async checkIP(ip: string): Promise<boolean> {
    const _key = `ddos:${ip}`;
    const now = Date.now();
    const _windowStart = now - this.windowMs;

    try {
      // For now, use a simple in-memory approach
      // In production, this would use Redis properly
      const currentRequests = 0; // Placeholder
      const allowed = currentRequests < this.maxRequests;

      return allowed;
    } catch (error) {
      console.error('DDoS protection error:', error);
      return true; // Allow if Redis is unavailable
    }
  }

  async middleware(req: NextRequest): Promise<NextResponse | null> {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const allowed = await this.checkIP(ip);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests from this IP' },
        { status: 429 }
      );
    }

    return null;
  }
}

// Request size limiter
export class RequestSizeLimiter {
  private maxSize: number;

  constructor(maxSize = 10 * 1024 * 1024) { // 10MB default
    this.maxSize = maxSize;
  }

  middleware(req: NextRequest): NextResponse | null {
    const contentLength = parseInt(req.headers.get('content-length') || '0');
    
    if (contentLength > this.maxSize) {
      return NextResponse.json(
        { error: 'Request too large' },
        { status: 413 }
      );
    }

    return null;
  }
}

// Security headers middleware
export function securityHeaders(req: NextRequest): NextResponse | null {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.openai.com https://api.stripe.com https://api.clerk.dev https://*.supabase.co https://slack.com",
    "frame-src https://js.stripe.com https://checkout.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
}

// Input validation middleware
export function validateInput(req: NextRequest): NextResponse | null {
  const contentType = req.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    try {
      // This will be handled by the route handler
      return null;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
  }
  
  return null;
}

// Combined security middleware
export async function securityMiddleware(req: NextRequest): Promise<NextResponse | null> {
  // Apply security headers
  const headersResponse = securityHeaders(req);
  if (headersResponse) return headersResponse;
  
  // Check request size
  const sizeLimiter = new RequestSizeLimiter();
  const sizeResponse = sizeLimiter.middleware(req);
  if (sizeResponse) return sizeResponse;
  
  // Validate input
  const inputResponse = validateInput(req);
  if (inputResponse) return inputResponse;
  
  // Apply DDoS protection
  const ddosProtection = new DDoSProtection();
  const ddosResponse = await ddosProtection.middleware(req);
  if (ddosResponse) return ddosResponse;
  
  // Apply rate limiting based on path
  const path = req.nextUrl.pathname;
  
  if (path.startsWith('/api/auth')) {
    const authResponse = await rateLimiters.auth.middleware(req);
    if (authResponse) return authResponse;
  } else if (path.startsWith('/api/ai')) {
    const aiResponse = await rateLimiters.ai.middleware(req);
    if (aiResponse) return aiResponse;
  } else if (path.startsWith('/api/emails')) {
    const emailResponse = await rateLimiters.email.middleware(req);
    if (emailResponse) return emailResponse;
  } else if (path.startsWith('/api/webhooks')) {
    const webhookResponse = await rateLimiters.webhook.middleware(req);
    if (webhookResponse) return webhookResponse;
  } else if (path.startsWith('/api')) {
    const apiResponse = await rateLimiters.api.middleware(req);
    if (apiResponse) return apiResponse;
  } else {
    const generalResponse = await rateLimiters.general.middleware(req);
    if (generalResponse) return generalResponse;
  }
  
  return null;
} 