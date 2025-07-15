"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Typography } from "@/components/ui/typography";

export default function SSOCallbackPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        // Redirect to dashboard after successful SSO
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        // Redirect to sign-in if SSO failed
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      }
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-brand-burgundy mx-auto" />
          <Typography variant="body" className="text-gray-600">
            Completing sign in...
          </Typography>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        {isSignedIn ? (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <Typography
              variant="h2"
              className="text-2xl font-bold text-gray-900"
            >
              Sign in successful!
            </Typography>
            <Typography variant="body" className="text-gray-600">
              Redirecting to your dashboard...
            </Typography>
          </>
        ) : (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <Typography
              variant="h2"
              className="text-2xl font-bold text-gray-900"
            >
              Sign in failed
            </Typography>
            <Typography variant="body" className="text-gray-600">
              Redirecting to sign in page...
            </Typography>
          </>
        )}
      </motion.div>
    </div>
  );
}
