"use client";
import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  CreditCard, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Shield,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutButtonProps {
  priceId: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  onSuccess?: (sessionId: string) => void;
  onError?: (error: string) => void;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  priceId,
  children,
  className,
  variant = 'default',
  size = 'default',
  disabled = false,
  onSuccess: _onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={handleCheckout}
        disabled={disabled || isLoading}
        variant={variant}
        size={size}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          className
        )}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="p-3 bg-red-50 border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="p-3 bg-green-50 border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">Checkout session created successfully!</span>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Specialized checkout buttons for different use cases
export const ProCheckoutButton: React.FC<Omit<CheckoutButtonProps, 'priceId'> & { isYearly?: boolean }> = ({
  isYearly = false,
  ...props
}) => {
  const priceId = isYearly ? 'price_pro_yearly' : 'price_pro_monthly';
  
  return (
    <CheckoutButton
      priceId={priceId}
      className="bg-[#D4AF37] text-black hover:bg-[#FFD700] hover:scale-105 transition-all duration-300"
      {...props}
    >
      <Zap className="w-4 h-4" />
      Start Pro Trial
      <ArrowRight className="w-4 h-4" />
    </CheckoutButton>
  );
};

export const EnterpriseCheckoutButton: React.FC<Omit<CheckoutButtonProps, 'priceId'> & { isYearly?: boolean }> = ({
  isYearly = false,
  ...props
}) => {
  const priceId = isYearly ? 'price_enterprise_yearly' : 'price_enterprise_monthly';
  
  return (
    <CheckoutButton
      priceId={priceId}
      className="bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 transition-all duration-300"
      {...props}
    >
      <Shield className="w-4 h-4" />
      Start Enterprise Trial
      <ArrowRight className="w-4 h-4" />
    </CheckoutButton>
  );
};

// Loading state component for checkout process
export const CheckoutLoadingState: React.FC<{ message?: string }> = ({ 
  message = "Preparing your checkout session..." 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center p-8 space-y-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-8 h-8 text-[#D4AF37]" />
      </motion.div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Setting up your subscription
        </h3>
        <p className="text-gray-600">{message}</p>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Shield className="w-4 h-4" />
        <span>Secure payment processing</span>
      </div>
    </motion.div>
  );
};

export default CheckoutButton; 