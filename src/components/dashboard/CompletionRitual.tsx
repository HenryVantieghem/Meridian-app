"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Star, 
  Sparkles, 
  Trophy, 
  Zap,
  Heart,
  Target,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CompletionRitualProps {
  isVisible: boolean;
  completedTasks: number;
  totalTasks: number;
  onViewArchive?: () => void;
  onContinue?: () => void;
}

const inspirationalMessages = [
  "You've conquered today's challenges with grace and efficiency.",
  "Your productivity is a testament to your focus and determination.",
  "Every completed task brings you closer to your goals.",
  "You're not just managing emails, you're mastering communication.",
  "Your organized approach is creating space for what matters most.",
];

const constellationPoints = [
  { x: 20, y: 30, delay: 0 },
  { x: 80, y: 20, delay: 0.1 },
  { x: 60, y: 70, delay: 0.2 },
  { x: 30, y: 80, delay: 0.3 },
  { x: 70, y: 50, delay: 0.4 },
  { x: 40, y: 40, delay: 0.5 },
  { x: 90, y: 80, delay: 0.6 },
  { x: 10, y: 60, delay: 0.7 },
];

export const CompletionRitual: React.FC<CompletionRitualProps> = ({
  isVisible,
  completedTasks,
  totalTasks,
  onViewArchive,
  onContinue,
}) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showConstellation, setShowConstellation] = useState(false);
  const controls = useAnimation();

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  useEffect(() => {
    if (isVisible) {
      controls.start("visible");
      setShowConstellation(true);
      
      // Cycle through inspirational messages
      const messageInterval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % inspirationalMessages.length);
      }, 3000);

      return () => clearInterval(messageInterval);
    } else {
      controls.start("hidden");
      setShowConstellation(false);
    }
  }, [isVisible, controls]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const starVariants = {
    hidden: { opacity: 0, scale: 0, rotate: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 360,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const constellationVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        staggerChildren: 0.1,
      },
    },
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate={controls}
        variants={containerVariants}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <Card className="w-full max-w-md mx-4 p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 relative overflow-hidden">
          {/* Background Constellation */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              variants={constellationVariants}
              animate={showConstellation ? "visible" : "hidden"}
              className="relative w-full h-full"
            >
              {constellationPoints.map((point, index) => (
                <motion.div
                  key={index}
                  variants={starVariants}
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                  }}
                  className="absolute w-2 h-2 bg-[#D4AF37] rounded-full"
                />
              ))}
            </motion.div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Celebration Animation */}
            <motion.div
              variants={itemVariants}
              className="mb-6"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-bold text-gray-900 mb-4"
            >
              {completionRate === 100 ? "All Caught Up!" : "Great Progress!"}
            </motion.h2>

            {/* Completion Stats */}
            <motion.div
              variants={itemVariants}
              className="mb-6"
            >
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#D4AF37]">
                    {completedTasks}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-gray-400">/</div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {totalTasks}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full"
                />
              </div>
              
              <div className="text-lg font-semibold text-gray-700">
                {Math.round(completionRate)}% Complete
              </div>
            </motion.div>

            {/* Inspirational Message */}
            <motion.div
              variants={itemVariants}
              className="mb-6"
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentMessage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-gray-600 italic"
                >
                  {inspirationalMessages[currentMessage]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex gap-3 justify-center"
            >
              {onViewArchive && (
                <Button
                  onClick={onViewArchive}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  View Archive
                </Button>
              )}
              {onContinue && (
                <Button
                  onClick={onContinue}
                  className="bg-[#D4AF37] text-black hover:bg-[#FFD700] flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Continue
                </Button>
              )}
            </motion.div>

            {/* Floating Celebration Elements */}
            <AnimatePresence>
              {showConstellation && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        x: [0, Math.random() * 200 - 100],
                        y: [0, Math.random() * 200 - 100],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.2,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                      className="absolute pointer-events-none"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompletionRitual; 