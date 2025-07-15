"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Email, SlackMessage } from "@/types";
import {
  X,
  Mail,
  MessageSquare,
  Clock,
  User,
  Tag,
  Paperclip,
  Brain,
  Sparkles,
  Loader2,
} from "lucide-react";

interface AIAnalysis {
  id: string;
  contentId: string;
  contentType: "email" | "slack";
  sentiment: "positive" | "negative" | "neutral";
  priority: "low" | "medium" | "high" | "urgent";
  confidence: number;
  summary: string;
  keyPoints: string[];
  suggestedActions: string[];
  replySuggestion?: string;
  tone: "formal" | "casual" | "friendly" | "professional";
  urgency: "low" | "medium" | "high";
  estimatedResponseTime: number;
  tags: string[];
  createdAt: Date;
}

interface ContextPanelProps {
  item: Email | SlackMessage | null;
  type: "emails" | "messages";
  onClose: () => void;
}

export function ContextPanel({ item, type, onClose }: ContextPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString();
  };

  const isEmail = (item: Email | SlackMessage): item is Email => {
    return "from" in item;
  };

  const handleAnalyze = async () => {
    if (!item) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const content = isEmail(item)
        ? `${item.subject}\n\n${item.body}`
        : item.content;

      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          contentType: isEmail(item) ? "email" : "slack",
          context: {
            senderInfo: isEmail(item)
              ? { name: item.from.name || "Unknown", email: item.from.email }
              : { name: item.sender.name },
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze content");
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : "Analysis failed",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-50";
      case "negative":
        return "text-red-600 bg-red-50";
      case "neutral":
        return "text-[#4A4A4A] bg-[#F8F6F0]";
      default:
        return "text-[#4A4A4A] bg-[#F8F6F0]";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-[#801B2B] bg-[rgba(128,27,43,0.1)]";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-[#4A4A4A] bg-[#F8F6F0]";
    }
  };

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#F8F6F0] rounded-full flex items-center justify-center mb-6">
            {type === "emails" ? (
              <Mail className="h-8 w-8 text-[#4A4A4A]" />
            ) : (
              <MessageSquare className="h-8 w-8 text-[#4A4A4A]" />
            )}
          </div>
          <h3 className="text-subhead-cartier text-black font-serif mb-4">
            Select Strategic Communication
          </h3>
          <p className="text-body-cartier text-[#4A4A4A]">
            Choose an email or message to view executive details and AI
            analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#F5F5F5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isEmail(item) ? (
              <Mail className="h-6 w-6 text-[#801B2B]" />
            ) : (
              <MessageSquare className="h-6 w-6 text-[#801B2B]" />
            )}
            <h3 className="text-subhead-cartier text-black font-serif">
              {isEmail(item)
                ? "Strategic Communication Details"
                : "Executive Message Details"}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-[#4A4A4A] hover:text-[#801B2B]"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Basic Info */}
          <Card variant="cartier">
            <h4 className="text-subhead-cartier text-black font-serif mb-4">
              {isEmail(item) ? item.subject : "Message"}
            </h4>

            <div className="space-y-4">
              {/* Sender/From */}
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-[#4A4A4A]" />
                <div>
                  <p className="text-body-cartier font-medium text-black">
                    {isEmail(item)
                      ? `${item.from.name || ""} ${item.from.email}`
                      : `${item.sender.name} (@${item.sender.id})`}
                  </p>
                  <p className="text-small text-[#4A4A4A]">
                    {isEmail(item) ? "From" : "Sent by"}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-[#4A4A4A]" />
                <div>
                  <p className="text-body-cartier font-medium text-black">
                    {formatDate(
                      isEmail(item) ? item.receivedAt : item.timestamp,
                    )}
                  </p>
                  <p className="text-small text-[#4A4A4A]">
                    {isEmail(item) ? "Received" : "Sent"}
                  </p>
                </div>
              </div>

              {/* Channel/To */}
              {isEmail(item) ? (
                <div className="flex items-center space-x-3">
                  <Tag className="h-5 w-5 text-[#4A4A4A]" />
                  <div>
                    <p className="text-body-cartier font-medium text-black">
                      To: {item.to.map((addr) => addr.email).join(", ")}
                    </p>
                    <p className="text-small text-[#4A4A4A]">Recipients</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Tag className="h-5 w-5 text-[#4A4A4A]" />
                  <div>
                    <p className="text-body-cartier font-medium text-black">
                      #{item.channelName}
                    </p>
                    <p className="text-small text-[#4A4A4A]">Channel</p>
                  </div>
                </div>
              )}

              {/* Priority */}
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-[#801B2B]" />
                <div>
                  <p className="text-body-cartier font-medium capitalize text-black">
                    {item.priority} priority
                  </p>
                  <p className="text-small text-[#4A4A4A]">Priority Level</p>
                </div>
              </div>

              {/* Attachments */}
              {isEmail(item) && item.attachments.length > 0 && (
                <div className="flex items-center space-x-3">
                  <Paperclip className="h-5 w-5 text-[#4A4A4A]" />
                  <div>
                    <p className="text-body-cartier font-medium text-black">
                      {item.attachments.length} attachment
                      {item.attachments.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-small text-[#4A4A4A]">Files</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Content */}
          <Card className="p-4">
            <Typography variant="h4" className="font-semibold mb-3">
              Content
            </Typography>
            <div className="prose prose-sm max-w-none">
              <Typography
                variant="body"
                className="text-gray-700 whitespace-pre-wrap"
              >
                {isEmail(item) ? item.body : item.content}
              </Typography>
            </div>
          </Card>

          {/* Status */}
          <Card className="p-4">
            <Typography variant="h4" className="font-semibold mb-3">
              Status
            </Typography>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Typography variant="body" className="text-gray-600">
                  Read
                </Typography>
                <Badge>{item.read ? "Yes" : "No"}</Badge>
              </div>

              {isEmail(item) && (
                <div className="flex items-center justify-between">
                  <Typography variant="body" className="text-gray-600">
                    Archived
                  </Typography>
                  <Badge>{item.archived ? "Yes" : "No"}</Badge>
                </div>
              )}

              {isEmail(item) && (
                <div className="flex items-center justify-between">
                  <Typography variant="body" className="text-gray-600">
                    Starred
                  </Typography>
                  <Badge>{item.starred ? "Yes" : "No"}</Badge>
                </div>
              )}
            </div>
          </Card>

          {/* AI Analysis */}
          {analysis && (
            <Card className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Brain className="h-5 w-5 text-purple-600" />
                <Typography variant="h4" className="font-semibold">
                  AI Analysis
                </Typography>
              </div>

              <div className="space-y-4">
                {/* Summary */}
                <div>
                  <Typography variant="body" className="font-medium mb-2">
                    Summary
                  </Typography>
                  <Typography variant="body" className="text-gray-700">
                    {analysis.summary}
                  </Typography>
                </div>

                {/* Key Points */}
                {analysis.keyPoints.length > 0 && (
                  <div>
                    <Typography variant="body" className="font-medium mb-2">
                      Key Points
                    </Typography>
                    <ul className="space-y-1">
                      {analysis.keyPoints.map((point, index) => (
                        <li key={index} className="text-sm text-gray-700">
                          • {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Actions */}
                {analysis.suggestedActions.length > 0 && (
                  <div>
                    <Typography variant="body" className="font-medium mb-2">
                      Suggested Actions
                    </Typography>
                    <ul className="space-y-1">
                      {analysis.suggestedActions.map((action, index) => (
                        <li key={index} className="text-sm text-gray-700">
                          • {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Analysis Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography
                      variant="body"
                      className="text-sm text-gray-600"
                    >
                      Sentiment
                    </Typography>
                    <Badge
                      className={`mt-1 ${getSentimentColor(analysis.sentiment)}`}
                    >
                      {analysis.sentiment}
                    </Badge>
                  </div>
                  <div>
                    <Typography
                      variant="body"
                      className="text-sm text-gray-600"
                    >
                      Priority
                    </Typography>
                    <Badge
                      className={`mt-1 ${getPriorityColor(analysis.priority)}`}
                    >
                      {analysis.priority}
                    </Badge>
                  </div>
                  <div>
                    <Typography
                      variant="body"
                      className="text-sm text-gray-600"
                    >
                      Confidence
                    </Typography>
                    <Typography variant="body" className="font-medium">
                      {analysis.confidence}%
                    </Typography>
                  </div>
                  <div>
                    <Typography
                      variant="body"
                      className="text-sm text-gray-600"
                    >
                      Response Time
                    </Typography>
                    <Typography variant="body" className="font-medium">
                      {analysis.estimatedResponseTime}m
                    </Typography>
                  </div>
                </div>

                {/* Tags */}
                {analysis.tags.length > 0 && (
                  <div>
                    <Typography variant="body" className="font-medium mb-2">
                      Tags
                    </Typography>
                    <div className="flex flex-wrap gap-1">
                      {analysis.tags.map((tag, index) => (
                        <Badge key={index} className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* AI Analysis Button */}
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>

          {/* Analysis Error */}
          {analysisError && (
            <Card className="p-4 border-red-200 bg-red-50">
              <Typography variant="body" className="text-red-700">
                {analysisError}
              </Typography>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
