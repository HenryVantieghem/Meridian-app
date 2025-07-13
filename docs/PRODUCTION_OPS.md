# Napoleon AI – Production Operations Runbook

## Nightly Backups
- Endpoint: `/api/backup` (triggered nightly by Vercel cron)
- Manual trigger: Visit `/api/backup` as an admin
- Backup status is returned as JSON
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel env

## Sentry Triage
- All errors and traces are sent to Sentry (see SENTRY_DSN in env)
- Review issues at https://sentry.io/organizations/your-org/
- Use Sentry’s release and environment filters for triage
- Adjust `tracesSampleRate` in `src/lib/monitoring.ts` as needed

## Stripe Billing Portal
- Users can access the billing portal via the dashboard
- Admins can manage subscriptions and invoices
- Stripe webhooks are handled at `/api/webhooks/stripe`
- Ensure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are set

## Healthcheck
- Endpoint: `/api/health/` returns 200 OK if healthy
- Used by Vercel and monitoring systems

## Secrets Management
- Rotate keys using `scripts/rotate-keys.sh`
- Never commit secrets to Git
- Use Vercel dashboard for manual secret management 