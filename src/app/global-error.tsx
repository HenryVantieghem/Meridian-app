"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Home, RotateCcw, Shield } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  const handleRetry = async () => {
    setIsRetrying(true);
    // Add haptic feedback if supported
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }

    setTimeout(() => {
      setIsRetrying(false);
      reset();
    }, 1000);
  };

  const handleGoHome = () => {
    // Add haptic feedback if supported
    if ("vibrate" in navigator) {
      navigator.vibrate([50, 100, 50]);
    }
    window.location.href = "/";
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <style>{`
          body { 
            font-family: 'Inter', sans-serif; 
            margin: 0; 
            padding: 0;
            background: linear-gradient(135deg, #F8F6F0 0%, #FFFFFF 100%);
          }
          .brand-burgundy { color: #5D001E; }
          .bg-brand-burgundy { background-color: #5D001E; }
          .bg-brand-burgundy-dark { background-color: #4A0018; }
          .border-brand-burgundy { border-color: #5D001E; }
          .font-serif { font-family: 'Playfair Display', serif; }
          .hover\\:bg-brand-burgundy-dark:hover { background-color: #4A0018; }
          .hover\\:border-brand-burgundy:hover { border-color: #5D001E; }
          .focus\\:ring-brand-burgundy:focus { 
            --tw-ring-color: #5D001E; 
            box-shadow: 0 0 0 3px rgba(93, 0, 30, 0.3);
          }
        `}</style>
      </head>
      <body>
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235D001E' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-16.569 13.431-30 30-30v60c-16.569 0-30-13.431-30-30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-lg w-full mx-4 relative z-10"
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", damping: 15 }}
              className="text-center mb-8"
            >
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-[#5D001E] to-[#D4AF37] rounded-full flex items-center justify-center shadow-lg mb-6">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>

              {/* Napoleon Crown Accent */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                👑
              </motion.div>
            </motion.div>

            {/* Error Message */}
            <div className="text-center mb-8">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-serif font-bold brand-burgundy mb-4"
              >
                Strategic Disruption Detected
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-gray-600 text-lg mb-2"
              >
                Even emperors face unexpected challenges. Our engineering corps
                has been notified and is mobilizing a swift resolution.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-sm text-gray-500 flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Your data remains secure and protected
              </motion.p>
            </div>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === "development" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 1 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <h3 className="text-sm font-semibold text-red-800 mb-2">
                  Development Details:
                </h3>
                <p className="text-xs text-red-700 font-mono break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-red-600 mt-1">
                    Error ID: {error.digest}
                  </p>
                )}
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="space-y-4"
            >
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-brand-burgundy hover:bg-brand-burgundy-dark text-white font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-burgundy focus:ring-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetrying ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <RotateCcw className="w-5 h-5" />
                )}
                {isRetrying
                  ? "Executing Strategic Recovery..."
                  : "Retry Mission"}
              </button>

              <button
                onClick={handleGoHome}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 border-2 border-[#5D001E] text-[#5D001E] hover:bg-[#5D001E] hover:text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-burgundy focus:ring-opacity-30"
              >
                <Home className="w-5 h-5" />
                Return to Command Center
              </button>
            </motion.div>

            {/* Footer Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center mt-8"
            >
              <p className="text-sm text-gray-500">
                Napoleon AI • Strategic Communication Platform
              </p>
              <p className="text-xs text-gray-400 mt-1">
                "In the midst of chaos, there is also opportunity" — Sun Tzu
              </p>
            </motion.div>
          </motion.div>

          {/* Floating Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [0, -100],
                x: [0, Math.random() * 100 - 50],
              }}
              transition={{
                duration: 4,
                delay: i * 0.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              className="absolute w-2 h-2 bg-[#D4AF37] rounded-full"
              style={{
                left: `${20 + i * 10}%`,
                bottom: "20%",
              }}
            />
          ))}
        </div>
      </body>
    </html>
  );
}
