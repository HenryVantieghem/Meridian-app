#!/bin/bash

# Napoleon AI Platform - Development Setup Script
# This script automates the entire development workflow for maximum speed

set -e

echo "🚀 Napoleon AI Platform - Fast Development Setup"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf .next out dist coverage node_modules/.cache

# Install dependencies with optimizations
print_status "Installing dependencies with optimizations..."
npm ci --prefer-offline --no-audit --silent

# Install additional dev dependencies if needed
print_status "Installing development tools..."
npm install --save-dev concurrently nodemon @next/bundle-analyzer

# Setup environment variables
print_status "Setting up environment variables..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local 2>/dev/null || echo "No .env.example found, creating basic .env.local"
    cat > .env.local << EOF
# Development Environment Variables
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Napoleon
NODE_ENV=development

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AI (OpenAI)
OPENAI_API_KEY=sk-your_openai_key_here

# Payments (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_key

# Development optimizations
NEXT_TELEMETRY_DISABLED=1
NEXT_SHARP_PATH=./node_modules/sharp
EOF
    print_success "Created .env.local with development configuration"
fi

# Run type checking
print_status "Running TypeScript type checking..."
npm run type-check

# Run linting
print_status "Running ESLint..."
npm run lint:fix

# Run tests
print_status "Running tests..."
npm run test:run

# Build the application
print_status "Building application..."
npm run build:fast

print_success "Development setup completed successfully!"

# Start development server with all tools
print_status "Starting development environment with parallel tools..."
echo ""
echo "🔄 Starting parallel development tools:"
echo "   - Next.js development server (http://localhost:3000)"
echo "   - Test watcher"
echo "   - Lint watcher"
echo "   - Type checking watcher"
echo ""
echo "📊 Available commands:"
echo "   npm run dev:fast      - Fast development server with Turbo"
echo "   npm run dev:parallel  - Parallel development with all tools"
echo "   npm run build:fast    - Fast production build"
echo "   npm run test:watch    - Watch tests"
echo "   npm run lint:watch    - Watch linting"
echo "   npm run type-check:watch - Watch type checking"
echo "   npm run performance   - Run Lighthouse performance audit"
echo "   npm run bundle-analyze - Analyze bundle size"
echo ""
echo "🎯 Quick start: npm run dev:parallel"
echo ""

# Ask user if they want to start development
read -p "Start development environment now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting development environment..."
    npm run dev:parallel
else
    print_success "Setup complete! Run 'npm run dev:parallel' to start development."
fi 