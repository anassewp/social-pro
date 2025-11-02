'use client'

import { useState, useCallback } from 'react'

export interface ImageOptimizationOptions {
  quality?: number
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png'
  width?: number
  height?: number
  placeholder?: boolean
}

export interface ImageFormatSupport {
  webp: boolean
  avif: boolean
}

// Detected browser support for modern image formats
let formatSupport: ImageFormatSupport | null = null

// Detect browser image format support
export function detectFormatSupport(): ImageFormatSupport {
  if (formatSupport) return formatSupport
  
  if (typeof window === 'undefined') {
    formatSupport = { webp: true, avif: false }
    return formatSupport
  }
  
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    formatSupport = { webp: false, avif: false }
    return formatSupport
  }
  
  const webp = canvas.toDataURL('image/webp').startsWith('data:image/webp')
  const avif = canvas.toDataURL('image/avif').startsWith('data:image/avif')
  
  formatSupport = { webp, avif }
  return formatSupport
}

// Get optimal image format based on browser support
export function getOptimalFormat(preferredFormat?: ImageOptimizationOptions['format']): string {
  const support = detectFormatSupport()
  
  if (preferredFormat && preferredFormat !== 'auto') {
    return preferredFormat
  }
  
  // Prioritize AVIF, then WebP, then JPEG
  if (support.avif) return 'image/avif'
  if (support.webp) return 'image/webp'
  return 'image/jpeg'
}

// Generate optimized image URL
export function getOptimizedImageUrl(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  const {
    quality = 75,
    format = 'auto',
    width,
    height
  } = options
  
  const optimalFormat = getOptimalFormat(format)
  
  // If already optimized or external URL, just return with quality parameter
  if (originalUrl.includes('?') || !originalUrl.startsWith('/')) {
    const separator = originalUrl.includes('?') ? '&' : '?'
    return `${originalUrl}${separator}q=${quality}&format=${optimalFormat.split('/')[1]}`
  }
  
  // Build optimization parameters
  const params = new URLSearchParams()
  
  if (quality && quality !== 75) {
    params.set('q', quality.toString())
  }
  
  if (width) {
    params.set('w', width.toString())
  }
  
  if (height) {
    params.set('h', height.toString())
  }
  
  const formatExtension = optimalFormat.split('/')[1]
  if (formatExtension && formatExtension !== 'jpeg') {
    params.set('format', formatExtension)
  }
  
  const queryString = params.toString()
  return queryString ? `${originalUrl}?${queryString}` : originalUrl
}

// Preload critical images
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

// Progressive image loading utility
export class ProgressiveImageLoader {
  private image: HTMLImageElement | null = null
  private lowQualitySrc: string
  private highQualitySrc: string
  private onProgress?: (progress: number) => void
  private onComplete?: () => void
  
  constructor(
    lowQualitySrc: string,
    highQualitySrc: string,
    onProgress?: (progress: number) => void,
    onComplete?: () => void
  ) {
    this.lowQualitySrc = lowQualitySrc
    this.highQualitySrc = highQualitySrc
    this.onProgress = onProgress
    this.onComplete = onComplete
  }
  
  startLoading() {
    // Start with low quality image
    this.image = new Image()
    this.image.onload = () => {
      this.onProgress?.(50) // Low quality loaded
      this.loadHighQuality()
    }
    this.image.onerror = (error) => {
      console.error('Failed to load low quality image:', error)
      // Try to load high quality directly
      this.loadHighQuality()
    }
    this.image.src = this.lowQualitySrc
  }
  
  private loadHighQuality() {
    if (!this.highQualitySrc) {
      this.onComplete?.()
      return
    }
    
    const highQualityImage = new Image()
    highQualityImage.onload = () => {
      this.onProgress?.(100) // High quality loaded
      this.onComplete?.()
    }
    highQualityImage.onerror = (error) => {
      console.error('Failed to load high quality image:', error)
      this.onComplete?.()
    }
    highQualityImage.src = this.highQualitySrc
  }
  
  cancel() {
    if (this.image) {
      this.image.onload = null
      this.image.onerror = null
      this.image = null
    }
  }
}

// Image compression utility for client-side optimization
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: 'jpeg' | 'webp' | 'png'
  } = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'webp'
  } = options
  
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file) // Fallback to original
          }
        },
        `image/${format}`,
        quality
      )
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// Hook for managing image optimization
export function useImageOptimization() {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const optimizeImage = useCallback(async (
    imageUrl: string,
    options: ImageOptimizationOptions = {}
  ) => {
    setIsOptimizing(true)
    setProgress(0)
    
    try {
      const optimizedUrl = getOptimizedImageUrl(imageUrl, options)
      setProgress(50)
      
      // Preload the optimized image
      await preloadImage(optimizedUrl)
      setProgress(100)
      
      return optimizedUrl
    } catch (error) {
      console.error('Image optimization failed:', error)
      return imageUrl // Fallback to original
    } finally {
      setIsOptimizing(false)
    }
  }, [])
  
  return {
    optimizeImage,
    isOptimizing,
    progress,
    getOptimalFormat,
    getOptimizedImageUrl
  }
}