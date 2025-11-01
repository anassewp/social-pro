'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PaginationMeta } from '@/lib/types/pagination'

interface PaginationControlsProps {
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function PaginationControls({ 
  pagination, 
  onPageChange, 
  isLoading = false 
}: PaginationControlsProps) {
  const { page, totalPages, hasNext, hasPrev, total } = pagination

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between gap-4 py-4 border-t border-border">
      <div className="text-sm text-muted-foreground">
        عرض {((page - 1) * pagination.pageSize) + 1} - {Math.min(page * pagination.pageSize, total)} من {total}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev || isLoading}
          className="border-border"
        >
          <ChevronRight className="h-4 w-4" />
          السابق
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number
            
            // منطق عرض أرقام الصفحات
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (page <= 3) {
              pageNum = i + 1
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = page - 2 + i
            }
            
            return (
              <Button
                key={pageNum}
                variant={page === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                disabled={isLoading}
                className={page === pageNum ? '' : 'border-border'}
              >
                {pageNum}
              </Button>
            )
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
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
}

