'use client'

import React, { useState } from 'react'
import { 
  EnhancedThemeWrapper, 
  SimpleThemeToggle, 
  DropdownThemeToggle, 
  ThemeSelectorWithPresets,
  useEnhancedTheme 
} from '@/components/theme'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// مثال على مكون يستخدم النظام المحسن
function ThemeDemo() {
  const {
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
  } = useEnhancedTheme()

  const [demoCard, setDemoCard] = useState('default')
  const themeInfo = getThemeInfo()
  const currentPreset = getCurrentPreset()
  const isThemeValid = validateCurrentTheme()

  return (
    <div className="min-h-screen bg-background text-foreground p-8 transition-all duration-300">
      {/* Header */}
      <header className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            مثال نظام Dark Mode المحسن
          </h1>
          
          <div className="flex items-center gap-4">
            <SimpleThemeToggle />
            <DropdownThemeToggle 
              showSystemInfo={true}
              showAccessibility={true}
              showPerformanceInfo={true}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <Card className="p-4">
            <div className="font-medium mb-2">الوضع الحالي</div>
            <div className="text-muted-foreground">
              {theme === 'system' ? 'تلقائي' : theme === 'dark' ? 'داكن' : 'فاتح'}
            </div>
            <Badge variant={actualTheme === 'dark' ? 'default' : 'secondary'}>
              {actualTheme === 'dark' ? '🌙 داكن' : '☀️ فاتح'}
            </Badge>
          </Card>
          
          <Card className="p-4">
            <div className="font-medium mb-2">نمط الألوان</div>
            <div className="text-muted-foreground">{variant}</div>
            <Badge variant="outline">{currentPreset.name}</Badge>
          </Card>
          
          <Card className="p-4">
            <div className="font-medium mb-2">نظام التشغيل</div>
            <div className="text-muted-foreground">
              {systemPreference === 'dark' ? 'داكن' : 'فاتح'}
            </div>
            <Badge variant="outline">
              {systemPreference === 'dark' ? '🌙' : '☀️'}
            </Badge>
          </Card>
          
          <Card className="p-4">
            <div className="font-medium mb-2">إمكانية الوصول</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>تقليل الحركة:</span>
                <span className={reducedMotion ? 'text-success' : 'text-muted-foreground'}>
                  {reducedMotion ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>تباين عالي:</span>
                <span className={highContrast ? 'text-success' : 'text-muted-foreground'}>
                  {highContrast ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>صحة الثيم:</span>
                <span className={isThemeValid ? 'text-success' : 'text-warning'}>
                  {isThemeValid ? '✅' : '⚠️'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </header>

      {/* Theme Controls */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">أدوات التحكم في الثيم</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Controls */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">التحكم الأساسي</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">اختيار الوضع</label>
                <div className="flex gap-2">
                  <Button 
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => setTheme('light')}
                    size="sm"
                  >
                    ☀️ فاتح
                  </Button>
                  <Button 
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setTheme('dark')}
                    size="sm"
                  >
                    🌙 داكن
                  </Button>
                  <Button 
                    variant={theme === 'system' ? 'default' : 'outline'}
                    onClick={() => setTheme('system')}
                    size="sm"
                  >
                    🔄 تلقائي
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">تبديل سريع</label>
                <Button onClick={toggleTheme} variant="outline" size="sm">
                  {actualTheme === 'dark' ? '← العودة للفتح' : '← الذهاب للداكن'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Theme Presets */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">أنماط الألوان</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  أنماط الوضع {actualTheme === 'dark' ? 'الداكن' : 'الفاتح'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {actualTheme === 'light' ? (
                    <>
                      <Button
                        variant={variant === 'default' ? 'default' : 'outline'}
                        onClick={() => setVariant('default')}
                        size="sm"
                      >
                        افتراضي
                      </Button>
                      <Button
                        variant={variant === 'blue' ? 'default' : 'outline'}
                        onClick={() => setVariant('blue')}
                        size="sm"
                      >
                        أزرق
                      </Button>
                      <Button
                        variant={variant === 'emerald' ? 'default' : 'outline'}
                        onClick={() => setVariant('emerald')}
                        size="sm"
                      >
                        زمردي
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant={variant === 'default' ? 'default' : 'outline'}
                        onClick={() => setVariant('default')}
                        size="sm"
                      >
                        افتراضي
                      </Button>
                      <Button
                        variant={variant === 'amoled' ? 'default' : 'outline'}
                        onClick={() => setVariant('amoled')}
                        size="sm"
                      >
                        AMOLED
                      </Button>
                      <Button
                        variant={variant === 'navy' ? 'default' : 'outline'}
                        onClick={() => setVariant('navy')}
                        size="sm"
                      >
                        بحري
                      </Button>
                      <Button
                        variant={variant === 'purple' ? 'default' : 'outline'}
                        onClick={() => setVariant('purple')}
                        size="sm"
                      >
                        بنفسجي
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Demo Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">معرض المكونات</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Basic Card */}
          <Card 
            className={`p-6 transition-all duration-300 hover:shadow-lg cursor-pointer ${
              demoCard === 'basic' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setDemoCard(demoCard === 'basic' ? 'default' : 'basic')}
          >
            <h3 className="text-lg font-semibold mb-3">بطاقة أساسية</h3>
            <p className="text-muted-foreground mb-4">
              هذه بطاقة بسيطة تتكيف مع ألوان الثيم الحالي تلقائياً.
            </p>
            <div className="flex gap-2">
              <Button size="sm">زر أساسي</Button>
              <Button variant="outline" size="sm">زر ثانوي</Button>
            </div>
          </Card>

          {/* Interactive Card */}
          <Card 
            className={`p-6 transition-all duration-300 hover:scale-105 cursor-pointer ${
              demoCard === 'interactive' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setDemoCard(demoCard === 'interactive' ? 'default' : 'interactive')}
          >
            <h3 className="text-lg font-semibold mb-3">بطاقة تفاعلية</h3>
            <p className="text-muted-foreground mb-4">
              هذه بطاقة لها تأثيرات تفاعلية عند التمرير والنقر.
            </p>
            <div className="space-y-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: '70%' }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>التقدم</span>
                <span>70%</span>
              </div>
            </div>
          </Card>

          {/* Status Card */}
          <Card 
            className={`p-6 transition-all duration-300 border-l-4 border-l-primary cursor-pointer ${
              demoCard === 'status' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setDemoCard(demoCard === 'status' ? 'default' : 'status')}
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              معلومات الحالة
              <Badge variant="default" className="text-xs">
                جديد
              </Badge>
            </h3>
            <p className="text-muted-foreground mb-4">
              إحصائيات وتعلومات تتحدث بناءً على الثيم المحدد.
            </p>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-2 bg-muted/50 rounded">
                <div className="text-2xl font-bold text-primary">42</div>
                <div className="text-xs text-muted-foreground">المشاريع</div>
              </div>
              <div className="p-2 bg-muted/50 rounded">
                <div className="text-2xl font-bold text-success">89%</div>
                <div className="text-xs text-muted-foreground">نسبة النجاح</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Color Palette Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">لوحة الألوان الحالية</h2>
        
        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(currentPreset.colors).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div
                  className="w-full h-12 rounded border-2 border-border"
                  style={{ 
                    backgroundColor: typeof value === 'string' ? `hsl(${value})` : 'transparent' 
                  }}
                  title={key}
                />
                <div className="text-xs">
                  <div className="font-medium">{key}</div>
                  <div className="text-muted-foreground font-mono">
                    {typeof value === 'string' ? value : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Performance Info */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">معلومات الأداء</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">إعدادات الثيم</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>مدة الانتقال:</span>
                <span className="font-mono">{themeInfo.performance.animationDuration}ms</span>
              </div>
              <div className="flex justify-between">
                <span>الانيميشن مفعل:</span>
                <span className={themeInfo.performance.transitionEnabled ? 'text-success' : 'text-muted-foreground'}>
                  {themeInfo.performance.transitionEnabled ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>محسن للأداء:</span>
                <span className={themeInfo.performance.optimized ? 'text-success' : 'text-muted-foreground'}>
                  {themeInfo.performance.optimized ? '✅' : '❌'}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">إحصائيات الاستخدام</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>النسخة الحالية:</span>
                <span className="font-mono">{variant}</span>
              </div>
              <div className="flex justify-between">
                <span>نوع الثيم:</span>
                <span>{themeInfo.theme === 'system' ? 'تلقائي' : themeInfo.theme}</span>
              </div>
              <div className="flex justify-between">
                <span>الأولوية:</span>
                <span>{themeInfo.theme === 'system' ? 'نظام التشغيل' : 'المستخدم'}</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Preset Selector Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">اختيار الأنماط المتقدم</h2>
        <ThemeSelectorWithPresets 
          showSystemInfo={true}
          showAccessibility={true}
          showPerformanceInfo={true}
        />
      </section>
    </div>
  )
}

// Component مع الـ provider wrapper
export default function DarkModeDemo() {
  return (
    <EnhancedThemeWrapper
      enableAnimations={true}
      enableAccessibility={true}
      enablePerformanceOptimizations={true}
    >
      <ThemeDemo />
    </EnhancedThemeWrapper>
  )
}
