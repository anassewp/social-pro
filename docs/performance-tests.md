# اختبارات الأداء - Performance Tests

## نظرة عامة
هذا الملف يحتوي على اختبارات الأداء للمكونات المحسنة في التطبيق.

## اختبارات DebouncedInput

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DebouncedInput } from '@/components/performance'

describe('DebouncedInput', () => {
  test('يجب أن يستدعي onChange بعد التأخير المحدد', async () => {
    const onChange = jest.fn()
    render(<DebouncedInput onChange={onChange} delay={300} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test' } })
    
    expect(onChange).not.toHaveBeenCalled()
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('test')
    }, { timeout: 500 })
  })
})
```

## اختبارات VirtualList

```typescript
import { render } from '@testing-library/react'
import { VirtualList } from '@/components/performance'

describe('VirtualList', () => {
  test('يجب أن يعرض العناصر المرئية فقط', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      title: `Item ${i}`
    }))
    
    const { container } = render(
      <VirtualList
        items={items}
        itemHeight={50}
        height={400}
        renderItem={(item) => <div key={item.id}>{item.title}</div>}
      />
    )
    
    const visibleElements = container.querySelectorAll('.virtual-list-item')
    expect(visibleElements.length).toBeLessThan(100) // فقط العناصر المرئية
  })
})
```

## اختبارات ProgressiveLoader

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { ProgressiveLoader } from '@/components/performance'

describe('ProgressiveLoader', () => {
  test('يجب أن يعرض زر "عرض المزيد" عندما يوجد المزيد', () => {
    const items = Array.from({ length: 20 }, (_, i) => ({ id: i, title: `Item ${i}` }))
    
    render(
      <ProgressiveLoader
        data={items}
        pageSize={10}
        loadMore={jest.fn()}
        renderItem={(item) => <div key={item.id}>{item.title}</div>}
        hasMore={true}
      />
    )
    
    expect(screen.getByText('عرض المزيد')).toBeInTheDocument()
  })
})
```

## اختبارات LazyImage

```typescript
import { render, screen } from '@testing-library/react'
import { LazyImage } from '@/components/performance'

describe('LazyImage', () => {
  test('يجب أن يعرض placeholder قبل التحميل', () => {
    render(
      <LazyImage
        src="/test.jpg"
        alt="Test image"
        className="w-20 h-20"
      />
    )
    
    expect(screen.getByTestId('lazy-image-placeholder')).toBeInTheDocument()
  })
})
```

## اختبارات usePerformance Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { useDebounce, useLocalStorage } from '@/hooks/usePerformance'

describe('useDebounce', () => {
  test('يجب أن يعيد القيمة بعد التأخير', async () => {
    const { result } = renderHook(() => useDebounce('initial', 300))
    
    expect(result.current).toBe('initial')
    
    act(() => {
      // تحديث القيمة في الاختبار الحقيقي
    })
    
    await waitFor(() => {
      expect(result.current).toBe('updated')
    })
  })
})
```

## اختبارات الأداء

### قياس Core Web Vitals

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function measureWebVitals() {
  getCLS(console.log)
  getFID(console.log)
  getFCP(console.log)
  getLCP(console.log)
  getTTFB(console.log)
}
```

### اختبار virtualization

```typescript
export function testVirtualization() {
  const items = Array.from({ length: 10000 }, (_, i) => ({ id: i }))
  const itemHeight = 50
  const containerHeight = 400
  
  const visibleItemsCount = Math.ceil(containerHeight / itemHeight) * 2 // overscan
  const totalRendered = visibleItemsCount + 10 // tolerance
  
  expect(totalRendered).toBeLessThan(100) // يجب أن يكون أقل من 100 عنصر
}
```

### اختبار debouncing

```typescript
export function testDebouncing() {
  const onChange = jest.fn()
  const { rerender } = render(<DebouncedInput onChange={onChange} delay={300} />)
  
  // تغيير القيمة عدة مرات بسرعة
  for (let i = 0; i < 5; i++) {
    rerender(<DebouncedInput onChange={onChange} delay={300} value={`value-${i}`} />)
  }
  
  // يجب أن يتم استدعاء onChange مرة واحدة فقط
  expect(onChange).toHaveBeenCalledTimes(1)
}
```

## اختبارات الذاكرة

```typescript
export function testMemoryLeaks() {
  const { unmount } = render(<VirtualList items={largeDataSet} />)
  
  // إلغاء تحميل المكون
  unmount()
  
  // التحقق من عدم وجود memory leaks
  expect((window as any).memoryInfo).toBeUndefined()
}
```

## اختبارات الأداء المقارنة

```typescript
export async function performanceComparison() {
  // اختبار الأداء مع VirtualList
  const startVirtual = performance.now()
  render(<VirtualList items={largeDataSet} />)
  const endVirtual = performance.now()
  
  // اختبار الأداء مع القائمة العادية
  const startRegular = performance.now()
  render(<div>{largeDataSet.map(item => <div key={item.id}>{item.title}</div>)}</div>)
  const endRegular = performance.now()
  
  expect(endVirtual - startVirtual).toBeLessThan(endRegular - startRegular)
}
```

## أوامر التشغيل

```bash
# تشغيل جميع اختبارات الأداء
npm run test:performance

# تشغيل اختبار معين
npm test -- --testNamePattern="DebouncedInput"

# تشغيل الاختبارات مع تقرير الأداء
npm test -- --coverage --verbose
```

## معايير النجاح

- ✅ VirtualList يجب أن يكون أسرع من القائمة العادية بنسبة 70%
- ✅ DebouncedInput يجب أن يقلل الاستدعاءات بنسبة 90%
- ✅ LazyImage يجب أن يقلل استهلاك الشبكة بنسبة 80%
- ✅ ProgressiveLoader يجب أن يحسن تجربة المستخدم
- ✅ لا يجب أن يكون هناك memory leaks
- ✅ جميع اختبارات الأداء يجب أن تمر

---

**ملاحظة**: هذه الاختبارات تحتاج بيئة تطوير مع配置的 jest و testing-library