'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { ROUTES } from '@/lib/constants'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // إضافة timeout للتحميل السريع
    const redirectTimeout = setTimeout(() => {
      if (!hasRedirected && !loading) {
        setHasRedirected(true)
        if (user) {
          router.push(ROUTES.DASHBOARD)
        } else {
          router.push(ROUTES.LOGIN)
        }
      }
    }, 100) // انتظار قصير للسماح لـ auth بالتحقق

    // Redirect فوري إذا كان loading انتهى
    if (!loading && !hasRedirected) {
      setHasRedirected(true)
      clearTimeout(redirectTimeout)
      
      if (user) {
        router.push(ROUTES.DASHBOARD)
      } else {
        router.push(ROUTES.LOGIN)
      }
    }

    return () => clearTimeout(redirectTimeout)
  }, [user, loading, router, hasRedirected])

  // إذا استغرق التحميل أكثر من 3 ثوان، أعد التوجيه فوراً
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (!hasRedirected) {
        setHasRedirected(true)
        router.push(ROUTES.LOGIN)
      }
    }, 3000)

    return () => clearTimeout(fallbackTimeout)
  }, [router, hasRedirected])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">SocialPro</h1>
        <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
      </div>
    </div>
  )
}
