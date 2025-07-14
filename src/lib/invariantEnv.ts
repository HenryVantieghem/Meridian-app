/**
 * Runtime environment variable validation
 * Throws clear errors if required environment variables are missing
 */

interface RequiredEnvVars {
  // Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  
  // Database
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  
  // AI
  OPENAI_API_KEY: string;
  OPENAI_ORGANIZATION_ID: string;
  
  // OAuth - Gmail
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  
  // OAuth - Slack
  SLACK_CLIENT_ID: string;
  SLACK_CLIENT_SECRET: string;
  SLACK_REDIRECT_URI: string;
  
  // Runtime URLs
  NEXT_PUBLIC_APP_URL: string;
  
  // Email Service
  RESEND_API_KEY: string;
  
  // Optional - Microsoft Teams (future)
  TEAMS_CLIENT_ID?: string;
  TEAMS_CLIENT_SECRET?: string;
  TEAMS_TENANT_ID?: string;
  TEAMS_REDIRECT_URI?: string;
  
  // Optional - Stripe
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  
  // Optional - Slack additional
  SLACK_SIGNING_SECRET?: string;
  
  // Optional - App config
  NEXT_PUBLIC_APP_NAME?: string;
  REALTIME_PORT?: string;
  NODE_ENV?: string;
}

/**
 * Validates that all required environment variables are present
 * Throws a clear error message if any are missing
 */
export function validateEnvironment(): RequiredEnvVars {
  const requiredVars: (keyof RequiredEnvVars)[] = [
    // Authentication
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    
    // Database
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    
    // AI
    'OPENAI_API_KEY',
    'OPENAI_ORGANIZATION_ID',
    
    // OAuth - Gmail
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
    
    // OAuth - Slack
    'SLACK_CLIENT_ID',
    'SLACK_CLIENT_SECRET',
    'SLACK_REDIRECT_URI',
    
    // Runtime URLs
    'NEXT_PUBLIC_APP_URL',
    
    // Email Service
    'RESEND_API_KEY',
  ];

  const missingVars: string[] = [];
  const env: Partial<RequiredEnvVars> = {};

  // Check required variables
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missingVars.push(varName);
    } else {
      env[varName] = value;
    }
  }

  // Check optional variables
  const optionalVars: (keyof RequiredEnvVars)[] = [
    'TEAMS_CLIENT_ID',
    'TEAMS_CLIENT_SECRET',
    'TEAMS_TENANT_ID',
    'TEAMS_REDIRECT_URI',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'SLACK_SIGNING_SECRET',
    'NEXT_PUBLIC_APP_NAME',
    'REALTIME_PORT',
    'NODE_ENV',
  ];

  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value && value.trim() !== '') {
      env[varName] = value;
    }
  }

  if (missingVars.length > 0) {
    const errorMessage = `
🚨 MISSING REQUIRED ENVIRONMENT VARIABLES

The following environment variables are required but not set:

${missingVars.map(varName => `  - ${varName}`).join('\n')}

Please add these to your .env file or set them in your deployment environment.

For local development:
1. Copy .env.example to .env
2. Fill in the required values
3. Restart your development server

For production deployment:
1. Set these variables in your Vercel project settings
2. Redeploy your application

See .env.example for the complete list of required variables.
    `.trim();

    throw new Error(errorMessage);
  }

  return env as RequiredEnvVars;
}

/**
 * Validates a specific environment variable
 * Throws if the variable is missing or empty
 */
export function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Gets an environment variable with a default value
 */
export function getEnvVar(name: string, defaultValue?: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== '' ? value : defaultValue;
}

/**
 * Validates environment variables for a specific feature
 */
export function validateFeatureEnv(feature: 'gmail' | 'slack' | 'teams' | 'stripe'): void {
  switch (feature) {
    case 'gmail':
      requireEnvVar('GOOGLE_CLIENT_ID');
      requireEnvVar('GOOGLE_CLIENT_SECRET');
      requireEnvVar('GOOGLE_REDIRECT_URI');
      break;
    case 'slack':
      requireEnvVar('SLACK_CLIENT_ID');
      requireEnvVar('SLACK_CLIENT_SECRET');
      requireEnvVar('SLACK_REDIRECT_URI');
      break;
    case 'teams':
      requireEnvVar('TEAMS_CLIENT_ID');
      requireEnvVar('TEAMS_CLIENT_SECRET');
      requireEnvVar('TEAMS_TENANT_ID');
      requireEnvVar('TEAMS_REDIRECT_URI');
      break;
    case 'stripe':
      requireEnvVar('STRIPE_SECRET_KEY');
      requireEnvVar('STRIPE_WEBHOOK_SECRET');
      requireEnvVar('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
      break;
  }
}

// Auto-validate on module load in production
if (process.env.NODE_ENV === 'production') {
  try {
    validateEnvironment();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown environment validation error';
    console.error('Environment validation failed:', errorMessage);
    process.exit(1);
  }
} 