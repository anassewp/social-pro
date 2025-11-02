'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface ShimmerEffectProps {
  /**
   * نوع الـ Shimmer
   */
  type?: 'wave' | 'pulse' | 'scan' | 'gradient' | 'dots'

  /**
   * لون الخلفية
   */
  backgroundColor?: string

  /**
   * لون الـ shimmer
   */
  shimmerColor?: string

  /**
   * مدة الانيميشن
   */
  duration?: number

  /**
   * الاتجاه
   */
  direction?: 'left' | 'right' | 'up' | 'down'

  /**
   * تخصيص className
   */
  className?: string

  /**
   * عرض العنصر
   */
  width?: number | string

  /**
   * ارتفاع العنصر
   */
  height?: number | string

  /**
   * الزوايا المدورة
   */
  borderRadius?: number | string

  /**
   * عدد النقاط (لـ dots type)
   */
  dotCount?: number
}

// CSS animations for shimmer effects
const shimmerAnimations = {
  wave: `
    @keyframes shimmer-wave {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `,
  pulse: `
    @keyframes shimmer-pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
  `,
  scan: `
    @keyframes shimmer-scan {
      0% { transform: translateX(-100%) skewX(-20deg); }
      100% { transform: translateX(200%) skewX(-20deg); }
    }
  `,
  gradient: `
    @keyframes shimmer-gradient {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
  `,
  dots: `
    @keyframes shimmer-dots {
      0%, 20% { transform: scale(1); }
      50% { transform: scale(1.2); }
      80%, 100% { transform: scale(1); }
    }
  `,
}

export function ShimmerEffect({
  type = 'wave',
  backgroundColor = '#f3f4f6',
  shimmerColor = '#ffffff',
  duration = 2000,
  direction = 'right',
  className,
  width = '100%',
  height = 200,
  borderRadius = 8,
  dotCount = 3,
}: ShimmerEffectProps) {
  // Inject CSS animations if not already injected
  React.useEffect(() => {
    const styleElement = document.createElement('style')
    styleElement.textContent = shimmerAnimations[type]
    
    // Check if the animation already exists
    if (!document.head.querySelector(`[data-shimmer="${type}"]`)) {
      styleElement.setAttribute('data-shimmer', type)
      document.head.appendChild(styleElement)
    }
    
    return () => {
      const existingStyle = document.head.querySelector(`[data-shimmer="${type}"]`)
      if (existingStyle) {
        document.head.removeChild(existingStyle)
      }
    }
  }, [type])

  const directionTransform = {
    left: 'translateX(100%)',
    right: 'translateX(-100%)',
    up: 'translateY(100%)',
    down: 'translateY(-100%)',
  }

  const commonStyles = {
    width,
    height,
    backgroundColor,
    borderRadius,
  }

  if (type === 'gradient') {
    return (
      <div
        className={cn(
          'relative overflow-hidden bg-muted',
          className
        )}
        style={commonStyles}
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          style={{
            background: `linear-gradient(90deg, transparent, ${shimmerColor}40, transparent)`,
            backgroundSize: '200px 100%',
            animation: `shimmer-gradient ${duration}ms ease-in-out infinite`,
          }}
        />
      </div>
    )
  }

  if (type === 'pulse') {
    return (
      <div
        className={cn(
          'bg-muted',
          className
        )}
        style={{
          ...commonStyles,
          animation: `shimmer-pulse ${duration}ms ease-in-out infinite`,
          background: `linear-gradient(90deg, ${backgroundColor}, ${shimmerColor}20, ${backgroundColor})`,
        }}
      />
    )
  }

  if (type === 'wave') {
    return (
      <div
        className={cn(
          'relative overflow-hidden bg-muted',
          className
        )}
        style={commonStyles}
      >
        <div
          className="absolute inset-y-0 opacity-60"
          style={{
            width: '30%',
            background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
            animation: `shimmer-wave ${duration}ms ease-in-out infinite`,
            transform: direction === 'left' ? 'translateX(100%)' : 'translateX(-100%)',
          }}
        />
      </div>
    )
  }

  if (type === 'scan') {
    return (
      <div
        className={cn(
          'relative overflow-hidden bg-muted',
          className
        )}
        style={commonStyles}
      >
        <div
          className="absolute top-0 bottom-0 opacity-40"
          style={{
            width: '20%',
            background: `linear-gradient(90deg, transparent, ${shimmerColor}80, transparent)`,
            animation: `shimmer-scan ${duration}ms linear infinite`,
          }}
        />
      </div>
    )
  }

  if (type === 'dots') {
    return (
      <div
        className={cn(
          'flex items-center justify-center space-x-2',
          className
        )}
        style={{ height }}
      >
        {Array.from({ length: dotCount }).map((_, index) => (
          <div
            key={index}
            className="bg-muted rounded-full"
            style={{
              width: height / 4,
              height: height / 4,
              background: `linear-gradient(45deg, ${backgroundColor}, ${shimmerColor}30, ${backgroundColor})`,
              animation: `shimmer-dots ${duration}ms ease-in-out infinite`,
              animationDelay: `${index * 200}ms`,
            }}
          />
        ))}
      </div>
    )
  }

  return null
}

// Advanced Skeleton with Shimmer Effects
export function SkeletonShimmer({
  className,
  type = 'wave',
  children,
  ...props
}: ShimmerEffectProps & {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div className={cn('animate-pulse', className)}>
      <ShimmerEffect type={type} {...props} />
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}

// Card Skeleton with Shimmer
export function CardSkeleton({
  className,
  shimmerType = 'gradient',
}: {
  className?: string
  shimmerType?: 'wave' | 'pulse' | 'scan' | 'gradient' | 'dots'
}) {
  return (
    <div className={cn('space-y-4 p-6 border rounded-lg', className)}>
      {/* Header */}
      <div className="flex items-center space-x-4">
        <ShimmerEffect 
          type={shimmerType}
          width={48}
          height={48}
          borderRadius="50%"
        />
        <div className="space-y-2 flex-1">
          <ShimmerEffect 
            type={shimmerType}
            height={20}
            width="60%"
          />
          <ShimmerEffect 
            type={shimmerType}
            height={16}
            width="40%"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-3">
        <ShimmerEffect type={shimmerType} height={16} />
        <ShimmerEffect type={shimmerType} height={16} width="80%" />
        <ShimmerEffect type={shimmerType} height={16} width="60%" />
      </div>
      
      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t">
        <ShimmerEffect type={shimmerType} height={20} width="30%" />
        <ShimmerEffect type={shimmerType} height={32} width="20%" />
      </div>
    </div>
  )
}

// List Skeleton with Shimmer
export function ListSkeleton({
  items = 5,
  className,
  shimmerType = 'wave',
}: {
  items?: number
  className?: string
  shimmerType?: 'wave' | 'pulse' | 'scan' | 'gradient' | 'dots'
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
          <ShimmerEffect 
            type={shimmerType}
            width={40}
            height={40}
            borderRadius="50%"
          />
          <div className="space-y-2 flex-1">
            <ShimmerEffect type={shimmerType} height={16} />
            <ShimmerEffect type={shimmerType} height={12} width="70%" />
          </div>
          <ShimmerEffect type={shimmerType} height={24} width="15%" />
        </div>
      ))}
    </div>
  )
}

// Table Skeleton with Shimmer
export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
  shimmerType = 'scan',
}: {
  rows?: number
  columns?: number
  className?: string
  shimmerType?: 'wave' | 'pulse' | 'scan' | 'gradient' | 'dots'
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Table Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <ShimmerEffect key={`header-${index}`} type={shimmerType} height={16} />
        ))}
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <ShimmerEffect 
              key={`${rowIndex}-${colIndex}`} 
              type={shimmerType} 
              height={14} 
              animationDuration={1500 + (rowIndex * 100)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Profile Skeleton with Shimmer
export function ProfileSkeleton({
  className,
  shimmerType = 'gradient',
}: {
  className?: string
  shimmerType?: 'wave' | 'pulse' | 'scan' | 'gradient' | 'dots'
}) {
  return (
    <div className={cn('flex items-center space-x-6', className)}>
      {/* Avatar */}
      <ShimmerEffect 
        type={shimmerType}
        width={80}
        height={80}
        borderRadius="50%"
        duration={2500}
      />
      
      {/* Info */}
      <div className="space-y-3 flex-1">
        <ShimmerEffect type={shimmerType} height={24} width="40%" />
        <ShimmerEffect type={shimmerType} height={16} width="60%" />
        <ShimmerEffect type={shimmerType} height={16} width="50%" />
        
        {/* Stats */}
        <div className="flex space-x-6 pt-2">
          <div className="text-center space-y-1">
            <ShimmerEffect type={shimmerType} height={20} width={30} />
            <ShimmerEffect type={shimmerType} height={12} width={40} />
          </div>
          <div className="text-center space-y-1">
            <ShimmerEffect type={shimmerType} height={20} width={30} />
            <ShimmerEffect type={shimmerType} height={12} width={40} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Image Skeleton with Shimmer
export function ImageSkeleton({
  width = '100%',
  height = 200,
  className,
  shimmerType = 'scan',
}: {
  width?: number | string
  height?: number | string
  className?: string
  shimmerType?: 'wave' | 'pulse' | 'scan' | 'gradient' | 'dots'
}) {
  return (
    <ShimmerEffect
      type={shimmerType}
      width={width}
      height={height}
      className={cn('rounded-lg', className)}
      duration={2000}
    />
  )
}