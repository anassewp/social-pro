'use client'

import React, { useState, useEffect, useCallback, useRef, memo } from 'react'
import { Loading } from '@/components/ui/loading'

interface ProgressiveLoaderProps {
  data: any[]
  pageSize: number
  loadMore: () => Promise<void>
  renderItem: (item: any, index: number) => React.ReactNode
  hasMore: boolean
  isLoading?: boolean
  className?: string
  threshold?: number
}

const ProgressiveLoader = memo(({ 
  data, 
  pageSize, 
  loadMore, 
  renderItem, 
  hasMore, 
  isLoading = false,
  className,
  threshold = 200 
}: ProgressiveLoaderProps) => {
  const [displayedData, setDisplayedData] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const loadingRef = useRef(false)
  const observerRef = useRef<IntersectionObserver>()

  // تحديث البيانات المعروضة عند تغيير البيانات الأساسية
  useEffect(() => {
    if (data.length > 0) {
      setDisplayedData(data.slice(0, pageSize * currentPage))
    }
  }, [data, pageSize, currentPage])

  // تحميل المزيد من البيانات
  const loadMoreData = useCallback(async () => {
    if (loadingRef.current || !hasMore || isLoading) return
    
    loadingRef.current = true
    
    try {
      await loadMore()
      setCurrentPage(prev => prev + 1)
    } catch (error) {
      console.error('خطأ في تحميل المزيد من البيانات:', error)
    } finally {
      loadingRef.current = false
    }
  }, [loadMore, hasMore, isLoading])

  // إعداد Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && hasMore && !loadingRef.current && !isLoading) {
          loadMoreData()
        }
      },
      { threshold: 0.1 }
    )

    observerRef.current = observer

    return () => {
      observer.disconnect()
    }
  }, [hasMore, isLoading, loadMoreData])

  // ربط المراقب بالعنصر النهائي
  useEffect(() => {
    if (observerRef.current) {
      const lastElement = document.querySelector('[data-progressive-loader="last"]')
      if (lastElement) {
        observerRef.current.observe(lastElement)
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [displayedData, hasMore, isLoading])

  return (
    <div className={className}>
      {/* البيانات المعروضة */}
      {displayedData.map((item, index) => (
        <div key={`${item.id || index}`}>
          {renderItem(item, index)}
        </div>
      ))}

      {/* تحميل المزيد */}
      {hasMore && (
        <div 
          data-progressive-loader="last"
          className="flex justify-center py-4"
        >
          {isLoading ? (
            <Loading size="sm" />
          ) : (
            <button
              onClick={loadMoreData}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              عرض المزيد
            </button>
          )}
        </div>
      )}

      {/* نهاية البيانات */}
      {!hasMore && displayedData.length > 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          تم عرض جميع البيانات
        </div>
      )}
    </div>
  )
})

ProgressiveLoader.displayName = 'ProgressiveLoader'

export { ProgressiveLoader }