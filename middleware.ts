import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simulated Edge Rate Limiter (In-memory Edge dictionary)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

export function middleware(request: NextRequest) {
  // 1. Edge-Runtime Rate Limiting (DDoS Protection)
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100; // 100 requests per minute per IP

  const rateData = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };
  if (now > rateData.resetTime) {
    rateData.count = 1;
    rateData.resetTime = now + windowMs;
  } else {
    rateData.count++;
  }
  rateLimitMap.set(ip, rateData);

  if (rateData.count > maxRequests) {
    return new NextResponse('Too Many Requests. DDoS protection active.', { status: 429 });
  }

  // 2. Enterprise Security Headers
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  
  // Note: For production with Next.js, 'unsafe-inline' and 'unsafe-eval' might be needed 
  // during development for React/Next.js HMR. We enforce strict framing and object limits.
  const cspHeader = `
    default-src 'self';
    connect-src 'self' ws: wss: https:;
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' blob: data: https:;
    media-src 'self' blob: https:;
    frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.twitch.tv https://vid.puffyan.us;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Strict MIME type sniffing and Clickjacking protection
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Optional: HSTS for forcing HTTPS
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
