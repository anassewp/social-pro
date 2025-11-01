/**
 * Unified Loading Component
 * مكون موحد لمؤشرات التحميل في جميع أنحاء التطبيق
 */

'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface LoadingProps {
  /**
   * حجم مؤشر التحميل
   * @default "default"
   */
  size?: 'sm' | 'default' | 'lg' | 'xl'

  /**
   * نص الرسالة المراد عرضها
   */
  message?: string

  /**
   * ما إذا كان يجب إظهار النص
   * @default true
   */
  showMessage?: boolean

  /**
   * Full screen loading (لتغطية الصفحة كاملة)
   * @default false
   */
  fullScreen?: boolean

  /**
   * Custom className
   */
  className?: string

  /**
   * Custom spinner color
   */
  color?: 'primary' | 'secondary' | 'muted'

  /**
   * Inline loading (بدون backdrop)
   * @default false
   */
  inline?: boolean
}

const sizeClasses = {
  sm: 'h-4 w-4',
  default: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
}

const colorClasses = {
  primary: 'text-primary',
  secondary: 'text-muted-foreground',
  muted: 'text-muted-foreground/60',
}

export function Loading({
  size = 'default',
  message = 'جاري التحميل...',
  showMessage = true,
  fullScreen = false,
  className,
  color = 'primary',
  inline = false,
}: LoadingProps) {
  const spinnerClasses = cn(
    'animate-spin',
    sizeClasses[size],
    colorClasses[color]
  )

  if (inline) {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        <Loader2 className={spinnerClasses} />
        {showMessage && message && (
          <span className="text-sm text-muted-foreground">{message}</span>
        )}
      </div>
    )
  }

  if (fullScreen) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          'bg-background/80 backdrop-blur-sm',
          className
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className={spinnerClasses} />
          {showMessage && message && (
            <p className="text-sm font-medium text-foreground">{message}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className={spinnerClasses} />
        {showMessage && message && (
          <p className="text-sm font-medium text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  )
}

/**
 * Loading Spinner فقط (بدون نص)
 */
export function LoadingSpinner({ size = 'default', className, color = 'primary' }: Omit<LoadingProps, 'message' | 'showMessage' | 'fullScreen' | 'inline'>) {
  return (
    <Loader2
      className={cn(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  )
}

/**
 * Page Loading - للصفحات الكاملة
 */
export function PageLoading({ message = 'جاري تحميل الصفحة...', className }: Pick<LoadingProps, 'message' | 'className'>) {
  return <Loading fullScreen message={message} size="lg" className={className} />
}

/**
 * Section Loading - لأقسام معينة في الصفحة
 */
export function SectionLoading({ message = 'جاري التحميل...', className }: Pick<LoadingProps, 'message' | 'className'>) {
  return <Loading message={message} size="default" className={className} />
}

/**
 * Button Loading - للأزرار
 */
export function ButtonLoading({ className }: Pick<LoadingProps, 'className'>) {
  return <LoadingSpinner size="sm" color="primary" className={className} />
}

/**
 * Inline Loading - للنصوص والعناصر الصغيرة
 */
export function InlineLoading({ message, size = 'sm', className }: Pick<LoadingProps, 'message' | 'size' | 'className'>) {
  return <Loading inline message={message} size={size} className={className} />
}

