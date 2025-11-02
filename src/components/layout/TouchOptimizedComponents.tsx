'use client'

import React, { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface TouchOptimizedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'mobile'
  isPressed?: boolean
  haptic?: boolean
  tooltip?: string
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right' | 'only'
  className?: string
}

export const TouchOptimizedButton = forwardRef<HTMLButtonElement, TouchOptimizedButtonProps>(
  ({
    variant = 'default',
    size = 'default',
    isPressed = false,
    haptic = true,
    tooltip,
    loading = false,
    icon,
    iconPosition = 'left',
    className,
    children,
    onClick,
    disabled,
    ...props
  }, ref) => {
    const [isClicked, setIsClicked] = useState(false)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return

      // Haptic feedback for touch devices
      if (haptic && 'vibrate' in navigator) {
        navigator.vibrate(10)
      }

      // Visual feedback
      setIsClicked(true)
      setTimeout(() => setIsClicked(false), 100)

      onClick?.(e)
    }

    const buttonClasses = cn(
      // Base styles with touch optimization
      'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
      'select-none touch-manipulation',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'active:scale-95 active:opacity-90',
      'disabled:pointer-events-none disabled:opacity-50',
      
      // Size variants with touch targets
      {
        // Default size - desktop optimized
        'h-10 px-4 py-2 text-sm': size === 'default',
        
        // Small size
        'h-8 px-3 py-1 text-xs': size === 'sm',
        
        // Large size
        'h-12 px-6 py-3 text-base': size === 'lg',
        
        // Icon only
        'h-10 w-10': size === 'icon',
        
        // Mobile optimized - larger touch target
        'h-12 px-4 py-3 text-base min-w-[48px]': size === 'mobile',
      },

      // Variant styles
      {
        'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm': variant === 'default',
        'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm': variant === 'destructive',
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
        'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
        'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
        'text-primary underline-offset-4 hover:underline': variant === 'link',
      },

      // Pressed state
      isPressed && 'scale-95 opacity-90',

      // Click animation
      isClicked && 'scale-95',

      // Mobile-specific optimizations
      'md:h-10 md:px-4 md:py-2 md:text-sm', // Smaller on desktop
      'touch-device:h-12 touch-device:px-4 touch-device:py-3 touch-device:text-base', // Larger on touch devices

      className
    )

    const content = (
      <>
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        
        {!loading && icon && iconPosition !== 'right' && (
          <span className={cn('flex-shrink-0', !children && 'w-5 h-5')}>
            {icon}
          </span>
        )}
        
        {children && <span>{children}</span>}
        
        {!loading && icon && iconPosition === 'right' && (
          <span className="flex-shrink-0 w-5 h-5">
            {icon}
          </span>
        )}
      </>
    )

    if (tooltip) {
      return (
        <div className="relative group">
          <button
            ref={ref}
            className={buttonClasses}
            onClick={handleClick}
            disabled={disabled || loading}
            title={tooltip}
            {...props}
          >
            {content}
          </button>
          {/* Tooltip for non-touch devices */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap md:block hidden touch:hidden">
            {tooltip}
          </div>
        </div>
      )
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        onClick={handleClick}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </button>
    )
  }
)

TouchOptimizedButton.displayName = 'TouchOptimizedButton'

// Swipeable Gesture Component
interface SwipeableProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  className?: string
}

export function Swipeable({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className
}: SwipeableProps) {
  const [startX, setStartX] = useState<number | null>(null)
  const [startY, setStartY] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setStartX(touch.clientX)
    setStartY(touch.clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX === null || startY === null) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // Determine if the swipe is significant enough
    if (Math.max(absDeltaX, absDeltaY) < threshold) {
      setStartX(null)
      setStartY(null)
      return
    }

    // Determine swipe direction
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (deltaX > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        onSwipeDown?.()
      } else {
        onSwipeUp?.()
      }
    }

    setStartX(null)
    setStartY(null)
  }

  return (
    <div
      className={cn('touch-manipulation', className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  )
}

// Pull to Refresh Component
interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void> | void
  threshold?: number
  className?: string
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  className
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [startY, setStartY] = useState<number | null>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollTop === 0) {
      setStartY(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null || scrollTop > 0) return

    const currentY = e.touches[0].clientY
    const distance = currentY - startY

    if (distance > 0) {
      e.preventDefault()
      setPullDistance(Math.min(distance, threshold * 1.5))
      setIsPulling(distance >= threshold)
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    
    setPullDistance(0)
    setIsPulling(false)
    setStartY(null)
  }

  return (
    <div
      className={cn('relative overflow-y-auto touch-manipulation', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      {/* Pull to refresh indicator */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center transition-transform duration-200"
           style={{ 
             transform: `translateY(${pullDistance - 40}px)`,
             opacity: pullDistance > 10 ? 1 : 0
           }}>
        <div className={cn(
          'flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full shadow-lg',
          'transition-all duration-200',
          isRefreshing && 'animate-spin'
        )}>
          <div className={cn(
            'w-4 h-4 border-2 border-current border-t-transparent rounded-full',
            !isRefreshing && !isPulling && 'animate-spin'
          )} />
          <span className="text-sm font-medium">
            {isRefreshing ? 'جاري التحديث...' : isPulling ? 'اتركه للتحديث' : 'اسحب للتحديث'}
          </span>
        </div>
      </div>
      
      <div style={{ transform: `translateY(${pullDistance}px)` }}>
        {children}
      </div>
    </div>
  )
}

// Long Press Component
interface LongPressProps {
  children: React.ReactNode
  onLongPress: () => void
  onClick?: () => void
  duration?: number
  className?: string
}

export function LongPress({
  children,
  onLongPress,
  onClick,
  duration = 500,
  className
}: LongPressProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const handleTouchStart = () => {
    setIsPressed(true)
    const id = setTimeout(() => {
      onLongPress()
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }, duration)
    setTimeoutId(id)
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
  }

  return (
    <div
      className={cn(
        'touch-manipulation select-none transition-all duration-150',
        isPressed && 'scale-95 opacity-75',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onClick={onClick}
    >
      {children}
    </div>
  )
}