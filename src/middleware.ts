import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware without complex dependencies
export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Allow public routes without any processing
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/status') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }
  
  // Basic security headers for all other routes
  const response = NextResponse.next();
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

// Export configuration - simplified matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/health and api/status (health endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/health|api/status).*)',
  ],
}; 