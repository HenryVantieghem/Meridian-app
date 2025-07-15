'use client';

import { useState } from 'react';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Crown, Shield, Zap, Target, Users, TrendingUp, Mail, MessageSquare, Clock, Star, Check } from 'lucide-react';

export default function LandingPage() {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [email, setEmail] = useState('');

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock waitlist submission
    setShowWaitlist(true);
    setTimeout(() => setShowWaitlist(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-cartier-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-cartier-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-brand-burgundy mr-2" />
              <Typography variant="h6" className="font-playfair font-bold text-black">
                Napoleon AI
              </Typography>
            </div>
            <div className="flex items-center space-x-4">
              {typeof window !== 'undefined' && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
                <>
                  <SignInButton mode="modal">
                    <Button variant="outline" className="rounded-full">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="bg-brand-burgundy text-white hover:bg-brand-burgundy/90 rounded-full">
                      Get Started
                    </Button>
                  </SignUpButton>
                </>
              ) : (
                <>
                  <Button variant="outline" className="rounded-full" onClick={() => alert('Authentication coming soon!')}>
                    Sign In
                  </Button>
                  <Button className="bg-brand-burgundy text-white hover:bg-brand-burgundy/90 rounded-full" onClick={() => alert('Get started coming soon!')}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge className="mb-6 bg-brand-burgundy/10 text-brand-burgundy border-brand-burgundy/20">
              <Crown className="w-3 h-3 mr-1" />
              Executive-Grade AI
            </Badge>
            
            <Typography variant="h1" className="text-6xl lg:text-7xl font-playfair font-bold text-black leading-tight mb-6">
              Transform Your Communication
              <br />
              <span className="text-brand-burgundy">Chaos into Strategic Clarity</span>
            </Typography>
            
            <Typography variant="h4" className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Napoleon AI is the strategic command center for C-suite executives and high-performing professionals. 
              Reclaim two full days per week with AI-powered email and Slack management.
            </Typography>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <SignUpButton mode="modal">
                <Button 
                  size="lg" 
                  className="bg-brand-burgundy text-white hover:bg-brand-burgundy/90 rounded-full px-8 py-4 text-lg"
                >
                  Request Access
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full px-8 py-4 text-lg"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See How It Works
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-8 text-gray-500 mb-16">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <span className="text-sm">Trusted by 500+ executives</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                <span className="text-sm">SOC 2 Type II Certified</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span className="text-sm">Save 10+ hours/week</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Typography variant="h2" className="text-4xl font-playfair font-bold text-black mb-4">
              Your Strategic Communication Command Center
            </Typography>
            <Typography variant="h6" className="text-xl text-gray-600 max-w-3xl mx-auto">
              Unified dashboard. AI-powered prioritization. Executive-grade security.
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="bg-brand-burgundy/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-brand-burgundy" />
                </div>
                <Typography variant="h6" className="font-bold text-black mb-4">
                  Strategic Daily Brief
                </Typography>
                <Typography variant="body1" className="text-gray-600">
                  Single-screen digest of critical communications across Gmail and Slack with AI-driven priority scoring.
                </Typography>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="bg-brand-burgundy/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Crown className="h-8 w-8 text-brand-burgundy" />
                </div>
                <Typography variant="h6" className="font-bold text-black mb-4">
                  VIP Intelligence
                </Typography>
                <Typography variant="body1" className="text-gray-600">
                  Automatic detection and prioritization of high-stakes communications from board members, investors, and key stakeholders.
                </Typography>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="bg-brand-burgundy/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-brand-burgundy" />
                </div>
                <Typography variant="h6" className="font-bold text-black mb-4">
                  AI-Powered Responses
                </Typography>
                <Typography variant="body1" className="text-gray-600">
                  Context-aware drafts with executive tone control. One-click replies that maintain your strategic voice.
                </Typography>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cartier-50 to-gold-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Typography variant="h2" className="text-4xl font-playfair font-bold text-black mb-4">
              From Chaos to Clarity in 3 Steps
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
                <div className="bg-brand-burgundy text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <Mail className="h-12 w-12 text-brand-burgundy mx-auto mb-4" />
                <Typography variant="h6" className="font-bold text-black mb-2">
                  Connect Your Accounts
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Seamless OAuth integration with Gmail and Slack. Setup in 60 seconds.
                </Typography>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
                <div className="bg-brand-burgundy text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <Users className="h-12 w-12 text-brand-burgundy mx-auto mb-4" />
                <Typography variant="h6" className="font-bold text-black mb-2">
                  Define Your VIPs
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Identify key stakeholders and relationships. AI learns your communication patterns.
                </Typography>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
                <div className="bg-brand-burgundy text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <TrendingUp className="h-12 w-12 text-brand-burgundy mx-auto mb-4" />
                <Typography variant="h6" className="font-bold text-black mb-2">
                  Execute with Precision
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Strategic daily briefings, AI-powered responses, and inbox zero celebrations.
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Typography variant="h2" className="text-4xl font-playfair font-bold text-black mb-4">
              Trusted by Strategic Leaders
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8">
              <CardContent>
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <Typography variant="body1" className="text-gray-700 mb-6 italic">
                  "Napoleon AI transformed how I handle board communications. What used to take hours now takes minutes."
                </Typography>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-brand-burgundy rounded-full flex items-center justify-center text-white font-bold mr-4">
                    SJ
                  </div>
                  <div>
                    <Typography variant="h6" className="font-bold text-black">
                      Sarah Johnson
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      CEO, TechCorp
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <Typography variant="body1" className="text-gray-700 mb-6 italic">
                  "The VIP detection is incredible. I never miss important investor communications anymore."
                </Typography>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-brand-burgundy rounded-full flex items-center justify-center text-white font-bold mr-4">
                    MR
                  </div>
                  <div>
                    <Typography variant="h6" className="font-bold text-black">
                      Michael Rodriguez
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Founder, StartupCo
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent>
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <Typography variant="body1" className="text-gray-700 mb-6 italic">
                  "Finally, an AI tool that understands executive communication. The ROI is immediate."
                </Typography>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-brand-burgundy rounded-full flex items-center justify-center text-white font-bold mr-4">
                    EC
                  </div>
                  <div>
                    <Typography variant="h6" className="font-bold text-black">
                      Emily Chen
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      COO, GlobalTech
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-brand-burgundy to-brand-burgundy/90">
        <div className="max-w-4xl mx-auto text-center">
          <Typography variant="h2" className="text-4xl font-playfair font-bold text-white mb-6">
            Ready to Transform Your Communication Strategy?
          </Typography>
          <Typography variant="h6" className="text-xl text-white/90 mb-8">
            Join 500+ executives who've reclaimed their time with Napoleon AI.
          </Typography>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignUpButton mode="modal">
              <Button 
                size="lg" 
                className="bg-white text-brand-burgundy hover:bg-gray-100 rounded-full px-8 py-4 text-lg"
              >
                Start Your Strategic Command Center
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </SignUpButton>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-6 text-white/70">
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2" />
              <span className="text-sm">30-day free trial</span>
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2" />
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2" />
              <span className="text-sm">Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Crown className="h-6 w-6 text-brand-burgundy mr-2" />
                <Typography variant="h6" className="font-playfair font-bold text-white">
                  Napoleon AI
                </Typography>
              </div>
              <Typography variant="body2" className="text-gray-400">
                The Strategic Command Center for Executive Communication
              </Typography>
            </div>
            
            <div>
              <Typography variant="h6" className="font-bold text-white mb-4">
                Product
              </Typography>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#security" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            
            <div>
              <Typography variant="h6" className="font-bold text-white mb-4">
                Company
              </Typography>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white">About</a></li>
                <li><a href="#careers" className="hover:text-white">Careers</a></li>
                <li><a href="#blog" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <Typography variant="h6" className="font-bold text-white mb-4">
                Support
              </Typography>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#help" className="hover:text-white">Help Center</a></li>
                <li><a href="#contact" className="hover:text-white">Contact</a></li>
                <li><a href="#status" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <Typography variant="body2" className="text-gray-400">
              © 2024 Napoleon AI. All rights reserved.
            </Typography>
          </div>
        </div>
      </footer>
    </div>
  );
}