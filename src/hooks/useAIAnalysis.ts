'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface AIAnalysis {
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

interface UseAIAnalysisOptions {
  contentType?: 'email' | 'slack';
  includeReply?: boolean;
  includeSummary?: boolean;
}

interface UseAIAnalysisReturn {
  analyzeContent: (content: string, contentType: 'email' | 'slack') => Promise<AIAnalysis>;
  generateReply: (content: string, context: string) => Promise<string>;
  loading: boolean;
  error: string | null;
  lastAnalysis: AIAnalysis | null;
}

export function useAIAnalysis(options: UseAIAnalysisOptions = {}): UseAIAnalysisReturn {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<AIAnalysis | null>(null);
  const { contentType = 'email', includeReply = true, includeSummary = true } = options;

  const analyzeContent = useCallback(async (content: string, contentType: 'email' | 'slack'): Promise<AIAnalysis> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/emails/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          contentType,
          includeReply,
          includeSummary,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze content');
      }

      const analysis: AIAnalysis = await response.json();
      setLastAnalysis(analysis);
      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze content';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, includeReply, includeSummary]);

  const generateReply = useCallback(async (content: string, context: string): Promise<string> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ai/generate-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalContent: content,
          context,
          tone: 'professional',
          length: 'medium',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate reply');
      }

      const data = await response.json();
      return data.reply;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate reply';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    analyzeContent,
    generateReply,
    loading,
    error,
    lastAnalysis,
  };
} 