'use client'

import { cn } from '@/lib/utils'

interface MediaSkeletonProps {
  className?: string
  width?: number | string
  height?: number | string
  aspectRatio?: 'square' | 'video' | 'wide' | 'tall' | 'auto'
  animated?: boolean
}

const aspectRatios = {
  square: '1/1',
  video: '16/9',
  wide: '21/9',
  tall: '3/4',
  auto: 'auto'
}

export function MediaSkeleton({
  className,
  width = '100%',
  height = 'auto',
  aspectRatio = 'auto',
  animated = true
}: MediaSkeletonProps) {
  const skeletonStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...(aspectRatio !== 'auto' && { aspectRatio: aspectRatios[aspectRatio] })
  }

  return (
    <div 
      className={cn(
        'relative overflow-hidden bg-gray-200 rounded-lg',
        animated && 'animate-pulse',
        className
      )}
      style={skeletonStyle}
    >
      {/* Animated gradient background */}
      {animated && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
        </div>
      )}
      
      {/* Content placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg 
          className="w-8 h-8 text-gray-300" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>
    </div>
  )
}

// Multiple skeleton for gallery
interface GallerySkeletonProps {
  count?: number
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: number
  className?: string
}

export function GallerySkeleton({
  count = 6,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  className
}: GallerySkeletonProps) {
  return (
    <div 
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: `repeat(${columns.mobile || 1}, 1fr)`,
        gap: `${gap}rem`
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <MediaSkeleton 
          key={index}
          aspectRatio="square"
          className="w-full"
        />
      ))}
    </div>
  )
}

// Responsive skeleton
export function ResponsiveSkeleton({
  className,
  aspectRatio = 'auto'
}: {
  className?: string
  aspectRatio?: 'square' | 'video' | 'wide' | 'tall' | 'auto'
}) {
  return (
    <MediaSkeleton 
      className={cn('w-full', className)}
      aspectRatio={aspectRatio}
    />
  )
}

// Text skeleton for loading states
export function TextSkeleton({
  lines = 3,
  className,
  animated = true
}: {
  lines?: number
  className?: string
  animated?: boolean
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index}
          className={cn(
            'h-4 bg-gray-200 rounded',
            animated && 'animate-pulse',
            index === lines - 1 && 'w-3/4' // Last line shorter
          )}
        />
      ))}
    </div>
  )
}