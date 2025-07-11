import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { emailManagementService } from '@/lib/email/management';
import { handleBounce } from '@/lib/email/management';

// Email list schema
const emailListSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  subscribers: z.array(z.string().email()).optional(),
});

// Unsubscribe schema
const unsubscribeSchema = z.object({
  email: z.string().email(),
  listId: z.string().optional(),
  reason: z.string().optional(),
  feedback: z.string().optional(),
});

// Bounce schema
const bounceSchema = z.object({
  email: z.string().email(),
  type: z.enum(['hard', 'soft', 'blocked']),
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
        const newList = await emailManagementService.createEmailList(
          listData.name,
          listData.description
        );

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

        await emailManagementService.addSubscriberToList(listId, email);
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

        await emailManagementService.removeSubscriberFromList(removeListId, removeEmail);
        return NextResponse.json({
          success: true,
          message: 'Subscriber removed successfully',
        });

      case 'unsubscribe':
        const unsubscribeData = unsubscribeSchema.parse(data);
        await emailManagementService.handleUnsubscribe(
          unsubscribeData.email,
          unsubscribeData.reason
        );

        return NextResponse.json({
          success: true,
          message: 'Unsubscribed successfully',
        });

      case 'handle_bounce':
        const bounceData = bounceSchema.parse(data);
        await handleBounce(
          bounceData.email,
          bounceData.reason,
          bounceData.type as 'hard' | 'soft'
        );

        return NextResponse.json({
          success: true,
          message: 'Bounce handled successfully',
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

    switch (action) {
      case 'lists':
        const lists = await emailManagementService.getEmailLists();
        return NextResponse.json({
          success: true,
          lists,
        });

      case 'unsubscribe_reasons':
        const reasons = await emailManagementService.getUnsubscribeReasons();
        return NextResponse.json({
          success: true,
          reasons,
        });

      case 'bounce_records':
        const bounces = await emailManagementService.getBounceRecords();
        return NextResponse.json({
          success: true,
          bounces,
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