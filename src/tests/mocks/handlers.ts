import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  imageUrl: 'https://example.com/avatar.jpg'
};

const mockEmails = [
  {
    id: 'email-1',
    subject: 'Important Meeting Tomorrow',
    from: 'boss@company.com',
    to: ['user@example.com'],
    body: 'Please prepare for the Q4 review meeting tomorrow at 2 PM.',
    date: new Date().toISOString(),
    threadId: 'thread-1',
    priority: 'high',
    isVIP: true,
    isRead: false
  },
  {
    id: 'email-2',
    subject: 'Weekly Newsletter',
    from: 'newsletter@company.com',
    to: ['user@example.com'],
    body: 'This week\'s company updates and announcements.',
    date: new Date().toISOString(),
    threadId: 'thread-2',
    priority: 'low',
    isVIP: false,
    isRead: true
  },
  {
    id: 'email-3',
    subject: 'Project Update',
    from: 'colleague@company.com',
    to: ['user@example.com'],
    body: 'Here\'s the latest update on our project progress.',
    date: new Date().toISOString(),
    threadId: 'thread-3',
    priority: 'medium',
    isVIP: false,
    isRead: false
  }
];

const mockAnalysis = {
  summary: 'Meeting request for Q4 review',
  priority: 'high',
  sentiment: 'neutral',
  urgency: 'immediate',
  isVIP: true,
  confidence: 0.95,
  suggestedActions: ['reply', 'schedule'],
  keyPoints: ['Q4 review meeting', 'Tomorrow at 2 PM', 'Preparation required']
};

const mockAIResponse = {
  reply: 'Thank you for the meeting request. I\'ll prepare the Q4 review materials and confirm my attendance for tomorrow at 2 PM.',
  confidence: 0.92,
  tone: 'professional',
  suggestedActions: ['send', 'schedule-follow-up']
};

// API handlers
export const handlers = [
  // Authentication
  http.get('/api/auth/user', () => {
    return HttpResponse.json({
      success: true,
      data: mockUser
    });
  }),

  http.post('/api/auth/sign-in', async ({ request }) => {
    const body = await request.json() as any;
    
    if (body && body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          user: mockUser,
          token: 'mock-jwt-token'
        }
      });
    }
    
    return HttpResponse.json({
      success: false,
      error: 'Invalid credentials'
    }, { status: 401 });
  }),

  // Email endpoints
  http.get('/api/emails', () => {
    return HttpResponse.json({
      success: true,
      data: mockEmails
    });
  }),

  http.post('/api/emails/analyze', async ({ request }) => {
    const body = await request.json() as any;
    
    if (!body || !body.email) {
      return HttpResponse.json({
        success: false,
        error: 'Email data is required'
      }, { status: 400 });
    }
    
    return HttpResponse.json({
      success: true,
      data: mockAnalysis,
      analysisId: 'analysis-123'
    });
  }),

  http.post('/api/emails/batch-analyze', async ({ request }) => {
    const body = await request.json() as any;
    
    if (!body || !body.emails || !Array.isArray(body.emails)) {
      return HttpResponse.json({
        success: false,
        error: 'Emails array is required'
      }, { status: 400 });
    }
    
    const analyses = body.emails.map((email: any) => ({
      emailId: email.id,
      ...mockAnalysis
    }));
    
    return HttpResponse.json({
      success: true,
      data: analyses
    });
  }),

  // AI endpoints
  http.post('/api/ai/generate-reply', async ({ request }) => {
    const body = await request.json() as any;
    
    if (!body || !body.email || !body.context) {
      return HttpResponse.json({
        success: false,
        error: 'Email and context are required'
      }, { status: 400 });
    }
    
    return HttpResponse.json({
      success: true,
      data: mockAIResponse
    });
  }),

  http.post('/api/ai/analyze-sentiment', async ({ request }) => {
    const body = await request.json() as any;
    
    if (!body || !body.text) {
      return HttpResponse.json({
        success: false,
        error: 'Text is required'
      }, { status: 400 });
    }
    
    return HttpResponse.json({
      success: true,
      data: {
        sentiment: 'positive',
        confidence: 0.85,
        emotions: ['excited', 'confident']
      }
    });
  }),

  // Processing jobs
  http.post('/api/emails/process', async ({ request }) => {
    const body = await request.json() as any;
    
    if (!body || !body.emails || !Array.isArray(body.emails)) {
      return HttpResponse.json({
        success: false,
        error: 'Emails array is required'
      }, { status: 400 });
    }
    
    return HttpResponse.json({
      success: true,
      data: {
        jobId: 'job-123',
        status: 'processing',
        totalEmails: body.emails.length,
        processedEmails: 0
      }
    });
  }),

  http.get('/api/emails/jobs/:jobId', ({ params }) => {
    const { jobId } = params;
    
    return HttpResponse.json({
      success: true,
      data: {
        jobId,
        status: 'completed',
        totalEmails: 10,
        processedEmails: 10,
        results: mockEmails.map(email => ({
          emailId: email.id,
          analysis: mockAnalysis
        }))
      }
    });
  }),

  // Billing endpoints
  http.post('/api/billing/checkout', async ({ request }) => {
    const body = await request.json() as any;
    
    if (!body || !body.priceId) {
      return HttpResponse.json({
        success: false,
        error: 'Price ID is required'
      }, { status: 400 });
    }
    
    return HttpResponse.json({
      success: true,
      data: {
        sessionId: 'cs_test_session',
        url: 'https://checkout.stripe.com/pay/cs_test_session'
      }
    });
  }),

  http.get('/api/billing/portal', () => {
    return HttpResponse.json({
      success: true,
      data: {
        url: 'https://billing.stripe.com/session/session_123'
      }
    });
  }),

  // Email management
  http.post('/api/email/send', async ({ request }) => {
    const body = await request.json() as any;
    
    if (!body || !body.to || !body.subject || !body.html) {
      return HttpResponse.json({
        success: false,
        error: 'To, subject, and HTML content are required'
      }, { status: 400 });
    }
    
    return HttpResponse.json({
      success: true,
      data: {
        messageId: 'msg_123',
        status: 'sent'
      }
    });
  }),

  // Slack integration
  http.post('/api/slack/oauth', async ({ request }) => {
    const body = await request.json() as any;
    
    if (!body || !body.code) {
      return HttpResponse.json({
        success: false,
        error: 'Authorization code is required'
      }, { status: 400 });
    }
    
    return HttpResponse.json({
      success: true,
      data: {
        accessToken: 'xoxb-mock-token',
        teamId: 'T1234567890',
        teamName: 'Mock Team'
      }
    });
  }),

  http.post('/api/slack/messages', async ({ request }) => {
    const body = await request.json() as any;
    
    if (!body || !body.channel || !body.text) {
      return HttpResponse.json({
        success: false,
        error: 'Channel and text are required'
      }, { status: 400 });
    }
    
    return HttpResponse.json({
      success: true,
      data: {
        messageId: '1234567890.123456',
        channel: body.channel,
        text: body.text
      }
    });
  }),

  // Error handlers
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return HttpResponse.json({
      success: false,
      error: 'Not found'
    }, { status: 404 });
  })
];

// Setup server
export const server = setupServer(...handlers);

// Error scenarios
export const errorHandlers = [
  http.get('/api/emails', () => {
    return HttpResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }),

  http.post('/api/emails/analyze', () => {
    return HttpResponse.json({
      success: false,
      error: 'OpenAI API error'
    }, { status: 500 });
  }),

  http.post('/api/auth/sign-in', () => {
    return HttpResponse.json({
      success: false,
      error: 'Rate limit exceeded'
    }, { status: 429 });
  })
];

// Network error scenarios
export const networkErrorHandlers = [
  http.get('/api/emails', () => {
    return HttpResponse.error();
  }),

  http.post('/api/emails/analyze', () => {
    return HttpResponse.error();
  })
];

// Slow response scenarios
export const slowHandlers = [
  http.get('/api/emails', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return HttpResponse.json({
      success: true,
      data: mockEmails
    });
  }),

  http.post('/api/emails/analyze', async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return HttpResponse.json({
      success: true,
      data: mockAnalysis
    });
  })
]; 