import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // تحديث الجلسة والتحقق من Authentication
  let response = await updateSession(request)
  
  // إضافة Security Headers
  const headers = new Headers(response.headers)
  addSecurityHeaders(headers, request)
  
  // إذا كان response redirect، نعيد redirect جديد مع headers
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location')
    if (location) {
      return NextResponse.redirect(location, { headers })
    }
  }
  
  // للـ responses العادية، نعيد response جديد مع headers محدثة
  return NextResponse.next({
    request,
    headers,
  })
}

/**
 * إضافة Security Headers للـ response
 */
function addSecurityHeaders(headers: Headers, request: NextRequest) {
  // Prevent clickjacking attacks
  headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff')
  
  // Enable XSS protection (legacy browsers)
  headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer Policy - control referrer information
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions Policy - restrict browser features
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )
  
  // Content Security Policy (CSP)
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // استخراج origin من request لدعم أي IP address
  const host = request.headers.get('host') || ''
  const protocol = request.headers.get('x-forwarded-proto') || 
                   (request.url.startsWith('https') ? 'https' : 'http')
  const origin = `${protocol}://${host}`
  
  // بناء CSP directives - في Development نسمح بالوصول من أي IP
  // ملاحظة: في Development نسمح بـ unsafe-eval لـ Next.js HMR/Turbopack
  const cspDirectives = [
    isDevelopment
      ? `default-src 'self' ${origin}` // إضافة origin للدعم من أي IP
      : "default-src 'self'",
    isDevelopment
      ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${origin} http://localhost:* http://127.0.0.1:* http://*:* https://*:* 'wasm-unsafe-eval'` // Development: Next.js HMR يحتاج unsafe-eval
      : "script-src 'self'", // Production: أكثر تقييداً
    `style-src 'self' 'unsafe-inline' ${origin} https://fonts.googleapis.com`, // للـ Tailwind + Google Fonts + origin
    "font-src 'self' data: https://fonts.gstatic.com", // Google Fonts
    `img-src 'self' data: https: blob: ${origin}`, // إضافة origin للصور
    isDevelopment
      ? `connect-src 'self' ${origin} ws://${host} wss://${host} http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:* http://*:* ws://*:* wss://*:* https://*.supabase.co wss://*.supabase.co https://fonts.googleapis.com` // Development + WebSocket + Google Fonts
      : "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://fonts.googleapis.com", // Production + Google Fonts
    "frame-ancestors 'none'",
    isDevelopment
      ? `base-uri 'self' ${origin}` // إضافة origin للـ base URI
      : "base-uri 'self'",
    isDevelopment
      ? `form-action 'self' ${origin}` // إضافة origin للـ form actions
      : "form-action 'self'",
    isDevelopment
      ? "worker-src 'self' blob:" // للـ Web Workers في Development
      : "worker-src 'self'",
  ]
  
  headers.set('Content-Security-Policy', cspDirectives.join('; '))
  
  // HSTS - Force HTTPS (في Production فقط)
  if (process.env.NODE_ENV === 'production') {
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
