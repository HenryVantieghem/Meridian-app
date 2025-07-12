import { NextRequest, NextResponse } from 'next/server';
import { validateEnvironment } from '@/lib/config/production';
import { createClient } from '@supabase/supabase-js';
import { productionUtils } from '@/lib/config/production';

// Health check response interface
interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  checks: {
    database: HealthCheck;
    ai: HealthCheck;
    email: HealthCheck;
    slack: HealthCheck;
    gmail: HealthCheck;
    outlook: HealthCheck;
    stripe: HealthCheck;
    environment: HealthCheck;
  };
  metrics: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      load: number;
    };
  };
}

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  details?: Record<string, unknown>;
}

// Database health check
async function checkDatabase(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Test database connection
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: 'unhealthy',
        responseTime,
        error: error.message,
        details: { message: error.message, code: error.code },
      };
    }

    return {
      status: 'healthy',
      responseTime,
      details: { connected: true },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

// AI service health check
async function checkAI(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        status: 'degraded',
        responseTime,
        error: `OpenAI API returned ${response.status}`,
      };
    }

    return {
      status: 'healthy',
      responseTime,
      details: { available: true },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'AI service unavailable',
    };
  }
}

// Email service health check
async function checkEmail(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Email service disabled - Resend removed
    const responseTime = Date.now() - startTime;

    return {
      status: 'degraded',
      responseTime,
      error: 'Email service disabled - Resend removed',
      details: { available: false },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Email service unavailable',
    };
  }
}

// Slack API health check
async function checkSlack(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://slack.com/api/auth.test', {
      headers: {
        'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      },
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    if (!data.ok) {
      return {
        status: 'degraded',
        responseTime,
        error: data.error || 'Slack API error',
      };
    }

    return {
      status: 'healthy',
      responseTime,
      details: { authenticated: true },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Slack service unavailable',
    };
  }
}

// Gmail API health check
async function checkGmail(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Check if Gmail credentials are configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return {
        status: 'degraded',
        responseTime: Date.now() - startTime,
        error: 'Gmail credentials not configured',
      };
    }

    return {
      status: 'healthy',
      responseTime: Date.now() - startTime,
      details: { configured: true },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Gmail service error',
    };
  }
}

// Outlook API health check
async function checkOutlook(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Check if Outlook credentials are configured
    if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
      return {
        status: 'degraded',
        responseTime: Date.now() - startTime,
        error: 'Outlook credentials not configured',
      };
    }

    return {
      status: 'healthy',
      responseTime: Date.now() - startTime,
      details: { configured: true },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Outlook service error',
    };
  }
}

// Stripe API health check
async function checkStripe(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.stripe.com/v1/account', {
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        status: 'degraded',
        responseTime,
        error: `Stripe API returned ${response.status}`,
      };
    }

    return {
      status: 'healthy',
      responseTime,
      details: { connected: true },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Stripe service unavailable',
    };
  }
}

// Environment health check
function checkEnvironment(): HealthCheck {
  const startTime = Date.now();
  
  try {
    const result = validateEnvironment();
    const responseTime = Date.now() - startTime;

    if (!result.valid) {
      return {
        status: 'unhealthy',
        responseTime,
        error: 'Environment validation failed',
        details: result.errors ? { errors: result.errors } : undefined,
      };
    }

    return {
      status: 'healthy',
      responseTime,
      details: { validated: true },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Environment check failed',
    };
  }
}

// Get system metrics
function getSystemMetrics() {
  if (typeof process !== 'undefined') {
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal + memUsage.external;
    const usedMemory = memUsage.heapUsed + memUsage.external;
    
    return {
      memory: {
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round((usedMemory / totalMemory) * 100),
      },
      cpu: {
        load: process.cpuUsage().user / 1000000, // Convert to seconds
      },
    };
  }

  return {
    memory: { used: 0, total: 0, percentage: 0 },
    cpu: { load: 0 },
  };
}

// Determine overall health status
function determineOverallStatus(checks: HealthCheckResponse['checks']): 'healthy' | 'degraded' | 'unhealthy' {
  const statuses = Object.values(checks).map(check => check.status);
  
  if (statuses.every(status => status === 'healthy')) {
    return 'healthy';
  }
  
  if (statuses.some(status => status === 'unhealthy')) {
    return 'unhealthy';
  }
  
  return 'degraded';
}

export async function GET() {
  const startTime = Date.now();

  try {
    // Run all health checks in parallel
    const [
      databaseCheck,
      aiCheck,
      emailCheck,
      slackCheck,
      gmailCheck,
      outlookCheck,
      stripeCheck,
      environmentCheck,
    ] = await Promise.all([
      checkDatabase(),
      checkAI(),
      checkEmail(),
      checkSlack(),
      checkGmail(),
      checkOutlook(),
      checkStripe(),
      Promise.resolve(checkEnvironment()),
    ]);

    const checks = {
      database: databaseCheck,
      ai: aiCheck,
      email: emailCheck,
      slack: slackCheck,
      gmail: gmailCheck,
      outlook: outlookCheck,
      stripe: stripeCheck,
      environment: environmentCheck,
    };

    const overallStatus = determineOverallStatus(checks);
    // const responseTime = Date.now() - startTime;

    const healthResponse: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks,
      metrics: getSystemMetrics(),
    };

    // Set appropriate HTTP status code
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(healthResponse, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: unknown) {
    const errorResponse = {
      status: 'unhealthy' as const,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}

// Detailed health check endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { detailed = false } = body;

    if (detailed) {
      // Return detailed health information including configuration
      const config = productionUtils.getConfig();
      
      return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        config: productionUtils.sanitizeForLogging(config),
        features: config.features,
      });
    }

    // Return basic health check
    return GET();
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
} 