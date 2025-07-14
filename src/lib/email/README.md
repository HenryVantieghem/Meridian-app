# Email System - Napoleon AI

A comprehensive transactional email system for Napoleon AI, built with Resend, featuring automation, templates, analytics, and management capabilities.

## Features

- **Transactional Emails**: Welcome, billing, notifications, and digest emails
- **Template System**: Reusable, responsive email templates
- **Automation**: Triggered emails based on user actions
- **Analytics**: Track open rates, click rates, and engagement
- **Management**: Email preferences, unsubscribe handling
- **Testing**: Local email preview and testing tools

## Configuration

### Environment Variables

```env
# Resend Configuration
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@super-intelligence.ai
RESEND_REPLY_TO=support@super-intelligence.ai

# Email Domain Configuration
EMAIL_DOMAIN=super-intelligence.ai
EMAIL_SUPPORT=support@super-intelligence.ai

# Email URLs
EMAIL_DASHBOARD_URL=https://super-intelligence.ai/dashboard
EMAIL_UNSUBSCRIBE_URL=https://super-intelligence.ai/unsubscribe
EMAIL_ONBOARDING_URL=https://super-intelligence.ai/onboarding
```

### Email Templates

#### Welcome Email
```typescript
const welcomeEmail = {
          subject: 'Welcome to Napoleon!',
  template: 'welcome',
  data: {
    userName: 'John Doe',
    onboardingUrl: 'https://super-intelligence.ai/onboarding',
    supportEmail: 'support@super-intelligence.ai',
    features: [
      'AI-powered email analysis',
      'Intelligent prioritization',
      'Smart reply suggestions',
      'Real-time insights'
    ]
  }
}
```

#### Billing Email
```typescript
const billingEmail = {
          subject: 'Your Napoleon subscription',
  template: 'billing',
  data: {
    userName: 'John Doe',
    subscriptionTier: 'Pro',
    amount: '$29.00',
    nextBillingDate: '2024-02-01',
    billingPortalUrl: 'https://super-intelligence.ai/billing',
    dashboardUrl: 'https://super-intelligence.ai/dashboard',
    unsubscribeUrl: 'https://super-intelligence.ai/unsubscribe'
  }
}
```

## Usage

### Send Email
```typescript
import { sendEmail } from '@/lib/email/resend';

await sendEmail(
  'user@example.com',
          'Welcome to Napoleon!',
  '<h1>Welcome!</h1>',
  {
    replyTo: 'support@super-intelligence.ai'
  }
);
```

### Email Automation
```typescript
import { EmailAutomation } from '@/lib/email/automation';

const automation = new EmailAutomation();

// Send welcome email
await automation.sendWelcomeEmail({
  userEmail: 'user@example.com',
  userName: 'John Doe'
});

// Send billing notification
await automation.sendBillingEmail({
  userEmail: 'user@example.com',
  userName: 'John Doe',
  subscriptionTier: 'Pro',
  amount: '$29.00',
  nextBillingDate: '2024-02-01'
});
```

## Email Templates

### Welcome Email Template
```html
<div class="email-container">
  <div class="header">
    <div class="logo">Napoleon</div>
    <div class="tagline">AI-Powered Productivity Platform</div>
  </div>
  
  <div class="content">
    <h1 class="greeting">Welcome to Napoleon, {userName}! 👋</h1>
    
    <p class="intro">
      Thank you for joining Napoleon. We're excited to help you transform your communication
      workflow with AI-powered insights and intelligent automation.
    </p>
    
    <p class="features-intro">
      With Napoleon, you'll experience:
    </p>
    
    <ul class="features">
      <li>AI-powered email analysis and prioritization</li>
      <li>Intelligent reply suggestions</li>
      <li>Real-time productivity insights</li>
      <li>Seamless integration with your workflow</li>
    </ul>
    
    <div class="cta">
      <a href="{onboardingUrl}" class="button">Get Started</a>
    </div>
  </div>
  
  <div class="footer">
    <p class="footer-text">
      You received this email because you signed up for Napoleon. 
      <a href="/unsubscribe"> Unsubscribe</a>
    </p>
  </div>
</div>
```

### Billing Email Template
```html
<div class="email-container">
  <div class="header">
    <div class="logo">Napoleon</div>
    <div class="tagline">Billing & Subscription</div>
  </div>
  
  <div class="content">
    <h1>Subscription Update</h1>
    
    <div class="billing-details">
      <p>Hello {userName},</p>
      
      <p>Your {subscriptionTier} subscription has been successfully processed.</p>
      
      <div class="billing-info">
        <div class="amount">Amount: {amount}</div>
        <div class="next-billing">Next billing: {nextBillingDate}</div>
      </div>
      
      <div class="actions">
        <a href="{dashboardUrl}" class="button">Go to Dashboard</a>
        <a href="{billingPortalUrl}" class="button secondary">Manage Billing</a>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <p class="footer-text">
      Thank you for choosing Napoleon. We're committed to helping you 
      transform your productivity with AI-powered email management.
    </p>
  </div>
</div>
```

## Testing

### Local Email Preview
```bash
# Start local email server
npm run email:dev

# Send test email
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "template": "welcome",
    "data": {
      "userName": "Test User"
    }
  }'
```

### Email Testing Utilities
```typescript
import { testEmailTemplate } from '@/lib/email/test';

// Test email template rendering
const html = await testEmailTemplate('welcome', {
  userName: 'Test User',
  onboardingUrl: 'https://super-intelligence.ai/onboarding'
});

console.log(html);
```

## Analytics

### Email Metrics
```typescript
import { getEmailAnalytics } from '@/lib/email/analytics';

const analytics = await getEmailAnalytics({
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

console.log('Open Rate:', analytics.openRate);
console.log('Click Rate:', analytics.clickRate);
console.log('Bounce Rate:', analytics.bounceRate);
```

## Management

### Unsubscribe Handling
```typescript
import { handleUnsubscribe } from '@/lib/email/management';

await handleUnsubscribe('user@example.com', 'newsletter');
```

### Email Preferences
```typescript
import { updateEmailPreferences } from '@/lib/email/management';

await updateEmailPreferences('user@example.com', {
  marketing: false,
  billing: true,
  notifications: true,
  digest: false
});
```

## Security

- **DKIM**: Domain authentication for better deliverability
- **SPF**: Sender Policy Framework protection
- **DMARC**: Domain-based Message Authentication
- **Encryption**: TLS encryption for all emails
- **Compliance**: GDPR and CAN-SPAM compliant

## Best Practices

1. **Personalization**: Use recipient names and relevant data
2. **Clear CTAs**: Make action buttons prominent and clear
3. **Mobile Optimization**: Ensure emails look great on mobile
4. **A/B Testing**: Test subject lines and content variations
5. **Analytics**: Track engagement and optimize based on data
6. **Compliance**: Include unsubscribe links and physical address
7. **Accessibility**: Use proper contrast and alt text for images

## Troubleshooting

### Common Issues

1. **Emails not sending**: Check Resend API key and domain configuration
2. **Poor deliverability**: Verify SPF, DKIM, and DMARC records
3. **Template rendering**: Test templates locally before sending
4. **Analytics not tracking**: Ensure tracking pixels are properly configured

### Debug Mode
```typescript
import { setEmailDebugMode } from '@/lib/email/resend';

setEmailDebugMode(true);
// All emails will be logged to console
```

## Contributing

1. Follow the existing template structure
2. Test emails locally before committing
3. Update documentation for new features
4. Ensure accessibility compliance
5. Add analytics tracking for new email types 