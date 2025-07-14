import { describe, it, expect, vi, beforeEach } from 'vitest';
import { stripe, STRIPE_PRICE_PRO, STRIPE_PRICE_ENTERPRISE, createCheckoutSession, getBillingPortalUrl } from './stripe/config';

// Mock Stripe
vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: vi.fn(),
      },
    },
  })),
}));

describe('Stripe Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct price IDs', () => {
    expect(STRIPE_PRICE_PRO).toBeDefined();
    expect(STRIPE_PRICE_ENTERPRISE).toBeDefined();
  });

  it('should create checkout session', async () => {
    const mockSession = {
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/test',
    };

    const mockStripe = stripe as any;
    mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

    const result = await createCheckoutSession({
      priceId: STRIPE_PRICE_PRO,
      successUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel',
    });

    expect(result).toEqual(mockSession);
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: STRIPE_PRICE_PRO, quantity: 1 }],
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });
  });

  it('should create billing portal URL', async () => {
    const mockSession = {
      id: 'bps_test_123',
      url: 'https://billing.stripe.com/test',
    };

    const mockStripe = stripe as any;
    mockStripe.billingPortal.sessions.create.mockResolvedValue(mockSession);

    const result = await getBillingPortalUrl('cus_test_123');

    expect(result).toEqual(mockSession.url);
    expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: 'cus_test_123',
      return_url: 'http://localhost:3000/dashboard',
    });
  });

  it('should handle checkout session errors', async () => {
    const mockStripe = stripe as any;
    mockStripe.checkout.sessions.create.mockRejectedValue(new Error('Stripe error'));

    await expect(createCheckoutSession({
      priceId: STRIPE_PRICE_PRO,
      successUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel',
    })).rejects.toThrow('Stripe error');
  });

  it('should handle billing portal errors', async () => {
    const mockStripe = stripe as any;
    mockStripe.billingPortal.sessions.create.mockRejectedValue(new Error('Billing error'));

    await expect(getBillingPortalUrl('cus_test_123')).rejects.toThrow('Billing error');
  });
}); 