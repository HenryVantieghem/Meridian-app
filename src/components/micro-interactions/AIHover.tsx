"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Mail,
} from "lucide-react";

interface SenderContext {
  name: string;
  email: string;
  company: string;
  role: string;
  location: string;
  timezone: string;
  relationship: "colleague" | "client" | "vendor" | "internal";
  communicationHistory: {
    totalEmails: number;
    lastContact: string;
    averageResponseTime: string;
    tone: "positive" | "neutral" | "negative";
    urgency: "low" | "medium" | "high";
  };
  recentTopics: string[];
  priority: number;
}

interface AIHoverProps {
  children: React.ReactNode;
  senderContext: SenderContext;
  className?: string;
}

export function AIHover({
  children,
  senderContext,
  className = "",
}: AIHoverProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovered(true);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isHovered) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case "positive":
        return "text-green-600 bg-green-100";
      case "negative":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-green-600 bg-green-100";
    }
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case "client":
        return "text-blue-600 bg-blue-100";
      case "vendor":
        return "text-purple-600 bg-purple-100";
      case "internal":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className={className}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative"
      >
        {children}
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 100,
              transform: "translate(0, -50%)",
            }}
          >
            <Card className="w-80 p-4 bg-white shadow-lg border border-gray-200">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-burgundy to-[#D4AF37] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {senderContext.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {senderContext.name}
                  </h3>
                  <p className="text-sm text-gray-600">{senderContext.role}</p>
                  <p className="text-xs text-gray-500">
                    {senderContext.company}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    className={getRelationshipColor(senderContext.relationship)}
                  >
                    {senderContext.relationship}
                  </Badge>
                </div>
              </div>

              {/* Location & Time */}
              <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{senderContext.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{senderContext.timezone}</span>
                </div>
              </div>

              {/* Communication Stats */}
              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">
                    {senderContext.communicationHistory.totalEmails} emails
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">
                    {senderContext.communicationHistory.averageResponseTime} avg
                  </span>
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
              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-700 mb-2">
                  Recent Topics
                </h4>
                <div className="flex flex-wrap gap-1">
                  {senderContext.recentTopics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Priority Score */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Priority Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-gradient-to-r from-brand-burgundy to-[#D4AF37] rounded-full"
                      style={{ width: `${senderContext.priority * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {Math.round(senderContext.priority * 100)}%
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
