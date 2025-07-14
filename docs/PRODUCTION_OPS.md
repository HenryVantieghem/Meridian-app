# Production Operations Guide

## Overview
This document outlines the operational procedures for Napoleon AI in production environments.

## Table of Contents
1. [Backup & Recovery](#backup--recovery)
2. [Incident Response](#incident-response)
3. [Monitoring & Alerting](#monitoring--alerting)
4. [Deployment Procedures](#deployment-procedures)
5. [Security Procedures](#security-procedures)
6. [Performance Optimization](#performance-optimization)

## Backup & Recovery

### Database Backups
```bash
# Automated daily backups via Supabase
# Manual backup trigger
curl -X POST https://api.supabase.com/v1/projects/{PROJECT_ID}/backups \
  -H "Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}"
```

### File Storage Backups
```bash
# Backup user uploads and assets
aws s3 sync s3://napoleon-ai-storage s3://napoleon-ai-backup/$(date +%Y%m%d)
```

### Recovery Procedures
1. **Database Recovery**
   ```bash
   # Restore from Supabase backup
   pg_restore -h db.supabase.co -U postgres -d napoleon_ai backup.sql
   ```

2. **Application Recovery**
   ```bash
   # Redeploy from Vercel
   vercel --prod
   ```

## Incident Response

### Severity Levels
- **P0 (Critical)**: Service completely down, data loss
- **P1 (High)**: Major functionality broken
- **P2 (Medium)**: Minor functionality issues
- **P3 (Low)**: Cosmetic issues, performance degradation

### Response Timeline
- **P0**: Immediate response (< 15 minutes)
- **P1**: Response within 1 hour
- **P2**: Response within 4 hours
- **P3**: Response within 24 hours

### Escalation Matrix
1. **On-Call Engineer** (Primary)
2. **Senior Developer** (Secondary)
3. **CTO** (Tertiary)
4. **CEO** (Final escalation)

### Communication Channels
- **Internal**: Slack #incidents
- **External**: Status page, email notifications
- **Stakeholders**: Direct communication for P0/P1

## Monitoring & Alerting

### Key Metrics
- **Uptime**: 99.9% target
- **Response Time**: < 500ms average
- **Error Rate**: < 1%
- **Database Performance**: < 100ms queries
- **AI Response Time**: < 2 seconds

### Alerting Rules
```yaml
# Vercel Alerts
- Function execution time > 10s
- Function error rate > 5%
- Build failures

# Supabase Alerts
- Database connection failures
- Query performance degradation
- Storage quota exceeded

# External Service Alerts
- OpenAI API failures
- Stripe webhook failures
- Email delivery failures
```

### Dashboard URLs
- **Vercel**: https://vercel.com/dashboard
- **Supabase**: https://supabase.com/dashboard
- **Sentry**: https://sentry.io/organizations/napoleon-ai
- **Stripe**: https://dashboard.stripe.com

## Deployment Procedures

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security scan clean
- [ ] Performance benchmarks met
- [ ] Documentation updated

### Deployment Steps
```bash
# 1. Create release branch
git checkout -b release/v1.2.0

# 2. Update version
npm version patch

# 3. Run full test suite
npm run test:ci

# 4. Build and test
npm run build

# 5. Deploy to staging
vercel --target staging

# 6. Run smoke tests
npm run e2e:staging

# 7. Deploy to production
vercel --prod

# 8. Monitor deployment
vercel logs --prod
```

### Rollback Procedures
```bash
# Quick rollback to previous deployment
vercel rollback --prod

# Database rollback (if needed)
pg_restore -h db.supabase.co -U postgres -d napoleon_ai backup.sql
```

## Security Procedures

### Security Incident Response
1. **Immediate Actions**
   - Isolate affected systems
   - Preserve evidence
   - Notify security team

2. **Investigation**
   - Analyze logs and metrics
   - Identify root cause
   - Assess impact scope

3. **Remediation**
   - Apply security patches
   - Update access controls
   - Monitor for recurrence

4. **Post-Incident**
   - Document lessons learned
   - Update procedures
   - Conduct security review

### Access Management
- **Production Access**: Limited to senior developers
- **Database Access**: Emergency access only
- **API Keys**: Rotated quarterly
- **User Data**: Encrypted at rest and in transit

### Compliance
- **GDPR**: Data retention and deletion procedures
- **SOC 2**: Security controls and monitoring
- **PCI DSS**: Payment data protection
- **HIPAA**: Healthcare data handling (if applicable)

## Performance Optimization

### Database Optimization
```sql
-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Optimize indexes
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_emails_user_id ON emails(user_id);
```

### Application Optimization
- **Caching**: Redis for session data
- **CDN**: Vercel Edge Network
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Dynamic imports for heavy components

### Monitoring Tools
- **Application**: Sentry, Vercel Analytics
- **Infrastructure**: Vercel Dashboard
- **Database**: Supabase Dashboard
- **External**: UptimeRobot, Pingdom

## Emergency Contacts

### Technical Team
- **On-Call**: +1-555-0123
- **Senior Dev**: +1-555-0124
- **CTO**: +1-555-0125

### External Services
- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.com
- **Stripe Support**: support@stripe.com
- **OpenAI Support**: support@openai.com

### Escalation Procedures
1. **First Level**: On-call engineer
2. **Second Level**: Senior developer
3. **Third Level**: CTO
4. **Final Level**: CEO

## Maintenance Windows

### Scheduled Maintenance
- **Weekly**: Sunday 2-4 AM UTC
- **Monthly**: First Sunday of month
- **Quarterly**: Security updates and audits

### Communication
- **Internal**: Slack notification 24h before
- **External**: Status page update
- **Users**: Email notification for major changes

## Recovery Time Objectives (RTO)

| Component | RTO | RPO |
|-----------|-----|-----|
| Application | 5 minutes | 1 hour |
| Database | 15 minutes | 1 hour |
| File Storage | 30 minutes | 4 hours |
| External APIs | 1 hour | 1 hour |

## Post-Incident Review

### Review Process
1. **Immediate**: Technical debrief within 24h
2. **Detailed**: Full review within 1 week
3. **Action Items**: Implementation within 2 weeks

### Documentation
- Incident timeline
- Root cause analysis
- Impact assessment
- Remediation steps
- Prevention measures

### Continuous Improvement
- Update runbooks based on incidents
- Refine monitoring and alerting
- Improve response procedures
- Enhance automation 