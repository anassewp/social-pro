/**
 * Export Modal
 * نافذة منبثقة لتصدير بيانات التحليلات
 */

'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Download, 
  FileText, 
  Table, 
  Image, 
  Calendar,
  Settings,
  CheckCircle
} from 'lucide-react'
import { exportToCSV, exportToJSON } from '@/lib/analytics/analytics-utils'

interface ExportModalProps {
  teamId: string
  trigger?: React.ReactNode
  className?: string
}

export function ExportModal({ teamId, trigger, className }: ExportModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf' | 'xlsx'>('csv')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['visits', 'users', 'conversions'])
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month')
  const [filename, setFilename] = useState('analytics-report')
  const [includeCharts, setIncludeCharts] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportComplete, setExportComplete] = useState(false)

  const availableMetrics = [
    { id: 'visits', name: 'الزيارات', description: 'عدد الزيارات الإجمالي' },
    { id: 'users', name: 'المستخدمين', description: 'عدد المستخدمين النشطين' },
    { id: 'conversions', name: 'التحويلات', description: 'عدد التحويلات' },
    { id: 'revenue', name: 'الإيرادات', description: 'إجمالي الإيرادات' },
    { id: 'engagement', name: 'التفاعل', description: 'معدل التفاعل' },
    { id: 'retention', name: 'الاحتفاظ', description: 'معدل الاحتفاظ بالمستخدمين' },
    { id: 'performance', name: 'الأداء', description: 'درجات الأداء' },
    { id: 'errors', name: 'الأخطاء', description: 'عدد الأخطاء' }
  ]

  const formatOptions = [
    { value: 'csv', label: 'CSV', description: 'ملف جدولي للنماذج', icon: Table },
    { value: 'json', label: 'JSON', description: 'بيانات مهيكلة', icon: FileText },
    { value: 'pdf', label: 'PDF', description: 'تقرير منسق', icon: FileText },
    { value: 'xlsx', label: 'Excel', description: 'جدول بيانات متقدم', icon: Table }
  ]

  const timeframeOptions = [
    { value: 'day', label: 'آخر 24 ساعة' },
    { value: 'week', label: 'آخر أسبوع' },
    { value: 'month', label: 'آخر شهر' },
    { value: 'quarter', label: 'آخر ربع سنة' },
    { value: 'year', label: 'آخر سنة' }
  ]

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    )
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)
    setExportComplete(false)

    try {
      // محاكاة عملية التصدير
      const steps = ['جمع البيانات', 'معالجة البيانات', 'تنسيق الملف', 'إنشاء التقرير']
      
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setExportProgress((i + 1) / steps.length * 100)
      }

      // تصدير البيانات حسب التنسيق المحدد
      const data = {
        teamId,
        timeframe,
        metrics: selectedMetrics,
        timestamp: new Date().toISOString(),
        data: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          visits: Math.floor(Math.random() * 1000) + 100,
          users: Math.floor(Math.random() * 500) + 50,
          conversions: Math.floor(Math.random() * 50) + 5
        }))
      }

      if (exportFormat === 'csv') {
        const csvData = data.data.map(row => ({
          التاريخ: new Date(row.date).toLocaleDateString('ar-SA'),
          الزيارات: row.visits,
          المستخدمين: row.users,
          التحويلات: row.conversions
        }))
        exportToCSV(csvData, `${filename}.csv`)
      } else if (exportFormat === 'json') {
        exportToJSON(data, `${filename}.json`)
      }

      setExportComplete(true)
    } catch (error) {
      console.error('خطأ في التصدير:', error)
    } finally {
      setIsExporting(false)
      setTimeout(() => {
        setExportComplete(false)
        setExportProgress(0)
      }, 2000)
    }
  }

  const getFileIcon = () => {
    const format = formatOptions.find(f => f.value === exportFormat)
    return format ? format.icon : FileText
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className={className}>
            <Download className="h-4 w-4 ml-2" />
            تصدير البيانات
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            تصدير بيانات التحليلات
          </DialogTitle>
          <DialogDescription>
            اختر التنسيق والإعدادات المناسبة لتصدير بياناتك
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* اسم الملف */}
          <div className="space-y-2">
            <Label htmlFor="filename">اسم الملف</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="اسم الملف"
            />
          </div>

          <Tabs defaultValue="format" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="format">التنسيق</TabsTrigger>
              <TabsTrigger value="content">المحتوى</TabsTrigger>
              <TabsTrigger value="settings">الإعدادات</TabsTrigger>
            </TabsList>

            {/* تنسيق الملف */}
            <TabsContent value="format" className="space-y-4">
              <div>
                <Label className="text-base font-medium">اختر تنسيق الملف</Label>
                <p className="text-sm text-slate-600 mb-3">
                  اختر التنسيق المناسب لاستخدامك
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  {formatOptions.map((format) => {
                    const Icon = format.icon
                    return (
                      <div
                        key={format.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          exportFormat === format.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => setExportFormat(format.value as any)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-slate-600" />
                          <div>
                            <p className="font-medium">{format.label}</p>
                            <p className="text-xs text-slate-500">{format.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeframe">الإطار الزمني</Label>
                <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeframeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* المحتوى */}
            <TabsContent value="content" className="space-y-4">
              <div>
                <Label className="text-base font-medium">اختر المقاييس</Label>
                <p className="text-sm text-slate-600 mb-3">
                  اختر المقاييس التي تريد تضمينها في التصدير
                </p>
                
                <div className="grid grid-cols-1 gap-2">
                  {availableMetrics.map((metric) => (
                    <div
                      key={metric.id}
                      className="flex items-center space-x-3 p-2 rounded hover:bg-slate-50"
                    >
                      <Checkbox
                        id={metric.id}
                        checked={selectedMetrics.includes(metric.id)}
                        onCheckedChange={() => handleMetricToggle(metric.id)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={metric.id} className="font-medium">
                          {metric.name}
                        </Label>
                        <p className="text-xs text-slate-500">{metric.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="include-charts"
                  checked={includeCharts}
                  onCheckedChange={setIncludeCharts}
                />
                <Label htmlFor="include-charts" className="font-medium">
                  تضمين المخططات والرسوم البيانية
                </Label>
              </div>
            </TabsContent>

            {/* الإعدادات */}
            <TabsContent value="settings" className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  إعدادات التصدير
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>عدد السجلات المتوقعة:</span>
                    <span className="font-medium">~{selectedMetrics.length * 30}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>حجم الملف المقدر:</span>
                    <span className="font-medium">
                      {exportFormat === 'csv' ? '50-200 KB' : 
                       exportFormat === 'json' ? '200-500 KB' : 
                       exportFormat === 'xlsx' ? '500 KB - 2 MB' : '1-5 MB'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>وقت التصدير المتوقع:</span>
                    <span className="font-medium">2-5 ثواني</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* شريط التقدم */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">جاري التصدير...</span>
                <span className="text-sm text-slate-600">{Math.round(exportProgress)}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
          )}

          {/* رسالة النجاح */}
          {exportComplete && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                تم تصدير البيانات بنجاح!
              </span>
            </div>
          )}

          {/* أزرار التحكم */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              إلغاء
            </Button>
            
            <Button
              onClick={handleExport}
              disabled={isExporting || selectedMetrics.length === 0}
              className="min-w-32"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                  جاري التصدير...
                </>
              ) : (
                <>
                  {(() => {
                    const Icon = getFileIcon()
                    return <Icon className="h-4 w-4 ml-2" />
                  })()}
                  تصدير {formatOptions.find(f => f.value === exportFormat)?.label}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}