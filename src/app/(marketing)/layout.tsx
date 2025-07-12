import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Napoleon AI · AI Strategic Commander',
  description: 'Transform communication chaos into clarity through intelligent email management, AI-powered prioritization, and elegant UX design.',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
} 