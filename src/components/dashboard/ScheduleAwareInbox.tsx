'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Sun, Moon, Coffee, Briefcase, Home, Star, Filter, SortDesc } from 'lucide-react';
import { Email, SlackMessage } from '@/types';

interface ScheduleAwareInboxProps {
  emails: Email[];
  messages: SlackMessage[];
  onItemClick: (item: Email | SlackMessage) => void;
  className?: string;
}

interface TimeGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  period: string;
  items: (Email | SlackMessage)[];
  color: string;
  bgColor: string;
}

interface BehaviorFilter {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
}

export default function ScheduleAwareInbox({ emails, messages, onItemClick, className = '' }: ScheduleAwareInboxProps) {
  const [timeGroups, setTimeGroups] = useState<TimeGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [behaviorFilters, setBehaviorFilters] = useState<BehaviorFilter[]>([
    {
      id: 'vip',
      label: 'VIP Only',
      description: 'Show only VIP communications',
      icon: <Star className="w-4 h-4" />,
      active: false
    },
    {
      id: 'urgent',
      label: 'Urgent',
      description: 'Time-sensitive items',
      icon: <Clock className="w-4 h-4" />,
      active: false
    },
    {
      id: 'unread',
      label: 'Unread',
      description: 'Unread items only',
      icon: <Filter className="w-4 h-4" />,
      active: true
    }
  ]);
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'sender'>('time');

  useEffect(() => {
    organizeByTimeGroups();
  }, [emails, messages, behaviorFilters, sortBy]);

  const organizeByTimeGroups = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Combine and filter items
    const allItems = [...emails, ...messages].filter(item => {
      const matchesFilters = behaviorFilters.every(filter => {
        if (!filter.active) return true;
        
        switch (filter.id) {
          case 'vip':
            return isVIPItem(item);
          case 'urgent':
            return isUrgentItem(item);
          case 'unread':
            return !item.read;
          default:
            return true;
        }
      });
      
      return matchesFilters;
    });

    // Sort items
    const sortedItems = [...allItems].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
        case 'sender':
          const senderA = (a as Email).from || (a as SlackMessage).user || '';
          const senderB = (b as Email).from || (b as SlackMessage).user || '';
          return senderA.localeCompare(senderB);
        case 'time':
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

    // Group by time periods
    const groups: TimeGroup[] = [
      {
        id: 'morning',
        label: 'Morning Focus',
        icon: <Sun className="w-4 h-4" />,
        period: '6:00 AM - 12:00 PM',
        items: [],
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      },
      {
        id: 'afternoon',
        label: 'Afternoon Execution',
        icon: <Briefcase className="w-4 h-4" />,
        period: '12:00 PM - 6:00 PM',
        items: [],
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        id: 'evening',
        label: 'Evening Review',
        icon: <Moon className="w-4 h-4" />,
        period: '6:00 PM - 11:00 PM',
        items: [],
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      },
      {
        id: 'today',
        label: 'Today',
        icon: <Calendar className="w-4 h-4" />,
        period: 'All day',
        items: [],
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      {
        id: 'yesterday',
        label: 'Yesterday',
        icon: <Clock className="w-4 h-4" />,
        period: 'Previous day',
        items: [],
        color: 'text-gray-600',
        bgColor: 'bg-gray-50'
      },
      {
        id: 'week',
        label: 'This Week',
        icon: <Calendar className="w-4 h-4" />,
        period: 'Last 7 days',
        items: [],
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
      }
    ];

    // Categorize items by time
    sortedItems.forEach(item => {
      const itemDate = new Date(item.timestamp);
      const itemHour = itemDate.getHours();
      
      // Time of day grouping
      if (itemDate >= today) {
        groups.find(g => g.id === 'today')?.items.push(item);
        
        if (itemHour >= 6 && itemHour < 12) {
          groups.find(g => g.id === 'morning')?.items.push(item);
        } else if (itemHour >= 12 && itemHour < 18) {
          groups.find(g => g.id === 'afternoon')?.items.push(item);
        } else {
          groups.find(g => g.id === 'evening')?.items.push(item);
        }
      } else if (itemDate >= yesterday) {
        groups.find(g => g.id === 'yesterday')?.items.push(item);
      } else if (itemDate >= thisWeek) {
        groups.find(g => g.id === 'week')?.items.push(item);
      }
    });

    // Filter out empty groups
    const nonEmptyGroups = groups.filter(group => group.items.length > 0);
    setTimeGroups(nonEmptyGroups);
  };

  const isVIPItem = (item: Email | SlackMessage): boolean => {
    const sender = (item as Email).from || (item as SlackMessage).user || '';
    const vipPatterns = ['ceo', 'founder', 'board', 'investor', 'president', 'director'];
    return vipPatterns.some(pattern => sender.toLowerCase().includes(pattern));
  };

  const isUrgentItem = (item: Email | SlackMessage): boolean => {
    const content = (item as Email).subject || (item as SlackMessage).text || '';
    const urgentKeywords = ['urgent', 'asap', 'emergency', 'critical', 'deadline'];
    return urgentKeywords.some(keyword => content.toLowerCase().includes(keyword));
  };

  const getPriorityWeight = (priority: string): number => {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  const toggleFilter = (filterId: string) => {
    setBehaviorFilters(prev => 
      prev.map(filter => 
        filter.id === filterId 
          ? { ...filter, active: !filter.active }
          : filter
      )
    );
  };

  const getItemSender = (item: Email | SlackMessage): string => {
    return (item as Email).from || (item as SlackMessage).user || 'Unknown';
  };

  const getItemSubject = (item: Email | SlackMessage): string => {
    return (item as Email).subject || (item as SlackMessage).text?.substring(0, 50) + '...' || 'No subject';
  };

  const getItemTime = (item: Email | SlackMessage): string => {
    return new Date(item.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredGroups = selectedGroup === 'all' 
    ? timeGroups 
    : timeGroups.filter(group => group.id === selectedGroup);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-burgundy" />
            Schedule-Aware Inbox
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Time Group Filter */}
            <div className="flex items-center gap-2">
              <Typography variant="body2" className="text-gray-600">
                Time Period:
              </Typography>
              <select 
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Periods</option>
                {timeGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.label} ({group.items.length})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <Typography variant="body2" className="text-gray-600">
                Sort by:
              </Typography>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'time' | 'priority' | 'sender')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="time">Time</option>
                <option value="priority">Priority</option>
                <option value="sender">Sender</option>
              </select>
            </div>
          </div>

          {/* Behavior Filters */}
          <div className="flex flex-wrap gap-2">
            {behaviorFilters.map(filter => (
              <Button
                key={filter.id}
                variant={filter.active ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter(filter.id)}
                className="flex items-center gap-1"
              >
                {filter.icon}
                {filter.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Groups */}
      <div className="space-y-4">
        {filteredGroups.map(group => (
          <Card key={group.id} className={`${group.bgColor} border-l-4 border-l-brand-burgundy`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${group.bgColor} ${group.color}`}>
                    {group.icon}
                  </div>
                  <div>
                    <Typography variant="h6" className="font-semibold text-black">
                      {group.label}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {group.period} • {group.items.length} items
                    </Typography>
                  </div>
                </div>
                <Badge className="bg-brand-burgundy text-white">
                  {group.items.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {group.items.slice(0, 10).map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-brand-burgundy/30 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => onItemClick(item)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        {'subject' in item ? (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        ) : (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                        {isVIPItem(item) && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Typography variant="body1" className="font-medium text-black">
                            {getItemSender(item)}
                          </Typography>
                          <Typography variant="body2" className="text-gray-500">
                            {getItemTime(item)}
                          </Typography>
                        </div>
                        <Typography variant="body2" className="text-gray-700">
                          {getItemSubject(item)}
                        </Typography>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(item.priority || 'medium')}>
                        {item.priority || 'medium'}
                      </Badge>
                      {!item.read && (
                        <div className="w-2 h-2 bg-brand-burgundy rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
                
                {group.items.length > 10 && (
                  <Button
                    variant="ghost"
                    className="w-full mt-2 text-brand-burgundy hover:text-brand-burgundy/80"
                  >
                    Show {group.items.length - 10} more items
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Coffee className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <Typography variant="h6" className="text-gray-600 mb-2">
              No items match your filters
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              Try adjusting your time period or behavior filters
            </Typography>
          </CardContent>
        </Card>
      )}
    </div>
  );
}