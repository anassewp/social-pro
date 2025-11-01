import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // قائمة الصفحات العامة (لا تحتاج authentication)
  const publicPaths = [
    '/login',
    '/register',
    '/auth',
    '/test-auth',
    '/',
  ]
  
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(path + '/')
  )
  
  // إذا كانت الصفحة عامة، نسمح بالمرور مباشرة
  if (isPublicPath) {
    return supabaseResponse
  }

  // تحقق من الجلسة للصفحات المحمية
  // تقليل timeout لتحسين الأداء
  try {
    const {
      data: { user },
    } = await Promise.race([
      supabase.auth.getUser(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 1000) // تقليل من 2000 إلى 1000
      )
    ]) as any

    // إذا لم يكن هناك user، نعيد للـ login
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  } catch (error) {
    // في حالة timeout أو خطأ، نسمح بالمرور للصفحات العامة فقط
    // للصفحات المحمية، نعيد للـ login
    if (!isPublicPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
