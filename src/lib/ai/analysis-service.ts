import { openai } from './openai-client';
import { Email, SlackMessage } from '@/types';

export interface AIAnalysis {
  id: string;
  contentId: string;
  contentType: 'email' | 'slack';
  sentiment: 'positive' | 'negative' | 'neutral';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number;
  summary: string;
  keyPoints: string[];
  suggestedActions: string[];
  replySuggestion?: string;
  tone: 'formal' | 'casual' | 'friendly' | 'professional';
  urgency: 'low' | 'medium' | 'high';
  estimatedResponseTime: number; // in minutes
  tags: string[];
  createdAt: Date;
}

export interface AnalysisRequest {
  content: string;
  contentType: 'email' | 'slack';
  context?: {
    userRole?: string;
    industry?: string;
    recentEmails?: string[];
    senderInfo?: {
      name: string;
      email?: string;
      company?: string;
    };
  };
}

export class AIAnalysisService {
  private static instance: AIAnalysisService;

  private constructor() {}

  public static getInstance(): AIAnalysisService {
    if (!AIAnalysisService.instance) {
      AIAnalysisService.instance = new AIAnalysisService();
    }
    return AIAnalysisService.instance;
  }

  async analyzeContent(request: AnalysisRequest): Promise<AIAnalysis> {
    try {
      const { content, contentType, context } = request;

      const systemPrompt = this.buildSystemPrompt(contentType, context);
      const userPrompt = this.buildUserPrompt(content, contentType);

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const analysisText = response.choices[0]?.message?.content;
      if (!analysisText) {
        throw new Error('No analysis response from AI');
      }

      return this.parseAnalysisResponse(analysisText, content, contentType);
    } catch (error) {
      console.error('AI Analysis error:', error);
      throw new Error(`Failed to analyze content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateReply(
    originalContent: string,
    context: string,
    tone: 'formal' | 'casual' | 'professional' = 'professional',
    length: 'short' | 'medium' | 'long' = 'medium'
  ): Promise<string> {
    try {
      const systemPrompt = `You are an AI assistant helping to generate professional email replies. 
      Generate a ${tone} reply that is ${length} in length. 
      The reply should be helpful, clear, and appropriate for the context.`;

      const userPrompt = `Original message: "${originalContent}"
      
      Context: "${context}"
      
      Please generate a ${tone} reply that is ${length} in length.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || 'Unable to generate reply';
    } catch (error) {
      console.error('Reply generation error:', error);
      throw new Error(`Failed to generate reply: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildSystemPrompt(contentType: 'email' | 'slack', context?: { userRole?: string; industry?: string }): string {
    const role = context?.userRole || 'professional';
    const industry = context?.industry || 'general';

    return `You are an AI assistant specialized in analyzing ${contentType} messages for busy professionals.
    
    User Context:
    - Role: ${role}
    - Industry: ${industry}
    
    Your task is to analyze the content and provide:
    1. Sentiment analysis (positive/negative/neutral)
    2. Priority assessment (low/medium/high/urgent)
    3. Confidence score (0-100)
    4. Concise summary (2-3 sentences)
    5. Key points (3-5 bullet points)
    6. Suggested actions (2-4 actionable items)
    7. Tone analysis (formal/casual/friendly/professional)
    8. Urgency level (low/medium/high)
    9. Estimated response time in minutes
    10. Relevant tags (comma-separated)
    
    Respond in JSON format with these exact keys:
    {
      "sentiment": "positive|negative|neutral",
      "priority": "low|medium|high|urgent",
      "confidence": 85,
      "summary": "Brief summary here",
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "suggestedActions": ["Action 1", "Action 2"],
      "tone": "formal|casual|friendly|professional",
      "urgency": "low|medium|high",
      "estimatedResponseTime": 30,
      "tags": "tag1, tag2, tag3"
    }`;
  }

  private buildUserPrompt(content: string, contentType: 'email' | 'slack'): string {
    return `Please analyze this ${contentType} message:

"${content}"

Provide a comprehensive analysis in the specified JSON format.`;
  }

  private parseAnalysisResponse(responseText: string, content: string, contentType: 'email' | 'slack'): AIAnalysis {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      return {
        id: Math.random().toString(36).substr(2, 9),
        contentId: content.substring(0, 50), // Use content hash in production
        contentType,
        sentiment: analysis.sentiment || 'neutral',
        priority: analysis.priority || 'medium',
        confidence: analysis.confidence || 50,
        summary: analysis.summary || 'No summary available',
        keyPoints: analysis.keyPoints || [],
        suggestedActions: analysis.suggestedActions || [],
        tone: analysis.tone || 'professional',
        urgency: analysis.urgency || 'medium',
        estimatedResponseTime: analysis.estimatedResponseTime || 30,
        tags: analysis.tags ? analysis.tags.split(',').map((tag: string) => tag.trim()) : [],
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      
      // Return fallback analysis
      return {
        id: Math.random().toString(36).substr(2, 9),
        contentId: content.substring(0, 50),
        contentType,
        sentiment: 'neutral',
        priority: 'medium',
        confidence: 50,
        summary: 'Analysis failed - please review manually',
        keyPoints: ['Content requires manual review'],
        suggestedActions: ['Review the content manually'],
        tone: 'professional',
        urgency: 'medium',
        estimatedResponseTime: 30,
        tags: ['needs-review'],
        createdAt: new Date(),
      };
    }
  }

  async analyzeEmail(email: Email, context?: { senderInfo?: { name: string; email?: string } }): Promise<AIAnalysis> {
    const content = `${email.subject}\n\n${email.body}`;
    
    return this.analyzeContent({
      content,
      contentType: 'email',
      context: {
        ...context,
        senderInfo: {
          name: email.from.name || 'Unknown',
          email: email.from.email,
        }
      }
    });
  }

  async analyzeSlackMessage(message: SlackMessage, context?: { senderInfo?: { name: string } }): Promise<AIAnalysis> {
    return this.analyzeContent({
      content: message.content,
      contentType: 'slack',
      context: {
        ...context,
        senderInfo: {
          name: message.sender.name,
        }
      }
    });
  }

  async batchAnalyze(items: (Email | SlackMessage)[], context?: { senderInfo?: { name: string } }): Promise<AIAnalysis[]> {
    const analyses: AIAnalysis[] = [];
    
    for (const item of items) {
      try {
        if ('from' in item) {
          // Email
          const analysis = await this.analyzeEmail(item, context);
          analyses.push(analysis);
        } else {
          // Slack message
          const analysis = await this.analyzeSlackMessage(item, context);
          analyses.push(analysis);
        }
      } catch (error) {
        console.error('Failed to analyze item:', error);
        // Continue with next item
      }
    }
    
    return analyses;
  }
}

export const aiAnalysisService = AIAnalysisService.getInstance(); 