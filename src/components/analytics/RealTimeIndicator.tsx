/**
 * Real-time Indicator
 * مؤشر يوضح حالة الاتصال والتحديث في الوقت الفعلي
 */

'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useRealtimeSubscription } from '@/lib/hooks/useRealtime'

interface RealTimeIndicatorProps {
  teamId: string | null
  className?: string
  showDetails?: boolean
}

export function RealTimeIndicator({ 
  teamId, 
  className,
  showDetails = false 
}: RealTimeIndicatorProps) {
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [updateCount, setUpdateCount] = useState(0)

  // مراقبة حالة الاتصال عبر subscription
  useRealtimeSubscription('analytics_metrics', teamId, {
    onInsert: () => {
      setIsConnected(true)
      setLastUpdate(new Date())
      setUpdateCount(prev => prev + 1)
    },
    onUpdate: () => {
      setIsConnected(true)
      setLastUpdate(new Date())
      setUpdateCount(prev => prev + 1)
    }
  })

  // محاكاة حالة الاتصال (في التطبيق الحقيقي يمكن ربطها بـ WebSocket status)
  useEffect(() => {
    const interval = setInterval(() => {
      // محاكاة التحقق من الاتصال كل 5 ثواني
      const shouldBeConnected = Math.random() > 0.1 // 90% نسبة الاتصال
      setIsConnected(shouldBeConnected)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    if (!isConnected) return 'bg-red-500'
    const timeSinceUpdate = Date.now() - lastUpdate.getTime()
    if (timeSinceUpdate > 30000) return 'bg-yellow-500' // أكثر من 30 ثانية
    return 'bg-green-500'
  }

  const getStatusText = () => {
    if (!isConnected) return 'غير متصل'
    const timeSinceUpdate = Date.now() - lastUpdate.getTime()
    if (timeSinceUpdate > 30000) return 'بطيء'
    return 'متصل'
  }

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
        <span className="text-xs text-slate-600">مباشر</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-between p-3 bg-slate-50 rounded-lg ${className}`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          {isConnected ? (
            <Wifi className="h-5 w-5 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-600" />
          )}
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor()}`} />
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={isConnected ? 'default' : 'destructive'}
              className="text-xs"
            >
              {getStatusText()}
            </Badge>
            <Activity className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-medium text-slate-900">
          {updateCount}
        </p>
        <p className="text-xs text-slate-600">تحديث اليوم</p>
      </div>
    </div>
  )
}