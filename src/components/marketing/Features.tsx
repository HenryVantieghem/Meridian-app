'use client';

import { Typography } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Target, 
  Clock, 
  Shield, 
  Zap, 
  Sparkles,
  Mail,
  BarChart3,
  Smartphone,
  Users
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Advanced AI analyzes your emails in real-time, extracting key insights, sentiment, and actionable items.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    icon: Target,
    title: 'Smart Prioritization',
    description: 'Automatically prioritize emails based on urgency, importance, and your communication patterns.',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    icon: Clock,
    title: 'Time-Saving Automation',
    description: 'Generate intelligent replies, schedule follow-ups, and automate routine email tasks.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level encryption, SOC 2 compliance, and zero-knowledge architecture for your data.',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built for speed with real-time processing and instant email synchronization.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  {
    icon: Sparkles,
    title: 'Elegant Design',
    description: 'Beautiful, intuitive interface that adapts to your workflow and preferences.',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50'
  }
];

const stats = [
  { number: '95%', label: 'Time Saved' },
  { number: '10x', label: 'Faster Processing' },
  { number: '99.9%', label: 'Uptime' },
  { number: '50k+', label: 'Emails Analyzed' }
];

export function Features() {
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
          <Typography variant="h2" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Supercharge Your Email Workflow
          </Typography>
          <Typography variant="body" className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of email management with AI-powered features designed for modern professionals.
          </Typography>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 h-full hover:shadow-lg transition-shadow duration-300">
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <Typography variant="h3" className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </Typography>
                <Typography variant="body" className="text-gray-600">
                  {feature.description}
                </Typography>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gray-50 rounded-2xl p-8 md:p-12"
        >
          <div className="text-center mb-12">
            <Typography variant="h3" className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Professionals Worldwide
            </Typography>
            <Typography variant="body" className="text-gray-600">
              Join thousands of executives, managers, and professionals who trust Super Intelligence with their communication.
            </Typography>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <Typography variant="h2" className="text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </Typography>
                <Typography variant="body" className="text-gray-600 font-medium">
                  {stat.label}
                </Typography>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Integration Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <Typography variant="h3" className="text-3xl font-bold text-gray-900 mb-8">
            Seamless Integration
          </Typography>
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
            <div className="flex items-center space-x-2">
              <Mail className="w-6 h-6" />
              <span>Gmail</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-6 h-6" />
              <span>Outlook</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-6 h-6" />
              <span>Analytics</span>
            </div>
            <div className="flex items-center space-x-2">
              <Smartphone className="w-6 h-6" />
              <span>Mobile</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6" />
              <span>Teams</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 