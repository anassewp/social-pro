/**
 * Time Series Chart
 * مخطط خطي للبيانات المتسلسلة الزمنية
 */

'use client'

import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts'
import { Calendar, TrendingUp, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTimeSeriesData } from '@/lib/analytics/useAnalytics'
import { generateMockData, prepareChartData, generateChartColors } from '@/lib/analytics/analytics-utils'
import { formatNumber } from '@/lib/utils'

interface TimeSeriesChartProps {
  teamId: string
  metric?: string
  timeframe?: 'hour' | 'day' | 'week' | 'month'
  type?: 'default' | 'pages' | 'campaigns'
  height?: number
  showControls?: boolean
  className?: string
}

export function TimeSeriesChart({
  teamId,
  metric = 'visits',
  timeframe = 'day',
  type = 'default',
  height = 300,
  showControls = true,
  className
}: TimeSeriesChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe)
  const [selectedMetric, setSelectedMetric] = useState(metric)

  // جلب البيانات الحقيقية أو استخدام بيانات وهمية للعرض
  const { timeSeriesData, isLoading } = useTimeSeriesData(teamId, selectedMetric, selectedTimeframe)
  
  // استخدام بيانات وهمية للعرض التوضيحي
  const mockData = useMemo(() => {
    const baseData = generateMockData('timeseries', 30)
    return baseData.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp).toLocaleDateString('ar-SA'),
      visits: Math.floor(Math.random() * 1000) + 200,
      users: Math.floor(Math.random() * 500) + 100,
      conversions: Math.floor(Math.random() * 50) + 10,
      page_views: Math.floor(Math.random() * 5000) + 1000,
      clicks: Math.floor(Math.random() * 200) + 50
    }))
  }, [])

  const data = timeSeriesData?.length ? timeSeriesData : mockData

  // تنسيق البيانات للعرض
  const chartData = useMemo(() => {
    return data.map(item => ({
      name: typeof item.timestamp === 'string' 
        ? new Date(item.timestamp).toLocaleDateString('ar-SA')
        : item.timestamp,
      value: item.value,
      visits: item.visits || item.value,
      users: item.users || Math.floor(item.value * 0.6),
      conversions: item.conversions || Math.floor(item.value * 0.1),
      page_views: item.page_views || item.value * 5,
      clicks: item.clicks || Math.floor(item.value * 0.3),
      fullData: item
    }))
  }, [data])

  // إعدادات المخطط حسب النوع
  const chartConfig = {
    default: {
      dataKey: 'value',
      color: '#3B82F6',
      name: selectedMetric === 'visits' ? 'الزيارات' : 
             selectedMetric === 'users' ? 'المستخدمين' : 
             selectedMetric === 'conversions' ? 'التحويلات' : 'القيمة'
    },
    pages: {
      dataKey: 'page_views',
      color: '#10B981',
      name: 'مشاهدات الصفحات'
    },
    campaigns: {
      dataKey: 'clicks',
      color: '#F59E0B',
      name: 'النقرات'
    }
  }

  const config = chartConfig[type]

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const values = chartData.map(d => d[config.dataKey as keyof typeof d] as number)
    const total = values.reduce((sum, val) => sum + val, 0)
    const average = total / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    
    return { total, average, max, min }
  }, [chartData, config.dataKey])

  // Tooltip مخصص
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 min-w-[200px]">
          <p className="font-medium text-slate-900 mb-2">{label}</p>
          {type === 'default' ? (
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">القيمة:</span>
                <span className="font-medium">{formatNumber(payload[0].value)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">الزيارات:</span>
                <span className="font-medium">{formatNumber(data.visits)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">المستخدمين:</span>
                <span className="font-medium">{formatNumber(data.users)}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">{config.name}:</span>
                <span className="font-medium">{formatNumber(payload[0].value)}</span>
              </div>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>جاري التحميل...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-64 bg-slate-200 rounded"></div>
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
                <TrendingUp className="h-5 w-5" />
                تحليل الاتجاهات
              </CardTitle>
              <CardDescription>
                آخر {selectedTimeframe === 'hour' ? '24 ساعة' : 
                       selectedTimeframe === 'day' ? '30 يوم' : 
                       selectedTimeframe === 'week' ? '12 أسبوع' : '12 شهر'}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">ساعة</SelectItem>
                  <SelectItem value="day">يوم</SelectItem>
                  <SelectItem value="week">أسبوع</SelectItem>
                  <SelectItem value="month">شهر</SelectItem>
                </SelectContent>
              </Select>
              
              {type === 'default' && (
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visits">الزيارات</SelectItem>
                    <SelectItem value="users">المستخدمين</SelectItem>
                    <SelectItem value="conversions">التحويلات</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600">الإجمالي</p>
            <p className="text-lg font-semibold text-slate-900">{formatNumber(stats.total)}</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600">المتوسط</p>
            <p className="text-lg font-semibold text-slate-900">{formatNumber(stats.average)}</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600">الحد الأقصى</p>
            <p className="text-lg font-semibold text-green-600">{formatNumber(stats.max)}</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600">الحد الأدنى</p>
            <p className="text-lg font-semibold text-red-600">{formatNumber(stats.min)}</p>
          </div>
        </div>

        {/* Chart */}
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => value.length > 8 ? value.slice(0, 8) + '...' : value}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={formatNumber}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <ReferenceLine y={stats.average} stroke="#94a3b8" strokeDasharray="2 2" />
              
              <Line
                type="monotone"
                dataKey={config.dataKey}
                stroke={config.color}
                strokeWidth={2}
                dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: config.color, strokeWidth: 2 }}
                name={config.name}
              />
              
              {type === 'default' && (
                <>
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                    name="الزيارات"
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                    name="المستخدمين"
                    strokeDasharray="3 3"
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}