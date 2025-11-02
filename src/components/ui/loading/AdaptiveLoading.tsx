'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Wifi, WifiOff, Signal, AlertTriangle } from 'lucide-react'

export interface NetworkState {
  isOnline: boolean
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | '5g'
  downlink: number // Mbps
  rtt: number // milliseconds
  saveData: boolean
}

// Network Detection Hook
function useNetworkState(): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: true,
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false,
  })

  useEffect(() => {
    // Check if navigator.connection exists
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection

    const updateNetworkState = () => {
      const connectionInfo = {
        isOnline: navigator.onLine,
        effectiveType: connection?.effectiveType || '4g',
        downlink: connection?.downlink || 10,
        rtt: connection?.rtt || 100,
        saveData: connection?.saveData || false,
      }
      setNetworkState(connectionInfo)
    }

    // Initial state
    updateNetworkState()

    // Event listeners
    const handleOnline = () => updateNetworkState()
    const handleOffline = () => updateNetworkState()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Connection API (if supported)
    if (connection) {
      connection.addEventListener('change', updateNetworkState)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (connection) {
        connection.removeEventListener('change', updateNetworkState)
      }
    }
  }, [])

  return networkState
}

export interface AdaptiveLoadingProps {
  /**
   * الحالة الحالية للتحميل
   */
  isLoading: boolean

  /**
   * رسالة الخطأ (إن وجدت)
   */
  error?: string | Error | null

  /**
   * دالة إعادة المحاولة
   */
  onRetry?: () => void

  /**
   * أولوية التحميل
   */
  priority?: 'high' | 'medium' | 'low'

  /**
   * نوع المحتوى
   */
  contentType?: 'image' | 'data' | 'text' | 'media'

  /**
   * حجم البيانات المتوقعة (بايت)
   */
  expectedDataSize?: number

  /**
   * تأخير التحميل للمحتوى ذي الأولوية المنخفضة
   */
  lazyLoad?: boolean

  /**
   * تخصيص className
   */
  className?: string

  /**
   * الأطفال
   */
  children?: React.ReactNode

  /**
   * رسالة التحميل المخصصة
   */
  customMessage?: string
}

const priorityConfig = {
  high: {
    maxWaitTime: 1000,
    showDetailedProgress: true,
    allowRetry: true,
    animationSpeed: 'normal',
  },
  medium: {
    maxWaitTime: 3000,
    showDetailedProgress: false,
    allowRetry: true,
    animationSpeed: 'slower',
  },
  low: {
    maxWaitTime: 5000,
    showDetailedProgress: false,
    allowRetry: false,
    animationSpeed: 'slowest',
  },
}

const contentTypeConfig = {
  image: {
    showPreview: true,
    priorityMultiplier: 1.2,
  },
  data: {
    showPreview: false,
    priorityMultiplier: 1.0,
  },
  text: {
    showPreview: true,
    priorityMultiplier: 0.8,
  },
  media: {
    showPreview: false,
    priorityMultiplier: 1.5,
  },
}

function getConnectionIcon(effectiveType: string, isOnline: boolean) {
  if (!isOnline) return <WifiOff className="h-4 w-4" />
  
  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      return <Signal className="h-4 w-4 text-red-500" />
    case '3g':
      return <Signal className="h-4 w-4 text-yellow-500" />
    case '4g':
      return <Signal className="h-4 w-4 text-green-500" />
    case '5g':
      return <Signal className="h-4 w-4 text-blue-500" />
    default:
      return <Wifi className="h-4 w-4" />
  }
}

export function AdaptiveLoading({
  isLoading,
  error,
  onRetry,
  priority = 'medium',
  contentType = 'data',
  expectedDataSize,
  lazyLoad = false,
  className,
  children,
  customMessage,
}: AdaptiveLoadingProps) {
  const networkState = useNetworkState()
  const [showRetry, setShowRetry] = useState(false)
  const [connectionWarning, setConnectionWarning] = useState(false)

  const config = priorityConfig[priority]
  const contentConfig = contentTypeConfig[contentType]

  useEffect(() => {
    if (isLoading) {
      // Show retry button after max wait time
      const timer = setTimeout(() => {
        if (priority !== 'low') {
          setShowRetry(true)
        }
      }, config.maxWaitTime)

      return () => clearTimeout(timer)
    } else {
      setShowRetry(false)
    }
  }, [isLoading, priority, config.maxWaitTime])

  useEffect(() => {
    // Show connection warning for slow connections
    const isSlowConnection = networkState.effectiveType === 'slow-2g' || 
                           networkState.effectiveType === '2g' || 
                           networkState.downlink < 1
    
    setConnectionWarning(isSlowConnection && expectedDataSize && expectedDataSize > 1024 * 1024)
  }, [networkState, expectedDataSize])

  // Offline state
  if (!networkState.isOnline) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 space-y-4', className)}>
        <WifiOff className="h-12 w-12 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h3 className="font-medium text-foreground">غير متصل بالإنترنت</h3>
          <p className="text-sm text-muted-foreground">تحقق من اتصالك ثم أعد المحاولة</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            إعادة المحاولة
          </button>
        )}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 space-y-4', className)}>
        <div className="flex items-center space-x-2">
          {getConnectionIcon(networkState.effectiveType, networkState.isOnline)}
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="font-medium text-foreground">حدث خطأ في التحميل</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {typeof error === 'string' ? error : error.message || 'حدث خطأ غير متوقع'}
          </p>
          
          {/* Connection info */}
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            {getConnectionIcon(networkState.effectiveType, networkState.isOnline)}
            <span>اتصال {networkState.effectiveType.toUpperCase()}</span>
            <span>•</span>
            <span>{networkState.downlink} Mbps</span>
          </div>
        </div>
        
        {(showRetry || onRetry) && (
          <div className="flex space-x-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                إعادة المحاولة
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    const isSlowConnection = networkState.effectiveType === 'slow-2g' || 
                           networkState.effectiveType === '2g'

    // Adapt loading behavior based on connection
    if (isSlowConnection) {
      return (
        <div className={cn('flex items-center justify-center p-6 space-x-3', className)}>
          <div className="flex items-center space-x-2">
            {getConnectionIcon(networkState.effectiveType, networkState.isOnline)}
            <span className="text-sm text-muted-foreground">اتصال بطيء...</span>
          </div>
          
          {/* Minimal spinner for slow connections */}
          <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
          
          {customMessage && (
            <span className="text-sm text-muted-foreground">{customMessage}</span>
          )}
        </div>
      )
    }

    // Normal loading for good connections
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 space-y-4', className)}>
        {/* Connection indicator */}
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          {getConnectionIcon(networkState.effectiveType, networkState.isOnline)}
          <span>تحميل {contentType}...</span>
          <span>•</span>
          <span>أولوية {priority}</span>
        </div>

        {/* Adaptive spinner based on priority */}
        <div className={cn(
          'flex items-center space-x-3',
          config.animationSpeed === 'slower' && 'animate-pulse',
          config.animationSpeed === 'slowest' && 'opacity-60'
        )}>
          <div className={cn(
            'border-2 border-muted border-t-primary rounded-full animate-spin',
            priority === 'high' ? 'w-6 h-6' : priority === 'medium' ? 'w-5 h-5' : 'w-4 h-4'
          )} />
          
          <span className="text-sm text-muted-foreground">
            {customMessage || `جاري تحميل ${contentType === 'image' ? 'الصورة' : 'البيانات'}...`}
          </span>
        </div>

        {/* Progress for high priority content */}
        {config.showDetailedProgress && contentConfig.showPreview && (
          <div className="w-full max-w-xs space-y-2">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '45%' }} />
            </div>
            <div className="text-xs text-muted-foreground text-center">
              قد يستغرق بعض الوقت حسب سرعة الاتصال
            </div>
          </div>
        )}

        {/* Connection warning */}
        {connectionWarning && (
          <div className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
            <AlertTriangle className="h-3 w-3" />
            <span>البيانات كبيرة، قد يستغرق التحميل وقتاً أطول</span>
          </div>
        )}

        {/* Retry button for long waits */}
        {showRetry && config.allowRetry && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">يبدو أن التحميل يستغرق وقتاً أطول من المتوقع</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
              >
                إعادة المحاولة
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  // Success state
  return <>{children}</>
}

// Smart Image Loader with adaptive behavior
export function SmartImageLoader({
  src,
  alt,
  onLoad,
  onError,
  className,
  priority = 'medium',
  lazyLoad = false,
}: {
  src: string
  alt: string
  onLoad?: () => void
  onError?: () => void
  className?: string
  priority?: 'high' | 'medium' | 'low'
  lazyLoad?: boolean
}) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  const imgRef = React.useRef<HTMLImageElement>(null)

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  // Intersection Observer for lazy loading
  React.useEffect(() => {
    if (!lazyLoad) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && imgRef.current) {
          imgRef.current.src = src
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [src, lazyLoad])

  if (hasError) {
    return (
      <div className={cn('flex items-center justify-center bg-muted text-muted-foreground', className)}>
        <div className="text-center space-y-1">
          <div className="text-lg">🖼️</div>
          <div className="text-xs">فشل تحميل الصورة</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      {!isLoaded && (
        <div className={cn('absolute inset-0 bg-muted animate-pulse', className)}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </div>
      )}
      
      <img
        ref={imgRef}
        src={lazyLoad ? undefined : src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          !isLoaded && 'opacity-0',
          className
        )}
        loading={lazyLoad ? 'lazy' : 'eager'}
      />
    </div>
  )
}

// Network Quality Indicator
export function NetworkQualityIndicator({ className }: { className?: string }) {
  const networkState = useNetworkState()

  const getQualityColor = () => {
    switch (networkState.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'text-red-500'
      case '3g':
        return 'text-yellow-500'
      case '4g':
      case '5g':
        return 'text-green-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const getQualityText = () => {
    switch (networkState.effectiveType) {
      case 'slow-2g':
        return 'بطيء جداً'
      case '2g':
        return 'بطيء'
      case '3g':
        return 'متوسط'
      case '4g':
        return 'سريع'
      case '5g':
        return 'سريع جداً'
      default:
        return 'غير معروف'
    }
  }

  return (
    <div className={cn('flex items-center space-x-2 text-xs', className)}>
      {getConnectionIcon(networkState.effectiveType, networkState.isOnline)}
      <span className={getQualityColor()}>
        {networkState.isOnline ? getQualityText() : 'غير متصل'}
      </span>
      {networkState.isOnline && (
        <>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{networkState.downlink} Mbps</span>
        </>
      )}
    </div>
  )
}