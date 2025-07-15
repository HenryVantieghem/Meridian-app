"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Clock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeZoneData {
  timezone: string;
  currentTime: Date;
  isDaytime: boolean;
  freshness: "fresh" | "recent" | "stale";
  timeDifference: number; // hours from user's timezone
}

interface TimeZoneIndicatorProps {
  senderTimezone: string;
  userTimezone: string;
  emailTime: Date;
  className?: string;
  showDetails?: boolean;
}

export const TimeZoneIndicator: React.FC<TimeZoneIndicatorProps> = ({
  senderTimezone,
  userTimezone,
  emailTime,
  className,
  showDetails = false,
}) => {
  const [timeZoneData, setTimeZoneData] = useState<TimeZoneData | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const calculateTimeZoneData = (): TimeZoneData => {
      const now = new Date();
      const senderTime = new Date(
        now.toLocaleString("en-US", { timeZone: senderTimezone }),
      );
      const userTime = new Date(
        now.toLocaleString("en-US", { timeZone: userTimezone }),
      );

      const timeDifference =
        (senderTime.getTime() - userTime.getTime()) / (1000 * 60 * 60);

      // Determine if it's daytime in sender's timezone
      const senderHour = senderTime.getHours();
      const isDaytime = senderHour >= 6 && senderHour < 18;

      // Calculate freshness based on email time
      const hoursSinceEmail =
        (now.getTime() - emailTime.getTime()) / (1000 * 60 * 60);
      let freshness: "fresh" | "recent" | "stale";
      if (hoursSinceEmail < 2) freshness = "fresh";
      else if (hoursSinceEmail < 24) freshness = "recent";
      else freshness = "stale";

      return {
        timezone: senderTimezone,
        currentTime: senderTime,
        isDaytime,
        freshness,
        timeDifference,
      };
    };

    setTimeZoneData(calculateTimeZoneData());

    // Update every minute
    const interval = setInterval(() => {
      setTimeZoneData(calculateTimeZoneData());
    }, 60000);

    return () => clearInterval(interval);
  }, [senderTimezone, userTimezone, emailTime]);

  if (!timeZoneData) return null;

  const getFreshnessColor = (freshness: string) => {
    switch (freshness) {
      case "fresh":
        return "bg-green-100 text-green-800";
      case "recent":
        return "bg-yellow-100 text-yellow-800";
      case "stale":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeDifferenceText = (hours: number) => {
    if (Math.abs(hours) < 1) return "same time";
    if (hours > 0) return `${Math.round(hours)}h ahead`;
    return `${Math.round(Math.abs(hours))}h behind`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className={cn("relative inline-flex items-center gap-1", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300",
          timeZoneData.isDaytime
            ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
            : "bg-blue-50 text-blue-700 border border-blue-200",
        )}
      >
        <motion.div
          animate={{
            rotate: timeZoneData.isDaytime ? [0, 360] : [0, -360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {timeZoneData.isDaytime ? (
            <Sun className="w-3 h-3" />
          ) : (
            <Moon className="w-3 h-3" />
          )}
        </motion.div>

        <span className="hidden sm:inline">
          {formatTime(timeZoneData.currentTime)}
        </span>
      </motion.div>

      {/* Freshness Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={cn(
          "w-2 h-2 rounded-full",
          timeZoneData.freshness === "fresh" && "bg-green-400",
          timeZoneData.freshness === "recent" && "bg-yellow-400",
          timeZoneData.freshness === "stale" && "bg-gray-400",
        )}
      />

      {/* Detailed Tooltip */}
      <AnimatePresence>
        {isHovered && showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50"
          >
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-48">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-900">
                  {timeZoneData.timezone.split("/").pop()?.replace("_", " ")}
                </span>
              </div>

              {/* Current Time */}
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {formatTime(timeZoneData.currentTime)}
                </span>
              </div>

              {/* Day/Night Status */}
              <div className="flex items-center gap-2 mb-2">
                {timeZoneData.isDaytime ? (
                  <Sun className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-500" />
                )}
                <span className="text-sm text-gray-700">
                  {timeZoneData.isDaytime ? "Daytime" : "Nighttime"}
                </span>
              </div>

              {/* Time Difference */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">
                  {getTimeDifferenceText(timeZoneData.timeDifference)} from you
                </span>
              </div>

              {/* Freshness */}
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getFreshnessColor(timeZoneData.freshness),
                  )}
                >
                  {timeZoneData.freshness} email
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient Background Glow */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "absolute inset-0 rounded-full blur-sm transition-colors duration-300",
              timeZoneData.isDaytime ? "bg-yellow-200/30" : "bg-blue-200/30",
            )}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Compact version for peripheral vision
export const CompactTimeZoneIndicator: React.FC<TimeZoneIndicatorProps> = ({
  senderTimezone,
  userTimezone,
  emailTime,
  className,
}) => {
  const [timeZoneData, setTimeZoneData] = useState<TimeZoneData | null>(null);

  useEffect(() => {
    const calculateTimeZoneData = (): TimeZoneData => {
      const now = new Date();
      const senderTime = new Date(
        now.toLocaleString("en-US", { timeZone: senderTimezone }),
      );
      const userTime = new Date(
        now.toLocaleString("en-US", { timeZone: userTimezone }),
      );

      const timeDifference =
        (senderTime.getTime() - userTime.getTime()) / (1000 * 60 * 60);
      const senderHour = senderTime.getHours();
      const isDaytime = senderHour >= 6 && senderHour < 18;

      const hoursSinceEmail =
        (now.getTime() - emailTime.getTime()) / (1000 * 60 * 60);
      let freshness: "fresh" | "recent" | "stale";
      if (hoursSinceEmail < 2) freshness = "fresh";
      else if (hoursSinceEmail < 24) freshness = "recent";
      else freshness = "stale";

      return {
        timezone: senderTimezone,
        currentTime: senderTime,
        isDaytime,
        freshness,
        timeDifference,
      };
    };

    setTimeZoneData(calculateTimeZoneData());

    const interval = setInterval(() => {
      setTimeZoneData(calculateTimeZoneData());
    }, 60000);

    return () => clearInterval(interval);
  }, [senderTimezone, userTimezone, emailTime]);

  if (!timeZoneData) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("flex items-center gap-1", className)}
    >
      {/* Subtle Day/Night Indicator */}
      <motion.div
        animate={{
          scale: timeZoneData.isDaytime ? [1, 1.1, 1] : [1, 0.9, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "w-2 h-2 rounded-full",
          timeZoneData.isDaytime ? "bg-yellow-400" : "bg-blue-400",
        )}
      />

      {/* Freshness Pulse */}
      <motion.div
        animate={{
          scale: timeZoneData.freshness === "fresh" ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: timeZoneData.freshness === "fresh" ? Infinity : 0,
          ease: "easeInOut",
        }}
        className={cn(
          "w-1 h-1 rounded-full",
          timeZoneData.freshness === "fresh" && "bg-green-400",
          timeZoneData.freshness === "recent" && "bg-yellow-400",
          timeZoneData.freshness === "stale" && "bg-gray-400",
        )}
      />
    </motion.div>
  );
};

export default TimeZoneIndicator;
