"use client";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for individuals getting started",
    features: [
      "100 emails per month",
      "Basic AI analysis",
      "Email prioritization",
      "Mobile app access",
      "Standard support",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For professionals who need more power",
    features: [
      "1,000 emails per month",
      "Advanced AI analysis",
      "Smart reply generation",
      "Priority email alerts",
      "Team collaboration",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "per month",
    description: "For teams and organizations",
    features: [
      "Unlimited emails",
      "Advanced AI features",
      "Custom AI training",
      "Dedicated support",
      "SLA guarantees",
      "Custom integrations",
      "Advanced analytics",
      "White-label options",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Typography
            variant="h2"
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Simple, Transparent Pricing
          </Typography>
          <Typography
            variant="body"
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Choose the plan that fits your needs. All plans include our core AI
            features.
          </Typography>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Most Popular
                  </div>
                </div>
              )}

              <Card
                className={`p-8 h-full ${plan.popular ? "border-primary-500 shadow-lg" : ""}`}
              >
                <div className="text-center mb-8">
                  <Typography
                    variant="h3"
                    className="text-2xl font-bold text-gray-900 mb-2"
                  >
                    {plan.name}
                  </Typography>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className="text-gray-600 ml-2">/{plan.period}</span>
                    )}
                  </div>
                  <Typography variant="body" className="text-gray-600">
                    {plan.description}
                  </Typography>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <Typography variant="body" className="text-gray-700">
                        {feature}
                      </Typography>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full ${plan.popular ? "bg-primary-600 hover:bg-primary-700" : "bg-gray-900 hover:bg-gray-800"}`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Typography variant="body" className="text-gray-600 mb-4">
            All plans include a 14-day free trial. No credit card required.
          </Typography>
          <Typography variant="body" className="text-gray-600">
            Need a custom plan?{" "}
            <a
              href="/contact"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Contact our sales team
            </a>
          </Typography>
        </motion.div>
      </div>
    </section>
  );
}
