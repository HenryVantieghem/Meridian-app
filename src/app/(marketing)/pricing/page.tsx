import { Metadata } from 'next';
import { Pricing } from '@/components/marketing/Pricing';
import { FAQ } from '@/components/marketing/FAQ';

export const metadata: Metadata = {
  title: 'Pricing - Meridian',
  description: 'Simple, transparent pricing for AI-powered email management. Choose the plan that fits your needs.',
  openGraph: {
    title: 'Pricing - Meridian',
    description: 'Simple, transparent pricing for AI-powered email management.',
  },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Pricing />
      <FAQ />
    </div>
  );
} 