import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';

export async function POST() {
  try {
    const session = await stripe.billingPortal.sessions.create({
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