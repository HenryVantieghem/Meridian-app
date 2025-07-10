'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/ui/typography';
import { 
  Mail, 
  Star, 
  StarOff, 
  Trash2, 
  Archive, 
  Clock, 
  User,
  AlertCircle,
  CheckCircle,
  Clock as ClockIcon
} from 'lucide-react';
import { Email, EmailPriority } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface EmailCardProps {
  email: Email;
  onMarkAsRead: () => void;
  onMarkAsUnread: () => void;
  onDelete: () => void;
  onUpdatePriority: (priority: EmailPriority) => void;
  className?: string;
}

export function EmailCard({ 
  email, 
  onMarkAsRead, 
  onMarkAsUnread, 
  onDelete, 
  onUpdatePriority,
  className = '' 
}: EmailCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (priority: EmailPriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: EmailPriority) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="h-4 w-4" />;
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <ClockIcon className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const handleToggleRead = () => {
    if (!email.read) {
      onMarkAsRead();
    } else {
      onMarkAsUnread();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={className}
    >
      <Card 
        className={`p-4 cursor-pointer transition-all duration-200 ${
          email.read ? 'border-l-4 border-l-primary-500 bg-blue-50' : ''
        } ${isHovered ? 'shadow-lg' : 'shadow-sm'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start space-x-3">
          {/* Sender Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* Email Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Typography variant="body" className="font-medium text-gray-900 truncate">
                    {email.from.name}
                  </Typography>
                  {!email.read && (
                    <Badge className="text-xs bg-gray-100 border-gray-300">
                      New
                    </Badge>
                  )}
                </div>
                
                <Typography variant="body" className="font-semibold text-gray-900 mb-1 truncate">
                  {email.subject}
                </Typography>
                
                <Typography variant="body" className="text-gray-600 text-sm line-clamp-2">
                  {email.body.length > 120 ? email.body.slice(0, 120) + '…' : email.body}
                </Typography>

                {/* Expanded content */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-gray-200"
                  >
                    <Typography variant="body" className="text-gray-700 text-sm whitespace-pre-wrap">
                      {email.body}
                    </Typography>
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleRead();
                  }}
                  className="h-8 w-8 p-0"
                >
                  {!email.read ? (
                    <Star className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <StarOff className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <Badge className={`text-xs ${getPriorityColor(email.priority)}`}>
                  {getPriorityIcon(email.priority)}
                  <span className="ml-1 capitalize">{email.priority}</span>
                </Badge>
                
                <Typography variant="span" className="text-gray-500 text-xs">
                  {formatDistanceToNow(new Date(email.receivedAt), { addSuffix: true })}
                </Typography>
              </div>

              {/* Priority actions */}
              <div className="flex items-center space-x-1">
                {email.priority !== 'low' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdatePriority('low');
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    Low
                  </Button>
                )}
                {email.priority !== 'medium' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdatePriority('medium');
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    Medium
                  </Button>
                )}
                {email.priority !== 'high' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdatePriority('high');
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    High
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
} 