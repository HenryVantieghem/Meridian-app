import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { staticAssetCaching } from '@/lib/performance/caching';

// Performance monitoring middleware
const withPerformanceMonitoring = (handler: (req: NextRequest) => NextResponse | Promise<NextResponse>) => {
  return async (req: NextRequest) => {
    const startTime = performance.now();
    
    try {
      const response = await handler(req);
      const duration = performance.now() - startTime;
      
      // Track performance (simplified)
      console.log(`API Performance: ${req.nextUrl.pathname} - ${duration.toFixed(2)}ms`);
      
      return response;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      // Track error (simplified)
      console.error(`Middleware error: ${req.nextUrl.pathname} - ${duration.toFixed(2)}ms`, error);
      
      throw error;
    }
  };
};

// Create route matchers
const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/sign-in',
  '/sign-up',
  '/api/webhooks(.*)',
  '/api/email(.*)',
  '/api/stripe(.*)',
  '/api/health',
  '/_next(.*)',
  '/favicon.ico',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
]);

// const isIgnoredRoute = createRouteMatcher([
//   '/api/webhooks(.*)',
//   '/api/health',
// ]);

// Main middleware function
export default clerkMiddleware(async (auth, req) => {
  // Skip Clerk authentication for health endpoint and other public routes
  if (isPublicRoute(req)) {
    // Static asset caching
    const staticResponse = staticAssetCaching(req);
    if (staticResponse) {
      return staticResponse;
    }
    
    // Create response with headers for public routes
    const response = NextResponse.next();
    
    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return response;
  }

  // Static asset caching
  const staticResponse = staticAssetCaching(req);
  if (staticResponse) {
    return staticResponse;
  }

  // Get userId from Clerk for protected routes
  const { userId } = await auth();

  // Handle authentication for protected routes
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // Handle authenticated routes
  if (userId && req.nextUrl.pathname === '/') {
    const dashboardUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  // Create response with headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Performance headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  // Performance optimization for authenticated routes
  if (userId) {
    // Add user-specific cache headers
    response.headers.set('Cache-Control', 'private, max-age=300');
    response.headers.set('X-User-ID', userId);
  }
  
  return response;
});

// Export configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};

// Performance monitoring wrapper
export const performanceMiddleware = withPerformanceMonitoring((_req: NextRequest) => {
  // This will be handled by the auth middleware
  return NextResponse.next();
}); 