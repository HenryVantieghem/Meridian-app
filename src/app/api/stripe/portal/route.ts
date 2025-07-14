import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { auth } from '@clerk/nextjs/server';

export async function POST() {
  try {
    // Get user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get customer ID from user
    const customer = await stripe.customers.list({
      email: userId, // This should be the user's email
      limit: 1,
    });

    if (!customer.data.length) {
      return NextResponse.json(
        { error: 'No customer found' },
        { status: 404 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.data[0].id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
} 