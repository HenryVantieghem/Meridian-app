import { Resend } from 'resend';
import { z } from 'zod';

// Resend client configuration
export const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
export const EMAIL_CONFIG = {
  from: {
    name: 'Super Intelligence AI',
    email: 'noreply@super-intelligence.ai',
  },
  replyTo: 'support@super-intelligence.ai',
  defaultSubject: 'Message from Super Intelligence',
} as const;

// Email types for type safety
export const EMAIL_TYPES = {
  WELCOME: 'welcome',
  DAILY_DIGEST: 'daily_digest',
  AI_NOTIFICATION: 'ai_notification',
  BILLING_CONFIRMATION: 'billing_confirmation',
  BILLING_FAILED: 'billing_failed',
  TRIAL_ENDING: 'trial_ending',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  PAYMENT_REMINDER: 'payment_reminder',
  RE_ENGAGEMENT: 're_engagement',
  SECURITY_ALERT: 'security_alert',
} as const;

// Email priority levels
export const EMAIL_PRIORITY = {
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low',
} as const;

// Email validation schemas
const emailRecipientSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

const emailContentSchema = z.object({
  subject: z.string().min(1).max(100),
  html: z.string().min(1),
  text: z.string().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.any(),
    contentType: z.string().optional(),
  })).optional(),
});

const emailOptionsSchema = z.object({
  priority: z.enum([EMAIL_PRIORITY.HIGH, EMAIL_PRIORITY.NORMAL, EMAIL_PRIORITY.LOW]).default(EMAIL_PRIORITY.NORMAL),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string()).optional(),
  replyTo: z.string().email().optional(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  text: z.string().optional(),
});

// Email tracking and analytics
export interface EmailTracking {
  id: string;
  type: keyof typeof EMAIL_TYPES;
  recipient: string;
  subject: string;
  status: 'sent' | 'delivered' | 'bounced' | 'failed';
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bounceReason?: string;
  metadata?: Record<string, any>;
}

// Email error handling
export class EmailError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'EmailError';
  }
}

export const handleEmailError = (error: any): EmailError => {
  if (error instanceof EmailError) {
    return error;
  }

  // Handle Resend-specific errors
  if (error?.message?.includes('rate limit')) {
    return new EmailError(
      'Rate limit exceeded. Please try again later.',
      'rate_limit_exceeded',
      429,
      true
    );
  }

  if (error?.message?.includes('invalid email')) {
    return new EmailError(
      'Invalid email address provided.',
      'invalid_email',
      400,
      false
    );
  }

  if (error?.message?.includes('quota exceeded')) {
    return new EmailError(
      'Email quota exceeded. Please upgrade your plan.',
      'quota_exceeded',
      429,
      false
    );
  }

  return new EmailError(
    'Failed to send email. Please try again.',
    'send_failed',
    500,
    true
  );
};

// Email sending with retry logic
export const sendEmail = async (
  to: string | string[],
  subject: string,
  html: string,
  options: z.infer<typeof emailOptionsSchema> = { priority: EMAIL_PRIORITY.NORMAL }
): Promise<EmailTracking> => {
  try {
    // Validate inputs
    const recipients = Array.isArray(to) ? to : [to];
    recipients.forEach(email => {
      emailRecipientSchema.parse({ email });
    });

    emailContentSchema.parse({ subject, html });
    emailOptionsSchema.parse(options);

    // Prepare email data
    const emailData = {
      from: `${EMAIL_CONFIG.from.name} <${EMAIL_CONFIG.from.email}>`,
      to: recipients,
      subject,
      html,
      text: options.text || stripHtml(html),
      reply_to: options.replyTo || EMAIL_CONFIG.replyTo,
      cc: options.cc,
      bcc: options.bcc,
      headers: {
        'X-Email-Type': options.metadata?.type || 'transactional',
        'X-Priority': options.priority,
        'X-Campaign-ID': options.metadata?.campaignId,
      },
      tags: options.tags || [],
    };

    // Send email with retry logic
    const result = await sendEmailWithRetry(emailData, options);

    // Create tracking record
    const tracking: EmailTracking = {
      id: result.id,
      type: (options.metadata?.type as keyof typeof EMAIL_TYPES) || 'ai_notification',
      recipient: recipients[0],
      subject,
      status: 'sent',
      sentAt: new Date(),
      metadata: options.metadata,
    };

    // Log email sent
    console.log(`Email sent successfully: ${result.id} to ${recipients.join(', ')}`);

    return tracking;

  } catch (error) {
    const emailError = handleEmailError(error);
    console.error('Email sending failed:', emailError);
    throw emailError;
  }
};

// Retry logic for email sending
const sendEmailWithRetry = async (
  emailData: any,
  options: z.infer<typeof emailOptionsSchema>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<any> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await resend.emails.send(emailData);
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.log(`Email send attempt ${attempt} failed, retrying in ${waitTime}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
};

// Template rendering utilities
export const renderEmailTemplate = (
  template: string,
  variables: Record<string, any>
): string => {
  let rendered = template;
  
  // Replace variables in template
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value));
  });

  return rendered;
};

// HTML utilities
export const stripHtml = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

// Email analytics and tracking
export const trackEmailEvent = async (
  emailId: string,
  event: 'delivered' | 'opened' | 'clicked' | 'bounced',
  data?: Record<string, any>
): Promise<void> => {
  try {
    // Update tracking in database
    // This would typically update a tracking table
    console.log(`Email event tracked: ${emailId} - ${event}`, data);
  } catch (error) {
    console.error('Failed to track email event:', error);
  }
};

// Email validation and sanitization
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Email list management
export const addToEmailList = async (
  email: string,
  listName: string,
  metadata?: Record<string, any>
): Promise<void> => {
  try {
    // Add to email list in database
    console.log(`Added ${email} to list: ${listName}`);
  } catch (error) {
    console.error('Failed to add to email list:', error);
    throw error;
  }
};

export const removeFromEmailList = async (
  email: string,
  listName: string
): Promise<void> => {
  try {
    // Remove from email list in database
    console.log(`Removed ${email} from list: ${listName}`);
  } catch (error) {
    console.error('Failed to remove from email list:', error);
    throw error;
  }
};

// Bounce handling
export const handleBounce = async (
  email: string,
  reason: string,
  bounceType: 'hard' | 'soft'
): Promise<void> => {
  try {
    if (bounceType === 'hard') {
      // Mark email as invalid
      console.log(`Hard bounce for ${email}: ${reason}`);
    } else {
      // Soft bounce - retry later
      console.log(`Soft bounce for ${email}: ${reason}`);
    }
  } catch (error) {
    console.error('Failed to handle bounce:', error);
  }
};

// Email performance tracking
export interface EmailMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

export const getEmailMetrics = async (
  campaignId?: string,
  dateRange?: { start: Date; end: Date }
): Promise<EmailMetrics> => {
  try {
    // Fetch metrics from database or analytics service
    // This is a placeholder implementation
    return {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
    };
  } catch (error) {
    console.error('Failed to get email metrics:', error);
    throw error;
  }
};

// Type exports
export type EmailType = keyof typeof EMAIL_TYPES;
export type EmailPriority = keyof typeof EMAIL_PRIORITY; 