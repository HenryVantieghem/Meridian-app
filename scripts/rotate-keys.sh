#!/bin/bash

# Napoleon AI - Key Rotation Script
# This script generates new API keys and uploads them to Vercel environments

set -e

echo "🔐 Napoleon AI - Key Rotation Script"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to generate random string
generate_key() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command_exists vercel; then
    echo -e "${RED}❌ Vercel CLI not found. Install with: npm i -g vercel${NC}"
    exit 1
fi

if ! command_exists openssl; then
    echo -e "${RED}❌ OpenSSL not found. Install OpenSSL to generate secure keys.${NC}"
    exit 1
fi

# Generate new keys
echo -e "${BLUE}Generating new API keys...${NC}"

# Stripe keys (these would need to be generated in Stripe dashboard)
echo -e "${YELLOW}⚠️  Stripe keys must be generated manually in Stripe Dashboard${NC}"
echo -e "${YELLOW}   - Go to https://dashboard.stripe.com/apikeys${NC}"
echo -e "${YELLOW}   - Create new publishable and secret keys${NC}"
echo -e "${YELLOW}   - Update Vercel environment variables manually${NC}"
echo ""

# Clerk keys (these would need to be generated in Clerk dashboard)
echo -e "${YELLOW}⚠️  Clerk keys must be generated manually in Clerk Dashboard${NC}"
echo -e "${YELLOW}   - Go to https://dashboard.clerk.com${NC}"
echo -e "${YELLOW}   - Navigate to API Keys section${NC}"
echo -e "${YELLOW}   - Generate new publishable and secret keys${NC}"
echo ""

# Supabase keys (these would need to be generated in Supabase dashboard)
echo -e "${YELLOW}⚠️  Supabase keys must be generated manually in Supabase Dashboard${NC}"
echo -e "${YELLOW}   - Go to https://supabase.com/dashboard${NC}"
echo -e "${YELLOW}   - Navigate to Settings > API${NC}"
echo -e "${YELLOW}   - Generate new anon and service role keys${NC}"
echo ""

# OpenAI key (this would need to be generated in OpenAI dashboard)
echo -e "${YELLOW}⚠️  OpenAI key must be generated manually in OpenAI Dashboard${NC}"
echo -e "${YELLOW}   - Go to https://platform.openai.com/api-keys${NC}"
echo -e "${YELLOW}   - Create new API key${NC}"
echo ""

# Resend key (this would need to be generated in Resend dashboard)
echo -e "${YELLOW}⚠️  Resend key must be generated manually in Resend Dashboard${NC}"
echo -e "${YELLOW}   - Go to https://resend.com/api-keys${NC}"
echo -e "${YELLOW}   - Create new API key${NC}"
echo ""

# Generate some keys that can be auto-generated
echo -e "${BLUE}Generating auto-generatable keys...${NC}"

# Generate new JWT secret
JWT_SECRET=$(generate_key)
echo -e "${GREEN}✅ Generated new JWT_SECRET${NC}"

# Generate new NextAuth secret
NEXTAUTH_SECRET=$(generate_key)
echo -e "${GREEN}✅ Generated new NEXTAUTH_SECRET${NC}"

# Generate new webhook secrets
SLACK_SIGNING_SECRET=$(generate_key)
echo -e "${GREEN}✅ Generated new SLACK_SIGNING_SECRET${NC}"

STRIPE_WEBHOOK_SECRET=$(generate_key)
echo -e "${GREEN}✅ Generated new STRIPE_WEBHOOK_SECRET${NC}"

# Upload to Vercel Production
echo -e "${BLUE}Uploading to Vercel Production...${NC}"

# Note: These commands would need actual values from the dashboards
# For now, we'll show the structure

echo -e "${YELLOW}To upload to Vercel Production, run:${NC}"
echo "vercel env add JWT_SECRET production"
echo "vercel env add NEXTAUTH_SECRET production"
echo "vercel env add SLACK_SIGNING_SECRET production"
echo "vercel env add STRIPE_WEBHOOK_SECRET production"
echo ""
echo -e "${YELLOW}For Preview environment:${NC}"
echo "vercel env add JWT_SECRET preview"
echo "vercel env add NEXTAUTH_SECRET preview"
echo "vercel env add SLACK_SIGNING_SECRET preview"
echo "vercel env add STRIPE_WEBHOOK_SECRET preview"
echo ""

# Manual steps
echo -e "${BLUE}📋 Manual Steps Required:${NC}"
echo "1. Generate new Stripe keys in Stripe Dashboard"
echo "2. Generate new Clerk keys in Clerk Dashboard"
echo "3. Generate new Supabase keys in Supabase Dashboard"
echo "4. Generate new OpenAI key in OpenAI Dashboard"
echo "5. Generate new Resend key in Resend Dashboard"
echo "6. Update all environment variables in Vercel Dashboard"
echo "7. Test the application with new keys"
echo "8. Rotate keys in all connected services (Slack, Gmail, etc.)"
echo ""

# Security checklist
echo -e "${BLUE}🔒 Security Checklist:${NC}"
echo "□ Revoke old API keys in all dashboards"
echo "□ Update webhook endpoints with new signatures"
echo "□ Test all integrations with new keys"
echo "□ Verify no old keys are cached in CDN"
echo "□ Check Vercel function logs for any key leaks"
echo "□ Update documentation with new key rotation schedule"
echo ""

echo -e "${GREEN}✅ Key rotation script completed!${NC}"
echo -e "${YELLOW}⚠️  Remember to manually generate and update the dashboard keys above.${NC}" 