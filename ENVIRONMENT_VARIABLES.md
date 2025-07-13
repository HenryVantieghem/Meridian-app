# Environment Variables - Napoleon AI Platform

## Required Environment Variables

### Authentication (Clerk)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Public Clerk key for frontend
- `CLERK_SECRET_KEY` - Secret Clerk key for backend

### Database (Supabase)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations

### AI (OpenAI)
- `OPENAI_API_KEY` - OpenAI API key
- `OPENAI_ORGANIZATION_ID` - OpenAI organization ID

### Payments (Stripe)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Public Stripe key
- `STRIPE_SECRET_KEY` - Secret Stripe key
- `STRIPE_WEBHOOK_SECRET` - Webhook secret for verification
- `NEXT_PUBLIC_STRIPE_PRICE_PRO` - Pro plan price ID
- `NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE` - Enterprise plan price ID

### Email Service (Resend)
- `RESEND_API_KEY` - Resend API key for transactional emails

### Google APIs (Gmail)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_REDIRECT_URI` - OAuth redirect URI
- `GOOGLE_PROJECT_ID` - Google Cloud project ID

### Slack API
- `SLACK_CLIENT_ID` - Slack OAuth client ID
- `SLACK_CLIENT_SECRET` - Slack OAuth client secret
- `SLACK_WEBHOOK_URL` - Slack webhook URL for notifications

### Microsoft APIs (Outlook)
- `MICROSOFT_CLIENT_ID` - Microsoft Graph client ID
- `MICROSOFT_CLIENT_SECRET` - Microsoft Graph client secret
- `MICROSOFT_TENANT_ID` - Microsoft tenant ID

### Monitoring & Analytics
- `SENTRY_DSN` - Sentry error tracking DSN
- `NODE_ENV` - Environment (development/production)
- `APP_VERSION` - Application version for monitoring

### Performance & Caching
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST token

### App Configuration
- `NEXT_PUBLIC_APP_URL` - Public app URL
- `NEXT_PUBLIC_PERFORMANCE_MONITORING_URL` - Performance monitoring endpoint

### Monitoring Webhooks (Optional)
- `LOGGING_WEBHOOK_URL` - Logging webhook URL
- `ERROR_TRACKING_WEBHOOK_URL` - Error tracking webhook URL
- `ANALYTICS_WEBHOOK_URL` - Analytics webhook URL
- `SECURITY_WEBHOOK_URL` - Security webhook URL
- `MONITORING_ENDPOINT` - Monitoring endpoint
- `MONITORING_API_KEY` - Monitoring API key
- `ANALYTICS_ENDPOINT` - Analytics endpoint
- `ANALYTICS_API_KEY` - Analytics API key

### Backup & Recovery
- `BACKUP_NOTIFICATION_EMAIL` - Email for backup notifications
- `BACKUP_WEBHOOK_URL` - Webhook for backup notifications

### Alerts & Notifications
- `SLACK_WEBHOOK_URL` - Slack webhook for alerts
- `ALERT_EMAIL` - Email for alerts
- `PAGERDUTY_API_KEY` - PagerDuty API key
- `MONITORING_WEBHOOK_URL` - Monitoring webhook URL
- `ALERT_WEBHOOK_URL` - Alert webhook URL

### Logging
- `LOG_LEVEL` - Logging level (debug, info, warn, error)

## Vercel Deployment Variables

All variables marked with `@VAR` in `vercel.json` must be configured in Vercel dashboard:

### Public Variables (NEXT_PUBLIC_*)
- `@NEXT_PUBLIC_APP_URL`
- `@NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `@NEXT_PUBLIC_SUPABASE_URL`
- `@NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `@NEXT_PUBLIC_STRIPE_PRICE_PRO`
- `@NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE`
- `@NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Build Variables (Server-side only)
- `@CLERK_SECRET_KEY`
- `@SUPABASE_SERVICE_ROLE_KEY`
- `@OPENAI_API_KEY`
- `@OPENAI_ORGANIZATION_ID`
- `@STRIPE_SECRET_KEY`
- `@STRIPE_WEBHOOK_SECRET`
- `@RESEND_API_KEY`
- `@GOOGLE_CLIENT_ID`
- `@GOOGLE_CLIENT_SECRET`
- `@SLACK_CLIENT_ID`
- `@SLACK_CLIENT_SECRET`
- `@SENTRY_DSN`
- `@UPSTASH_REDIS_REST_URL`
- `@UPSTASH_REDIS_REST_TOKEN`

## Security Notes

1. Never commit `.env` files to version control
2. Use Vercel's environment variable management for production
3. Rotate secrets regularly using the provided scripts
4. Use different keys for development and production
5. Monitor for secret leaks in logs and error reports 