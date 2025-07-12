import { Metadata } from 'next';
import { Hero } from '@/components/marketing/Hero';
import { Features } from '@/components/marketing/Features';
import { Testimonials } from '@/components/marketing/Testimonials';
import { CTA } from '@/components/marketing/CTA';
import { Pricing } from '@/components/marketing/Pricing';

export const metadata: Metadata = {
  title: 'Napoleon - The Ultimate AI Strategic Commander for Executive Excellence',
  description: 'The luxury AI-powered productivity platform that transforms communication chaos into strategic clarity. Designed for C-level executives who demand excellence.',
  keywords: [
    'executive productivity',
    'AI strategic commander',
    'luxury productivity platform',
    'executive email management',
    'AI-powered prioritization',
    'C-level communication tools',
    'strategic AI assistant',
    'executive productivity platform',
  ],
  openGraph: {
    title: 'Napoleon - The Ultimate AI Strategic Commander for Executive Excellence',
    description: 'The luxury AI-powered productivity platform that transforms communication chaos into strategic clarity. Designed for C-level executives who demand excellence.',
    type: 'website',
    url: '/',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Napoleon - Luxury AI Strategic Commander',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Napoleon - The Ultimate AI Strategic Commander for Executive Excellence',
    description: 'The luxury AI-powered productivity platform that transforms communication chaos into strategic clarity. Designed for C-level executives who demand excellence.',
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