"use client";
import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Clock,
  MessageSquare,
  TrendingUp,
  Star,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SenderContext {
  name: string;
  email: string;
  company?: string;
  role?: string;
  location?: string;
  timezone?: string;
  relationship: "colleague" | "client" | "vendor" | "friend" | "unknown";
  communicationHistory: {
    totalEmails: number;
    lastContact: string;
    averageResponseTime: string;
    tone: "positive" | "neutral" | "negative";
    urgency: "low" | "medium" | "high";
  };
  recentTopics: string[];
  priority: number; // 0-1
}

interface AIHoverProps {
  children: React.ReactNode;
  senderContext: SenderContext;
  className?: string;
}

export const AIHover: React.FC<AIHoverProps> = ({
  children,
  senderContext,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship) {
      case "colleague":
        return <User className="w-4 h-4" />;
      case "client":
        return <Star className="w-4 h-4" />;
      case "vendor":
        return <TrendingUp className="w-4 h-4" />;
      case "friend":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
            }}
            className="absolute z-50 transform -translate-x-1/2 -translate-y-full mb-2"
          >
            <Card className="w-80 p-4 bg-white shadow-2xl border border-gray-200 rounded-xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {senderContext.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {senderContext.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {senderContext.email}
                    </p>
                  </div>
                </div>
                <Badge className="flex items-center gap-1 text-xs">
                  {getRelationshipIcon(senderContext.relationship)}
                  {senderContext.relationship}
                </Badge>
              </div>

              {/* Company & Location */}
              {(senderContext.company || senderContext.location) && (
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                  {senderContext.company && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {senderContext.company}
                    </span>
                  )}
                  {senderContext.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {senderContext.location}
                    </span>
                  )}
                </div>
              )}

              {/* Communication Stats */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">
                    {senderContext.communicationHistory.totalEmails}
                  </div>
                  <div className="text-xs text-gray-600">Total emails</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">
                    {senderContext.communicationHistory.averageResponseTime}
                  </div>
                  <div className="text-xs text-gray-600">Avg response</div>
                </div>
              </div>

              {/* Tone & Urgency */}
              <div className="flex gap-2 mb-3">
                <Badge
                  className={getToneColor(
                    senderContext.communicationHistory.tone,
                  )}
                >
                  {senderContext.communicationHistory.tone} tone
                </Badge>
                <Badge
                  className={getUrgencyColor(
                    senderContext.communicationHistory.urgency,
                  )}
                >
                  {senderContext.communicationHistory.urgency} urgency
                </Badge>
              </div>

              {/* Recent Topics */}
              {senderContext.recentTopics.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Recent Topics
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {senderContext.recentTopics
                      .slice(0, 3)
                      .map((topic, index) => (
                        <Badge key={index} className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}

              {/* Priority Indicator */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${senderContext.priority * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="h-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full"
                  />
                </div>
                <span className="text-xs text-gray-600">
                  {Math.round(senderContext.priority * 100)}% priority
                </span>
              </div>

              {/* Last Contact */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock className="w-4 h-4" />
                  Last contact: {senderContext.communicationHistory.lastContact}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIHover;
