import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security headers
function addSecurityHeaders(response: NextResponse) {
  // Basic security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy (Updated - Removed Midtrans)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://www.google-analytics.com",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);

  // HSTS for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

// Rate limiting function
function checkRateLimit(ip: string, endpoint: string): boolean {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  
  // Different limits for different endpoints
  let maxRequests = 100; // Default
  if (endpoint.includes('/api/auth/')) {
    maxRequests = 5; // Stricter for auth endpoints
  } else if (endpoint.includes('/api/orders')) {
    maxRequests = 20; // Moderate for orders
  }

  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get client IP
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    if (!checkRateLimit(ip, pathname)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  let response = NextResponse.next();

  // Admin session management
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      // Check if already logged in
      const adminSession = request.cookies.get('admin_session');
      if (adminSession) {
        try {
          const secret = new TextEncoder().encode(process.env.JWT_SECRET);
          await jwtVerify(adminSession.value, secret);
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        } catch {
          // Invalid token, continue to login page
        }
      }
    } else {
      // Protect admin routes
      const adminSession = request.cookies.get('admin_session');
      if (!adminSession) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(adminSession.value, secret);
      } catch {
        response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('admin_session');
        return addSecurityHeaders(response);
      }
    }
  }

  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};