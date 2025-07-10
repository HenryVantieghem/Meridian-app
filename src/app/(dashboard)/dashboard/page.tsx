'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useEmails } from '@/hooks/useEmails';
import { useSlackMessages } from '@/hooks/useSlackMessages';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { EmailList } from '@/components/email/EmailList';
import { MessageList } from '@/components/slack/MessageList';
import { ContextPanel } from '@/components/dashboard/ContextPanel';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, DashboardSkeleton } from '@/components/ui/LoadingSpinner';
import { PerformanceMonitor } from '@/components/ui/PerformanceMonitor';
import { Email, SlackMessage } from '@/types';

export default function DashboardPage() {
  const { userId } = useAuth();
  const [selectedItem, setSelectedItem] = useState<Email | SlackMessage | null>(null);
  const [activeTab, setActiveTab] = useState<'emails' | 'messages'>('emails');
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');

  // Real data hooks
  const {
    emails,
    loading: emailsLoading,
    error: emailsError,
    refresh: refreshEmails,
    syncEmails,
    syncStatus: emailSyncStatus,
  } = useEmails({
    status: 'unread',
    limit: 50,
    autoSync: true,
  });

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    refresh: refreshMessages,
    workspaces,
    channels,
  } = useSlackMessages({
    workspaceId: selectedWorkspace,
    limit: 50,
  });

  const { updates } = useRealtimeData();

  // Auto-refresh when real-time updates come in
  useEffect(() => {
    if (updates.some(u => u.type === 'email')) {
      refreshEmails();
    }
    if (updates.some(u => u.type === 'slack')) {
      refreshMessages();
    }
  }, [updates, refreshEmails, refreshMessages]);

  // Set first workspace as default if none selected
  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspace]);

  // Calculate statistics
  const unreadEmails = emails.filter(email => !email.read && !email.archived).length;
  const urgentEmails = emails.filter(email => email.priority === 'critical' && !email.archived).length;
  const unreadMessages = messages.filter(message => !message.read).length;
  const highPriorityMessages = messages.filter(message => message.priority === 'high').length;

  const handleItemSelect = async (item: Email | SlackMessage) => {
    setSelectedItem(item);
  };

  const handleSyncEmails = async () => {
    try {
      await syncEmails();
    } catch (error) {
      console.error('Failed to sync emails:', error);
    }
  };

  const handleWorkspaceChange = (workspaceId: string) => {
    setSelectedWorkspace(workspaceId);
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Typography variant="h2">Please sign in to access your dashboard</Typography>
      </div>
    );
  }

  // Show loading skeleton while data is loading
  if (emailsLoading && messagesLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedWorkspace={selectedWorkspace}
        workspaces={workspaces}
        onWorkspaceChange={handleWorkspaceChange}
        syncStatus={emailSyncStatus}
        onSyncEmails={handleSyncEmails}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h1" className="text-2xl font-bold text-black">
                {activeTab === 'emails' ? 'Email Inbox' : 'Slack Messages'}
              </Typography>
              <Typography variant="body" className="text-gray-600 mt-1">
                {activeTab === 'emails' 
                  ? `${unreadEmails} unread, ${urgentEmails} urgent`
                  : `${unreadMessages} unread, ${highPriorityMessages} high priority`
                }
              </Typography>
            </div>

            <div className="flex items-center space-x-4">
              {activeTab === 'emails' && (
                <Button
                  onClick={handleSyncEmails}
                  disabled={emailsLoading}
                  variant="outline"
                  size="sm"
                >
                  {emailsLoading ? 'Syncing...' : 'Sync Emails'}
                </Button>
              )}
              
              <Badge>
                {activeTab === 'emails' ? emails.length : messages.length} items
              </Badge>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* List Panel */}
          <div className="flex-1 border-r border-gray-200">
            <Suspense fallback={<LoadingSpinner size="lg" text="Loading messages..." />}>
              {activeTab === 'emails' ? (
                <EmailList
                  status="unread"
                  limit={50}
                  showFilters={true}
                  className="h-full"
                />
              ) : (
                <MessageList
                  messages={messages}
                  loading={messagesLoading}
                  error={messagesError}
                  onMessageSelect={handleItemSelect}
                  selectedMessage={selectedItem as SlackMessage}
                  channels={channels}
                  onRefresh={refreshMessages}
                />
              )}
            </Suspense>
          </div>

          {/* Context Panel */}
          <div className="w-1/3 bg-gray-50">
            <ContextPanel
              item={selectedItem}
              type={activeTab}
              onClose={() => setSelectedItem(null)}
            />
          </div>
        </div>

        {/* Performance Monitor (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 z-50">
            <PerformanceMonitor showDetails={false} />
          </div>
        )}
      </div>
    </div>
  );
} 