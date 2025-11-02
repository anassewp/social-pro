'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { 
  Theme, 
  ThemeVariant, 
  EnhancedThemeContext,
  ThemePreset,
  getThemePreset,
  getAllPresets,
  ThemeUtils,
  enhancedThemeStorage,
  themeEvents
} from '@/lib/theme/utils'
import { 
  DEFAULT_THEME_CONFIG,
  detectSystemTheme,
  detectReducedMotion,
  detectHighContrast
} from '@/lib/theme/config'
import { themeAnimationEngine } from '@/lib/theme/animations'

const EnhancedThemeContext = createContext<EnhancedThemeContext | undefined>(undefined)

export function EnhancedThemeProvider({ 
  children,
  config = DEFAULT_THEME_CONFIG
}: { 
  children: React.ReactNode
  config?: typeof DEFAULT_THEME_CONFIG
}) {
  // State management
  const [theme, setThemeState] = useState<Theme>(config.defaultTheme)
  const [variant, setVariantState] = useState<ThemeVariant>('default')
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // System preferences
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>('light')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  
  // Presets
  const lightPreset = useMemo(() => getThemePreset('light', variant), [variant])
  const darkPreset = useMemo(() => getThemePreset('dark', variant), [variant])
  
  // Initialize from storage
  useEffect(() => {
    const stored = enhancedThemeStorage.load()
    if (stored) {
      setThemeState(stored.theme)
      setVariantState(stored.variant)
    }
    
    // Detect system preferences
    setSystemPreference(detectSystemTheme())
    setReducedMotion(detectReducedMotion())
    setHighContrast(detectHighContrast())
  }, [])
  
  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light')
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  // Listen for accessibility preferences
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches)
    }
    
    motionQuery.addEventListener('change', handleMotionChange)
    contrastQuery.addEventListener('change', handleContrastChange)
    
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      contrastQuery.removeEventListener('change', handleContrastChange)
    }
  }, [])
  
  // Calculate actual theme
  const effectiveTheme = useMemo(() => {
    return ThemeUtils.getEffectiveTheme(theme, systemPreference)
  }, [theme, systemPreference])
  
  // Apply theme with animation
  const applyTheme = useCallback(async (newTheme: Theme, newVariant: ThemeVariant) => {
    setIsTransitioning(true)
    
    // Emit event before transition
    themeEvents.emit('theme-change-start', { 
      from: { theme: actualTheme, variant },
      to: { theme: newTheme, variant: newVariant }
    })
    
    // Apply animation if enabled
    if (config.animations.enabled && !reducedMotion) {
      await themeAnimationEngine.applyThemeTransition(
        actualTheme,
        newTheme,
        {
          duration: config.animations.duration,
          easing: config.animations.easing,
          type: 'fade',
          respectReducedMotion: config.accessibility.respectReducedMotion
        }
      )
    }
    
    // Get the preset for the new theme
    const preset = getThemePreset(effectiveTheme, newVariant)
    
    // Apply CSS variables
    ThemeUtils.applyPresetToDOM(preset, effectiveTheme === 'dark')
    
    // Update state
    setThemeState(newTheme)
    setVariantState(newVariant)
    setActualTheme(effectiveTheme)
    
    // Persist to storage
    enhancedThemeStorage.save(newTheme, newVariant)
    
    // Emit completion event
    setTimeout(() => {
      themeEvents.emit('theme-change-complete', { 
        theme: newTheme, 
        variant: newVariant, 
        preset 
      })
      setIsTransitioning(false)
    }, 50)
  }, [actualTheme, variant, effectiveTheme, config, reducedMotion])
  
  // Set theme action
  const setTheme = useCallback((newTheme: Theme) => {
    applyTheme(newTheme, variant)
  }, [applyTheme, variant])
  
  // Set variant action
  const setVariant = useCallback((newVariant: ThemeVariant) => {
    applyTheme(theme, newVariant)
  }, [applyTheme, theme])
  
  // Toggle theme action
  const toggleTheme = useCallback(() => {
    const newTheme: Theme = actualTheme === 'light' ? 'dark' : 'light'
    applyTheme(newTheme, variant)
  }, [actualTheme, variant, applyTheme])
  
  // Get current preset
  const getCurrentPreset = useCallback(() => {
    return getThemePreset(actualTheme, variant)
  }, [actualTheme, variant])
  
  // Validate current theme
  const validateCurrentTheme = useCallback(() => {
    const preset = getCurrentPreset()
    const validation = ThemeUtils.validateAccessibility(preset)
    return validation.passed
  }, [getCurrentPreset])
  
  // Get theme info
  const getThemeInfo = useCallback(() => {
    const preset = getCurrentPreset()
    return {
      theme,
      variant,
      actualTheme,
      preset,
      systemPreference,
      accessibility: {
        reducedMotion,
        highContrast,
        screenReader: true
      },
      performance: {
        animationDuration: config.animations.duration,
        transitionEnabled: config.animations.enabled,
        optimized: config.performance.optimizeTransitions
      }
    }
  }, [theme, variant, actualTheme, systemPreference, reducedMotion, highContrast, config, getCurrentPreset])
  
  // Context value
  const contextValue: EnhancedThemeContext = useMemo(() => ({
    theme,
    variant,
    actualTheme,
    lightPreset,
    darkPreset,
    systemPreference,
    reducedMotion,
    highContrast,
    setTheme,
    setVariant,
    toggleTheme,
    getCurrentPreset,
    validateCurrentTheme,
    getThemeInfo
  }), [
    theme,
    variant,
    actualTheme,
    lightPreset,
    darkPreset,
    systemPreference,
    reducedMotion,
    highContrast,
    setTheme,
    setVariant,
    toggleTheme,
    getCurrentPreset,
    validateCurrentTheme,
    getThemeInfo
  ])
  
  return (
    <EnhancedThemeContext.Provider value={contextValue}>
      <div 
        className="theme-transition"
        data-theme={actualTheme}
        data-variant={variant}
        data-transitioning={isTransitioning.toString()}
      >
        {children}
      </div>
    </EnhancedThemeContext.Provider>
  )
}

// Hook for accessing enhanced theme context
export function useEnhancedTheme() {
  const context = useContext(EnhancedThemeContext)
  if (context === undefined) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider')
  }
  return context
}

// Export all available hooks
export const useTheme = useEnhancedTheme

// Backward compatibility hook
export function useThemeCompat() {
  const enhanced = useEnhancedTheme()
  
  return {
    theme: enhanced.theme,
    actualTheme: enhanced.actualTheme,
    setTheme: enhanced.setTheme,
    toggleTheme: enhanced.toggleTheme
  }
}

// Additional utility hooks
export function useThemeVariant() {
  const { variant, setVariant } = useEnhancedTheme()
  return { variant, setVariant }
}

export function useThemePresets() {
  const { lightPreset, darkPreset } = useEnhancedTheme()
  return { lightPreset, darkPreset }
}

export function useSystemTheme() {
  const { systemPreference } = useEnhancedTheme()
  return { systemPreference }
}

export function useThemeAccessibility() {
  const { reducedMotion, highContrast } = useEnhancedTheme()
  return { reducedMotion, highContrast }
}

