# Loading States Optimization Documentation
# توثيق تحسين حالات التحميل

## نظرة عامة / Overview

تم تطوير نظام متقدم لحالات التحميل يوفر تجربة مستخدم محسنة مع دعم للشبكات المتغيرة والـ retry mechanisms الذكية.

## المكونات المطورة / Developed Components

### 1. Progress Indicators / مؤشرات التقدم

```tsx
import { ProgressIndicator, CircularProgress, AnimatedProgressBar } from '@/components/ui/loading'

// Linear Progress
<ProgressIndicator
  progress={75}
  status="جاري التحميل..."
  type="linear"
  variant="primary"
  size="default"
/>

// Circular Progress
<CircularProgress
  progress={60}
  size={120}
  strokeWidth={8}
  label="تحميل"
  subLabel="البيانات"
/>

// Steps Progress
<ProgressIndicator
  type="steps"
  steps={5}
  currentStep={3}
  stepLabels={['تحضير', 'تحميل', 'معالجة', 'حفظ', 'اكتمل']}
/>

// Infinite Progress
<ProgressIndicator
  type="infinite"
  status="جاري المعالجة..."
  variant="primary"
/>
```

#### المميزات / Features:
- **أنواع متعددة**: Linear, Circular, Steps, Infinite
- **مؤشرات بصرية**: Progress bars, spinners, dots
- **دعم الرسائل**: Status messages باللغة العربية
- **خيارات التخصيص**: Colors, sizes, animations

### 2. Shimmer Effects / تأثيرات التوهج

```tsx
import { ShimmerEffect, CardSkeleton, ListSkeleton, TableSkeleton } from '@/components/ui/loading'

// Basic Shimmer
<ShimmerEffect
  type="gradient"
  width="100%"
  height={200}
  duration={2000}
/>

// Card Skeleton
<CardSkeleton
  type="article"
  count={3}
  shimmerType="wave"
  showAdvanced
/>

// List Skeleton
<ListSkeleton
  items={5}
  showAvatar={true}
  showActions={true}
/>

// Table Skeleton
<TableSkeleton
  rows={10}
  columns={4}
  shimmerType="scan"
  showProgress={true}
  loadedItems={7}
  totalItems={10}
/>
```

#### أنواع الـ Shimmer:
- **Wave**: موجة متحركة من اليسار لليمين
- **Pulse**: نبضات متتالية للتوهج
- **Scan**: مسح سريع عبر العنصر
- **Gradient**: تدرج لوني متحرك
- **Dots**: نقاط متحركة للإشارة

### 3. Adaptive Loading / التحميل التكيفي

```tsx
import { AdaptiveLoading, SmartImageLoader, NetworkQualityIndicator } from '@/components/ui/loading'

// Network-aware loading
<AdaptiveLoading
  isLoading={isLoading}
  error={error}
  onRetry={retry}
  priority="high"
  contentType="data"
  expectedDataSize={1024*1024}
  lazyLoad={true}
/>

// Smart image loading
<SmartImageLoader
  src="/path/to/image.jpg"
  alt="وصف الصورة"
  priority="high"
  lazyLoad={true}
/>

// Network indicator
<NetworkQualityIndicator />
```

#### مميزات التكييف:
- **كشف الشبكة**: معرفة نوع الاتصال (2G, 3G, 4G, 5G)
- **تحسين تلقائي**: تعديل سلوك التحميل حسب سرعة الاتصال
- **حفظ البيانات**: دعم وضع Save Data
- **تحميل مؤجل**: Lazy loading للمحتوى غير المرئي

### 4. Card and Table Loaders / محملات البطاقات والجداول

```tsx
import { CardLoader, TableLoader, DashboardGridLoader } from '@/components/ui/loading'

// Article cards
<CardLoader
  type="article"
  count={6}
  showImage={true}
  shimmerType="gradient"
  size="default"
/>

// Data table
<TableLoader
  rows={15}
  columns={6}
  showHeader={true}
  showSearch={true}
  showFilters={true}
  showProgress={true}
  loadedItems={12}
  totalItems={15}
/>

// Dashboard layout
<DashboardGridLoader
  stats={4}
  charts={2}
  lists={3}
/>
```

#### أنواع البطاقات:
- **Article**: بطاقات المقالات مع صورة ونص
- **Product**: بطاقات المنتجات مع سعر وأزرار
- **Profile**: بطاقات الملفات الشخصية
- **Stats**: بطاقات الإحصائيات
- **Chart**: بطاقات الرسوم البيانية

### 5. Context-aware Loading States / حالات التحميل المدركة للسياق

```tsx
import { 
  LoadingProvider, 
  SmartLoadingWrapper, 
  PageLoadingIndicator,
  useLoadingState 
} from '@/components/ui/loading'

// Provider setup
<LoadingProvider>
  <App />
</LoadingProvider>

// Page indicator
<PageLoadingIndicator page="dashboard" />

// Smart wrapper
<SmartLoadingWrapper
  id="user-data"
  type="data"
  showProgress={true}
  autoHide={true}
>
  <UserDashboard />
</SmartLoadingWrapper>

// Hook usage
const { startLoading, completeLoading, isLoading } = useLoadingState('user-profile')
```

#### مميزات السياق:
- **إدارة مركزية**: حالة التحميل لجميع التطبيق
- **مؤشرات ذكية**: مؤشرات متقدمة للصفحات والأقسام
- **تنظيف تلقائي**: إزالة الحالات القديمة تلقائياً
- **تتبع زمني**: قياس وقت التحميل

### 6. Retry Mechanisms / آليات إعادة المحاولة

```tsx
import { 
  useRetryableOperation, 
  RetryableComponent, 
  NetworkAwareRetry 
} from '@/components/ui/loading'

// Hook usage
const { execute, retry, state } = useRetryableOperation(
  async () => fetchData(),
  {
    maxRetries: 3,
    initialDelay: 1000,
    backoffFactor: 2,
    maxDelay: 30000
  }
)

// Component wrapper
<RetryableComponent
  operation={fetchData}
  config={{ maxRetries: 5 }}
  showAttemptDetails={true}
  showCountdown={true}
  autoRetry={false}
>
  <DataComponent />
</RetryableComponent>

// Network-aware retry
<NetworkAwareRetry
  operation={fetchData}
  config={{ maxRetries: 3 }}
>
  <NetworkDependentComponent />
</NetworkAwareRetry>
```

#### مميزات إعادة المحاولة:
- **خوارزمية Exponential Backoff**: زيادة تدريجية للانتظار
- **كشف الأخطاء**: تحديد الأخطاء القابلة للإعادة
- **تكامل الشبكة**: التكيف مع حالة الاتصال
- **واجهة بصرية**: عرض تقدم المحاولات

## Hooks المطورة / Developed Hooks

### 1. useAdaptiveLoading

```tsx
import { useAdaptiveLoading } from '@/hooks/useAdaptiveLoading'

const { 
  isLoading, 
  progress, 
  stage, 
  networkInfo, 
  execute, 
  retry, 
  isSlowConnection 
} = useAdaptiveLoading(
  async () => {
    // Your async operation
    return await fetchData()
  },
  {
    progressive: true,
    lazy: true,
    timeout: 10000,
    autoRetry: true,
    priority: 'high'
  }
)
```

#### الخيارات:
- **progressive**: تفعيل التحميل التدريجي
- **lazy**: تحميل مؤجل للمحتوى غير المرئي
- **timeout**: مهلة التحميل التكيفية
- **autoRetry**: إعادة المحاولة التلقائية
- **respectSaveData**: احترام إعدادات حفظ البيانات

### 2. useLoadingState

```tsx
import { useLoadingState } from '@/hooks/useLoadingState'

const {
  isLoading,
  isSuccess,
  isError,
  progress,
  message,
  startLoading,
  updateProgress,
  completeLoading,
  setError
} = useLoadingState('my-operation', {
  defaultMessage: 'جاري التحميل...',
  enableProgress: true,
  advancedMessages: true,
  enableTiming: true
})
```

#### المميزات:
- **رسائل متقدمة**: رسائل مختلفة حسب نوع التحميل
- **قياس التقدم**: تتبع نسبة الإنجاز
- **قياس الزمن**: تسجيل وقت التنفيذ
- **تاريخ العمليات**: حفظ سجل العمليات

### 3. useNetworkDetection

```tsx
import { useNetworkDetection } from '@/hooks/useNetworkDetection'

const {
  networkInfo,
  quality,
  isSlowConnection,
  isFastConnection,
  shouldOptimizeForBandwidth,
  getRecommendedSettings
} = useNetworkDetection({
  onSlowConnection: () => console.log('اتصال بطيء'),
  onFastConnection: () => console.log('اتصال سريع'),
  onQualityChange: (quality) => console.log('تغيير جودة الشبكة', quality)
})
```

#### المعلومات المتاحة:
- **نوع الاتصال**: 2G, 3G, 4G, 5G
- **سرعة التحميل**: Downlink Mbps
- **زمن الاستجابة**: RTT milliseconds
- **حفظ البيانات**: Save Data status
- **جودة الشبكة**: Excellent, Good, Fair, Poor

## أمثلة التطبيق / Implementation Examples

### مثال 1: تحميل البيانات مع Progress

```tsx
import { useLoadingState, ProgressIndicator } from '@/components/ui/loading'

function DataComponent() {
  const {
    isLoading,
    progress,
    message,
    startLoading,
    updateProgress,
    completeLoading
  } = useLoadingState('data-fetch')

  const fetchData = async () => {
    startLoading('fetching', 'جاري جلب البيانات...')
    
    try {
      updateProgress(30, 'جاري الاتصال بالخادم...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      updateProgress(60, 'جاري تحميل البيانات...')
      const response = await fetch('/api/data')
      
      updateProgress(90, 'جاري معالجة البيانات...')
      const data = await response.json()
      
      completeLoading('تم تحميل البيانات بنجاح!')
      return data
    } catch (error) {
      setError(error as Error)
    }
  }

  return (
    <div>
      {isLoading && (
        <ProgressIndicator
          progress={progress}
          status={message}
          variant="primary"
        />
      )}
      <button onClick={fetchData}>
        تحميل البيانات
      </button>
    </div>
  )
}
```

### مثال 2: تحميل الصور التكيفي

```tsx
import { SmartImageLoader, useNetworkDetection } from '@/components/ui/loading'

function ImageGallery() {
  const { shouldUseHighQuality, isSlowConnection } = useNetworkDetection()

  const images = [
    { id: 1, src: '/image1.jpg', alt: 'صورة 1' },
    { id: 2, src: '/image2.jpg', alt: 'صورة 2' },
    { id: 3, src: '/image3.jpg', alt: 'صورة 3' }
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map(image => (
        <SmartImageLoader
          key={image.id}
          src={isSlowConnection ? `${image.src}?quality=low` : image.src}
          alt={image.alt}
          priority={shouldUseHighQuality() ? 'high' : 'low'}
          lazyLoad={true}
        />
      ))}
    </div>
  )
}
```

### مثال 3: جدول مع Skeleton Loading

```tsx
import { TableSkeleton } from '@/components/ui/loading'

function UsersTable({ users, isLoading }) {
  if (isLoading) {
    return (
      <TableSkeleton
        rows={10}
        columns={4}
        showHeader={true}
        shimmerType="gradient"
      />
    )
  }

  return (
    <table className="w-full border">
      <thead>
        <tr>
          <th className="border p-2">الاسم</th>
          <th className="border p-2">البريد الإلكتروني</th>
          <th className="border p-2">الحالة</th>
          <th className="border p-2">الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td className="border p-2">{user.name}</td>
            <td className="border p-2">{user.email}</td>
            <td className="border p-2">{user.status}</td>
            <td className="border p-2">
              <button>تعديل</button>
              <button>حذف</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### مثال 4: نظام إعادة المحاولة الذكي

```tsx
import { RetryableComponent, NetworkAwareRetry } from '@/components/ui/loading'

function ApiComponent() {
  const fetchApiData = async () => {
    const response = await fetch('/api/data')
    if (!response.ok) {
      throw new Error('NETWORK_ERROR')
    }
    return response.json()
  }

  return (
    <NetworkAwareRetry
      operation={fetchApiData}
      config={{
        maxRetries: 3,
        initialDelay: 1000,
        backoffFactor: 2,
        retryableErrors: ['NETWORK_ERROR', 'TIMEOUT']
      }}
    >
      <div className="p-6 border rounded-lg">
        <h3>بيانات API</h3>
        <p>هذا المحتوى يتم تحميله من الخادم</p>
      </div>
    </NetworkAwareRetry>
  )
}
```

## إعدادات التخصيص / Customization Options

### ألوان المظهر
```css
/* Custom CSS variables */
:root {
  --loading-primary: #3b82f6;
  --loading-secondary: #64748b;
  --loading-success: #10b981;
  --loading-warning: #f59e0b;
  --loading-error: #ef4444;
}
```

### إعدادات الشبكة المخصصة
```tsx
const customNetworkConfig = {
  slowConnectionThreshold: 2, // Mbps
  fastConnectionThreshold: 10, // Mbps
  timeoutMultiplier: {
    'slow-2g': 4,
    '2g': 3,
    '3g': 2,
    '4g': 1,
    '5g': 0.8
  }
}
```

### إعدادات الـ Animation
```css
/* Custom animations */
@keyframes custom-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

@keyframes custom-pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}
```

## أفضل الممارسات / Best Practices

### 1. استخدم السياق المناسب
```tsx
// ✅ جيد: استخدام النوع المناسب
<LoadingProvider>
  <SmartLoadingWrapper id="user-data" type="data">
    <UserProfile />
  </SmartLoadingWrapper>
</LoadingProvider>

// ❌ سيء: استخدام loading عام
<div>Loading...</div>
```

### 2. تحسين الأداء
```tsx
// ✅ جيد: lazy loading للصور
<SmartImageLoader src="/large-image.jpg" lazyLoad={true} />

// ✅ جيد:自适应 loading
<AdaptiveLoading
  priority={networkInfo.effectiveType === '2g' ? 'low' : 'high'}
/>

// ❌ سيء: تحميل فوري لجميع الصور
<img src="/large-image.jpg" />
```

### 3. معالجة الأخطاء
```tsx
// ✅ جيد: retry mechanism شامل
<RetryableComponent
  operation={fetchData}
  config={{ maxRetries: 3 }}
  showAttemptDetails={true}
/>

// ❌ سيء: معالجة بسيطة
try {
  await fetchData()
} catch (error) {
  console.error(error)
}
```

### 4. تجربة المستخدم
```tsx
// ✅ جيد: رسائل واضحة
<ProgressIndicator
  progress={50}
  status="جاري تحميل الصور... 5 من 10"
  variant="primary"
/>

// ❌ سيء: رسائل عامة
<div>Loading...</div>
```

## الأداء والتحسين / Performance & Optimization

### 1. تحسين الـ Bundle Size
- استيراد المكونات المطلوبة فقط
- استخدام tree shaking
- تقليل الـ dependencies

### 2. تحسين الذاكرة
- تنظيف الـ intervals تلقائياً
- إزالة الـ event listeners
- إدارة الـ state بذكاء

### 3. تحسين الأداء
- استخدام Intersection Observer للـ lazy loading
- تطبيق progressive loading
- تحسين الـ animations

### 4. تحسين تجربة المستخدم
- استخدام skeleton screens بدلاً من spinners
- إضافة feedback فوري
- تطبيق retry mechanisms ذكية

## الاختبار / Testing

### Unit Tests
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ProgressIndicator } from '@/components/ui/loading'

test('progress indicator shows correct percentage', () => {
  render(<ProgressIndicator progress={75} />)
  expect(screen.getByText('75%')).toBeInTheDocument()
})
```

### Integration Tests
```tsx
import { render, screen } from '@testing-library/react'
import { LoadingProvider } from '@/components/ui/loading'

test('loading context provides state correctly', () => {
  render(
    <LoadingProvider>
      <TestComponent />
    </LoadingProvider>
  )
  // Test loading context functionality
})
```

## الخلاصة / Summary

تم تطوير نظام شامل ومتقدم لحالات التحميل يوفر:

1. **مكونات متنوعة**: Progress indicators, Shimmer effects, Adaptive loading
2. **آليات ذكية**: Retry mechanisms, Context-aware states, Network detection
3. **أداء محسن**: Lazy loading, Progressive loading, Memory management
4. **تجربة مستخدم متميزة**: رسائل واضحة، feedback فوري، معالجة أخطاء شاملة
5. **دعم شامل للشبكات**: تكيف مع جميع أنواع الاتصال، دعم Save Data

النظام قابل للتوسع والتخصيص ويوفر واجهة برمجية واضحة وسهلة الاستخدام للمطورين.