'use client'

// Main responsive layout components
export { ResponsiveLayout, ResponsivePageHeader, ResponsiveContentGrid, ResponsiveCard } from './EnhancedResponsiveLayout'

// Mobile navigation components
export { MobileNavigation, BottomNavigation } from './MobileNavigation'

// Data display components
export { ResponsiveTable } from './ResponsiveTable'

// Form components
export { ResponsiveForm, FormSection } from './ResponsiveForm'

// Touch-optimized components
export { 
  TouchOptimizedButton, 
  Swipeable, 
  PullToRefresh, 
  LongPress 
} from './TouchOptimizedComponents'

// Example usage component
export { ResponsiveDashboardExample } from './ResponsiveDashboardExample'

// Import utilities
import { useDeviceType, useOrientation, useViewportSize, useBreakpoint } from '@/hooks/useDeviceType'
import { useMediaQuery } from '@/hooks/useDeviceType'

// Export hooks for easy access
export {
  useDeviceType,
  useOrientation,
  useViewportSize,
  useBreakpoint,
  useMediaQuery
}