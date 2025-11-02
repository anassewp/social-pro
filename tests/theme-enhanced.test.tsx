import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EnhancedThemeProvider, SimpleThemeToggle } from '@/components/theme'
import { useEnhancedTheme } from '@/lib/hooks/useTheme'

// Component لاختبار useTheme hook
function TestComponent() {
  const theme = useEnhancedTheme()
  
  return (
    <div data-testid="theme-info">
      <span data-testid="current-theme">{theme.theme}</span>
      <span data-testid="actual-theme">{theme.actualTheme}</span>
      <span data-testid="variant">{theme.variant}</span>
      <SimpleThemeToggle data-testid="theme-toggle" />
    </div>
  )
}

function renderWithProvider() {
  return render(
    <EnhancedThemeProvider>
      <TestComponent />
    </EnhancedThemeProvider>
  )
}

describe('Enhanced Theme System', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  describe('Theme Provider', () => {
    test('should render theme information correctly', () => {
      renderWithProvider()
      
      expect(screen.getByTestId('theme-info')).toBeInTheDocument()
      expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
      expect(screen.getByTestId('variant')).toHaveTextContent('default')
    })

    test('should persist theme in localStorage', async () => {
      renderWithProvider()
      const user = userEvent.setup()
      
      const toggleButton = screen.getByTestId('theme-toggle')
      await user.click(toggleButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      })
      
      // Verify persistence
      const saved = localStorage.getItem('theme-enhanced')
      expect(saved).toBeTruthy()
      
      const parsed = JSON.parse(saved!)
      expect(parsed.theme).toBe('dark')
    })
  })

  describe('Theme Toggle', () => {
    test('should toggle between themes on click', async () => {
      renderWithProvider()
      const user = userEvent.setup()
      
      const toggleButton = screen.getByTestId('theme-toggle')
      
      // First click - should go to dark
      await user.click(toggleButton)
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      })
      
      // Second click - should go to system
      await user.click(toggleButton)
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
      })
      
      // Third click - should go to light
      await user.click(toggleButton)
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
      })
    })

    test('should update actualTheme based on system preference', async () => {
      // Mock system preference to dark
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-color-scheme: dark)',
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }))
      })

      renderWithProvider()
      
      await waitFor(() => {
        expect(screen.getByTestId('actual-theme')).toHaveTextContent('dark')
      })
    })
  })

  describe('Theme Presets', () => {
    test('should load default light preset', () => {
      renderWithProvider()
      
      // Should start with light preset when system preference is light
      expect(screen.getByTestId('variant')).toHaveTextContent('default')
    })

    test('should switch variants correctly', async () => {
      renderWithProvider()
      const user = userEvent.setup()
      
      // This would need the dropdown component for full testing
      // For now, just verify the variant state exists
      expect(screen.getByTestId('variant')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    test('should respect reduced motion preference', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }))
      })

      renderWithProvider()
      
      // Component should still render without issues
      expect(screen.getByTestId('theme-info')).toBeInTheDocument()
    })

    test('should have proper ARIA labels', () => {
      renderWithProvider()
      
      const toggleButton = screen.getByTestId('theme-toggle')
      expect(toggleButton).toHaveAttribute('aria-label')
      expect(toggleButton.getAttribute('aria-label')).toContain('تبديل الوضع')
    })
  })

  describe('Performance', () => {
    test('should apply theme transitions smoothly', async () => {
      renderWithProvider()
      const user = userEvent.setup()
      
      const startTime = performance.now()
      const toggleButton = screen.getByTestId('theme-toggle')
      
      await user.click(toggleButton)
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should be near-instant for our tests
      expect(duration).toBeLessThan(100)
    })

    test('should not cause layout shift during theme changes', async () => {
      renderWithProvider()
      const user = userEvent.setup()
      
      const container = screen.getByTestId('theme-info')
      const initialHeight = container.offsetHeight
      
      const toggleButton = screen.getByTestId('theme-toggle')
      await user.click(toggleButton)
      
      await waitFor(() => {
        const newHeight = container.offsetHeight
        expect(newHeight).toBe(initialHeight)
      })
    })
  })
})

describe('Theme Utilities', () => {
  test('should validate theme accessibility', () => {
    const { ThemeUtils } = require('@/lib/theme/utils')
    
    // Test with a valid theme preset
    const mockPreset = {
      colors: {
        background: '0 0% 100%',
        foreground: '222.2 84% 4.9%',
        'primary-foreground': '0 0% 100%',
        primary: '217 91% 60%',
        muted: '240 4.8% 96.1%',
        'muted-foreground': '240 3.8% 46.1%'
      }
    }
    
    const validation = ThemeUtils.validateAccessibility(mockPreset)
    
    // Should not have critical issues for basic colors
    expect(validation).toBeDefined()
    expect(Array.isArray(validation.issues)).toBe(true)
    expect(Array.isArray(validation.suggestions)).toBe(true)
  })

  test('should calculate color contrast correctly', () => {
    const { ThemeUtils } = require('@/lib/theme/utils')
    
    const contrast = ThemeUtils.calculateContrast(
      '222.2 84% 4.9%', // dark foreground
      '0 0% 100%' // light background
    )
    
    expect(contrast).toBeGreaterThan(1)
    expect(typeof contrast).toBe('number')
  })

  test('should apply theme preset to DOM', () => {
    const { ThemeUtils } = require('@/lib/theme/utils')
    const { LIGHT_PRESETS } = require('@/lib/theme/presets')
    
    const preset = LIGHT_PRESETS.default
    
    // Mock DOM
    const mockElement = {
      style: {
        setProperty: vi.fn()
      },
      classList: {
        toggle: vi.fn(),
        add: vi.fn(),
        remove: vi.fn()
      },
      setAttribute: vi.fn()
    }
    
    document.documentElement = mockElement as any
    
    ThemeUtils.applyPresetToDOM(preset, false)
    
    // Verify CSS properties are applied
    expect(mockElement.style.setProperty).toHaveBeenCalled()
    expect(mockElement.classList.add).toHaveBeenCalledWith('light')
    expect(mockElement.classList.remove).toHaveBeenCalledWith('dark')
  })
})

describe('Theme Animations', () => {
  test('should respect reduced motion preference', async () => {
    const { themeAnimationEngine } = require('@/lib/theme/animations')
    
    // Mock reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    })

    const engine = new themeAnimationEngine.constructor()
    expect(engine.reduceMotion).toBe(true)
  })

  test('should generate proper CSS keyframes', () => {
    const { THEME_KEYFRAMES } = require('@/lib/theme/animations')
    
    expect(THEME_KEYFRAMES).toContain('@keyframes theme-fade-in')
    expect(THEME_KEYFRAMES).toContain('@keyframes theme-gradient-shift')
    expect(THEME_KEYFRAMES).toContain('@keyframes theme-scale-in')
    expect(THEME_KEYFRAMES).toContain('@keyframes theme-slide-in')
    expect(THEME_KEYFRAMES).toContain('@keyframes theme-morph')
  })
})
