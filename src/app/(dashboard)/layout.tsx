import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Napoleon AI',
  description: 'Your AI Strategic Commander dashboard for intelligent email management and productivity.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-cream">
      {children}
    </div>
  );
} 