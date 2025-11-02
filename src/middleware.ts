import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { 
  createSecurityHeadersManager,
  comprehensiveSecurityManager,
  inputSanitizer,
  type SanitizationResult
} from '@/lib/security'

export async function middleware(request: NextRequest) {
  try {
    // فحص شامل للأمان
    const securityResults = comprehensiveSecurityManager.performComprehensiveSecurityCheck(request)
    
    // إذا كان هناك HTTPS redirect مطلوب
    if (securityResults.httpsRedirect?.shouldRedirect) {
      return comprehensiveSecurityManager['httpsRedirect'].createHTTPSRedirect(
        securityResults.httpsRedirect.redirectUrl!
      )
    }
    
    // إذا لم يكن الطلب مسموح (rate limiting, CORS, etc.)
    if (!securityResults.isAllowed) {
      return new NextResponse('Forbidden - Security Policy Violation', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY'
        }
      })
    }
    
    // تحديث الجلسة والتحقق من Authentication
    let response = await updateSession(request)
    
    // تنظيف المدخلات المشبوهة
    const sanitizedUrl = sanitizeRequestUrl(request.url)
    if (sanitizedUrl !== request.url) {
      // إعادة التوجيه للـ URL المنظف
      const newUrl = new URL(sanitizedUrl)
      newUrl.search = sanitizeQueryParams(newUrl.searchParams).toString()
      return NextResponse.redirect(newUrl.toString())
    }
    
    // إضافة Security Headers متقدمة
    const headers = new Headers(response.headers)
    const securityHeadersManager = createSecurityHeadersManager(request)
    securityHeadersManager.applyAllHeaders(headers, request)
    
    // إضافة CORS headers إذا كان مطلوب
    const origin = request.headers.get('origin')
    if (origin && request.method === 'OPTIONS') {
      const corsResult = comprehensiveSecurityManager['corsManager'].validateCORS(request, origin)
      for (const [key, value] of Object.entries(corsResult.corsHeaders)) {
        headers.set(key, value)
      }
    }
    
    // إضافة معلومات الأمان للتتبع
    headers.set('X-Security-Policy', 'comprehensive')
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-XSS-Protection', '1; mode=block')
    
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
    
  } catch (error) {
    // في حالة خطأ في middleware، نعيد response آمن
    console.error('Security middleware error:', error)
    
    return new NextResponse('Internal Server Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      }
    })
  }
}

/**
 * تنظيف URL الطلب للتأكد من عدم وجود threats
 */
function sanitizeRequestUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    
    // تنظيف pathname
    urlObj.pathname = sanitizePathSegment(urlObj.pathname)
    
    return urlObj.toString()
  } catch {
    return url
  }
}

/**
 * تنظيف مسار URL
 */
function sanitizePathSegment(path: string): string {
  const result = inputSanitizer.sanitize(path, {
    maxLength: 500,
    blockSuspiciousPatterns: true,
    removeNullBytes: true
  })
  
  return result.sanitizedValue
}

/**
 * تنظيف query parameters
 */
function sanitizeQueryParams(params: URLSearchParams): URLSearchParams {
  const sanitizedParams = new URLSearchParams()
  
  for (const [key, value] of params.entries()) {
    const sanitizedKey = inputSanitizer.sanitize(key, {
      maxLength: 100,
      blockSuspiciousPatterns: true
    })
    
    const sanitizedValue = inputSanitizer.sanitize(value, {
      maxLength: 1000,
      blockSuspiciousPatterns: true
    })
    
    sanitizedParams.set(sanitizedKey.sanitizedValue, sanitizedValue.sanitizedValue)
  }
  
  return sanitizedParams
}

/**
 * تنظيف وتحسين headers الطلب
 */
function sanitizeRequestHeaders(request: NextRequest): Headers {
  const headers = new Headers()
  const allowedHeaders = [
    'accept',
    'accept-language',
    'content-length',
    'content-type',
    'user-agent',
    'authorization',
    'x-requested-with',
    'x-api-key',
    'origin',
    'referer'
  ]
  
  for (const headerName of allowedHeaders) {
    const value = request.headers.get(headerName)
    if (value) {
      const sanitized = inputSanitizer.sanitize(value, {
        maxLength: 2000,
        blockSuspiciousPatterns: true
      })
      headers.set(headerName, sanitized.sanitizedValue)
    }
  }
  
  return headers
}

export const config = {
  matcher: [
    /*
     * تطبيق middleware على جميع الـ requests عدا:
     * - _next/static (ملفات ثابتة)
     * - _next/image (تحسين الصور)
     * - favicon.ico (أيقونة الموقع)
     * - ملفات الوسائط الثابتة
     * - ملفات النظام الداخلية
     */
    '/((?!_next/static|_next/image|_next/manifest\\.json|static|manifest\\.json|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
    
    /*
     * تضمين API routes مع فحص أمان إضافي
     */
    '/api/(.*)',
    
    /*
     * تضمين صفحات Admin مع فحص شامل
     */
    '/admin/(.*)',
    
    /*
     * تضمين auth pages مع فحص عالي
     */
    '/auth/(.*)',
    
    /*
     * تضمين dashboard مع فحص session
     */
    '/dashboard/(.*)',
    
    /*
     * صفحات المقالات مع فحص content
     */
    '/posts/(.*)',
  ],
  
  /*
   * تكوين إضافي للأمان
   */
  // تحديد حجم الـ body للـ requests
  // runtime: 'nodejs', // لضمان عمل جميع features
}
