// Email testing system - Resend removed
import { Email } from './index';

// Email types and priorities
export const EMAIL_TYPES = {
  WELCOME: 'welcome',
  DAILY_DIGEST: 'daily_digest',
  WEEKLY_SUMMARY: 'weekly_summary',
  NOTIFICATION: 'notification',
  ALERT: 'alert',
  REMINDER: 'reminder',
  CONFIRMATION: 'confirmation',
  RESET_PASSWORD: 'reset_password',
  VERIFICATION: 'verification',
  BILLING: 'billing',
  SUPPORT: 'support',
  MARKETING: 'marketing',
} as const;

export const EMAIL_PRIORITY = {
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low',
} as const;

// Stub email sending function
export const sendEmail = async (emailData: Partial<Email>): Promise<void> => {
  console.log('Email sending disabled - Resend removed:', emailData);
  // Email sending is disabled since Resend was removed
};

// Email testing service
export class EmailTestingService {
  private static instance: EmailTestingService;

  private constructor() {}

  static getInstance(): EmailTestingService {
    if (!EmailTestingService.instance) {
      EmailTestingService.instance = new EmailTestingService();
    }
    return EmailTestingService.instance;
  }

  async testEmailSending(emailData: Partial<Email>): Promise<{
    success: boolean;
    message: string;
    timestamp: Date;
  }> {
    console.log('Email testing disabled - Resend removed:', emailData);
    return {
      success: true,
      message: 'Email testing disabled - Resend removed',
      timestamp: new Date(),
    };
  }

  async validateEmailTemplate(template: string, data: any): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    console.log('Email template validation disabled - Resend removed:', template);
    return {
      valid: true,
      errors: [],
      warnings: ['Email template validation disabled - Resend removed'],
    };
  }

  async testEmailDelivery(email: string): Promise<{
    delivered: boolean;
    reason?: string;
    timestamp: Date;
  }> {
    console.log('Email delivery testing disabled - Resend removed:', email);
    return {
      delivered: true,
      reason: 'Email delivery testing disabled - Resend removed',
      timestamp: new Date(),
    };
  }

  async testEmailRendering(template: string, data: any): Promise<{
    html: string;
    text: string;
    errors: string[];
  }> {
    console.log('Email rendering testing disabled - Resend removed:', template);
    return {
      html: '<p>Email rendering testing disabled - Resend removed</p>',
      text: 'Email rendering testing disabled - Resend removed',
      errors: [],
    };
  }
}

export const emailTestingService = EmailTestingService.getInstance(); 