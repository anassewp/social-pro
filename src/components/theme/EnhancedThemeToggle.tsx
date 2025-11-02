'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette, 
  Settings, 
  ChevronDown,
  Check,
  Info,
  Zap,
  Eye,
  Accessibility
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEnhancedTheme } from '@/lib/hooks/useTheme'
import { getAllPresets, ThemePreset } from '@/lib/theme/presets'
import { themeMicroInteractions } from '@/lib/theme/animations'
import { ThemeUtils } from '@/lib/theme/utils'

interface ThemeSelectorProps {
  variant?: 'simple' | 'dropdown' | 'presets'
  showSystemInfo?: boolean
  showAccessibility?: boolean
  showPerformanceInfo?: boolean
}

// Theme preview component
function ThemePreview({ preset, isActive }: { preset: ThemePreset; isActive: boolean }) {
  return (
    <div 
      className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
        isActive 
          ? 'border-primary shadow-md ring-2 ring-primary/20' 
          : 'border-border hover:border-primary/50'
      }`}
      style={{
        background: `hsl(${preset.colors.background})`,
        color: `hsl(${preset.colors.foreground})`
      }}
      role="option"
      aria-selected={isActive}
    >
      <div className="flex items-center gap-2 mb-2">
        <div 
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: `hsl(${preset.colors.primary})` }}
        />
        <div 
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: `hsl(${preset.colors.secondary})` }}
        />
        <div 
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: `hsl(${preset.colors.accent})` }}
        />
        <span className="text-sm font-medium">{preset.name}</span>
      </div>
      <p className="text-xs opacity-70">{preset.description}</p>
    </div>
  )
}

// Theme info component
function ThemeInfo({ themeInfo }: { themeInfo: any }) {
  return (
    <div className="p-3 border-t border-border bg-muted/30">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="font-medium">النظام:</span>
          <span className="ml-1">{themeInfo.systemPreference === 'dark' ? 'داكن' : 'فاتح'}</span>
        </div>
        <div>
          <span className="font-medium">الوضع:</span>
          <span className="ml-1">{themeInfo.theme === 'system' ? 'تلقائي' : themeInfo.theme === 'dark' ? 'داكن' : 'فاتح'}</span>
        </div>
        <div>
          <span className="font-medium">النسخة:</span>
          <span className="ml-1">{themeInfo.variant}</span>
        </div>
        <div>
          <span className="font-medium">الانتقال:</span>
          <span className="ml-1">{themeInfo.performance.transitionEnabled ? 'مفعل' : 'معطل'}</span>
        </div>
      </div>
    </div>
  )
}

// Accessibility info component
function AccessibilityInfo({ accessibility }: { accessibility: any }) {
  return (
    <div className="p-3 border-t border-border bg-muted/30">
      <div className="flex items-center gap-2 mb-2">
        <Accessibility className="w-4 h-4" />
        <span className="text-sm font-medium">إمكانية الوصول</span>
      </div>
      <div className="grid grid-cols-1 gap-1 text-xs">
        <div className="flex items-center justify-between">
          <span>الحركة المخفضة:</span>
          <span className={accessibility.reducedMotion ? 'text-success' : 'text-muted-foreground'}>
            {accessibility.reducedMotion ? 'مفعل' : 'معطل'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>التباين العالي:</span>
          <span className={accessibility.highContrast ? 'text-success' : 'text-muted-foreground'}>
            {accessibility.highContrast ? 'مفعل' : 'معطل'}
          </span>
        </div>
      </div>
    </div>
  )
}

// Simple theme toggle
export function SimpleThemeToggle() {
  const { theme, actualTheme, setTheme } = useEnhancedTheme()
  const [isAnimating, setIsAnimating] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  const cycleTheme = () => {
    setIsAnimating(true)
    
    // Add micro-interaction
    if (buttonRef.current) {
      themeMicroInteractions.animateButtonHover(buttonRef.current, true)
      setTimeout(() => {
        themeMicroInteractions.animateButtonHover(buttonRef.current!, false)
      }, 150)
    }
    
    const nextTheme: typeof theme = 
      theme === 'light' ? 'dark' : 
      theme === 'dark' ? 'system' : 'light'
    
    setTheme(nextTheme)
    
    setTimeout(() => setIsAnimating(false), 300)
  }
  
  const getIcon = () => {
    if (theme === 'system') return <Monitor className="h-5 w-5" />
    return actualTheme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />
  }
  
  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className={`relative transition-all duration-300 ${
        isAnimating ? 'scale-95' : 'hover:scale-105'
      }`}
      aria-label={`تبديل الوضع - الحالي: ${
        theme === 'system' ? 'تلقائي' : 
        theme === 'dark' ? 'داكن' : 'فاتح'
      }`}
      title={`الوضع الحالي: ${
        theme === 'system' ? 'تلقائي' : 
        theme === 'dark' ? 'داكن' : 'فاتح'
      }`}
    >
      <div className="relative">
        {getIcon()}
        {isAnimating && (
          <div className="absolute inset-0 animate-ping">
            {getIcon()}
          </div>
        )}
      </div>
    </Button>
  )
}

// Dropdown theme selector
export function DropdownThemeToggle({
  showSystemInfo = false,
  showAccessibility = false,
  showPerformanceInfo = false
}: Omit<ThemeSelectorProps, 'variant'>) {
  const { 
    theme, 
    variant, 
    actualTheme, 
    systemPreference,
    accessibility,
    setTheme, 
    setVariant, 
    getThemeInfo 
  } = useEnhancedTheme()
  
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const themeInfo = getThemeInfo()
  const presets = getAllPresets()
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])
  
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])
  
  const handleThemeSelect = (selectedTheme: typeof theme) => {
    setTheme(selectedTheme)
    setIsOpen(false)
  }
  
  const handleVariantSelect = (selectedVariant: any) => {
    setVariant(selectedVariant)
    setIsOpen(false)
  }
  
  const getCurrentIcon = () => {
    if (theme === 'system') return <Monitor className="h-4 w-4" />
    return actualTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
  }
  
  const validateTheme = (preset: ThemePreset) => {
    const validation = ThemeUtils.validateAccessibility(preset)
    return validation.passed
  }
  
  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative transition-all duration-200 hover:scale-105"
        aria-label="اختيار الوضع"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {getCurrentIcon()}
        <ChevronDown 
          className={`absolute -bottom-1 -right-1 h-3 w-3 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </Button>
      
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 w-80">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown content */}
          <div className="relative bg-card/95 backdrop-blur-md border-2 border-border/80 rounded-lg shadow-xl ring-1 ring-border/50 max-h-96 overflow-hidden">
            
            {/* Header */}
            <div className="p-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="font-medium text-sm">اختيار الوضع</span>
              </div>
            </div>
            
            {/* Main theme options */}
            <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
              {/* Light theme */}
              <button
                onClick={() => handleThemeSelect('light')}
                onMouseEnter={() => setHoveredItem('light')}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  theme === 'light'
                    ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20'
                    : 'text-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/80'
                }`}
                role="menuitem"
              >
                <div className="flex items-center">
                  <Sun className={`h-4 w-4 ml-2 ${theme === 'light' ? 'text-primary-foreground' : 'text-foreground'}`} />
                  <span>فاتح</span>
                </div>
                {theme === 'light' && <Check className="h-4 w-4" />}
              </button>
              
              {/* Dark theme */}
              <button
                onClick={() => handleThemeSelect('dark')}
                onMouseEnter={() => setHoveredItem('dark')}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20'
                    : 'text-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/80'
                }`}
                role="menuitem"
              >
                <div className="flex items-center">
                  <Moon className={`h-4 w-4 ml-2 ${theme === 'dark' ? 'text-primary-foreground' : 'text-foreground'}`} />
                  <span>داكن</span>
                </div>
                {theme === 'dark' && <Check className="h-4 w-4" />}
              </button>
              
              {/* System theme */}
              <button
                onClick={() => handleThemeSelect('system')}
                onMouseEnter={() => setHoveredItem('system')}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  theme === 'system'
                    ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20'
                    : 'text-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/80'
                }`}
                role="menuitem"
              >
                <div className="flex items-center">
                  <Monitor className={`h-4 w-4 ml-2 ${theme === 'system' ? 'text-primary-foreground' : 'text-foreground'}`} />
                  <span>تلقائي</span>
                </div>
                {theme === 'system' && <Check className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Theme variants for current theme */}
            {(theme === 'light' || theme === 'dark') && (
              <>
                <div className="px-2 py-1 border-t border-border">
                  <div className="flex items-center gap-2 px-1">
                    <Settings className="h-3 w-3" />
                    <span className="text-xs font-medium text-muted-foreground">الأنماط</span>
                  </div>
                </div>
                
                <div className="p-2 grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {Object.values(theme === 'light' ? presets.light : presets.dark).map((preset) => {
                    const isActive = variant === preset.id
                    const isValid = validateTheme(preset)
                    
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleVariantSelect(preset.id as any)}
                        className={`p-2 rounded-md border text-xs transition-all duration-200 ${
                          isActive 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        disabled={!isValid}
                        title={preset.description}
                      >
                        <div className="text-center">
                          <div className="font-medium">{preset.name}</div>
                          {!isValid && (
                            <div className="text-warning text-xs mt-1">مشكلة في الوصول</div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
            
            {/* System info */}
            {showSystemInfo && (
              <ThemeInfo themeInfo={themeInfo} />
            )}
            
            {/* Accessibility info */}
            {showAccessibility && (
              <AccessibilityInfo accessibility={accessibility} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Advanced theme selector with presets
export function ThemeSelectorWithPresets({
  showSystemInfo = false,
  showAccessibility = false,
  showPerformanceInfo = false
}: ThemeSelectorProps) {
  const {
    theme,
    variant,
    actualTheme,
    lightPreset,
    darkPreset,
    setTheme,
    setVariant,
    getCurrentPreset
  } = useEnhancedTheme()
  
  const [activeTab, setActiveTab] = useState<'light' | 'dark'>('light')
  const presets = getAllPresets()
  
  const currentPreset = getCurrentPreset()
  
  return (
    <div className="p-4 bg-card rounded-lg border border-border">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Palette className="h-5 w-5" />
        اختيار نمط الألوان
      </h3>
      
      {/* Tabs */}
      <div className="flex mb-4 border-b border-border">
        <button
          onClick={() => setActiveTab('light')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'light'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sun className="h-4 w-4 inline ml-1" />
          فاتح
        </button>
        <button
          onClick={() => setActiveTab('dark')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'dark'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Moon className="h-4 w-4 inline ml-1" />
          داكن
        </button>
      </div>
      
      {/* Presets grid */}
      <div className="grid grid-cols-2 gap-3">
        {Object.values(activeTab === 'light' ? presets.light : presets.dark).map((preset) => {
          const isActive = variant === preset.id
          const isCurrentTheme = (activeTab === 'light' && actualTheme === 'light') || 
                                 (activeTab === 'dark' && actualTheme === 'dark')
          
          return (
            <ThemePreview
              key={preset.id}
              preset={preset}
              isActive={isActive && isCurrentTheme}
            />
          )
        })}
      </div>
    </div>
  )
}

// Export default component
export default function EnhancedThemeToggle(props: ThemeSelectorProps) {
  const { variant = 'dropdown' } = props
  
  switch (variant) {
    case 'simple':
      return <SimpleThemeToggle />
    case 'presets':
      return <ThemeSelectorWithPresets {...props} />
    default:
      return <DropdownThemeToggle {...props} />
  }
}
