'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getEmails, updateEmail, deleteEmail } from '@/lib/db/emails';
import { emailSyncService } from '@/lib/email/sync-service';
import { emailCache } from '@/lib/cache';
import { Email, EmailPriority } from '@/types';

interface UseEmailsOptions {
  status?: 'unread' | 'read' | 'archived';
  priority?: EmailPriority;
  limit?: number;
  refreshInterval?: number;
  autoSync?: boolean;
}

interface UseEmailsReturn {
  emails: Email[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  syncEmails: () => Promise<void>;
  markAsRead: (emailId: string) => Promise<void>;
  markAsUnread: (emailId: string) => Promise<void>;
  deleteEmail: (emailId: string) => Promise<void>;
  updatePriority: (emailId: string, priority: EmailPriority) => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  syncStatus: {
    lastSync: Date | null;
    emailsCount: number;
    isActive: boolean;
  };
}

export function useEmails(options: UseEmailsOptions = {}): UseEmailsReturn {
  const { userId } = useAuth();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [syncStatus, setSyncStatus] = useState({
    lastSync: null as Date | null,
    emailsCount: 0,
    isActive: false
  });
  
  const { 
    status, 
    priority, 
    limit = 20, 
    refreshInterval = 30000,
    autoSync = true
  } = options;

  const fetchEmails = useCallback(async (pageNum = 1, append = false) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // Try to get from cache first
      const cacheKey = `${status || 'all'}_${priority || 'all'}`;
      const cachedEmails = await emailCache.getEmails(userId, cacheKey);
      
      if (cachedEmails && Array.isArray(cachedEmails) && pageNum === 1) {
        setEmails(cachedEmails);
        setLoading(false);
        return;
      }

      // Get emails from database
      const allEmails = await getEmails(userId);
      let fetchedEmails = allEmails;
      
      // Apply filters
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
      
      // Apply pagination
      const startIndex = (pageNum - 1) * limit;
      const endIndex = startIndex + limit;
      fetchedEmails = fetchedEmails.slice(startIndex, endIndex);

      if (append) {
        setEmails(prev => [...prev, ...fetchedEmails]);
      } else {
        setEmails(fetchedEmails);
        // Cache the results
        await emailCache.setEmails(userId, fetchedEmails, cacheKey);
      }

      setHasMore(fetchedEmails.length === limit);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  }, [userId, status, priority, limit]);

  const syncEmails = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // Sync emails from Gmail
      const syncResult = await emailSyncService.syncEmails({
        userId,
        maxResults: 100,
        forceFullSync: false
      });

      if (!syncResult.success) {
        setError(`Sync failed: ${syncResult.errors.join(', ')}`);
      }

      // Refresh emails after sync
      await fetchEmails(1, false);
      
      // Update sync status
      const status = await emailSyncService.getSyncStatus(userId);
      setSyncStatus(status);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync emails');
    } finally {
      setLoading(false);
    }
  }, [userId, fetchEmails]);

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
      // Invalidate cache
      await emailCache.invalidateEmails(userId);
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
      // Invalidate cache
      await emailCache.invalidateEmails(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark email as unread');
    }
  }, [userId]);

  const deleteEmailHandler = useCallback(async (emailId: string) => {
    if (!userId) return;

    try {
      await deleteEmail(userId, emailId);
      setEmails(prev => prev.filter(email => email.id !== emailId));
      // Invalidate cache
      await emailCache.invalidateEmails(userId);
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
      // Invalidate cache
      await emailCache.invalidateEmails(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update email priority');
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  // Get initial sync status
  useEffect(() => {
    if (userId) {
      emailSyncService.getSyncStatus(userId).then(setSyncStatus);
    }
  }, [userId]);

  // Auto-sync if enabled
  useEffect(() => {
    if (autoSync && userId) {
      syncEmails();
    }
  }, [autoSync, userId, syncEmails]);

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
    syncEmails,
    markAsRead,
    markAsUnread,
    deleteEmail: deleteEmailHandler,
    updatePriority,
    hasMore,
    loadMore,
    syncStatus,
  };
} 