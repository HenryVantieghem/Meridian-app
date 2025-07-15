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
import DailyBrief from '@/components/dashboard/DailyBrief';
import VIPManager from '@/components/dashboard/VIPManager';
import { usePriorityScoring } from '@/components/dashboard/PriorityScoring';
import GuidedTour, { useGuidedTour } from '@/components/ui/GuidedTour';
import SecurityHints from '@/components/ui/SecurityHints';

// Lazy load ROI Dashboard
const ROIDashboard = dynamic(() => import('@/components/dashboard/ROIDashboard').then(mod => ({ default: mod.ROIDashboard })), {
  loading: () => <LoadingSpinner size="lg" text="Loading ROI metrics..." />,
  ssr: false
});

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
  const [showDailyBrief, setShowDailyBrief] = useState(true);
  const [showVIPManager, setShowVIPManager] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showROI, setShowROI] = useState(false);
  
  const { scoreItem, updateVIPContacts, getPriorityLabel } = usePriorityScoring();
  const { showTour, closeTour, completeTour, startTour } = useGuidedTour();

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
      // Mark item as done - implement actual logic
      handleItemComplete(selectedItem);
    }
  }, { enableOnFormTags: true });

  useHotkeys('r', () => {
    if (selectedItem) {
      // Open reply composer - implement actual logic
      handleItemReply(selectedItem);
    }
  }, { enableOnFormTags: true });

  useHotkeys('s', () => {
    if (selectedItem) {
      // Snooze item - implement actual logic
      handleItemSnooze(selectedItem);
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

  const handleItemComplete = async (item: Email | SlackMessage) => {
    try {
      // Mark item as completed
      if ('subject' in item) {
        // Handle email completion
        await fetch(`/api/emails/${item.id}/complete`, { method: 'POST' });
      } else {
        // Handle message completion
        await fetch(`/api/slack/messages/${item.id}/complete`, { method: 'POST' });
      }
      refreshEmails();
      refreshMessages();
    } catch (error) {
      console.error('Failed to complete item:', error);
    }
  };

  const handleItemReply = (item: Email | SlackMessage) => {
    // Open reply composer - for now, just select the item
    setSelectedItem(item);
    // TODO: Open draft writer modal with this item as context
  };

  const handleItemSnooze = async (item: Email | SlackMessage) => {
    try {
      // Snooze item for 1 hour by default
      const snoozeUntil = new Date(Date.now() + 60 * 60 * 1000);
      if ('subject' in item) {
        await fetch(`/api/emails/${item.id}/snooze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ snoozeUntil })
        });
      } else {
        await fetch(`/api/slack/messages/${item.id}/snooze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ snoozeUntil })
        });
      }
      refreshEmails();
      refreshMessages();
    } catch (error) {
      console.error('Failed to snooze item:', error);
    }
  };
  
  const handleVIPUpdate = (contacts: any[]) => {
    updateVIPContacts(contacts);
  };
  
  const handleItemClick = (item: Email | SlackMessage) => {
    setSelectedItem(item);
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
              <p className="text-body-cartier text-cartier-secondary mt-2">
                {activeTab === 'emails' 
                  ? `${unreadEmails} unread communications, ${urgentEmails} critical priorities`
                  : `${unreadMessages} unread messages, ${highPriorityMessages} high priority items`
                }
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={() => { setShowDailyBrief(true); setShowVIPManager(false); setShowSecurity(false); setShowROI(false); }}
                variant={showDailyBrief ? "default" : "outline"}
                className="rounded-2xl px-4 py-2"
              >
                Daily Brief
              </Button>
              
              <Button
                onClick={() => { setShowVIPManager(true); setShowDailyBrief(false); setShowSecurity(false); setShowROI(false); }}
                variant={showVIPManager ? "default" : "outline"}
                className="rounded-2xl px-4 py-2"
              >
                VIP Manager
              </Button>
              
              <Button
                onClick={() => { setShowROI(true); setShowDailyBrief(false); setShowVIPManager(false); setShowSecurity(false); }}
                variant={showROI ? "default" : "outline"}
                className="rounded-2xl px-4 py-2"
              >
                ROI Dashboard
              </Button>
              
              <Button
                onClick={() => { setShowSecurity(true); setShowDailyBrief(false); setShowVIPManager(false); setShowROI(false); }}
                variant={showSecurity ? "default" : "outline"}
                className="rounded-2xl px-4 py-2"
              >
                Security
              </Button>
              
              {activeTab === 'emails' && (
                <Button
                  onClick={handleSyncEmails}
                  disabled={emailsLoading}
                  className="rounded-2xl px-4 py-2 bg-black text-white hover:bg-brand-burgundy transition-all duration-200"
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
                {showDailyBrief ? `${emails.length + messages.length} items` : 
                 showVIPManager ? 'VIP Management' :
                 showROI ? 'ROI Analytics' :
                 showSecurity ? 'Security Center' :
                 activeTab === 'emails' ? `${emails.length} emails` : `${messages.length} messages`}
              </Badge>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading strategic communications..." />}>
            {showDailyBrief ? (
              <DailyBrief
                emails={emails}
                messages={messages}
                onItemClick={handleItemClick}
                className="p-6"
              />
            ) : showVIPManager ? (
              <VIPManager
                emails={emails}
                messages={messages}
                onVIPUpdate={handleVIPUpdate}
                className="p-6"
              />
            ) : showROI ? (
              <div className="p-6">
                <ROIDashboard />
              </div>
            ) : showSecurity ? (
              <SecurityHints className="p-6" />
            ) : activeTab === 'emails' ? (
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
      
      {/* Guided Tour */}
      <GuidedTour 
        isOpen={showTour}
        onClose={closeTour}
        onComplete={completeTour}
      />
    </div>
  );
} 