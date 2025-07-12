import { NextRequest, NextResponse } from 'next/server';
import { productionMonitor } from '@/lib/monitoring/production-monitor';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get health status
    const healthStatus = productionMonitor.getHealthStatus();
    
    // Check database connectivity
    const dbStatus = await checkDatabaseHealth();
    
    // Check external services
    const externalServices = await checkExternalServices();
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Track this request
    productionMonitor.trackPerformance({
      timestamp: new Date().toISOString(),
      pageLoadTime: responseTime,
      apiResponseTime: responseTime,
      databaseQueryTime: dbStatus.responseTime,
      aiProcessingTime: 0,
      memoryUsage: process.memoryUsage().heapUsed,
      cpuUsage: process.cpuUsage().user,
    });

    const overallStatus = determineOverallStatus(healthStatus.status, dbStatus.status, externalServices);
    
    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: healthStatus.metrics.uptime,
      responseTime,
      services: {
        database: dbStatus,
        external: externalServices,
        memory: {
          used: healthStatus.metrics.memoryUsage.heapUsed,
          total: healthStatus.metrics.memoryUsage.heapTotal,
          external: healthStatus.metrics.memoryUsage.external,
        },
        cpu: {
          user: healthStatus.metrics.cpuUsage.user,
          system: healthStatus.metrics.cpuUsage.system,
        },
      },
      errors: healthStatus.recentErrors.length,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
    }, {
      status: overallStatus === 'healthy' ? 200 : overallStatus === 'warning' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    productionMonitor.reportError({
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown health check error',
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url,
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      severity: 'critical',
    });

    return NextResponse.json({
      status: 'critical',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
      responseTime,
    }, { status: 503 });
  }
}

async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    // Test database connection
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        status: 'critical',
        responseTime: Date.now() - startTime,
        error: 'Database credentials not configured',
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return {
        status: 'critical',
        responseTime,
        error: error.message,
      };
    }
    
    return {
      status: 'healthy',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'critical',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

async function checkExternalServices(): Promise<{
  [key: string]: {
    status: 'healthy' | 'warning' | 'critical';
    responseTime: number;
    error?: string;
  };
}> {
  const services: { [key: string]: any } = {};
  
  // Check OpenAI API
  if (process.env.OPENAI_API_KEY) {
    services.openai = await checkOpenAI();
  }
  
  // Check Stripe API
  if (process.env.STRIPE_SECRET_KEY) {
    services.stripe = await checkStripe();
  }
  
  // Check Clerk API
  if (process.env.CLERK_SECRET_KEY) {
    services.clerk = await checkClerk();
  }
  
  return services;
}

async function checkOpenAI(): Promise<{
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  error?: string;
}> {
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
        status: 'critical',
        responseTime,
        error: `OpenAI API error: ${response.status}`,
      };
    }
    
    return {
      status: 'healthy',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'critical',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'OpenAI connection failed',
    };
  }
}

async function checkStripe(): Promise<{
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  error?: string;
}> {
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
        status: 'critical',
        responseTime,
        error: `Stripe API error: ${response.status}`,
      };
    }
    
    return {
      status: 'healthy',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'critical',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Stripe connection failed',
    };
  }
}

async function checkClerk(): Promise<{
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.clerk.dev/v1/instances', {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });
    
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        status: 'critical',
        responseTime,
        error: `Clerk API error: ${response.status}`,
      };
    }
    
    return {
      status: 'healthy',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'critical',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Clerk connection failed',
    };
  }
}

function determineOverallStatus(
  healthStatus: 'healthy' | 'warning' | 'critical',
  dbStatus: 'healthy' | 'warning' | 'critical',
  externalServices: { [key: string]: any }
): 'healthy' | 'warning' | 'critical' {
  const allStatuses = [healthStatus, dbStatus, ...Object.values(externalServices).map(s => s.status)];
  
  if (allStatuses.some(s => s === 'critical')) {
    return 'critical';
  }
  
  if (allStatuses.some(s => s === 'warning')) {
    return 'warning';
  }
  
  return 'healthy';
} 