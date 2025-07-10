import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { EmailProcessor } from '@/lib/email/processor';
import { EmailFetcher, EmailProvider, FetchOptions } from '@/lib/email/fetcher';
import { EmailAnalyzer, AnalysisRequest } from '@/lib/ai/email-analyzer';
import { z } from 'zod';

// Validation schemas
const analyzeEmailSchema = z.object({
  emailId: z.string().optional(),
  email: z.object({
    id: z.string(),
    threadId: z.string(),
    from: z.string().email(),
    fromName: z.string(),
    to: z.array(z.string().email()),
    cc: z.array(z.string().email()),
    bcc: z.array(z.string().email()),
    subject: z.string(),
    body: z.string(),
    bodyPlain: z.string(),
    bodyHtml: z.string(),
    receivedAt: z.string().datetime(),
    sentAt: z.string().datetime(),
    labels: z.array(z.string()),
    isRead: z.boolean(),
    isStarred: z.boolean(),
    hasAttachments: z.boolean(),
    attachmentCount: z.number(),
    size: z.number(),
    provider: z.enum(['gmail', 'outlook']),
    rawData: z.any()
  }).optional(),
  userContext: z.object({
    role: z.string().optional(),
    industry: z.string().optional(),
    preferences: z.array(z.string()).optional(),
    vipContacts: z.array(z.string()).optional()
  }).optional()
});

const batchAnalyzeSchema = z.object({
  emails: z.array(z.object({
    id: z.string(),
    threadId: z.string(),
    from: z.string().email(),
    fromName: z.string(),
    to: z.array(z.string().email()),
    cc: z.array(z.string().email()),
    bcc: z.array(z.string().email()),
    subject: z.string(),
    body: z.string(),
    bodyPlain: z.string(),
    bodyHtml: z.string(),
    receivedAt: z.string().datetime(),
    sentAt: z.string().datetime(),
    labels: z.array(z.string()),
    isRead: z.boolean(),
    isStarred: z.boolean(),
    hasAttachments: z.boolean(),
    attachmentCount: z.number(),
    size: z.number(),
    provider: z.enum(['gmail', 'outlook']),
    rawData: z.any()
  })),
  userContext: z.object({
    role: z.string().optional(),
    industry: z.string().optional(),
    preferences: z.array(z.string()).optional(),
    vipContacts: z.array(z.string()).optional()
  }).optional()
});

const processEmailsSchema = z.object({
  providers: z.array(z.object({
    name: z.enum(['gmail', 'outlook']),
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().datetime(),
    userId: z.string()
  })),
  options: z.object({
    maxResults: z.number().optional(),
    query: z.string().optional(),
    labelIds: z.array(z.string()).optional(),
    includeSpamTrash: z.boolean().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  }).optional(),
  processingOptions: z.object({
    batchSize: z.number().optional(),
    maxRetries: z.number().optional(),
    retryDelay: z.number().optional(),
    timeout: z.number().optional(),
    enableRealTime: z.boolean().optional(),
    priorityThreshold: z.number().optional()
  }).optional()
});

const getJobStatusSchema = z.object({
  jobId: z.string()
});

const cancelJobSchema = z.object({
  jobId: z.string()
});

const getStatsSchema = z.object({
  userId: z.string().optional()
});

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 100;

/**
 * POST /api/emails/analyze - Analyze a single email
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting
    const rateLimitKey = `analyze_${userId}`;
    if (!await checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = analyzeEmailSchema.parse(body);

    const processor = new EmailProcessor();
    const analyzer = new EmailAnalyzer();

    // If emailId is provided, fetch from database
    if (validatedData.emailId) {
      // This would fetch the email from your database
      // For now, we'll return an error
      return NextResponse.json(
        { error: 'Email fetching by ID not implemented yet' },
        { status: 501 }
      );
    }

    // If email data is provided, analyze it directly
    if (validatedData.email) {
      const email = {
        ...validatedData.email,
        receivedAt: new Date(validatedData.email.receivedAt),
        sentAt: new Date(validatedData.email.sentAt),
        rawData: validatedData.email.rawData ?? {},
      };

      const userContext = {
        role: validatedData.userContext?.role ?? 'Professional',
        industry: validatedData.userContext?.industry ?? 'General',
        preferences: validatedData.userContext?.preferences ?? [],
        vipContacts: validatedData.userContext?.vipContacts ?? [],
      };

      const analysisRequest: AnalysisRequest = {
        email,
        userContext
      };

      const response = await analyzer.analyzeEmail(analysisRequest);

      return NextResponse.json({
        success: true,
        data: response
      });
    }

    return NextResponse.json(
      { error: 'Either emailId or email data must be provided' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Error in email analysis:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/emails/analyze/process - Process emails from providers
 */
// Removed invalid export - this functionality should be handled via POST with different body structure

/**
 * GET /api/emails/analyze/status - Get job status
 */
// Removed invalid export - this functionality should be handled via GET with query parameters

/**
 * DELETE /api/emails/analyze/cancel - Cancel a job
 */
// Removed invalid export - this functionality should be handled via DELETE with query parameters

/**
 * GET /api/emails/analyze/stats - Get analysis statistics
 */
// Removed invalid export - this functionality should be handled via GET with query parameters

/**
 * GET /api/emails/analyze/stream - Stream analysis results
 */
// Removed invalid export - this functionality should be handled via GET with query parameters

/**
 * Rate limiting helper
 */
async function checkRateLimit(key: string): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Clean old entries
  for (const [k, v] of rateLimitMap.entries()) {
    if (v.resetTime < windowStart) {
      rateLimitMap.delete(k);
    }
  }

  // Check current rate
  const current = rateLimitMap.get(key);
  if (!current || current.resetTime < windowStart) {
    rateLimitMap.set(key, { count: 1, resetTime: now });
    return true;
  }

  if (current.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  current.count++;
  return true;
} 