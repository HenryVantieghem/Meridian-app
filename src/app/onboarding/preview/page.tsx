'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Typography } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Sparkles, 
  CheckCircle, 
  Clock,
  Star,
  Zap,
  ArrowRight,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface EmailPreview {
  id: string;
  from: string;
  subject: string;
  preview: string;
  priority: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'urgent' | 'normal' | 'low';
  aiSummary: string;
  suggestedResponse?: string;
}

const mockEmails: EmailPreview[] = [
  {
    id: '1',
    from: 'sarah.chen@techflow.com',
    subject: 'Q4 Strategy Meeting - Your Input Needed',
    preview: 'Hi there, I wanted to discuss the Q4 strategy and get your thoughts on the new initiatives...',
    priority: 'high',
    sentiment: 'positive',
    urgency: 'urgent',
    aiSummary: 'Strategic discussion request from CEO. Requires immediate attention and thoughtful response.',
    suggestedResponse: 'I appreciate you reaching out about the Q4 strategy. I\'d be happy to discuss the new initiatives and share my thoughts. When would be a good time for us to connect?'
  },
  {
    id: '2',
    from: 'mike.rodriguez@globalcorp.com',
    subject: 'Project Update - Phase 2 Complete',
    preview: 'Great news! We\'ve successfully completed Phase 2 of the project ahead of schedule...',
    priority: 'medium',
    sentiment: 'positive',
    urgency: 'normal',
    aiSummary: 'Positive project update. Good to acknowledge but not urgent.',
    suggestedResponse: 'Excellent work on completing Phase 2 ahead of schedule! This is great progress. Looking forward to seeing the results.'
  },
  {
    id: '3',
    from: 'support@napoleon.ai',
    subject: 'Welcome to Napoleon - Getting Started',
    preview: 'Welcome to Napoleon! We\'re excited to help you transform your email workflow...',
    priority: 'low',
    sentiment: 'positive',
    urgency: 'low',
    aiSummary: 'Welcome email from Napoleon. Informational only.',
    suggestedResponse: 'Thank you for the warm welcome! I\'m excited to get started with Napoleon and see how it can improve my email workflow.'
  }
];

const priorityColors = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-yellow-600 bg-yellow-50',
  low: 'text-green-600 bg-green-50'
};

const urgencyIcons = {
  urgent: Zap,
  normal: Clock,
  low: Star
};

export default function PreviewPage() {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [showEmails, setShowEmails] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    // Simulate connection process
    if (connectionStatus === 'idle') {
      setConnectionStatus('connecting');
      setTimeout(() => {
        setConnectionStatus('connected');
        setTimeout(() => {
          setShowEmails(true);
          setTimeout(() => {
            setShowCelebration(true);
          }, 2000);
        }, 1000);
      }, 2000);
    }
  }, [connectionStatus]);

  const handleConnectGmail = () => {
    setConnectionStatus('connecting');
    // In real implementation, this would trigger OAuth flow
  };

  const handleConnectOutlook = () => {
    setConnectionStatus('connecting');
    // In real implementation, this would trigger OAuth flow
  };

  const handleContinueToDashboard = () => {
    router.push('/dashboard');
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Unknown';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <Typography variant="h1" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          See the Magic
        </Typography>
        <Typography variant="body" className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connect your email account and watch Napoleon analyze your emails in real-time.
        </Typography>
      </motion.div>

      {/* Email Connection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <Mail className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <Typography variant="h3" className="text-2xl font-bold text-gray-900 mb-2">
              Connect Your Email Account
            </Typography>
            <Typography variant="body" className="text-gray-600">
              Choose your email provider to get started
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Button
              size="lg"
              onClick={handleConnectGmail}
              disabled={connectionStatus !== 'idle'}
              className="flex items-center justify-center space-x-2 p-6"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Connect Gmail</span>
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={handleConnectOutlook}
              disabled={connectionStatus !== 'idle'}
              className="flex items-center justify-center space-x-2 p-6"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Connect Outlook</span>
            </Button>
          </div>

          {connectionStatus === 'connecting' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <Loader2 className="w-8 h-8 text-primary-600 mx-auto mb-2 animate-spin" />
              <Typography variant="body" className="text-gray-600">
                Connecting to your email account...
              </Typography>
            </motion.div>
          )}

          {connectionStatus === 'connected' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <Typography variant="body" className="text-green-600 font-medium">
                Successfully connected!
              </Typography>
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* AI Analysis Preview */}
      <AnimatePresence>
        {showEmails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Sparkles className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <Typography variant="h3" className="text-2xl font-bold text-gray-900 mb-2">
                AI Analysis Complete
              </Typography>
              <Typography variant="body" className="text-gray-600">
                Here&apos;s how Napoleon prioritized your emails
              </Typography>
            </div>

            <div className="space-y-4">
              {mockEmails.map((email, index) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card 
                    className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                      selectedEmail === email.id ? 'ring-2 ring-brand-burgundy' : ''
                    }`}
                    onClick={() => setSelectedEmail(selectedEmail === email.id ? null : email.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[email.priority]}`}>
                            {getPriorityLabel(email.priority)}
                          </span>
                          {urgencyIcons[email.urgency as keyof typeof urgencyIcons] && 
                            React.createElement(urgencyIcons[email.urgency as keyof typeof urgencyIcons], { className: "w-4 h-4 text-gray-500" })
                          }
                        </div>
                        
                        <Typography variant="h4" className="text-lg font-semibold text-gray-900 mb-1">
                          {email.subject}
                        </Typography>
                        
                        <Typography variant="body" className="text-sm text-gray-600 mb-2">
                          From: {email.from}
                        </Typography>
                        
                        <Typography variant="body" className="text-gray-700 mb-3">
                          {email.preview}
                        </Typography>

                        {selectedEmail === email.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 p-4 bg-gray-50 rounded-lg"
                          >
                            <Typography variant="body" className="font-semibold text-gray-900 mb-2">
                              AI Analysis:
                            </Typography>
                            <Typography variant="body" className="text-sm text-gray-700 mb-3">
                              {email.aiSummary}
                            </Typography>
                            
                            {email.suggestedResponse && (
                              <>
                                <Typography variant="body" className="font-semibold text-gray-900 mb-2">
                                  Suggested Response:
                                </Typography>
                                <Typography variant="body" className="text-sm text-gray-700">
                                  {email.suggestedResponse}
                                </Typography>
                              </>
                            )}
                          </motion.div>
                        )}
                      </div>
                      
                      <ArrowRight className={`w-5 h-5 text-gray-400 transition-transform ${
                        selectedEmail === email.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mt-12"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 0.6, repeat: 2 }}
              className="inline-block"
            >
              <Sparkles className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            </motion.div>
            
            <Typography variant="h3" className="text-2xl font-bold text-gray-900 mb-4">
              🎉 You&apos;re All Set!
            </Typography>
            
            <Typography variant="body" className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Napoleon is now analyzing your emails and will help you stay focused on what matters most. 
              Your personalized dashboard is ready!
            </Typography>
            
            <Button size="lg" onClick={handleContinueToDashboard} className="px-8 py-3">
              Go to Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 