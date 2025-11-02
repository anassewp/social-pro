# Loading States Configuration
# إعدادات وتكوين نظام التحميل المحسن

## إعدادات أساسية / Basic Configuration

### ملف التكوين العام / Global Config File

```typescript
// config/loading.ts
export const loadingConfig = {
  // إعدادات الشبكة الافتراضية
  network: {
    slowConnectionThreshold: 2, // Mbps
    fastConnectionThreshold: 10, // Mbps
    timeoutMultipliers: {
      'slow-2g': 4,
      '2g': 3,
      '3g': 2,
      '4g': 1,
      '5g': 0.8,
    },
    retryDelays: {
      initial: 1000,
      max: 30000,
      factor: 2,
    },
  },

  // إعدادات الـ UI الافتراضية
  ui: {
    defaultProgressDuration: 300, // ms
    skeletonAnimationDuration: 2000, // ms
    shimmerTypes: ['wave', 'pulse', 'scan', 'gradient', 'dots'],
    defaultVariant: 'primary',
    defaultSize: 'default',
  },

  // إعدادات الأداء
  performance: {
    maxHistorySize: 50,
    autoCleanupInterval: 30000, // ms
    lazyLoadThreshold: 0.1, // Intersection Observer threshold
    concurrentRequests: {
      'slow-2g': 1,
      '2g': 2,
      '3g': 4,
      '4g': 6,
      '5g': 8,
    },
  },

  // إعدادات الرسائل
  messages: {
    ar: {
      loading: 'جاري التحميل...',
      fetching: 'جاري جلب البيانات...',
      processing: 'جاري المعالجة...',
      saving: 'جاري الحفظ...',
      complete: 'تم بنجاح!',
      error: 'حدث خطأ',
      retry: 'إعادة المحاولة',
      cancel: 'إلغاء',
      timeout: 'انتهت مهلة التحميل',
      offline: 'غير متصل بالإنترنت',
    },
    en: {
      loading: 'Loading...',
      fetching: 'Fetching data...',
      processing: 'Processing...',
      saving: 'Saving...',
      complete: 'Complete!',
      error: 'An error occurred',
      retry: 'Retry',
      cancel: 'Cancel',
      timeout: 'Request timeout',
      offline: 'No internet connection',
    },
  },
}

// إعدادات المظهر / Theme Configuration
export const loadingTheme = {
  colors: {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    success: 'hsl(142 76% 36%)',
    warning: 'hsl(38 92% 50%)',
    error: 'hsl(0 84% 60%)',
    muted: 'hsl(var(--muted))',
  },
  
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
      slowest: 1000,
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
  },

  shadows: {
    subtle: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    normal: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    strong: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
}
```

## إعدادات React / React Configuration

### إعدادات Provider / Provider Setup

```tsx
// components/LoadingProvider.tsx
'use client'

import { LoadingProvider } from '@/components/ui/loading'
import { loadingConfig } from '@/config/loading'

export function AppLoadingProvider({ children }: { children: React.ReactNode }) {
  return (
    <LoadingProvider
      // يمكن تمرير إعدادات مخصصة هنا
      // customSettings={loadingConfig}
    >
      {children}
    </LoadingProvider>
  )
}
```

### إعدادات Next.js / Next.js Configuration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // إعدادات الصور المحسنة
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // إعدادات التوافق مع PWA
  experimental: {
    optimizeCss: true,
  },

  // إعدادات الأداء
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
```

## إعدادات CSS / CSS Configuration

### ملف الأنماط الرئيسي / Main Styles File

```css
/* styles/loading.css */

/* متغيرات CSS مخصصة */
:root {
  /* Loading Colors */
  --loading-primary: hsl(var(--primary));
  --loading-secondary: hsl(var(--secondary));
  --loading-success: hsl(142 76% 36%);
  --loading-warning: hsl(38 92% 50%);
  --loading-error: hsl(0 84% 60%);
  --loading-muted: hsl(var(--muted));

  /* Animation Durations */
  --loading-fast: 150ms;
  --loading-normal: 300ms;
  --loading-slow: 500ms;
  --loading-slowest: 1000ms;

  /* Shadows */
  --loading-shadow-subtle: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --loading-shadow-normal: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --loading-shadow-strong: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

  /* Border Radius */
  --loading-radius-sm: 4px;
  --loading-radius-md: 8px;
  --loading-radius-lg: 12px;
  --loading-radius-full: 9999px;
}

/* تحسينات الأداء */
.loading-skeleton {
  contain: layout style paint;
}

.loading-progress {
  contain: layout;
  will-change: width;
}

/* أنيميشن التوهج المحسن */
@keyframes shimmer-wave {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}

@keyframes shimmer-gradient {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

@keyframes shimmer-pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

@keyframes shimmer-scan {
  0% {
    transform: translateX(-100%) skewX(-20deg);
  }
  100% {
    transform: translateX(200%) skewX(-20deg);
  }
}

@keyframes shimmer-dots {
  0%, 20% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  80%, 100% {
    transform: scale(1);
  }
}

/* فئات المساعدة */
.loading-fade-enter {
  opacity: 0;
  transform: scale(0.95);
}

.loading-fade-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: opacity var(--loading-normal), transform var(--loading-normal);
}

.loading-fade-exit {
  opacity: 1;
  transform: scale(1);
}

.loading-fade-exit-active {
  opacity: 0;
  transform: scale(0.95);
  transition: opacity var(--loading-fast), transform var(--loading-fast);
}

/* تحسينات للشبكات البطيئة */
@media (prefers-reduced-motion: reduce) {
  .loading-skeleton {
    animation: none !important;
  }
  
  .loading-progress {
    transition: none !important;
  }
}

/* إعدادات للوضع المظلم */
@media (prefers-color-scheme: dark) {
  :root {
    --loading-muted: hsl(var(--muted-foreground));
  }
}

/* إعدادات للطباعة */
@media print {
  .loading-skeleton,
  .loading-progress,
  .loading-spinner {
    display: none !important;
  }
}
```

## إعدادات TypeScript / TypeScript Configuration

### ملف التعريفات / Definitions File

```typescript
// types/loading.ts

export interface LoadingConfig {
  network: NetworkConfig
  ui: UIConfig
  performance: PerformanceConfig
  messages: MessagesConfig
}

export interface NetworkConfig {
  slowConnectionThreshold: number
  fastConnectionThreshold: number
  timeoutMultipliers: Record<string, number>
  retryDelays: {
    initial: number
    max: number
    factor: number
  }
}

export interface UIConfig {
  defaultProgressDuration: number
  skeletonAnimationDuration: number
  shimmerTypes: string[]
  defaultVariant: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  defaultSize: 'sm' | 'default' | 'lg' | 'xl'
}

export interface PerformanceConfig {
  maxHistorySize: number
  autoCleanupInterval: number
  lazyLoadThreshold: number
  concurrentRequests: Record<string, number>
}

export interface MessagesConfig {
  ar: Record<string, string>
  en: Record<string, string>
}

// أنواع مخصصة للـ Loading State
export type LoadingVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error'
export type LoadingSize = 'sm' | 'default' | 'lg' | 'xl'
export type ShimmerType = 'wave' | 'pulse' | 'scan' | 'gradient' | 'dots'
export type LoadingType = 'initial' | 'fetching' | 'processing' | 'uploading' | 'downloading'
export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error' | 'cancelled'

// خيارات التكوين للمكونات
export interface ComponentOptions {
  variant?: LoadingVariant
  size?: LoadingSize
  shimmerType?: ShimmerType
  className?: string
  animationDuration?: number
  customMessages?: Record<string, string>
}

// إعدادات متقدمة للمكونات
export interface AdvancedOptions extends ComponentOptions {
  enableProgress?: boolean
  enableTiming?: boolean
  persistHistory?: boolean
  autoRetry?: boolean
  networkAware?: boolean
}
```

## إعدادات البيئة / Environment Configuration

### متغيرات البيئة / Environment Variables

```bash
# .env.local

# إعدادات عامة
NODE_ENV=development
NEXT_PUBLIC_APP_VERSION=1.0.0

# إعدادات التحميل
NEXT_PUBLIC_LOADING_TIMEOUT=10000
NEXT_PUBLIC_LOADING_RETRY_MAX=3
NEXT_PUBLIC_LOADING_LAZY_THRESHOLD=0.1

# إعدادات الشبكة
NEXT_PUBLIC_SLOW_CONNECTION_THRESHOLD=2
NEXT_PUBLIC_FAST_CONNECTION_THRESHOLD=10

# إعدادات الأداء
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_LOG_LEVEL=info

# إعدادات المظهر
NEXT_PUBLIC_DEFAULT_THEME=system
NEXT_PUBLIC_ENABLE_ANIMATIONS=true
```

### ملف الإعدادات للإنتاج / Production Config

```typescript
// config/production.ts
export const productionConfig = {
  loading: {
    timeout: parseInt(process.env.NEXT_PUBLIC_LOADING_TIMEOUT || '10000'),
    retryMax: parseInt(process.env.NEXT_PUBLIC_LOADING_RETRY_MAX || '3'),
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'warn',
  },
  
  network: {
    slowThreshold: parseInt(process.env.NEXT_PUBLIC_SLOW_CONNECTION_THRESHOLD || '2'),
    fastThreshold: parseInt(process.env.NEXT_PUBLIC_FAST_CONNECTION_THRESHOLD || '10'),
  },

  performance: {
    enableServiceWorker: true,
    enableCaching: true,
    enableCompression: true,
  },
}
```

## إعدادات الاختبار / Testing Configuration

### إعدادات Jest / Jest Setup

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/components/ui/loading/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
}

module.exports = createJestConfig(customJestConfig)
```

### إعداد الاختبارات / Test Setup

```javascript
// jest.setup.js
import '@testing-library/jest-dom'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null }
  disconnect() { return null }
  unobserve() { return null }
}

// Mock Network Information API
Object.defineProperty(navigator, 'connection', {
  value: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  },
  writable: true,
})

// Mock performance API
global.performance = {
  now: () => Date.now(),
}

// Suppress console warnings in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})
```

## إعدادات البناء / Build Configuration

### إعدادات Vite / Vite Setup (إذا كان المشروع يستخدم Vite)

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'loading-components': ['@/components/ui/loading'],
          'loading-hooks': ['@/hooks'],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      '@/components/ui/loading',
      '@/hooks/useLoadingState',
      '@/hooks/useNetworkDetection',
    ],
  },
})
```

## إعدادات النشر / Deployment Configuration

### إعدادات Vercel / Vercel Config

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/loading/(.*)",
      "dest": "/api/loading/$1"
    }
  ],
  "headers": [
    {
      "source": "/_next/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

هذه الإعدادات الشاملة تضمن تكوين وتخصيص نظام Loading States المحسن بشكل مثالي لكل بيئة ومتطلبات المشروع.