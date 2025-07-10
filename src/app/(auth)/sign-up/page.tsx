'use client';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Typography } from '@/components/ui/typography';
import { motion } from 'framer-motion';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Typography variant="h1" className="text-4xl font-bold text-gray-900 mb-2">
            Meridian
          </Typography>
          <Typography variant="body" className="text-gray-600">
            Join the future of email management
          </Typography>
        </motion.div>
        
        <SignUpForm />
      </div>
    </div>
  );
} 