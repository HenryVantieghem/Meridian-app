import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlackChannel } from '@/lib/integrations/slack';
import { ChevronDown, Hash, Lock } from 'lucide-react';

interface ChannelSelectorProps {
  channels: SlackChannel[];
  selectedChannel?: string;
  onChannelSelect: (channelId: string) => void;
  workspaceId: string;
  isLoading?: boolean;
}

export const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  channels,
  selectedChannel,
  onChannelSelect,
  workspaceId,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedChannelData = channels.find(c => c.id === selectedChannel);

  return (
    <div className="relative">
      {/* Channel Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="
          w-full px-4 py-2 bg-white border border-gray-200 rounded-lg
          flex items-center justify-between text-left
          hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
        "
      >
        <div className="flex items-center space-x-2">
          {selectedChannelData ? (
            <>
              {selectedChannelData.isPrivate ? (
                <Lock className="w-4 h-4 text-gray-500" />
              ) : (
                <Hash className="w-4 h-4 text-gray-500" />
              )}
              <span className="text-sm font-medium text-gray-900">
                #{selectedChannelData.name}
              </span>
              <span className="text-xs text-gray-500">
                ({selectedChannelData.memberCount} members)
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-500">
              Select a channel
            </span>
          )}
        </div>
        
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="
              absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200
              rounded-lg shadow-lg z-50 max-h-64 overflow-hidden
            "
          >
            {/* Search Input */}
            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-full px-3 py-2 text-sm border border-gray-200 rounded-md
                  focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent
                "
              />
            </div>

            {/* Channel List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredChannels.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No channels found
                </div>
              ) : (
                filteredChannels.map((channel) => (
                  <motion.button
                    key={channel.id}
                    onClick={() => {
                      onChannelSelect(channel.id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-gray-50
                      transition-colors duration-150
                      ${selectedChannel === channel.id ? 'bg-gold/10' : ''}
                    `}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {channel.isPrivate ? (
                          <Lock className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Hash className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {channel.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {channel.memberCount} members
                        </span>
                        {selectedChannel === channel.id && (
                          <div className="w-2 h-2 bg-gold rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    {channel.topic && (
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        {channel.topic}
                      </p>
                    )}
                  </motion.button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{filteredChannels.length} channels</span>
                <span>Workspace: {workspaceId}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gold rounded-full animate-spin"></div>
            <span className="text-sm text-gray-500">Loading channels...</span>
          </div>
        </div>
      )}
    </div>
  );
}; 