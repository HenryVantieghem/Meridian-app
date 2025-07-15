"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TimeZoneIndicatorProps {
  senderTimezone: string;
  userTimezone: string;
  emailTime: Date;
  showDetails?: boolean;
  className?: string;
}

export function TimeZoneIndicator({
  senderTimezone,
  userTimezone,
  emailTime,
  showDetails = false,
  className = "",
}: TimeZoneIndicatorProps) {
  const timeInfo = useMemo(() => {
    const now = new Date();
    const senderTime = new Date(
      now.toLocaleString("en-US", { timeZone: senderTimezone }),
    );
    const userTime = new Date(
      now.toLocaleString("en-US", { timeZone: userTimezone }),
    );

    // Calculate time difference in hours
    const timeDiff = Math.round(
      (senderTime.getTime() - userTime.getTime()) / (1000 * 60 * 60),
    );

    // Determine if it's a good time to email based on sender's local time
    const senderHour = senderTime.getHours();
    const isWorkingHours = senderHour >= 9 && senderHour <= 17;
    const isWeekend = senderTime.getDay() === 0 || senderTime.getDay() === 6;

    // Calculate email freshness
    const emailAge = now.getTime() - emailTime.getTime();
    const hoursOld = emailAge / (1000 * 60 * 60);

    let freshnessColor = "bg-green-500"; // Fresh (< 2 hours)
    let freshnessLabel = "Fresh";

    if (hoursOld > 24) {
      freshnessColor = "bg-red-500"; // Stale (> 24 hours)
      freshnessLabel = "Stale";
    } else if (hoursOld > 8) {
      freshnessColor = "bg-yellow-500"; // Aging (8-24 hours)
      freshnessLabel = "Aging";
    } else if (hoursOld > 2) {
      freshnessColor = "bg-blue-500"; // Recent (2-8 hours)
      freshnessLabel = "Recent";
    }

    return {
      senderTime: senderTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      userTime: userTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      timeDiff,
      isWorkingHours,
      isWeekend,
      freshnessColor,
      freshnessLabel,
      hoursOld: Math.round(hoursOld * 10) / 10,
    };
  }, [senderTimezone, userTimezone, emailTime]);

  const getTimeDiffText = () => {
    const { timeDiff } = timeInfo;
    if (timeDiff === 0) return "Same time";
    const hours = Math.abs(timeDiff);
    const direction = timeDiff > 0 ? "ahead" : "behind";
    return `${hours}h ${direction}`;
  };

  const getWorkingHoursIndicator = () => {
    if (timeInfo.isWeekend) return { color: "bg-gray-500", label: "Weekend" };
    if (timeInfo.isWorkingHours)
      return { color: "bg-green-500", label: "Work hours" };
    return { color: "bg-orange-500", label: "After hours" };
  };

  const workingHours = getWorkingHoursIndicator();

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`w-2 h-2 rounded-full ${timeInfo.freshnessColor}`}
        />
        <span className="text-xs text-gray-500">{timeInfo.senderTime}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Time Display */}
      <div className="flex items-center gap-1 text-xs">
        <Clock className="w-3 h-3 text-gray-400" />
        <span className="font-medium">{timeInfo.senderTime}</span>
        {timeInfo.timeDiff !== 0 && (
          <span className="text-gray-500">({getTimeDiffText()})</span>
        )}
      </div>

      {/* Working Hours Indicator */}
      <Badge
        className={`${workingHours.color} text-white text-xs px-2 py-0.5`}
        variant="default"
      >
        {workingHours.label}
      </Badge>

      {/* Freshness Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1"
      >
        <div className={`w-2 h-2 rounded-full ${timeInfo.freshnessColor}`} />
        <span className="text-xs text-gray-500">
          {timeInfo.hoursOld < 1
            ? `${Math.round(timeInfo.hoursOld * 60)}m ago`
            : `${timeInfo.hoursOld}h ago`}
        </span>
      </motion.div>
    </div>
  );
}
