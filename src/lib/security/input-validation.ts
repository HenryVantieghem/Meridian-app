import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// Base validation schemas
export const baseSchemas = {
  id: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  url: z.string().url(),
  date: z.string().datetime(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format'),
  name: z.string().min(1).max(100).regex(/^[a-zA-Z\s\-']+$/, 'Name contains invalid characters'),
  text: z.string().min(1).max(10000),
  html: z.string().min(1).max(50000),
  json: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, 'Invalid JSON format')
};

// Email validation schemas
export const emailSchemas: {
  emailData: z.ZodObject<any>;
  emailAnalysis: z.ZodObject<any>;
  batchAnalysis: z.ZodObject<any>;
} = {
  emailData: z.object({
    id: baseSchemas.id,
    subject: z.string().min(1).max(500).regex(/^[^\x00-\x1f\x7f]+$/, 'Subject contains invalid characters'),
    from: baseSchemas.email,
    to: z.array(baseSchemas.email).min(1).max(50),
    cc: z.array(baseSchemas.email).max(50).optional(),
    bcc: z.array(baseSchemas.email).max(50).optional(),
    body: baseSchemas.html,
    date: baseSchemas.date,
    threadId: baseSchemas.id.optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    isVIP: z.boolean().optional(),
    isRead: z.boolean().optional(),
    attachments: z.array(z.object({
      name: z.string().min(1).max(255),
      size: z.number().positive().max(25 * 1024 * 1024), // 25MB max
      type: z.string().regex(/^[a-zA-Z0-9]+\/[a-zA-Z0-9\-\.]+$/, 'Invalid MIME type'),
      url: baseSchemas.url.optional()
    })).max(10).optional()
  }),

  emailAnalysis: z.object({
    emailId: baseSchemas.id,
    summary: z.string().min(1).max(1000),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    sentiment: z.enum(['positive', 'negative', 'neutral']),
    urgency: z.enum(['low', 'normal', 'high', 'immediate']),
    isVIP: z.boolean(),
    confidence: z.number().min(0).max(1),
    suggestedActions: z.array(z.enum(['reply', 'delegate', 'archive', 'schedule', 'forward'])).max(5),
    keyPoints: z.array(z.string().min(1).max(200)).max(10),
    tags: z.array(z.string().min(1).max(50)).max(10).optional(),
    category: z.enum(['work', 'personal', 'spam', 'newsletter', 'notification']).optional()
  }),

  batchAnalysis: z.object({
    emails: z.array(z.any()).min(1).max(100), // Use z.any() to avoid circular reference
    options: z.object({
      includeSummary: z.boolean().optional(),
      includePriority: z.boolean().optional(),
      includeSentiment: z.boolean().optional(),
      includeActions: z.boolean().optional()
    }).optional()
  })
};

// AI validation schemas
export const aiSchemas = {
  generateReply: z.object({
    email: emailSchemas.emailData,
    context: z.object({
      tone: z.enum(['professional', 'casual', 'friendly', 'formal']).optional(),
      length: z.enum(['short', 'medium', 'long']).optional(),
      includeSignature: z.boolean().optional(),
      includeCallToAction: z.boolean().optional()
    }).optional(),
    confidence: z.number().min(0.1).max(1).optional(),
    maxLength: z.number().min(50).max(2000).optional()
  }),

  analyzeSentiment: z.object({
    text: baseSchemas.text,
    includeEmotions: z.boolean().optional(),
    includeConfidence: z.boolean().optional()
  }),

  summarizeText: z.object({
    text: baseSchemas.text,
    maxLength: z.number().min(50).max(1000).optional(),
    includeKeyPoints: z.boolean().optional()
  })
};

// User validation schemas
export const userSchemas = {
  userProfile: z.object({
    id: baseSchemas.id,
    email: baseSchemas.email,
    firstName: baseSchemas.name,
    lastName: baseSchemas.name,
    imageUrl: baseSchemas.url.optional(),
    phone: baseSchemas.phone.optional(),
    timezone: z.string().regex(/^[A-Za-z_]+\/[A-Za-z_]+$/, 'Invalid timezone format').optional(),
    preferences: z.object({
      emailNotifications: z.boolean().optional(),
      pushNotifications: z.boolean().optional(),
      theme: z.enum(['light', 'dark', 'auto']).optional(),
      language: z.enum(['en', 'es', 'fr', 'de']).optional()
    }).optional()
  }),

  userSettings: z.object({
    emailFrequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']).optional(),
    autoReply: z.boolean().optional(),
    autoArchive: z.boolean().optional(),
    vipContacts: z.array(baseSchemas.email).max(100).optional(),
    blockedDomains: z.array(z.string().regex(/^[a-zA-Z0-9\-\.]+$/, 'Invalid domain format')).max(50).optional()
  })
};

// Billing validation schemas
export const billingSchemas = {
  checkout: z.object({
    priceId: z.string().min(1).max(100),
    successUrl: baseSchemas.url,
    cancelUrl: baseSchemas.url,
    customerEmail: baseSchemas.email.optional(),
    metadata: z.record(z.string()).optional()
  }),

  subscription: z.object({
    id: z.string().min(1).max(100),
    status: z.enum(['active', 'canceled', 'past_due', 'unpaid']),
    currentPeriodStart: baseSchemas.date,
    currentPeriodEnd: baseSchemas.date,
    cancelAtPeriodEnd: z.boolean(),
    productId: z.string().min(1).max(100)
  }),

  paymentMethod: z.object({
    id: z.string().min(1).max(100),
    type: z.enum(['card', 'bank_account']),
    last4: z.string().regex(/^\d{4}$/, 'Invalid last4 format'),
    brand: z.enum(['visa', 'mastercard', 'amex', 'discover']).optional(),
    expMonth: z.number().min(1).max(12).optional(),
    expYear: z.number().min(2024).max(2030).optional()
  })
};

// Email service validation schemas
export const emailServiceSchemas = {
  sendEmail: z.object({
    to: z.array(baseSchemas.email).min(1).max(50),
    cc: z.array(baseSchemas.email).max(50).optional(),
    bcc: z.array(baseSchemas.email).max(50).optional(),
    subject: z.string().min(1).max(500),
    html: baseSchemas.html,
    text: baseSchemas.text.optional(),
    from: baseSchemas.email.optional(),
    replyTo: baseSchemas.email.optional(),
    attachments: z.array(z.object({
      filename: z.string().min(1).max(255),
      content: z.string().min(1), // base64 encoded
      contentType: z.string().regex(/^[a-zA-Z0-9]+\/[a-zA-Z0-9\-\.]+$/, 'Invalid MIME type')
    })).max(10).optional(),
    tags: z.array(z.string().min(1).max(50)).max(10).optional()
  }),

  template: z.object({
    name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid template name'),
    subject: z.string().min(1).max(500),
    html: baseSchemas.html,
    variables: z.array(z.string().min(1).max(50)).max(20).optional()
  })
};

// Slack validation schemas
export const slackSchemas = {
  oauth: z.object({
    code: z.string().min(1).max(100),
    state: z.string().min(1).max(100).optional()
  }),

  message: z.object({
    channel: z.string().min(1).max(100),
    text: z.string().min(1).max(3000),
    blocks: z.array(z.any()).max(50).optional(),
    attachments: z.array(z.any()).max(10).optional(),
    threadTs: z.string().optional(),
    unfurlLinks: z.boolean().optional(),
    unfurlMedia: z.boolean().optional()
  }),

  webhook: z.object({
    type: z.string().min(1).max(100),
    teamId: z.string().min(1).max(100),
    event: z.any(),
    eventId: z.string().min(1).max(100),
    eventTime: z.number().positive()
  })
};

// Input validation middleware
export function createValidationMiddleware<T extends z.ZodSchema>(
  schema: T,
  errorMessage = 'Invalid input data'
) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    try {
      const body = await req.json();
      schema.parse(body);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          error: errorMessage,
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        }, { status: 400 });
      }
      
      return NextResponse.json({
        error: 'Invalid JSON payload'
      }, { status: 400 });
    }
  };
}

// Query parameter validation
export function createQueryValidationMiddleware<T extends z.ZodSchema>(
  schema: T,
  errorMessage = 'Invalid query parameters'
) {
  return (req: NextRequest): NextResponse | null => {
    try {
      const query = Object.fromEntries(req.nextUrl.searchParams);
      schema.parse(query);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          error: errorMessage,
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        }, { status: 400 });
      }
      
      return NextResponse.json({
        error: 'Invalid query parameters'
      }, { status: 400 });
    }
  };
}

// Path parameter validation
export function createPathValidationMiddleware<T extends z.ZodSchema>(
  schema: T,
  errorMessage = 'Invalid path parameters'
) {
  return (req: NextRequest): NextResponse | null => {
    try {
      const params = req.nextUrl.pathname.split('/').filter(Boolean);
      schema.parse(params);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          error: errorMessage,
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        }, { status: 400 });
      }
      
      return NextResponse.json({
        error: 'Invalid path parameters'
      }, { status: 400 });
    }
  };
}

// Sanitization utilities
export const sanitizers = {
  // Remove HTML tags and dangerous content
  html: (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  },

  // Sanitize email content
  email: (input: string): string => {
    return input
      .replace(/[^\w\s@\-\.]/g, '')
      .trim();
  },

  // Sanitize file names
  filename: (input: string): string => {
    return input
      .replace(/[^\w\-\.]/g, '')
      .replace(/\.\./g, '')
      .trim();
  },

  // Sanitize URLs
  url: (input: string): string => {
    try {
      const url = new URL(input);
      return url.toString();
    } catch {
      return '';
    }
  },

  // Sanitize phone numbers
  phone: (input: string): string => {
    return input
      .replace(/[^\d\s\-\(\)\+]/g, '')
      .trim();
  },

  // Sanitize names
  name: (input: string): string => {
    return input
      .replace(/[^\w\s\-']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
};

// Validation error formatter
export function formatValidationError(error: z.ZodError): string {
  return error.errors.map(err => 
    `${err.path.join('.')}: ${err.message}`
  ).join(', ');
}

// Export all schemas
export const schemas = {
  base: baseSchemas,
  email: emailSchemas,
  ai: aiSchemas,
  user: userSchemas,
  billing: billingSchemas,
  emailService: emailServiceSchemas,
  slack: slackSchemas
}; 