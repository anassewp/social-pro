'use client'

import React, { useState, useEffect } from 'react'
import {
  ProgressIndicator,
  ShimmerEffect,
  AdaptiveLoading,
  CardLoader,
  TableLoader,
  SmartLoadingWrapper,
  LoadingProvider,
  GlobalLoadingBar,
  PageLoadingIndicator,
  useLoadingState,
  RetryableComponent,
  NetworkAwareRetry
} from '@/components/ui/loading'

import { useAdaptiveLoading, useNetworkDetection } from '@/hooks'

// Example 1: Data Loading with Progress
function DataLoadingExample() {
  const {
    isLoading,
    progress,
    stage,
    message,
    startLoading,
    updateProgress,
    completeLoading,
    setError
  } = useLoadingState('data-fetch', {
    defaultMessage: 'جاري جلب البيانات...',
    enableProgress: true,
    advancedMessages: true,
    enableTiming: true
  })

  const simulateDataFetch = async () => {
    startLoading('fetching', 'جاري جلب البيانات...')
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateProgress(30, 'جاري الاتصال بالخادم...')
      
      await new Promise(resolve => setTimeout(resolve, 800))
      updateProgress(60, 'جاري تحميل البيانات...')
      
      await new Promise(resolve => setTimeout(resolve, 600))
      updateProgress(90, 'جاري معالجة البيانات...')
      
      await new Promise(resolve => setTimeout(resolve, 400))
      completeLoading('تم تحميل البيانات بنجاح!')
      
    } catch (error) {
      setError(error as Error, { context: 'data-fetch' })
    }
  }

  return (
    <div className="space-y-6 p-6 border rounded-lg">
      <h3 className="text-lg font-semibold">مثال: تحميل البيانات مع Progress</h3>
      
      {isLoading && (
        <ProgressIndicator
          progress={progress}
          status={message}
          variant="primary"
          type="linear"
          size="default"
          animationDuration={200}
        />
      )}

      <div className="flex space-x-4">
        <button 
          onClick={simulateDataFetch}
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? 'جاري التحميل...' : 'تحميل البيانات'}
        </button>
        
        <div className="text-sm text-muted-foreground">
          المرحلة: {stage}
        </div>
      </div>
    </div>
  )
}

// Example 2: Skeleton Loading for Cards
function SkeletonExample() {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">مثال: Skeleton Loading للبطاقات</h3>
      
      {!showContent ? (
        <CardLoader
          type="article"
          count={3}
          shimmerType="wave"
          showImage={true}
          size="default"
          showAdvanced={true}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="w-full h-48 bg-primary/10 rounded mb-4"></div>
              <h4 className="font-medium mb-2">عنوان المقال {i + 1}</h4>
              <p className="text-sm text-muted-foreground mb-4">
                هذا مثال على محتوى المقال. سيتم استبدال هذا النص بمحتوى حقيقي.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">5 دقائق قراءة</span>
                <button className="text-primary hover:underline text-sm">
                  اقرأ المزيد
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Example 3: Adaptive Loading with Network Detection
function AdaptiveExample() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<Error | null>(null)

  const fetchWithRetry = async () => {
    // Simulate API call that might fail
    const response = await fetch('/api/simulate-data')
    if (!response.ok) {
      throw new Error('NETWORK_ERROR: فشل في تحميل البيانات')
    }
    return await response.json()
  }

  return (
    <div className="space-y-6 p-6 border rounded-lg">
      <h3 className="text-lg font-semibold">مثال: تحميل تكيفي مع كشف الشبكة</h3>
      
      <NetworkAwareRetry
        operation={fetchWithRetry}
        config={{
          maxRetries: 3,
          initialDelay: 1000,
          backoffFactor: 2,
          maxDelay: 10000,
          retryableErrors: ['NETWORK_ERROR', 'TIMEOUT'],
        }}
      >
        {data ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h4 className="font-medium text-green-800">تم تحميل البيانات بنجاح!</h4>
            <pre className="text-xs text-green-700 mt-2">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="p-4 border rounded">
            <p className="text-muted-foreground">اضغط على الزر لتحميل البيانات مع دعم الشبكة</p>
          </div>
        )}
      </NetworkAwareRetry>
    </div>
  )
}

// Example 4: Smart Loading Wrapper
function SmartWrapperExample() {
  const [showContent, setShowContent] = useState(false)

  const loadContent = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    setShowContent(true)
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">مثال: Smart Loading Wrapper</h3>
      
      <SmartLoadingWrapper
        id="content-loader"
        type="component"
        showProgress={true}
        autoHide={true}
      >
        {showContent ? (
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">المحتوى تم تحميله!</h4>
            <p className="text-blue-700">
              هذا مثال على المحتوى الذي يظهر بعد اكتمال التحميل.
              يمكن للمطور تخصيص السلوك والرسائل بسهولة.
            </p>
          </div>
        ) : (
          <div className="p-6 border rounded-lg">
            <p className="text-muted-foreground">لا يوجد محتوى</p>
          </div>
        )}
      </SmartLoadingWrapper>

      <button 
        onClick={loadContent}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
      >
        تحميل المحتوى
      </button>
    </div>
  )
}

// Example 5: Advanced Table Loading
function AdvancedTableExample() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadedItems, setLoadedItems] = useState(0)
  const [totalItems] = useState(20)

  const simulateTableLoad = async () => {
    setIsLoading(true)
    setLoadedItems(0)

    // Simulate progressive loading
    for (let i = 1; i <= totalItems; i++) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setLoadedItems(i)
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">مثال: تحميل جدول متقدم</h3>
      
      {isLoading ? (
        <TableLoader
          rows={10}
          columns={5}
          showHeader={true}
          showSearch={true}
          showFilters={true}
          showActions={true}
          shimmerType="scan"
          showProgress={true}
          loadedItems={loadedItems}
          totalItems={totalItems}
        />
      ) : (
        <div className="p-6 border rounded-lg text-center">
          <p className="text-muted-foreground mb-4">
            اضغط على الزر لمحاكاة تحميل جدول مع Progress
          </p>
          <button 
            onClick={simulateTableLoad}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            محاكاة تحميل الجدول
          </button>
        </div>
      )}
    </div>
  )
}

// Example 6: Network Quality Indicator
function NetworkIndicatorExample() {
  const { quality, networkInfo, getRecommendedSettings } = useNetworkDetection()

  const recommendations = getRecommendedSettings()

  return (
    <div className="space-y-6 p-6 border rounded-lg">
      <h3 className="text-lg font-semibold">مثال: مؤشر جودة الشبكة</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Network Info */}
        <div className="space-y-4">
          <h4 className="font-medium">معلومات الشبكة</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>الاتصال:</span>
              <span className="font-medium">{networkInfo.effectiveType.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>السرعة:</span>
              <span className="font-medium">{networkInfo.downlink} Mbps</span>
            </div>
            <div className="flex justify-between">
              <span>زمن الاستجابة:</span>
              <span className="font-medium">{networkInfo.rtt}ms</span>
            </div>
            <div className="flex justify-between">
              <span>حفظ البيانات:</span>
              <span className="font-medium">{networkInfo.saveData ? 'مفعل' : 'غير مفعل'}</span>
            </div>
          </div>
        </div>

        {/* Quality Indicator */}
        <div className="space-y-4">
          <h4 className="font-medium">تقييم الجودة</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>المستوى:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                quality.level === 'excellent' ? 'bg-green-100 text-green-800' :
                quality.level === 'good' ? 'bg-blue-100 text-blue-800' :
                quality.level === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                quality.level === 'poor' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {quality.level === 'excellent' ? 'ممتاز' :
                 quality.level === 'good' ? 'جيد' :
                 quality.level === 'fair' ? 'متوسط' :
                 quality.level === 'poor' ? 'ضعيف' : 'غير معروف'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>النتيجة:</span>
              <span className="font-medium">{quality.score}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium">الإعدادات الموصى بها</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">جودة الصور:</span>
            <span className="ml-2 font-medium">{recommendations.imageQuality}</span>
          </div>
          <div>
            <span className="text-muted-foreground">جودة الفيديو:</span>
            <span className="ml-2 font-medium">{recommendations.videoQuality}</span>
          </div>
          <div>
            <span className="text-muted-foreground">تحميل الصور:</span>
            <span className="ml-2 font-medium">{recommendations.preloadImages ? 'مفعل' : 'معطل'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">الرسوم المتحركة:</span>
            <span className="ml-2 font-medium">{recommendations.enableAnimations ? 'مفعل' : 'معطل'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Example Component
function LoadingStatesExamples() {
  return (
    <LoadingProvider>
      <div className="min-h-screen bg-background p-8">
        <GlobalLoadingBar position="top" />
        
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">أمثلة تطبيقية - نظام Loading States المحسن</h1>
            <p className="text-muted-foreground">
              مجموعة شاملة من الأمثلة التطبيقية لاستخدام مكونات التحميل المتقدمة
            </p>
          </div>

          {/* Examples */}
          <div className="space-y-8">
            <DataLoadingExample />
            <SkeletonExample />
            <AdaptiveExample />
            <SmartWrapperExample />
            <AdvancedTableExample />
            <NetworkIndicatorExample />
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              جميع الأمثلة تستخدم مكونات Loading States المحسنة مع دعم كامل للغة العربية
            </p>
          </div>
        </div>
      </div>
    </LoadingProvider>
  )
}

export default LoadingStatesExamples