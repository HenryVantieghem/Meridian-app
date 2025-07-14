import { openai } from './openai-client';
import { EmailMessage } from '../email/fetcher';

export type ReplyTone = 'formal' | 'friendly' | 'concise' | 'neutral' | 'custom';

export interface ReplyTemplate {
  id: string;
  label: string;
  content: string;
  tone: ReplyTone;
}

export interface ReplyGenerationOptions {
  tone?: ReplyTone;
  customToneDescription?: string;
  templates?: ReplyTemplate[];
  contextEmails?: EmailMessage[];
  userName?: string;
  maxReplies?: number;
}

export interface GeneratedReply {
  text: string;
  confidence: number;
  tone: ReplyTone;
  reasoning: string;
  templateUsed?: string;
  model: string;
  feedbackId?: string;
}

export interface ReplyGeneratorResult {
  replies: GeneratedReply[];
  success: boolean;
  error?: string;
  retryable: boolean;
}

export class ReplyGeneratorError extends Error {
  constructor(
    message: string,
    public errorCode: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ReplyGeneratorError';
  }
}

export class ReplyGenerator {
  private readonly model = 'gpt-4o';
  private readonly maxReplies = 3;
  private readonly defaultTemplates: ReplyTemplate[] = [
    {
      id: 'acknowledge',
      label: 'Acknowledge',
      content: 'Thank you for your email. I have received your message and will get back to you soon.',
      tone: 'formal',
    },
    {
      id: 'schedule',
      label: 'Schedule Meeting',
      content: 'I am available to meet at your suggested time. Please confirm the details.',
      tone: 'friendly',
    },
    {
      id: 'decline',
      label: 'Decline Politely',
      content: 'Thank you for your invitation. Unfortunately, I am unable to attend.',
      tone: 'concise',
    },
  ];

  /**
   * Generate AI-powered reply options for an email
   */
  async generateReplies(
    email: EmailMessage,
    options: ReplyGenerationOptions = {}
  ): Promise<ReplyGeneratorResult> {
    try {
      const prompt = this.buildPrompt(email, options);
      const maxReplies = options.maxReplies || this.maxReplies;
      const systemPrompt = this.getSystemPrompt(options);

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        n: maxReplies,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      });

      const replies: GeneratedReply[] = [];
      for (const choice of response.choices) {
        try {
          const content = choice.message?.content;
          if (!content) continue;
          const parsed = JSON.parse(content);
          replies.push({
            text: parsed.reply,
            confidence: this.confidenceScore(parsed.reply, email, options),
            tone: options.tone || 'neutral',
            reasoning: parsed.reasoning || '',
            templateUsed: parsed.templateUsed,
            model: this.model,
          });
        } catch (err) {
          // fallback: treat as plain text
          replies.push({
            text: choice.message?.content || '',
            confidence: 0.5,
            tone: options.tone || 'neutral',
            reasoning: 'Could not parse AI response as JSON.',
            model: this.model,
          });
        }
      }

      if (replies.length === 0) throw new ReplyGeneratorError('No replies generated', 'NO_REPLY', true);

      return { replies, success: true, retryable: true };
    } catch (error: unknown) {
      // Fallback: use template if available
      const fallback = this.getFallbackReply(email, options);
      return {
        replies: [fallback],
        success: false,
        error: error instanceof Error ? error.message : String(error),
        retryable: true,
      };
    }
  }

  /**
   * Build the prompt for reply generation
   */
  private buildPrompt(email: EmailMessage, options: ReplyGenerationOptions): string {
    let context = '';
    if (options.contextEmails && options.contextEmails.length > 0) {
      context = options.contextEmails
        .map((e) => `From: ${e.fromName} <${e.from}>\nSubject: ${e.subject}\n${e.bodyPlain}`)
        .join('\n---\n');
    }
    const tone = options.tone || 'neutral';
    const customTone = options.customToneDescription ? `\nCustom Tone: ${options.customToneDescription}` : '';
    return `You are replying to the following email:\n
${context ? 'Thread Context:\n' + context + '\n\n' : ''}From: ${email.fromName} <${email.from}>\nSubject: ${email.subject}\nBody: ${email.bodyPlain}\n\nGenerate a reply in JSON format:\n{\n  "reply": "...",\n  "reasoning": "...",\n  "templateUsed": "..."\n}\nTone: ${tone}${customTone}`;
  }

  /**
   * System prompt for OpenAI
   */
  private getSystemPrompt(options: ReplyGenerationOptions): string {
    let toneInstruction = '';
    switch (options.tone) {
      case 'formal':
        toneInstruction = 'Use a formal, professional tone.';
        break;
      case 'friendly':
        toneInstruction = 'Use a warm, friendly, approachable tone.';
        break;
      case 'concise':
        toneInstruction = 'Be concise and to the point.';
        break;
      case 'custom':
        toneInstruction = options.customToneDescription || '';
        break;
      default:
        toneInstruction = 'Use a neutral, clear, and helpful tone.';
    }
    return `You are an expert email assistant. ${toneInstruction} Always reply in JSON format as specified.`;
  }

  /**
   * Confidence scoring algorithm
   */
  private confidenceScore(reply: string, email: EmailMessage, options: ReplyGenerationOptions): number {
    let score = 0.7;
    if (reply.length > 200) score += 0.1;
    if (reply.length < 40) score -= 0.1;
    if (options.tone === 'formal' && /thank|regard|sincerely/i.test(reply)) score += 0.05;
    if (options.tone === 'friendly' && /happy|glad|pleased|thanks/i.test(reply)) score += 0.05;
    if (reply.includes(email.fromName)) score += 0.05;
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Fallback reply using templates
   */
  private getFallbackReply(email: EmailMessage, options: ReplyGenerationOptions): GeneratedReply {
    const template = (options.templates || this.defaultTemplates)[0];
    return {
      text: template.content,
      confidence: 0.4,
      tone: template.tone,
      reasoning: 'Fallback to template due to AI error.',
      templateUsed: template.id,
      model: 'template',
    };
  }

  /**
   * List available templates
   */
  getTemplates(): ReplyTemplate[] {
    return this.defaultTemplates;
  }

  /**
   * Learn from user edits (send feedback to backend or log)
   */
  async submitUserFeedback(feedbackId: string, original: string, edited: string): Promise<boolean> {
    // In production, send to backend for learning
    // Here, just log
    console.log('User feedback:', { feedbackId, original, edited });
    return true;
  }
} 