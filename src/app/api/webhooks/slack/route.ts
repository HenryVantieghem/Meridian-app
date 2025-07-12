import { NextRequest, NextResponse } from 'next/server';
import { slackManager } from '@/lib/integrations/slack';
import { logger } from '@/lib/monitoring/logging';
import crypto from 'crypto';

// Handle Slack webhook events
export const POST = async (req: NextRequest) => {
  try {
    const signature = req.headers.get('x-slack-signature');
    const body = await req.json();

    if (!signature) {
      logger.warn('Slack webhook received without signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Verify webhook signature
    const signingSecret = process.env.SLACK_SIGNING_SECRET;
    
    const timestamp = req.headers.get('x-slack-request-timestamp');
    const bodyString = JSON.stringify(body);
    
    const signatureBase = `v0:${timestamp}:${bodyString}`;
    const expectedSignature = `v0=${crypto
      .createHmac('sha256', signingSecret!)
      .update(signatureBase)
      .digest('hex')}`;

    if (signature !== expectedSignature) {
      logger.warn('Invalid Slack webhook signature', { signature, expectedSignature });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Handle URL verification challenge
    if (body.type === 'url_verification') {
      logger.info('Slack URL verification received');
      return NextResponse.json({ challenge: body.challenge });
    }

    // Process the event
    await slackManager.handleWebhookEvent(body, signature, timestamp || '', bodyString);
    
    logger.info('Slack webhook processed successfully', { 
      type: body.event?.type,
      teamId: body.team_id 
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to process Slack webhook', error as Error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}; 