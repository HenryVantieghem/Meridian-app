import { createClient } from '@supabase/supabase-js';
import { Email } from '@/types';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SyncOptions {
  userId: string;
  maxResults?: number;
  syncFrom?: Date;
  forceFullSync?: boolean;
}

export interface SyncResult {
  success: boolean;
  emailsSynced: number;
  errors: string[];
  lastSyncDate: Date;
}

export class EmailSyncService {
  private static instance: EmailSyncService;

  static getInstance(): EmailSyncService {
    if (!EmailSyncService.instance) {
      EmailSyncService.instance = new EmailSyncService();
    }
    return EmailSyncService.instance;
  }

  /**
   * Sync emails for a user from Gmail
   */
  async syncEmails(options: SyncOptions): Promise<SyncResult> {
    const { userId, maxResults = 100, syncFrom, forceFullSync = false } = options;
    const errors: string[] = [];
    let emailsSynced = 0;

    try {
      // Get user's Gmail integration
      const { data: integration, error: integrationError } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', 'gmail')
        .eq('is_active', true)
        .single();

      if (integrationError || !integration) {
        throw new Error('Gmail integration not found or inactive');
      }

      // Call server action for Gmail sync
      const response = await fetch('/api/emails/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          maxResults,
          syncFrom: syncFrom?.toISOString(),
          forceFullSync,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync emails');
      }

      const syncResult = await response.json();

      // Update sync status
      const now = new Date();
      await supabase
        .from('sync_status')
        .upsert({
          user_id: userId,
          provider: 'gmail',
          last_sync_date: now.toISOString(),
          emails_synced: syncResult.emailsSynced,
          errors_count: syncResult.errors.length,
          updated_at: now.toISOString()
        }, {
          onConflict: 'user_id,provider'
        });

      return {
        success: syncResult.success,
        emailsSynced: syncResult.emailsSynced,
        errors: syncResult.errors,
        lastSyncDate: now
      };

    } catch (error) {
      console.error('Email sync failed', { error, userId });
      return {
        success: false,
        emailsSynced: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        lastSyncDate: new Date()
      };
    }
  }

  /**
   * Get sync status for a user
   */
  async getSyncStatus(userId: string): Promise<{
    lastSync: Date | null;
    emailsCount: number;
    isActive: boolean;
  }> {
    try {
      const { data: syncStatus } = await supabase
        .from('sync_status')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', 'gmail')
        .single();

      const { data: integration } = await supabase
        .from('integrations')
        .select('is_active')
        .eq('user_id', userId)
        .eq('provider', 'gmail')
        .single();

      const { count: emailsCount } = await supabase
        .from('emails')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return {
        lastSync: syncStatus?.last_sync_date ? new Date(syncStatus.last_sync_date) : null,
        emailsCount: emailsCount || 0,
        isActive: integration?.is_active || false
      };
    } catch (error) {
      console.error('Failed to get sync status', { error, userId });
      return {
        lastSync: null,
        emailsCount: 0,
        isActive: false
      };
    }
  }
}

export const emailSyncService = EmailSyncService.getInstance(); 