import { Metadata } from 'next';
import { Hero } from '@/components/marketing/Hero';
import { Features } from '@/components/marketing/Features';
import { Testimonials } from '@/components/marketing/Testimonials';
import { CTA } from '@/components/marketing/CTA';
import { Pricing } from '@/components/marketing/Pricing';

export const metadata: Metadata = {
  title: 'Napoleon - Your AI Strategic Commander for Perfect Focus',
  description: 'Transform communication chaos into clarity through intelligent email management, AI-powered prioritization, and elegant UX design.',
  keywords: [
    'email management',
    'AI productivity',
    'email prioritization',
    'communication tools',
    'AI assistant',
    'productivity platform',
  ],
  openGraph: {
    title: 'Napoleon - Your AI Strategic Commander for Perfect Focus',
    description: 'Transform communication chaos into clarity through intelligent email management, AI-powered prioritization, and elegant UX design.',
    type: 'website',
    url: '/',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Napoleon - AI-Powered Email Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Napoleon - Your AI Strategic Commander for Perfect Focus',
    description: 'Transform communication chaos into clarity through intelligent email management, AI-powered prioritization, and elegant UX design.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/',
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Hero />
      
      {/* Features Section */}
      <Features />
      
      {/* Testimonials Section */}
      <Testimonials />
      
      {/* Pricing Preview Section */}
      <Pricing />
      
      {/* Call to Action Section */}
      <CTA />
    </div>
  );
} 