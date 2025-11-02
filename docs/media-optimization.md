# تحسين الصور والوسائط - Media Optimization Guide

## نظرة عامة
هذا الدليل يوضح جميع تحسينات الصور والوسائط المطبقة في تطبيق SocialPro لتحسين الأداء وتجربة المستخدم.

## المكونات المحسنة

### 1. OptimizedImage Component
```tsx
import { OptimizedImage } from '@/components/media'

<OptimizedImage
  src="/image.jpg"
  alt="وصف الصورة"
  width={400}
  height={300}
  quality={85}
  placeholder="blur"
  blurDataURL="data:image/svg+xml..."
  priority={false}
  loading="lazy"
  className="rounded-lg"
/>
```

**المميزات:**
- ✅ تحميل كسول (Lazy Loading)
- ✅ Placeholder ضبابي أثناء التحميل
- ✅ معالجة أخطاء التحميل
- ✅ تحسين جودة الصور
- ✅ دعم تنسيقات متعددة (AVIF, WebP, JPEG)
- ✅ Loading states محسنة

### 2. ResponsiveImage Component
```tsx
import { ResponsiveImage } from '@/components/media'

<ResponsiveImage
  src="/image.jpg"
  alt="صورة متجاوبة"
  aspectRatio="video"
  mobileSrc="/image-mobile.jpg"
  tabletSrc="/image-tablet.jpg"
  desktopSrc="/image-desktop.jpg"
  sizes={{
    mobile: '100vw',
    tablet: '75vw',
    desktop: '50vw'
  }}
/>
```

**المميزات:**
- ✅ صور متجاوبة لجميع الأجهزة
- ✅ تبديل مصادر الصور حسب حجم الشاشة
- ✅ Aspect ratios محددة مسبقاً
- ✅ تحسين عرض الشبكة

### 3. MediaGallery Component
```tsx
import { MediaGallery } from '@/components/media'

const images = [
  { src: "/img1.jpg", alt: "صورة 1" },
  { src: "/img2.jpg", alt: "صورة 2" },
  { src: "/img3.jpg", alt: "صورة 3" }
]

<MediaGallery
  images={images}
  columns={{ mobile: 1, tablet: 2, desktop: 3 }}
  gap={1}
  showLightbox={true}
  priority={["/img1.jpg"]}
/>
```

**المميزات:**
- ✅ عرض شبكي متجاوب
- ✅ Lightbox للصور المكبرة
- ✅ Lazy loading للصور
- ✅ تأثيرات hover محسنة
- ✅ Loading skeletons

### 4. MediaSkeleton Components
```tsx
import { MediaSkeleton, GallerySkeleton, TextSkeleton } from '@/components/media'

// skeleton صورة مفردة
<MediaSkeleton aspectRatio="square" className="w-full" />

// skeleton مجموعة صور
<GallerySkeleton count={6} columns={{ mobile: 1, tablet: 2, desktop: 3 }} />

// skeleton نص
<TextSkeleton lines={3} />
```

## تحسين الخطوط

### Next.js Font Optimization
```tsx
import { cairoFont, interFont, fontConfigs } from '@/components/media'

// في layout.tsx
export default function RootLayout({ children }) {
  return (
    <body className={cairoFont.className}>
      {children}
    </body>
  )
}
```

**التحسينات المطبقة:**
- ✅ تحميل الخطوط بـ `display: 'swap'`
- ✅ Preloading للخطوط الحرجة
- ✅ Fallback fonts محسنة
- ✅ CSS Variables للخطوط
- ✅ تحسين عرض النصوص العربية

### تكوينات الخطوط
```tsx
const fontConfigs = {
  cairo: {
    font: cairoFont,
    className: cairoFont.className,
    preload: true,
    fallback: ['system-ui', 'sans-serif']
  },
  inter: {
    font: interFont,
    className: interFont.className,
    preload: true,
    fallback: ['system-ui', 'sans-serif']
  }
}
```

## تحسين الصور

### ImageOptimization Utilities
```tsx
import { getOptimizedImageUrl, detectFormatSupport } from '@/components/media'

// الحصول على أفضل تنسيق مدعوم
const formats = detectFormatSupport()
// { webp: true, avif: false }

// إنشاء URL محسن
const optimizedUrl = getOptimizedImageUrl('/image.jpg', {
  quality: 85,
  format: 'auto',
  width: 800,
  height: 600
})
```

**الأنواع المدعومة:**
- ✅ AVIF (الأفضل للأداء)
- ✅ WebP (جيد للمتصفحات القديمة)
- ✅ JPEG (Fallback)
- ✅ PNG (للصور الشفافة)

### Progressive Image Loading
```tsx
import { ProgressiveImageLoader } from '@/components/media'

const loader = new ProgressiveImageLoader(
  '/low-quality.jpg', // صورة منخفضة الجودة
  '/high-quality.jpg', // صورة عالية الجودة
  (progress) => console.log(`Loading: ${progress}%`), // تتبع التقدم
  () => console.log('Completed!') // عند الانتهاء
)

loader.startLoading()
```

## تحسين الأداء

### MediaProvider
```tsx
import { MediaProvider } from '@/components/media'

export default function RootLayout({ children }) {
  return (
    <MediaProvider
      criticalImages={['/hero.jpg', '/logo.png']}
      enablePreloading={true}
    >
      {children}
    </MediaProvider>
  )
}
```

**المميزات:**
- ✅ Preloading للخطوط الحرجة
- ✅ تحديد دعم تنسيقات الصور
- ✅ تحميل الصور المهمة مسبقاً
- ✅ إدارة حالة التحميل

### Image Compression
```tsx
import { compressImage } from '@/components/media'

// ضغط الصورة على جانب العميل
const compressedFile = await compressImage(file, {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  format: 'webp'
})
```

## Next.js Configuration

### تحسينات مطبقة في next.config.ts:
```typescript
images: {
  formats: ['image/avif', 'image/webp'], // تنسيقات حديثة
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // أحجام شاشات
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // أحجام صور
  remotePatterns: [ /* أنماط الصور الخارجية */ ],
},
compress: true, // ضغط تلقائي
```

## تحسينات CSS

### Animations محسنة:
```css
/* Shimmer animation للصور المحملة */
@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

/* Progressive loading */
.progressive-image__img {
  transition: opacity 0.3s;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-shimmer { animation: none; }
  .image-blur-placeholder { transition: none; }
}
```

## إرشادات الاستخدام

### 1. للصور العادية:
```tsx
<OptimizedImage
  src="/image.jpg"
  alt="وصف الصورة"
  width={400}
  height={300}
  quality={75}
  placeholder="blur"
/>
```

### 2. للصور المتجاوبة:
```tsx
<ResponsiveImage
  src="/image.jpg"
  alt="صورة متجاوبة"
  aspectRatio="video"
  className="rounded-lg"
/>
```

### 3. لمجموعات الصور:
```tsx
<MediaGallery
  images={imageArray}
  columns={{ mobile: 1, tablet: 2, desktop: 4 }}
  showLightbox={true}
  priority={['/featured.jpg']}
/>
```

### 4. للحالات التي تحتاج تحميل:
```tsx
<MediaSkeleton aspectRatio="square" />
<TextSkeleton lines={4} />
```

## نصائح الأداء

### ✅ افعل:
- استخدم `quality` أقل للصور العامة (60-75)
- استخدم `priority={true}` للصور Above-the-fold
- طبق `placeholder="blur"` للصور الكبيرة
- استخدم `sizes` مخصصة للشبكات المعقدة
- فعّل Preloading للصور الحرجة

### ❌ تجنب:
- الصور الكبيرة بدون تحسين
- استخدام `priority={true}` لكل الصور
- عدم توفير `alt` text
- الصور بدون `width` و `height`
- استخدام `loading="eager"` بدون ضرورة

## نتائج التحسين

### 📊 مقاييس الأداء المتوقعة:
- **FCP (First Contentful Paint)**: تحسن بنسبة 20-30%
- **LCP (Largest Contentful Paint)**: تحسن بنسبة 25-40%
- **CLS (Cumulative Layout Shift)**: تحسن بنسبة 15-25%
- **Bandwidth usage**: تقليل بنسبة 40-60%
- **Loading time**: تحسن بنسبة 30-50%

### 🔧 أدوات المراقبة:
- Lighthouse CI
- Web Vitals
- Image optimization metrics
- Font loading metrics

## توثيق إضافي
- [Next.js Image Documentation](https://nextjs.org/docs/api-reference/components/image)
- [Web Performance Best Practices](https://web.dev/performance/)
- [Image Format Comparison](https://caniuse.com/avif)
- [Font Loading Optimization](https://web.dev/optimize-webfont-loading/)