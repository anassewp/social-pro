import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { memo, useMemo } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

const colorClasses = {
  blue: {
    icon: 'text-blue-600 bg-blue-100',
    trend: 'text-blue-600'
  },
  green: {
    icon: 'text-green-600 bg-green-100',
    trend: 'text-green-600'
  },
  purple: {
    icon: 'text-purple-600 bg-purple-100',
    trend: 'text-purple-600'
  },
  orange: {
    icon: 'text-orange-600 bg-orange-100',
    trend: 'text-orange-600'
  },
  red: {
    icon: 'text-red-600 bg-red-100',
    trend: 'text-red-600'
  }
} as const

const StatsCard = memo(({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  color = 'blue' 
}: StatsCardProps) => {
  // تحسين الأداء بـ useMemo للألوان الثابتة
  const colors = useMemo(() => colorClasses[color], [color])
  
  // حساب فئات الاتجاه باستخدام useMemo
  const trendClass = useMemo(() => {
    if (!trend) return null
    return trend.isPositive ? 'text-green-600' : 'text-red-600'
  }, [trend])

  // حساب قيمة الاتجاه
  const trendValue = useMemo(() => {
    if (!trend) return null
    return `${trend.isPositive ? '+' : ''}${trend.value}%`
  }, [trend])

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-slate-600">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <span className={cn('text-sm font-medium', trendClass)}>
                  {trendValue}
                </span>
                <span className="text-sm text-slate-600 mr-2">من الشهر الماضي</span>
              </div>
            )}
          </div>
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg',
            colors.icon
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

StatsCard.displayName = 'StatsCard'
