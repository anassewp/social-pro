'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { CachePersistenceManager } from '@/lib/cache/persistence'

// Dynamic import للـ DevTools (فقط في Development)
const ReactQueryDevtools = dynamic(
  () =>
    process.env.NODE_ENV === 'development'
      ? import('@tanstack/react-query-devtools').then((mod) => mod.ReactQueryDevtools)
      : Promise.resolve(() => null),
  { ssr: false }
)

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // إنشاء QueryClient مع إعدادات محسنة
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // إعدادات الـ queries
            staleTime: 30 * 1000, // 30 ثانية - البيانات fresh لمدة 30 ثانية (مخفضة للتنقل السريع)
            gcTime: 5 * 60 * 1000, // 5 دقائق - garbage collection time
            refetchOnWindowFocus: false, // لا re-fetch عند focus على النافذة
            refetchOnMount: 'always', // دائماً re-fetch عند mount للتأكد من البيانات الحديثة
            refetchOnReconnect: true, // re-fetch عند إعادة الاتصال
            retry: 1, // عدد المحاولات عند الفشل
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff
            // إضافة networkMode لضمان أن queries تعمل حتى عند offline
            networkMode: 'online',
          },
          mutations: {
            // إعدادات الـ mutations
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  )

  // استعادة Cache من localStorage عند mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // تنظيف cache القديم إذا لزم الأمر
      CachePersistenceManager.cleanupIfNeeded()
      
      // استعادة cache
      const restored = CachePersistenceManager.restoreCache(queryClient)
      if (restored) {
        console.log('✅ Cache restored from localStorage')
      }
    }
  }, [queryClient])

  // حفظ Cache تلقائياً عند تغيير البيانات
  useEffect(() => {
    if (typeof window === 'undefined') return

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      // حفظ cache بعد تحديث أي query مهم
      if (event?.type === 'updated') {
        const queryKey = event?.query?.queryKey?.[0] as string
        
        // حفظ فقط للبيانات المهمة
        if (queryKey && ['groups', 'campaigns', 'team', 'members'].some(key => 
          queryKey === key || queryKey.startsWith(key + '_')
        )) {
          // Debounce الحفظ (كل 2 ثانية)
          setTimeout(() => {
            CachePersistenceManager.saveCache(queryClient)
          }, 2000)
        }
      }
    })

    return () => unsubscribe()
  }, [queryClient])

  // حفظ Cache قبل إغلاق الصفحة
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeUnload = () => {
      CachePersistenceManager.saveCache(queryClient)
    }

    // حفظ عند إغلاق الصفحة
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // حفظ دوري كل 30 ثانية
    const saveInterval = setInterval(() => {
      CachePersistenceManager.saveCache(queryClient)
    }, 30 * 1000)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      clearInterval(saveInterval)
      // حفظ نهائي
      CachePersistenceManager.saveCache(queryClient)
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query DevTools - فقط في Development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

