'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal, 
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

interface Column<T> {
  key: string
  title: string
  width?: string
  sortable?: boolean
  filterable?: boolean
  visible?: boolean
  render?: (value: any, row: T) => React.ReactNode
  mobileRender?: (row: T) => React.ReactNode
  className?: string
}

interface ResponsiveTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  error?: string
  pageSize?: number
  searchable?: boolean
  filterable?: boolean
  exportable?: boolean
  selectable?: boolean
  actions?: {
    view?: (row: T) => void
    edit?: (row: T) => void
    delete?: (row: T) => void
  }
  className?: string
  emptyMessage?: string
  emptyIcon?: React.ReactNode
}

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error,
  pageSize = 10,
  searchable = true,
  filterable = false,
  exportable = false,
  selectable = false,
  actions,
  className,
  emptyMessage = 'لا توجد بيانات',
  emptyIcon
}: ResponsiveTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Get visible columns for current screen size
  const visibleColumns = useMemo(() => {
    if (typeof window === 'undefined') return columns
    
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      // Show columns that have mobileRender or are marked as visible
      return columns.filter(col => col.mobileRender || col.visible !== false)
    }
    return columns.filter(col => col.visible !== false)
  }, [columns])

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = data

    // Apply search
    if (searchQuery && searchable) {
      filtered = data.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]
        
        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1
        
        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
    }

    return filtered
  }, [data, searchQuery, sortColumn, sortDirection, searchable])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalPages = Math.ceil(filteredData.length / pageSize)

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const handleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedRows(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedData.map((_, index) => index)))
    }
  }

  const exportData = () => {
    const csv = [
      columns.map(col => col.title).join(','),
      ...filteredData.map(row =>
        columns.map(col => row[col.key] || '').join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>خطأ في تحميل البيانات: {error}</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Mobile Header Controls */}
      <div className="flex flex-col sm:hidden gap-3">
        {/* Search */}
        {searchable && (
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="البحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        )}
        
        {/* Mobile Actions */}
        <div className="flex gap-2">
          {filterable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex-1"
            >
              <Filter className="h-4 w-4 ml-2" />
              تصفية
            </Button>
          )}
          
          {exportable && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              className="flex-1"
            >
              <Download className="h-4 w-4 ml-2" />
              تصدير
            </Button>
          )}
        </div>

        {/* Mobile Filters */}
        {showMobileFilters && filterable && (
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm">تصفية البيانات</h4>
            {visibleColumns.filter(col => col.filterable).map(column => (
              <div key={column.key}>
                <label className="text-sm font-medium mb-1 block">
                  {column.title}
                </label>
                <Input
                  placeholder={`تصفية حسب ${column.title}`}
                  className="text-sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Header Controls */}
      <div className="hidden sm:flex justify-between items-center gap-4">
        <div className="flex gap-3">
          {searchable && (
            <div className="relative w-80">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="البحث في البيانات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {exportable && (
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="h-4 w-4 ml-2" />
              تصدير
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-3">
        {paginatedData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {emptyIcon}
            <p>{emptyMessage}</p>
          </div>
        ) : (
          paginatedData.map((row, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 bg-card space-y-3 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-sm">
                  {columns[0]?.mobileRender ? 
                    columns[0].mobileRender(row) : 
                    row[columns[0]?.key]
                  }
                </h3>
                {actions && (
                  <div className="flex gap-1">
                    {actions.view && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => actions.view!(row)}
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {actions.edit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => actions.edit!(row)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {actions.delete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => actions.delete!(row)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-2 text-xs">
                {visibleColumns.slice(1).map(column => (
                  <div key={column.key} className="flex justify-between">
                    <span className="text-muted-foreground">{column.title}:</span>
                    <span className="font-medium">
                      {column.mobileRender ? 
                        column.mobileRender(row) :
                        column.render ? 
                          column.render(row[column.key], row) :
                          row[column.key]
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {selectable && (
                  <th className="w-12 px-4 py-3 text-right">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-border"
                    />
                  </th>
                )}
                {visibleColumns.map(column => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-right text-sm font-medium',
                      column.sortable && 'cursor-pointer hover:bg-muted/80',
                      column.className
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2 justify-end">
                      {column.title}
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp 
                            className={cn(
                              'h-3 w-3',
                              sortColumn === column.key && sortDirection === 'asc' 
                                ? 'text-foreground' 
                                : 'text-muted-foreground'
                            )}
                          />
                          <ChevronDown 
                            className={cn(
                              'h-3 w-3 -mt-1',
                              sortColumn === column.key && sortDirection === 'desc' 
                                ? 'text-foreground' 
                                : 'text-muted-foreground'
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {(actions?.view || actions?.edit || actions?.delete) && (
                  <th className="w-20 px-4 py-3 text-right">إجراءات</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={visibleColumns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} 
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    {emptyIcon}
                    <p>{emptyMessage}</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr 
                    key={index}
                    className={cn(
                      'hover:bg-muted/50 transition-colors',
                      selectedRows.has(index) && 'bg-muted'
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(index)}
                          onChange={() => handleSelectRow(index)}
                          className="rounded border-border"
                        />
                      </td>
                    )}
                    {visibleColumns.map(column => (
                      <td 
                        key={column.key}
                        className={cn('px-4 py-3 text-sm', column.className)}
                      >
                        {column.render ? 
                          column.render(row[column.key], row) :
                          row[column.key]
                        }
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          {actions.view && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => actions.view!(row)}
                              className="h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {actions.edit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => actions.edit!(row)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {actions.delete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => actions.delete!(row)}
                              className="h-8 w-8 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            عرض {((currentPage - 1) * pageSize) + 1} إلى {Math.min(currentPage * pageSize, filteredData.length)} من {filteredData.length} عنصر
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              السابق
            </Button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              التالي
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}