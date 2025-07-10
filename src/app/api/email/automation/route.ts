import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { emailAutomationService, AUTOMATION_TRIGGERS, AUTOMATION_SCHEDULES } from '@/lib/email/automation';
import { EMAIL_TYPES } from '@/lib/email/resend';

// Automation trigger schema
const automationTriggerSchema = z.object({
  trigger: z.string().refine((val) => Object.values(AUTOMATION_TRIGGERS).includes(val as any), {
    message: 'Invalid trigger type'
  }),
  data: z.record(z.any()).optional(),
});

// Automation schedule schema
const automationScheduleSchema = z.object({
  schedule: z.enum(Object.values(AUTOMATION_SCHEDULES) as [string, ...string[]]),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  enabled: z.boolean().default(true),
  data: z.record(z.any()).optional(),
});

// User preferences schema
const userPreferencesSchema = z.object({
  emailTypes: z.array(z.string()).optional(),
  frequency: z.enum(['immediate', 'daily', 'weekly', 'never']).optional(),
  digestEnabled: z.boolean().optional(),
  aiNotifications: z.boolean().optional(),
  billingNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  timezone: z.string().optional(),
  preferredTime: z.string().optional(),
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
      case 'trigger':
        const triggerData = automationTriggerSchema.parse(data);
        const results = await emailAutomationService.handleTrigger({
          userId,
          trigger: Object.keys(AUTOMATION_TRIGGERS).find(
            key => AUTOMATION_TRIGGERS[key as keyof typeof AUTOMATION_TRIGGERS] === triggerData.trigger
          ) as keyof typeof AUTOMATION_TRIGGERS,
          data: triggerData.data,
          timestamp: new Date(),
        });

        return NextResponse.json({
          success: true,
          results,
        });

      case 'schedule':
        const scheduleData = automationScheduleSchema.parse(data);
        // Create or update schedule
        // This would typically create a scheduled job
        console.log('Schedule automation:', scheduleData);

        return NextResponse.json({
          success: true,
          message: 'Schedule created successfully',
        });

      case 'preferences':
        const preferencesData = userPreferencesSchema.parse(data);
        await emailAutomationService.updateUserPreferences({
          userId,
          emailTypes: (preferencesData.emailTypes || []).map(type =>
            Object.keys(EMAIL_TYPES).find(
              key => EMAIL_TYPES[key as keyof typeof EMAIL_TYPES] === type
            ) as keyof typeof EMAIL_TYPES
          ),
          frequency: preferencesData.frequency || 'daily',
          digestEnabled: preferencesData.digestEnabled ?? true,
          aiNotifications: preferencesData.aiNotifications ?? true,
          billingNotifications: preferencesData.billingNotifications ?? true,
          marketingEmails: preferencesData.marketingEmails ?? false,
          timezone: preferencesData.timezone || 'UTC',
          preferredTime: preferencesData.preferredTime || '09:00',
        });

        return NextResponse.json({
          success: true,
          message: 'Preferences updated successfully',
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Email automation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process automation request' },
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
      case 'preferences':
        const preferences = await emailAutomationService.getUserPreferences(userId);
        return NextResponse.json({
          success: true,
          preferences,
        });

      case 'scheduled':
        // Get user's scheduled emails
        return NextResponse.json({
          success: true,
          scheduled: [], // Placeholder
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Email automation GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve automation data' },
      { status: 500 }
    );
  }
} 