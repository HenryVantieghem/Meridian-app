'use client';

import { useState } from 'react';
import { Typography } from '@/components/ui/typography';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "How does Meridian's AI analyze my emails?",
    answer: "Meridian uses advanced GPT-4 technology to analyze your emails in real-time. It extracts key insights, identifies sentiment, detects urgency, and generates actionable summaries. The AI learns your communication patterns to provide increasingly personalized insights."
  },
  {
    question: "Is my email data secure?",
    answer: "Absolutely. We use bank-level encryption, SOC 2 compliance, and zero-knowledge architecture. Your data never leaves our secure infrastructure, and we never access your email content without your explicit permission."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time with no penalties. Your account will remain active until the end of your current billing period, and you can reactivate anytime."
  },
  {
    question: "What email providers do you support?",
    answer: "We currently support Gmail and Outlook, with more providers coming soon. Our integration is seamless and takes just a few minutes to set up."
  },
  {
    question: "Do you offer a free trial?",
    answer: "Yes! All plans include a 14-day free trial with full access to all features. No credit card required to start your trial."
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer: "You can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the end of your current billing period."
  },
  {
    question: "What kind of support do you provide?",
    answer: "Free users get email support, Pro users get priority support with faster response times, and Enterprise users get dedicated support with SLA guarantees."
  },
  {
    question: "Is Meridian available on mobile?",
    answer: "Yes! Meridian is fully responsive and works great on all devices. We also offer native mobile apps for iOS and Android for the best experience."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Typography variant="h2" className="text-4xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </Typography>
          <Typography variant="body" className="text-xl text-gray-600">
            Everything you need to know about Meridian
          </Typography>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <Typography variant="h3" className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </Typography>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-4"
                >
                  <Typography variant="body" className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </Typography>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Typography variant="h3" className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </Typography>
          <Typography variant="body" className="text-gray-600 mb-6">
            Our team is here to help you get the most out of Meridian.
          </Typography>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/demo"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Schedule Demo
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 