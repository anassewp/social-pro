'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

/**
 * Component لتحسين التنقل بين الصفحات
 * يضمن أن البيانات تُجلب بشكل صحيح عند الانتقال بين الأقسام
 */
export function NavigationHandler() {
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const prevPathname = useRef<string | null>(null)

  useEffect(() => {
    // تجنب invalidate في المرة الأولى (mount)
    if (prevPathname.current === null) {
      prevPathname.current = pathname
      return
    }

    // فقط عند تغيير المسار الفعلي
    if (prevPathname.current !== pathname) {
      const oldPath = prevPathname.current
      prevPathname.current = pathname
      
      // عند تغيير المسار، نتأكد من أن البيانات fresh
      const invalidateAndRefetch = () => {
        // Invalidate جميع queries لضمان عرض أحدث البيانات
        // استخدام cancelQueries أولاً لإلغاء أي queries قيد التنفيذ
        queryClient.cancelQueries()
        
        // ثم invalidate للصفحة الجديدة
        queryClient.invalidateQueries()
        
        // Refetch queries النشطة للصفحة الجديدة
        queryClient.refetchQueries()
      }

      // تنفيذ فوري بدون تأخير لضمان تحديث البيانات بسرعة
      invalidateAndRefetch()
    }
  }, [pathname, queryClient])

  return null
}

