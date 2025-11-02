'use client'

import { cn } from '@/lib/utils'

// Responsive Loading Grid
export function ResponsiveLoadingGrid({ 
  className,
  columns = { base: 1, md: 2, lg: 3, xl: 4 }
}: { 
  className?: string
  columns?: { base?: number; md?: number; lg?: number; xl?: number }
}) {
  const gridCols = Object.entries(columns)
    .map(([breakpoint, cols]) => {
      const prefix = breakpoint === 'base' ? '' : `${breakpoint}:`
      return `grid-cols-${prefix}${cols}`
    })
    .join(' ')

  return (
    <div className={cn('grid gap-4', gridCols, className)}>
      {Array.from({ length: Object.values(columns).reduce((a, b) => Math.max(a, b || 0), 0) }).map((_, i) => (
        <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
      ))}
    </div>
  )
}

// Adaptive Loading Component
export function AdaptiveLoading({
  isOnline = true,
  connectionType = '4g',
  isVisible = true,
  priority = 'high'
}: {
  isOnline?: boolean
  connectionType?: string
  isVisible?: boolean
  priority?: 'high' | 'medium' | 'low'
}) {
  if (!isOnline) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 mx-auto text-muted-foreground">📱</div>
          <p className="text-sm text-muted-foreground">غير متصل بالإنترنت</p>
        </div>
      </div>
    )
  }

  if (connectionType === 'slow-2g' || connectionType === '2g') {
    return (
      <div className="space-y-4">
        {/* Minimal loading for slow connections */}
        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
        <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
      </div>
    )
  }

  if (!isVisible) {
    return null
  }

  const LoadingComponent = {
    high: () => (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-1/2" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-muted animate-pulse rounded" />
          <div className="h-24 bg-muted animate-pulse rounded" />
        </div>
      </div>
    ),
    medium: () => (
      <div className="space-y-3">
        <div className="h-6 bg-muted animate-pulse rounded w-2/3" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    ),
    low: () => (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin h-6 w-6 border-2 border-muted border-t-primary rounded-full" />
      </div>
    ),
  }[priority]

  return <LoadingComponent />
}

// Smart Image Placeholder
export function SmartImagePlaceholder({
  width = 200,
  height = 200,
  showDimensions = false,
  className
}: {
  width?: number
  height?: number
  showDimensions?: boolean
  className?: string
}) {
  return (
    <div 
      className={cn(
        'bg-muted flex items-center justify-center text-muted-foreground',
        className
      )}
      style={{ width, height }}
    >
      <div className="text-center space-y-2">
        <div className="text-2xl">🖼️</div>
        {showDimensions && (
          <div className="text-xs">
            {width} × {height}
          </div>
        )}
      </div>
    </div>
  )
}

// Batch Loading Indicator
export function BatchLoadingIndicator({
  current = 0,
  total = 1,
  label = 'جاري التحميل',
  showProgress = true
}: {
  current?: number
  total?: number
  label?: string
  showProgress?: boolean
}) {
  const progress = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {showProgress && (
          <span className="text-xs text-muted-foreground">
            {current} من {total}
          </span>
        )}
      </div>
      
      {showProgress && (
        <div className="space-y-2">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-center">
            {progress}%
          </div>
        </div>
      )}
    </div>
  )
}

// Skeleton with subtle animation
export function AnimatedSkeleton({
  className,
  children
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div className={cn('animate-pulse', className)}>
      {children || (
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-5/6" />
        </div>
      )}
    </div>
  )
}

// Pulse Animation for Real-time Updates
export function PulseIndicator({
  isActive = false,
  color = 'bg-green-500',
  size = 'w-2 h-2',
  className
}: {
  isActive?: boolean
  color?: string
  size?: string
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <div className={cn(size, 'rounded-full', color, isActive && 'animate-pulse')} />
      {isActive && (
        <div className={cn(size, 'rounded-full', color, 'absolute inset-0 animate-ping opacity-75')} />
      )}
    </div>
  )
}

// Loading State with Retry
export function LoadingWithRetry({
  isLoading,
  error,
  onRetry,
  loadingText = 'جاري التحميل...',
  retryText = 'إعادة المحاولة',
  className
}: {
  isLoading: boolean
  error?: Error | null
  onRetry?: () => void
  loadingText?: string
  retryText?: string
  className?: string
}) {
  if (error) {
    return (
      <div className={cn('text-center space-y-3 p-4', className)}>
        <div className="text-red-500 text-sm">❌ {error.message}</div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            {retryText}
          </button>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center space-x-2 p-4', className)}>
        <div className="animate-spin h-4 w-4 border-2 border-muted border-t-primary rounded-full" />
        <span className="text-sm text-muted-foreground">{loadingText}</span>
      </div>
    )
  }

  return null
}