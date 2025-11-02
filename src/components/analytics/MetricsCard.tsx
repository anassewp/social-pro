/**
 * Metrics Card
 * بطاقة عرض المؤشرات الأساسية
 */

'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface MetricsCardProps {
  title: string
  value: number
  change: number
  icon: LucideIcon
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  formatValue?: (value: number) => string
  isLoading?: boolean
  className?: string
  description?: string
  trend?: 'up' | 'down' | 'stable'
}

const colorVariants = {
  blue: {
    icon: 'text-blue-600 bg-blue-100',
    border: 'border-blue-200',
    trend: 'text-blue-600'
  },
  green: {
    icon: 'text-green-600 bg-green-100',
    border: 'border-green-200',
    trend: 'text-green-600'
  },
  purple: {
    icon: 'text-purple-600 bg-purple-100',
    border: 'border-purple-200',
    trend: 'text-purple-600'
  },
  orange: {
    icon: 'text-orange-600 bg-orange-100',
    border: 'border-orange-200',
    trend: 'text-orange-600'
  },
  red: {
    icon: 'text-red-600 bg-red-100',
    border: 'border-red-200',
    trend: 'text-red-600'
  }
}

export function MetricsCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'blue',
  formatValue = (val) => val.toString(),
  isLoading = false,
  className,
  description,
  trend
}: MetricsCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // تحديد الاتجاه بناءً على التغيير أو القيمة المرسلة
  const determinedTrend = trend || (change > 0 ? 'up' : change < 0 ? 'down' : 'stable')
  const trendColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-slate-500'
  const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus

  // انيميشن للرقم
  useEffect(() => {
    if (isLoading) return

    setIsAnimating(true)
    const duration = 1000 // 1 ثانية
    const steps = 60
    const stepValue = value / steps
    let currentValue = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      currentValue = Math.min(step * stepValue, value)
      setAnimatedValue(currentValue)

      if (step >= steps) {
        clearInterval(timer)
        setIsAnimating(false)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, isLoading])

  if (isLoading) {
    return (
      <Card className={cn('transition-all duration-200 hover:shadow-md', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const variant = colorVariants[color]

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md border-l-4',
      variant.border,
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            
            <div className="flex items-baseline gap-2">
              <span className={cn(
                'text-2xl font-bold transition-all duration-300',
                isAnimating ? 'scale-105' : ''
              )}>
                {formatValue(animatedValue)}
              </span>
              
              {description && (
                <span className="text-xs text-slate-500">{description}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn('text-xs px-2 py-0.5', trendColor)}
              >
                <TrendIcon className="h-3 w-3 ml-1" />
                {Math.abs(change).toFixed(1)}%
              </Badge>
              
              <span className="text-xs text-slate-500">
                {determinedTrend === 'up' ? 'زيادة' : determinedTrend === 'down' ? 'انخفاض' : 'مستقر'}
              </span>
            </div>
          </div>

          <div className={cn(
            'h-12 w-12 rounded-full flex items-center justify-center',
            variant.icon
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>

        {/* Mini Chart Area - يمكن إضافة chart صغير هنا */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="h-8 flex items-end gap-1">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 rounded-sm transition-all duration-300',
                  color === 'blue' ? 'bg-blue-200' :
                  color === 'green' ? 'bg-green-200' :
                  color === 'purple' ? 'bg-purple-200' :
                  color === 'orange' ? 'bg-orange-200' :
                  'bg-red-200'
                )}
                style={{
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${i * 50}ms`
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}