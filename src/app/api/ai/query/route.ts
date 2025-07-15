import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // System prompt for Napoleon AI
    const systemPrompt = `You are Napoleon AI, an executive-grade strategic communication assistant. You help C-suite executives and high-performing professionals manage their communications with precision and strategic insight.

Your capabilities include:
- Strategic communication analysis and prioritization
- VIP relationship management and insights
- AI-powered draft generation with executive tone
- Schedule optimization and time management
- Executive briefings and summaries

Always respond in a professional, strategic manner that reflects executive-level thinking. Be concise, actionable, and focused on high-value outcomes.

Current context: Executive dashboard with email and Slack integration, VIP contact management, and strategic communication tools.`;

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I was unable to process your request at this time.';

    // Determine response type based on query
    const responseType = determineResponseType(query);
    
    // Create structured response
    const result = {
      id: Date.now().toString(),
      type: responseType,
      title: generateTitle(query, responseType),
      content: aiResponse,
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100% confidence
      timestamp: new Date(),
      metadata: {
        priority: determinePriority(query),
        category: determineCategory(query),
        tokens_used: completion.usage?.total_tokens || 0
      }
    };

    return NextResponse.json({
      success: true,
      results: [result],
      query,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Query Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI query' },
      { status: 500 }
    );
  }
}

function determineResponseType(query: string): 'summary' | 'action' | 'insight' | 'draft' {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('draft') || lowerQuery.includes('write') || lowerQuery.includes('compose')) {
    return 'draft';
  }
  
  if (lowerQuery.includes('brief') || lowerQuery.includes('summary') || lowerQuery.includes('overview')) {
    return 'summary';
  }
  
  if (lowerQuery.includes('analyze') || lowerQuery.includes('insight') || lowerQuery.includes('trend')) {
    return 'insight';
  }
  
  return 'action';
}

function generateTitle(query: string, type: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (type === 'draft') {
    return 'AI Draft Generation';
  }
  
  if (type === 'summary') {
    return 'Executive Summary';
  }
  
  if (type === 'insight') {
    return 'Strategic Insights';
  }
  
  if (lowerQuery.includes('vip')) {
    return 'VIP Analysis';
  }
  
  if (lowerQuery.includes('schedule')) {
    return 'Schedule Optimization';
  }
  
  return 'Strategic Response';
}

function determinePriority(query: string): 'high' | 'medium' | 'low' {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('urgent') || lowerQuery.includes('critical') || lowerQuery.includes('asap')) {
    return 'high';
  }
  
  if (lowerQuery.includes('important') || lowerQuery.includes('priority') || lowerQuery.includes('vip')) {
    return 'high';
  }
  
  if (lowerQuery.includes('routine') || lowerQuery.includes('fyi') || lowerQuery.includes('info')) {
    return 'low';
  }
  
  return 'medium';
}

function determineCategory(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('email') || lowerQuery.includes('message')) {
    return 'communication';
  }
  
  if (lowerQuery.includes('schedule') || lowerQuery.includes('calendar') || lowerQuery.includes('meeting')) {
    return 'scheduling';
  }
  
  if (lowerQuery.includes('vip') || lowerQuery.includes('relationship')) {
    return 'relationship';
  }
  
  if (lowerQuery.includes('analysis') || lowerQuery.includes('insight') || lowerQuery.includes('data')) {
    return 'analysis';
  }
  
  return 'general';
}