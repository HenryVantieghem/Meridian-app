# Super Intelligence - AI-Powered Email Management Platform

Transform communication chaos into clarity through intelligent email management, AI-powered prioritization, and elegant UX design following Dieter Rams principles.

## 🚀 Features

- **AI-Powered Email Analysis**: Intelligent summaries and priority detection
- **Smart Prioritization**: Automatically categorize and prioritize your inbox
- **AI Reply Generation**: Draft professional responses with AI assistance
- **Real-time Sync**: Seamless integration with Gmail and Outlook
- **Advanced Analytics**: Detailed insights into your communication patterns
- **Enterprise Security**: Row-level security and comprehensive data protection

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript 5.0+
- **Styling**: Tailwind CSS with custom Super Intelligence design system
- **Authentication**: Clerk with JWT templates for Supabase
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **AI**: OpenAI GPT-4o for email analysis and generation
- **Payments**: Stripe for subscription management
- **Email Service**: Resend for transactional emails
- **Animations**: Framer Motion for micro-interactions
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling
- **Deployment**: Vercel with edge functions

## 🎨 Design Philosophy

- **Dieter Rams Principles**: "Less, but better" - every element must serve a purpose
- **Calm Technology**: Inform without demanding attention, stay in periphery until needed
- **Swiss Design Minimalism**: Clean, precise, functional with luxury touches
- **Color System**: White (#FFFFFF) backgrounds, Black (#000000) text, Gold (#D4AF37) accents
- **Typography**: Helvetica Neue font family throughout
- **Grid System**: 8px base unit for consistent spacing
- **Micro-interactions**: Purposeful, delightful, 300-500ms duration

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Clerk account
- OpenAI API key
- Stripe account (for payments)
- Resend account (for emails)

### 1. Clone the repository

```bash
git clone <repository-url>
cd super-intelligence-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the environment template and fill in your values:

```bash
cp env.example .env.local
```

Required environment variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key
OPENAI_ORGANIZATION_ID=org-your_organization_id

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Resend Email Service
RESEND_API_KEY=re_your_resend_api_key
NEXT_PUBLIC_RESEND_FROM_EMAIL=noreply@yourdomain.com

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Set up the database

Run the SQL schema in your Supabase project:

```bash
# Copy the schema to your Supabase SQL editor
cat supabase-schema.sql
```

### 5. Configure Clerk JWT template

In your Clerk dashboard:

1. Go to JWT Templates
2. Create a new template named "supabase"
3. Use the configuration from `src/lib/auth/clerk-config.ts`

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗 Project Structure

```
super-intelligence-app/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Authentication pages
│   │   ├── (dashboard)/      # Dashboard pages
│   │   ├── (marketing)/      # Marketing pages
│   │   ├── onboarding/       # Onboarding flow
│   │   ├── api/              # API routes
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── middleware.ts     # Clerk middleware
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   ├── auth/             # Authentication components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── onboarding/       # Onboarding components
│   │   ├── marketing/        # Marketing components
│   │   ├── email/            # Email components
│   │   └── ai/               # AI components
│   ├── lib/
│   │   ├── auth/             # Authentication utilities
│   │   ├── db/               # Database utilities
│   │   ├── ai/               # AI integration
│   │   ├── stripe/           # Payment integration
│   │   ├── email/            # Email utilities
│   │   ├── validations/      # Zod schemas
│   │   └── utils.ts          # Utility functions
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
├── supabase-schema.sql       # Database schema
├── tailwind.config.ts        # Tailwind configuration
├── next.config.js            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 🎯 Development Guidelines

### Code Standards

- **TypeScript**: Use strict mode with proper type definitions
- **React**: Use Server Components by default, Client Components only when needed
- **Next.js**: Use App Router patterns and Server Actions for mutations
- **Database**: Use Supabase RLS policies for all data access
- **AI**: Implement proper rate limiting and confidence scoring
- **Performance**: Follow performance requirements (< 2s page load, < 500ms API)

### Component Development

- Use Radix UI primitives as foundation
- Implement class-variance-authority for variants
- Include proper TypeScript interfaces
- Add comprehensive accessibility attributes
- Use consistent naming conventions

### Testing

- Unit tests for all utility functions
- Integration tests for API endpoints
- Component tests with React Testing Library
- E2E tests for critical user flows
- Performance testing with Lighthouse

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📊 Performance Requirements

- **Page Load Time**: < 2 seconds (LCP)
- **First Contentful Paint**: < 1.2 seconds
- **Time to Interactive**: < 3 seconds
- **Bundle Size**: < 500KB compressed
- **API Response Time**: < 500ms average
- **Database Query Time**: < 100ms average

## 🔒 Security Requirements

- Implement proper input validation with Zod
- Use parameterized queries for all database operations
- Add proper CSRF protection
- Implement proper rate limiting
- Use secure headers and CSP policies
- Add proper error logging without exposing sensitive data

## ♿ Accessibility Requirements

- Implement proper ARIA labels and roles
- Ensure keyboard navigation for all interactive elements
- Maintain proper color contrast (4.5:1 minimum)
- Add proper screen reader support
- Implement proper focus management
- Use semantic HTML elements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you need help with Super Intelligence:

- 📧 Email: support@super-intelligence.ai
- 💬 Discord: [Join our community](https://discord.gg/super-intelligence)
- 📖 Documentation: [docs.super-intelligence.ai](https://docs.super-intelligence.ai)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/super-intelligence-app/issues)

## 🎉 Acknowledgments

- Built with Next.js and React
- Powered by OpenAI GPT-4o
- Styled with Tailwind CSS
- Icons by Lucide React
- Animations by Framer Motion
