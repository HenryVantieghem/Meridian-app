'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star, Sparkles, Trophy, Target } from 'lucide-react';

interface CompletionRitualProps {
  isVisible: boolean;
  completedTasks: number;
  totalTasks: number;
  onViewArchive: () => void;
  onContinue: () => void;
  className?: string;
}

const celebrationMessages = [
  "Outstanding strategic execution!",
  "Your leadership drives results!",
  "Excellence in every communication!",
  "Mastery in action!",
  "Strategic brilliance achieved!",
];

const constellationStars = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 2,
  duration: 2 + Math.random() * 3,
}));

export function CompletionRitual({ 
  isVisible, 
  completedTasks, 
  totalTasks, 
  onViewArchive, 
  onContinue,
  className = ''
}: CompletionRitualProps) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const progressPercentage = (completedTasks / totalTasks) * 100;

  useEffect(() => {
    if (isVisible) {
      setShowCelebration(true);
      const interval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % celebrationMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setShowCelebration(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ${className}`}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative max-w-md w-full mx-4"
        >
          {/* Background Stars */}
          <div className="absolute inset-0">
            {constellationStars.map((star) => (
              <motion.div
                key={star.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                transition={{ 
                  duration: star.duration, 
                  delay: star.delay,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="absolute w-1 h-1 bg-[#D4AF37] rounded-full"
                style={{ 
                  left: `${star.x}%`, 
                  top: `${star.y}%`,
                  filter: 'blur(0.5px)'
                }}
              />
            ))}
          </div>

          <Card className="bg-gradient-to-br from-white to-[#F8F6F0] border-2 border-[#D4AF37] shadow-2xl">
            <div className="p-8 text-center">
              {/* Trophy Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", damping: 15 }}
                className="mx-auto mb-6"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center shadow-lg">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              {/* Celebration Message */}
              <motion.div
                key={currentMessage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6"
              >
                <h1 className="text-2xl font-serif text-brand-burgundy mb-2 font-bold">
                  {celebrationMessages[currentMessage]}
                </h1>
                <p className="text-gray-600 font-sans">
                  Your strategic communication mastery continues to excel
                </p>
              </motion.div>

              {/* Progress Display */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-brand-burgundy" />
                    <span className="text-2xl font-bold text-brand-burgundy">
                      {completedTasks}
                    </span>
                    <span className="text-gray-400">/</span>
                    <span className="text-2xl font-bold text-gray-600">
                      {totalTasks}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    tasks completed
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-brand-burgundy to-[#D4AF37] h-3 rounded-full relative overflow-hidden"
                  >
                    <motion.div
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                  </motion.div>
                </div>
                <div className="text-sm text-gray-600">
                  {progressPercentage.toFixed(0)}% Complete
                </div>
              </div>

              {/* Sparkle Effects */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      rotate: 360
                    }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                    className="absolute"
                    style={{
                      left: `${20 + (i * 10)}%`,
                      top: `${20 + (i * 8)}%`,
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={onViewArchive}
                  variant="outline"
                  className="border-brand-burgundy text-brand-burgundy hover:bg-brand-burgundy hover:text-white transition-all duration-200"
                >
                  View Archive
                </Button>
                <Button
                  onClick={onContinue}
                  className="bg-gradient-to-r from-brand-burgundy to-[#D4AF37] text-white hover:from-[#4A0018] hover:to-[#B8941F] transition-all duration-200 shadow-lg"
                >
                  Continue Excellence
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}