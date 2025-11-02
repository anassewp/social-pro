// Media components exports
export { OptimizedImage } from './OptimizedImage'
export { ResponsiveImage } from './ResponsiveImage'
export { MediaGallery } from './MediaGallery'
export { MediaSkeleton, GallerySkeleton, ResponsiveSkeleton, TextSkeleton } from './MediaSkeleton'
export { FontOptimizer, cairoFont, interFont, arabicFont, fontConfigs, getFontStyles, fontCSS, criticalFonts, preloadCriticalFonts } from './FontOptimizer'
export { 
  detectFormatSupport, 
  getOptimalFormat, 
  getOptimizedImageUrl, 
  preloadImage, 
  ProgressiveImageLoader,
  compressImage,
  useImageOptimization,
  type ImageOptimizationOptions,
  type ImageFormatSupport
} from './ImageOptimization'

// Media provider and hooks
export { MediaProvider, useMediaOptimization, useLazyLoading } from './MediaProvider'

// Example component
export { MediaOptimizationExample } from './MediaOptimizationExample'

// Media utility hooks and functions
export { detectFormatSupport } from './ImageOptimization'
export { preloadCriticalFonts } from './FontOptimizer'