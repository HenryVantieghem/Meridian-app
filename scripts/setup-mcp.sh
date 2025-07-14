#!/bin/bash

# Napoleon AI MCP Environment Setup Script

echo "🚀 Setting up Napoleon AI MCP Environment..."

# Create .env.local file
cat > .env.local << 'EOF'
# Napoleon AI Environment Variables
GITHUB_TOKEN=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
NEXT_PUBLIC_APP_URL=https://napoleonai.app
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cHJlY2lzZS1jb2x0LTUuY2xlcmsuYWNjb3VudHMuZGV2JA

NEXT_PUBLIC_SUPABASE_URL=https://dvhtamzvwrdjvgtjlbab.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2aHRhbXp2d3JkanZndGpsYmFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzYzMzMsImV4cCI6MjA2NzY1MjMzM30.sMmLtVCxSp9hL5qU8U8OZNle87ZPE7FgaKsKH4EqlMU
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsubmFwb2xlb25haS5hcHAk
CLERK_SECRET_KEY=sk_live_ZdCbcy3tmcZmztF94r6uYVaSZuuCcHxHG58vGBaubG

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2aHRhbXp2d3JkanZndGpsYmFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA3NjMzMywiZXhwIjoyMDY3NjUyMzMzfQ.h3q_UkvQ4DDwII--uX_hP7WGntCEMczrIjH765xMdZA

OPENAI_API_KEY=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
OPENAI_ORGANIZATION_ID=org-org-sdWviS6T7zQYZd37rXaEL4yb

STRIPE_PUBLISHABLE_KEY=pk_live_51RFfRWBQXryBTFI2ezJOITbZDP7JACjUqGvGEhyA3CQ8G9NxQoqkOBtOu1uThd2wScwEbAKROha8IpNr108dvzZr00d506qz5K
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=whsec_uRhCmMLPQm24HMbmz15vfTApIsn0mD33
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_1RkAUlBQXryBTFI2BoG6k75U
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE=price_1RkAVEBQXryBTFI2wrKwjUcF

NEXTAUTH_URL=https://napoleonai.app
NEXTAUTH_SECRET=KzotcyJF91GkYNkdk7dgI89J4XWkdCLK37dfb2k23bM

GOOGLE_CLIENT_ID=1070879625346-mjkd1rlk8fd9i7b5gi2q13ss6opb7etf.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

GOOGLE_REDIRECT_URI=https://napoleonai.app/api/auth/google/callback
SLACK_REDIRECT_URI=https://napoleonai.app/api/auth/slack/callback

SLACK_CLIENT_ID=9139741575408.9168961368182
SLACK_CLIENT_SECRET=fc09de15c806b45740b7e6087723a39f

TEAMS_CLIENT_ID=8a4546d6-6c71-482e-99de-a02f46b2589f
TEAMS_CLIENT_SECRET=e0a234b3-5535-498b-8c3a-2f1e616d4c1a
TEAMS_TENANT_ID=ccb6deed-bd29-4b38-8979-d72780f62d3b
TEAMS_REDIRECT_URI=https://napoleonai.app/api/auth/teams/callback

RESEND_API_KEY=re_5NbdUNrN_DYFNVnLo92rQTtsNSv9LRMnU

# Sentry Configuration
SENTRY_DSN=https://your-sentry-dsn.sentry.io/project-id
SENTRY_ORG=napoleon-ai
SENTRY_PROJECT=napoleon-ai-platform

# Encryption (for testing)
ENCRYPTION_MASTER_KEY=test-key-32-bytes-long-for-testing

# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=Napoleon AI
EOF

echo "✅ Created .env.local file"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install MCP servers
echo "🔧 Installing MCP servers..."

# Core MCP servers
npm install -g @mcp/mcp-shell
npm install -g @mcp/mcp-python
npm install -g @mcp/mcp-http-client
npm install -g mcp-git
npm install -g mcp-text-editor
npm install -g github-repo-mcp

# AI and Development servers
npm install -g serena
npm install -g pydantic-ai
npm install -g mcp-server-commands
npm install -g mcp-server-js

# Database and Infrastructure servers
npm install -g @mcp/mcp-supabase
npm install -g @mcp/mcp-postgres
npm install -g @mcp/mcp-mongodb
npm install -g @mcp/mcp-redisearch

# Authentication and Services
npm install -g @mcp/mcp-clerk
npm install -g @mcp/mcp-openai
npm install -g @mcp/mcp-stripe
npm install -g @mcp/mcp-calendar
npm install -g @mcp/mcp-email
npm install -g @mcp/mcp-slack-server

# Development and Testing
npm install -g @mcp/mcp-graphql
npm install -g @mcp/mcp-sentry
npm install -g @mcp/mcp-analytics
npm install -g @mcp/mcp-ci
npm install -g @mcp/mcp-cd
npm install -g @mcp/mcp-feature-flags
npm install -g @mcp/mcp-i18n
npm install -g @mcp/mcp-security-scan
npm install -g @mcp/mcp-docs
npm install -g @mcp/mcp-test-runner
npm install -g @mcp/mcp-webhooks

echo "✅ MCP servers installed"

# Start MCP servers
echo "🚀 Starting MCP servers..."
npx mcp up

echo "📊 Checking MCP status..."
npx mcp status

echo "🎉 Napoleon AI MCP Environment setup complete!"
echo ""
echo "📋 Available MCP Servers:"
echo "  • GitHub Repo Browser"
echo "  • Shell Commands"
echo "  • Text Editor"
echo "  • Python Interpreter"
echo "  • HTTP Client"
echo "  • Git Operations"
echo "  • Supabase Database"
echo "  • Clerk Authentication"
echo "  • OpenAI AI Services"
echo "  • Stripe Payments"
echo "  • Google Calendar"
echo "  • Email Services"
echo "  • Slack Integration"
echo "  • PostgreSQL Database"
echo "  • MongoDB Database"
echo "  • GraphQL Operations"
echo "  • Sentry Monitoring"
echo "  • Analytics"
echo "  • CI/CD Operations"
echo "  • Feature Flags"
echo "  • Internationalization"
echo "  • Security Scanning"
echo "  • Documentation"
echo "  • Test Runner"
echo "  • Webhooks"
echo "  • Vercel Deployment"
echo ""
echo "🔧 Next steps:"
echo "  1. Run 'npm run dev' to start the development server"
echo "  2. Run 'npx mcp status' to check server status"
echo "  3. Use Claude Code or Cursor AI to interact with the MCP servers" 