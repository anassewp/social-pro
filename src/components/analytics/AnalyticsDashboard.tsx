/**
 * Analytics Dashboard
 * لوحة المعلومات الرئيسية للتحليلات
 */

'use client'

import { useState } from 'react'
import { 
  Activity, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Eye,
  MousePointer,
  Clock,
  AlertTriangle,
  Download,
  RefreshCw,
  Filter,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAnalyticsMetrics, useAdvancedAnalytics } from '@/lib/analytics/useAnalytics'
import { formatNumber, formatPercentage, generateMockData, getValueColor } from '@/lib/analytics/analytics-utils'
import { MetricsCard } from './MetricsCard'
import { TimeSeriesChart } from './TimeSeriesChart'
import { PerformanceChart } from './PerformanceChart'
import { HeatmapChart } from './HeatmapChart'
import { AlertsPanel } from './AlertsPanel'
import { CampaignAnalytics } from './CampaignAnalytics'

interface AnalyticsDashboardProps {
  teamId: string
  className?: string
}

export function AnalyticsDashboard({ teamId, className }: AnalyticsDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month'>('day')
  const [selectedMetric, setSelectedMetric] = useState('visits')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useAnalyticsMetrics(teamId)
  const { insights } = useAdvancedAnalytics(teamId, [selectedMetric])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetchMetrics()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // استخدام بيانات وهمية للعرض التوضيحي
  const mockMetrics = generateMockData('metrics')
  const currentMetrics = metrics || mockMetrics

  const metricsData = [
    {
      title: 'إجمالي الزيارات',
      value: currentMetrics.total_visits,
      change: 12.5,
      icon: Eye,
      color: 'blue',
      format: (val: number) => formatNumber(val)
    },
    {
      title: 'المستخدمين النشطين',
      value: currentMetrics.total_users,
      change: 8.2,
      icon: Users,
      color: 'green',
      format: (val: number) => formatNumber(val)
    },
    {
      title: 'معدل التحويل',
      value: currentMetrics.conversion_rate,
      change: -2.1,
      icon: TrendingUp,
      color: 'purple',
      format: (val: number) => formatPercentage(val)
    },
    {
      title: 'درجة الأداء',
      value: currentMetrics.performance_score,
      change: 5.3,
      icon: Activity,
      color: 'orange',
      format: (val: number) => formatPercentage(val)
    }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">لوحة التحليلات</h1>
          <p className="text-slate-600 mt-1">تحليلات شاملة في الوقت الفعلي</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 ml-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">يوم</SelectItem>
              <SelectItem value="week">أسبوع</SelectItem>
              <SelectItem value="month">شهر</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ml-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          
          <Button>
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsData.map((metric, index) => (
          <MetricsCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
            color={metric.color}
            formatValue={metric.format}
            isLoading={metricsLoading}
          />
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="campaigns">الحملات</TabsTrigger>
          <TabsTrigger value="behavior">السلوك</TabsTrigger>
          <TabsTrigger value="alerts">التنبيهات</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Time Series Chart */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>اتجاهات الأداء</span>
                    <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visits">الزيارات</SelectItem>
                        <SelectItem value="users">المستخدمين</SelectItem>
                        <SelectItem value="conversions">التحويلات</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardTitle>
                  <CardDescription>
                    أداء آخر {selectedTimeframe === 'day' ? '24 ساعة' : selectedTimeframe === 'week' ? '7 أيام' : '30 يوم'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TimeSeriesChart
                    timeframe={selectedTimeframe}
                    metric={selectedMetric}
                    teamId={teamId}
                    height={300}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات سريعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">معدل الارتداد</span>
                    <Badge variant="outline" className={getValueColor(currentMetrics.bounce_rate, { good: 30, warning: 50 })}>
                      {formatPercentage(currentMetrics.bounce_rate)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">متوسط الجلسة</span>
                    <Badge variant="outline">
                      {Math.floor(currentMetrics.session_duration / 60)}:{(currentMetrics.session_duration % 60).toString().padStart(2, '0')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">الزوار العائدون</span>
                    <Badge variant="outline">
                      {formatPercentage((currentMetrics.returning_visitors / currentMetrics.unique_visitors) * 100)}
                    </Badge>
                  </div>
                  
                  {insights && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2">
                        {insights.trend === 'صاعد' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : insights.trend === 'هابط' ? (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        ) : (
                          <Activity className="h-4 w-4 text-slate-600" />
                        )}
                        <span className="text-sm font-medium">التوجه العام: {insights.trend}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        نمو: {formatPercentage(insights.totalGrowth)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>مؤشرات الأداء</CardTitle>
                <CardDescription>مراقبة أداء النظام في الوقت الفعلي</CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceChart teamId={teamId} height={300} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>استخدام الموارد</CardTitle>
                <CardDescription>استهلاك CPU والذاكرة</CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceChart 
                  teamId={teamId} 
                  type="resources" 
                  height={300} 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>سلوك المستخدمين</CardTitle>
                  <CardDescription>تحليل تفاعل المستخدمين مع الموقع</CardDescription>
                </CardHeader>
                <CardContent>
                  <HeatmapChart teamId={teamId} height={400} />
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات المستخدمين</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">زوار جدد</span>
                  <span className="font-medium">{formatNumber(currentMetrics.unique_visitors)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">زوار عائدون</span>
                  <span className="font-medium">{formatNumber(currentMetrics.returning_visitors)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">مشاهدات الصفحات</span>
                  <span className="font-medium">{formatNumber(currentMetrics.page_views)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <CampaignAnalytics teamId={teamId} />
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>خرائط الحرارة</CardTitle>
                <CardDescription>نقاط التفاعل الأكثر شيوعاً</CardDescription>
              </CardHeader>
              <CardContent>
                <HeatmapChart teamId={teamId} height={350} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>مسارات المستخدم</CardTitle>
                <CardDescription>أكثر الصفحات زيارة</CardDescription>
              </CardHeader>
              <CardContent>
                <TimeSeriesChart 
                  teamId={teamId} 
                  type="pages" 
                  height={350} 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <AlertsPanel teamId={teamId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}