import { setupServer } from 'msw/node';
import { http } from 'msw';

// API base URLs
const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Mock handlers
export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE}/api/auth/sign-in`, ({ request }) => {
    return Response.json({
      success: true,
      data: {
        id: 'mock-user-id',
        email: 'test@example.com',
        name: 'Test User',
        token: 'mock-jwt-token'
      }
    }, { status: 200 });
  }),

  http.post(`${API_BASE}/api/auth/sign-up`, ({ request }) => {
    return Response.json({
      success: true,
      data: {
        id: 'mock-user-id',
        email: 'test@example.com',
        name: 'Test User',
        token: 'mock-jwt-token'
      }
    }, { status: 201 });
  }),

  // Email endpoints
  http.get(`${API_BASE}/api/emails`, ({ request }) => {
    return Response.json({
      success: true,
      data: [
        {
          id: 'email-1',
          subject: 'Test Email 1',
          from: 'sender@example.com',
          to: ['recipient@example.com'],
          body: 'This is a test email',
          date: new Date().toISOString(),
          priority: 'medium',
          isRead: false
        }
      ]
    }, { status: 200 });
  }),

  http.post(`${API_BASE}/api/emails/analyze`, ({ request }) => {
    return Response.json({
      success: true,
      data: {
        summary: 'This is a test email analysis',
        priority: 'medium',
        sentiment: 'neutral',
        suggestedActions: ['reply', 'archive']
      }
    }, { status: 200 });
  }),

  // AI endpoints
  http.post(`${API_BASE}/api/ai/generate-reply`, ({ request }) => {
    return Response.json({
      success: true,
      data: {
        reply: 'Thank you for your email. I will get back to you soon.',
        confidence: 0.85
      }
    }, { status: 200 });
  }),

  // Stripe endpoints
  http.post(`${API_BASE}/api/stripe/create-checkout`, ({ request }) => {
    return Response.json({
      success: true,
      data: {
        url: 'https://checkout.stripe.com/mock-session'
      }
    }, { status: 200 });
  }),

  http.post(`${API_BASE}/api/stripe/create-portal`, ({ request }) => {
    return Response.json({
      success: true,
      data: {
        url: 'https://billing.stripe.com/mock-portal'
      }
    }, { status: 200 });
  }),

  // Email service endpoints
  http.post(`${API_BASE}/api/email/send`, ({ request }) => {
    return Response.json({
      success: true,
      data: {
        messageId: 'mock-message-id'
      }
    }, { status: 200 });
  }),

  // Slack endpoints
  http.get(`${API_BASE}/api/slack/channels`, ({ request }) => {
    return Response.json({
      success: true,
      data: [
        {
          id: 'channel-1',
          name: 'general',
          isPrivate: false
        }
      ]
    }, { status: 200 });
  }),

  http.get(`${API_BASE}/api/slack/messages`, ({ request }) => {
    return Response.json({
      success: true,
      data: [
        {
          id: 'message-1',
          text: 'Test Slack message',
          user: 'user-1',
          channel: 'channel-1',
          timestamp: new Date().toISOString()
        }
      ]
    }, { status: 200 });
  }),

  // Database endpoints
  http.get(`${API_BASE}/api/users/profile`, ({ request }) => {
    return Response.json({
      success: true,
      data: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        preferences: {
          theme: 'light',
          notifications: true
        }
      }
    }, { status: 200 });
  }),

  // Health check
  http.get(`${API_BASE}/api/health`, ({ request }) => {
    return Response.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString()
      }
    }, { status: 200 });
  }),

  // Default handler for unmatched requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled request: ${request.method} ${request.url}`);
    return Response.json({ error: 'Not found' }, { status: 404 });
  })
];

// Create MSW server
export const server = setupServer(...handlers); 