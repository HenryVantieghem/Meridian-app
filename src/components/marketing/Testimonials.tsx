"use client";

import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Napoleon has transformed how I manage my inbox. The AI prioritization saves me hours every day, and the intelligent replies are spot-on.",
    author: "Sarah Chen",
    title: "CEO, TechFlow Inc.",
    avatar: "/avatars/sarah-chen.jpg",
    rating: 5,
  },
  {
    quote:
      "As a busy executive, I need tools that work seamlessly. Napoleon's elegant design and powerful AI features have become indispensable to my workflow.",
    author: "Michael Rodriguez",
    title: "VP of Operations, GlobalCorp",
    avatar: "/avatars/michael-rodriguez.jpg",
    rating: 5,
  },
  {
    quote:
      "The time I've saved using Napoleon is incredible. What used to take 2 hours now takes 15 minutes. The ROI is immediate and substantial.",
    author: "Emily Watson",
    title: "Marketing Director, InnovateCo",
    avatar: "/avatars/emily-watson.jpg",
    rating: 5,
  },
  {
    quote:
      "Napoleon's security features give me peace of mind while the AI capabilities make me more productive than ever. It's the perfect balance.",
    author: "David Kim",
    title: "CTO, SecureTech",
    avatar: "/avatars/david-kim.jpg",
    rating: 5,
  },
  {
    quote:
      "The intelligent email analysis is game-changing. I can now focus on what matters most while Napoleon handles the routine communication tasks.",
    author: "Lisa Thompson",
    title: "Senior Manager, GrowthCo",
    avatar: "/avatars/lisa-thompson.jpg",
    rating: 5,
  },
  {
    quote:
      "Napoleon has become my AI strategic commander. It understands my communication style and helps me maintain professional relationships effortlessly.",
    author: "James Wilson",
    title: "Founder, StartupXYZ",
    avatar: "/avatars/james-wilson.jpg",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-gray-50">
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
            Loved by Professionals Worldwide
          </Typography>
          <Typography
            variant="body"
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Join thousands of executives and professionals who have transformed
            their email workflow with Napoleon.
          </Typography>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 h-full hover:shadow-lg transition-shadow duration-300">
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="w-8 h-8 text-primary-400" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>

                {/* Quote */}
                <Typography
                  variant="body"
                  className="text-gray-700 mb-6 leading-relaxed"
                >
                  &quot;{testimonial.quote}&quot;
                </Typography>

                {/* Author */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                    <Typography
                      variant="body"
                      className="text-gray-600 font-semibold"
                    >
                      {testimonial.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Typography>
                  </div>
                  <div>
                    <Typography
                      variant="body"
                      className="font-semibold text-gray-900"
                    >
                      {testimonial.author}
                    </Typography>
                    <Typography
                      variant="body"
                      className="text-gray-600 text-sm"
                    >
                      {testimonial.title}
                    </Typography>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <Typography
            variant="h3"
            className="text-2xl font-bold text-gray-900 mb-8"
          >
            Trusted by Leading Companies
          </Typography>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-gray-400 font-semibold">TechFlow Inc.</div>
            <div className="text-gray-400 font-semibold">GlobalCorp</div>
            <div className="text-gray-400 font-semibold">InnovateCo</div>
            <div className="text-gray-400 font-semibold">SecureTech</div>
            <div className="text-gray-400 font-semibold">GrowthCo</div>
            <div className="text-gray-400 font-semibold">StartupXYZ</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
