"use client";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Clock, Shield } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <Typography
              variant="h2"
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Ready to Transform Your Email Workflow?
            </Typography>
            <Typography
              variant="body"
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8"
            >
              Join thousands of professionals who have already discovered the
              power of AI-driven email management.
            </Typography>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button
              size="lg"
              className="text-lg px-8 py-4 bg-primary-600 hover:bg-primary-700"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              Schedule a Demo
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center space-x-3">
              <Clock className="w-6 h-6 text-primary-600" />
              <div className="text-left">
                <Typography
                  variant="body"
                  className="font-semibold text-gray-900"
                >
                  Setup in 2 minutes
                </Typography>
                <Typography variant="body" className="text-sm text-gray-600">
                  No complex configuration
                </Typography>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <Shield className="w-6 h-6 text-primary-600" />
              <div className="text-left">
                <Typography
                  variant="body"
                  className="font-semibold text-gray-900"
                >
                  Enterprise Security
                </Typography>
                <Typography variant="body" className="text-sm text-gray-600">
                  SOC 2 compliant
                </Typography>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <Sparkles className="w-6 h-6 text-primary-600" />
              <div className="text-left">
                <Typography
                  variant="body"
                  className="font-semibold text-gray-900"
                >
                  AI-Powered
                </Typography>
                <Typography variant="body" className="text-sm text-gray-600">
                  GPT-4 technology
                </Typography>
              </div>
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <Typography variant="body" className="text-gray-600 mb-4">
              Trusted by executives at:
            </Typography>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-gray-500 font-medium">TechFlow Inc.</div>
              <div className="text-gray-500 font-medium">GlobalCorp</div>
              <div className="text-gray-500 font-medium">InnovateCo</div>
              <div className="text-gray-500 font-medium">SecureTech</div>
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
            className="mt-12 p-8 bg-white rounded-2xl shadow-lg max-w-2xl mx-auto"
          >
            <Typography
              variant="h3"
              className="text-2xl font-bold text-gray-900 mb-4"
            >
              Limited Time Offer
            </Typography>
            <Typography variant="body" className="text-gray-600 mb-6">
              Get 50% off your first 3 months when you start today. No
              commitment, cancel anytime.
            </Typography>
            <Button
              size="lg"
              className="w-full bg-primary-600 hover:bg-primary-700"
            >
              Claim Your Discount
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
