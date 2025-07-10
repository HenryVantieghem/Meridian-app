'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmails } from '@/hooks/useEmails';
import { EmailCard } from './EmailCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, AlertCircle, Inbox, Archive, Star } from 'lucide-react';
import { Typography } from '@/components/ui/typography';
import { EmailPriority } from '@/types';

interface EmailListProps {
  status?: 'unread' | 'read' | 'archived';
  priority?: EmailPriority;
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

export function EmailList({ 
  status = 'unread', 
  priority, 
  limit = 20, 
  showFilters = true,
  className = '' 
}: EmailListProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  
  const {
    emails,
    loading,
    error,
    refresh,
    markAsRead,
    markAsUnread,
    deleteEmail,
    updatePriority,
    hasMore,
    loadMore,
  } = useEmails({
    status: selectedFilter === 'all' ? undefined : selectedFilter,
    priority,
    limit,
    refreshInterval: 30000, // 30 seconds
  });

  const handleFilterChange = (filter: 'all' | 'unread' | 'read' | 'archived') => {
    setSelectedFilter(filter);
  };

  const handleLoadMore = async () => {
    await loadMore();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <Typography variant="h3" className="text-gray-900 mb-2">
          Error Loading Emails
        </Typography>
        <Typography variant="body" className="text-gray-600 mb-4">
          {error}
        </Typography>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with filters */}
      {showFilters && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Typography variant="h2" className="text-xl font-semibold text-gray-900">
              Emails
            </Typography>
            <Badge className="ml-2 bg-gray-100 border-gray-300">
              {emails.length}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('all')}
            >
              All
            </Button>
            <Button
              variant={selectedFilter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('unread')}
            >
              <Inbox className="h-4 w-4 mr-1" />
              Unread
            </Button>
            <Button
              variant={selectedFilter === 'read' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('read')}
            >
              <Star className="h-4 w-4 mr-1" />
              Read
            </Button>
            <Button
              variant={selectedFilter === 'archived' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('archived')}
            >
              <Archive className="h-4 w-4 mr-1" />
              Archived
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && emails.length === 0 && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <Typography variant="body" className="ml-2 text-gray-600">
            Loading emails...
          </Typography>
        </div>
      )}

      {/* Empty state */}
      {!loading && emails.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-8 text-center"
        >
          <Inbox className="h-12 w-12 text-gray-400 mb-4" />
          <Typography variant="h3" className="text-gray-900 mb-2">
            No emails found
          </Typography>
          <Typography variant="body" className="text-gray-600 mb-4">
            {selectedFilter === 'all' 
              ? 'No emails in your inbox yet.'
              : `No ${selectedFilter} emails found.`
            }
          </Typography>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </motion.div>
      )}

      {/* Email list */}
      <AnimatePresence>
        {emails.map((email, index) => (
          <motion.div
            key={email.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
          >
            <EmailCard
              email={email}
              onMarkAsRead={() => markAsRead(email.id)}
              onMarkAsUnread={() => markAsUnread(email.id)}
              onDelete={() => deleteEmail(email.id)}
              onUpdatePriority={(priority) => updatePriority(email.id, priority)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Load more button */}
      {hasMore && emails.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {/* Refresh button */}
      {emails.length > 0 && (
        <div className="flex justify-end pt-2">
          <Button
            onClick={refresh}
            variant="ghost"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
} 