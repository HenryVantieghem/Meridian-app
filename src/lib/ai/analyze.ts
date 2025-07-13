import OpenAI from 'openai';
import { requireEnvVar } from '@/lib/invariantEnv';

const openai = new OpenAI({
  apiKey: requireEnvVar('OPENAI_API_KEY'),
  organization: requireEnvVar('OPENAI_ORGANIZATION_ID'),
});

export interface EmailAnalysis {
  id: string;
  subject: string;
  sender: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
  actionItems: ActionItem[];
  suggestedReply?: string;
  confidence: number;
}

export interface ActionItem {
  id: string;
  type: 'reply' | 'schedule' | 'delegate' | 'follow-up' | 'urgent';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  assignee?: string;
  emailId: string;
}

export interface MessageAnalysis {
  id: string;
  platform: 'slack' | 'email' | 'teams';
  sender: string;
  content: string;
  channel?: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
  actionItems: ActionItem[];
  suggestedReply?: string;
  confidence: number;
}

export async function analyzeEmail(email: {
  id: string;
  subject: string;
  sender: string;
  content: string;
  date: string;
}): Promise<EmailAnalysis> {
  try {
    const prompt = `
Analyze this email and provide a comprehensive analysis:

Subject: ${email.subject}
Sender: ${email.sender}
Date: ${email.date}
Content: ${email.content}

Please provide:
1. Priority (high/medium/low) based on sender importance, urgency, and content
2. Category (meeting, request, update, urgent, etc.)
3. Sentiment (positive/negative/neutral)
4. Brief summary (2-3 sentences)
5. Action items that need to be taken
6. Suggested reply if a response is needed
7. Confidence score (0-1)

Format as JSON:
{
  "priority": "high|medium|low",
  "category": "string",
  "sentiment": "positive|negative|neutral",
  "summary": "string",
  "actionItems": [
    {
      "type": "reply|schedule|delegate|follow-up|urgent",
      "title": "string",
      "description": "string",
      "priority": "high|medium|low",
      "dueDate": "YYYY-MM-DD" (optional),
      "assignee": "string" (optional)
    }
  ],
  "suggestedReply": "string" (optional),
  "confidence": 0.95
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are Napoleon AI, an intelligent email assistant. Analyze emails with precision and extract actionable insights. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const analysis = JSON.parse(response.choices[0]?.message?.content || '{}');

    return {
      id: email.id,
      subject: email.subject,
      sender: email.sender,
      content: email.content,
      priority: analysis.priority || 'medium',
      category: analysis.category || 'general',
      sentiment: analysis.sentiment || 'neutral',
      summary: analysis.summary || '',
      actionItems: (analysis.actionItems || []).map((item: any, index: number) => ({
        id: `${email.id}-action-${index}`,
        type: item.type || 'follow-up',
        title: item.title || '',
        description: item.description || '',
        priority: item.priority || 'medium',
        dueDate: item.dueDate,
        assignee: item.assignee,
        emailId: email.id,
      })),
      suggestedReply: analysis.suggestedReply,
      confidence: analysis.confidence || 0.8,
    };
  } catch (error) {
    console.error('Email analysis error:', error);
    
    // Fallback analysis
    return {
      id: email.id,
      subject: email.subject,
      sender: email.sender,
      content: email.content,
      priority: 'medium',
      category: 'general',
      sentiment: 'neutral',
      summary: 'Unable to analyze email content.',
      actionItems: [],
      confidence: 0.5,
    };
  }
}

export async function analyzeMessage(message: {
  id: string;
  platform: 'slack' | 'email' | 'teams';
  sender: string;
  content: string;
  channel?: string;
  date: string;
}): Promise<MessageAnalysis> {
  try {
    const prompt = `
Analyze this ${message.platform} message and provide a comprehensive analysis:

Platform: ${message.platform}
Sender: ${message.sender}
Channel: ${message.channel || 'N/A'}
Date: ${message.date}
Content: ${message.content}

Please provide:
1. Priority (high/medium/low) based on sender importance, urgency, and content
2. Category (meeting, request, update, urgent, etc.)
3. Sentiment (positive/negative/neutral)
4. Brief summary (2-3 sentences)
5. Action items that need to be taken
6. Suggested reply if a response is needed
7. Confidence score (0-1)

Format as JSON:
{
  "priority": "high|medium|low",
  "category": "string",
  "sentiment": "positive|negative|neutral",
  "summary": "string",
  "actionItems": [
    {
      "type": "reply|schedule|delegate|follow-up|urgent",
      "title": "string",
      "description": "string",
      "priority": "high|medium|low",
      "dueDate": "YYYY-MM-DD" (optional),
      "assignee": "string" (optional)
    }
  ],
  "suggestedReply": "string" (optional),
  "confidence": 0.95
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are Napoleon AI, an intelligent ${message.platform} assistant. Analyze messages with precision and extract actionable insights. Always respond with valid JSON.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const analysis = JSON.parse(response.choices[0]?.message?.content || '{}');

    return {
      id: message.id,
      platform: message.platform,
      sender: message.sender,
      content: message.content,
      channel: message.channel,
      priority: analysis.priority || 'medium',
      category: analysis.category || 'general',
      sentiment: analysis.sentiment || 'neutral',
      summary: analysis.summary || '',
      actionItems: (analysis.actionItems || []).map((item: any, index: number) => ({
        id: `${message.id}-action-${index}`,
        type: item.type || 'follow-up',
        title: item.title || '',
        description: item.description || '',
        priority: item.priority || 'medium',
        dueDate: item.dueDate,
        assignee: item.assignee,
        emailId: message.id,
      })),
      suggestedReply: analysis.suggestedReply,
      confidence: analysis.confidence || 0.8,
    };
  } catch (error) {
    console.error('Message analysis error:', error);
    
    // Fallback analysis
    return {
      id: message.id,
      platform: message.platform,
      sender: message.sender,
      content: message.content,
      channel: message.channel,
      priority: 'medium',
      category: 'general',
      sentiment: 'neutral',
      summary: 'Unable to analyze message content.',
      actionItems: [],
      confidence: 0.5,
    };
  }
}

export async function extractActions(analyses: (EmailAnalysis | MessageAnalysis)[]): Promise<ActionItem[]> {
  try {
    const allActions = analyses.flatMap(analysis => analysis.actionItems);
    
    // Group actions by type and priority
    const groupedActions = allActions.reduce((acc, action) => {
      const key = `${action.type}-${action.priority}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(action);
      return acc;
    }, {} as Record<string, ActionItem[]>);

    // Sort by priority and return top actions
    const sortedActions = Object.values(groupedActions)
      .flat()
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 10); // Return top 10 actions

    return sortedActions;
  } catch (error) {
    console.error('Error extracting actions:', error);
    return [];
  }
}

export async function batchAnalyzeEmails(emails: Array<{
  id: string;
  subject: string;
  sender: string;
  content: string;
  date: string;
}>): Promise<EmailAnalysis[]> {
  const analyses: EmailAnalysis[] = [];
  
  // Process emails in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const batchAnalyses = await Promise.all(
      batch.map(email => analyzeEmail(email))
    );
    analyses.push(...batchAnalyses);
  }
  
  return analyses;
}

export async function batchAnalyzeMessages(messages: Array<{
  id: string;
  platform: 'slack' | 'email' | 'teams';
  sender: string;
  content: string;
  channel?: string;
  date: string;
}>): Promise<MessageAnalysis[]> {
  const analyses: MessageAnalysis[] = [];
  
  // Process messages in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    const batchAnalyses = await Promise.all(
      batch.map(message => analyzeMessage(message))
    );
    analyses.push(...batchAnalyses);
  }
  
  return analyses;
} 