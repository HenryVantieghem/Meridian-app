import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { aiAnalysisService } from '@/lib/ai/analysis-service';
import { sendUpdateToUser } from '@/lib/realtime/websocket-server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, contentType, context } = body;

    if (!content || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: content, contentType' },
        { status: 400 }
      );
    }

    if (!['email', 'slack'].includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid contentType. Must be "email" or "slack"' },
        { status: 400 }
      );
    }

    // Perform AI analysis
    const analysis = await aiAnalysisService.analyzeContent({
      content,
      contentType,
      context
    });

    // Send real-time update
    try {
      sendUpdateToUser(userId, {
        type: 'ai_analysis',
        action: 'created',
        data: {
          analysisId: analysis.id,
          contentType,
          summary: analysis.summary,
          priority: analysis.priority,
          confidence: analysis.confidence
        },
        userId
      });
    } catch (error) {
      console.error('Failed to send real-time update:', error);
      // Don't fail the request if real-time update fails
    }

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('AI Analysis API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('id');

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Missing analysis ID' },
        { status: 400 }
      );
    }

    // TODO: Implement analysis retrieval from database
    // For now, return a placeholder
    return NextResponse.json({
      success: true,
      analysis: {
        id: analysisId,
        status: 'not_found',
        message: 'Analysis retrieval not yet implemented'
      }
    });

  } catch (error) {
    console.error('AI Analysis GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analysis' },
      { status: 500 }
    );
  }
} 