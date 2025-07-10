# Email System Documentation

A comprehensive transactional email system for Meridian AI, built with Resend, featuring automation, templates, analytics, and management capabilities.

## Overview

The email system provides:
- **Resend Integration**: Email delivery with authentication and retry logic
- **Email Templates**: Responsive HTML templates with @.cursorrules branding
- **Automation**: Triggered and scheduled email campaigns
- **Management**: List management, unsubscribe handling, and analytics
- **A/B Testing**: Email optimization with statistical analysis

## Architecture

```
src/lib/email/
├── resend.ts          # Resend client and core email functionality
├── automation.ts      # Email automation and scheduling
├── management.ts      # List management and analytics
└── index.ts          # Central exports

src/components/email/
├── WelcomeEmail.tsx   # New user onboarding
├── DailyDigest.tsx    # Priority email summaries
├── AINotification.tsx # AI action summaries
├── BillingEmail.tsx   # Subscription notifications
└── index.ts          # Template exports

src/app/api/email/
├── send/route.ts      # Email sending API
├── automation/route.ts # Automation triggers and scheduling
└── management/route.ts # List management and analytics
```

## Setup

### 1. Environment Variables

Add to your `.env.local`:

```bash
# Resend Configuration
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@meridian.ai
RESEND_REPLY_TO=support@meridian.ai

# Email Configuration
EMAIL_DOMAIN=meridian.ai
EMAIL_SUPPORT=support@meridian.ai
```

### 2. Resend Dashboard Setup

1. Create a Resend account at [resend.com](https://resend.com)
2. Add your domain and verify DNS records
3. Generate an API key
4. Configure webhooks for bounce handling

### 3. Database Schema

The email system requires these database tables:

```sql
-- Email tracking
CREATE TABLE email_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  email_type VARCHAR(50) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounce_reason TEXT,
  metadata JSONB
);

-- User email preferences
CREATE TABLE user_email_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  email_types TEXT[] DEFAULT '{}',
  frequency VARCHAR(20) DEFAULT 'daily',
  digest_enabled BOOLEAN DEFAULT true,
  ai_notifications BOOLEAN DEFAULT true,
  billing_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  timezone VARCHAR(50) DEFAULT 'UTC',
  preferred_time VARCHAR(10) DEFAULT '09:00',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email lists
CREATE TABLE email_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  subscribers TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Unsubscribe records
CREATE TABLE unsubscribe_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  list_id UUID REFERENCES email_lists(id),
  reason VARCHAR(50),
  feedback TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Bounce records
CREATE TABLE bounce_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL,
  reason TEXT NOT NULL,
  message_id VARCHAR(255),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- A/B tests
CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  variants JSONB NOT NULL,
  audience TEXT[] NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  enabled BOOLEAN DEFAULT true,
  metrics JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Usage

### 1. Sending Emails

```typescript
import { sendEmail, EMAIL_TYPES, EMAIL_PRIORITY } from '@/lib/email';

// Basic email
const tracking = await sendEmail(
  'user@example.com',
  'Welcome to Meridian!',
  '<h1>Welcome!</h1><p>Thanks for joining.</p>',
  {
    priority: EMAIL_PRIORITY.HIGH,
    metadata: {
      type: EMAIL_TYPES.WELCOME,
      campaignId: 'welcome_2024',
    },
  }
);

// Multiple recipients
const tracking = await sendEmail(
  ['user1@example.com', 'user2@example.com'],
  'Important Update',
  '<h1>Update</h1><p>Important information.</p>'
);
```

### 2. Email Templates

```typescript
import { WelcomeEmail, DailyDigest, AINotification, BillingEmail } from '@/components/email';

// Welcome email
const welcomeHtml = WelcomeEmail({
  userName: 'John Doe',
  userEmail: 'john@example.com',
  onboardingUrl: 'https://meridian.ai/onboarding',
  supportEmail: 'support@meridian.ai',
});

// Daily digest
const digestHtml = DailyDigest({
  userName: 'John Doe',
  userEmail: 'john@example.com',
  date: '2024-01-15',
  totalEmails: 45,
  priorityEmails: [
    {
      id: '1',
      subject: 'Urgent: Project Update',
      sender: 'manager@company.com',
      priority: 'high',
      summary: 'Important project update requiring immediate attention.',
      actionRequired: true,
      urgency: 'immediate',
      aiInsight: 'This email requires your response within 24 hours.',
    },
  ],
  productivityScore: 85,
  timeSaved: '2.5 hours',
  dashboardUrl: 'https://meridian.ai/dashboard',
  unsubscribeUrl: 'https://meridian.ai/unsubscribe',
});
```

### 3. Email Automation

```typescript
import { emailAutomationService, AUTOMATION_TRIGGERS } from '@/lib/email';

// Trigger automation
const results = await emailAutomationService.handleTrigger({
  userId: 'user_123',
  trigger: AUTOMATION_TRIGGERS.USER_SIGNUP,
  data: {
    userEmail: 'user@example.com',
    userName: 'John Doe',
  },
  timestamp: new Date(),
});

// Send daily digest
const digest = await emailAutomationService.sendDailyDigest('user_123');

// Send AI notification
const notification = await emailAutomationService.sendAINotification('user_123', [
  {
    id: '1',
    type: 'reply_generated',
    emailSubject: 'Project Update',
    sender: 'manager@company.com',
    confidence: 95,
    timeSaved: '15 minutes',
    actionTaken: 'Generated professional reply with key points addressed.',
  },
]);
```

### 4. Email Management

```typescript
import { emailManagementService, EMAIL_LISTS } from '@/lib/email';

// Create email list
const list = await emailManagementService.createEmailList({
  name: 'Active Users',
  description: 'Users who have logged in within 30 days',
  type: EMAIL_LISTS.ACTIVE_USERS,
  subscribers: ['user1@example.com', 'user2@example.com'],
});

// Add subscriber
await emailManagementService.addSubscriberToList('user@example.com', list.id);

// Handle unsubscribe
await emailManagementService.unsubscribeEmail(
  'user@example.com',
  list.id,
  'too_frequent',
  'Emails are too frequent'
);

// Handle bounce
await emailManagementService.handleBounce(
  'user@example.com',
  'hard',
  'Mailbox does not exist'
);
```

### 5. A/B Testing

```typescript
import { emailManagementService } from '@/lib/email';

// Create A/B test
const test = await emailManagementService.createABTest({
  name: 'Welcome Email Subject Line',
  description: 'Testing different subject lines for welcome emails',
  variants: [
    {
      subject: 'Welcome to Meridian!',
      html: '<h1>Welcome!</h1>',
      weight: 0.5,
    },
    {
      subject: 'Your AI Chief of Staff is Ready',
      html: '<h1>Your AI Chief of Staff is Ready</h1>',
      weight: 0.5,
    },
  ],
  audience: ['user1@example.com', 'user2@example.com'],
  startDate: new Date(),
  enabled: true,
});

// Get variant for user
const variant = await emailManagementService.getABTestVariant(test.id, 'user@example.com');

// Record event
await emailManagementService.recordABTestEvent(test.id, variant.variantId, 'user@example.com', 'open');
```

## API Endpoints

### Send Email
```bash
POST /api/email/send
{
  "to": "user@example.com",
  "subject": "Welcome to Meridian",
  "html": "<h1>Welcome!</h1>",
  "emailType": "welcome",
  "priority": "high"
}
```

### Email Automation
```bash
POST /api/email/automation
{
  "action": "trigger",
  "trigger": "user_signup",
  "data": {
    "userEmail": "user@example.com",
    "userName": "John Doe"
  }
}
```

### Email Management
```bash
POST /api/email/management
{
  "action": "create_list",
  "name": "Active Users",
  "type": "active_users",
  "subscribers": ["user@example.com"]
}
```

## Best Practices

### 1. Email Design
- Use @.cursorrules branding (white, black, gold)
- Ensure mobile responsiveness
- Include clear unsubscribe links
- Test across email clients

### 2. Performance
- Use proper rate limiting
- Implement retry logic
- Monitor delivery rates
- Clean up old data regularly

### 3. Compliance
- Include unsubscribe links
- Respect user preferences
- Handle bounces properly
- Follow CAN-SPAM guidelines

### 4. Analytics
- Track open and click rates
- Monitor bounce rates
- A/B test subject lines
- Analyze user engagement

## Error Handling

The email system includes comprehensive error handling:

```typescript
import { EmailError, handleEmailError } from '@/lib/email';

try {
  await sendEmail(to, subject, html);
} catch (error) {
  const emailError = handleEmailError(error);
  
  if (emailError.retryable) {
    // Retry with exponential backoff
  } else {
    // Log and alert
  }
}
```

## Monitoring

Monitor these key metrics:
- **Delivery Rate**: > 95%
- **Open Rate**: > 25%
- **Click Rate**: > 3%
- **Bounce Rate**: < 2%
- **Unsubscribe Rate**: < 0.5%

## Troubleshooting

### Common Issues

1. **High Bounce Rate**
   - Verify email addresses
   - Clean email lists regularly
   - Check sender reputation

2. **Low Open Rate**
   - Improve subject lines
   - Send at optimal times
   - Segment your audience

3. **Delivery Issues**
   - Check Resend API key
   - Verify domain configuration
   - Monitor rate limits

### Debug Mode

Enable debug logging:

```typescript
// In development
process.env.EMAIL_DEBUG = 'true';
```

## Security

- Validate all email addresses
- Sanitize HTML content
- Rate limit API endpoints
- Log security events
- Use HTTPS for all communications

## Testing

```typescript
// Unit tests for email templates
import { renderToString } from 'react-dom/server';
import { WelcomeEmail } from '@/components/email';

const html = renderToString(
  WelcomeEmail({
    userName: 'Test User',
    userEmail: 'test@example.com',
    onboardingUrl: 'https://test.com',
    supportEmail: 'support@test.com',
  })
);

// Integration tests for email sending
import { sendEmail } from '@/lib/email';

const tracking = await sendEmail(
  'test@example.com',
  'Test Email',
  '<h1>Test</h1>'
);

expect(tracking.status).toBe('sent');
```

## Support

For issues with the email system:
1. Check the logs for error messages
2. Verify environment variables
3. Test with a simple email first
4. Contact the development team

## Contributing

When contributing to the email system:
1. Follow @.cursorrules patterns
2. Add proper TypeScript types
3. Include error handling
4. Write tests for new features
5. Update documentation 