import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { sendEmail, EMAIL_TYPES, EMAIL_PRIORITY } from '@/lib/email/resend';
import { emailAutomationService } from '@/lib/email/automation';
import { emailManagementService } from '@/lib/email/management';

// Email send request schema
const emailSendSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1).max(100),
  html: z.string().min(1),
  text: z.string().optional(),
  emailType: z.enum(Object.values(EMAIL_TYPES) as [string, ...string[]]).optional(),
  priority: z.enum([EMAIL_PRIORITY.HIGH, EMAIL_PRIORITY.NORMAL, EMAIL_PRIORITY.LOW]).optional(),
  metadata: z.record(z.string()).optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.any(),
    contentType: z.string().optional(),
  })).optional(),
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

    // Parse request body
    const body = await request.json();
    const validatedData = emailSendSchema.parse(body);

    // Send email
    const tracking = await sendEmail(
      validatedData.to,
      validatedData.subject,
      validatedData.html,
      {
        priority: validatedData.priority || EMAIL_PRIORITY.NORMAL,
        metadata: {
          ...validatedData.metadata,
          type: validatedData.emailType || EMAIL_TYPES.AI_NOTIFICATION,
          userId,
        },
      }
    );

    return NextResponse.json({
      success: true,
      tracking,
    });

  } catch (error) {
    console.error('Email send error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 