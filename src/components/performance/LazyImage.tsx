'use client'

import React, { useState, useRef, useCallback, useMemo, memo } from 'react'

interface LazyImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string
  alt: string
  placeholder?: React.ReactNode
  fallbackSrc?: string
  threshold?: number
  rootMargin?: string
}

const LazyImage = memo(({ 
  src, 
  alt, 
  placeholder, 
  fallbackSrc,
  threshold = 0.1,
  rootMargin = '50px',
  className,
  ...props 
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver>()

  // إنشاء مراقب العناصر
  const createObserver = useCallback(() => {
    return new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observerRef.current?.disconnect()
        }
      },
      { 
        threshold,
        rootMargin 
      }
    )
  }, [threshold, rootMargin])

  // ربط المراقب بالصورة
  React.useEffect(() => {
    if (!imgRef.current || isInView) return

    observerRef.current = createObserver()
    observerRef.current.observe(imgRef.current)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [isInView, createObserver])

  // معالجة تحميل الصورة
  const handleLoad = useCallback(() => {
    setIsLoaded(true)
  }, [])

  // معالجة أخطاء التحميل
  const handleError = useCallback(() => {
    setHasError(true)
    if (fallbackSrc && imgRef.current) {
      imgRef.current.src = fallbackSrc
    }
  }, [fallbackSrc])

  // مولد placeholder
  const placeholderElement = useMemo(() => {
    if (placeholder) return placeholder
    
    return (
      <div className={`bg-gray-200 animate-pulse ${className || ''}`}>
        <div className="w-full h-full bg-gray-200 rounded" />
      </div>
    )
  }, [placeholder, className])

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className || ''}`}>
      {/* Placeholder */}
      {!isLoaded && placeholderElement}
      
      {/* الصورة */}
      {isInView && (
        <img
          src={hasError ? fallbackSrc : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className || ''}`}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  )
})

LazyImage.displayName = 'LazyImage'

export { LazyImage }