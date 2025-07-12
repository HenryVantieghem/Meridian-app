'use client';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, Zap, Shield, Crown } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#F8F6F0] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-[rgba(128,27,43,0.1)] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#F8F6F0] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-6 py-3 rounded-full bg-[rgba(93,0,30,0.1)] border border-[rgba(93,0,30,0.2)] mb-8"
          >
            <Crown className="w-5 h-5 text-brand-burgundy mr-3" />
            <span className="text-brand-burgundy font-medium text-body-cartier">
              Luxury AI Strategic Commander
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-hero-cartier text-black font-serif mb-6 leading-tight">
              The Ultimate
              <br />
              <span className="text-brand-burgundy">AI Strategic Commander</span>
              <br />
              for Executive Excellence
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <p className="text-body-cartier text-[#4A4A4A] max-w-4xl mx-auto leading-relaxed">
              Transform communication chaos into strategic clarity through intelligent email management, 
              AI-powered prioritization, and luxury UX design. Designed for C-level executives who demand excellence.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <Button 
              variant="cartier" 
              size="xl" 
              className="text-lg px-10 py-4"
              aria-label="Begin strategic trial - Start your free trial of Napoleon AI"
            >
              Begin Strategic Trial
              <ArrowRight className="ml-3 w-5 h-5" aria-hidden="true" />
            </Button>
            <Button 
              variant="cartier-secondary" 
              size="xl" 
              className="text-lg px-10 py-4"
              aria-label="Watch executive demo - View a demonstration of Napoleon AI features"
            >
              <Play className="mr-3 w-5 h-5" aria-hidden="true" />
              Executive Demo
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-12 text-[#4A4A4A]"
            role="list"
            aria-label="Trust indicators and features"
          >
            <div className="flex items-center" role="listitem">
              <Shield className="w-6 h-6 mr-3 text-brand-burgundy" aria-hidden="true" />
              <span className="text-body-cartier font-medium">Enterprise Security</span>
            </div>
            <div className="flex items-center" role="listitem">
              <Zap className="w-6 h-6 mr-3 text-brand-burgundy" aria-hidden="true" />
              <span className="text-body-cartier font-medium">Lightning Performance</span>
            </div>
            <div className="flex items-center" role="listitem">
              <Sparkles className="w-6 h-6 mr-3 text-brand-burgundy" aria-hidden="true" />
              <span className="text-body-cartier font-medium">AI-Powered Intelligence</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex space-x-3">
          <div className="w-3 h-3 bg-brand-burgundy rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-brand-burgundy rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-brand-burgundy rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </motion.div>
    </section>
  );
} 