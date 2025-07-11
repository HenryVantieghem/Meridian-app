# Stripe Integration - Super Intelligence AI

Complete subscription management system for Super Intelligence with secure payment processing, webhook handling, and user experience optimization.

## Features

### 🔐 **Security & Compliance**
- Webhook signature verification
- Input validation with Zod schemas
- Proper error handling and logging
- PCI DSS compliant payment processing
- Rate limiting and abuse prevention

### 💳 **Payment Processing**
- Stripe Checkout integration
- Customer portal access
- Subscription lifecycle management
- Trial period handling
- Payment method management

### 🎨 **User Experience**
- Smooth checkout flow
- Loading states and error handling
- Payment status feedback
- Billing portal integration
- Responsive design

## Setup Instructions

### 1. Environment Variables

Add these to your `.env.local`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PORTAL_CONFIGURATION_ID=bpc_...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Stripe Dashboard Setup

1. **Create Products & Prices**
   - Pro Monthly: $29/month
   - Pro Yearly: $290/year (2 months free)
   - Enterprise Monthly: $99/month
   - Enterprise Yearly: $990/year (2 months free)

2. **Configure Webhooks**
   - Endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Events: `customer.subscription.*`, `invoice.payment_*`, `customer.subscription.trial_*`

3. **Setup Customer Portal**
   - Create portal configuration
   - Enable subscription management
   - Configure return URLs

### 3. Database Schema

Ensure your `users` table includes:

```sql
ALTER TABLE users ADD COLUMN subscription_id TEXT;
ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN current_period_start TIMESTAMP;
ALTER TABLE users ADD COLUMN current_period_end TIMESTAMP;
ALTER TABLE users ADD COLUMN trial_end TIMESTAMP;
ALTER TABLE users ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN payment_status TEXT;
ALTER TABLE users ADD COLUMN last_payment_date TIMESTAMP;
```

## API Endpoints

### Checkout
- `POST /api/stripe/checkout` - Create checkout session
- `GET /api/stripe/checkout?session_id=...` - Retrieve session details

### Billing Management
- `GET /api/stripe/billing` - Fetch user billing data
- `POST /api/stripe/portal` - Create customer portal session

### Webhooks
- `POST /api/webhooks/stripe` - Handle Stripe webhook events

## Component Usage

### Pricing Cards

```tsx
import { PricingCard } from '@/components/billing';

<PricingCard
  tier="PRO"
  isPopular={true}
  isYearly={false}
  onSelect={(priceId) => {
    // Handle price selection
  }}
/>
```

### Checkout Buttons

```tsx
import { ProCheckoutButton, EnterpriseCheckoutButton } from '@/components/billing';

<ProCheckoutButton
  isYearly={false}
  onSuccess={(sessionId) => {
    console.log('Checkout successful:', sessionId);
  }}
  onError={(error) => {
    console.error('Checkout failed:', error);
  }}
>
  Start Pro Trial
</ProCheckoutButton>
```

### Billing Portal

```tsx
import { BillingPortal } from '@/components/billing';

<BillingPortal
  onPortalOpen={() => {
    console.log('Portal opened');
  }}
  onPortalClose={() => {
    console.log('Portal closed');
  }}
/>
```

### Payment Status

```tsx
import { PaymentSuccess, PaymentError, PaymentLoading } from '@/components/billing';

<PaymentSuccess
  subscriptionTier="Pro"
  nextBillingDate="2024-02-01"
  sessionId="cs_..."
  onDismiss={() => {
    // Handle dismiss
  }}
/>

<PaymentError
  errorCode="card_declined"
  retryable={true}
  onRetry={() => {
    // Retry payment
  }}
/>
```

## Webhook Events

### Subscription Lifecycle
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changes
- `customer.subscription.deleted` - Subscription cancellation

### Payment Events
- `invoice.payment_succeeded` - Successful payment
- `invoice.payment_failed` - Failed payment

### Trial Events
- `customer.subscription.trial_will_end` - Trial ending soon
- `customer.subscription.trial_ended` - Trial ended

## Security Measures

### 1. Webhook Verification
```typescript
const event = await verifyWebhookSignature(request, body);
```

### 2. Input Validation
```typescript
const validatedData = checkoutSchema.parse(body);
```

### 3. Error Handling
```typescript
if (error instanceof StripeError) {
  return NextResponse.json(
    { error: error.message },
    { status: error.statusCode }
  );
}
```

### 4. User Authentication
```typescript
const { userId, user } = await auth();
if (!userId || !user) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}
```

## Testing

### 1. Stripe CLI Testing
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test webhook events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

### 2. Test Cards
- Success: `4242424242424242`
- Decline: `4000000000000002`
- Insufficient funds: `4000000000009995`

### 3. Test Scenarios
- New subscription creation
- Subscription upgrades/downgrades
- Payment failures and retries
- Trial period management
- Subscription cancellation

## Error Handling

### Common Errors
- `card_declined` - Card was declined
- `insufficient_funds` - Insufficient funds
- `expired_card` - Card has expired
- `invalid_cvc` - Invalid CVC
- `processing_error` - Processing error

### Error Recovery
- Automatic retry for transient failures
- User-friendly error messages
- Graceful degradation
- Logging for debugging

## Performance Optimization

### 1. Caching
- Cache customer data
- Cache subscription status
- Cache product/price data

### 2. Rate Limiting
- Implement rate limiting on API endpoints
- Use Stripe's built-in rate limits
- Monitor usage patterns

### 3. Database Optimization
- Index subscription fields
- Use efficient queries
- Implement connection pooling

## Monitoring & Analytics

### 1. Metrics to Track
- Conversion rates
- Payment success rates
- Churn rates
- Revenue metrics
- Error rates

### 2. Logging
- Payment events
- Webhook processing
- Error tracking
- User actions

### 3. Alerts
- Failed payments
- Webhook failures
- High error rates
- Revenue anomalies

## Deployment Checklist

### 1. Environment Setup
- [ ] Stripe keys configured
- [ ] Webhook endpoints registered
- [ ] Portal configuration created
- [ ] Database schema updated

### 2. Security
- [ ] HTTPS enabled
- [ ] Webhook signatures verified
- [ ] Input validation implemented
- [ ] Error handling configured

### 3. Testing
- [ ] Webhook events tested
- [ ] Payment flows verified
- [ ] Error scenarios tested
- [ ] User experience validated

### 4. Monitoring
- [ ] Logging configured
- [ ] Metrics tracking enabled
- [ ] Alerts set up
- [ ] Performance monitoring

## Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**
   - Check webhook endpoint URL
   - Verify webhook secret
   - Check Stripe dashboard logs

2. **Payment Failures**
   - Verify card details
   - Check Stripe dashboard
   - Review error codes

3. **Subscription Not Updating**
   - Check webhook processing
   - Verify database updates
   - Review user authentication

### Debug Tools
- Stripe Dashboard
- Stripe CLI
- Webhook logs
- Database queries
- Network monitoring

## Future Enhancements

### 1. Advanced Features
- Usage-based billing
- Custom pricing tiers
- Promotional codes
- Referral programs

### 2. Integrations
- Analytics platforms
- CRM systems
- Email marketing
- Customer support

### 3. Optimization
- A/B testing
- Conversion optimization
- Performance improvements
- User experience enhancements

## Support

For issues or questions:
1. Check Stripe documentation
2. Review webhook logs
3. Test with Stripe CLI
4. Contact support team

## License

This subscription system follows the same license as the main project. 