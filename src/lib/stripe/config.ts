import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

// Stripe configuration with proper error handling
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Stripe price IDs from environment
export const STRIPE_PRICE_PRO = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!;
export const STRIPE_PRICE_ENTERPRISE = process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE!;

// Product configuration
export const PRODUCTS = {
  FREE: {
    id: 'prod_free',
    name: 'Free',
    description: 'Basic email management',
    features: [
      'Up to 100 emails per month',
      'Basic AI analysis',
      'Email organization',
      'Mobile app access',
    ],
    limits: {
      emailsPerMonth: 100,
      aiAnalyses: 50,
      storage: '1GB',
    },
  },
  PRO: {
    id: 'prod_pro',
    name: 'Pro',
    description: 'Professional email management',
    features: [
      'Unlimited emails',
      'Advanced AI analysis',
      'Priority support',
      'Team collaboration',
      'Custom integrations',
      'Advanced analytics',
    ],
    limits: {
      emailsPerMonth: -1, // unlimited
      aiAnalyses: -1, // unlimited
      storage: '10GB',
    },
  },
  ENTERPRISE: {
    id: 'prod_enterprise',
    name: 'Enterprise',
    description: 'Enterprise-grade email management',
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Custom AI training',
      'Advanced security',
      'SLA guarantees',
      'On-premise options',
    ],
    limits: {
      emailsPerMonth: -1,
      aiAnalyses: -1,
      storage: '100GB',
    },
  },
} as const;

// Price configuration
export const PRICES = {
  PRO_MONTHLY: {
    id: 'price_pro_monthly',
    productId: PRODUCTS.PRO.id,
    amount: 2900, // $29.00
    currency: 'usd',
    interval: 'month',
    trialDays: 7,
  },
  PRO_YEARLY: {
    id: 'price_pro_yearly',
    productId: PRODUCTS.PRO.id,
    amount: 29000, // $290.00 (2 months free)
    currency: 'usd',
    interval: 'year',
    trialDays: 7,
  },
  ENTERPRISE_MONTHLY: {
    id: 'price_enterprise_monthly',
    productId: PRODUCTS.ENTERPRISE.id,
    amount: 9900, // $99.00
    currency: 'usd',
    interval: 'month',
    trialDays: 14,
  },
  ENTERPRISE_YEARLY: {
    id: 'price_enterprise_yearly',
    productId: PRODUCTS.ENTERPRISE.id,
    amount: 99000, // $990.00 (2 months free)
    currency: 'usd',
    interval: 'year',
    trialDays: 14,
  },
} as const;

// Webhook events to handle
export const WEBHOOK_EVENTS = [
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'customer.subscription.trial_will_end',
  'customer.subscription.trial_ended',
] as const;

// Subscription status mapping
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
  TRIALING: 'trialing',
  UNPAID: 'unpaid',
} as const;

// Error handling utilities
export class StripeError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'StripeError';
  }
}

export const handleStripeError = (error: any): StripeError => {
  if (error instanceof Stripe.errors.StripeError) {
    return new StripeError(
      error.message,
      error.code || 'stripe_error',
      error.statusCode || 400
    );
  }
  
  return new StripeError(
    'An unexpected error occurred',
    'unknown_error',
    500
  );
};

// Webhook signature verification
export const verifyWebhookSignature = async (
  request: NextRequest,
  body: string
): Promise<Stripe.Event> => {
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');
  
  if (!signature) {
    throw new StripeError(
      'Missing Stripe signature',
      'missing_signature',
      400
    );
  }

  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    throw new StripeError(
      'Invalid webhook signature',
      'invalid_signature',
      400
    );
  }
};

// Customer management utilities
export const createOrRetrieveCustomer = async (
  userId: string,
  email: string,
  name?: string
): Promise<Stripe.Customer> => {
  try {
    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      const customer = existingCustomers.data[0];
      
      // Update metadata if needed
      if (customer.metadata.userId !== userId) {
        await stripe.customers.update(customer.id, {
          metadata: {
            ...customer.metadata,
            userId,
          },
        });
      }
      
      return customer;
    }

    // Create new customer
    return await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });
  } catch (error) {
    throw handleStripeError(error);
  }
};

// Subscription management utilities
export const getSubscription = async (
  subscriptionId: string
): Promise<Stripe.Subscription | null> => {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError && error.code === 'resource_missing') {
      return null;
    }
    throw handleStripeError(error);
  }
};

export const cancelSubscription = async (
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Stripe.Subscription> => {
  try {
    if (cancelAtPeriodEnd) {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      return await stripe.subscriptions.cancel(subscriptionId);
    }
  } catch (error) {
    throw handleStripeError(error);
  }
};

// Product and price utilities
export const getProduct = async (productId: string): Promise<Stripe.Product | null> => {
  try {
    return await stripe.products.retrieve(productId);
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError && error.code === 'resource_missing') {
      return null;
    }
    throw handleStripeError(error);
  }
};

export const getPrice = async (priceId: string): Promise<Stripe.Price | null> => {
  try {
    return await stripe.prices.retrieve(priceId);
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError && error.code === 'resource_missing') {
      return null;
    }
    throw handleStripeError(error);
  }
};

// Usage tracking utilities
export const createUsageRecord = async (
  subscriptionItemId: string,
  quantity: number,
  timestamp: number = Math.floor(Date.now() / 1000)
): Promise<Stripe.UsageRecord> => {
  try {
    return await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
      quantity,
      timestamp,
    });
  } catch (error) {
    throw handleStripeError(error);
  }
};

// Invoice management
export const createInvoice = async (
  customerId: string,
  items: Array<{ price: string; quantity?: number }>,
  metadata?: Record<string, string>
): Promise<Stripe.Invoice> => {
  try {
    // Create a basic invoice without line items for now
    // In production, you would add line items properly
    return await stripe.invoices.create({
      customer: customerId,
      collection_method: 'charge_automatically',
      metadata,
    });
  } catch (error) {
    throw handleStripeError(error);
  }
};

// Payment method management
export const attachPaymentMethod = async (
  customerId: string,
  paymentMethodId: string
): Promise<Stripe.PaymentMethod> => {
  try {
    return await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  } catch (error) {
    throw handleStripeError(error);
  }
};

// Security utilities
export const sanitizeStripeObject = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sensitiveFields = ['secret', 'key', 'password', 'token'];
  const sanitized = { ...obj };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
};

// Logging utilities
export const logStripeEvent = (event: Stripe.Event, metadata?: any) => {
  console.log('Stripe Event:', {
    id: event.id,
    type: event.type,
    created: new Date(event.created * 1000).toISOString(),
    metadata: sanitizeStripeObject(metadata),
  });
};

// Type exports
export type ProductId = keyof typeof PRODUCTS;
export type PriceId = keyof typeof PRICES;
export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS];
export type WebhookEvent = typeof WEBHOOK_EVENTS[number]; 