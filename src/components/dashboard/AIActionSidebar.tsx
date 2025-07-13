'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  CheckCircle, 
  Clock, 
  User, 
  Send, 
  Calendar, 
  Users, 
  AlertTriangle,
  Zap,
  Filter,
  Plus
} from 'lucide-react';
import { ActionItem } from '@/lib/ai/analyze';

interface AIActionSidebarProps {
  className?: string;
}

const mockActionItems: ActionItem[] = [
  {
    id: '1',
    type: 'urgent',
    title: 'Reply to CEO about Q4 budget',
    description: 'Urgent response needed regarding budget approval for Q4 initiatives',
    priority: 'high',
    dueDate: '2024-01-15',
    assignee: 'You',
    emailId: 'email-1'
  },
  {
    id: '2',
    type: 'schedule',
    title: 'Schedule team meeting',
    description: 'Coordinate with marketing team for product launch planning',
    priority: 'medium',
    dueDate: '2024-01-16',
    assignee: 'You',
    emailId: 'email-2'
  },
  {
    id: '3',
    type: 'delegate',
    title: 'Review design mockups',
    description: 'Forward design files to Sarah for final approval',
    priority: 'medium',
    dueDate: '2024-01-17',
    assignee: 'Sarah',
    emailId: 'email-3'
  },
  {
    id: '4',
    type: 'follow-up',
    title: 'Follow up on client proposal',
    description: 'Check in with client about proposal sent last week',
    priority: 'low',
    dueDate: '2024-01-20',
    assignee: 'You',
    emailId: 'email-4'
  },
  {
    id: '5',
    type: 'reply',
    title: 'Respond to vendor inquiry',
    description: 'Provide pricing information for enterprise license',
    priority: 'medium',
    dueDate: '2024-01-18',
    assignee: 'You',
    emailId: 'email-5'
  }
];

const priorityColors = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  low: 'text-green-600 bg-green-50 border-green-200',
};

const typeIcons = {
  urgent: AlertTriangle,
  reply: Send,
  schedule: Calendar,
  delegate: Users,
  'follow-up': Clock,
};

const typeColors = {
  urgent: 'text-red-600',
  reply: 'text-blue-600',
  schedule: 'text-purple-600',
  delegate: 'text-orange-600',
  'follow-up': 'text-gray-600',
};

export function AIActionSidebar({ className = '' }: AIActionSidebarProps) {
  const [actionItems, setActionItems] = useState<ActionItem[]>(mockActionItems);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ActionItem['type']>('all');

  const filteredItems = actionItems.filter(item => {
    const priorityMatch = filter === 'all' || item.priority === filter;
    const typeMatch = typeFilter === 'all' || item.type === typeFilter;
    return priorityMatch && typeMatch;
  });

  const handleComplete = (id: string) => {
    setActionItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSnooze = (id: string) => {
    // Add snooze logic here
    console.log('Snooze action:', id);
  };

  const getPriorityCount = (priority: 'high' | 'medium' | 'low') => {
    return actionItems.filter(item => item.priority === priority).length;
  };



  return (
    <div className={`w-80 bg-white border-l border-cartier-200 p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-cartier-900">Action Items</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-cartier-600 hover:text-cartier-900"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-cartier-600">
          <Zap className="w-4 h-4" />
          <span>AI-extracted from your messages</span>
        </div>
      </div>

      {/* Priority Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-lg bg-red-50 border border-red-200">
          <div className="text-lg font-semibold text-red-600">{getPriorityCount('high')}</div>
          <div className="text-xs text-red-600">High</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-yellow-50 border border-yellow-200">
          <div className="text-lg font-semibold text-yellow-600">{getPriorityCount('medium')}</div>
          <div className="text-xs text-yellow-600">Medium</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-green-50 border border-green-200">
          <div className="text-lg font-semibold text-green-600">{getPriorityCount('low')}</div>
          <div className="text-xs text-green-600">Low</div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-cartier-600" />
          <span className="text-sm font-medium text-cartier-700">Filters</span>
        </div>
        
        {/* Priority Filter */}
        <div className="flex space-x-1">
          {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
            <Button
              key={priority}
              variant={filter === priority ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(priority)}
              className={`text-xs ${
                filter === priority 
                  ? 'bg-brand-burgundy text-white' 
                  : 'text-cartier-600 hover:text-cartier-900'
              }`}
            >
              {priority === 'all' ? 'All' : priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex flex-wrap gap-1">
          {(['all', 'urgent', 'reply', 'schedule', 'delegate', 'follow-up'] as const).map((type) => (
            <Button
              key={type}
              variant={typeFilter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(type)}
              className={`text-xs ${
                typeFilter === type 
                  ? 'bg-brand-burgundy text-white' 
                  : 'text-cartier-600 hover:text-cartier-900'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Action Items List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredItems.map((item) => {
            const TypeIcon = typeIcons[item.type];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="group"
              >
                <Card className="p-4 space-y-3 hover:shadow-md transition-all duration-200">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <TypeIcon className={`w-4 h-4 ${typeColors[item.type]}`} />
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${priorityColors[item.priority]}`}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSnooze(item.id)}
                        className="w-6 h-6 p-0 text-cartier-600 hover:text-cartier-900"
                      >
                        <Clock className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleComplete(item.id)}
                        className="w-6 h-6 p-0 text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-cartier-900 text-sm">{item.title}</h3>
                    <p className="text-xs text-cartier-600">{item.description}</p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-cartier-500">
                    <div className="flex items-center space-x-2">
                      <User className="w-3 h-3" />
                      <span>{item.assignee}</span>
                    </div>
                    {item.dueDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-cartier-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-cartier-300" />
            <p className="text-sm">No action items match your filters</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-cartier-200">
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-cartier-600 hover:text-cartier-900"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule all meetings
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-cartier-600 hover:text-cartier-900"
          >
            <Send className="w-4 h-4 mr-2" />
            Draft quick replies
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-cartier-600 hover:text-cartier-900"
          >
            <Users className="w-4 h-4 mr-2" />
            Delegate tasks
          </Button>
        </div>
      </div>
    </div>
  );
} 