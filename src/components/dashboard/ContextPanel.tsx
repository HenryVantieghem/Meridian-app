'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Building,
  Star,
  MessageSquare,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Link,
  MoreHorizontal
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  avatar: string;
  relationship: 'colleague' | 'client' | 'partner' | 'vendor';
  priority: 'high' | 'medium' | 'low';
  lastContact: string;
  contactFrequency: string;
  location: string;
  phone?: string;
}

interface Conversation {
  id: string;
  subject: string;
  date: string;
  type: 'email' | 'meeting' | 'call';
  summary: string;
}

const mockContact: Contact = {
  id: '1',
  name: 'Sarah Chen',
  email: 'sarah.chen@techflow.com',
  company: 'TechFlow Inc.',
  role: 'CEO',
  avatar: '/avatars/sarah-chen.jpg',
  relationship: 'client',
  priority: 'high',
  lastContact: '2 hours ago',
  contactFrequency: 'Weekly',
  location: 'San Francisco, CA',
  phone: '+1 (555) 123-4567'
};

const mockConversations: Conversation[] = [
  {
    id: '1',
    subject: 'Q4 Strategy Meeting - Your Input Needed',
    date: '2 hours ago',
    type: 'email',
    summary: 'Strategic discussion request for Q4 planning and new initiatives.'
  },
  {
    id: '2',
    subject: 'Monthly Check-in Call',
    date: '1 week ago',
    type: 'call',
    summary: 'Regular monthly check-in to discuss ongoing projects and upcoming milestones.'
  },
  {
    id: '3',
    subject: 'Project Timeline Review',
    date: '2 weeks ago',
    type: 'meeting',
    summary: 'Reviewed project timelines and discussed potential delays and solutions.'
  },
  {
    id: '4',
    subject: 'Contract Renewal Discussion',
    date: '1 month ago',
    type: 'email',
    summary: 'Discussed contract renewal terms and pricing for the upcoming year.'
  }
];

const relationshipColors = {
  colleague: 'text-blue-600 bg-blue-50',
  client: 'text-green-600 bg-green-50',
  partner: 'text-purple-600 bg-purple-50',
  vendor: 'text-orange-600 bg-orange-50'
};

const priorityColors = {
  high: 'text-red-600',
  medium: 'text-yellow-600',
  low: 'text-green-600'
};

export function ContextPanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'conversations' | 'actions'>('overview');

  const getRelationshipLabel = (relationship: string) => {
    switch (relationship) {
      case 'colleague': return 'Colleague';
      case 'client': return 'Client';
      case 'partner': return 'Partner';
      case 'vendor': return 'Vendor';
      default: return 'Unknown';
    }
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <Typography variant="h3" className="text-lg font-semibold text-gray-900 mb-2">
          Contact Intelligence
        </Typography>
        <Typography variant="body" className="text-sm text-gray-600">
          Context and insights for selected contact
        </Typography>
      </div>

      {/* Contact Info */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <Typography variant="body" className="text-white font-semibold text-xl">
              {mockContact.name.charAt(0)}
            </Typography>
          </div>
          <div className="flex-1">
            <Typography variant="h4" className="text-lg font-semibold text-gray-900">
              {mockContact.name}
            </Typography>
            <Typography variant="body" className="text-sm text-gray-600">
              {mockContact.role} at {mockContact.company}
            </Typography>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Mail className="w-4 h-4 text-gray-500" />
            <Typography variant="body" className="text-sm text-gray-700">
              {mockContact.email}
            </Typography>
          </div>
          
          {mockContact.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <Typography variant="body" className="text-sm text-gray-700">
                {mockContact.phone}
              </Typography>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <MapPin className="w-4 h-4 text-gray-500" />
            <Typography variant="body" className="text-sm text-gray-700">
              {mockContact.location}
            </Typography>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${relationshipColors[mockContact.relationship]}`}>
            {getRelationshipLabel(mockContact.relationship)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[mockContact.priority]}`}>
            {getPriorityLabel(mockContact.priority)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'conversations', label: 'History', icon: MessageSquare },
          { id: 'actions', label: 'Actions', icon: TrendingUp }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6 space-y-6"
            >
              {/* Relationship Insights */}
              <Card className="p-4">
                <Typography variant="h4" className="text-sm font-semibold text-gray-900 mb-3">
                  Relationship Insights
                </Typography>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Contact</span>
                    <span className="text-sm font-medium text-gray-900">{mockContact.lastContact}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Contact Frequency</span>
                    <span className="text-sm font-medium text-gray-900">{mockContact.contactFrequency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Response Rate</span>
                    <span className="text-sm font-medium text-green-600">95%</span>
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="p-4">
                <Typography variant="h4" className="text-sm font-semibold text-gray-900 mb-3">
                  Communication Stats
                </Typography>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <Typography variant="body" className="text-2xl font-bold text-gray-900">
                      12
                    </Typography>
                    <Typography variant="body" className="text-xs text-gray-600">
                      Emails This Month
                    </Typography>
                  </div>
                  <div className="text-center">
                    <Typography variant="body" className="text-2xl font-bold text-gray-900">
                      3
                    </Typography>
                    <Typography variant="body" className="text-xs text-gray-600">
                      Meetings This Month
                    </Typography>
                  </div>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-4">
                <Typography variant="h4" className="text-sm font-semibold text-gray-900 mb-3">
                  Recent Activity
                </Typography>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <Typography variant="body" className="text-sm text-gray-700">
                      Email sent 2 hours ago
                    </Typography>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <Typography variant="body" className="text-sm text-gray-700">
                      Meeting scheduled for tomorrow
                    </Typography>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <Typography variant="body" className="text-sm text-gray-700">
                      Contract updated 1 week ago
                    </Typography>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'conversations' && (
            <motion.div
              key="conversations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6 space-y-4"
            >
              {mockConversations.map((conversation, index) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Typography variant="body" className="font-semibold text-gray-900">
                        {conversation.subject}
                      </Typography>
                      <div className="flex items-center space-x-2">
                        {conversation.type === 'email' && <Mail className="w-4 h-4 text-gray-500" />}
                        {conversation.type === 'call' && <Phone className="w-4 h-4 text-gray-500" />}
                        {conversation.type === 'meeting' && <Calendar className="w-4 h-4 text-gray-500" />}
                      </div>
                    </div>
                    <Typography variant="body" className="text-sm text-gray-600 mb-2">
                      {conversation.summary}
                    </Typography>
                    <Typography variant="body" className="text-xs text-gray-500">
                      {conversation.date}
                    </Typography>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'actions' && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6 space-y-4"
            >
              <Typography variant="h4" className="text-sm font-semibold text-gray-900 mb-4">
                Quick Actions
              </Typography>
              
              <div className="space-y-3">
                <Button className="w-full justify-start space-x-3" size="sm">
                  <Mail className="w-4 h-4" />
                  <span>Send Email</span>
                </Button>
                
                <Button variant="outline" className="w-full justify-start space-x-3" size="sm">
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Meeting</span>
                </Button>
                
                <Button variant="outline" className="w-full justify-start space-x-3" size="sm">
                  <Phone className="w-4 h-4" />
                  <span>Call Contact</span>
                </Button>
                
                <Button variant="outline" className="w-full justify-start space-x-3" size="sm">
                  <FileText className="w-4 h-4" />
                  <span>View Documents</span>
                </Button>
                
                <Button variant="outline" className="w-full justify-start space-x-3" size="sm">
                  <Users className="w-4 h-4" />
                  <span>Add to Team</span>
                </Button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Typography variant="h4" className="text-sm font-semibold text-gray-900 mb-3">
                  Suggested Actions
                </Typography>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>Follow up on Q4 strategy meeting</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>Schedule monthly check-in</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>Review partnership opportunities</span>
                  </div>
                </div>
              </div>
                         </motion.div>
           )}
        </AnimatePresence>
      </div>
    </div>
  );
} 