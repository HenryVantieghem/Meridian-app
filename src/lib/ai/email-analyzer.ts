import { openai } from './openai-client';
import { EmailMessage } from '../email/fetcher';

export interface EmailAnalysis {
  id: string;
  summary: string;
  priority: PriorityLevel;
  priorityScore: number;
  sentiment: SentimentType;
  sentimentScore: number;
  urgency: UrgencyLevel;
  urgencyScore: number;
  actionRequired: boolean;
  suggestedActions: string[];
  keyTopics: string[];
  vipContact: boolean;
  vipScore: number;
  confidence: number;
  processingTime: number;
  modelUsed: string;
  timestamp: Date;
}

export interface PriorityLevel {
  level: 'critical' | 'high' | 'medium' | 'low';
  score: number;
  reasoning: string;
}

export interface SentimentType {
  type: 'positive' | 'negative' | 'neutral' | 'mixed';
  score: number;
  reasoning: string;
}

export interface UrgencyLevel {
  level: 'immediate' | 'today' | 'this_week' | 'when_convenient';
  score: number;
  reasoning: string;
}

export interface AnalysisRequest {
  email: EmailMessage;
  userContext?: {
    role: string;
    industry: string;
    preferences: string[];
    vipContacts: string[];
  };
  batchId?: string;
}

export interface AnalysisResponse {
  analysis: EmailAnalysis;
  success: boolean;
  error?: string;
  retryable: boolean;
}

export class EmailAnalysisError extends Error {
  constructor(
    message: string,
    public errorCode: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'EmailAnalysisError';
  }
}

export class EmailAnalyzer {
  private rateLimiter: Map<string, number> = new Map();
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private readonly MAX_REQUESTS_PER_MINUTE = 50;

  /**
   * Analyze a single email with comprehensive AI analysis
   */
  async analyzeEmail(request: AnalysisRequest): Promise<AnalysisResponse> {
    const startTime = Date.now();
    
    try {
      // Check rate limits
      await this.checkRateLimit(request.email.id);

      // Prepare the analysis prompt
      const prompt = this.buildAnalysisPrompt(request);
      
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new EmailAnalysisError('No response from OpenAI', 'NO_RESPONSE', true);
      }

      // Parse the JSON response
      const analysisData = JSON.parse(content);
      
      // Validate and enhance the analysis
      const analysis = this.validateAndEnhanceAnalysis(analysisData, request.email);
      
      // Calculate processing time
      const processingTime = Date.now() - startTime;

      return {
        analysis: {
          ...analysis,
          processingTime,
          modelUsed: 'gpt-4o',
          timestamp: new Date()
        },
        success: true,
        retryable: true
      };

    } catch (error: any) {
      const isRetryable = this.isRetryableError(error);
      return {
        analysis: this.createFallbackAnalysis(request.email),
        success: false,
        error: error.message,
        retryable: isRetryable
      };
    }
  }

  /**
   * Analyze multiple emails in batch for efficiency
   */
  async analyzeBatch(requests: AnalysisRequest[]): Promise<AnalysisResponse[]> {
    const batchSize = 10; // Process in batches of 10
    const results: AnalysisResponse[] = [];

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(request => this.analyzeEmail(request))
      );

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          const request = batch[index];
          results.push({
            analysis: this.createFallbackAnalysis(request.email),
            success: false,
            error: result.reason?.message || 'Unknown error',
            retryable: true
          });
        }
      });

      // Add delay between batches to respect rate limits
      if (i + batchSize < requests.length) {
        await this.delay(1000);
      }
    }

    return results;
  }

  /**
   * Generate email summary with confidence scoring
   */
  async generateSummary(email: EmailMessage): Promise<{
    summary: string;
    confidence: number;
    keyPoints: string[];
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert email summarizer. Create concise, actionable summaries that capture the key points and required actions.'
          },
          {
            role: 'user',
            content: `Summarize this email in 2-3 sentences:\n\nSubject: ${email.subject}\nFrom: ${email.fromName} (${email.from})\n\n${email.bodyPlain}`
          }
        ],
        temperature: 0.2,
        max_tokens: 300
      });

      const summary = response.choices[0]?.message?.content || '';
      
      // Calculate confidence based on content length and clarity
      const confidence = this.calculateSummaryConfidence(email, summary);

      // Extract key points
      const keyPoints = await this.extractKeyPoints(email);

      return {
        summary,
        confidence,
        keyPoints
      };

    } catch (error) {
      return {
        summary: this.createBasicSummary(email),
        confidence: 0.5,
        keyPoints: []
      };
    }
  }

  /**
   * Calculate priority score based on multiple factors
   */
  calculatePriorityScore(email: EmailMessage, analysis: EmailAnalysis): number {
    let score = 0;

    // Base score from AI analysis
    score += analysis.priorityScore * 0.4;

    // Urgency factor
    score += analysis.urgencyScore * 0.3;

    // VIP contact factor
    if (analysis.vipContact) {
      score += 0.2;
    }

    // Action required factor
    if (analysis.actionRequired) {
      score += 0.1;
    }

    // Sentiment factor (negative emails might be more urgent)
    if (analysis.sentiment.type === 'negative') {
      score += 0.1;
    }

    // Time sensitivity (recent emails get higher priority)
    const hoursSinceReceived = (Date.now() - email.receivedAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceReceived < 1) score += 0.1;
    else if (hoursSinceReceived < 24) score += 0.05;

    return Math.min(score, 1.0);
  }

  /**
   * Identify VIP contacts based on email patterns
   */
  async identifyVIPContacts(emails: EmailMessage[]): Promise<Map<string, number>> {
    const contactScores = new Map<string, number>();

    for (const email of emails) {
      const sender = email.from;
      const currentScore = contactScores.get(sender) || 0;

      // Factors that indicate VIP status
      let score = currentScore;

      // Frequency of communication
      score += 0.1;

      // Email length (longer emails might indicate important discussions)
      if (email.bodyPlain.length > 500) score += 0.05;

      // Subject line indicators
      const subject = email.subject.toLowerCase();
      if (subject.includes('urgent') || subject.includes('important') || subject.includes('meeting')) {
        score += 0.1;
      }

      // Domain-based scoring (executive domains, company domains)
      const domain = sender.split('@')[1];
      if (domain && this.isExecutiveDomain(domain)) {
        score += 0.2;
      }

      contactScores.set(sender, score);
    }

    return contactScores;
  }

  /**
   * Build comprehensive analysis prompt
   */
  private buildAnalysisPrompt(request: AnalysisRequest): string {
    const { email, userContext } = request;
    
    return `Analyze this email and provide a comprehensive analysis in JSON format:

Email Details:
- Subject: ${email.subject}
- From: ${email.fromName} (${email.from})
- Received: ${email.receivedAt.toISOString()}
- Body: ${email.bodyPlain.substring(0, 2000)}

User Context:
- Role: ${userContext?.role || 'Professional'}
- Industry: ${userContext?.industry || 'General'}
- VIP Contacts: ${userContext?.vipContacts?.join(', ') || 'None'}

Please provide analysis in this exact JSON format:
{
  "summary": "2-3 sentence summary",
  "priority": {
    "level": "critical|high|medium|low",
    "score": 0.0-1.0,
    "reasoning": "explanation"
  },
  "sentiment": {
    "type": "positive|negative|neutral|mixed",
    "score": 0.0-1.0,
    "reasoning": "explanation"
  },
  "urgency": {
    "level": "immediate|today|this_week|when_convenient",
    "score": 0.0-1.0,
    "reasoning": "explanation"
  },
  "actionRequired": true/false,
  "suggestedActions": ["action1", "action2"],
  "keyTopics": ["topic1", "topic2"],
  "vipContact": true/false,
  "vipScore": 0.0-1.0,
  "confidence": 0.0-1.0
}`;
  }

  /**
   * Get system prompt for consistent analysis
   */
  private getSystemPrompt(): string {
    return `You are an expert email analysis AI that helps professionals prioritize and understand their emails. 

Your analysis should be:
- Objective and factual
- Focused on actionable insights
- Considerate of professional context
- Accurate in priority assessment
- Sensitive to urgency indicators

Always respond with valid JSON matching the exact format requested.`;
  }

  /**
   * Validate and enhance AI analysis
   */
  private validateAndEnhanceAnalysis(data: any, email: EmailMessage): EmailAnalysis {
    // Validate required fields
    const analysis: EmailAnalysis = {
      id: email.id,
      summary: data.summary || this.createBasicSummary(email),
      priority: {
        level: this.validatePriorityLevel(data.priority?.level),
        score: Math.max(0, Math.min(1, data.priority?.score || 0.5)),
        reasoning: data.priority?.reasoning || 'No reasoning provided'
      },
      priorityScore: Math.max(0, Math.min(1, data.priority?.score ?? 0.5)),
      sentiment: {
        type: this.validateSentimentType(data.sentiment?.type),
        score: Math.max(0, Math.min(1, data.sentiment?.score || 0.5)),
        reasoning: data.sentiment?.reasoning || 'No reasoning provided'
      },
      sentimentScore: Math.max(0, Math.min(1, data.sentiment?.score ?? 0.5)),
      urgency: {
        level: this.validateUrgencyLevel(data.urgency?.level),
        score: Math.max(0, Math.min(1, data.urgency?.score || 0.5)),
        reasoning: data.urgency?.reasoning || 'No reasoning provided'
      },
      urgencyScore: Math.max(0, Math.min(1, data.urgency?.score ?? 0.5)),
      actionRequired: Boolean(data.actionRequired),
      suggestedActions: Array.isArray(data.suggestedActions) ? data.suggestedActions : [],
      keyTopics: Array.isArray(data.keyTopics) ? data.keyTopics : [],
      vipContact: Boolean(data.vipContact),
      vipScore: Math.max(0, Math.min(1, data.vipScore || 0)),
      confidence: Math.max(0, Math.min(1, data.confidence || 0.7)),
      processingTime: 0,
      modelUsed: 'gpt-4o',
      timestamp: new Date()
    };

    return analysis;
  }

  /**
   * Create fallback analysis when AI fails
   */
  private createFallbackAnalysis(email: EmailMessage): EmailAnalysis {
    return {
      id: email.id,
      summary: this.createBasicSummary(email),
      priority: {
        level: 'medium',
        score: 0.5,
        reasoning: 'Fallback analysis - unable to determine priority'
      },
      priorityScore: 0.5,
      sentiment: {
        type: 'neutral',
        score: 0.5,
        reasoning: 'Fallback analysis - unable to determine sentiment'
      },
      sentimentScore: 0.5,
      urgency: {
        level: 'when_convenient',
        score: 0.5,
        reasoning: 'Fallback analysis - unable to determine urgency'
      },
      urgencyScore: 0.5,
      actionRequired: false,
      suggestedActions: [],
      keyTopics: [],
      vipContact: false,
      vipScore: 0,
      confidence: 0.3,
      processingTime: 0,
      modelUsed: 'fallback',
      timestamp: new Date()
    };
  }

  /**
   * Create basic summary when AI analysis fails
   */
  private createBasicSummary(email: EmailMessage): string {
    const words = email.bodyPlain.split(' ').slice(0, 20);
    return `Email from ${email.fromName} regarding "${email.subject}". ${words.join(' ')}...`;
  }

  /**
   * Extract key points from email
   */
  private async extractKeyPoints(email: EmailMessage): Promise<string[]> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Extract 3-5 key points from this email as a JSON array of strings.'
          },
          {
            role: 'user',
            content: `Subject: ${email.subject}\n\n${email.bodyPlain}`
          }
        ],
        temperature: 0.2,
        max_tokens: 200,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const data = JSON.parse(content);
        return Array.isArray(data.keyPoints) ? data.keyPoints : [];
      }
    } catch (error) {
      console.error('Error extracting key points:', error);
    }

    return [];
  }

  /**
   * Calculate summary confidence
   */
  private calculateSummaryConfidence(email: EmailMessage, summary: string): number {
    let confidence = 0.7; // Base confidence

    // Factor in email length
    if (email.bodyPlain.length > 1000) confidence += 0.1;
    if (email.bodyPlain.length < 100) confidence -= 0.1;

    // Factor in summary quality
    if (summary.length > 50 && summary.length < 200) confidence += 0.1;
    if (summary.includes('urgent') || summary.includes('important')) confidence += 0.05;

    // Factor in subject clarity
    if (email.subject.length > 10) confidence += 0.05;

    return Math.min(confidence, 1.0);
  }

  /**
   * Check rate limits
   */
  private async checkRateLimit(emailId: string): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.RATE_LIMIT_WINDOW;
    
    // Clean old entries
    for (const [key, timestamp] of this.rateLimiter.entries()) {
      if (timestamp < windowStart) {
        this.rateLimiter.delete(key);
      }
    }

    // Check current rate
    const currentRequests = Array.from(this.rateLimiter.values())
      .filter(timestamp => timestamp > windowStart).length;

    if (currentRequests >= this.MAX_REQUESTS_PER_MINUTE) {
      throw new EmailAnalysisError(
        'Rate limit exceeded',
        'RATE_LIMIT_EXCEEDED',
        true
      );
    }

    this.rateLimiter.set(emailId, now);
  }

  /**
   * Determine if error is retryable
   */
  private isRetryableError(error: any): boolean {
    const retryableCodes = [
      'rate_limit_exceeded',
      'quota_exceeded',
      'internal_error',
      'timeout',
      'network_error'
    ];

    return retryableCodes.includes(error.code) || 
           error.status >= 500 ||
           error.message?.includes('timeout');
  }

  /**
   * Validation helpers
   */
  private validatePriorityLevel(level: any): 'critical' | 'high' | 'medium' | 'low' {
    const validLevels = ['critical', 'high', 'medium', 'low'];
    return validLevels.includes(level) ? level : 'medium';
  }

  private validateSentimentType(type: any): 'positive' | 'negative' | 'neutral' | 'mixed' {
    const validTypes = ['positive', 'negative', 'neutral', 'mixed'];
    return validTypes.includes(type) ? type : 'neutral';
  }

  private validateUrgencyLevel(level: any): 'immediate' | 'today' | 'this_week' | 'when_convenient' {
    const validLevels = ['immediate', 'today', 'this_week', 'when_convenient'];
    return validLevels.includes(level) ? level : 'when_convenient';
  }

  /**
   * Check if domain is executive-level
   */
  private isExecutiveDomain(domain: string): boolean {
    const executiveKeywords = ['ceo', 'cfo', 'cto', 'president', 'vp', 'director', 'executive'];
    return executiveKeywords.some(keyword => domain.toLowerCase().includes(keyword));
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 