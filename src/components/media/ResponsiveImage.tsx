'use client'

import { OptimizedImage } from './OptimizedImage'
import { useState, useEffect } from 'react'

interface ResponsiveImageProps {
  src: string
  alt: string
  aspectRatio?: 'square' | 'video' | 'wide' | 'tall' | 'auto'
  className?: string
  priority?: boolean
  quality?: number
  blurDataURL?: string
  placeholder?: 'blur' | 'empty'
  onLoad?: () => void
  onError?: () => void
  // Responsive breakpoints
  mobileSrc?: string
  tabletSrc?: string
  desktopSrc?: string
  // Custom sizes
  sizes?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
}

const aspectRatios = {
  square: '1/1',
  video: '16/9',
  wide: '21/9',
  tall: '3/4',
  auto: 'auto'
}

const defaultSizes = {
  mobile: '100vw',
  tablet: '75vw',
  desktop: '50vw'
}

export function ResponsiveImage({
  src,
  alt,
  aspectRatio = 'auto',
  className,
  priority = false,
  quality = 75,
  blurDataURL,
  placeholder = 'empty',
  onLoad,
  onError,
  mobileSrc,
  tabletSrc,
  desktopSrc,
  sizes = defaultSizes
}: ResponsiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const updateImageSource = () => {
      const screenWidth = window.innerWidth
      
      if (screenWidth < 768 && mobileSrc) {
        setCurrentSrc(mobileSrc)
      } else if (screenWidth < 1024 && tabletSrc) {
        setCurrentSrc(tabletSrc)
      } else if (screenWidth >= 1024 && desktopSrc) {
        setCurrentSrc(desktopSrc)
      } else {
        setCurrentSrc(src)
      }
    }

    updateImageSource()
    window.addEventListener('resize', updateImageSource)
    
    return () => {
      window.removeEventListener('resize', updateImageSource)
    }
  }, [src, mobileSrc, tabletSrc, desktopSrc, isClient])

  const calculateSizes = () => {
    const baseSizes = sizes
    return `(max-width: 767px) ${baseSizes.mobile || defaultSizes.mobile}, (max-width: 1023px) ${baseSizes.tablet || defaultSizes.tablet}, ${baseSizes.desktop || defaultSizes.desktop}`
  }

  const getAspectRatioStyle = () => {
    if (aspectRatio === 'auto') return {}
    
    return {
      aspectRatio: aspectRatios[aspectRatio]
    }
  }

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={getAspectRatioStyle()}
    >
      <OptimizedImage
        src={currentSrc}
        alt={alt}
        priority={priority}
        quality={quality}
        blurDataURL={blurDataURL}
        placeholder={placeholder}
        sizes={calculateSizes()}
        fill={true}
        onLoad={onLoad}
        onError={onError}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  )
}