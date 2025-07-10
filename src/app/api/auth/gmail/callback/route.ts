import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/monitoring/logging';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// OAuth2 client for Gmail
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(request: NextRequest) {
  let userId: string | null | undefined;
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      logger.error(`Gmail OAuth error for user ${userId}: ${String(error)}`);
      return NextResponse.redirect(
        new URL(`/dashboard?error=gmail_oauth_failed&reason=${error}`, request.url)
      );
    }

    if (!code) {
      logger.error(`Gmail OAuth missing code for user ${userId}`);
      return NextResponse.redirect(
        new URL('/dashboard?error=gmail_oauth_failed&reason=missing_code', request.url)
      );
    }

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token) {
      logger.error(`Gmail OAuth token exchange failed for user ${userId}`);
      return NextResponse.redirect(
        new URL('/dashboard?error=gmail_oauth_failed&reason=token_exchange_failed', request.url)
      );
    }

    // Get user profile from Gmail
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    
    // Store integration in database
    const { error: dbError } = await supabase
      .from('integrations')
      .upsert({
        user_id: userId,
        provider: 'gmail',
        provider_user_id: profile.data.emailAddress!,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        provider_data: {
          email: profile.data.emailAddress,
          name: profile.data.messagesTotal,
          picture: null
        },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,provider'
      });

    if (dbError) {
      logger.error(`Failed to store Gmail integration for user ${userId}: ${dbError.message}`);
      return NextResponse.redirect(
        new URL('/dashboard?error=gmail_oauth_failed&reason=database_error', request.url)
      );
    }

    logger.info(`Gmail OAuth completed successfully for user ${userId}, email: ${profile.data.emailAddress}`);

    // Redirect to dashboard with success
    return NextResponse.redirect(
      new URL('/dashboard?success=gmail_connected', request.url)
    );

  } catch (error) {
    logger.error(`Gmail OAuth callback error for user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.redirect(
      new URL('/dashboard?error=gmail_oauth_failed&reason=unknown_error', request.url)
    );
  }
} 