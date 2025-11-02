'use client'

import { useState, useCallback, useMemo } from 'react'
import { OptimizedImage } from './OptimizedImage'
import { cn } from '@/lib/utils'

interface MediaGalleryProps {
  images: {
    src: string
    alt: string
    width?: number
    height?: number
    blurDataURL?: string
  }[]
  className?: string
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: number
  showLightbox?: boolean
  priority?: string[]
  quality?: number
  placeholder?: 'blur' | 'empty'
}

const defaultColumns = {
  mobile: 1,
  tablet: 2,
  desktop: 3
}

export function MediaGallery({
  images,
  className,
  columns = defaultColumns,
  gap = 4,
  showLightbox = true,
  priority = [],
  quality = 75,
  placeholder = 'empty'
}: MediaGalleryProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  const handleImageLoad = useCallback((src: string) => {
    setLoadedImages(prev => new Set([...prev, src]))
  }, [])

  const getGridColumns = () => {
    if (typeof window === 'undefined') {
      return `repeat(${columns.desktop}, 1fr)`
    }
    
    const screenWidth = window.innerWidth
    
    if (screenWidth < 768) {
      return `repeat(${columns.mobile || 1}, 1fr)`
    } else if (screenWidth < 1024) {
      return `repeat(${columns.tablet || 2}, 1fr)`
    } else {
      return `repeat(${columns.desktop || 3}, 1fr)`
    }
  }

  const galleryGridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: getGridColumns(),
    gap: `${gap}rem`
  }), [columns, gap])

  const openLightbox = useCallback((src: string) => {
    if (showLightbox) {
      setLightboxImage(src)
    }
  }, [showLightbox])

  const closeLightbox = useCallback(() => {
    setLightboxImage(null)
  }, [])

  return (
    <>
      <div 
        className={cn('media-gallery', className)}
        style={galleryGridStyle}
      >
        {images.map((image, index) => {
          const isPriority = priority.includes(image.src)
          const isLoaded = loadedImages.has(image.src)
          
          return (
            <div 
              key={`${image.src}-${index}`}
              className={cn(
                'relative overflow-hidden rounded-lg cursor-pointer group',
                'transition-transform hover:scale-105'
              )}
              onClick={() => openLightbox(image.src)}
            >
              {/* Loading skeleton */}
              {!isLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
              )}
              
              <OptimizedImage
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                quality={quality}
                blurDataURL={image.blurDataURL}
                placeholder={placeholder}
                priority={isPriority}
                className={cn(
                  'transition-opacity duration-300',
                  isLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => handleImageLoad(image.src)}
                style={{
                  aspectRatio: '1/1',
                  objectFit: 'cover'
                }}
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" 
                  />
                </svg>
              </div>
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {showLightbox && lightboxImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <OptimizedImage
              src={lightboxImage}
              alt="صورة مكبرة"
              quality={85}
              className="max-w-full max-h-full object-contain"
              priority={true}
              placeholder="empty"
            />
          </div>
        </div>
      )}
    </>
  )
}