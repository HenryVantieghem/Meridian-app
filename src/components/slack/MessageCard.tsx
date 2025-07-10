import React from 'react';
import { motion } from 'framer-motion';
import { SlackMessage } from '@/lib/integrations/slack';
import { formatDate } from '@/lib/utils';

interface MessageCardProps {
  message: SlackMessage;
  onReply?: (message: SlackMessage) => void;
  onReact?: (message: SlackMessage, reaction: string) => void;
  isSelected?: boolean;
  onClick?: () => void;
}

export const MessageCard: React.FC<MessageCardProps> = ({
  message,
  onReply,
  onReact,
  isSelected = false,
  onClick,
}) => {
  const handleReply = () => {
    onReply?.(message);
  };

  const handleReact = (reaction: string) => {
    onReact?.(message, reaction);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative p-4 bg-white border border-gray-200 rounded-lg shadow-sm
        cursor-pointer transition-all duration-200
        ${isSelected ? 'ring-2 ring-gold border-gold' : 'hover:border-gray-300'}
      `}
      onClick={onClick}
    >
      {/* Message Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {message.userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {message.userName}
            </p>
            <p className="text-xs text-gray-500">
              #{message.channelName} • {formatDate(new Date(message.timestamp))}
            </p>
          </div>
        </div>
        
        {/* Platform Badge */}
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-500">Slack</span>
        </div>
      </div>

      {/* Message Content */}
      <div className="mb-3">
        <p className="text-sm text-gray-800 leading-relaxed">
          {message.text}
        </p>
      </div>

      {/* Attachments */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="mb-3 space-y-2">
          {message.attachments.map((attachment, index) => (
            <div key={index} className="p-2 bg-gray-50 rounded border">
              {attachment.title && (
                <p className="text-xs font-medium text-gray-700 mb-1">
                  {attachment.title}
                </p>
              )}
              {attachment.text && (
                <p className="text-xs text-gray-600">
                  {attachment.text}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reactions */}
      {message.reactions && message.reactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {message.reactions.map((reaction, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                handleReact(reaction.name);
              }}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs transition-colors"
            >
              {reaction.name} {reaction.count}
            </button>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReply();
            }}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Reply
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReact('thumbsup');
            }}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            👍
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReact('heart');
            }}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            ❤️
          </button>
        </div>

        {/* Thread Indicator */}
        {message.threadTs && (
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <span className="text-xs text-gray-400">Thread</span>
          </div>
        )}
      </div>

      {/* Priority Indicator */}
      <div className="absolute top-2 right-2">
        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
      </div>
    </motion.div>
  );
}; 