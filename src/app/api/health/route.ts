import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();
  
  try {
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      message: 'Napoleon AI Platform is running'
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: 'critical',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
      responseTime,
    }, { status: 503 });
  }
}