'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface CompactTimeZoneIndicatorProps {
  senderTimezone: string;
  userTimezone: string;
  emailTime: Date;
  className?: string;
}

export function CompactTimeZoneIndicator({
  senderTimezone,
  userTimezone,
  emailTime,
  className = ''
}: CompactTimeZoneIndicatorProps) {
  const indicator = useMemo(() => {
    const now = new Date();
    const senderTime = new Date(now.toLocaleString("en-US", { timeZone: senderTimezone }));
    
    // Calculate email age
    const emailAge = now.getTime() - emailTime.getTime();
    const hoursOld = emailAge / (1000 * 60 * 60);
    
    // Determine sender's working hours status
    const senderHour = senderTime.getHours();
    const isWorkingHours = senderHour >= 9 && senderHour <= 17;
    const isWeekend = senderTime.getDay() === 0 || senderTime.getDay() === 6;
    
    // Combined indicator logic
    let color = 'bg-green-400'; // Good time, fresh email
    let pulseIntensity = 'animate-pulse';
    
    if (hoursOld > 24) {
      color = 'bg-red-400'; // Stale
      pulseIntensity = '';
    } else if (hoursOld > 8) {
      color = 'bg-yellow-400'; // Aging
      pulseIntensity = 'animate-pulse';
    } else if (!isWorkingHours || isWeekend) {
      color = 'bg-orange-400'; // Off hours
      pulseIntensity = 'animate-pulse';
    }
    
    return {
      color,
      pulseIntensity,
      timeText: senderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: hoursOld > 24 ? 'stale' : 
              hoursOld > 8 ? 'aging' : 
              (!isWorkingHours || isWeekend) ? 'off-hours' : 'fresh'
    };
  }, [senderTimezone, userTimezone, emailTime]);

  return (
    <div className={`flex items-center gap-1 ${className}`} title={`Sender time: ${indicator.timeText} (${indicator.status})`}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`w-2 h-2 rounded-full ${indicator.color} ${indicator.pulseIntensity}`}
      />
      <span className="text-xs text-gray-400 font-mono">
        {indicator.timeText}
      </span>
    </div>
  );
}