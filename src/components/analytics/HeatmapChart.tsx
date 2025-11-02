/**
 * Heatmap Chart
 * خرائط الحرارة لتتبع تفاعل المستخدمين
 */

'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MousePointer, Eye, Clock, Users, Filter } from 'lucide-react'
import { useUserBehavior } from '@/lib/analytics/useAnalytics'
import { generateMockData, calculateHeatmapPoints } from '@/lib/analytics/analytics-utils'

interface HeatmapChartProps {
  teamId: string
  height?: number
  showControls?: boolean
  className?: string
}

export function HeatmapChart({
  teamId,
  height = 400,
  showControls = true,
  className
}: HeatmapChartProps) {
  const [selectedType, setSelectedType] = useState<'clicks' | 'scrolls' | 'attention'>('clicks')
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  const [intensity, setIntensity] = useState(1)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { behaviorData, isLoading } = useUserBehavior(teamId)

  // استخدام بيانات وهمية للعرض التوضيحي
  const mockHeatmapData = useMemo(() => {
    const clicks = generateMockData('heatmap', 100).map(point => ({
      ...point,
      type: 'click' as const,
      timestamp: new Date().toISOString(),
      user_id: Math.random().toString(36).substr(2, 9)
    }))

    const scrolls = Array.from({ length: 200 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      intensity: Math.random(),
      timestamp: new Date().toISOString(),
      type: 'scroll' as const,
      user_id: Math.random().toString(36).substr(2, 9)
    }))

    return { clicks, scrolls }
  }, [])

  // رسم الخريطة الحرارية
  const drawHeatmap = (canvas: HTMLCanvasElement, data: any[], type: string) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // مسح Canvas
    ctx.clearRect(0, 0, width, height)

    // رسم خلفية
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, width, height)

    // رسم grid للمنطقة القابلة للنقر
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // حساب النقاط المركزة
    const gridSize = 20
    const grid = new Map<string, { count: number; intensity: number }>()

    data.forEach(point => {
      const gridX = Math.floor((point.x / 100) * (width / gridSize))
      const gridY = Math.floor((point.y / 100) * (height / gridSize))
      const key = `${gridX}-${gridY}`

      if (!grid.has(key)) {
        grid.set(key, { count: 0, intensity: 0 })
      }

      const cell = grid.get(key)!
      cell.count++
      cell.intensity = Math.max(cell.intensity, point.intensity)
    })

    // رسم النقاط المركزة
    grid.forEach((cell, key) => {
      const [gridX, gridY] = key.split('-').map(Number)
      const x = gridX * gridSize
      const y = gridY * gridSize
      const size = gridSize

      // حساب اللون حسب الكثافة
      const intensity = Math.min(cell.intensity * intensity, 1)
      const alpha = Math.max(intensity * 0.8, 0.1)
      
      if (type === 'clicks') {
        // ألوان حمراء للنقرات
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`
      } else if (type === 'scrolls') {
        // ألوان زرقاء للتمرير
        ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`
      } else {
        // ألوان خضراء للانتباه
        ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`
      }

      ctx.fillRect(x, y, size, size)
    })

    // إضافة تأثير التدريج للنقاط الأكثر كثافة
    grid.forEach((cell, key) => {
      if (cell.count > 3) {
        const [gridX, gridY] = key.split('-').map(Number)
        const centerX = gridX * gridSize + gridSize / 2
        const centerY = gridY * gridSize + gridSize / 2
        const radius = Math.min(cell.count * 3, 30)

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
        
        if (type === 'clicks') {
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)')
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0)')
        } else if (type === 'scrolls') {
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)')
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
        } else {
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)')
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0)')
        }

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }

  // تحديث الرسم عند تغيير البيانات
  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current
      const container = containerRef.current
      
      // ضبط حجم Canvas
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * (window.devicePixelRatio || 1)
      canvas.height = rect.height * (window.devicePixelRatio || 1)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      // رسم البيانات
      const data = selectedType === 'clicks' ? mockHeatmapData.clicks : mockHeatmapData.scrolls
      drawHeatmap(canvas, data, selectedType)
    }
  }, [selectedType, selectedTimeframe, intensity, mockHeatmapData])

  // إحصائيات سريعة
  const stats = useMemo(() => {
    const data = selectedType === 'clicks' ? mockHeatmapData.clicks : mockHeatmapData.scrolls
    const totalInteractions = data.length
    const uniqueAreas = new Set(data.map(d => `${Math.floor(d.x / 10)}-${Math.floor(d.y / 10)}`)).size
    const avgIntensity = data.reduce((sum, d) => sum + d.intensity, 0) / data.length
    const peakIntensity = Math.max(...data.map(d => d.intensity))

    return { totalInteractions, uniqueAreas, avgIntensity, peakIntensity }
  }, [selectedType, mockHeatmapData])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>جاري التحميل...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className={`bg-slate-200 rounded`} style={{ height }}></div>
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
                <MousePointer className="h-5 w-5" />
                خرائط الحرارة
              </CardTitle>
              <CardDescription>تحليل تفاعل المستخدمين البصري</CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clicks">النقرات</SelectItem>
                  <SelectItem value="scrolls">التمرير</SelectItem>
                  <SelectItem value="attention">الانتباه</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 ساعة</SelectItem>
                  <SelectItem value="24h">24 ساعة</SelectItem>
                  <SelectItem value="7d">7 أيام</SelectItem>
                  <SelectItem value="30d">30 يوم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        <Tabs value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-auto grid-cols-3">
              <TabsTrigger value="clicks" className="flex items-center gap-2">
                <MousePointer className="h-4 w-4" />
                النقرات
              </TabsTrigger>
              <TabsTrigger value="scrolls" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                التمرير
              </TabsTrigger>
              <TabsTrigger value="attention" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                الانتباه
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">الكثافة:</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm font-medium w-8">{intensity}x</span>
            </div>
          </div>

          {/* Heatmap Canvas */}
          <div 
            ref={containerRef}
            className="relative border border-slate-200 rounded-lg overflow-hidden bg-white"
            style={{ height }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
            />
            
            {/* Overlay Info */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
              <h4 className="font-medium text-slate-900 mb-2">
                {selectedType === 'clicks' ? 'خريطة حرارة النقرات' : 
                 selectedType === 'scrolls' ? 'خريطة حرارة التمرير' : 
                 'خريطة حرارة الانتباه'}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-600">المجموع:</span>
                  <span className="font-medium ml-1">{stats.totalInteractions}</span>
                </div>
                <div>
                  <span className="text-slate-600">المناطق:</span>
                  <span className="font-medium ml-1">{stats.uniqueAreas}</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
              <h5 className="font-medium text-slate-900 mb-2 text-sm">دليل الألوان</h5>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>عالي</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>متوسط</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>منخفض</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Panel */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MousePointer className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">النقرات الساخنة</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {mockHeatmapData.clicks.filter(d => d.intensity > 0.7).length}
              </p>
              <p className="text-xs text-slate-600">مناطق عالية التفاعل</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">مناطق الاهتمام</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {stats.uniqueAreas}
              </p>
              <p className="text-xs text-slate-600">مناطق مختلفة</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">معدل التفاعل</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {(stats.avgIntensity * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-slate-600">متوسط الكثافة</p>
            </div>
          </div>

          {/* Insights */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">رؤى التحليل</h4>
            <div className="text-sm text-blue-800 space-y-1">
              {selectedType === 'clicks' && (
                <p>• معظم النقرات تتركز في الجزء العلوي الأيسر من الصفحة</p>
              )}
              {selectedType === 'scrolls' && (
                <p>• المستخدمون يقضون وقتاً أطول في قراءة المحتوى المتوسط</p>
              )}
              {selectedType === 'attention' && (
                <p>• أعلى مستوى انتباه في منطقة العناصر التفاعلية</p>
              )}
              <p>• نسبة التفاعل الإجمالية: {(stats.avgIntensity * 100).toFixed(1)}%</p>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}