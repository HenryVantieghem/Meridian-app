import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/monitoring/logging';
import { cookies } from 'next/headers';

// Initialize Supabase client with service role key validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing required Supabase configuration: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

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
      logger.error(`Slack OAuth error for user ${userId}: ${String(error)}`);
      return NextResponse.redirect(
        new URL(`/dashboard?error=slack_oauth_failed&reason=${error}`, request.url)
      );
    }

    if (!code) {
      logger.error(`Slack OAuth missing code for user ${userId}`);
      return NextResponse.redirect(
        new URL('/dashboard?error=slack_oauth_failed&reason=missing_code', request.url)
      );
    }

    // Validate OAuth state
    const cookieStore = await cookies();
    const cookieState = cookieStore.get("oauth_state")?.value;
    if (state !== cookieState) {
      logger.error(`Slack OAuth invalid state for user ${userId}, state: ${state}, cookie: ${cookieState}`);
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.SLACK_REDIRECT_URI!,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      logger.error(`Slack OAuth token exchange failed for user ${userId}: ${tokenData.error}`);
      return NextResponse.redirect(
        new URL('/dashboard?error=slack_oauth_failed&reason=token_exchange_failed', request.url)
      );
    }

    // Get workspace information
    const workspaceInfo = tokenData.team || tokenData.enterprise;
    const workspaceId = workspaceInfo?.id || tokenData.team_id;
    const workspaceName = workspaceInfo?.name || 'Unknown Workspace';

    // Store integration in database
    const { error: dbError } = await supabase
      .from('integrations')
      .upsert({
        user_id: userId,
        provider: 'slack',
        provider_user_id: tokenData.authed_user?.id || workspaceId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: tokenData.expires_in ? 
          new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
        provider_data: {
          workspace_id: workspaceId,
          workspace_name: workspaceName,
          user_id: tokenData.authed_user?.id,
          user_name: tokenData.authed_user?.name,
          scope: tokenData.scope,
          bot_user_id: tokenData.bot_user_id,
          bot_access_token: tokenData.bot_user_id ? tokenData.access_token : null,
        },
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,provider'
      });

    if (dbError) {
      logger.error(`Failed to store Slack integration for user ${userId}: ${dbError.message}`);
      return NextResponse.redirect(
        new URL('/dashboard?error=slack_oauth_failed&reason=database_error', request.url)
      );
    }

    logger.info(`Slack OAuth completed successfully for user ${userId}, workspace: ${workspaceId}`);

    // Redirect to dashboard with success
    return NextResponse.redirect(
      new URL('/dashboard?success=slack_connected', request.url)
    );

  } catch (error) {
    logger.error(`Slack OAuth callback error for user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.redirect(
      new URL('/dashboard?error=slack_oauth_failed&reason=unknown_error', request.url)
    );
  }
} 