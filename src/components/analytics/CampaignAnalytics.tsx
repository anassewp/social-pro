/**
 * Campaign Analytics
 * تحليلات الحملات التسويقية
 */

'use client'

import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  Target, 
  TrendingUp, 
  Users, 
  MousePointer,
  Send,
  CheckCircle,
  XCircle,
  Calendar,
  Filter,
  Download,
  Play,
  Pause
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useCampaignAnalytics } from '@/lib/analytics/useAnalytics'
import { formatNumber, formatPercentage, generateChartColors } from '@/lib/analytics/analytics-utils'

interface CampaignAnalyticsProps {
  teamId: string
  className?: string
}

export function CampaignAnalytics({ teamId, className }: CampaignAnalyticsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month'>('day')
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview')

  const { campaigns, isLoading } = useCampaignAnalytics(teamId)

  // بيانات وهمية للعرض التوضيحي
  const mockCampaigns = useMemo(() => [
    {
      campaign_id: '1',
      campaign_name: 'حملةWinter Sale',
      status: 'active' as const,
      metrics: {
        sent_messages: 15420,
        delivered_messages: 14890,
        failed_messages: 530,
        response_rate: 12.5,
        click_rate: 8.3,
        conversion_rate: 3.2
      },
      performance: {
        hourly: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          value: Math.floor(Math.random() * 1000) + 100,
          label: `${i}:00`
        })),
        daily: Array.from({ length: 30 }, (_, i) => ({
          timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
          value: Math.floor(Math.random() * 5000) + 500,
          label: `اليوم ${i + 1}`
        })),
        weekly: Array.from({ length: 12 }, (_, i) => ({
          timestamp: new Date(Date.now() - (11 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
          value: Math.floor(Math.random() * 35000) + 3500,
          label: `الأسبوع ${i + 1}`
        }))
      }
    },
    {
      campaign_id: '2',
      campaign_name: 'حملة Black Friday',
      status: 'active' as const,
      metrics: {
        sent_messages: 8500,
        delivered_messages: 8200,
        failed_messages: 300,
        response_rate: 18.7,
        click_rate: 15.2,
        conversion_rate: 6.8
      },
      performance: {
        hourly: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          value: Math.floor(Math.random() * 800) + 50,
          label: `${i}:00`
        })),
        daily: Array.from({ length: 30 }, (_, i) => ({
          timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
          value: Math.floor(Math.random() * 4000) + 200,
          label: `اليوم ${i + 1}`
        })),
        weekly: Array.from({ length: 12 }, (_, i) => ({
          timestamp: new Date(Date.now() - (11 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
          value: Math.floor(Math.random() * 28000) + 2000,
          label: `الأسبوع ${i + 1}`
        }))
      }
    },
    {
      campaign_id: '3',
      campaign_name: 'Newsletter January',
      status: 'completed' as const,
      metrics: {
        sent_messages: 25000,
        delivered_messages: 24300,
        failed_messages: 700,
        response_rate: 8.9,
        click_rate: 6.1,
        conversion_rate: 2.4
      },
      performance: {
        hourly: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          value: Math.floor(Math.random() * 1200) + 200,
          label: `${i}:00`
        })),
        daily: Array.from({ length: 30 }, (_, i) => ({
          timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
          value: Math.floor(Math.random() * 6000) + 800,
          label: `اليوم ${i + 1}`
        })),
        weekly: Array.from({ length: 12 }, (_, i) => ({
          timestamp: new Date(Date.now() - (11 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
          value: Math.floor(Math.random() * 42000) + 5000,
          label: `الأسبوع ${i + 1}`
        }))
      }
    }
  ], [])

  const currentCampaigns = campaigns?.length ? campaigns : mockCampaigns

  // حساب الإحصائيات الإجمالية
  const totalStats = useMemo(() => {
    const totals = currentCampaigns.reduce((acc, campaign) => ({
      sent_messages: acc.sent_messages + campaign.metrics.sent_messages,
      delivered_messages: acc.delivered_messages + campaign.metrics.delivered_messages,
      failed_messages: acc.failed_messages + campaign.metrics.failed_messages,
      avg_response_rate: acc.avg_response_rate + campaign.metrics.response_rate,
      avg_click_rate: acc.avg_click_rate + campaign.metrics.click_rate,
      avg_conversion_rate: acc.avg_conversion_rate + campaign.metrics.conversion_rate
    }), {
      sent_messages: 0,
      delivered_messages: 0,
      failed_messages: 0,
      avg_response_rate: 0,
      avg_click_rate: 0,
      avg_conversion_rate: 0
    })

    return {
      ...totals,
      avg_response_rate: totals.avg_response_rate / currentCampaigns.length,
      avg_click_rate: totals.avg_click_rate / currentCampaigns.length,
      avg_conversion_rate: totals.avg_conversion_rate / currentCampaigns.length,
      delivery_rate: (totals.delivered_messages / totals.sent_messages) * 100
    }
  }, [currentCampaigns])

  // بيانات الرسم البياني
  const campaignComparisonData = useMemo(() => 
    currentCampaigns.map((campaign, index) => ({
      name: campaign.campaign_name.length > 15 
        ? campaign.campaign_name.slice(0, 15) + '...'
        : campaign.campaign_name,
      fullName: campaign.campaign_name,
      sent: campaign.metrics.sent_messages,
      delivered: campaign.metrics.delivered_messages,
      response_rate: campaign.metrics.response_rate,
      click_rate: campaign.metrics.click_rate,
      conversion_rate: campaign.metrics.conversion_rate,
      status: campaign.status,
      color: generateChartColors(currentCampaigns.length)[index]
    }))
  , [currentCampaigns])

  const deliveryData = useMemo(() => [
    { name: 'تم التسليم', value: totalStats.delivered_messages, fill: '#10B981' },
    { name: 'فشل التسليم', value: totalStats.failed_messages, fill: '#EF4444' }
  ], [totalStats])

  const responseRateData = useMemo(() =>
    currentCampaigns.map(campaign => ({
      name: campaign.campaign_name.slice(0, 10),
      rate: campaign.metrics.response_rate
    }))
  , [currentCampaigns])

  // Tooltip مخصص
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-4">
          <p className="font-medium text-slate-900 mb-2">{data.fullName || label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-4 mb-1">
              <span className="text-slate-600">{entry.dataKey}:</span>
              <span className="font-medium">
                {typeof entry.value === 'number' ? 
                  (entry.dataKey.includes('rate') ? formatPercentage(entry.value) : formatNumber(entry.value)) 
                  : entry.value}
              </span>
            </div>
          ))}
          {data.status && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <Badge variant={data.status === 'active' ? 'default' : 'secondary'}>
                {data.status === 'active' ? 'نشطة' : data.status === 'completed' ? 'مكتملة' : 'متوقفة'}
              </Badge>
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
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              تحليلات الحملات
            </CardTitle>
            <CardDescription>مراقبة أداء الحملات التسويقية</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">يوم</SelectItem>
                <SelectItem value="week">أسبوع</SelectItem>
                <SelectItem value="month">شهر</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">نظرة عامة</SelectItem>
                <SelectItem value="detailed">تفصيلي</SelectItem>
                <SelectItem value="comparison">مقارنة</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="h-4 w-4 ml-2" />
              تصدير
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="detailed">تحليل مفصل</TabsTrigger>
            <TabsTrigger value="comparison">مقارنة الحملات</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Send className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">إجمالي الرسائل</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{formatNumber(totalStats.sent_messages)}</p>
                <p className="text-xs text-blue-600">تم الإرسال</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">معدل التسليم</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{formatPercentage(totalStats.delivery_rate)}</p>
                <p className="text-xs text-green-600">{formatNumber(totalStats.delivered_messages)} تم التسليم</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointer className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">متوسط النقر</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">{formatPercentage(totalStats.avg_click_rate)}</p>
                <p className="text-xs text-purple-600">معدل النقر</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">متوسط التحويل</span>
                </div>
                <p className="text-2xl font-bold text-orange-700">{formatPercentage(totalStats.avg_conversion_rate)}</p>
                <p className="text-xs text-orange-600">معدل التحويل</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">توزيع التسليم</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deliveryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {deliveryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [formatNumber(Number(value)), '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">معدلات الاستجابة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={responseRateData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="rate" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Detailed Tab */}
          <TabsContent value="detailed" className="space-y-6">
            {currentCampaigns.map((campaign, index) => (
              <Card key={campaign.campaign_id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{campaign.campaign_name}</CardTitle>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status === 'active' ? 'نشطة' : 
                         campaign.status === 'completed' ? 'مكتملة' : 'متوقفة'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {campaign.status === 'active' ? (
                        <Button size="sm" variant="outline">
                          <Pause className="h-4 w-4 ml-1" />
                          إيقاف
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4 ml-1" />
                          تشغيل
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-slate-600">الرسائل المرسلة</p>
                      <p className="text-xl font-bold">{formatNumber(campaign.metrics.sent_messages)}</p>
                      <Progress value={(campaign.metrics.delivered_messages / campaign.metrics.sent_messages) * 100} className="mt-2" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">معدل الاستجابة</p>
                      <p className="text-xl font-bold text-green-600">{formatPercentage(campaign.metrics.response_rate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">معدل التحويل</p>
                      <p className="text-xl font-bold text-blue-600">{formatPercentage(campaign.metrics.conversion_rate)}</p>
                    </div>
                  </div>

                  <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={campaign.performance.daily}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="label" 
                          tickFormatter={(value) => value.replace('اليوم ', '')}
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={generateChartColors(currentCampaigns.length)[index]}
                          fill={generateChartColors(currentCampaigns.length)[index]}
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">مقارنة أداء الحملات</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campaignComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="sent" fill="#3B82F6" name="المرسلة" />
                      <Bar dataKey="delivered" fill="#10B981" name="المسلمة" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">جدول المقارنة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-right py-3 px-4 font-medium">الحملة</th>
                        <th className="text-right py-3 px-4 font-medium">الحالة</th>
                        <th className="text-right py-3 px-4 font-medium">المرسلة</th>
                        <th className="text-right py-3 px-4 font-medium">المسلمة</th>
                        <th className="text-right py-3 px-4 font-medium">معدل الاستجابة</th>
                        <th className="text-right py-3 px-4 font-medium">معدل النقر</th>
                        <th className="text-right py-3 px-4 font-medium">معدل التحويل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignComparisonData.map((campaign) => (
                        <tr key={campaign.fullName} className="border-b border-slate-100">
                          <td className="py-3 px-4 font-medium">{campaign.fullName}</td>
                          <td className="py-3 px-4">
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                              {campaign.status === 'active' ? 'نشطة' : 
                               campaign.status === 'completed' ? 'مكتملة' : 'متوقفة'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{formatNumber(campaign.sent)}</td>
                          <td className="py-3 px-4">{formatNumber(campaign.delivered)}</td>
                          <td className="py-3 px-4">
                            <span className="text-green-600 font-medium">
                              {formatPercentage(campaign.response_rate)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-blue-600 font-medium">
                              {formatPercentage(campaign.click_rate)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-purple-600 font-medium">
                              {formatPercentage(campaign.conversion_rate)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}