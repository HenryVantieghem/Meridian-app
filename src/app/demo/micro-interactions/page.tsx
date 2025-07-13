"use client";
import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  SwipeToDelegate, 
  AIHover, 
  CompletionRitual, 
  TimeZoneIndicator,
  CompactTimeZoneIndicator 
} from "@/components/micro-interactions";
import { 
  Mail, 
  User, 
  Clock
} from "lucide-react";

export default function MicroInteractionsDemo() {
  const [showCompletionRitual, setShowCompletionRitual] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(8);

  const handleDelegate = (option: string) => {
    console.log("Delegated to:", option);
    // In real app, this would trigger the delegation action
  };

  const handleViewArchive = () => {
    console.log("Viewing archive");
    setShowCompletionRitual(false);
  };

  const handleContinue = () => {
    console.log("Continuing");
    setShowCompletionRitual(false);
  };

  const sampleSenderContext = {
    name: "Sarah Chen",
    email: "sarah.chen@techcorp.com",
    company: "TechCorp Inc.",
    role: "Product Manager",
    location: "San Francisco, CA",
    timezone: "America/Los_Angeles",
    relationship: "colleague" as const,
    communicationHistory: {
      totalEmails: 47,
      lastContact: "2 hours ago",
      averageResponseTime: "4.2h",
      tone: "positive" as const,
      urgency: "medium" as const,
    },
    recentTopics: ["Q4 Planning", "Product Launch", "Team Sync"],
    priority: 0.85,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Micro-Interactions Demo
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Napoleon&apos;s AI-powered micro-interactions create a seamless, delightful user experience.
          </p>
        </motion.div>

        <div className="grid gap-8">
          {/* Swipe-to-Delegate Demo */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Swipe-to-Delegate</h2>
            <p className="text-gray-600">
              Physics-based swipe gestures with contextual delegate options and paper plane animations.
            </p>
            
            <div className="max-w-md">
              <SwipeToDelegate onDelegate={handleDelegate}>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">S</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Sarah Chen</h3>
                      <p className="text-sm text-gray-600">Q4 Planning Discussion</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">
                    Hi! I wanted to discuss the Q4 planning session we have scheduled for next week...
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge className="text-xs">Planning</Badge>
                    <Badge className="text-xs">High Priority</Badge>
                  </div>
                </div>
              </SwipeToDelegate>
            </div>
          </section>

          {/* AI Hover Demo */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">AI Hover (Context Reveal)</h2>
            <p className="text-gray-600">
              Tooltip with sender context, relationship info, communication history, and tone analysis.
            </p>
            
            <div className="max-w-md">
              <AIHover senderContext={sampleSenderContext}>
                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">S</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Sarah Chen</h3>
                      <p className="text-sm text-gray-600">Product Launch Timeline</p>
                    </div>
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                </Card>
              </AIHover>
            </div>
          </section>

          {/* Time Zone Indicator Demo */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Time Zone Awareness</h2>
            <p className="text-gray-600">
              Subtle visual cues for sender&apos;s local time with color-coded freshness indicators.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Full Indicator:</span>
                <TimeZoneIndicator
                  senderTimezone="America/Los_Angeles"
                  userTimezone="America/New_York"
                  emailTime={new Date(Date.now() - 2 * 60 * 60 * 1000)} // 2 hours ago
                  showDetails
                />
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Compact (Peripheral):</span>
                <CompactTimeZoneIndicator
                  senderTimezone="Europe/London"
                  userTimezone="America/New_York"
                  emailTime={new Date(Date.now() - 30 * 60 * 1000)} // 30 minutes ago
                />
              </div>
            </div>
          </section>

          {/* Completion Ritual Demo */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Completion Ritual</h2>
            <p className="text-gray-600">
              Celebration animation for completed tasks with constellation view and inspirational messaging.
            </p>
            
            <div className="flex gap-4">
              <Button
                onClick={() => setShowCompletionRitual(true)}
                className="bg-[#D4AF37] text-black hover:bg-[#FFD700]"
              >
                Show Completion Ritual
              </Button>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Progress:</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#D4AF37]">{completedTasks}</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-lg font-bold text-gray-900">10</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (completedTasks < 10) {
                      setCompletedTasks(prev => prev + 1);
                    }
                  }}
                >
                  Complete Task
                </Button>
              </div>
            </div>
          </section>

          {/* Usage Examples */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Usage Examples</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Email List Integration</h3>
                <div className="space-y-3">
                  <SwipeToDelegate onDelegate={handleDelegate}>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">John Doe</span>
                        <TimeZoneIndicator
                          senderTimezone="Europe/London"
                          userTimezone="America/New_York"
                          emailTime={new Date()}
                          className="ml-auto"
                        />
                      </div>
                    </div>
                  </SwipeToDelegate>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Dashboard Integration</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Email Processing</span>
                    </div>
                    <CompactTimeZoneIndicator
                      senderTimezone="Asia/Tokyo"
                      userTimezone="America/New_York"
                      emailTime={new Date(Date.now() - 60 * 60 * 1000)}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </div>

        {/* Completion Ritual Modal */}
        <CompletionRitual
          isVisible={showCompletionRitual}
          completedTasks={completedTasks}
          totalTasks={10}
          onViewArchive={handleViewArchive}
          onContinue={handleContinue}
        />
      </div>
    </div>
  );
} 