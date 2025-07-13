'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Settings, 
  Users, 
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface BillingPortalProps {
  className?: string;
}

const FEATURES = [
  {
    title: 'Unlimited Email Analysis',
    description: 'AI-powered email prioritization and insights',
    icon: Zap,
  },
  {
    title: 'Team Collaboration',
    description: 'Share insights and delegate tasks seamlessly',
    icon: Users,
  },
  {
    title: 'Advanced Integrations',
    description: 'Connect with Gmail, Outlook, and Slack',
    icon: Settings,
  },
  {
    title: 'Priority Support',
    description: 'Get help when you need it most',
    icon: CheckCircle,
  },
];

export function BillingPortal({ className }: BillingPortalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePortalAccess = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to access billing portal');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Card>
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <CreditCard className="h-5 w-5" />
            Billing & Subscription
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Manage your subscription and billing information
          </div>
        </div>
        <div className="space-y-6 p-6">
          {/* Current Plan */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Pro Plan</h3>
              <p className="text-sm text-gray-500">
                $29/month • Unlimited everything
              </p>
            </div>
            <Badge variant="cartier">Active</Badge>
          </div>

          {/* Features */}
          <div className="grid gap-4">
            <h4 className="font-medium">Your Plan Includes:</h4>
            <div className="grid gap-3">
              {FEATURES.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <feature.icon className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">{feature.title}</p>
                    <p className="text-xs text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={handlePortalAccess}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Loading...' : 'Manage Billing'}
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 