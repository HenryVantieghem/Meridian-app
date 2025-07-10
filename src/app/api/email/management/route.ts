import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { emailManagementService, EMAIL_LISTS, UNSUBSCRIBE_REASONS, BOUNCE_TYPES } from '@/lib/email/management';

// Email list schema
const emailListSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(Object.values(EMAIL_LISTS) as [string, ...string[]]),
  subscribers: z.array(z.string().email()).optional(),
});

// Unsubscribe schema
const unsubscribeSchema = z.object({
  email: z.string().email(),
  listId: z.string().optional(),
  reason: z.enum(Object.values(UNSUBSCRIBE_REASONS) as [string, ...string[]]).optional(),
  feedback: z.string().optional(),
});

// Bounce schema
const bounceSchema = z.object({
  email: z.string().email(),
  type: z.enum(Object.values(BOUNCE_TYPES) as [string, ...string[]]),
  reason: z.string(),
  messageId: z.string().optional(),
});

// A/B test schema
const abTestSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  variants: z.array(z.object({
    subject: z.string(),
    html: z.string(),
    weight: z.number().min(0).max(1),
  })),
  audience: z.array(z.string()),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  enabled: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create_list':
        const listData = emailListSchema.parse(data);
        const newList = await emailManagementService.createEmailList({
          ...listData,
          type: Object.keys(EMAIL_LISTS).find(
            key => EMAIL_LISTS[key as keyof typeof EMAIL_LISTS] === listData.type
          ) as keyof typeof EMAIL_LISTS,
          subscribers: listData.subscribers || [],
        });

        return NextResponse.json({
          success: true,
          list: newList,
        });

      case 'add_subscriber':
        const { email, listId } = data;
        if (!email || !listId) {
          return NextResponse.json(
            { error: 'Email and listId are required' },
            { status: 400 }
          );
        }

        await emailManagementService.addSubscriberToList(email, listId);
        return NextResponse.json({
          success: true,
          message: 'Subscriber added successfully',
        });

      case 'remove_subscriber':
        const { email: removeEmail, listId: removeListId } = data;
        if (!removeEmail || !removeListId) {
          return NextResponse.json(
            { error: 'Email and listId are required' },
            { status: 400 }
          );
        }

        await emailManagementService.removeSubscriberFromList(removeEmail, removeListId);
        return NextResponse.json({
          success: true,
          message: 'Subscriber removed successfully',
        });

      case 'unsubscribe':
        const unsubscribeData = unsubscribeSchema.parse(data);
        await emailManagementService.unsubscribeEmail(
          unsubscribeData.email,
          unsubscribeData.listId,
          unsubscribeData.reason ? (Object.keys(UNSUBSCRIBE_REASONS).find(
            key => UNSUBSCRIBE_REASONS[key as keyof typeof UNSUBSCRIBE_REASONS] === unsubscribeData.reason
          ) as keyof typeof UNSUBSCRIBE_REASONS) : undefined,
          unsubscribeData.feedback
        );

        return NextResponse.json({
          success: true,
          message: 'Unsubscribed successfully',
        });

      case 'handle_bounce':
        const bounceData = bounceSchema.parse(data);
        await emailManagementService.handleBounce(
          bounceData.email,
          Object.keys(BOUNCE_TYPES).find(
            key => BOUNCE_TYPES[key as keyof typeof BOUNCE_TYPES] === bounceData.type
          ) as keyof typeof BOUNCE_TYPES,
          bounceData.reason,
          bounceData.messageId
        );

        return NextResponse.json({
          success: true,
          message: 'Bounce handled successfully',
        });

      case 'create_ab_test':
        const abTestData = abTestSchema.parse(data);
        const newTest = await emailManagementService.createABTest({
          ...abTestData,
          startDate: new Date(abTestData.startDate),
          endDate: abTestData.endDate ? new Date(abTestData.endDate) : undefined,
          variants: abTestData.variants.map((variant, idx) => ({
            id: `variant_${idx}_${Date.now()}`,
            subject: variant.subject,
            html: variant.html,
            weight: variant.weight,
          })),
        });

        return NextResponse.json({
          success: true,
          test: newTest,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Email management error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process management request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const listId = searchParams.get('listId');
    const campaignId = searchParams.get('campaignId');
    const testId = searchParams.get('testId');

    switch (action) {
      case 'list_subscribers':
        if (!listId) {
          return NextResponse.json(
            { error: 'List ID is required' },
            { status: 400 }
          );
        }

        const subscribers = await emailManagementService.getListSubscribers(listId);
        return NextResponse.json({
          success: true,
          subscribers,
        });

      case 'unsubscribe_stats':
        const unsubscribeStats = await emailManagementService.getUnsubscribeStats(
          listId || undefined,
          undefined // dateRange
        );

        return NextResponse.json({
          success: true,
          stats: unsubscribeStats,
        });

      case 'bounce_stats':
        const bounceStats = await emailManagementService.getBounceStats();
        return NextResponse.json({
          success: true,
          stats: bounceStats,
        });

      case 'ab_test_variant':
        if (!testId) {
          return NextResponse.json(
            { error: 'Test ID is required' },
            { status: 400 }
          );
        }

        const email = searchParams.get('email');
        if (!email) {
          return NextResponse.json(
            { error: 'Email is required' },
            { status: 400 }
          );
        }

        const variant = await emailManagementService.getABTestVariant(testId, email);
        return NextResponse.json({
          success: true,
          variant,
        });

      case 'ab_test_results':
        if (!testId) {
          return NextResponse.json(
            { error: 'Test ID is required' },
            { status: 400 }
          );
        }

        const results = await emailManagementService.getABTestResults(testId);
        return NextResponse.json({
          success: true,
          results,
        });

      case 'email_analytics':
        if (!campaignId) {
          return NextResponse.json(
            { error: 'Campaign ID is required' },
            { status: 400 }
          );
        }

        const analytics = await emailManagementService.getEmailAnalytics(campaignId);
        return NextResponse.json({
          success: true,
          analytics,
        });

      case 'campaign_performance':
        const campaignIds = searchParams.get('campaignIds')?.split(',') || [];
        if (campaignIds.length === 0) {
          return NextResponse.json(
            { error: 'Campaign IDs are required' },
            { status: 400 }
          );
        }

        const performance = await emailManagementService.getCampaignPerformance(campaignIds);
        return NextResponse.json({
          success: true,
          performance,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Email management GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve management data' },
      { status: 500 }
    );
  }
} 