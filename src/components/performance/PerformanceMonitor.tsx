'use client'

import React, { useEffect, useRef, useCallback, memo } from 'react'
import { useEventListener } from '@/hooks/usePerformance'

interface PerformanceData {
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  ttfb: number // Time to First Byte
}

interface PerformanceMonitorProps {
  onMetrics?: (metrics: PerformanceData) => void
  enabled?: boolean
}

const PerformanceMonitor = memo(({ 
  onMetrics, 
  enabled = process.env.NODE_ENV === 'development' 
}: PerformanceMonitorProps) => {
  const metricsRef = useRef<Partial<PerformanceData>>({})

  // قياس مؤشرات الأداء الأساسية
  const measureCoreWebVitals = useCallback(() => {
    // قياس First Contentful Paint
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          metricsRef.current.fcp = entry.startTime
        }
      }
    }).observe({ entryTypes: ['paint'] })

    // قياس Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        metricsRef.current.lcp = entry.startTime
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // قياس Cumulative Layout Shift
    new PerformanceObserver((entryList) => {
      let clsValue = 0
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
      metricsRef.current.cls = clsValue
    }).observe({ entryTypes: ['layout-shift'] })

    // قياس First Input Delay
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        metricsRef.current.fid = entry.processingStart - entry.startTime
      }
    }).observe({ entryTypes: ['first-input'] })

    // قياس Time to First Byte
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      metricsRef.current.ttfb = navigation.responseStart - navigation.requestStart
    }
  }, [])

  // إرسال البيانات
  const sendMetrics = useCallback(() => {
    const metrics = metricsRef.current as PerformanceData
    
    if (Object.keys(metrics).length > 0) {
      onMetrics?.(metrics)
      
      if (process.env.NODE_ENV === 'development') {
        console.group('📊 مؤشرات الأداء')
        console.log('First Contentful Paint:', metrics.fcp?.toFixed(2) + 'ms')
        console.log('Largest Contentful Paint:', metrics.lcp?.toFixed(2) + 'ms')
        console.log('First Input Delay:', metrics.fid?.toFixed(2) + 'ms')
        console.log('Cumulative Layout Shift:', metrics.cls?.toFixed(3))
        console.log('Time to First Byte:', metrics.ttfb?.toFixed(2) + 'ms')
        console.groupEnd()
      }
    }
  }, [onMetrics])

  // إعداد القياسات عند تحميل المكون
  useEffect(() => {
    if (!enabled) return

    measureCoreWebVitals()

    // إرسال البيانات عند إتمام الصفحة
    const observer = new PerformanceObserver((entryList) => {
      if (entryList.getEntries().length > 0) {
        sendMetrics()
      }
    })
    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] })

    // تنظيف عند إلغاء التحميل
    return () => {
      observer.disconnect()
    }
  }, [enabled, measureCoreWebVitals, sendMetrics])

  // مراقبة أخطاء JavaScript
  useEventListener(window, 'error', (event) => {
    if (enabled && process.env.NODE_ENV === 'development') {
      console.error('🚨 خطأ JavaScript:', {
        message: event.error?.message,
        stack: event.error?.stack,
        filename: event.filename,
        line: event.lineno,
        column: event.colno
      })
    }
  })

  // مراقبة أخطاء Resource
  useEventListener(window, 'error', (event) => {
    if (event.target !== window) {
      const target = event.target as HTMLElement
      console.warn('⚠️ خطأ في تحميل المورد:', target.src || target.href)
    }
  }, true)

  if (!enabled) return null

  // عرض مؤشرات الأداء في وضع التطوير
  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-sm font-mono z-50">
      <div className="text-xs opacity-70 mb-2">📊 مراقبة الأداء</div>
      {Object.entries(metricsRef.current).map(([key, value]) => (
        <div key={key} className="flex justify-between gap-4">
          <span>{key.toUpperCase()}:</span>
          <span>{typeof value === 'number' ? value.toFixed(2) : 'N/A'}</span>
        </div>
      ))}
    </div>
  )
})

PerformanceMonitor.displayName = 'PerformanceMonitor'

export { PerformanceMonitor }