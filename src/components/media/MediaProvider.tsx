'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { preloadCriticalFonts, detectFormatSupport } from './FontOptimizer'
import { preloadImage } from './ImageOptimization'

interface MediaContextType {
  isLoading: boolean
  fontsLoaded: boolean
  imageFormats: {
    webp: boolean
    avif: boolean
  }
  preloadAssets: (urls: string[]) => Promise<void>
}

const MediaContext = createContext<MediaContextType | undefined>(undefined)

interface MediaProviderProps {
  children: ReactNode
  criticalImages?: string[]
  enablePreloading?: boolean
}

export function MediaProvider({
  children,
  criticalImages = [],
  enablePreloading = true
}: MediaProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [imageFormats, setImageFormats] = useState({
    webp: true,
    avif: false
  })

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        // Preload critical fonts
        if (enablePreloading) {
          preloadCriticalFonts()
        }
        
        // Detect image format support
        const formats = detectFormatSupport()
        setImageFormats(formats)
        
        // Preload critical images
        if (criticalImages.length > 0 && enablePreloading) {
          await Promise.allSettled(
            criticalImages.map(url => preloadImage(url))
          )
        }
        
        setFontsLoaded(true)
      } catch (error) {
        console.warn('Media initialization warning:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Initialize media assets
    initializeMedia()
  }, [criticalImages, enablePreloading])

  const preloadAssets = async (urls: string[]) => {
    try {
      await Promise.allSettled(
        urls.map(url => preloadImage(url))
      )
    } catch (error) {
      console.warn('Asset preloading warning:', error)
    }
  }

  const value: MediaContextType = {
    isLoading,
    fontsLoaded,
    imageFormats,
    preloadAssets
  }

  return (
    <MediaContext.Provider value={value}>
      {children}
    </MediaContext.Provider>
  )
}

export function useMediaOptimization() {
  const context = useContext(MediaContext)
  if (!context) {
    throw new Error('useMediaOptimization must be used within a MediaProvider')
  }
  return context
}

// Hook for lazy loading intersection observer
export function useLazyLoading() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    const images = document.querySelectorAll('img[data-lazy]')
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const src = img.dataset.src
          
          if (src) {
            img.src = src
            img.removeAttribute('data-lazy')
            imageObserver.unobserve(img)
            
            setLoadedImages(prev => new Set([...prev, src]))
          }
        }
      })
    }, {
      rootMargin: '50px'
    })

    images.forEach((img) => imageObserver.observe(img))

    return () => {
      imageObserver.disconnect()
    }
  }, [])

  return { loadedImages }
}