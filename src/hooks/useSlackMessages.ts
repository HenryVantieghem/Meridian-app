'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { slackCache } from '@/lib/cache';
import { SlackMessage } from '@/types';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UseSlackMessagesOptions {
  workspaceId?: string;
  channelId?: string;
  limit?: number;
  refreshInterval?: number;
}

interface UseSlackMessagesReturn {
  messages: SlackMessage[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  sendMessage: (text: string, channelId?: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  workspaces: Array<{
    id: string;
    name: string;
    isActive: boolean;
  }>;
  channels: Array<{
    id: string;
    name: string;
    isMember: boolean;
  }>;
}

export function useSlackMessages(options: UseSlackMessagesOptions = {}): UseSlackMessagesReturn {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<SlackMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [workspaces, setWorkspaces] = useState<Array<{id: string; name: string; isActive: boolean}>>([]);
  const [channels, setChannels] = useState<Array<{id: string; name: string; isMember: boolean}>>([]);
  
  const { 
    workspaceId, 
    channelId, 
    limit = 50, 
    refreshInterval = 30000 
  } = options;

  const fetchMessages = useCallback(async (pageNum = 1, append = false) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // Try to get from cache first
      const cachedMessages = await slackCache.getMessages(workspaceId || 'all', channelId);
      
      if (cachedMessages && Array.isArray(cachedMessages) && pageNum === 1) {
        setMessages(cachedMessages);
        setLoading(false);
        return;
      }

      // Get messages from database
      let query = supabase
        .from('slack_messages')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      if (channelId) {
        query = query.eq('channel_id', channelId);
      }

      const { data: allMessages, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      let fetchedMessages = allMessages || [];
      
      // Apply pagination
      const startIndex = (pageNum - 1) * limit;
      const endIndex = startIndex + limit;
      fetchedMessages = fetchedMessages.slice(startIndex, endIndex);

      if (append) {
        setMessages(prev => [...prev, ...fetchedMessages]);
      } else {
        setMessages(fetchedMessages);
        // Cache the results
        await slackCache.setMessages(workspaceId || 'all', fetchedMessages, channelId);
      }

      setHasMore(fetchedMessages.length === limit);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [userId, workspaceId, channelId, limit]);

  const fetchWorkspaces = useCallback(async () => {
    if (!userId) return;

    try {
      const { data: integrations, error } = await supabase
        .from('integrations')
        .select('provider_data')
        .eq('user_id', userId)
        .eq('provider', 'slack')
        .eq('is_active', true);

      if (error) {
        console.error('Failed to fetch Slack workspaces:', error);
        return;
      }

      const workspaceList = integrations?.map(integration => ({
        id: integration.provider_data?.workspace_id || '',
        name: integration.provider_data?.workspace_name || 'Unknown Workspace',
        isActive: integration.provider_data?.workspace_id === workspaceId
      })).filter(w => w.id) || [];

      setWorkspaces(workspaceList);
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
    }
  }, [userId, workspaceId]);

  const fetchChannels = useCallback(async () => {
    if (!userId || !workspaceId) return;

    try {
      // Call Slack API to get channels
      const response = await fetch(`/api/slack/channels?workspaceId=${workspaceId}`);
      const data = await response.json();

      if (data.channels) {
        setChannels(data.channels.map((channel: unknown) => ({
          id: (channel as { id: string }).id,
          name: (channel as { name: string }).name,
          isMember: (channel as { isMember: boolean }).isMember
        })));
      }
    } catch (err) {
      console.error('Failed to fetch channels:', err);
    }
  }, [userId, workspaceId]);

  const refresh = useCallback(async () => {
    await fetchMessages(1, false);
  }, [fetchMessages]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchMessages(page + 1, true);
  }, [fetchMessages, hasMore, loading, page]);

  const sendMessage = useCallback(async (text: string, targetChannelId?: string) => {
    if (!userId || !workspaceId) return;

    try {
      const targetChannel = targetChannelId || channelId;
      if (!targetChannel) {
        throw new Error('No channel specified');
      }

      const response = await fetch('/api/slack/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId,
          channelId: targetChannel,
          text,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Refresh messages after sending
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, [userId, workspaceId, channelId, refresh]);

  const markAsRead = useCallback(async (messageId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('slack_messages')
        .update({ read: true })
        .eq('id', messageId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }

      setMessages(prev => 
        prev.map(message => 
          message.id === messageId 
            ? { ...message, read: true }
            : message
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark message as read');
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Fetch workspaces
  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Fetch channels when workspace changes
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

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
    sendMessage,
    markAsRead,
    hasMore,
    loadMore,
    workspaces,
    channels,
  };
} 