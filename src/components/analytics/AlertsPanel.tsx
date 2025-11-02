/**
 * Alerts Panel
 * لوحة عرض التنبيهات والإشعارات
 */

'use client'

import { useState, useMemo } from 'react'
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle, 
  Clock, 
  Filter,
  MoreVertical,
  Bell,
  X,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { useAlerts } from '@/lib/analytics/useAnalytics'
import { formatTimeAgo, generateMockData } from '@/lib/analytics/analytics-utils'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface AlertsPanelProps {
  teamId: string
  maxHeight?: number
  showControls?: boolean
  className?: string
}

const alertIcons = {
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle
}

const alertColors = {
  error: 'text-red-600 bg-red-100 border-red-200',
  warning: 'text-yellow-600 bg-yellow-100 border-yellow-200',
  info: 'text-blue-600 bg-blue-100 border-blue-200',
  success: 'text-green-600 bg-green-100 border-green-200'
}

export function AlertsPanel({
  teamId,
  maxHeight = 600,
  showControls = true,
  className
}: AlertsPanelProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'error' | 'warning' | 'info' | 'success'>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unresolved' | 'resolved'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const { alerts, isLoading, refetch } = useAlerts(teamId)

  // استخدام بيانات وهمية للعرض التوضيحي
  const mockAlerts = useMemo(() => {
    const baseAlerts = [
      {
        id: '1',
        type: 'error' as const,
        title: 'خطأ في الخادم',
        message: 'تم تسجيل خطأ 500 في الخادم الرئيسي',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        resolved: false,
        metadata: { server: 'main', error_code: 500 }
      },
      {
        id: '2',
        type: 'warning' as const,
        title: 'استهلاك عالي للذاكرة',
        message: 'استخدام الذاكرة وصل إلى 85%',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        resolved: false,
        metadata: { memory_usage: 85 }
      },
      {
        id: '3',
        type: 'info' as const,
        title: 'تحديث النظام',
        message: 'تم تطبيق التحديث الأمني بنجاح',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        resolved: true,
        metadata: { version: '2.1.5' }
      },
      {
        id: '4',
        type: 'success' as const,
        title: 'نسخ احتياطي مكتمل',
        message: 'تم إنشاء نسخة احتياطية للبيانات بنجاح',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        resolved: true,
        metadata: { backup_size: '2.3GB', duration: '25min' }
      },
      {
        id: '5',
        type: 'warning' as const,
        title: 'بطء في الاستجابة',
        message: 'زمن الاستجابة أعلى من المعتاد',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        resolved: false,
        metadata: { response_time: '1200ms' }
      }
    ]
    
    return baseAlerts.concat(
      generateMockData('timeseries', 10).map((item, index) => ({
        id: `mock-${index}`,
        type: ['error', 'warning', 'info', 'success'][Math.floor(Math.random() * 4)] as any,
        title: `تنبيه ${index + 1}`,
        message: `رسالة تنبيه تجريبية رقم ${index + 1}`,
        timestamp: item.timestamp,
        resolved: Math.random() > 0.5,
        metadata: { random: true }
      }))
    )
  }, [])

  const currentAlerts = alerts?.length ? alerts : mockAlerts

  // فلترة التنبيهات
  const filteredAlerts = useMemo(() => {
    return currentAlerts.filter(alert => {
      const matchesType = selectedFilter === 'all' || alert.type === selectedFilter
      const matchesStatus = selectedStatus === 'all' || 
                           (selectedStatus === 'unresolved' && !alert.resolved) ||
                           (selectedStatus === 'resolved' && alert.resolved)
      const matchesSearch = !searchTerm || 
                           alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alert.message.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesType && matchesStatus && matchesSearch
    })
  }, [currentAlerts, selectedFilter, selectedStatus, searchTerm])

  // إحصائيات التنبيهات
  const stats = useMemo(() => {
    const total = currentAlerts.length
    const resolved = currentAlerts.filter(a => a.resolved).length
    const unresolved = total - resolved
    const byType = {
      error: currentAlerts.filter(a => a.type === 'error').length,
      warning: currentAlerts.filter(a => a.type === 'warning').length,
      info: currentAlerts.filter(a => a.type === 'info').length,
      success: currentAlerts.filter(a => a.type === 'success').length
    }

    return { total, resolved, unresolved, byType }
  }, [currentAlerts])

  const handleResolveAlert = async (alertId: string) => {
    // هنا يمكن إضافة منطق حل التنبيه
    console.log('Resolving alert:', alertId)
  }

  const handleDeleteAlert = async (alertId: string) => {
    // هنا يمكن إضافة منطق حذف التنبيه
    console.log('Deleting alert:', alertId)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>جاري التحميل...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {showControls && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                لوحة التنبيهات
              </CardTitle>
              <CardDescription>مراقبة وتنبيهات النظام</CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedFilter} onValueChange={(value: any) => setSelectedFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="error">أخطاء</SelectItem>
                  <SelectItem value="warning">تحذيرات</SelectItem>
                  <SelectItem value="info">معلومات</SelectItem>
                  <SelectItem value="success">نجاح</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={(value: any) => setSelectedStatus(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="unresolved">غير محلولة</SelectItem>
                  <SelectItem value="resolved">محلولة</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-slate-50 rounded-lg text-center">
            <p className="text-sm text-slate-600">الإجمالي</p>
            <p className="text-xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-center">
            <p className="text-sm text-red-600">غير محلولة</p>
            <p className="text-xl font-bold text-red-700">{stats.unresolved}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-sm text-green-600">محلولة</p>
            <p className="text-xl font-bold text-green-700">{stats.resolved}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-sm text-blue-600">معدل الحل</p>
            <p className="text-xl font-bold text-blue-700">
              {((stats.resolved / stats.total) * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3" style={{ maxHeight }}>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600">لا توجد تنبيهات مطابقة للفلاتر</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const Icon = alertIcons[alert.type]
              const isUnresolved = !alert.resolved
              
              return (
                <Alert 
                  key={alert.id} 
                  className={`${alertColors[alert.type]} ${isUnresolved ? 'border-r-4' : 'opacity-75'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {alert.type === 'error' ? 'خطأ' :
                             alert.type === 'warning' ? 'تحذير' :
                             alert.type === 'info' ? 'معلومات' : 'نجاح'}
                          </Badge>
                          {isUnresolved && (
                            <Badge variant="destructive" className="text-xs">
                              جديد
                            </Badge>
                          )}
                        </div>
                        <AlertDescription className="mb-2">
                          {alert.message}
                        </AlertDescription>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(alert.timestamp)}
                          </span>
                          {alert.metadata && (
                            <span className="text-slate-500">
                              {Object.entries(alert.metadata).map(([key, value]) => 
                                `${key}: ${value}`
                              ).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!alert.resolved && (
                          <DropdownMenuItem onClick={() => handleResolveAlert(alert.id)}>
                            <CheckCircle className="h-4 w-4 ml-2" />
                            حل التنبيه
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDeleteAlert(alert.id)}>
                          <X className="h-4 w-4 ml-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Alert>
              )
            })
          )}
        </div>

        {/* Summary */}
        {filteredAlerts.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>عرض {filteredAlerts.length} من {currentAlerts.length} تنبيه</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  خطأ ({stats.byType.error})
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  تحذير ({stats.byType.warning})
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  معلومات ({stats.byType.info})
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  نجاح ({stats.byType.success})
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}