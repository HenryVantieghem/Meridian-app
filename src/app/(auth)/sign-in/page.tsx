"use client";
import { SignInForm } from "@/components/auth/SignInForm";
import { Typography } from "@/components/ui/typography";
import { motion } from "framer-motion";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Typography
            variant="h1"
            className="text-4xl font-bold text-gray-900 mb-2"
          >
            Napoleon
          </Typography>
          <Typography variant="body" className="text-gray-600">
            AI-powered email management
          </Typography>
        </motion.div>

        <SignInForm />
      </div>
    </div>
  );
}
