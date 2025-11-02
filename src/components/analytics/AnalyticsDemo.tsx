/**
 * Analytics Demo Component
 * مكون تجريبي لعرض جميع مكونات التحليلات
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import {
  AnalyticsDashboard,
  MetricsCard,
  TimeSeriesChart,
  PerformanceChart,
  HeatmapChart,
  AlertsPanel,
  CampaignAnalytics,
  RealTimeIndicator,
  ExportModal,
  DateRangePicker
} from '@/components/analytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAnalyticsMetrics } from '@/lib/analytics/useAnalytics'
import { formatNumber, generateMockData } from '@/lib/analytics/analytics-utils'

export function AnalyticsDemo() {
  const [selectedRange, setSelectedRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  })

  const teamId = "demo-team-id"
  const { metrics } = useAnalyticsMetrics(teamId)

  // بيانات وهمية للعرض
  const demoData = {
    metrics: metrics || generateMockData('metrics'),
    timeSeriesData: generateMockData('timeseries', 30),
    performanceData: generateMockData('performance')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">عرض تجريبي - التحليلات</h1>
            <p className="text-slate-600 mt-1">عرض جميع مكونات النظام</p>
          </div>
          
          <div className="flex items-center gap-4">
            <RealTimeIndicator 
              teamId={teamId} 
              showDetails={true}
              className="w-64"
            />
            <ExportModal 
              teamId={teamId}
              trigger={
                <Button>
                  <span className="ml-2">تصدير البيانات</span>
                </Button>
              }
            />
          </div>
        </div>

        {/* Date Range Picker */}
        <Card>
          <CardHeader>
            <CardTitle>اختيار النطاق الزمني</CardTitle>
            <CardDescription>جرب منتقي النطاق الزمني</CardDescription>
          </CardHeader>
          <CardContent>
            <DateRangePicker
              value={selectedRange}
              onChange={setSelectedRange}
              className="w-full max-w-md"
            />
          </CardContent>
        </Card>

        {/* Component Showcase */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
            <TabsTrigger value="metrics">المؤشرات</TabsTrigger>
            <TabsTrigger value="timeseries">البيانات الزمنية</TabsTrigger>
            <TabsTrigger value="performance">الأداء</TabsTrigger>
            <TabsTrigger value="heatmap">خرائط الحرارة</TabsTrigger>
            <TabsTrigger value="campaigns">الحملات</TabsTrigger>
            <TabsTrigger value="alerts">التنبيهات</TabsTrigger>
            <TabsTrigger value="export">التصدير</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <AnalyticsDashboard teamId={teamId} />
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle>مؤشرات الأداء</CardTitle>
                <CardDescription>عرض بطاقات المؤشرات المختلفة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricsCard
                    title="إجمالي الزيارات"
                    value={demoData.metrics.total_visits}
                    change={12.5}
                    icon={require('lucide-react').Eye}
                    color="blue"
                    formatValue={formatNumber}
                  />
                  <MetricsCard
                    title="المستخدمين النشطين"
                    value={demoData.metrics.total_users}
                    change={8.2}
                    icon={require('lucide-react').Users}
                    color="green"
                    formatValue={formatNumber}
                  />
                  <MetricsCard
                    title="معدل التحويل"
                    value={demoData.metrics.conversion_rate}
                    change={-2.1}
                    icon={require('lucide-react').TrendingUp}
                    color="purple"
                    formatValue={(val) => `${val.toFixed(1)}%`}
                  />
                  <MetricsCard
                    title="درجة الأداء"
                    value={demoData.metrics.performance_score}
                    change={5.3}
                    icon={require('lucide-react').Activity}
                    color="orange"
                    formatValue={(val) => `${val.toFixed(1)}%`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time Series Tab */}
          <TabsContent value="timeseries">
            <TimeSeriesChart
              teamId={teamId}
              timeframe="day"
              metric="visits"
              height={400}
              showControls={true}
            />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <PerformanceChart
              teamId={teamId}
              type="performance"
              height={400}
              showControls={true}
            />
          </TabsContent>

          {/* Heatmap Tab */}
          <TabsContent value="heatmap">
            <HeatmapChart
              teamId={teamId}
              height={500}
              showControls={true}
            />
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <CampaignAnalytics teamId={teamId} />
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <AlertsPanel
              teamId={teamId}
              maxHeight={600}
              showControls={true}
            />
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>تصدير البيانات</CardTitle>
                  <CardDescription>جرب مختلف خيارات التصدير</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ExportModal
                      teamId={teamId}
                      trigger={
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                          <span>تصدير CSV</span>
                          <Badge variant="secondary">جدولي</Badge>
                        </Button>
                      }
                    />
                    <ExportModal
                      teamId={teamId}
                      trigger={
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                          <span>تصدير JSON</span>
                          <Badge variant="secondary">بيانات مهيكلة</Badge>
                        </Button>
                      }
                    />
                    <ExportModal
                      teamId={teamId}
                      trigger={
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                          <span>تصدير PDF</span>
                          <Badge variant="secondary">تقرير منسق</Badge>
                        </Button>
                      }
                    />
                    <ExportModal
                      teamId={teamId}
                      trigger={
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                          <span>تصدير Excel</span>
                          <Badge variant="secondary">متقدم</Badge>
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Information Panel */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">معلومات النظام</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-2">الميزات المُطبقة:</p>
                <ul className="space-y-1">
                  <li>✅ لوحة تحكم تفاعلية شاملة</li>
                  <li>✅ مخططات زمنية متعددة الأنواع</li>
                  <li>✅ خرائط حرارة للسلوك</li>
                  <li>✅ تحليلات الحملات المتقدمة</li>
                  <li>✅ نظام تنبيهات ذكي</li>
                  <li>✅ مراقبة الأداء المباشر</li>
                  <li>✅ تصدير متعدد التنسيقات</li>
                  <li>✅ مؤشر الوقت الفعلي</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">التقنيات المستخدمة:</p>
                <ul className="space-y-1">
                  <li>🔧 Next.js 15 + React 18</li>
                  <li>🔧 TypeScript للتحكم الكامل</li>
                  <li>🔧 Supabase للبيانات المباشرة</li>
                  <li>🔧 Recharts للمخططات</li>
                  <li>🔧 Radix UI للمكونات</li>
                  <li>🔧 React Query للcache</li>
                  <li>🔧 Tailwind CSS للتصميم</li>
                  <li>🔧 Lucide React للأيقونات</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}