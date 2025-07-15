"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-brand-burgundy/10 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-brand-burgundy"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <Typography variant="h2" className="text-brand-burgundy mb-2">
            Something went wrong
          </Typography>
          <Typography variant="body" className="text-gray-600 mb-6">
            We&apos;re experiencing technical difficulties. Please try again or
            contact support if the problem persists.
          </Typography>
        </div>

        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full bg-brand-burgundy hover:bg-brand-burgundy/90 text-white"
          >
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="w-full border-brand-burgundy/20 text-brand-burgundy hover:bg-brand-burgundy/5"
          >
            Return home
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error details
            </summary>
            <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </Card>
    </div>
  );
}
