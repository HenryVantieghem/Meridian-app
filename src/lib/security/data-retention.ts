import { createClient } from '@supabase/supabase-js';

// Data retention policies
export enum RetentionPolicy {
  IMMEDIATE = 'immediate',
  DAYS_7 = '7_days',
  DAYS_30 = '30_days',
  DAYS_90 = '90_days',
  DAYS_365 = '365_days',
  PERMANENT = 'permanent'
}

export enum DataCategory {
  USER_PROFILE = 'user_profile',
  EMAIL_DATA = 'email_data',
  AI_ANALYSIS = 'ai_analysis',
  PAYMENT_DATA = 'payment_data',
  AUDIT_LOGS = 'audit_logs',
  ERROR_LOGS = 'error_logs',
  ANALYTICS = 'analytics',
  BACKUP_DATA = 'backup_data'
}

// Data retention rule interface
export interface RetentionRule {
  id: string;
  category: DataCategory;
  policy: RetentionPolicy;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  conditions?: Record<string, unknown>;
}

// Data retention service
export class DataRetentionService {
  private supabase: ReturnType<typeof createClient>;
  private rules: Map<DataCategory, RetentionRule> = new Map();

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.initializeDefaultRules();
  }

  /**
   * Initialize default retention rules
   */
  private initializeDefaultRules(): void {
    const defaultRules: RetentionRule[] = [
      {
        id: 'user-profile-default',
        category: DataCategory.USER_PROFILE,
        policy: RetentionPolicy.PERMANENT,
        description: 'User profiles are retained until account deletion',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        id: 'email-data-default',
        category: DataCategory.EMAIL_DATA,
        policy: RetentionPolicy.DAYS_365,
        description: 'Email data retained for 1 year',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        id: 'ai-analysis-default',
        category: DataCategory.AI_ANALYSIS,
        policy: RetentionPolicy.DAYS_90,
        description: 'AI analysis data retained for 90 days',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        id: 'payment-data-default',
        category: DataCategory.PAYMENT_DATA,
        policy: RetentionPolicy.DAYS_365,
        description: 'Payment data retained for 1 year for compliance',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        id: 'audit-logs-default',
        category: DataCategory.AUDIT_LOGS,
        policy: RetentionPolicy.DAYS_90,
        description: 'Audit logs retained for 90 days',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        id: 'error-logs-default',
        category: DataCategory.ERROR_LOGS,
        policy: RetentionPolicy.DAYS_30,
        description: 'Error logs retained for 30 days',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        id: 'analytics-default',
        category: DataCategory.ANALYTICS,
        policy: RetentionPolicy.DAYS_365,
        description: 'Analytics data retained for 1 year',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        id: 'backup-data-default',
        category: DataCategory.BACKUP_DATA,
        policy: RetentionPolicy.DAYS_90,
        description: 'Backup data retained for 90 days',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      }
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.category, rule);
    });
  }

  /**
   * Get retention policy for data category
   */
  getRetentionPolicy(category: DataCategory): RetentionPolicy {
    const rule = this.rules.get(category);
    return rule?.policy || RetentionPolicy.DAYS_30;
  }

  /**
   * Set retention policy for data category
   */
  setRetentionPolicy(category: DataCategory, policy: RetentionPolicy, description?: string): void {
    const rule: RetentionRule = {
      id: `${category}-${Date.now()}`,
      category,
      policy,
      description: description || `Custom retention policy for ${category}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    this.rules.set(category, rule);
    this.saveRetentionRule(rule);
  }

  /**
   * Check if data should be retained
   */
  shouldRetainData(category: DataCategory, createdAt: Date): boolean {
    const policy = this.getRetentionPolicy(category);
    const now = new Date();
    const ageInDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    switch (policy) {
      case RetentionPolicy.IMMEDIATE:
        return false;
      case RetentionPolicy.DAYS_7:
        return ageInDays <= 7;
      case RetentionPolicy.DAYS_30:
        return ageInDays <= 30;
      case RetentionPolicy.DAYS_90:
        return ageInDays <= 90;
      case RetentionPolicy.DAYS_365:
        return ageInDays <= 365;
      case RetentionPolicy.PERMANENT:
        return true;
      default:
        return ageInDays <= 30;
    }
  }

  /**
   * Get data that should be deleted
   */
  async getDataForDeletion(): Promise<{
    category: DataCategory;
    count: number;
    oldestRecord: Date;
    newestRecord: Date;
  }[]> {
    const results: Array<{
      category: DataCategory;
      count: number;
      oldestRecord: Date;
      newestRecord: Date;
    }> = [];

    for (const [category, rule] of this.rules.entries()) {
      if (!rule.isActive) continue;

      const expiredData = await this.getExpiredData(category, rule.policy);
      
      if (expiredData.length > 0) {
        const oldestRecord = new Date(Math.min(...expiredData.map(d => d.created_at)));
        const newestRecord = new Date(Math.max(...expiredData.map(d => d.created_at)));

        results.push({
          category,
          count: expiredData.length,
          oldestRecord,
          newestRecord
        });
      }
    }

    return results;
  }

  /**
   * Delete expired data
   */
  async deleteExpiredData(): Promise<{
    category: DataCategory;
    deletedCount: number;
    errors: string[];
  }[]> {
    const results: Array<{
      category: DataCategory;
      deletedCount: number;
      errors: string[];
    }> = [];

    for (const [category, rule] of this.rules.entries()) {
      if (!rule.isActive) continue;

      const errors: string[] = [];
      let deletedCount = 0;

      try {
        const expiredData = await this.getExpiredData(category, rule.policy);
        
        if (expiredData.length > 0) {
          // Delete data based on category
          switch (category) {
            case DataCategory.EMAIL_DATA:
              deletedCount = await this.deleteExpiredEmails(expiredData);
              break;
            case DataCategory.AI_ANALYSIS:
              deletedCount = await this.deleteExpiredAIAnalysis(expiredData);
              break;
            case DataCategory.AUDIT_LOGS:
              deletedCount = await this.deleteExpiredAuditLogs(expiredData);
              break;
            case DataCategory.ERROR_LOGS:
              deletedCount = await this.deleteExpiredErrorLogs(expiredData);
              break;
            case DataCategory.ANALYTICS:
              deletedCount = await this.deleteExpiredAnalytics(expiredData);
              break;
            case DataCategory.BACKUP_DATA:
              deletedCount = await this.deleteExpiredBackups(expiredData);
              break;
            default:
              errors.push(`No deletion handler for category: ${category}`);
          }
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'Unknown error');
      }

      results.push({
        category,
        deletedCount,
        errors
      });
    }

    return results;
  }

  /**
   * Get expired data for a category
   */
  private async getExpiredData(category: DataCategory, policy: RetentionPolicy): Promise<Record<string, unknown>[]> {
    const cutoffDate = this.getCutoffDate(policy);
    
    let tableName: string;
    switch (category) {
      case DataCategory.EMAIL_DATA:
        tableName = 'emails';
        break;
      case DataCategory.AI_ANALYSIS:
        tableName = 'email_analyses';
        break;
      case DataCategory.AUDIT_LOGS:
        tableName = 'audit_logs';
        break;
      case DataCategory.ERROR_LOGS:
        tableName = 'error_logs';
        break;
      case DataCategory.ANALYTICS:
        tableName = 'analytics_events';
        break;
      case DataCategory.BACKUP_DATA:
        tableName = 'backups';
        break;
      default:
        return [];
    }

    try {
      const { data, error } = await this.supabase
        .from(tableName)
        .select('*')
        .lt('created_at', cutoffDate.toISOString());

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Failed to get expired data for ${category}:`, error);
      return [];
    }
  }

  /**
   * Get cutoff date for retention policy
   */
  private getCutoffDate(policy: RetentionPolicy): Date {
    const now = new Date();
    
    switch (policy) {
      case RetentionPolicy.IMMEDIATE:
        return new Date(0);
      case RetentionPolicy.DAYS_7:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case RetentionPolicy.DAYS_30:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case RetentionPolicy.DAYS_90:
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case RetentionPolicy.DAYS_365:
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      case RetentionPolicy.PERMANENT:
        return new Date(0);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Delete expired emails
   */
  private async deleteExpiredEmails(expiredData: Record<string, unknown>[]): Promise<number> {
    const emailIds = expiredData.map(d => d.id);
    
    const { error } = await this.supabase
      .from('emails')
      .delete()
      .in('id', emailIds);

    if (error) {
      throw error;
    }

    return emailIds.length;
  }

  /**
   * Delete expired AI analysis
   */
  private async deleteExpiredAIAnalysis(expiredData: Record<string, unknown>[]): Promise<number> {
    const analysisIds = expiredData.map(d => d.id);
    
    const { error } = await this.supabase
      .from('email_analyses')
      .delete()
      .in('id', analysisIds);

    if (error) {
      throw error;
    }

    return analysisIds.length;
  }

  /**
   * Delete expired audit logs
   */
  private async deleteExpiredAuditLogs(expiredData: Record<string, unknown>[]): Promise<number> {
    const logIds = expiredData.map(d => d.id);
    
    const { error } = await this.supabase
      .from('audit_logs')
      .delete()
      .in('id', logIds);

    if (error) {
      throw error;
    }

    return logIds.length;
  }

  /**
   * Delete expired error logs
   */
  private async deleteExpiredErrorLogs(expiredData: Record<string, unknown>[]): Promise<number> {
    const logIds = expiredData.map(d => d.id);
    
    const { error } = await this.supabase
      .from('error_logs')
      .delete()
      .in('id', logIds);

    if (error) {
      throw error;
    }

    return logIds.length;
  }

  /**
   * Delete expired analytics
   */
  private async deleteExpiredAnalytics(expiredData: Record<string, unknown>[]): Promise<number> {
    const eventIds = expiredData.map(d => d.id);
    
    const { error } = await this.supabase
      .from('analytics_events')
      .delete()
      .in('id', eventIds);

    if (error) {
      throw error;
    }

    return eventIds.length;
  }

  /**
   * Delete expired backups
   */
  private async deleteExpiredBackups(expiredData: Record<string, unknown>[]): Promise<number> {
    const backupIds = expiredData.map(d => d.id);
    
    const { error } = await this.supabase
      .from('backups')
      .delete()
      .in('id', backupIds);

    if (error) {
      throw error;
    }

    return backupIds.length;
  }

  /**
   * Save retention rule to database
   */
  private async saveRetentionRule(rule: RetentionRule): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('retention_rules')
        .upsert({
          id: rule.id,
          category: rule.category,
          policy: rule.policy,
          description: rule.description,
          created_at: rule.createdAt.toISOString(),
          updated_at: rule.updatedAt.toISOString(),
          is_active: rule.isActive,
          conditions: rule.conditions
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to save retention rule:', error);
      throw error;
    }
  }

  /**
   * Load retention rules from database
   */
  async loadRetentionRules(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('retention_rules')
        .select('*')
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      data?.forEach((rule: {
        id: string;
        category: DataCategory;
        policy: RetentionPolicy;
        description: string;
        created_at: string;
        updated_at: string;
        is_active: boolean;
        conditions: Record<string, any>;
      }) => {
        this.rules.set(rule.category, {
          id: rule.id,
          category: rule.category,
          policy: rule.policy,
          description: rule.description,
          createdAt: new Date(rule.created_at),
          updatedAt: new Date(rule.updated_at),
          isActive: rule.is_active,
          conditions: rule.conditions
        });
      });
    } catch (error) {
      console.error('Failed to load retention rules:', error);
    }
  }

  /**
   * Get retention statistics
   */
  async getRetentionStats(): Promise<{
    totalRules: number;
    activeRules: number;
    dataForDeletion: Array<{
      category: DataCategory;
      count: number;
    }>;
  }> {
    const totalRules = this.rules.size;
    const activeRules = Array.from(this.rules.values()).filter(r => r.isActive).length;
    const dataForDeletion = await this.getDataForDeletion();

    return {
      totalRules,
      activeRules,
      dataForDeletion: dataForDeletion.map(d => ({
        category: d.category,
        count: d.count
      }))
    };
  }

  /**
   * Export data for GDPR compliance
   */
  async exportUserData(_userId: string): Promise<{
    userProfile: Record<string, unknown>;
    emails: Record<string, unknown>[];
    aiAnalysis: Record<string, unknown>[];
    auditLogs: Record<string, unknown>[];
    analytics: Record<string, unknown>[];
  }> {
    try {
      const [userProfile, emails, aiAnalysis, auditLogs, analytics] = await Promise.all([
        this.supabase.from('users').select('*').eq('id', userId).single(),
        this.supabase.from('emails').select('*').eq('user_id', userId),
        this.supabase.from('email_analyses').select('*').eq('user_id', userId),
        this.supabase.from('audit_logs').select('*').eq('user_id', userId),
        this.supabase.from('analytics_events').select('*').eq('user_id', userId)
      ]);

      return {
        userProfile: userProfile.data,
        emails: emails.data || [],
        aiAnalysis: aiAnalysis.data || [],
        auditLogs: auditLogs.data || [],
        analytics: analytics.data || []
      };
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw error;
    }
  }

  /**
   * Delete user data for GDPR compliance
   */
  async deleteUserData(userId: string): Promise<{
    deletedTables: string[];
    deletedRecords: number;
    errors: string[];
  }> {
    const deletedTables: string[] = [];
    const errors: string[] = [];
    let totalDeletedRecords = 0;

    const tables = ['emails', 'email_analyses', 'audit_logs', 'analytics_events'];

    for (const table of tables) {
      try {
        const { count, error } = await this.supabase
          .from(table)
          .delete()
          .eq('user_id', userId)
          .select('count');

        if (error) {
          errors.push(`Failed to delete from ${table}: ${error.message}`);
        } else {
          deletedTables.push(table);
          totalDeletedRecords += count || 0;
        }
      } catch (error) {
        errors.push(`Error deleting from ${table}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      deletedTables,
      deletedRecords: totalDeletedRecords,
      errors
    };
  }
}

// Export singleton
export const dataRetentionService = new DataRetentionService(); 