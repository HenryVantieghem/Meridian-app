"use client";
import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  CreditCard,
  ExternalLink,
  RefreshCw,
  X,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentStatusProps {
  status: "success" | "error" | "loading" | "pending" | "canceled";
  message?: string;
  details?: string;
  sessionId?: string;
  subscriptionId?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const statusConfig = {
  success: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    badgeColor: "bg-green-100 text-green-800",
    title: "Payment Successful",
    defaultMessage: "Your subscription has been activated successfully.",
  },
  error: {
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    badgeColor: "bg-red-100 text-red-800",
    title: "Payment Failed",
    defaultMessage: "There was an issue processing your payment.",
  },
  loading: {
    icon: Loader2,
    color: "text-[#D4AF37]",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    badgeColor: "bg-yellow-100 text-yellow-800",
    title: "Processing Payment",
    defaultMessage: "Please wait while we process your payment.",
  },
  pending: {
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    badgeColor: "bg-blue-100 text-blue-800",
    title: "Payment Pending",
    defaultMessage: "Your payment is being processed.",
  },
  canceled: {
    icon: X,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    badgeColor: "bg-gray-100 text-gray-800",
    title: "Payment Canceled",
    defaultMessage: "Your payment was canceled.",
  },
};

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  message,
  details,
  sessionId,
  subscriptionId,
  onRetry,
  onDismiss,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const config = statusConfig[status];
  const Icon = config.icon;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleRetry = () => {
    onRetry?.();
  };

  const getStatusIcon = () => {
    if (status === "loading") {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Icon className={cn("w-6 h-6", config.color)} />
        </motion.div>
      );
    }
    return <Icon className={cn("w-6 h-6", config.color)} />;
  };

  const getActionButton = () => {
    switch (status) {
      case "success":
        return (
          <Button
            onClick={() => (window.location.href = "/dashboard")}
            className="bg-[#D4AF37] text-black hover:bg-[#FFD700]"
          >
            Go to Dashboard
          </Button>
        );
      case "error":
        return (
          <div className="flex gap-2">
            {onRetry && (
              <Button
                onClick={handleRetry}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}
            <Button
              onClick={() => (window.location.href = "/pricing")}
              variant="outline"
            >
              Back to Pricing
            </Button>
          </div>
        );
      case "canceled":
        return (
          <Button
            onClick={() => (window.location.href = "/pricing")}
            variant="outline"
          >
            Back to Pricing
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={cn("relative", className)}
        >
          <Card
            className={cn(
              "p-6 relative overflow-hidden",
              config.bgColor,
              config.borderColor,
            )}
          >
            {/* Dismiss Button */}
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="flex items-start gap-4">
              {/* Status Icon */}
              <div className="flex-shrink-0">{getStatusIcon()}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {config.title}
                  </h3>
                  <Badge className={config.badgeColor}>
                    {status.toUpperCase()}
                  </Badge>
                </div>

                <p className="text-gray-700 mb-3">
                  {message || config.defaultMessage}
                </p>

                {details && (
                  <div className="mb-4 p-3 bg-white/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Details
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{details}</p>
                  </div>
                )}

                {/* Session/Subscription Info */}
                {(sessionId || subscriptionId) && (
                  <div className="mb-4 p-3 bg-white/50 rounded-lg">
                    <div className="space-y-2 text-sm">
                      {sessionId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Session ID:</span>
                          <span className="font-mono text-gray-800">
                            {sessionId}
                          </span>
                        </div>
                      )}
                      {subscriptionId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Subscription ID:
                          </span>
                          <span className="font-mono text-gray-800">
                            {subscriptionId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  {getActionButton()}

                  {status === "success" && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open("/api/stripe/portal", "_blank")
                      }
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Manage Billing
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-32 h-32">
                <CreditCard className="w-full h-full" />
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Specialized status components
export const PaymentSuccess: React.FC<
  Omit<PaymentStatusProps, "status"> & {
    subscriptionTier?: string;
    nextBillingDate?: string;
  }
> = ({ subscriptionTier, nextBillingDate, ...props }) => {
  return (
    <PaymentStatus
      status="success"
      message={`Welcome to ${subscriptionTier || "Napoleon"}! Your subscription is now active.`}
      details={
        nextBillingDate ? `Next billing date: ${nextBillingDate}` : undefined
      }
      {...props}
    />
  );
};

export const PaymentError: React.FC<
  Omit<PaymentStatusProps, "status"> & {
    errorCode?: string;
    retryable?: boolean;
  }
> = ({ errorCode, retryable: _retryable = true, ...props }) => {
  const getErrorMessage = (code?: string) => {
    switch (code) {
      case "card_declined":
        return "Your card was declined. Please try a different payment method.";
      case "insufficient_funds":
        return "Insufficient funds. Please check your account balance.";
      case "expired_card":
        return "Your card has expired. Please update your payment method.";
      default:
        return "There was an issue processing your payment. Please try again.";
    }
  };

  return (
    <PaymentStatus
      status="error"
      message={getErrorMessage(errorCode)}
      details={errorCode ? `Error code: ${errorCode}` : undefined}
      {...props}
    />
  );
};

export const PaymentLoading: React.FC<Omit<PaymentStatusProps, "status">> = (
  props,
) => {
  return (
    <PaymentStatus
      status="loading"
      message="Processing your payment securely..."
      details="This may take a few moments. Please don't close this window."
      {...props}
    />
  );
};

export default PaymentStatus;
