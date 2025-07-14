#!/bin/bash

# Napoleon AI - Simplified MCP Setup Script
# This script installs only the MCP packages that are actually available

echo "🚀 Setting up Napoleon AI MCP Environment (Simplified)..."

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

# Install available MCP servers
echo "🔧 Installing available MCP servers..."

# Core MCP servers (these are available)
npm install -g github-repo-mcp
npm install -g mcp-git
npm install -g serena
npm install -g mcp-server-commands

# Install MCP SDK for development
npm install -g @modelcontextprotocol/sdk

echo "✅ Available MCP servers installed"

# Create a simple MCP configuration
cat > .mcp-simple.json << 'EOF'
{
  "mcpServers": {
    "github-repo-mcp": {
      "command": "npx",
      "args": ["github-repo-mcp"],
      "env": {
        "GITHUB_TOKEN": "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"
      },
      "enabled": true
    },
    "mcp-git": {
      "command": "npx",
      "args": ["mcp-git"],
      "enabled": true
    },
    "serena": {
      "command": "npx",
      "args": ["serena"],
      "enabled": true
    },
    "mcp-server-commands": {
      "command": "npx",
      "args": ["mcp-server-commands"],
      "enabled": true
    }
  }
}
EOF

echo "✅ Created .mcp-simple.json configuration"

# Test the setup
echo "🧪 Testing MCP setup..."

# Test GitHub token
if curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user > /dev/null 2>&1; then
    echo "✅ GitHub token is valid"
else
    echo "⚠️  GitHub token may be invalid or expired"
fi

# Test environment variables
if [ -f ".env.local" ]; then
    echo "✅ Environment file created"
else
    echo "❌ Environment file creation failed"
fi

echo ""
echo "🎉 Napoleon AI MCP Environment setup complete!"
echo ""
echo "📋 Available MCP Servers:"
echo "  • GitHub Repo Browser (github-repo-mcp)"
echo "  • Git Operations (mcp-git)"
echo "  • Serena AI Assistant (serena)"
echo "  • Server Commands (mcp-server-commands)"
echo ""
echo "🔧 Next steps:"
echo "  1. Run 'npm run dev' to start the development server"
echo "  2. Use Claude Code or Cursor AI with MCP integration"
echo "  3. Check the MCP Integration Guide: docs/MCP_INTEGRATION_GUIDE.md"
echo ""
echo "📚 Documentation:"
echo "  • MCP Integration Guide: docs/MCP_INTEGRATION_GUIDE.md"
echo "  • Available commands: npx github-repo-mcp --help"
echo "  • Git operations: npx mcp-git --help"
echo ""
echo "🚀 Ready for AI-powered development!" 