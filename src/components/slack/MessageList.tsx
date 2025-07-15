"use client";

import { useState } from "react";
import { MessageCard } from "./MessageCard";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { SlackMessage } from "@/types";
import { RefreshCw, AlertCircle, MessageSquare } from "lucide-react";

interface MessageListProps {
  messages: SlackMessage[];
  loading: boolean;
  error: string | null;
  onMessageSelect: (message: SlackMessage) => void;
  selectedMessage: SlackMessage | null;
  channels: Array<{
    id: string;
    name: string;
    isMember: boolean;
  }>;
  onRefresh: () => void;
}

export function MessageList({
  messages,
  loading,
  error,
  onMessageSelect,
  selectedMessage,
  channels,
  onRefresh,
}: MessageListProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>("all");

  const filteredMessages =
    selectedChannel === "all"
      ? messages
      : messages.filter((message) => message.channelId === selectedChannel);

  const handleChannelChange = (channelId: string) => {
    setSelectedChannel(channelId);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <Typography variant="h3" className="text-gray-900 mb-2">
          Error Loading Messages
        </Typography>
        <Typography variant="body" className="text-gray-600 mb-4 text-center">
          {error}
        </Typography>
        <Button onClick={onRefresh} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-500 mb-4" />
        <Typography variant="body" className="text-gray-600">
          Loading messages...
        </Typography>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
        <Typography variant="h3" className="text-gray-900 mb-2">
          No messages found
        </Typography>
        <Typography variant="body" className="text-gray-600 text-center">
          Connect your Slack workspace to see messages here.
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Channel Filter */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h3" className="text-lg font-semibold">
            Channels
          </Typography>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedChannel === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleChannelChange("all")}
          >
            All Channels
            <Badge className="ml-2">{messages.length}</Badge>
          </Button>

          {channels.map((channel) => (
            <Button
              key={channel.id}
              variant={selectedChannel === channel.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleChannelChange(channel.id)}
              disabled={!channel.isMember}
            >
              #{channel.name}
              <Badge className="ml-2">
                {messages.filter((m) => m.channelId === channel.id).length}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <Typography variant="body" className="text-gray-600">
                No messages in this channel
              </Typography>
            </div>
          ) : (
            filteredMessages.map((message) => {
              // Map SlackMessage to MessageCard expected props
              const cardMessage = {
                ...message,
                channel: message.channelId,
                text: message.content,
                user: message.sender?.id,
                userName: message.sender?.name,
                timestamp:
                  typeof message.timestamp === "string"
                    ? message.timestamp
                    : message.timestamp.toISOString(),
                reactions: Array.isArray(message.reactions)
                  ? message.reactions.map((r) => ({
                      name: r.emoji,
                      count: r.count,
                      users: r.users || [],
                    }))
                  : [],
                priority: message.priority,
              };
              return (
                <MessageCard
                  key={message.id}
                  message={cardMessage}
                  onClick={() => onMessageSelect(message)}
                  isSelected={selectedMessage?.id === message.id}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
