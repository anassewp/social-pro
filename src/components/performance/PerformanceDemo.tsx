'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { 
  VirtualList, 
  ProgressiveLoader, 
  DebouncedInput, 
  LazyImage,
  PerformanceMonitor 
} from '@/components/performance'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// مثال على البيانات الوهمية
const generateMockData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `عنصر رقم ${i + 1}`,
    description: `وصف تفصيلي للعنصر رقم ${i + 1}`,
    image: `https://picsum.photos/300/200?random=${i + 1}`,
    date: new Date(2025, 0, 1 + i).toLocaleDateString('ar-SA')
  }))
}

// مكون عنصر القائمة الافتراضي
const VirtualListItem = ({ item, index }: { item: any, index: number }) => (
  <Card className="mb-2">
    <CardContent className="p-4">
      <div className="flex items-center gap-4">
        <LazyImage
          src={item.image}
          alt={item.title}
          className="w-16 h-16 rounded object-cover"
          placeholder={<div className="w-16 h-16 bg-gray-200 rounded animate-pulse" />}
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{item.title}</h3>
          <p className="text-sm text-gray-600">{item.description}</p>
          <p className="text-xs text-gray-400 mt-1">{item.date}</p>
        </div>
        <Button variant="outline" size="sm">
          عرض التفاصيل
        </Button>
      </div>
    </CardContent>
  </Card>
)

// مكون عنصر القائمة التدريجية
const ProgressiveItem = ({ item }: { item: any }) => (
  <div className="flex items-center gap-3 p-3 border-b border-gray-200 hover:bg-gray-50">
    <LazyImage
      src={item.image}
      alt={item.title}
      className="w-12 h-12 rounded object-cover"
    />
    <div className="flex-1">
      <h4 className="font-medium">{item.title}</h4>
      <p className="text-sm text-gray-600 truncate">{item.description}</p>
    </div>
  </div>
)

// الصفحة الرئيسية للمثال
export default function PerformanceDemo() {
  const [searchTerm, setSearchTerm] = useState('')
  const [allData, setAllData] = useState(() => generateMockData(1000))
  const [displayData, setDisplayData] = useState(() => generateMockData(50))
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  // معالجة البحث
  const handleSearch = useCallback((query: string) => {
    setSearchTerm(query)
    
    // محاكاة البحث
    if (query.trim()) {
      const filtered = allData.filter(item => 
        item.title.includes(query) || 
        item.description.includes(query)
      )
      setDisplayData(filtered.slice(0, 50))
      setHasMore(filtered.length > 50)
    } else {
      setDisplayData(generateMockData(50))
      setHasMore(true)
    }
    setPage(1)
  }, [allData])

  // تحميل المزيد
  const loadMoreData = useCallback(async () => {
    setLoading(true)
    
    // محاكاة استدعاء API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newPage = page + 1
    const startIndex = newPage * 50
    const endIndex = startIndex + 50
    
    if (searchTerm.trim()) {
      const filtered = allData.filter(item => 
        item.title.includes(searchTerm) || 
        item.description.includes(searchTerm)
      )
      const newItems = filtered.slice(startIndex, endIndex)
      setDisplayData(prev => [...prev, ...newItems])
      setHasMore(endIndex < filtered.length)
    } else {
      const newItems = generateMockData(50).map((item, i) => ({
        ...item,
        id: (page * 50) + i
      }))
      setDisplayData(prev => [...prev, ...newItems])
      setHasMore(newPage < 20)
    }
    
    setPage(newPage)
    setLoading(false)
  }, [page, searchTerm, allData])

  // توليد عناصر القائمة الافتراضية
  const renderVirtualItem = useCallback((item: any, index: number) => (
    <VirtualListItem item={item} index={index} />
  ), [])

  // توليد عناصر القائمة التدريجية
  const renderProgressiveItem = useCallback((item: any, index: number) => (
    <ProgressiveItem item={item} />
  ), [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* مراقب الأداء */}
      <PerformanceMonitor 
        onMetrics={(metrics) => {
          console.log('مؤشرات الأداء:', metrics)
        }}
      />
      
      <div className="max-w-6xl mx-auto space-y-8">
        {/* العنوان */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            عرض المكونات المحسنة للأداء
          </h1>
          <p className="text-gray-600">
            استعرض جميع المكونات المحسنة الجديدة
          </p>
        </div>

        {/* البحث */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">البحث في البيانات</h2>
            <DebouncedInput
              placeholder="ابحث في العناوين والأوصاف..."
              onChange={handleSearch}
              delay={300}
              className="w-full max-w-md"
            />
            <p className="text-sm text-gray-500 mt-2">
              البحث مع تأخير 300ms لتحسين الأداء
            </p>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* القائمة الافتراضية */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                القائمة الافتراضية (Virtual List)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                عرض 1000 عنصر بكفاءة عالية
              </p>
              <div className="border rounded-lg overflow-hidden">
                <VirtualList
                  items={displayData}
                  itemHeight={120}
                  height={400}
                  renderItem={renderVirtualItem}
                  className="bg-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* القائمة التدريجية */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                القائمة التدريجية (Progressive Loading)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                تحميل البيانات عند الحاجة
              </p>
              <div className="border rounded-lg overflow-hidden">
                <ProgressiveLoader
                  data={displayData}
                  pageSize={10}
                  loadMore={loadMoreData}
                  renderItem={renderProgressiveItem}
                  hasMore={hasMore}
                  isLoading={loading}
                  className="bg-white max-h-96 overflow-y-auto"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* إحصائيات */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">إحصائيات الأداء</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {displayData.length}
                </div>
                <div className="text-sm text-gray-600">عنصر معروض</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {allData.length}
                </div>
                <div className="text-sm text-gray-600">إجمالي العناصر</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {searchTerm ? 'مُفعل' : 'معطل'}
                </div>
                <div className="text-sm text-gray-600">البحث</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {hasMore ? 'نعم' : 'لا'}
                </div>
                <div className="text-sm text-gray-600">تحميل إضافي</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* التعليمات */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">كيفية الاستخدام</h2>
            <div className="space-y-2 text-sm">
              <p>• <strong>DebouncedInput:</strong> استخدم للبحث والترشيح مع تأخير مخصص</p>
              <p>• <strong>VirtualList:</strong> للقوائم الكبيرة (1000+ عنصر)</p>
              <p>• <strong>ProgressiveLoader:</strong> لتحميل البيانات تدريجياً</p>
              <p>• <strong>LazyImage:</strong> للصور الكبيرة مع تحميل كسول</p>
              <p>• <strong>PerformanceMonitor:</strong> لمراقبة الأداء في وضع التطوير</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}