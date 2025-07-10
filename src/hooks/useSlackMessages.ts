'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface SlackMessage {
  id: string;
  channelId: string;
  channelName: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  reactions: Array<{
    emoji: string;
    count: number;
  }>;
  threadCount?: number;
  priority: 'low' | 'medium' | 'high';
  status: 'unread' | 'read' | 'archived';
}

interface UseSlackMessagesOptions {
  channelId?: string;
  status?: 'unread' | 'read' | 'archived';
  priority?: 'low' | 'medium' | 'high';
  limit?: number;
  refreshInterval?: number;
}

interface UseSlackMessagesReturn {
  messages: SlackMessage[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  markAsUnread: (messageId: string) => Promise<void>;
  archiveMessage: (messageId: string) => Promise<void>;
  updatePriority: (messageId: string, priority: 'low' | 'medium' | 'high') => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export function useSlackMessages(options: UseSlackMessagesOptions = {}): UseSlackMessagesReturn {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<SlackMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { channelId, status, priority, limit = 20, refreshInterval = 30000 } = options;

  const fetchMessages = useCallback(async (pageNum = 1, append = false) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/slack/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId,
          status,
          priority,
          limit,
          offset: (pageNum - 1) * limit,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Slack messages');
      }

      const data = await response.json();
      const fetchedMessages = data.messages || [];

      if (append) {
        setMessages(prev => [...prev, ...fetchedMessages]);
      } else {
        setMessages(fetchedMessages);
      }

      setHasMore(fetchedMessages.length === limit);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Slack messages');
    } finally {
      setLoading(false);
    }
  }, [userId, channelId, status, priority, limit]);

  const refresh = useCallback(async () => {
    await fetchMessages(1, false);
  }, [fetchMessages]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchMessages(page + 1, true);
  }, [fetchMessages, hasMore, loading, page]);

  const markAsRead = useCallback(async (messageId: string) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/slack/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          status: 'read',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark message as read');
      }

      setMessages(prev => 
        prev.map(message => 
          message.id === messageId 
            ? { ...message, status: 'read' }
            : message
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark message as read');
    }
  }, [userId]);

  const markAsUnread = useCallback(async (messageId: string) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/slack/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          status: 'unread',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark message as unread');
      }

      setMessages(prev => 
        prev.map(message => 
          message.id === messageId 
            ? { ...message, status: 'unread' }
            : message
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark message as unread');
    }
  }, [userId]);

  const archiveMessage = useCallback(async (messageId: string) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/slack/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          status: 'archived',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to archive message');
      }

      setMessages(prev => prev.filter(message => message.id !== messageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive message');
    }
  }, [userId]);

  const updatePriority = useCallback(async (messageId: string, priority: 'low' | 'medium' | 'high') => {
    if (!userId) return;

    try {
      const response = await fetch('/api/slack/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          priority,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update message priority');
      }

      setMessages(prev => 
        prev.map(message => 
          message.id === messageId 
            ? { ...message, priority }
            : message
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update message priority');
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  return {
    messages,
    loading,
    error,
    refresh,
    markAsRead,
    markAsUnread,
    archiveMessage,
    updatePriority,
    hasMore,
    loadMore,
  };
} 