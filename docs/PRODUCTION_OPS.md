# Napoleon AI - Production Operations Guide

## Table of Contents
1. [Backup & Recovery](#backup--recovery)
2. [Incident Response](#incident-response)
3. [Monitoring & Alerts](#monitoring--alerts)
4. [Performance Optimization](#performance-optimization)
5. [Security Procedures](#security-procedures)
6. [Deployment Procedures](#deployment-procedures)

## Backup & Recovery

### Automated Backups
- **Frequency**: Daily at 2:00 AM UTC
- **Retention**: 30 days
- **Storage**: Supabase + S3 backup
- **Type**: Full database + file system

### Manual Backup Creation
```bash
# Create immediate backup
curl -X POST https://napoleonai.app/api/backup \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"type": "full"}'
```

### Backup Restoration

#### Emergency Recovery Steps
1. **Stop the application**:
   ```bash
   vercel --prod --stop
   ```

2. **Restore from latest backup**:
   ```bash
   curl -X PUT https://napoleonai.app/api/backup \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -d '{"backupId": "latest"}'
   ```

3. **Verify restoration**:
   ```bash
   curl -X GET https://napoleonai.app/api/health
   ```

4. **Restart the application**:
   ```bash
   vercel --prod --start
   ```

#### Database Recovery
```sql
-- Connect to Supabase
psql "postgresql://postgres:[password]@[host]:5432/postgres"

-- Restore specific backup
\i /path/to/backup.sql

-- Verify data integrity
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM emails;
```

### Backup Verification
- **Automated**: Daily integrity checks
- **Manual**: Weekly full restore tests
- **Monitoring**: Backup success/failure alerts

## Incident Response

### Severity Levels
- **P0 (Critical)**: Complete service outage
- **P1 (High)**: Major feature unavailable
- **P2 (Medium)**: Minor feature issues
- **P3 (Low)**: Cosmetic issues

### P0 - Critical Incident Response

#### Immediate Actions (0-5 minutes)
1. **Acknowledge the incident**
   ```bash
   # Send immediate alert
   curl -X POST $SLACK_WEBHOOK_URL \
     -d '{"text": "🚨 P0 CRITICAL: Napoleon AI service outage detected"}'
   ```

2. **Check service status**
   ```bash
   curl -X GET https://napoleonai.app/api/health
   ```

3. **Check monitoring dashboards**
   - Vercel deployment status
   - Supabase database status
   - OpenAI API status
   - Stripe payment status

#### Investigation (5-15 minutes)
1. **Review error logs**
   ```bash
   # Check Vercel logs
   vercel logs --prod
   
   # Check Supabase logs
   supabase logs
   ```

2. **Identify root cause**
   - Database connection issues
   - API rate limiting
   - Authentication failures
   - Payment processing errors

#### Resolution (15-60 minutes)
1. **Apply immediate fixes**
   - Restart services if needed
   - Scale up resources
   - Update environment variables

2. **Verify resolution**
   ```bash
   # Health check
   curl -X GET https://napoleonai.app/api/health
   
   # Test critical flows
   curl -X POST https://napoleonai.app/api/emails/analyze \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

#### Communication
1. **Internal team**: Slack #incidents channel
2. **Customers**: Status page update
3. **Stakeholders**: Executive summary email

### P1 - High Priority Incident

#### Response Timeline
- **Acknowledgment**: 15 minutes
- **Investigation**: 30 minutes
- **Resolution**: 2 hours
- **Communication**: 1 hour

#### Common P1 Issues
- Email processing delays
- AI analysis failures
- Payment processing issues
- Authentication problems

### Post-Incident Procedures

#### Incident Review (Within 24 hours)
1. **Document the incident**
   - Timeline of events
   - Root cause analysis
   - Actions taken
   - Lessons learned

2. **Update runbooks**
   - Add new procedures
   - Improve existing steps
   - Update contact lists

3. **Implement preventive measures**
   - Add monitoring alerts
   - Improve error handling
   - Update documentation

## Monitoring & Alerts

### Key Metrics
- **Uptime**: Target 99.9%
- **Response Time**: < 500ms average
- **Error Rate**: < 1%
- **Database Performance**: < 100ms queries

### Alert Channels
- **Slack**: #alerts-napoleon
- **Email**: alerts@napoleonai.app
- **PagerDuty**: Critical incidents only

### Monitoring Tools
- **Vercel Analytics**: Performance monitoring
- **Sentry**: Error tracking
- **Supabase**: Database monitoring
- **Stripe**: Payment monitoring

## Performance Optimization

### Database Optimization
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Optimize indexes
CREATE INDEX CONCURRENTLY idx_emails_user_id ON emails(user_id);
CREATE INDEX CONCURRENTLY idx_emails_created_at ON emails(created_at);
```

### Cache Management
```bash
# Clear application cache
curl -X POST https://napoleonai.app/api/cache/clear

# Check cache hit rates
curl -X GET https://napoleonai.app/api/cache/stats
```

### CDN Optimization
- **Static assets**: Vercel Edge Network
- **API responses**: Cache frequently accessed data
- **Images**: Optimize and compress

## Security Procedures

### Security Incident Response
1. **Immediate containment**
   - Isolate affected systems
   - Revoke compromised credentials
   - Update security configurations

2. **Investigation**
   - Review access logs
   - Analyze security events
   - Identify attack vectors

3. **Recovery**
   - Restore from clean backup
   - Update security measures
   - Notify affected users

### Security Monitoring
- **Authentication failures**: Alert on multiple failed attempts
- **API abuse**: Monitor rate limiting violations
- **Data access**: Log all database queries
- **Payment fraud**: Monitor Stripe chargebacks

### Regular Security Tasks
- **Weekly**: Review access logs
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **Annually**: Penetration testing

## Deployment Procedures

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Stakeholders notified

### Deployment Process
```bash
# Deploy to staging
vercel --staging

# Run staging tests
npm run test:staging

# Deploy to production
vercel --prod

# Verify deployment
curl -X GET https://napoleonai.app/api/health
```

### Rollback Procedures
```bash
# Rollback to previous deployment
vercel --prod --rollback

# Verify rollback
curl -X GET https://napoleonai.app/api/health
```

### Post-Deployment Verification
1. **Health checks**: All endpoints responding
2. **Feature tests**: Critical user flows working
3. **Performance**: Response times within limits
4. **Monitoring**: No new errors or alerts

## Emergency Contacts

### Primary Contacts
- **DevOps Lead**: [Contact Info]
- **Engineering Lead**: [Contact Info]
- **Product Manager**: [Contact Info]

### Escalation Path
1. **On-call engineer**: Immediate response
2. **Engineering lead**: Within 30 minutes
3. **CTO**: Within 1 hour
4. **CEO**: Within 2 hours

### External Contacts
- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.com
- **Stripe Support**: support@stripe.com
- **OpenAI Support**: support@openai.com

## Maintenance Windows

### Scheduled Maintenance
- **Weekly**: Sunday 2:00-4:00 AM UTC
- **Monthly**: First Sunday 2:00-6:00 AM UTC
- **Quarterly**: First Sunday 2:00-8:00 AM UTC

### Maintenance Procedures
1. **Notify users**: 48 hours advance notice
2. **Create backup**: Before maintenance starts
3. **Execute maintenance**: Follow documented procedures
4. **Verify systems**: Post-maintenance health checks
5. **Update status**: Notify completion

---

*Last updated: [Date]*
*Version: 1.0* 