# Napoleon AI - Environment Variables Reference

## Required Environment Variables for Production

### Public Variables (NEXT_PUBLIC_*)
- `NEXT_PUBLIC_APP_URL` - App URL (https://napoleonai.app)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `NEXT_PUBLIC_STRIPE_PRICE_PRO` - Stripe Pro plan price ID
- `NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE` - Stripe Enterprise plan price ID
- `NEXT_PUBLIC_WS_URL` - WebSocket URL (optional)
- `NEXT_PUBLIC_PERFORMANCE_MONITORING_URL` - Performance monitoring endpoint (optional)

### Private Variables (Server-side only)
- `CLERK_SECRET_KEY` - Clerk secret key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key
- `OPENAI_ORGANIZATION_ID` - OpenAI organization ID
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `RESEND_API_KEY` - Resend email service key
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - NextAuth URL

### OAuth Configuration
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_REDIRECT_URI` - Google OAuth redirect URI
- `GOOGLE_PROJECT_ID` - Google Cloud project ID
- `SLACK_CLIENT_ID` - Slack OAuth client ID
- `SLACK_CLIENT_SECRET` - Slack OAuth client secret
- `SLACK_REDIRECT_URI` - Slack OAuth redirect URI
- `SLACK_WEBHOOK_URL` - Slack webhook URL
- `MICROSOFT_CLIENT_ID` - Microsoft OAuth client ID
- `MICROSOFT_CLIENT_SECRET` - Microsoft OAuth client secret
- `MICROSOFT_TENANT_ID` - Microsoft tenant ID
- `TEAMS_CLIENT_ID` - Teams OAuth client ID
- `TEAMS_CLIENT_SECRET` - Teams OAuth client secret
- `TEAMS_TENANT_ID` - Teams tenant ID
- `TEAMS_REDIRECT_URI` - Teams OAuth redirect URI

### Monitoring & Analytics
- `SENTRY_DSN` - Sentry DSN for error tracking
- `APP_VERSION` - App version for monitoring
- `LOG_LEVEL` - Logging level
- `LOGGING_WEBHOOK_URL` - Logging webhook URL
- `ERROR_TRACKING_WEBHOOK_URL` - Error tracking webhook
- `ANALYTICS_WEBHOOK_URL` - Analytics webhook
- `SECURITY_WEBHOOK_URL` - Security webhook
- `MONITORING_WEBHOOK_URL` - Monitoring webhook
- `ALERT_WEBHOOK_URL` - Alert webhook
- `MONITORING_ENDPOINT` - Monitoring endpoint
- `MONITORING_API_KEY` - Monitoring API key
- `ANALYTICS_ENDPOINT` - Analytics endpoint
- `ANALYTICS_API_KEY` - Analytics API key
- `ALERT_EMAIL` - Alert email address
- `PAGERDUTY_API_KEY` - PagerDuty API key

### Backup & Recovery
- `BACKUP_NOTIFICATION_EMAIL` - Backup notification email
- `BACKUP_WEBHOOK_URL` - Backup webhook URL

### Performance & Caching
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token

### Security
- `ENCRYPTION_MASTER_KEY` - Encryption master key

### System
- `NODE_ENV` - Node environment (development/production)
- `VERCEL_ENV` - Vercel environment

## Deployment Checklist

1. **Vercel Environment Variables**: Set all variables in Vercel dashboard
2. **Secrets Management**: Use @VAR notation in vercel.json
3. **OAuth Setup**: Configure all OAuth providers
4. **Monitoring**: Set up Sentry, logging, and analytics
5. **Database**: Initialize Supabase with proper RLS policies
6. **Email**: Configure Resend for transactional emails
7. **Payments**: Set up Stripe webhooks and products
8. **AI**: Configure OpenAI API access
9. **Security**: Set encryption keys and security webhooks
10. **Performance**: Configure Redis and monitoring endpoints 