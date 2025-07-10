// Validation System
// Central export for all validation utilities

import { z } from 'zod';

// Base validation schemas
export const base = {
  // Email validation
  email: z.string().email('Invalid email address'),
  
  // Password validation
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  // Name validation
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  // Phone validation
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format'),
  
  // URL validation
  url: z.string().url('Invalid URL format'),
  
  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),
  
  // Date validation
  date: z.string().datetime('Invalid date format'),
  
  // Number validation
  number: z.number().positive('Must be a positive number'),
  
  // Boolean validation
  boolean: z.boolean(),
  
  // Array validation
  array: <T>(schema: z.ZodType<T>) => z.array(schema),
  
  // Optional validation
  optional: <T>(schema: z.ZodType<T>) => schema.optional(),
  
  // Nullable validation
  nullable: <T>(schema: z.ZodType<T>) => schema.nullable()
};

// User validation schemas
export const user = {
  // User profile
  userProfile: z.object({
    id: base.uuid,
    email: base.email,
    firstName: base.name,
    lastName: base.name,
    phone: base.phone.optional(),
    avatar: base.url.optional(),
    timezone: z.string().optional(),
    language: z.enum(['en', 'es', 'fr', 'de']).default('en'),
    preferences: z.record(z.any()).optional(),
    createdAt: base.date,
    updatedAt: base.date
  }),

  // User registration
  registration: z.object({
    email: base.email,
    password: base.password,
    firstName: base.name,
    lastName: base.name,
    acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
    marketingEmails: z.boolean().default(false)
  }),

  // User login
  login: z.object({
    email: base.email,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().default(false)
  }),

  // Password reset
  passwordReset: z.object({
    email: base.email
  }),

  // Password change
  passwordChange: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: base.password,
    confirmPassword: z.string().min(1, 'Please confirm your password')
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }),

  // User preferences
  preferences: z.object({
    emailNotifications: z.boolean().default(true),
    pushNotifications: z.boolean().default(true),
    dailyDigest: z.boolean().default(true),
    weeklyReport: z.boolean().default(false),
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    language: z.enum(['en', 'es', 'fr', 'de']).default('en'),
    timezone: z.string().optional()
  })
};

// Email validation schemas
export const email = {
  // Email data
  emailData: z.object({
    id: base.uuid,
    userId: base.uuid,
    from: base.email,
    to: z.array(base.email),
    cc: z.array(base.email).optional(),
    bcc: z.array(base.email).optional(),
    subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
    body: z.string().min(1, 'Email body is required'),
    htmlBody: z.string().optional(),
    attachments: z.array(z.object({
      name: z.string(),
      url: base.url,
      size: base.number,
      type: z.string()
    })).optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
    status: z.enum(['unread', 'read', 'archived', 'deleted']).default('unread'),
    labels: z.array(z.string()).optional(),
    threadId: base.uuid.optional(),
    createdAt: base.date,
    updatedAt: base.date
  }),

  // Email composition
  compose: z.object({
    to: z.array(base.email).min(1, 'At least one recipient is required'),
    cc: z.array(base.email).optional(),
    bcc: z.array(base.email).optional(),
    subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
    body: z.string().min(1, 'Email body is required'),
    htmlBody: z.string().optional(),
    attachments: z.array(z.object({
      name: z.string(),
      file: z.instanceof(File).optional(),
      url: base.url.optional(),
      size: base.number.optional(),
      type: z.string().optional()
    })).optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
    scheduledFor: base.date.optional()
  }),

  // Email reply
  reply: z.object({
    emailId: base.uuid,
    body: z.string().min(1, 'Reply body is required'),
    htmlBody: z.string().optional(),
    attachments: z.array(z.object({
      name: z.string(),
      file: z.instanceof(File).optional(),
      url: base.url.optional()
    })).optional(),
    includeOriginal: z.boolean().default(true)
  }),

  // Email forwarding
  forward: z.object({
    emailId: base.uuid,
    to: z.array(base.email).min(1, 'At least one recipient is required'),
    cc: z.array(base.email).optional(),
    bcc: z.array(base.email).optional(),
    message: z.string().optional(),
    includeAttachments: z.boolean().default(true)
  }),

  // Email filtering
  filter: z.object({
    query: z.string().optional(),
    from: z.array(base.email).optional(),
    to: z.array(base.email).optional(),
    subject: z.string().optional(),
    labels: z.array(z.string()).optional(),
    priority: z.array(z.enum(['low', 'normal', 'high', 'urgent'])).optional(),
    status: z.array(z.enum(['unread', 'read', 'archived', 'deleted'])).optional(),
    dateFrom: base.date.optional(),
    dateTo: base.date.optional(),
    hasAttachments: z.boolean().optional(),
    isRead: z.boolean().optional(),
    isStarred: z.boolean().optional()
  })
};

// AI validation schemas
export const ai = {
  // Generate reply
  generateReply: z.object({
    emailId: base.uuid,
    tone: z.enum(['professional', 'casual', 'friendly', 'formal']).default('professional'),
    length: z.enum(['short', 'medium', 'long']).default('medium'),
    includeContext: z.boolean().default(true),
    customInstructions: z.string().optional(),
    confidence: z.number().min(0).max(1).default(0.8)
  }),

  // Analyze email
  analyzeEmail: z.object({
    emailId: base.uuid,
    analysisType: z.array(z.enum(['priority', 'sentiment', 'urgency', 'summary', 'action_items'])).default(['priority', 'summary']),
    includeConfidence: z.boolean().default(true),
    customPrompt: z.string().optional()
  }),

  // Batch analysis
  batchAnalysis: z.object({
    emailIds: z.array(base.uuid).min(1, 'At least one email is required'),
    analysisType: z.array(z.enum(['priority', 'sentiment', 'urgency', 'summary', 'action_items'])).default(['priority']),
    priority: z.enum(['low', 'normal', 'high']).default('normal')
  }),

  // AI settings
  settings: z.object({
    model: z.enum(['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo']).default('gpt-4o'),
    maxTokens: z.number().min(100).max(4000).default(1000),
    temperature: z.number().min(0).max(2).default(0.7),
    topP: z.number().min(0).max(1).default(1),
    frequencyPenalty: z.number().min(-2).max(2).default(0),
    presencePenalty: z.number().min(-2).max(2).default(0)
  })
};

// Billing validation schemas
export const billing = {
  // Checkout
  checkout: z.object({
    priceId: z.string().min(1, 'Price ID is required'),
    successUrl: base.url,
    cancelUrl: base.url,
    customerEmail: base.email.optional(),
    metadata: z.record(z.string()).optional()
  }),

  // Subscription
  subscription: z.object({
    id: z.string(),
    customerId: z.string(),
    priceId: z.string(),
    status: z.enum(['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid']),
    currentPeriodStart: base.date,
    currentPeriodEnd: base.date,
    cancelAtPeriodEnd: z.boolean(),
    canceledAt: base.date.optional(),
    trialStart: base.date.optional(),
    trialEnd: base.date.optional()
  }),

  // Payment method
  paymentMethod: z.object({
    id: z.string(),
    type: z.enum(['card', 'bank_account']),
    card: z.object({
      brand: z.string(),
      last4: z.string(),
      expMonth: z.number(),
      expYear: z.number()
    }).optional(),
    billingDetails: z.object({
      name: z.string().optional(),
      email: base.email.optional(),
      phone: base.phone.optional(),
      address: z.object({
        line1: z.string().optional(),
        line2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional()
      }).optional()
    }).optional()
  }),

  // Invoice
  invoice: z.object({
    id: z.string(),
    customerId: z.string(),
    subscriptionId: z.string().optional(),
    amount: z.number(),
    currency: z.string(),
    status: z.enum(['draft', 'open', 'paid', 'uncollectible', 'void']),
    dueDate: base.date.optional(),
    paidAt: base.date.optional(),
    lines: z.array(z.object({
      description: z.string(),
      amount: z.number(),
      quantity: z.number()
    }))
  })
};

// Integration validation schemas
export const integration = {
  // Gmail integration
  gmail: z.object({
    userId: base.uuid,
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresAt: base.date,
    scope: z.array(z.string()),
    email: base.email,
    isActive: z.boolean().default(true)
  }),

  // Outlook integration
  outlook: z.object({
    userId: base.uuid,
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresAt: base.date,
    scope: z.array(z.string()),
    email: base.email,
    isActive: z.boolean().default(true)
  }),

  // Slack integration
  slack: z.object({
    userId: base.uuid,
    teamId: z.string(),
    teamName: z.string(),
    accessToken: z.string(),
    scope: z.array(z.string()),
    isActive: z.boolean().default(true)
  })
};

// API validation schemas
export const api: {
  pagination: z.ZodObject<any>;
  search: z.ZodObject<any>;
  webhook: z.ZodObject<any>;
} = {
  // Pagination
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  }),

  // Search
  search: z.object({
    query: z.string().min(1, 'Search query is required'),
    filters: z.record(z.any()).optional(),
    pagination: z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).default('desc')
    }).optional()
  }),

  // Webhook
  webhook: z.object({
    type: z.string(),
    data: z.record(z.any()),
    signature: z.string().optional(),
    timestamp: base.date.optional()
  })
};

// Validation utilities
export const validationUtils = {
  // Validate and sanitize input
  validateAndSanitize: <T>(schema: z.ZodType<T>, data: unknown): T => {
    return schema.parse(data);
  },

  // Validate with custom error handling
  validateWithErrors: <T>(schema: z.ZodType<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: string[];
  } => {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
      return { success: false, errors: ['Validation failed'] };
    }
  },

  // Create validation middleware
  createValidationMiddleware: <T>(schema: z.ZodType<T>) => {
    return (req: any, res: any, next: any) => {
      try {
        const validatedData = schema.parse(req.body);
        req.validatedData = validatedData;
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: 'Validation failed',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          });
        }
        return res.status(400).json({ error: 'Invalid request data' });
      }
    };
  },

  // Create query validation middleware
  createQueryValidationMiddleware: <T>(schema: z.ZodType<T>) => {
    return (req: any, res: any, next: any) => {
      try {
        const validatedData = schema.parse(req.query);
        req.validatedQuery = validatedData;
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: 'Invalid query parameters',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          });
        }
        return res.status(400).json({ error: 'Invalid query parameters' });
      }
    };
  },

  // Create path validation middleware
  createPathValidationMiddleware: <T>(schema: z.ZodType<T>) => {
    return (req: any, res: any, next: any) => {
      try {
        const validatedData = schema.parse(req.params);
        req.validatedParams = validatedData;
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: 'Invalid path parameters',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          });
        }
        return res.status(400).json({ error: 'Invalid path parameters' });
      }
    };
  },

  // Format validation error
  formatValidationError: (error: z.ZodError) => {
    return {
      error: 'Validation failed',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
    };
  },

  // Sanitize input
  sanitizeInput: (input: string, type: 'email' | 'name' | 'phone' | 'url'): string => {
    switch (type) {
      case 'email':
        return input.toLowerCase().trim();
      case 'name':
        return input.trim().replace(/\s+/g, ' ');
      case 'phone':
        return input.replace(/[^\d\s\-\(\)\+]/g, '');
      case 'url':
        return input.trim();
      default:
        return input.trim();
    }
  }
};

// Export all schemas
export const schemas = {
  base,
  user,
  email,
  ai,
  billing,
  integration,
  api
};

// Export default validation instance
export default {
  schemas,
  validationUtils
}; 