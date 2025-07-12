import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { 
  stripe, 
  createOrRetrieveCustomer, 
  PRICES, 
  PRODUCTS,
  handleStripeError,
  StripeError 
} from '@/lib/stripe/config';
import { z } from 'zod';

// Validation schemas
const checkoutSchema = z.object({
  priceId: z.string().refine(
    (id) => Object.values(PRICES).some(price => price.id === id),
    'Invalid price ID'
  ),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  metadata: z.record(z.string()).optional(),
});

// Unused schema - kept for type inference
// const createCheckoutSessionSchema = z.object({
//   customerId: z.string(),
//   priceId: z.string(),
//   successUrl: z.string(),
//   cancelUrl: z.string(),
//   metadata: z.record(z.string()).optional(),
// });

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = checkoutSchema.parse(body);
    
    const { priceId, successUrl, cancelUrl, metadata } = validatedData;

    // Get price details
    const price = Object.values(PRICES).find(p => p.id === priceId);
    if (!price) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Get product details
    const product = Object.values(PRODUCTS).find(p => p.id === price.productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Create or retrieve customer
    const customer = await createOrRetrieveCustomer(
      userId,
      user.emailAddresses[0]?.emailAddress || '',
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined
    );

    // Build success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const defaultSuccessUrl = `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = `${baseUrl}/pricing?canceled=true`;

    // Create checkout session
    const session = await createCheckoutSession({
      customerId: customer.id,
      priceId,
      successUrl: successUrl || defaultSuccessUrl,
      cancelUrl: cancelUrl || defaultCancelUrl,
      metadata: {
        userId,
        productId: product.id,
        productName: product.name,
        ...metadata,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    
    if (error instanceof StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  metadata,
}: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const price = Object.values(PRICES).find(p => p.id === priceId);
  if (!price) {
    throw new StripeError('Invalid price ID', 'invalid_price', 400);
  }

  const product = Object.values(PRODUCTS).find(p => p.id === price.productId);
  if (!product) {
    throw new StripeError('Invalid product ID', 'invalid_product', 400);
  }

  // Build line items
  const lineItems = [
    {
      price: priceId,
      quantity: 1,
    },
  ];

  // Add trial period if applicable
  const subscriptionData: any = {
    metadata,
    trial_period_days: price.trialDays,
  };

  // Add billing cycle anchor for yearly plans
  if (price.interval === 'year') {
    subscriptionData.billing_cycle_anchor = 'now';
  }

  // Add proration and default payment method to subscriptionData
  subscriptionData.proration_behavior = 'create_prorations';
  subscriptionData.default_payment_method = 'pm_card_visa';

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: subscriptionData,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    customer_update: {
      address: 'auto',
      name: 'auto',
    },
    metadata: {
      userId: metadata?.userId || '',
      productId: product.id,
      productName: product.name,
      priceId,
      priceAmount: price.amount.toString(),
      priceCurrency: price.currency,
      priceInterval: price.interval,
    },
    // Custom fields for better UX
    custom_fields: [
      {
        key: 'company',
        label: {
          type: 'custom',
          custom: 'Company (Optional)',
        },
        type: 'text',
        optional: true,
      },
    ],
  });

  return session;
}

// GET endpoint for retrieving session details
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Retrieve session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    // Verify session belongs to user
    if (session.metadata?.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        subscription: session.subscription,
        customer: session.customer,
        metadata: session.metadata,
      },
    });

  } catch (error) {
    console.error('Session retrieval error:', error);
    
    if (error instanceof StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 