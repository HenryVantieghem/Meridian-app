'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getEmails, getEmailById, updateEmail, deleteEmail } from '@/lib/db/emails';
import { Email, EmailPriority } from '@/types';

interface UseEmailsOptions {
  status?: 'unread' | 'read' | 'archived';
  priority?: EmailPriority;
  limit?: number;
  refreshInterval?: number;
}

interface UseEmailsReturn {
  emails: Email[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (emailId: string) => Promise<void>;
  markAsUnread: (emailId: string) => Promise<void>;
  deleteEmail: (emailId: string) => Promise<void>;
  updatePriority: (emailId: string, priority: EmailPriority) => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export function useEmails(options: UseEmailsOptions = {}): UseEmailsReturn {
  const { userId } = useAuth();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { status, priority, limit = 20, refreshInterval = 30000 } = options;

  const fetchEmails = useCallback(async (pageNum = 1, append = false) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const allEmails = await getEmails(userId);
      let fetchedEmails = allEmails;
      if (status) {
        if (status === 'unread') {
          fetchedEmails = fetchedEmails.filter(e => !e.read && !e.archived);
        } else if (status === 'read') {
          fetchedEmails = fetchedEmails.filter(e => e.read && !e.archived);
        } else if (status === 'archived') {
          fetchedEmails = fetchedEmails.filter(e => e.archived);
        }
      }
      if (priority) {
        fetchedEmails = fetchedEmails.filter(e => e.priority === priority);
      }
      if (limit) {
        fetchedEmails = fetchedEmails.slice(0, limit);
      }

      if (append) {
        setEmails(prev => [...prev, ...fetchedEmails]);
      } else {
        setEmails(fetchedEmails);
      }

      setHasMore(fetchedEmails.length === limit);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  }, [userId, status, priority, limit]);

  const refresh = useCallback(async () => {
    await fetchEmails(1, false);
  }, [fetchEmails]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchEmails(page + 1, true);
  }, [fetchEmails, hasMore, loading, page]);

  const markAsRead = useCallback(async (emailId: string) => {
    if (!userId) return;

    try {
      await updateEmail(userId, emailId, { read: true });
      setEmails(prev => 
        prev.map(email => 
          email.id === emailId 
            ? { ...email, read: true }
            : email
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark email as read');
    }
  }, [userId]);

  const markAsUnread = useCallback(async (emailId: string) => {
    if (!userId) return;

    try {
      await updateEmail(userId, emailId, { read: false });
      setEmails(prev => 
        prev.map(email => 
          email.id === emailId 
            ? { ...email, read: false }
            : email
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark email as unread');
    }
  }, [userId]);

  const deleteEmailHandler = useCallback(async (emailId: string) => {
    if (!userId) return;

    try {
      await deleteEmail(userId, emailId);
      setEmails(prev => prev.filter(email => email.id !== emailId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete email');
    }
  }, [userId]);

  const updatePriority = useCallback(async (emailId: string, priority: EmailPriority) => {
    if (!userId) return;

    try {
      await updateEmail(userId, emailId, { priority });
      setEmails(prev => 
        prev.map(email => 
          email.id === emailId 
            ? { ...email, priority }
            : email
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update email priority');
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  return {
    emails,
    loading,
    error,
    refresh,
    markAsRead,
    markAsUnread,
    deleteEmail: deleteEmailHandler,
    updatePriority,
    hasMore,
    loadMore,
  };
} 