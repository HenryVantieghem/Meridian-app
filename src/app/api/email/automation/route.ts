import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Email automation request schema
const automationSchema = z.object({
  trigger: z.string(),
  userId: z.string(),
  data: z.record(z.any()).optional(),
  timestamp: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = automationSchema.parse(body);

    // Process automation trigger (stub function since Resend is removed)
    console.log('Email automation disabled - Resend removed:', validatedData);

    return NextResponse.json({
      success: true,
      message: 'Email automation processed (Resend removed)',
      timestamp: new Date().toISOString(),
      automationId: `automation_${Date.now()}`,
    });

  } catch (error) {
    console.error('Email automation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process automation',
        message: 'Email automation is disabled - Resend removed',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get automation status (stub function since Resend is removed)
    console.log('Getting automation status disabled - Resend removed');

    return NextResponse.json({
      success: true,
      message: 'Email automation status (Resend removed)',
      timestamp: new Date().toISOString(),
      automations: [],
      active: false,
    });

  } catch (error) {
    console.error('Email automation status error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get automation status',
        message: 'Email automation is disabled - Resend removed',
      },
      { status: 500 }
    );
  }
} 