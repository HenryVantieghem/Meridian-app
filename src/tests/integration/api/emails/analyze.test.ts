import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn(() => ({
      insert: jest.fn(),
      select: jest.fn(),
      update: jest.fn()
    }))
  }))
}));

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }))
}));

describe('Email Analysis API', () => {
  let mockSupabase: any;
  let mockOpenAI: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get mocked instances
    const { createClient } = require('@supabase/supabase-js');
    mockSupabase = createClient();
    
    const { OpenAI } = require('openai');
    mockOpenAI = new OpenAI();
  });

  it('should analyze email successfully', async () => {
    // Mock successful response
    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            summary: 'Test email summary',
            priority: 'high',
            sentiment: 'positive',
            urgency: 'urgent',
            confidence: 0.9
          })
        }
      }]
    });

    // Mock Supabase response
    mockSupabase.from().insert.mockResolvedValue({
      data: { id: 'analysis-123' },
      error: null
    });

    // Test the API endpoint
    const response = await fetch('/api/emails/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: {
          id: 'email-123',
          subject: 'Test Email',
          body: 'This is a test email body.',
          from: 'test@example.com',
          to: ['recipient@example.com']
        }
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.analysis).toBeDefined();
  });

  it('should handle OpenAI API errors', async () => {
    // Mock OpenAI error
    mockOpenAI.chat.completions.create.mockRejectedValue(
      new Error('OpenAI API error')
    );

    const response = await fetch('/api/emails/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: {
          id: 'email-123',
          subject: 'Test Email',
          body: 'This is a test email body.',
          from: 'test@example.com',
          to: ['recipient@example.com']
        }
      })
    });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('OpenAI API error');
  });

  it('should handle invalid JSON response from OpenAI', async () => {
    // Mock invalid JSON response
    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [{
        message: {
          content: 'Invalid JSON response'
        }
      }]
    });

    const response = await fetch('/api/emails/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: {
          id: 'email-123',
          subject: 'Test Email',
          body: 'This is a test email body.',
          from: 'test@example.com',
          to: ['recipient@example.com']
        }
      })
    });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid JSON response from OpenAI');
  });
}); 