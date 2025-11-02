'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PaginationMeta } from '@/lib/types/pagination'
import { memo, useMemo, useCallback } from 'react'

interface PaginationControlsProps {
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  isLoading?: boolean
}

const PaginationControls = memo(({ 
  pagination, 
  onPageChange, 
  isLoading = false 
}: PaginationControlsProps) => {
  const { page, totalPages, hasNext, hasPrev, total } = pagination

  // تحسين الأداء باستخدام useMemo
  const displayRange = useMemo(() => {
    const start = ((page - 1) * pagination.pageSize) + 1
    const end = Math.min(page * pagination.pageSize, total)
    return { start, end }
  }, [page, pagination.pageSize, total])

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    
    if (page <= 3) {
      return Array.from({ length: 5 }, (_, i) => i + 1)
    }
    
    if (page >= totalPages - 2) {
      return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)
    }
    
    return Array.from({ length: 5 }, (_, i) => page - 2 + i)
  }, [page, totalPages])

  // تحسين الأداء باستخدام useCallback
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage !== page && newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage)
    }
  }, [page, totalPages, onPageChange])

  const handlePrevious = useCallback(() => {
    handlePageChange(page - 1)
  }, [page, handlePageChange])

  const handleNext = useCallback(() => {
    handlePageChange(page + 1)
  }, [page, handlePageChange])

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between gap-4 py-4 border-t border-border">
      <div className="text-sm text-muted-foreground">
        عرض {displayRange.start} - {displayRange.end} من {total}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={!hasPrev || isLoading}
          className="border-border"
        >
          <ChevronRight className="h-4 w-4" />
          السابق
        </Button>
        
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum) => (
            <Button
              key={pageNum}
              variant={page === pageNum ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              disabled={isLoading}
              className={page === pageNum ? '' : 'border-border'}
            >
              {pageNum}
            </Button>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!hasNext || isLoading}
          className="border-border"
        >
          التالي
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground">
        صفحة {page} من {totalPages}
      </div>
    </div>
  )
})

PaginationControls.displayName = 'PaginationControls'

