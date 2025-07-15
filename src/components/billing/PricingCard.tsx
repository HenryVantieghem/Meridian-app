"use client";
import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Sparkles, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRODUCTS, PRICES } from "@/lib/stripe/config";

interface PricingCardProps {
  tier: "FREE" | "PRO" | "ENTERPRISE";
  isPopular?: boolean;
  isYearly?: boolean;
  onSelect?: (priceId: string) => void;
  className?: string;
}

const tierConfig = {
  FREE: {
    icon: Sparkles,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    badgeColor: "bg-gray-100 text-gray-800",
  },
  PRO: {
    icon: Zap,
    color: "text-[#D4AF37]",
    bgColor: "bg-gradient-to-br from-[#D4AF37]/10 to-[#FFD700]/10",
    borderColor: "border-[#D4AF37]",
    badgeColor: "bg-[#D4AF37] text-black",
  },
  ENTERPRISE: {
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
    borderColor: "border-purple-300",
    badgeColor: "bg-purple-100 text-purple-800",
  },
};

function hasTrialDays(price: unknown): price is { trialDays: number } {
  return typeof price === "object" && price !== null && "trialDays" in price;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  isPopular = false,
  isYearly = false,
  onSelect,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const product = PRODUCTS[tier];
  const config = tierConfig[tier];
  const Icon = config.icon;

  // Get price for this tier
  const getPrice = () => {
    if (tier === "FREE") return { amount: 0, currency: "usd" };

    const priceKey = isYearly
      ? (`${tier}_YEARLY` as keyof typeof PRICES)
      : (`${tier}_MONTHLY` as keyof typeof PRICES);

    return PRICES[priceKey];
  };

  const price = getPrice();
  const monthlyPrice =
    tier === "FREE" ? 0 : isYearly ? price.amount / 12 : price.amount;
  const savings =
    isYearly && tier !== "FREE"
      ? Math.round((price.amount * 12 - price.amount) / 100)
      : 0;

  const handleSelect = () => {
    if (tier === "FREE") {
      // Handle free tier selection
      onSelect?.("free");
    } else {
      // Handle paid tier selection
      const priceKey = isYearly
        ? (`${tier}_YEARLY` as keyof typeof PRICES)
        : (`${tier}_MONTHLY` as keyof typeof PRICES);
      onSelect?.(PRICES[priceKey].id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn("relative", className)}
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          config.bgColor,
          config.borderColor,
          isPopular && "ring-2 ring-[#D4AF37] ring-offset-2",
          isHovered && "scale-105 shadow-xl",
        )}
      >
        {/* Popular Badge */}
        {isPopular && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10"
          >
            <Badge className="bg-[#D4AF37] text-black px-4 py-1 rounded-full font-medium">
              <Star className="w-3 h-3 mr-1" />
              Most Popular
            </Badge>
          </motion.div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  tier === "PRO" ? "bg-[#D4AF37]" : "bg-gray-200",
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6",
                    tier === "PRO" ? "text-black" : config.color,
                  )}
                />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {product.name}
            </h3>

            <p className="text-gray-600 mb-4">{product.description}</p>

            {/* Pricing */}
            <div className="mb-6">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-gray-900">
                  ${(monthlyPrice / 100).toFixed(0)}
                </span>
                <span className="text-gray-600">/month</span>
              </div>

              {tier !== "FREE" && (
                <>
                  <div className="text-sm text-gray-500 mt-1">
                    Billed annually • Save ${savings}/month
                  </div>
                  {hasTrialDays(price) && (
                    <p className="text-xs text-gray-500 text-center mt-3">
                      {price.trialDays}-day free trial • Cancel anytime
                    </p>
                  )}
                </>
              )}
              {tier === "FREE" && (
                <div className="text-sm text-gray-500 mt-1">Forever free</div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {product.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center",
                    tier === "PRO" ? "bg-[#D4AF37]" : "bg-gray-200",
                  )}
                >
                  <Check
                    className={cn(
                      "w-3 h-3",
                      tier === "PRO" ? "text-black" : "text-gray-600",
                    )}
                  />
                </div>
                <span className="text-sm text-gray-700">{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* Limits */}
          {tier !== "FREE" && (
            <div className="mb-6 p-4 bg-white/50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Included Limits
              </h4>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Emails per month</span>
                  <span className="font-medium">
                    {product.limits.emailsPerMonth === -1
                      ? "Unlimited"
                      : product.limits.emailsPerMonth.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>AI analyses</span>
                  <span className="font-medium">
                    {product.limits.aiAnalyses === -1
                      ? "Unlimited"
                      : product.limits.aiAnalyses.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Storage</span>
                  <span className="font-medium">{product.limits.storage}</span>
                </div>
              </div>
            </div>
          )}

          {/* CTA Button */}
          <Button
            onClick={handleSelect}
            className={cn(
              "w-full transition-all duration-300",
              tier === "PRO"
                ? "bg-[#D4AF37] text-black hover:bg-[#FFD700] hover:scale-105"
                : "bg-gray-900 text-white hover:bg-gray-800",
            )}
            size="lg"
          >
            {tier === "FREE" ? "Get Started Free" : "Start Free Trial"}
          </Button>

          {/* Trial Info */}
          {tier !== "FREE" && hasTrialDays(price) && (
            <p className="text-xs text-gray-500 text-center mt-3">
              {price.trialDays}-day free trial • Cancel anytime
            </p>
          )}
        </div>

        {/* Hover Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.1 : 0 }}
          className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] to-[#FFD700]"
        />
      </Card>
    </motion.div>
  );
};

export default PricingCard;
