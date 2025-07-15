"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface OnboardingLayoutProps {
  children: ReactNode;
}

const steps = [
  {
    path: "/onboarding/persona",
    title: "Persona",
    description: "Choose your role",
  },
  {
    path: "/onboarding/preferences",
    title: "Preferences",
    description: "Set your priorities",
  },
  {
    path: "/onboarding/preview",
    title: "Preview",
    description: "See the magic",
  },
];

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const currentStepIndex = steps.findIndex((step) => step.path === pathname);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      router.push(steps[currentStepIndex + 1].path);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      router.push(steps[currentStepIndex - 1].path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Typography
                  variant="body"
                  className="text-white font-bold text-sm"
                >
                  M
                </Typography>
              </div>
              <Typography
                variant="h3"
                className="text-xl font-bold text-gray-900"
              >
                Napoleon
              </Typography>
            </div>

            {/* Progress */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <Typography variant="body" className="text-sm text-gray-600">
                  Step {currentStepIndex + 1} of {steps.length}
                </Typography>
                <Typography
                  variant="body"
                  className="text-sm font-medium text-gray-900"
                >
                  {steps[currentStepIndex]?.title}
                </Typography>
              </div>
              <div className="w-32">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>

            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div
                  key={step.path}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStepIndex ? "bg-primary-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={currentStepIndex === steps.length - 1}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
