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

  async validateEmailTemplate(template: string, _data: unknown): Promise<{
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

  async testEmailRendering(template: string, _data: unknown): Promise<{
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

export async function testEmailConnection(
  provider: 'gmail' | 'outlook' | 'imap',
  _credentials: unknown
): Promise<{
  success: boolean;
  error?: string;
  details?: unknown;
}> {
  try {
    // Mock implementation
    return {
      success: true,
      details: {
        provider,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function testEmailSync(
  _userId: string,
  _provider: 'gmail' | 'outlook' | 'imap',
  _credentials: unknown
): Promise<{
  success: boolean;
  syncedCount: number;
  error?: string;
}> {
  try {
    // Mock implementation
    return {
      success: true,
      syncedCount: 0,
    };
  } catch (error) {
    return {
      success: false,
      syncedCount: 0,
      error: error instanceof Error ? error.message : 'Sync failed',
    };
  }
}

export async function validateEmailCredentials(
  provider: 'gmail' | 'outlook' | 'imap',
  _credentials: unknown
): Promise<{
  valid: boolean;
  error?: string;
  userInfo?: {
    email: string;
    name?: string;
    provider: string;
  };
}> {
  try {
    // Mock implementation
    return {
      valid: true,
      userInfo: {
        email: 'test@example.com',
        name: 'Test User',
        provider,
      },
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid credentials',
    };
  }
}

export async function getEmailProviderInfo(
  provider: 'gmail' | 'outlook' | 'imap'
): Promise<{
  name: string;
  description: string;
  features: string[];
  setupInstructions: string[];
}> {
  const providerInfo = {
    gmail: {
      name: 'Gmail',
      description: 'Google Gmail integration',
      features: ['OAuth2 authentication', 'Real-time sync', 'Label support'],
      setupInstructions: [
        'Create a Google Cloud project',
        'Enable Gmail API',
        'Configure OAuth2 credentials',
      ],
    },
    outlook: {
      name: 'Outlook',
      description: 'Microsoft Outlook integration',
      features: ['OAuth2 authentication', 'Calendar integration', 'Contact sync'],
      setupInstructions: [
        'Register your application in Azure AD',
        'Configure API permissions',
        'Set up OAuth2 flow',
      ],
    },
    imap: {
      name: 'IMAP',
      description: 'Generic IMAP email server',
      features: ['Standard IMAP protocol', 'Multiple server support'],
      setupInstructions: [
        'Configure IMAP server settings',
        'Set up authentication credentials',
        'Test connection',
      ],
    },
  };

  return providerInfo[provider];
}

// Email test result type
export interface EmailTestResult {
  success: boolean;
  message: string;
  timestamp: Date;
  details?: Record<string, unknown>;
} 