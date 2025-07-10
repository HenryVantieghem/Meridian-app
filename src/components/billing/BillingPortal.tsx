"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Calendar, 
  Download, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Loader2,
  Shield,
  Zap,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SUBSCRIPTION_STATUS, PRODUCTS } from "@/lib/stripe/config";

interface Subscription {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  trial_end?: number;
  product: {
    id: string;
    name: string;
  };
  price: {
    id: string;
    unit_amount: number;
    currency: string;
    interval: string;
  };
}

interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  invoice_settings: {
    default_payment_method?: {
      id: string;
      card: {
        brand: string;
        last4: string;
        exp_month: number;
        exp_year: number;
      };
    };
  };
}

interface BillingPortalProps {
  className?: string;
  onPortalOpen?: () => void;
  onPortalClose?: () => void;
}

export const BillingPortal: React.FC<BillingPortalProps> = ({
  className,
  onPortalOpen,
  onPortalClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/billing');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch billing data');
      }

      setSubscription(data.subscription);
      setCustomer(data.customer);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load billing data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      setPortalUrl(data.url);
      onPortalOpen?.();

      // Open portal in new window/tab
      window.open(data.url, '_blank');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open billing portal';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case SUBSCRIPTION_STATUS.ACTIVE:
        return 'bg-green-100 text-green-800';
      case SUBSCRIPTION_STATUS.TRIALING:
        return 'bg-blue-100 text-blue-800';
      case SUBSCRIPTION_STATUS.PAST_DUE:
        return 'bg-red-100 text-red-800';
      case SUBSCRIPTION_STATUS.CANCELED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case SUBSCRIPTION_STATUS.ACTIVE:
        return <CheckCircle className="w-4 h-4" />;
      case SUBSCRIPTION_STATUS.TRIALING:
        return <Clock className="w-4 h-4" />;
      case SUBSCRIPTION_STATUS.PAST_DUE:
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getProductIcon = (productId: string) => {
    if (productId.includes('pro')) return <Zap className="w-4 h-4" />;
    if (productId.includes('enterprise')) return <Crown className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Billing Error</h3>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchBillingData} variant="outline">
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Subscription Overview */}
      {subscription && (
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Current Subscription
              </h3>
              <div className="flex items-center gap-2">
                {getProductIcon(subscription.product.id)}
                <span className="font-medium text-gray-700">
                  {subscription.product.name}
                </span>
                <Badge className={getStatusColor(subscription.status)}>
                  {getStatusIcon(subscription.status)}
                  {subscription.status}
                </Badge>
              </div>
            </div>
            
            <Button
              onClick={openCustomerPortal}
              disabled={isLoading}
              className="bg-[#D4AF37] text-black hover:bg-[#FFD700]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Settings className="w-4 h-4" />
              )}
              Manage Billing
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Billing Details */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Billing Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium">
                    {formatCurrency(subscription.price.unit_amount, subscription.price.currency)}
                    /{subscription.price.interval}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Period</span>
                  <span className="font-medium">
                    {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                  </span>
                </div>
                {subscription.trial_end && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trial Ends</span>
                    <span className="font-medium">
                      {formatDate(subscription.trial_end)}
                    </span>
                  </div>
                )}
                {subscription.cancel_at_period_end && (
                  <div className="flex justify-between">
                    <span className="text-red-600">Cancels</span>
                    <span className="font-medium text-red-600">
                      {formatDate(subscription.current_period_end)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            {customer?.invoice_settings.default_payment_method && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Payment Method</h4>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium">
                      {customer.invoice_settings.default_payment_method.card.brand.toUpperCase()} •••• {customer.invoice_settings.default_payment_method.card.last4}
                    </div>
                    <div className="text-sm text-gray-600">
                      Expires {customer.invoice_settings.default_payment_method.card.exp_month}/{customer.invoice_settings.default_payment_method.card.exp_year}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Customer Information */}
      {customer && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Name</span>
                <span className="text-sm font-medium">{customer.name || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-sm font-medium">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Phone</span>
                  <span className="text-sm font-medium">{customer.phone}</span>
                </div>
              )}
            </div>
            
            {customer.address && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Address</span>
                </div>
                <div className="text-sm space-y-1">
                  {customer.address.line1 && <div>{customer.address.line1}</div>}
                  {customer.address.line2 && <div>{customer.address.line2}</div>}
                  <div>
                    {customer.address.city}, {customer.address.state} {customer.address.postal_code}
                  </div>
                  {customer.address.country && <div>{customer.address.country}</div>}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Button
            onClick={openCustomerPortal}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Manage Subscription
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => window.open('/api/stripe/invoices', '_blank')}
          >
            <Download className="w-4 h-4" />
            Download Invoices
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => window.open('/support', '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            Get Support
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BillingPortal; 