'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Send, UserPlus, Calendar, Archive } from 'lucide-react';

interface SwipeToDelegateProps {
  children: React.ReactNode;
  onDelegate: (option: string) => void;
  className?: string;
}

const delegateOptions = [
  { id: 'assistant', label: 'Assistant', icon: UserPlus, color: 'bg-blue-500' },
  { id: 'schedule', label: 'Schedule', icon: Calendar, color: 'bg-green-500' },
  { id: 'forward', label: 'Forward', icon: Send, color: 'bg-purple-500' },
  { id: 'archive', label: 'Archive', icon: Archive, color: 'bg-gray-500' },
];

export function SwipeToDelegate({ children, onDelegate, className = '' }: SwipeToDelegateProps) {
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0.8, 1, 0.8]);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);

  const handleDragStart = () => {
    setDragDirection(null);
    setSelectedOption(null);
  };

  const handleDrag = (event: any, info: PanInfo) => {
    const direction = info.offset.x > 0 ? 'right' : 'left';
    setDragDirection(direction);
    
    // Determine which option is selected based on drag distance
    const absOffset = Math.abs(info.offset.x);
    if (absOffset > 50) {
      const index = Math.min(Math.floor(absOffset / 50) - 1, delegateOptions.length - 1);
      setSelectedOption(delegateOptions[index]?.id || null);
    } else {
      setSelectedOption(null);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const absOffset = Math.abs(info.offset.x);
    
    if (absOffset > 100 && selectedOption) {
      // Trigger delegation
      onDelegate(selectedOption);
      
      // Animate card flying away
      x.set(info.offset.x > 0 ? 300 : -300);
      setTimeout(() => {
        x.set(0);
        setDragDirection(null);
        setSelectedOption(null);
      }, 500);
    } else {
      // Snap back
      x.set(0);
      setDragDirection(null);
      setSelectedOption(null);
    }
  };

  const getOptionsByDirection = (direction: 'left' | 'right') => {
    return direction === 'right' 
      ? delegateOptions.slice(0, 2) 
      : delegateOptions.slice(2);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Background Options */}
      {dragDirection && (
        <div className="absolute inset-0 flex items-center justify-between px-4">
          {dragDirection === 'left' && (
            <div className="flex space-x-2">
              {getOptionsByDirection('left').map((option) => (
                <motion.div
                  key={option.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: selectedOption === option.id ? 1.2 : 1, 
                    opacity: selectedOption === option.id ? 1 : 0.6 
                  }}
                  className={`w-12 h-12 rounded-full ${option.color} flex items-center justify-center`}
                >
                  <option.icon className="w-6 h-6 text-white" />
                </motion.div>
              ))}
            </div>
          )}
          
          {dragDirection === 'right' && (
            <div className="flex space-x-2 ml-auto">
              {getOptionsByDirection('right').map((option) => (
                <motion.div
                  key={option.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: selectedOption === option.id ? 1.2 : 1, 
                    opacity: selectedOption === option.id ? 1 : 0.6 
                  }}
                  className={`w-12 h-12 rounded-full ${option.color} flex items-center justify-center`}
                >
                  <option.icon className="w-6 h-6 text-white" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Card */}
      <motion.div
        ref={cardRef}
        drag="x"
        dragConstraints={{ left: -200, right: 200 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ x, opacity, scale }}
        className="relative z-10 bg-white rounded-lg shadow-md border border-gray-200 cursor-grab active:cursor-grabbing"
        whileDrag={{ 
          rotate: x.get() * 0.1,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}
      >
        {children}
      </motion.div>

      {/* Instruction Text */}
      <div className="text-center mt-2 text-xs text-gray-500">
        Swipe left or right to delegate
      </div>
    </div>
  );
}