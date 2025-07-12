import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyWebhookSignature, 
  SUBSCRIPTION_STATUS,
  logStripeEvent,
  StripeError 
} from '@/lib/stripe/config';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    
    // Verify webhook signature
    const event = await verifyWebhookSignature(request, body);
    
    // Log the event
    logStripeEvent(event);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    
    if (error instanceof StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Subscription lifecycle handlers
async function handleSubscriptionCreated(subscription: any) {
  try {
    const { userId } = subscription.metadata;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Update user subscription status
    const { error } = await supabase
      .from('users')
      .update({
        subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_tier: getProductTier(subscription.items.data[0].price.product),
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user subscription:', error);
      return;
    }

    // Send welcome email for new subscriptions
    if (subscription.status === SUBSCRIPTION_STATUS.ACTIVE || subscription.status === SUBSCRIPTION_STATUS.TRIALING) {
      await sendWelcomeEmail(userId, subscription);
    }

    console.log(`Subscription created for user ${userId}: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    const { userId } = subscription.metadata;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Update user subscription status
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: subscription.status,
        subscription_tier: getProductTier(subscription.items.data[0].price.product),
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user subscription:', error);
      return;
    }

    // Handle specific status changes
    if (subscription.status === SUBSCRIPTION_STATUS.PAST_DUE) {
      await sendPaymentReminder(userId, subscription);
    } else if (subscription.status === SUBSCRIPTION_STATUS.CANCELED) {
      await sendCancellationEmail(userId, subscription);
    }

    console.log(`Subscription updated for user ${userId}: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    const { userId } = subscription.metadata;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Update user to free tier
    const { error } = await supabase
      .from('users')
      .update({
        subscription_id: null,
        subscription_status: 'canceled',
        subscription_tier: 'free',
        current_period_start: null,
        current_period_end: null,
        trial_end: null,
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user subscription:', error);
      return;
    }

    // Send cancellation email
    await sendCancellationEmail(userId, subscription);

    console.log(`Subscription deleted for user ${userId}: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

// Payment handlers
async function handlePaymentSucceeded(invoice: any) {
  try {
    const { userId } = invoice.subscription.metadata;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Update payment status
    const { error } = await supabase
      .from('users')
      .update({
        last_payment_date: new Date().toISOString(),
        payment_status: 'succeeded',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating payment status:', error);
      return;
    }

    // Send payment confirmation email
    await sendPaymentConfirmationEmail(userId, invoice);

    console.log(`Payment succeeded for user ${userId}: ${invoice.id}`);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice: any) {
  try {
    const { userId } = invoice.subscription.metadata;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Update payment status
    const { error } = await supabase
      .from('users')
      .update({
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating payment status:', error);
      return;
    }

    // Send payment failure email
    await sendPaymentFailureEmail(userId, invoice);

    console.log(`Payment failed for user ${userId}: ${invoice.id}`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

// Trial handlers
async function handleTrialWillEnd(subscription: any) {
  try {
    const { userId } = subscription.metadata;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Send trial ending reminder
    await sendTrialEndingEmail(userId, subscription);

    console.log(`Trial will end for user ${userId}: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling trial will end:', error);
  }
}

async function handleTrialEnded(subscription: any) {
  try {
    const { userId } = subscription.metadata;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Send trial ended notification
    await sendTrialEndedEmail(userId, subscription);

    console.log(`Trial ended for user ${userId}: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling trial ended:', error);
  }
}

// Utility functions
function getProductTier(productId: string): string {
  if (productId.includes('pro')) return 'pro';
  if (productId.includes('enterprise')) return 'enterprise';
  return 'free';
}

// Email notification functions (disabled - Resend removed)
async function sendWelcomeEmail(userId: string, subscription: any) {
  // Email sending disabled - Resend removed
  console.log(`Welcome email disabled - Resend removed for user ${userId}`);
}

async function sendPaymentReminder(userId: string, subscription: any) {
  // Email sending disabled - Resend removed
  console.log(`Payment reminder disabled - Resend removed for user ${userId}`);
}

async function sendCancellationEmail(userId: string, subscription: any) {
  // Email sending disabled - Resend removed
  console.log(`Cancellation email disabled - Resend removed for user ${userId}`);
}

async function sendPaymentConfirmationEmail(userId: string, invoice: any) {
  // Email sending disabled - Resend removed
  console.log(`Payment confirmation disabled - Resend removed for user ${userId}`);
}

async function sendPaymentFailureEmail(userId: string, invoice: any) {
  // Email sending disabled - Resend removed
  console.log(`Payment failure notification disabled - Resend removed for user ${userId}`);
}

async function sendTrialEndingEmail(userId: string, subscription: any) {
  // Email sending disabled - Resend removed
  console.log(`Trial ending reminder disabled - Resend removed for user ${userId}`);
}

async function sendTrialEndedEmail(userId: string, subscription: any) {
  // Email sending disabled - Resend removed
  console.log(`Trial ended notification disabled - Resend removed for user ${userId}`);
}

// GET endpoint for webhook verification (Stripe CLI)
export async function GET() {
  return NextResponse.json({ 
    message: 'Stripe webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
} 