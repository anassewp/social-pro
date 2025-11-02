'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ShimmerEffect } from './ShimmerEffect'
import { ProgressIndicator } from './ProgressIndicator'

export interface CardLoaderProps {
  /**
   * نوع التحميل
   */
  type?: 'default' | 'article' | 'product' | 'profile' | 'stats' | 'chart'

  /**
   * إظهار الصورة
   */
  showImage?: boolean

  /**
   * عدد العناصر
   */
  count?: number

  /**
   * عرض الخط
   */
  showShimmer?: boolean

  /**
   * نوع الـ shimmer
   */
  shimmerType?: 'wave' | 'pulse' | 'scan' | 'gradient' | 'dots'

  /**
   * تخصيص className
   */
  className?: string

  /**
   * حجم البطاقة
   */
  size?: 'sm' | 'default' | 'lg'

  /**
   * عرض الحالة المتقدمة
   */
  showAdvanced?: boolean
}

// Card Loader Components
export function CardLoader({
  type = 'default',
  showImage = true,
  count = 1,
  showShimmer = true,
  shimmerType = 'gradient',
  className,
  size = 'default',
  showAdvanced = false,
}: CardLoaderProps) {
  const sizeClasses = {
    sm: { padding: 'p-4', spacing: 'space-y-2' },
    default: { padding: 'p-6', spacing: 'space-y-4' },
    lg: { padding: 'p-8', spacing: 'space-y-6' },
  }

  const renderCardContent = () => {
    switch (type) {
      case 'article':
        return (
          <div className={cn('border rounded-lg overflow-hidden', sizeClasses[size].padding, sizeClasses[size].spacing)}>
            {showImage && (
              <ShimmerEffect
                type={shimmerType}
                height={200}
                className="rounded"
              />
            )}
            <div className={cn(sizeClasses[size].spacing)}>
              <ShimmerEffect type={shimmerType} height={20} width="70%" />
              <ShimmerEffect type={shimmerType} height={16} width="90%" />
              <ShimmerEffect type={shimmerType} height={16} width="80%" />
              <ShimmerEffect type={shimmerType} height={16} width="60%" />
              
              {showAdvanced && (
                <div className="flex justify-between items-center pt-2 border-t">
                  <ShimmerEffect type={shimmerType} height={16} width="30%" />
                  <ShimmerEffect type={shimmerType} height={24} width="20%" />
                </div>
              )}
            </div>
          </div>
        )

      case 'product':
        return (
          <div className={cn('border rounded-lg overflow-hidden', sizeClasses[size].padding, sizeClasses[size].spacing)}>
            {showImage && (
              <ShimmerEffect
                type={shimmerType}
                height={160}
                className="rounded"
              />
            )}
            <div className={cn(sizeClasses[size].spacing)}>
              <ShimmerEffect type={shimmerType} height={18} width="80%" />
              <ShimmerEffect type={shimmerType} height={20} width="50%" />
              <ShimmerEffect type={shimmerType} height={14} width="60%" />
              
              <div className="flex justify-between items-center">
                <ShimmerEffect type={shimmerType} height={24} width="25%" />
                <ShimmerEffect type={shimmerType} height={36} width="30%" />
              </div>
            </div>
          </div>
        )

      case 'profile':
        return (
          <div className={cn('border rounded-lg', sizeClasses[size].padding, sizeClasses[size].spacing)}>
            <div className="flex items-center space-x-4">
              {showImage && (
                <ShimmerEffect
                  type={shimmerType}
                  width={60}
                  height={60}
                  borderRadius="50%"
                />
              )}
              <div className={cn(sizeClasses[size].spacing, 'flex-1')}>
                <ShimmerEffect type={shimmerType} height={18} width="60%" />
                <ShimmerEffect type={shimmerType} height={14} width="40%" />
                <ShimmerEffect type={shimmerType} height={14} width="70%" />
              </div>
            </div>
            
            {showAdvanced && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="text-center space-y-1">
                    <ShimmerEffect type={shimmerType} height={16} width={30} />
                    <ShimmerEffect type={shimmerType} height={12} width={40} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'stats':
        return (
          <div className={cn('border rounded-lg', sizeClasses[size].padding, sizeClasses[size].spacing)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShimmerEffect
                  type={shimmerType}
                  width={40}
                  height={40}
                  borderRadius="50%"
                />
                <div className="space-y-2">
                  <ShimmerEffect type={shimmerType} height={16} width="60%" />
                  <ShimmerEffect type={shimmerType} height={20} width="40%" />
                </div>
              </div>
              {showAdvanced && (
                <div className="text-right space-y-1">
                  <ShimmerEffect type={shimmerType} height={12} width="50%" />
                  <ShimmerEffect type={shimmerType} height={14} width="70%" />
                </div>
              )}
            </div>
          </div>
        )

      case 'chart':
        return (
          <div className={cn('border rounded-lg', sizeClasses[size].padding, sizeClasses[size].spacing)}>
            <div className="space-y-4">
              <ShimmerEffect type={shimmerType} height={20} width="40%" />
              
              {/* Chart placeholder */}
              <div className="h-40 bg-muted rounded relative overflow-hidden">
                {showShimmer && (
                  <ShimmerEffect
                    type="wave"
                    height="100%"
                    width="100%"
                    shimmerColor="#ffffff"
                    className="absolute inset-0 opacity-50"
                  />
                )}
                
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between p-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border-t border-dashed border-muted-foreground/20" />
                  ))}
                </div>
              </div>
              
              {showAdvanced && (
                <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <ShimmerEffect type={shimmerType} height={12} width="80%" />
                      <ShimmerEffect type={shimmerType} height={16} width="60%" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      default:
        return (
          <div className={cn('border rounded-lg', sizeClasses[size].padding, sizeClasses[size].spacing)}>
            {showImage && (
              <ShimmerEffect
                type={shimmerType}
                height={180}
                className="rounded"
              />
            )}
            <div className={cn(sizeClasses[size].spacing)}>
              <ShimmerEffect type={shimmerType} height={20} width="60%" />
              <ShimmerEffect type={shimmerType} height={16} width="80%" />
              <ShimmerEffect type={shimmerType} height={16} width="40%" />
            </div>
          </div>
        )
    }
  }

  return (
    <div className={cn('grid gap-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderCardContent()}
        </div>
      ))}
    </div>
  )
}

export interface TableLoaderProps {
  /**
   * عدد الصفوف
   */
  rows?: number

  /**
   * عدد الأعمدة
   */
  columns?: number

  /**
   * عرض رأس الجدول
   */
  showHeader?: boolean

  /**
   * عرض شريط البحث
   */
  showSearch?: boolean

  /**
   * عرض الفلاتر
   */
  showFilters?: boolean

  /**
   * عرض شريط الإجراءات
   */
  showActions?: boolean

  /**
   * نوع الـ shimmer
   */
  shimmerType?: 'wave' | 'pulse' | 'scan' | 'gradient' | 'dots'

  /**
   * تخصيص className
   */
  className?: string

  /**
   * عرض البيانات المحملة
   */
  showProgress?: boolean

  /**
   * عدد العناصر المحملة
   */
  loadedItems?: number

  /**
   * إجمالي العناصر
   */
  totalItems?: number
}

export function TableLoader({
  rows = 5,
  columns = 4,
  showHeader = true,
  showSearch = true,
  showFilters = true,
  showActions = true,
  shimmerType = 'scan',
  className,
  showProgress = false,
  loadedItems = 0,
  totalItems = rows,
}: TableLoaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Search bar */}
      {showSearch && (
        <div className="flex items-center justify-between">
          <ShimmerEffect type={shimmerType} height={40} width="300px" />
          <div className="flex space-x-2">
            <ShimmerEffect type={shimmerType} height={40} width={80} />
            <ShimmerEffect type={shimmerType} height={40} width={80} />
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 border rounded-lg">
          <ShimmerEffect type={shimmerType} height={36} width="120px" />
          <ShimmerEffect type={shimmerType} height={36} width="100px" />
          <ShimmerEffect type={shimmerType} height={36} width="150px" />
          <ShimmerEffect type={shimmerType} height={36} width="80px" />
        </div>
      )}

      {/* Progress bar for large tables */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>تحميل البيانات...</span>
            <span>{loadedItems} من {totalItems}</span>
          </div>
          <ProgressIndicator
            progress={(loadedItems / totalItems) * 100}
            type="linear"
            size="sm"
          />
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        {showHeader && (
          <div className="bg-muted/50 p-4 border-b">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, index) => (
                <ShimmerEffect 
                  key={`header-${index}`} 
                  type={shimmerType} 
                  height={16} 
                  backgroundColor="#e5e7eb"
                />
              ))}
            </div>
          </div>
        )}

        {/* Rows */}
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, colIndex) => {
                  const delay = (rowIndex * 100) + (colIndex * 50)
                  
                  return (
                    <div key={`${rowIndex}-${colIndex}`} className="space-y-1">
                      {/* Main content */}
                      <ShimmerEffect 
                        type={shimmerType} 
                        height={16} 
                        width={colIndex === 0 ? '80%' : colIndex === columns - 1 ? '60%' : '90%'}
                        animationDuration={1500 + delay}
                      />
                      
                      {/* Secondary content for certain columns */}
                      {(colIndex === 0 || colIndex === 1) && (
                        <ShimmerEffect 
                          type={shimmerType} 
                          height={12} 
                          width={colIndex === 0 ? '50%' : '70%'}
                          backgroundColor="#f3f4f6"
                          animationDuration={2000 + delay}
                        />
                      )}
                      
                      {/* Action buttons */}
                      {colIndex === columns - 1 && showActions && (
                        <div className="flex space-x-2 pt-1">
                          <ShimmerEffect type={shimmerType} height={24} width={50} />
                          <ShimmerEffect type={shimmerType} height={24} width={60} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <ShimmerEffect type={shimmerType} height={16} width="100px" />
        <div className="flex space-x-2">
          <ShimmerEffect type={shimmerType} height={36} width={36} />
          <ShimmerEffect type={shimmerType} height={36} width={36} />
          <ShimmerEffect type={shimmerType} height={36} width={36} />
          <ShimmerEffect type={shimmerType} height={36} width={36} />
        </div>
      </div>
    </div>
  )
}

// Specialized Data Grid Loader
export function DataGridLoader({
  columns = 4,
  rows = 6,
  className,
  variant = 'default',
}: {
  columns?: number
  rows?: number
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
}) {
  const spacing = variant === 'compact' ? 'space-y-2' : variant === 'detailed' ? 'space-y-6' : 'space-y-4'
  
  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-muted/50 p-4 border-b">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <ShimmerEffect key={`header-${index}`} type="gradient" height={18} />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className={cn('p-4', spacing)}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={`${rowIndex}-${colIndex}`} className="space-y-2">
                <ShimmerEffect type="gradient" height={16} width="90%" />
                {variant === 'detailed' && (
                  <div className="space-y-1">
                    <ShimmerEffect type="gradient" height={12} width="70%" backgroundColor="#f9fafb" />
                    <ShimmerEffect type="gradient" height={12} width="50%" backgroundColor="#f9fafb" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// List View Loader
export function ListLoader({
  items = 5,
  showAvatar = true,
  showActions = true,
  showSubtitle = true,
  className,
}: {
  items?: number
  showAvatar?: boolean
  showActions?: boolean
  showSubtitle?: boolean
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
          {showAvatar && (
            <ShimmerEffect type="gradient" width={48} height={48} borderRadius="50%" />
          )}
          
          <div className="space-y-2 flex-1">
            <ShimmerEffect type="gradient" height={16} width="60%" />
            {showSubtitle && (
              <ShimmerEffect type="gradient" height={12} width="40%" backgroundColor="#f3f4f6" />
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {showActions && (
              <>
                <ShimmerEffect type="gradient" height={32} width={60} />
                <ShimmerEffect type="gradient" height={32} width={70} />
              </>
            )}
            {!showActions && (
              <ShimmerEffect type="gradient" height={24} width={40} />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// Dashboard Grid Loader
export function DashboardGridLoader({
  stats = 4,
  charts = 2,
  lists = 3,
  className,
}: {
  stats?: number
  charts?: number
  lists?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: stats }).map((_, index) => (
          <CardLoader key={`stats-${index}`} type="stats" count={1} size="sm" />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: charts }).map((_, index) => (
          <CardLoader key={`chart-${index}`} type="chart" count={1} showAdvanced />
        ))}
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: lists }).map((_, index) => (
          <CardLoader key={`list-${index}`} type="default" count={1} showAdvanced />
        ))}
      </div>
    </div>
  )
}