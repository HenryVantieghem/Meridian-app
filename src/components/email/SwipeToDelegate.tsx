"use client";
import * as React from "react";
import { useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Send, Archive, Users, Calendar, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface DelegateOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action: () => void;
}

interface SwipeToDelegateProps {
  children: React.ReactNode;
  onDelegate: (option: string) => void;
  onSnooze?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
}

const delegateOptions: DelegateOption[] = [
  {
    id: "team",
    label: "Delegate to Team",
    icon: Users,
    color: "bg-blue-500",
    action: () => {},
  },
  {
    id: "assistant",
    label: "AI Assistant",
    icon: MessageSquare,
    color: "bg-[#D4AF37]",
    action: () => {},
  },
  {
    id: "schedule",
    label: "Schedule Later",
    icon: Calendar,
    color: "bg-green-500",
    action: () => {},
  },
  {
    id: "archive",
    label: "Archive",
    icon: Archive,
    color: "bg-gray-500",
    action: () => {},
  },
];

export const SwipeToDelegate: React.FC<SwipeToDelegateProps> = ({
  children,
  onDelegate,
  onSnooze: _onSnooze,
  onArchive: _onArchive,
  onDelete: _onDelete,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const scale = useTransform(x, [-200, 200], [0.95, 1.05]);
  const opacity = useTransform(x, [-100, 100], [0.8, 1]);

  const handleDragStart = () => {
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    setIsDragging(false);
    
    if (Math.abs(info.offset.x) > 150) {
      setShowOptions(true);
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    onDelegate(optionId);
    
    // Animate paper plane
    setTimeout(() => {
      setShowOptions(false);
      setSelectedOption(null);
    }, 1000);
  };

  const handleClose = () => {
    setShowOptions(false);
    setSelectedOption(null);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Delegate Options Background */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center gap-4 bg-gradient-to-r from-gray-50 to-white rounded-xl p-4"
          >
            {delegateOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: selectedOption === option.id ? 1.2 : 1,
                  rotate: selectedOption === option.id ? 360 : 0,
                }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: index * 0.1,
                }}
                className="flex flex-col items-center gap-2"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-lg",
                    option.color,
                    selectedOption === option.id ? "ring-4 ring-[#D4AF37]" : ""
                  )}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <option.icon className="w-6 h-6 text-white" />
                </motion.div>
                <span className="text-xs font-medium text-gray-700 text-center">
                  {option.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paper Plane Animation */}
      <AnimatePresence>
        {selectedOption && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <motion.div
              initial={{ x: 0, y: 0, rotate: 0 }}
              animate={{ 
                x: [0, 100, 200],
                y: [0, -50, -100],
                rotate: [0, 45, 90],
              }}
              transition={{ 
                duration: 1.5,
                ease: "easeOut",
              }}
              className="text-[#D4AF37]"
            >
              <Send className="w-8 h-8" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        drag={disabled ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x, rotate, scale, opacity }}
        className={cn(
          "relative z-20 cursor-grab active:cursor-grabbing",
          disabled && "cursor-default"
        )}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Swipe Indicator */}
        <AnimatePresence>
          {isDragging && Math.abs(x.get()) > 50 && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#D4AF37] text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg"
            >
              Swipe to delegate
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orbit Effect */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-xl border-2 border-[#D4AF37] border-dashed"
              style={{
                transform: `rotate(${x.get() * 0.1}deg)`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Content */}
        <Card className="relative overflow-hidden">
          {children}
          
          {/* Swipe Progress Bar */}
          <motion.div
            style={{
              width: useTransform(x, [-200, 0, 200], ["0%", "50%", "100%"]),
            }}
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#D4AF37] to-[#FFD700]"
          />
        </Card>
      </motion.div>

      {/* Close Button */}
      <AnimatePresence>
        {showOptions && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={handleClose}
            className="absolute top-2 right-2 w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
            aria-label="Close delegate options"
          >
            <span className="text-gray-600 text-sm">×</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SwipeToDelegate; 