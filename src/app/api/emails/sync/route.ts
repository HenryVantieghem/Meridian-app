import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { GmailClient } from '@/lib/email/gmail-sync';
import { logger } from '@/lib/monitoring/logging';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  let userId: string | null | undefined;
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { maxResults = 100, syncFrom, forceFullSync = false } = await request.json();

    // Get user's Gmail integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'gmail')
      .eq('is_active', true)
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'Gmail integration not found or inactive' },
        { status: 404 }
      );
    }

    // Create Gmail client
    const gmailClient = new GmailClient(
      integration.access_token,
      integration.refresh_token
    );

    // Get last sync date
    let lastSyncDate = syncFrom ? new Date(syncFrom) : null;
    if (!lastSyncDate && !forceFullSync) {
      const { data: lastSync } = await supabase
        .from('sync_status')
        .select('last_sync_date')
        .eq('user_id', userId)
        .eq('provider', 'gmail')
        .single();

      if (lastSync?.last_sync_date) {
        lastSyncDate = new Date(lastSync.last_sync_date);
      }
    }

    // Build query for Gmail API
    let query = '';
    if (lastSyncDate && !forceFullSync) {
      query = `after:${lastSyncDate.toISOString()}`;
    }

    // Fetch emails from Gmail
    const gmailEmails = await gmailClient.getMessages({
      maxResults,
      q: query,
      includeSpamTrash: false
    });

    const errors: string[] = [];
    let emailsSynced = 0;

    // Transform and store emails
    for (const gmailEmail of gmailEmails) {
      try {
        const email = {
          id: gmailEmail.id,
          user_id: userId,
          external_id: gmailEmail.id,
          from_address: {
            name: gmailEmail.fromName,
            email: gmailEmail.from
          },
          to_addresses: gmailEmail.to.map((email: string) => ({
            name: '',
            email
          })),
          cc_addresses: gmailEmail.cc.map((email: string) => ({
            name: '',
            email
          })),
          bcc_addresses: gmailEmail.bcc.map((email: string) => ({
            name: '',
            email
          })),
          subject: gmailEmail.subject,
          body: gmailEmail.body,
          body_html: gmailEmail.bodyHtml,
          attachments: gmailEmail.attachments.map((att) => ({
            id: att.id,
            filename: att.filename,
            contentType: att.mimeType,
            size: att.size,
            url: att.data || ''
          })),
          received_at: gmailEmail.date.toISOString(),
          read: gmailEmail.isRead,
          starred: false,
          archived: false,
          labels: gmailEmail.labels,
          thread_id: gmailEmail.threadId,
          priority: gmailEmail.priority,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Upsert email in database
        const { error: upsertError } = await supabase
          .from('emails')
          .upsert(email, {
            onConflict: 'user_id,external_id'
          });

        if (upsertError) {
          errors.push(`Failed to store email ${gmailEmail.id}: ${upsertError.message}`);
        } else {
          emailsSynced++;
        }

      } catch (emailError) {
        errors.push(`Failed to process email ${gmailEmail.id}: ${emailError}`);
      }
    }

    logger.info(`Email sync completed for user ${userId}: ${emailsSynced} emails, ${errors.length} errors`);

    return NextResponse.json({
      success: errors.length === 0,
      emailsSynced,
      errors,
      lastSyncDate: new Date()
    });

  } catch (error) {
    logger.error(`Email sync API error for user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 