'use client'

import { 
  OptimizedImage, 
  ResponsiveImage, 
  MediaGallery, 
  MediaSkeleton,
  GallerySkeleton,
  TextSkeleton,
  useMediaOptimization 
} from '@/components/media'
import { useState } from 'react'

// مثال على استخدام المكونات المحسنة
export function MediaOptimizationExample() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { isLoading, fontsLoaded } = useMediaOptimization()

  // صور عينة للاستخدام
  const sampleImages = [
    {
      src: '/sample-1.jpg',
      alt: 'صورة عينة 1',
      width: 400,
      height: 300,
      blurDataURL: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmM2Y0ZjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+'
    },
    {
      src: '/sample-2.jpg', 
      alt: 'صورة عينة 2',
      width: 400,
      height: 300,
      blurDataURL: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImIiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmNGY1ZjUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWMiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2IpIi8+PC9zdmc+'
    },
    {
      src: '/sample-3.jpg',
      alt: 'صورة عينة 3',
      width: 400,
      height: 300,
      blurDataURL: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImMiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmNGY1ZjQiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2MpIi8+PC9zdmc+'
    }
  ]

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">تحسين الوسائط</h2>
          <TextSkeleton lines={2} className="max-w-md mx-auto" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <GallerySkeleton count={6} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* العنوان */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          تحسين الصور والوسائط
        </h1>
        <p className="text-gray-600">
          مثال على استخدام المكونات المحسنة لتحسين الأداء
        </p>
      </div>

      {/* OptimizedImage Example */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">صورة محسنة فردية</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleImages.map((image, index) => (
            <div key={index} className="space-y-2">
              <OptimizedImage
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                quality={75}
                placeholder="blur"
                blurDataURL={image.blurDataURL}
                className="rounded-lg shadow-md"
                onLoad={() => console.log(`Image ${index + 1} loaded`)}
                onError={() => console.error(`Image ${index + 1} failed`)}
              />
              <p className="text-sm text-gray-600 text-center">{image.alt}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ResponsiveImage Example */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">صورة متجاوبة</h2>
        <div className="max-w-2xl mx-auto">
          <ResponsiveImage
            src="/hero-image.jpg"
            alt="صورة رئيسية متجاوبة"
            aspectRatio="video"
            className="rounded-lg shadow-lg"
            priority={true}
          />
        </div>
      </section>

      {/* MediaGallery Example */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">معرض صور</h2>
        <MediaGallery
          images={sampleImages}
          columns={{ mobile: 1, tablet: 2, desktop: 3 }}
          gap={4}
          showLightbox={true}
          priority={[sampleImages[0].src]}
          className="max-w-4xl mx-auto"
        />
      </section>

      {/* Loading States Example */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">حالات التحميل</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <MediaSkeleton aspectRatio="square" className="w-full h-48" />
            <TextSkeleton lines={2} />
          </div>
          <div className="space-y-2">
            <MediaSkeleton aspectRatio="video" className="w-full h-48" />
            <TextSkeleton lines={3} />
          </div>
          <div className="space-y-2">
            <MediaSkeleton aspectRatio="wide" className="w-full h-48" />
            <TextSkeleton lines={1} />
          </div>
          <div className="space-y-2">
            <MediaSkeleton aspectRatio="tall" className="w-full h-48" />
            <TextSkeleton lines={4} />
          </div>
        </div>
      </section>

      {/* Advanced Features Example */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">ميزات متقدمة</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">التحسينات المطبقة:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  تحميل كسول للصور
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Placeholder ضبابي
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  تحسين جودة الصور
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  دعم تنسيقات متعددة
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  تخطيط متجاوب
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium">نتائج الأداء:</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>تحسن FCP</span>
                    <span className="text-green-600">+25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>تحسن LCP</span>
                    <span className="text-green-600">+35%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>توفير bandwidth</span>
                    <span className="text-green-600">+50%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default MediaOptimizationExample