'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';
import { useEmails } from '@/hooks/useEmails';
import { useSlackMessages } from '@/hooks/useSlackMessages';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { EmailList } from '@/components/email/EmailList';
import { MessageCard } from '@/components/slack/MessageCard';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { ContextPanel } from '@/components/dashboard/ContextPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { 
  Mail, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';

export default function DashboardPage() {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState<'emails' | 'messages' | 'ai'>('emails');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Real data hooks
  const {
    emails,
    loading: emailsLoading,
    error: emailsError,
    refresh: refreshEmails,
  } = useEmails({ limit: 10 });

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    refresh: refreshMessages,
  } = useSlackMessages({ limit: 10 });

  const {
    analyzeContent,
    loading: aiLoading,
    error: aiError,
    lastAnalysis,
  } = useAIAnalysis();

  const {
    connected: realtimeConnected,
    updates: realtimeUpdates,
    error: realtimeError,
  } = useRealtimeData();

  // Stats calculations
  const unreadEmails = emails.filter(email => !email.read && !email.archived).length;
  const urgentEmails = emails.filter(email => email.priority === 'critical' && !email.archived).length;
  const unreadMessages = messages.filter(message => message.status === 'unread').length;
  const highPriorityMessages = messages.filter(message => message.priority === 'high').length;

  const handleItemSelect = async (item: any) => {
    setSelectedItem(item);
    
    // Analyze content if it's an email or message
    if (item.content) {
      try {
        await analyzeContent(item.content, item.type || 'email');
      } catch (error) {
        console.error('Failed to analyze content:', error);
      }
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'emails') {
      refreshEmails();
    } else if (activeTab === 'messages') {
      refreshMessages();
    }
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Typography variant="h1" className="text-2xl font-bold text-gray-900">
                Dashboard
              </Typography>
              
              {/* Real-time status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${realtimeConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <Typography variant="span" className="text-gray-500 text-xs">
                  {realtimeConnected ? 'Live' : 'Offline'}
                </Typography>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={emailsLoading || messagesLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${(emailsLoading || messagesLoading) ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <Typography variant="h3" className="text-2xl font-bold text-gray-900">
                    {emails.length}
                  </Typography>
                  <Typography variant="span" className="text-gray-500 text-xs">
                    Total Emails
                  </Typography>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <Typography variant="h3" className="text-2xl font-bold text-gray-900">
                    {unreadEmails}
                  </Typography>
                  <Typography variant="span" className="text-gray-500 text-xs">
                    Unread Emails
                  </Typography>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <Typography variant="h3" className="text-2xl font-bold text-gray-900">
                    {messages.length}
                  </Typography>
                  <Typography variant="span" className="text-gray-500 text-xs">
                    Slack Messages
                  </Typography>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <Typography variant="h3" className="text-2xl font-bold text-gray-900">
                    {realtimeUpdates.length}
                  </Typography>
                  <Typography variant="span" className="text-gray-500 text-xs">
                    Real-time Updates
                  </Typography>
                </div>
              </div>
            </Card>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 px-6">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('emails')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'emails'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Emails</span>
                    {unreadEmails > 0 && (
                      <Badge className="text-xs bg-gray-100 border-gray-300">
                        {unreadEmails}
                      </Badge>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('messages')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'messages'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Messages</span>
                    {unreadMessages > 0 && (
                      <Badge className="text-xs bg-gray-100 border-gray-300">
                        {unreadMessages}
                      </Badge>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('ai')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'ai'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>AI Analysis</span>
                    {lastAnalysis && (
                      <Badge className="text-xs bg-gray-100 border-gray-300">
                        New
                      </Badge>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              {activeTab === 'emails' && (
                <div className="space-y-4">
                  {emailsError ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <Typography variant="h3" className="text-gray-900 mb-2">
                        Error Loading Emails
                      </Typography>
                      <Typography variant="body" className="text-gray-600 mb-4">
                        {emailsError}
                      </Typography>
                      <Button onClick={refreshEmails} variant="outline">
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <EmailList
                      status="unread"
                      limit={20}
                      showFilters={true}
                      className="space-y-3"
                    />
                  )}
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="space-y-4">
                  {messagesError ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <Typography variant="h3" className="text-gray-900 mb-2">
                        Error Loading Messages
                      </Typography>
                      <Typography variant="body" className="text-gray-600 mb-4">
                        {messagesError}
                      </Typography>
                      <Button onClick={refreshMessages} variant="outline">
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messagesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mr-2" />
                          <Typography variant="body" className="text-gray-600">
                            Loading messages...
                          </Typography>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <Typography variant="h3" className="text-gray-900 mb-2">
                            No messages found
                          </Typography>
                          <Typography variant="body" className="text-gray-600">
                            Connect your Slack workspace to see messages here.
                          </Typography>
                        </div>
                      ) : (
                        messages.map((message) => {
                          // Map to SlackMessage type
                          const slackMessage = {
                            id: message.id,
                            channel: message.channelId || '',
                            channelName: message.channelName || '',
                            text: message.content || '',
                            user: message.sender?.id || '',
                            userName: message.sender?.name || '',
                            timestamp: typeof message.timestamp === 'string' ? message.timestamp : (message.timestamp ? message.timestamp.toISOString() : ''),
                            reactions: Array.isArray(message.reactions)
                              ? message.reactions.map(r => ({ name: r.emoji, count: r.count, users: [] }))
                              : undefined,
                            priority: message.priority,
                          };
                          return (
                            <MessageCard
                              key={slackMessage.id}
                              message={slackMessage}
                              onClick={() => handleItemSelect(slackMessage)}
                            />
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="space-y-4">
                  {aiError ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <Typography variant="h3" className="text-gray-900 mb-2">
                        AI Analysis Error
                      </Typography>
                      <Typography variant="body" className="text-gray-600 mb-4">
                        {aiError}
                      </Typography>
                    </div>
                  ) : lastAnalysis ? (
                    <Card className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Typography variant="h3" className="text-lg font-semibold">
                            AI Analysis
                          </Typography>
                          <Badge className="capitalize bg-gray-100 border-gray-300">
                            {lastAnalysis.sentiment}
                          </Badge>
                        </div>
                        
                        <div>
                          <Typography variant="body" className="font-medium mb-2">
                            Summary
                          </Typography>
                          <Typography variant="body" className="text-gray-700">
                            {lastAnalysis.summary}
                          </Typography>
                        </div>

                        {lastAnalysis.keyPoints.length > 0 && (
                          <div>
                            <Typography variant="body" className="font-medium mb-2">
                              Key Points
                            </Typography>
                            <ul className="space-y-1">
                              {lastAnalysis.keyPoints.map((point, index) => (
                                <li key={index} className="text-sm text-gray-700">
                                  • {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {lastAnalysis.suggestedActions.length > 0 && (
                          <div>
                            <Typography variant="body" className="font-medium mb-2">
                              Suggested Actions
                            </Typography>
                            <ul className="space-y-1">
                              {lastAnalysis.suggestedActions.map((action, index) => (
                                <li key={index} className="text-sm text-gray-700">
                                  • {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {lastAnalysis.replySuggestion && (
                          <div>
                            <Typography variant="body" className="font-medium mb-2">
                              Reply Suggestion
                            </Typography>
                            <div className="bg-gray-50 p-3 rounded-md">
                              <Typography variant="body" className="text-gray-700 text-sm">
                                {lastAnalysis.replySuggestion}
                              </Typography>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <Typography variant="h3" className="text-gray-900 mb-2">
                        No AI Analysis
                      </Typography>
                      <Typography variant="body" className="text-gray-600">
                        Select an email or message to see AI analysis.
                      </Typography>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Context Panel */}
          <ContextPanel />
        </div>
      </div>
    </div>
  );
} 