'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Clock, Mail, MessageSquare, Users, TrendingUp, AlertTriangle, CheckCircle, Star } from 'lucide-react';
import { Email, SlackMessage } from '@/types';

interface DailyBriefProps {
  emails: Email[];
  messages: SlackMessage[];
  onItemClick: (item: Email | SlackMessage) => void;
  className?: string;
}

interface DigestItem {
  id: string;
  type: 'email' | 'slack';
  title: string;
  sender: string;
  summary: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  isVIP: boolean;
  timestamp: Date;
  actionRequired: boolean;
  confidence: number;
  category: 'strategic' | 'operational' | 'informational' | 'urgent';
}

export default function DailyBrief({ emails, messages, onItemClick, className = '' }: DailyBriefProps) {
  const [digestItems, setDigestItems] = useState<DigestItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'strategic' | 'operational' | 'informational' | 'urgent'>('all');

  useEffect(() => {
    const processItems = () => {
      const items: DigestItem[] = [];

      // Process emails
      emails.forEach(email => {
        items.push({
          id: email.id,
          type: 'email',
          title: email.subject || 'No Subject',
          sender: email.from || 'Unknown',
          summary: generateSummary(email.body || ''),
          priority: determinePriority(email),
          isVIP: isVIPContact(email.from || ''),
          timestamp: new Date(email.timestamp),
          actionRequired: requiresAction(email),
          confidence: calculateConfidence(email),
          category: categorizeItem(email)
        });
      });

      // Process Slack messages
      messages.forEach(message => {
        items.push({
          id: message.id,
          type: 'slack',
          title: message.text.slice(0, 50) + '...',
          sender: message.user || 'Unknown',
          summary: generateSummary(message.text),
          priority: determinePriority(message),
          isVIP: isVIPContact(message.user || ''),
          timestamp: new Date(message.timestamp),
          actionRequired: requiresAction(message),
          confidence: calculateConfidence(message),
          category: categorizeItem(message)
        });
      });

      // Sort by priority and timestamp
      items.sort((a, b) => {
        const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
        if (a.priority !== b.priority) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      setDigestItems(items);
    };

    processItems();
  }, [emails, messages]);

  const generateSummary = (content: string): string => {
    // Simple AI-style summarization (in real app, this would use GPT-4)
    const sentences = content.split('.').filter(s => s.length > 10);
    return sentences.slice(0, 2).join('.') + (sentences.length > 2 ? '...' : '');
  };

  const determinePriority = (item: any): 'critical' | 'high' | 'medium' | 'low' => {
    // AI-driven priority scoring logic
    const urgentKeywords = ['urgent', 'asap', 'emergency', 'critical', 'deadline'];
    const highKeywords = ['important', 'meeting', 'decision', 'approve', 'review'];
    
    const content = (item.subject || item.text || '').toLowerCase();
    
    if (urgentKeywords.some(keyword => content.includes(keyword))) return 'critical';
    if (highKeywords.some(keyword => content.includes(keyword))) return 'high';
    if (item.priority === 'high' || item.priority === 'critical') return item.priority;
    
    return 'medium';
  };

  const isVIPContact = (contact: string): boolean => {
    // VIP detection logic (in real app, this would check against user's VIP list)
    const vipDomains = ['ceo@', 'founder@', 'president@'];
    return vipDomains.some(domain => contact.toLowerCase().includes(domain));
  };

  const requiresAction = (item: any): boolean => {
    const actionKeywords = ['please', 'can you', 'need', 'request', 'approve', 'review', 'decision'];
    const content = (item.subject || item.text || '').toLowerCase();
    return actionKeywords.some(keyword => content.includes(keyword));
  };

  const calculateConfidence = (item: any): number => {
    // AI confidence scoring (0-100)
    return Math.floor(Math.random() * 30) + 70; // Mock 70-100% confidence
  };

  const categorizeItem = (item: any): 'strategic' | 'operational' | 'informational' | 'urgent' => {
    const content = (item.subject || item.text || '').toLowerCase();
    
    if (content.includes('strategy') || content.includes('planning') || content.includes('roadmap')) return 'strategic';
    if (content.includes('urgent') || content.includes('asap') || content.includes('emergency')) return 'urgent';
    if (content.includes('meeting') || content.includes('task') || content.includes('project')) return 'operational';
    
    return 'informational';
  };

  const filteredItems = selectedCategory === 'all' 
    ? digestItems 
    : digestItems.filter(item => item.category === selectedCategory);

  const stats = {
    total: digestItems.length,
    critical: digestItems.filter(item => item.priority === 'critical').length,
    vip: digestItems.filter(item => item.isVIP).length,
    actionRequired: digestItems.filter(item => item.actionRequired).length
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'priority-critical';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strategic': return <TrendingUp className="w-4 h-4" />;
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      case 'operational': return <CheckCircle className="w-4 h-4" />;
      case 'informational': return <Users className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Strategic Overview */}
      <Card className="strategic-digest-card">
        <CardHeader>
          <CardTitle className="text-headline-cartier flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-burgundy" />
            Strategic Daily Brief
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-burgundy">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
              <div className="text-sm text-gray-600">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.vip}</div>
              <div className="text-sm text-gray-600">VIP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.actionRequired}</div>
              <div className="text-sm text-gray-600">Action Required</div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 mb-4">
            {['all', 'strategic', 'urgent', 'operational', 'informational'].map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category as any)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Digest Items */}
      <div className="space-y-4">
        {filteredItems.slice(0, 10).map(item => (
          <Card 
            key={item.id} 
            className="daily-brief-card cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => onItemClick(item as any)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(item.category)}
                      <Typography variant="h6" className="font-semibold text-black">
                        {item.title}
                      </Typography>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className={`priority-indicator ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </Badge>
                      {item.isVIP && (
                        <Badge className="vip-indicator">
                          <Star className="w-3 h-3 mr-1" />
                          VIP
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {item.type === 'email' ? (
                        <Mail className="w-4 h-4 text-gray-500" />
                      ) : (
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                      )}
                      <Typography variant="body2" className="text-gray-600">
                        {item.sender}
                      </Typography>
                    </div>
                    <div className="text-gray-400">•</div>
                    <Typography variant="body2" className="text-gray-500">
                      {new Date(item.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                  </div>

                  <Typography variant="body2" className="text-gray-700 mb-2">
                    {item.summary}
                  </Typography>

                  {item.actionRequired && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <AlertTriangle className="w-4 h-4" />
                      <Typography variant="body2" className="font-medium">
                        Action Required
                      </Typography>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-xs text-gray-500">
                    {item.confidence}% confidence
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-8 px-3">
                      AI Reply
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 px-3">
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="daily-brief-card">
          <CardContent className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <Typography variant="h6" className="text-gray-700 mb-2">
              Inbox Zero Achieved
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              All strategic communications have been processed
            </Typography>
          </CardContent>
        </Card>
      )}
    </div>
  );
}