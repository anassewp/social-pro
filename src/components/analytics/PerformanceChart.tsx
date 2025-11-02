/**
 * Performance Chart
 * مخططات مؤشرات الأداء والاستجابة
 */

'use client'

import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Activity, Cpu, HardDrive, Zap, Clock, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePerformanceMetrics } from '@/lib/analytics/useAnalytics'
import { generateMockData, formatPercentage, getValueColor } from '@/lib/analytics/analytics-utils'

interface PerformanceChartProps {
  teamId: string
  type?: 'performance' | 'resources' | 'response' | 'full'
  height?: number
  showControls?: boolean
  className?: string
}

export function PerformanceChart({
  teamId,
  type = 'performance',
  height = 300,
  showControls = true,
  className
}: PerformanceChartProps) {
  const [selectedView, setSelectedView] = useState<'realtime' | 'trends' | 'comparison'>('realtime')
  
  const { performance, isLoading } = usePerformanceMetrics(teamId)

  // استخدام بيانات وهمية للعرض التوضيحي
  const mockData = useMemo(() => ({
    performance: {
      cpu_usage: Math.random() * 100,
      memory_usage: Math.random() * 100,
      response_time: Math.random() * 1000,
      error_rate: Math.random() * 5,
      uptime: 99 + Math.random(),
      active_connections: Math.floor(Math.random() * 1000)
    },
    historical: generateMockData('timeseries', 24).map((item, i) => ({
      ...item,
      cpu: 20 + Math.sin(i / 3) * 30 + Math.random() * 20,
      memory: 30 + Math.cos(i / 4) * 25 + Math.random() * 15,
      response_time: 100 + Math.random() * 400,
      error_rate: Math.random() * 5,
      connections: Math.floor(Math.random() * 500) + 100
    }))
  }), [])

  const currentPerformance = performance || mockData.performance
  const historicalData = mockData.historical

  // تنسيق البيانات للمخططات
  const performanceData = useMemo(() => [
    { name: 'CPU', value: currentPerformance.cpu_usage, fill: '#3B82F6' },
    { name: 'الذاكرة', value: currentPerformance.memory_usage, fill: '#10B981' },
    { name: 'الشبكة', value: Math.random() * 100, fill: '#F59E0B' }
  ], [currentPerformance])

  const responseTimeData = useMemo(() => 
    historicalData.slice(-12).map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString('ar-SA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      response_time: item.response_time,
      error_rate: item.error_rate
    }))
  , [historicalData])

  const uptimeData = useMemo(() => [
    { name: 'وقت التشغيل', value: currentPerformance.uptime, fill: '#10B981' },
    { name: 'وقت التوقف', value: 100 - currentPerformance.uptime, fill: '#EF4444' }
  ], [currentPerformance])

  // Tooltip مخصص
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
          <p className="font-medium text-slate-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-4">
              <span className="text-slate-600">{entry.name}:</span>
              <span className="font-medium">
                {entry.dataKey === 'response_time' ? `${entry.value.toFixed(0)}ms` : 
                 entry.dataKey === 'error_rate' ? formatPercentage(entry.value) :
                 entry.dataKey === 'uptime' ? formatPercentage(entry.value) :
                 formatPercentage(entry.value)}
              </span>
            </div>
          ))}
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
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600'
    if (value <= thresholds.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusBadge = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return { text: 'ممتاز', variant: 'default' as const }
    if (value <= thresholds.warning) return { text: 'جيد', variant: 'secondary' as const }
    return { text: 'يحتاج انتباه', variant: 'destructive' as const }
  }

  return (
    <Card className={className}>
      {showControls && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                مؤشرات الأداء
              </CardTitle>
              <CardDescription>مراقبة الأداء في الوقت الفعلي</CardDescription>
            </div>
            
            <Select value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">الوقت الفعلي</SelectItem>
                <SelectItem value="trends">الاتجاهات</SelectItem>
                <SelectItem value="comparison">مقارنة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="realtime">الوقت الفعلي</TabsTrigger>
            <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
            <TabsTrigger value="comparison">مقارنة</TabsTrigger>
          </TabsList>

          {/* Real-time View */}
          <TabsContent value="realtime" className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Cpu className="h-5 w-5 text-blue-600" />
                  <Badge variant="outline" className={getStatusColor(currentPerformance.cpu_usage, { good: 50, warning: 75 })}>
                    {getStatusBadge(currentPerformance.cpu_usage, { good: 50, warning: 75 }).text}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">استخدام CPU</p>
                <p className="text-2xl font-bold">{currentPerformance.cpu_usage.toFixed(1)}%</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <HardDrive className="h-5 w-5 text-green-600" />
                  <Badge variant="outline" className={getStatusColor(currentPerformance.memory_usage, { good: 60, warning: 80 })}>
                    {getStatusBadge(currentPerformance.memory_usage, { good: 60, warning: 80 }).text}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">استخدام الذاكرة</p>
                <p className="text-2xl font-bold">{currentPerformance.memory_usage.toFixed(1)}%</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <Badge variant="outline" className={getStatusColor(currentPerformance.response_time, { good: 200, warning: 500 })}>
                    {getStatusBadge(currentPerformance.response_time, { good: 200, warning: 500 }).text}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">وقت الاستجابة</p>
                <p className="text-2xl font-bold">{currentPerformance.response_time.toFixed(0)}ms</p>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">استخدام الموارد</h4>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={performanceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {performanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'الاستخدام']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">معدل وقت التشغيل</h4>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="10%"
                      outerRadius="80%"
                      data={uptimeData}
                    >
                      <RadialBar
                        dataKey="value"
                        cornerRadius={10}
                        fill="#10B981"
                      />
                      <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'النسبة']} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-2">
                  <span className="text-sm font-medium text-green-600">
                    {currentPerformance.uptime.toFixed(1)}% uptime
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Trends View */}
          <TabsContent value="trends" className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">اتجاهات الأداء</h4>
              <div style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="response_time"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      name="وقت الاستجابة (ms)"
                    />
                    <Area
                      type="monotone"
                      dataKey="error_rate"
                      stackId="2"
                      stroke="#EF4444"
                      fill="#EF4444"
                      fillOpacity={0.3}
                      name="معدل الأخطاء (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* Comparison View */}
          <TabsContent value="comparison" className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">مقارنة الأداء</h4>
              <div style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historicalData.slice(-10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="cpu" fill="#3B82F6" name="CPU %" />
                    <Bar dataKey="memory" fill="#10B981" name="الذاكرة %" />
                    <Bar dataKey="connections" fill="#F59E0B" name="الاتصالات" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Alert Summary */}
        {currentPerformance.error_rate > 1 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">تحذير</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              معدل الأخطاء مرتفع: {formatPercentage(currentPerformance.error_rate)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}