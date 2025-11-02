'use client'

import Image from 'next/image'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  blurDataURL?: string
  placeholder?: 'blur' | 'empty'
  sizes?: string
  fill?: boolean
  onLoad?: () => void
  onError?: () => void
  loading?: 'lazy' | 'eager'
  style?: React.CSSProperties
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  blurDataURL,
  placeholder = 'empty',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = false,
  onLoad,
  onError,
  loading = 'lazy',
  style,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }, [onError])

  // Generate default blur data URL if not provided
  const defaultBlurDataURL = `data:image/svg+xml;base64,${btoa(`
    <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#gradient)" />
    </svg>
  `)}`

  if (hasError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
        style={fill ? { 
          position: 'absolute',
          inset: 0,
          ...style 
        } : undefined}
      >
        <div className="text-center">
          <svg 
            className="mx-auto h-8 w-8 mb-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <p className="text-xs">فشل في تحميل الصورة</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      {/* Loading placeholder */}
      {isLoading && (
        <div 
          className={cn(
            'absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse',
            fill ? 'inset-0' : 'rounded-lg'
          )}
          style={fill ? { 
            position: 'absolute',
            inset: 0,
            ...style 
          } : undefined}
        />
      )}
      
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={cn(
          'transition-all duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        priority={priority}
        quality={quality}
        sizes={sizes}
        fill={fill}
        loading={priority ? 'eager' : loading}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? (blurDataURL || defaultBlurDataURL) : undefined}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit: 'cover',
          ...style
        }}
        {...props}
      />
    </div>
  )
}