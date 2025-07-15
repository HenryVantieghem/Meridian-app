'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { X, ChevronRight, ChevronLeft, Crown, Zap, Target, Shield } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  icon: React.ReactNode;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  showArrow?: boolean;
}

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Napoleon AI',
    description: 'Your strategic command center for executive-level communication management. Transform chaos into clarity with AI-powered prioritization.',
    target: 'center',
    icon: <Crown className="w-6 h-6 text-brand-burgundy" />,
    position: 'center'
  },
  {
    id: 'daily-brief',
    title: 'Strategic Daily Brief',
    description: 'Your unified command center. View prioritized communications from email and Slack in one strategic digest. VIP contacts and critical items surface automatically.',
    target: '.daily-brief-card',
    icon: <Target className="w-6 h-6 text-brand-burgundy" />,
    position: 'right',
    showArrow: true
  },
  {
    id: 'vip-management',
    title: 'VIP Contact Intelligence',
    description: 'Manage your most important relationships. Napoleon AI learns from your behavior to automatically detect and prioritize VIP communications.',
    target: '.vip-indicator',
    icon: <Crown className="w-6 h-6 text-brand-burgundy" />,
    position: 'top',
    showArrow: true
  },
  {
    id: 'ai-actions',
    title: 'AI-Powered Actions',
    description: 'One-click AI replies, smart scheduling, and context-aware responses. Your personal strategic advisor for every communication.',
    target: '.ai-reply-button',
    icon: <Zap className="w-6 h-6 text-brand-burgundy" />,
    position: 'left',
    showArrow: true
  },
  {
    id: 'command-bar',
    title: 'Napoleon Command Bar',
    description: 'Press ⌘K to summon your AI assistant. Ask questions, get briefings, or execute commands with natural language.',
    target: '.command-bar',
    icon: <Zap className="w-6 h-6 text-brand-burgundy" />,
    position: 'top',
    showArrow: true
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Executive Keyboard Shortcuts',
    description: 'Master productivity with keyboard shortcuts: E (Done), R (Reply), S (Snooze), A (AI Actions), ⌘K (Command Bar). Speed is power.',
    target: 'center',
    icon: <Shield className="w-6 h-6 text-brand-burgundy" />,
    position: 'center'
  }
];

export default function GuidedTour({ isOpen, onClose, onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!isOpen) return;

    const step = tourSteps[currentStep];
    if (step.target !== 'center') {
      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        highlightElement(element);
      }
    } else {
      setTargetElement(null);
      setOverlayStyle({});
    }
  }, [currentStep, isOpen]);

  const highlightElement = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const padding = 8;
    
    setOverlayStyle({
      position: 'fixed',
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      border: '2px solid #5D001E',
      borderRadius: '8px',
      backgroundColor: 'rgba(93, 0, 30, 0.1)',
      zIndex: 9999,
      pointerEvents: 'none'
    });
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem('guidedTourCompleted', 'true');
    onComplete();
    onClose();
  };

  const skipTour = () => {
    localStorage.setItem('guidedTourCompleted', 'true');
    localStorage.setItem('guidedTourSkipped', 'true');
    onClose();
  };

  const getTooltipPosition = () => {
    const step = tourSteps[currentStep];
    
    if (step.position === 'center') {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000
      };
    }

    if (!targetElement) return {};

    const rect = targetElement.getBoundingClientRect();
    const tooltipWidth = 400;
    const tooltipHeight = 200;
    const gap = 20;

    switch (step.position) {
      case 'top':
        return {
          position: 'fixed' as const,
          top: rect.top - tooltipHeight - gap,
          left: rect.left + rect.width / 2 - tooltipWidth / 2,
          zIndex: 10000
        };
      case 'bottom':
        return {
          position: 'fixed' as const,
          top: rect.bottom + gap,
          left: rect.left + rect.width / 2 - tooltipWidth / 2,
          zIndex: 10000
        };
      case 'left':
        return {
          position: 'fixed' as const,
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.left - tooltipWidth - gap,
          zIndex: 10000
        };
      case 'right':
        return {
          position: 'fixed' as const,
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.right + gap,
          zIndex: 10000
        };
      default:
        return {};
    }
  };

  if (!isOpen) return null;

  const currentStepData = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-9998" />
      
      {/* Highlight */}
      {targetElement && (
        <div style={overlayStyle} />
      )}
      
      {/* Tooltip */}
      <Card 
        className="w-96 shadow-2xl border-2 border-brand-burgundy"
        style={getTooltipPosition()}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {currentStepData.icon}
              <Typography variant="h6" className="font-playfair font-bold text-black">
                {currentStepData.title}
              </Typography>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Typography variant="body1" className="text-gray-700 mb-6 leading-relaxed">
            {currentStepData.description}
          </Typography>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {currentStep + 1} of {tourSteps.length}
              </span>
              <div className="flex gap-1">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index <= currentStep ? 'bg-brand-burgundy' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              
              <Button
                onClick={nextStep}
                className="bg-brand-burgundy text-white hover:bg-brand-burgundy/90 flex items-center gap-1"
              >
                {currentStep === tourSteps.length - 1 ? 'Complete Tour' : 'Next'}
                {currentStep < tourSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {currentStep === 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={skipTour}
                className="w-full text-gray-600 hover:text-gray-800"
              >
                Skip Tour
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// Hook for managing guided tour state
export function useGuidedTour() {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const tourCompleted = localStorage.getItem('guidedTourCompleted');
    const tourSkipped = localStorage.getItem('guidedTourSkipped');
    
    if (!tourCompleted && !tourSkipped) {
      // Show tour after a brief delay to let the page load
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = () => {
    setShowTour(true);
  };

  const closeTour = () => {
    setShowTour(false);
  };

  const completeTour = () => {
    localStorage.setItem('guidedTourCompleted', 'true');
    setShowTour(false);
  };

  const resetTour = () => {
    localStorage.removeItem('guidedTourCompleted');
    localStorage.removeItem('guidedTourSkipped');
    setShowTour(true);
  };

  return {
    showTour,
    startTour,
    closeTour,
    completeTour,
    resetTour
  };
}