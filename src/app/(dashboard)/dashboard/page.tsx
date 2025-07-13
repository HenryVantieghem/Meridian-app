'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@clerk/nextjs';
import { useHotkeys } from 'react-hotkeys-hook';
import { useEmails } from '@/hooks/useEmails';
import { useSlackMessages } from '@/hooks/useSlackMessages';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, DashboardSkeleton } from '@/components/ui/LoadingSpinner';
import { Email, SlackMessage } from '@/types';
import OnboardingModal from '@/components/onboarding/OnboardingModal';

// Lazy load heavy components
const EmailList = dynamic(() => import('@/components/email/EmailList').then(mod => ({ default: mod.EmailList })), {
  loading: () => <LoadingSpinner size="lg" text="Loading email interface..." />,
  ssr: false
});

const MessageList = dynamic(() => import('@/components/slack/MessageList').then(mod => ({ default: mod.MessageList })), {
  loading: () => <LoadingSpinner size="lg" text="Loading messaging interface..." />,
  ssr: false
});

const ContextPanel = dynamic(() => import('@/components/dashboard/ContextPanel').then(mod => ({ default: mod.ContextPanel })), {
  loading: () => <LoadingSpinner size="sm" text="Loading context..." />,
  ssr: false
});

const AIActionSidebar = dynamic(() => import('@/components/dashboard/AIActionSidebar').then(mod => ({ default: mod.AIActionSidebar })), {
  loading: () => <LoadingSpinner size="sm" text="Loading AI actions..." />,
  ssr: false
});

const CommandBar = dynamic(() => import('@/components/CommandBar').then(mod => ({ default: mod.CommandBar })), {
  ssr: false
});

const Sidebar = dynamic(() => import('@/components/dashboard/Sidebar').then(mod => ({ default: mod.Sidebar })), {
  loading: () => <LoadingSpinner size="sm" text="Loading navigation..." />,
  ssr: false
});

const PerformanceMonitor = dynamic(() => import('@/components/ui/PerformanceMonitor').then(mod => ({ default: mod.PerformanceMonitor })), {
  ssr: false
});

export default function DashboardPage() {
  const { userId } = useAuth();
  const [selectedItem, setSelectedItem] = useState<Email | SlackMessage | null>(null);
  const [activeTab, setActiveTab] = useState<'emails' | 'messages'>('emails');
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [showAIActions, setShowAIActions] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCommandBar, setShowCommandBar] = useState(false);

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

  // Keyboard shortcuts
  useHotkeys('e', () => {
    if (selectedItem) {
      console.log('Marking item as done:', selectedItem.id);
      // Mark item as done
    }
  }, { enableOnFormTags: true });

  useHotkeys('r', () => {
    if (selectedItem) {
      console.log('Opening reply for:', selectedItem.id);
      // Open reply composer
    }
  }, { enableOnFormTags: true });

  useHotkeys('s', () => {
    if (selectedItem) {
      console.log('Snoozing item:', selectedItem.id);
      // Snooze item
    }
  }, { enableOnFormTags: true });

  useHotkeys('a', () => {
    setShowAIActions(prev => !prev);
  }, { enableOnFormTags: true });

  useHotkeys('cmd+k, ctrl+k', () => {
    setShowCommandBar(prev => !prev);
  }, { enableOnFormTags: true });

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

  // Check if user needs onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('selectedPersona') && localStorage.getItem('userPreferences');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

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

  const handleCommand = (command: string) => {
    console.log('Executing command:', command);
    // Handle AI commands here
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
      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />

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
                  className="rounded-2xl px-4 py-2 bg-black text-white hover:bg-[#801B2B] transition-all duration-200"
                >
                  {emailsLoading ? 'Synchronizing...' : 'Sync Communications'}
                </Button>
              )}
              
              <Button
                onClick={() => setShowAIActions(!showAIActions)}
                variant="outline"
                className="rounded-2xl px-4 py-2"
              >
                {showAIActions ? 'Hide' : 'Show'} AI Actions
              </Button>
              
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

      {/* AI Action Sidebar */}
      {showAIActions && (
        <AIActionSidebar className="fixed right-0 top-0 h-full z-40" />
      )}

      {/* Persistent Command Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg px-6 py-3 min-w-[400px]">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-brand-burgundy rounded-full animate-pulse"></div>
            <input
              type="text"
              placeholder="Ask Napoleon..."
              className="flex-1 bg-transparent border-none outline-none text-black placeholder-gray-500"
              onFocus={() => setShowCommandBar(true)}
            />
            <div className="text-xs text-gray-400">⌘K</div>
          </div>
        </div>
      </div>

      {/* Command Bar */}
      {showCommandBar && (
        <CommandBar onCommand={handleCommand} />
      )}
    </div>
  );
} 