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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Typography variant="h2" className="text-black font-serif">Please sign in to access your Strategic Command Center</Typography>
      </div>
    );
  }

  // Show loading skeleton while data is loading
  if (emailsLoading && messagesLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="dashboard-cartier">
      {/* Left Sidebar */}
      <div className="sidebar-left">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedWorkspace={selectedWorkspace}
          workspaces={workspaces}
          onWorkspaceChange={handleWorkspaceChange}
          syncStatus={emailSyncStatus}
          onSyncEmails={handleSyncEmails}
        />
      </div>

      {/* Main Content Panel */}
      <div className="main-panel">
        {/* Header */}
        <header className="header-cartier">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-headline-cartier text-black font-serif">
                {activeTab === 'emails' ? 'Strategic Communication Command' : 'Executive Messaging Hub'}
              </h1>
              <p className="text-body-cartier text-[#4A4A4A] mt-2">
                {activeTab === 'emails' 
                  ? `${unreadEmails} unread communications, ${urgentEmails} critical priorities`
                  : `${unreadMessages} unread messages, ${highPriorityMessages} high priority items`
                }
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {activeTab === 'emails' && (
                <Button
                  onClick={handleSyncEmails}
                  disabled={emailsLoading}
                  variant="cartier-secondary"
                  size="cartier"
                >
                  {emailsLoading ? 'Synchronizing...' : 'Sync Communications'}
                </Button>
              )}
              
              <Badge className="bg-[#F8F6F0] text-black border-[#801B2B]">
                {activeTab === 'emails' ? emails.length : messages.length} items
              </Badge>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading strategic communications..." />}>
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

        {/* Performance Monitor (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 z-50">
            <PerformanceMonitor showDetails={false} />
          </div>
        )}
      </div>

      {/* Right Context Panel */}
      <div className="sidebar-right">
        <ContextPanel
          item={selectedItem}
          type={activeTab}
          onClose={() => setSelectedItem(null)}
        />
      </div>
    </div>
  );
} 