import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getBillingPortalUrl } from '@/lib/stripe/portal';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get billing portal URL
    const url = await getBillingPortalUrl();

    return NextResponse.json({ url });

  } catch (error) {
    console.error('Billing portal error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
} 