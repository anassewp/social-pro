'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { CachePersistenceManager } from '@/lib/cache/persistence'
import { QueryDeduplicationManager } from './query-deduplication'
import { QueryPerformanceMonitor } from './query-performance-monitor'
import { BackgroundRefetchManager } from './background-refetch'
import { CACHE_CONFIGS } from '@/lib/cache/cache-manager'

// Dynamic import للـ DevTools (فقط في Development)
const ReactQueryDevtools = dynamic(
  () =>
    process.env.NODE_ENV === 'development'
      ? import('@tanstack/react-query-devtools').then((mod) => mod.ReactQueryDevtools)
      : Promise.resolve(() => null),
  { ssr: false }
)

// Type definitions للتطبيق المتقدم
interface QueryMetrics {
  startTime: number
  endTime?: number
  queryKey: string[]
  cacheHit: boolean
  networkRequest: boolean
  error?: Error
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // إنشاء QueryClient مع إعدادات محسنة
  const [queryClient] = useState(
    () =>
      new QueryClient({
        logger: {
          log: console.log,
          warn: console.warn,
          error: (error) => {
            console.error('React Query Error:', error)
            // إرسال للأدوات المراقبة
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('react-query-error', { detail: error }))
            }
          },
        },
        defaultOptions: {
          queries: {
            // إعدادات الـ queries محسنة للأداء
            staleTime: 60 * 1000, // 1 دقيقة - balance بين performance و freshness
            gcTime: 30 * 60 * 1000, // 30 دقيقة - garbage collection time أطول للبيانات المهمة
            refetchOnWindowFocus: false, // تحسين الأداء
            refetchOnMount: 'always', // للتأكد من البيانات الحديثة
            refetchOnReconnect: 'always', // تحديث عند إعادة الاتصال
            retry: (failureCount, error) => {
              // لا نعيد المحاولة لأخطاء 4xx (client errors)
              if (error && typeof error === 'object' && 'status' in error) {
                const status = (error as any).status
                if (status >= 400 && status < 500) return false
              }
              return failureCount < 3 // إعادة المحاولة حتى 3 مرات
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            networkMode: 'online',
            
            // Query deduplication مدمج
            meta: {
              deduplicate: true,
              persist: false,
              backgroundRefetch: true,
            },
          },
          mutations: {
            // إعدادات الـ mutations محسنة
            retry: 1,
            retryDelay: 1000,
            networkMode: 'online',
            meta: {
              optimisticUpdate: true,
              invalidateQueries: true,
            },
          },
        },
      })
  )

  // مراجع للـ managers
  const deduplicationRef = useRef<QueryDeduplicationManager | null>(null)
  const performanceRef = useRef<QueryPerformanceMonitor | null>(null)
  const backgroundRefetchRef = useRef<BackgroundRefetchManager | null>(null)
  
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
      
      // تهيئة Query Deduplication Manager
      deduplicationRef.current = new QueryDeduplicationManager(queryClient)
      
      // تهيئة Performance Monitor
      performanceRef.current = new QueryPerformanceMonitor(queryClient)
      
      // تهيئة Background Refetch Manager
      backgroundRefetchRef.current = new BackgroundRefetchManager(queryClient, {
        enabled: true,
        refetchInterval: 5 * 60 * 1000, // 5 دقائق
        refetchPatterns: {
          onPageLeave: true,
          onPageReturn: true,
          onNetworkChange: true,
          onInterval: true,
        },
        dataTypes: {
          campaigns: true,
          teams: true,
          members: true,
          sessions: false,
        },
      })
    }
  }, [queryClient])

  // Background refetch ذكي
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && deduplicationRef.current) {
        // تنظيف DUplicated queries
        deduplicationRef.current.cleanupDuplicates()
        
        // تحديث البيانات القديمة فقط
        const staleQueries = queryClient.getQueryCache().getAll().filter(q => q.isStale())
        staleQueries.forEach(query => {
          if (query.getObserversCount() > 0) {
            query.fetch()
          }
        })
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [queryClient])

  // حفظ Cache تلقائياً عند تغيير البيانات
  useEffect(() => {
    if (typeof window === 'undefined') return

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      // حفظ cache بعد تحديث أي query مهم
      if (event?.type === 'updated') {
        const queryKey = event?.query?.queryKey?.[0] as string
        
        // حفظ فقط للبيانات المهمة
        if (queryKey && ['groups', 'campaigns', 'team', 'members', 'sessions'].some(key => 
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
      // حفظ الـ cache مع معلومات إضافية
      CachePersistenceManager.saveCache(queryClient)
      
      // تنظيف الـ duplicates
      if (deduplicationRef.current) {
        deduplicationRef.current.cleanupDuplicates()
      }
    }

    // حفظ عند إغلاق الصفحة
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // حفظ دوري كل دقيقة (محسن من 30 ثانية)
    const saveInterval = setInterval(() => {
      CachePersistenceManager.saveCache(queryClient)
    }, 60 * 1000)

    // مراقبة الأداء كل 30 ثانية
    const performanceInterval = setInterval(() => {
      if (performanceRef.current) {
        const stats = performanceRef.current.getMetrics()
        if (stats.averageQueryTime > 2000) { // إذا كان متوسط وقت الاستجابة أكبر من ثانيتين
          console.warn('⚠️ Slow queries detected:', stats)
        }
      }
    }, 30 * 1000)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      clearInterval(saveInterval)
      clearInterval(performanceInterval)
      // حفظ نهائي
      CachePersistenceManager.saveCache(queryClient)
    }
  }, [queryClient])

  // دالة لحساب إحصائيات الـ cache
  const getCacheStats = useCallback(() => {
    const cache = queryClient.getQueryCache()
    const queries = cache.getAll()
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.state.status === 'success').length,
      loadingQueries: queries.filter(q => q.state.status === 'pending').length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      staleQueries: queries.filter(q => q.isStale()).length,
      cacheHitRatio: deduplicationRef.current?.getCacheHitRatio() || 0,
      averageResponseTime: performanceRef.current?.getAverageResponseTime() || 0,
    }
  }, [queryClient])

  // وضع الدوال المفيدة في window للتطوير
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      (window as any).__REACT_QUERY_STATS__ = getCacheStats
      (window as any).__CLEAR_QUERY_CACHE__ = () => queryClient.clear()
      (window as any).__INVALIDATE_QUERIES__ = () => queryClient.invalidateQueries()
    }
  }, [queryClient, getCacheStats])

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

