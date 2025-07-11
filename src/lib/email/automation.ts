import { z } from 'zod';
import { sendEmail, EmailTracking, EMAIL_TYPES, EMAIL_PRIORITY } from './resend';
import { renderEmailTemplate } from './resend';

// Email automation types
export const AUTOMATION_TRIGGERS = {
  USER_SIGNUP: 'user_signup',
  USER_ONBOARDING_COMPLETE: 'user_onboarding_complete',
  EMAIL_PROCESSED: 'email_processed',
  AI_ACTION_COMPLETED: 'ai_action_completed',
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  PAYMENT_FAILED: 'payment_failed',
  TRIAL_ENDING: 'trial_ending',
  INACTIVE_USER: 'inactive_user',
  FEATURE_USAGE: 'feature_usage',
} as const;

export const AUTOMATION_SCHEDULES = {
  DAILY_DIGEST: 'daily_digest',
  WEEKLY_SUMMARY: 'weekly_summary',
  MONTHLY_REPORT: 'monthly_report',
  TRIAL_REMINDER: 'trial_reminder',
  RE_ENGAGEMENT: 're_engagement',
} as const;

// Email automation schemas
const automationTriggerSchema = z.object({
  userId: z.string(),
  trigger: z.enum(Object.values(AUTOMATION_TRIGGERS) as [string, ...string[]]),
  data: z.record(z.any()).optional(),
  timestamp: z.date(),
});

const automationScheduleSchema = z.object({
  userId: z.string(),
  schedule: z.enum(Object.values(AUTOMATION_SCHEDULES) as [string, ...string[]]),
  nextRun: z.date(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  enabled: z.boolean().default(true),
  data: z.record(z.any()).optional(),
});

const userPreferencesSchema = z.object({
  userId: z.string(),
  emailTypes: z.array(z.enum(Object.values(EMAIL_TYPES) as [string, ...string[]])),
  frequency: z.enum(['immediate', 'daily', 'weekly', 'never']),
  digestEnabled: z.boolean().default(true),
  aiNotifications: z.boolean().default(true),
  billingNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  timezone: z.string().default('UTC'),
  preferredTime: z.string().default('09:00'),
});

// Email automation interfaces
export interface AutomationTrigger {
  userId: string;
  trigger: keyof typeof AUTOMATION_TRIGGERS;
  data?: Record<string, any>;
  timestamp: Date;
}

export interface AutomationSchedule {
  userId: string;
  schedule: keyof typeof AUTOMATION_SCHEDULES;
  nextRun: Date;
  frequency: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  data?: Record<string, any>;
}

export interface UserPreferences {
  userId: string;
  emailTypes: (keyof typeof EMAIL_TYPES)[];
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly' | 'never';
  digestEnabled: boolean;
  aiNotifications: boolean;
  billingNotifications: boolean;
  marketingEmails: boolean;
  timezone: string;
  preferredTime: string;
}

export interface EmailAutomation {
  id: string;
  userId: string;
  type: 'trigger' | 'schedule';
  emailType: keyof typeof EMAIL_TYPES;
  subject: string;
  template: string;
  conditions: Record<string, any>;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Email automation service
export class EmailAutomationService {
  private static instance: EmailAutomationService;

  private constructor() {}

  static getInstance(): EmailAutomationService {
    if (!EmailAutomationService.instance) {
      EmailAutomationService.instance = new EmailAutomationService();
    }
    return EmailAutomationService.instance;
  }

  // Trigger-based email automation
  async handleTrigger(trigger: AutomationTrigger): Promise<EmailTracking[]> {
    try {
      automationTriggerSchema.parse(trigger);

      const userPrefs = await this.getUserPreferences(trigger.userId);
      if (!userPrefs) {
        console.log(`No user preferences found for user: ${trigger.userId}`);
        return [];
      }

      const automations = await this.getAutomationsForTrigger(trigger.trigger);
      const results: EmailTracking[] = [];

      for (const automation of automations) {
        if (!automation.enabled) continue;

        // Check if user should receive this email type
        if (!userPrefs.emailTypes.includes(automation.emailType)) continue;

        // Check conditions
        if (!this.evaluateConditions(automation.conditions, trigger.data)) continue;

        // Send email
        const tracking = await this.sendAutomatedEmail(automation, trigger);
        results.push(tracking);
      }

      return results;

    } catch (error) {
      console.error('Failed to handle automation trigger:', error);
      throw error;
    }
  }

  // Scheduled email automation
  async processScheduledEmails(): Promise<EmailTracking[]> {
    try {
      const now = new Date();
      const schedules = await this.getDueSchedules(now);
      const results: EmailTracking[] = [];

      for (const schedule of schedules) {
        const userPrefs = await this.getUserPreferences(schedule.userId);
        if (!userPrefs) continue;

        // Check if user wants this type of email
        if (!this.shouldSendScheduledEmail(schedule.schedule, userPrefs)) continue;

        const tracking = await this.sendScheduledEmail(schedule);
        results.push(tracking);

        // Update next run time
        await this.updateScheduleNextRun(schedule);
      }

      return results;

    } catch (error) {
      console.error('Failed to process scheduled emails:', error);
      throw error;
    }
  }

  // Re-engagement email sequences
  async sendReEngagementSequence(userId: string): Promise<EmailTracking[]> {
    try {
      const userPrefs = await this.getUserPreferences(userId);
      if (!userPrefs || !userPrefs.marketingEmails) {
        return [];
      }

      const sequence = await this.getReEngagementSequence(userId);
      const results: EmailTracking[] = [];

      for (const email of sequence) {
        const tracking = await sendEmail(
          email.recipient,
          email.subject,
          email.html,
          {
            priority: EMAIL_PRIORITY.LOW,
            metadata: {
              type: EMAIL_TYPES.RE_ENGAGEMENT,
              campaignId: email.campaignId,
            },
          }
        );

        results.push(tracking);
      }

      return results;

    } catch (error) {
      console.error('Failed to send re-engagement sequence:', error);
      throw error;
    }
  }

  // Daily digest automation
  async sendDailyDigest(userId: string): Promise<EmailTracking | null> {
    try {
      const userPrefs = await this.getUserPreferences(userId);
      if (!userPrefs || !userPrefs.digestEnabled) {
        return null;
      }

      const digestData = await this.getDailyDigestData(userId);
      if (!digestData) {
        return null;
      }

      const html = await this.renderDailyDigestTemplate(digestData);
      
      return await sendEmail(
        digestData.userEmail,
        `Your Daily Email Digest - ${digestData.date}`,
        html,
        {
          priority: EMAIL_PRIORITY.NORMAL,
          metadata: {
            type: EMAIL_TYPES.DAILY_DIGEST,
            campaignId: `daily_digest_${userId}_${digestData.date}`,
          },
        }
      );

    } catch (error) {
      console.error('Failed to send daily digest:', error);
      throw error;
    }
  }

  // AI notification automation
  async sendAINotification(userId: string, actions: any[]): Promise<EmailTracking | null> {
    try {
      const userPrefs = await this.getUserPreferences(userId);
      if (!userPrefs || !userPrefs.aiNotifications) {
        return null;
      }

      const notificationData = await this.getAINotificationData(userId, actions);
      if (!notificationData) {
        return null;
      }

      const html = await this.renderAINotificationTemplate(notificationData);
      
      return await sendEmail(
        notificationData.userEmail,
        'AI Actions Summary - Super Intelligence AI',
        html,
        {
          priority: EMAIL_PRIORITY.NORMAL,
          metadata: {
            type: EMAIL_TYPES.AI_NOTIFICATION,
            campaignId: `ai_notification_${userId}_${Date.now()}`,
          },
        }
      );

    } catch (error) {
      console.error('Failed to send AI notification:', error);
      throw error;
    }
  }

  // Billing notification automation
  async sendBillingNotification(
    userId: string,
    emailType: 'confirmation' | 'failed' | 'trial_ending' | 'subscription_canceled' | 'payment_reminder',
    billingData: any
  ): Promise<EmailTracking | null> {
    try {
      const userPrefs = await this.getUserPreferences(userId);
      if (!userPrefs || !userPrefs.billingNotifications) {
        return null;
      }

      const html = await this.renderBillingEmailTemplate(emailType, billingData);
      
      return await sendEmail(
        billingData.userEmail,
        `${this.getBillingSubject(emailType)} - Super Intelligence AI`,
        html,
        {
          priority: EMAIL_PRIORITY.HIGH,
          metadata: {
            type: EMAIL_TYPES.BILLING_CONFIRMATION,
            campaignId: `billing_${emailType}_${userId}_${Date.now()}`,
          },
        }
      );

    } catch (error) {
      console.error('Failed to send billing notification:', error);
      throw error;
    }
  }

  // User preference management
  async updateUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      userPreferencesSchema.parse(preferences);
      
      // Update user preferences in database
      console.log(`Updated preferences for user: ${preferences.userId}`);
      
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      // Fetch user preferences from database
      // This is a placeholder implementation
      return {
        userId,
        emailTypes: ['WELCOME', 'DAILY_DIGEST', 'AI_NOTIFICATION'],
        frequency: 'daily',
        digestEnabled: true,
        aiNotifications: true,
        billingNotifications: true,
        marketingEmails: false,
        timezone: 'UTC',
        preferredTime: '09:00',
      };
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return null;
    }
  }

  // Automation management
  async createAutomation(automation: Omit<EmailAutomation, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailAutomation> {
    try {
      // Create automation in database
      const newAutomation: EmailAutomation = {
        ...automation,
        id: `automation_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log(`Created automation: ${newAutomation.id}`);
      return newAutomation;

    } catch (error) {
      console.error('Failed to create automation:', error);
      throw error;
    }
  }

  async updateAutomation(id: string, updates: Partial<EmailAutomation>): Promise<EmailAutomation> {
    try {
      // Update automation in database
      console.log(`Updated automation: ${id}`);
      return {} as EmailAutomation; // Placeholder
    } catch (error) {
      console.error('Failed to update automation:', error);
      throw error;
    }
  }

  async deleteAutomation(id: string): Promise<void> {
    try {
      // Delete automation from database
      console.log(`Deleted automation: ${id}`);
    } catch (error) {
      console.error('Failed to delete automation:', error);
      throw error;
    }
  }

  // Private helper methods
  private async getAutomationsForTrigger(trigger: string): Promise<EmailAutomation[]> {
    // Fetch automations from database
    return []; // Placeholder
  }

  private async getDueSchedules(now: Date): Promise<AutomationSchedule[]> {
    // Fetch due schedules from database
    return []; // Placeholder
  }

  private evaluateConditions(conditions: Record<string, any>, data: Record<string, any> = {}): boolean {
    // Evaluate automation conditions
    return true; // Placeholder
  }

  private async sendAutomatedEmail(automation: EmailAutomation, trigger: AutomationTrigger): Promise<EmailTracking> {
    const html = renderEmailTemplate(automation.template, {
      ...trigger.data,
      userId: trigger.userId,
      timestamp: trigger.timestamp,
    });

    return await sendEmail(
      trigger.data?.userEmail || 'user@example.com',
      automation.subject,
      html,
      {
        priority: EMAIL_PRIORITY.NORMAL,
        metadata: {
          type: automation.emailType,
          automationId: automation.id,
          trigger: trigger.trigger,
        },
      }
    );
  }

  private async sendScheduledEmail(schedule: AutomationSchedule): Promise<EmailTracking> {
    // Send scheduled email
    return {} as EmailTracking; // Placeholder
  }

  private shouldSendScheduledEmail(schedule: string, prefs: UserPreferences): boolean {
    switch (schedule) {
      case AUTOMATION_SCHEDULES.DAILY_DIGEST:
        return prefs.digestEnabled && prefs.frequency === 'daily';
      case AUTOMATION_SCHEDULES.WEEKLY_SUMMARY:
        return prefs.frequency === 'weekly';
      case AUTOMATION_SCHEDULES.MONTHLY_REPORT:
        return prefs.frequency === 'monthly';
      default:
        return true;
    }
  }

  private async updateScheduleNextRun(schedule: AutomationSchedule): Promise<void> {
    // Update next run time based on frequency
    const now = new Date();
    let nextRun: Date;

    switch (schedule.frequency) {
      case 'daily':
        nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        nextRun = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        nextRun = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }

    // Update in database
    console.log(`Updated next run for schedule: ${schedule.schedule} to ${nextRun}`);
  }

  private async getReEngagementSequence(userId: string): Promise<any[]> {
    // Get re-engagement email sequence
    return []; // Placeholder
  }

  private async getDailyDigestData(userId: string): Promise<any> {
    // Get daily digest data
    return null; // Placeholder
  }

  private async getAINotificationData(userId: string, actions: any[]): Promise<any> {
    // Get AI notification data
    return null; // Placeholder
  }

  private async renderDailyDigestTemplate(data: any): Promise<string> {
    // Render daily digest template
    return ''; // Placeholder
  }

  private async renderAINotificationTemplate(data: any): Promise<string> {
    // Render AI notification template
    return ''; // Placeholder
  }

  private async renderBillingEmailTemplate(type: string, data: any): Promise<string> {
    // Render billing email template
    return ''; // Placeholder
  }

  private getBillingSubject(type: string): string {
    switch (type) {
      case 'confirmation': return 'Payment Confirmed';
      case 'failed': return 'Payment Failed';
      case 'trial_ending': return 'Trial Ending Soon';
      case 'subscription_canceled': return 'Subscription Canceled';
      case 'payment_reminder': return 'Payment Due';
      default: return 'Billing Update';
    }
  }
}

// Export singleton instance
export const emailAutomationService = EmailAutomationService.getInstance();

// Type exports
export type AutomationTriggerType = keyof typeof AUTOMATION_TRIGGERS;
export type AutomationScheduleType = keyof typeof AUTOMATION_SCHEDULES; 