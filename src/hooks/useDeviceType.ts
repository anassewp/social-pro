'use client'

import { useState, useEffect } from 'react'

// Device type detection
export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop'
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number
  screenHeight: number
  orientation: 'portrait' | 'landscape'
  pixelRatio: number
  supportsTouch: boolean
  isStandalone: boolean
  isIOS: boolean
  isAndroid: boolean
  isPWA: boolean
  connectionSpeed: 'slow' | 'medium' | 'fast'
  prefersReducedMotion: boolean
  prefersDarkMode: boolean
}

// Screen breakpoints
export const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export function useDeviceType(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        type: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1024,
        screenHeight: 768,
        orientation: 'landscape',
        pixelRatio: 1,
        supportsTouch: false,
        isStandalone: false,
        isIOS: false,
        isAndroid: false,
        isPWA: false,
        connectionSpeed: 'fast',
        prefersReducedMotion: false,
        prefersDarkMode: false,
      }
    }

    const width = window.innerWidth
    const height = window.innerHeight
    const pixelRatio = window.devicePixelRatio || 1
    const orientation = height > width ? 'portrait' : 'landscape'
    
    // Determine device type based on screen width
    let type: 'mobile' | 'tablet' | 'desktop'
    let isMobile = false
    let isTablet = false
    let isDesktop = false

    if (width < BREAKPOINTS.md) {
      type = 'mobile'
      isMobile = true
    } else if (width < BREAKPOINTS.lg) {
      type = 'tablet'
      isTablet = true
    } else {
      type = 'desktop'
      isDesktop = true
    }

    // Check for touch support
    const supportsTouch = 'ontouchstart' in window || 
                         navigator.maxTouchPoints > 0 ||
                         (window as any).DocumentTouch && document instanceof (window as any).DocumentTouch

    // Check if app is running in standalone mode (PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)
    
    const isPWA = isStandalone || isIOS || isAndroid

    // Connection speed detection (basic)
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    let connectionSpeed: 'slow' | 'medium' | 'fast' = 'fast'
    
    if (connection) {
      const effectiveType = connection.effectiveType
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        connectionSpeed = 'slow'
      } else if (effectiveType === '3g') {
        connectionSpeed = 'medium'
      }
    }

    // Check for user preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches

    return {
      type,
      isMobile,
      isTablet,
      isDesktop,
      screenWidth: width,
      screenHeight: height,
      orientation,
      pixelRatio,
      supportsTouch,
      isStandalone,
      isIOS,
      isAndroid,
      isPWA,
      connectionSpeed,
      prefersReducedMotion,
      prefersDarkMode,
    }
  })

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(prev => {
        const width = window.innerWidth
        const height = window.innerHeight
        const pixelRatio = window.devicePixelRatio || 1
        const orientation = height > width ? 'portrait' : 'landscape'
        
        let type: 'mobile' | 'tablet' | 'desktop'
        let isMobile = false
        let isTablet = false
        let isDesktop = false

        if (width < BREAKPOINTS.md) {
          type = 'mobile'
          isMobile = true
        } else if (width < BREAKPOINTS.lg) {
          type = 'tablet'
          isTablet = true
        } else {
          type = 'desktop'
          isDesktop = true
        }

        const supportsTouch = 'ontouchstart' in window || 
                             navigator.maxTouchPoints > 0 ||
                             (window as any).DocumentTouch && document instanceof (window as any).DocumentTouch

        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                            (window.navigator as any).standalone === true

        return {
          ...prev,
          type,
          isMobile,
          isTablet,
          isDesktop,
          screenWidth: width,
          screenHeight: height,
          orientation,
          pixelRatio,
          supportsTouch,
          isStandalone,
        }
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return deviceInfo
}

// Hook for orientation changes
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    if (typeof window === 'undefined') return 'landscape'
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  })

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleOrientationChange)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return orientation
}

// Hook for viewport size
export function useViewportSize() {
  const [viewportSize, setViewportSize] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 }
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  })

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return viewportSize
}

// Hook for breakpoint detection
export function useBreakpoint() {
  const viewportSize = useViewportSize()
  
  const breakpoint = {
    xs: viewportSize.width >= BREAKPOINTS.xs,
    sm: viewportSize.width >= BREAKPOINTS.sm,
    md: viewportSize.width >= BREAKPOINTS.md,
    lg: viewportSize.width >= BREAKPOINTS.lg,
    xl: viewportSize.width >= BREAKPOINTS.xl,
    '2xl': viewportSize.width >= BREAKPOINTS['2xl'],
  }

  const currentBreakpoint = Object.entries(breakpoint)
    .reverse()
    .find(([, isActive]) => isActive)?.[0] || 'xs'

  return {
    breakpoint,
    currentBreakpoint,
    isXs: breakpoint.xs,
    isSm: breakpoint.sm,
    isMd: breakpoint.md,
    isLg: breakpoint.lg,
    isXl: breakpoint.xl,
    is2Xl: breakpoint['2xl'],
    width: viewportSize.width,
    height: viewportSize.height,
  }
}

// Hook for safe area insets (iOS notch support)
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })

  useEffect(() => {
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement)
      
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
      })
    }

    updateSafeArea()
    window.addEventListener('resize', updateSafeArea)
    return () => window.removeEventListener('resize', updateSafeArea)
  }, [])

  return safeArea
}

// Hook for network information
export function useNetworkInfo() {
  const [networkInfo, setNetworkInfo] = useState({
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false,
    isOnline: true,
  })

  useEffect(() => {
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection

    const updateNetworkInfo = () => {
      if (connection) {
        setNetworkInfo({
          effectiveType: connection.effectiveType || '4g',
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 50,
          saveData: connection.saveData || false,
          isOnline: navigator.onLine,
        })
      } else {
        setNetworkInfo(prev => ({ ...prev, isOnline: navigator.onLine }))
      }
    }

    const handleOnline = () => setNetworkInfo(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setNetworkInfo(prev => ({ ...prev, isOnline: false }))

    updateNetworkInfo()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if (connection) {
      connection.addEventListener('change', updateNetworkInfo)
      return () => {
        connection.removeEventListener('change', updateNetworkInfo)
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  return networkInfo
}

// Hook for detecting user's color scheme preference
export function useColorScheme() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | 'auto'>('auto')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const updateColorScheme = () => {
      if (colorScheme === 'auto') {
        setColorScheme(mediaQuery.matches ? 'dark' : 'light')
      }
    }

    updateColorScheme()
    mediaQuery.addEventListener('change', updateColorScheme)

    return () => mediaQuery.removeEventListener('change', updateColorScheme)
  }, [colorScheme])

  return { colorScheme, setColorScheme }
}

// Hook for detecting reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const updateReducedMotion = () => {
      setPrefersReducedMotion(mediaQuery.matches)
    }

    updateReducedMotion()
    mediaQuery.addEventListener('change', updateReducedMotion)

    return () => mediaQuery.removeEventListener('change', updateReducedMotion)
  }, [])

  return prefersReducedMotion
}

// Utility functions
export const mediaQueries = {
  xs: `(min-width: ${BREAKPOINTS.xs}px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`,
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  hover: '(hover: hover)',
  noHover: '(hover: none)',
  touch: '(pointer: coarse)',
  noTouch: '(pointer: fine)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  darkMode: '(prefers-color-scheme: dark)',
  highContrast: '(prefers-contrast: high)',
  reducedData: '(prefers-reduced-data: reduce)',
}

export function useMediaQuery(query: keyof typeof mediaQueries) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(mediaQueries[query]).matches
  })

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mediaQueries[query])
    
    const updateMatches = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    updateMatches(mediaQueryList)
    mediaQueryList.addEventListener('change', updateMatches)

    return () => mediaQueryList.removeEventListener('change', updateMatches)
  }, [query])

  return matches
}

// Performance monitoring hook
export function usePerformance() {
  const [metrics, setMetrics] = useState({
    memoryUsage: 0,
    loadTime: 0,
    renderTime: 0,
    fcp: 0, // First Contentful Paint
    lcp: 0, // Largest Contentful Paint
    fid: 0, // First Input Delay
    cls: 0, // Cumulative Layout Shift
  })

  useEffect(() => {
    // Basic performance metrics
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      setMetrics(prev => ({ ...prev, loadTime: navigation.loadEventEnd - navigation.fetchStart }))
    }

    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory
      setMetrics(prev => ({ ...prev, memoryUsage: memory.usedJSHeapSize / 1024 / 1024 }))
    }

    // Core Web Vitals (simplified)
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          setMetrics(prev => ({ ...prev, lcp: entry.startTime }))
        } else if (entry.entryType === 'first-input') {
          setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }))
        } else if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
          setMetrics(prev => ({ ...prev, cls: prev.cls + (entry as any).value }))
        }
      }
    })

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
    } catch (e) {
      console.warn('Performance observer not supported')
    }

    return () => observer.disconnect()
  }, [])

  return metrics
}