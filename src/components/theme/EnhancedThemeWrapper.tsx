'use client'

import { ReactNode } from 'react'
import { EnhancedThemeProvider } from '@/lib/hooks/useTheme'
import { DEFAULT_THEME_CONFIG } from '@/lib/theme/config'
import { THEME_KEYFRAMES } from '@/lib/theme/animations'

interface EnhancedThemeWrapperProps {
  children: ReactNode
  config?: typeof DEFAULT_THEME_CONFIG
  enableAnimations?: boolean
  enableAccessibility?: boolean
  enablePerformanceOptimizations?: boolean
}

export function EnhancedThemeWrapper({
  children,
  config = DEFAULT_THEME_CONFIG,
  enableAnimations = true,
  enableAccessibility = true,
  enablePerformanceOptimizations = true
}: EnhancedThemeWrapperProps) {
  // Inject theme animations CSS
  if (enableAnimations && typeof document !== 'undefined') {
    const existingStyle = document.getElementById('theme-animations')
    if (!existingStyle) {
      const style = document.createElement('style')
      style.id = 'theme-animations'
      style.textContent = THEME_KEYFRAMES
      document.head.appendChild(style)
    }
  }

  // Apply performance optimizations
  if (enablePerformanceOptimizations && typeof document !== 'undefined') {
    document.documentElement.style.setProperty('scroll-behavior', 'smooth')
    document.body.style.setProperty('will-change', 'background-color, color')
  }

  return (
    <EnhancedThemeProvider config={config}>
      {children}
    </EnhancedThemeProvider>
  )
}

// Theme hook wrapper for easy integration
export function useTheme() {
  return require('@/lib/hooks/useTheme').useEnhancedTheme()
}

// Utility component for theme debugging
export function ThemeDebugInfo() {
  const themeInfo = useTheme()
  
  if (process.env.NODE_ENV === 'production') {
    return null
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-card/90 backdrop-blur-md border border-border rounded-lg p-3 text-xs font-mono z-50 max-w-sm">
      <div className="font-bold mb-2">Theme Debug Info</div>
      <div className="space-y-1">
        <div>Theme: {themeInfo.theme}</div>
        <div>Variant: {themeInfo.variant}</div>
        <div>Actual: {themeInfo.actualTheme}</div>
        <div>System: {themeInfo.systemPreference}</div>
        <div>Reduced Motion: {themeInfo.reducedMotion.toString()}</div>
        <div>High Contrast: {themeInfo.highContrast.toString()}</div>
      </div>
    </div>
  )
}

export default EnhancedThemeWrapper
