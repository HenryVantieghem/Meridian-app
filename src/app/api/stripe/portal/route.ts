import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { 
  stripe, 
  createOrRetrieveCustomer,
  StripeError 
} from '@/lib/stripe/config';
import { z } from 'zod';

const portalSchema = z.object({
  returnUrl: z.string().url().optional(),
});

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
    const validatedData = portalSchema.parse(body);
    
    const { returnUrl } = validatedData;

    // Get or create customer
    const customer = await createOrRetrieveCustomer(
      userId,
      user.emailAddresses[0]?.emailAddress || '',
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined
    );

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      configuration: process.env.STRIPE_PORTAL_CONFIGURATION_ID,
    });

    return NextResponse.json({
      url: session.url,
    });

  } catch (error) {
    console.error('Portal session error:', error);
    
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
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
} 