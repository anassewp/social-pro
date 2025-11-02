// Theme components exports
export { default as EnhancedThemeToggle } from './EnhancedThemeToggle'
export { SimpleThemeToggle, DropdownThemeToggle, ThemeSelectorWithPresets } from './EnhancedThemeToggle'
export { EnhancedThemeWrapper } from './EnhancedThemeWrapper'
export { ThemeDebugInfo } from './EnhancedThemeWrapper'

// Re-export from other directories for convenience
export { getThemePreset, LIGHT_PRESETS, DARK_PRESETS } from '@/lib/theme/presets'
export { ThemePreset } from '@/lib/theme/presets'
export { DEFAULT_THEME_CONFIG } from '@/lib/theme/config'
export { ThemeConfig } from '@/lib/theme/config'
export { themeAnimationEngine, themeMicroInteractions, THEME_ANIMATIONS } from '@/lib/theme/animations'
export { EnhancedThemeProvider, useEnhancedTheme } from '@/lib/hooks/useTheme'
export { Theme, ThemeVariant, EnhancedThemeContext } from '@/lib/theme/utils'
export { ThemeUtils, enhancedThemeStorage, themeEvents } from '@/lib/theme/utils'
