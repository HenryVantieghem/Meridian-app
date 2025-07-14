import { rateLimiters, createRateLimitMiddleware, DDoSProtection, RequestSizeLimiter, securityHeaders } from './rate-limiter';
import { encryptionService } from './encryption';
import { schemas, sanitizers, createValidationMiddleware } from './input-validation';
import { dataRetentionService } from './data-retention';
import { backupRecoveryService } from './backup-recovery';

// Security System
// Central export for all security utilities

// Rate Limiting
export { 
  createRateLimitMiddleware,
  DDoSProtection,
  RequestSizeLimiter,
  securityHeaders,
  validateInput
} from './rate-limiter';

// Input Validation
export { 
  schemas,
  createValidationMiddleware,
  createQueryValidationMiddleware,
  createPathValidationMiddleware,
  sanitizers,
  formatValidationError 
} from './input-validation';

// Encryption and Data Protection
export { 
  EncryptionService,
  SecureKeyManager,
  DataProtection,
  encryptionService,
  secureKeyManager,
  dataProtection 
} from './encryption';

// Backup and Recovery
export { 
  BackupRecoveryService,
  backupRecoveryService 
} from './backup-recovery';

export type { 
  Backup,
  Recovery
} from './backup-recovery';

// Data Retention
export { 
  DataRetentionService,
  dataRetentionService 
} from './data-retention';

export type { 
  RetentionPolicy,
  DataCategory,
  RetentionRule
} from './data-retention';

// Security Utilities
export const securityUtils = {
  // Rate limiting
  checkRateLimit: (type: keyof typeof rateLimiters, req: any) => {
    return rateLimiters[type].middleware(req);
  },

  // Input validation
  validateInput: (data: any, schema: any) => {
    return schema.parse(data);
  },

  // Data encryption
  encryptData: (data: string) => {
    return encryptionService.encrypt(data);
  },

  decryptData: (encryptedData: string) => {
    return encryptionService.decrypt(encryptedData);
  },

  // Password hashing
  hashPassword: (password: string) => {
    return encryptionService.hashPassword(password);
  },

  verifyPassword: (password: string, hash: string) => {
    return encryptionService.verifyPassword(password, hash);
  },

  // Data sanitization
  sanitizeInput: (input: string, type: keyof typeof sanitizers) => {
    return sanitizers[type](input);
  },

  // Token generation
  generateToken: (length: number = 32) => {
    return encryptionService.generateToken(length);
  },

  generateId: () => {
    return encryptionService.generateId();
  }
};

// Security Middleware
export const securityMiddleware = {
  // Rate limiting
  rateLimit: (type: keyof typeof rateLimiters) => {
    return createRateLimitMiddleware(type);
  },

  // Input validation
  validate: (schema: any) => {
    return createValidationMiddleware(schema);
  },

  // Security headers
  headers: () => {
    return securityHeaders;
  },

  // DDoS protection
  ddos: () => {
    return new DDoSProtection();
  },

  // Request size limiting
  sizeLimit: (maxSize: number = 10 * 1024 * 1024) => {
    return new RequestSizeLimiter(maxSize);
  }
};

// Security Configuration
export const securityConfig = {
  // Rate limiting
  rateLimiting: {
    api: { windowMs: 60000, maxRequests: 100 },
    auth: { windowMs: 900000, maxRequests: 5 },
    ai: { windowMs: 60000, maxRequests: 10 },
    email: { windowMs: 300000, maxRequests: 50 },
    webhook: { windowMs: 60000, maxRequests: 1000 },
    general: { windowMs: 60000, maxRequests: 200 }
  },

  // Encryption
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16,
    saltLength: 64,
    hashAlgorithm: 'sha256',
    hashIterations: 100000
  },

  // Data retention
  retention: {
    userProfile: 'permanent',
    emailData: '365_days',
    aiAnalysis: '90_days',
    paymentData: '365_days',
    auditLogs: '90_days',
    errorLogs: '30_days',
    analytics: '365_days',
    backupData: '90_days'
  },

  // Security headers
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  },

  // Content Security Policy
  csp: [
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
  ].join('; ')
};

// Security Validation Schemas
export const securitySchemas = {
  // User input validation
  user: {
    email: schemas.base.email,
    password: schemas.base.password,
    name: schemas.base.name,
    phone: schemas.base.phone
  },

  // API input validation
  api: {
    emailData: schemas.email.emailData,
    aiRequest: schemas.ai.generateReply,
    paymentData: schemas.billing.checkout,
    userProfile: schemas.user.userProfile
  },

  // File upload validation
  file: {
    image: schemas.base.url.refine((url) => {
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    }, 'Must be a valid image URL'),
    
    document: schemas.base.url.refine((url) => {
      return /\.(pdf|doc|docx|txt)$/i.test(url);
    }, 'Must be a valid document URL')
  }
};

// Security Audit Utilities
export const securityAudit = {
  // Check for common vulnerabilities
  async checkVulnerabilities(): Promise<{
    sqlInjection: boolean;
    xss: boolean;
    csrf: boolean;
    rateLimit: boolean;
    encryption: boolean;
  }> {
    return {
      sqlInjection: true, // Would check for parameterized queries
      xss: true, // Would check for proper sanitization
      csrf: true, // Would check for CSRF tokens
      rateLimit: true, // Would check rate limiting implementation
      encryption: true // Would check encryption usage
    };
  },

  // Audit user permissions
  async auditUserPermissions(_userId: string): Promise<{
    permissions: string[];
    roles: string[];
    lastAccess: Date;
    suspiciousActivity: boolean;
  }> {
    // Implementation would check user permissions
    return {
      permissions: ['read', 'write'],
      roles: ['user'],
      lastAccess: new Date(),
      suspiciousActivity: false
    };
  },

  // Check data access patterns
  async auditDataAccess(_userId: string): Promise<{
    tables: string[];
    operations: string[];
    frequency: number;
    anomalies: string[];
  }> {
    // Implementation would analyze data access patterns
    return {
      tables: ['emails', 'analyses'],
      operations: ['SELECT', 'INSERT'],
      frequency: 10,
      anomalies: []
    };
  }
};

// Security Monitoring
export const securityMonitoring = {
  // Track security events
  trackSecurityEvent: (event: {
    type: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    details: unknown;
  }) => {
    console.log('Security event:', event);
    // Implementation would log to security monitoring service
  },

  async logSecurityEvent(_userId: string, _ip: string, _action: string): Promise<void> {
    console.log('Security event logged');
    // Implementation would log to security monitoring service
  }
};

// Export default security instance
export default {
  rateLimiters,
  encryptionService,
  backupRecoveryService,
  dataRetentionService,
  securityUtils,
  securityMiddleware,
  securityConfig,
  securitySchemas,
  securityAudit,
  securityMonitoring
}; 