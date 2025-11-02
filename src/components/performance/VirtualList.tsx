'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'

interface VirtualListItem {
  id: string | number
  [key: string]: any
}

interface VirtualListProps {
  items: VirtualListItem[]
  itemHeight: number
  height: number
  width?: string | number
  renderItem: (item: VirtualListItem, index: number) => React.ReactNode
  overscan?: number
  className?: string
}

const VirtualList = memo(({ 
  items, 
  itemHeight, 
  height, 
  width = '100%', 
  renderItem, 
  overscan = 5,
  className 
}: VirtualListProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  // حساب العناصر المرئية
  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + height) / itemHeight) + overscan
    )

    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex + 1),
    }
  }, [scrollTop, height, itemHeight, overscan, items])

  // معالجة التمرير
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // حساب المسافة الإجمالية
  const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight])

  // حساب التحول للتمرير الافتراضي
  const offsetY = useMemo(() => {
    return visibleItems.startIndex * itemHeight
  }, [visibleItems.startIndex, itemHeight])

  return (
    <div 
      ref={containerRef}
      className={`overflow-auto ${className || ''}`}
      style={{ height, width }}
      onScroll={handleScroll}
    >
      {/* عنصر placeholder للمساحة الكاملة */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* العناصر المرئية */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {visibleItems.visibleItems.map((item, index) => (
            <div
              key={item.id || `${visibleItems.startIndex + index}`}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleItems.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

VirtualList.displayName = 'VirtualList'

export { VirtualList }