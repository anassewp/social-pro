/**
 * Date Range Picker
 * منتقي النطاق الزمني للتحليلات
 */

'use client'

import { useState } from 'react'
import { format, subDays, startOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Calendar } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  value: { from: Date; to: Date }
  onChange: (range: { from: Date; to: Date }) => void
  className?: string
  preset?: boolean
  showPresetButtons?: boolean
}

export function DateRangePicker({
  value,
  onChange,
  className,
  preset = true,
  showPresetButtons = true
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string>('custom')

  const presets = [
    {
      id: 'today',
      label: 'اليوم',
      getValue: () => ({
        from: new Date(),
        to: new Date()
      })
    },
    {
      id: 'yesterday',
      label: 'أمس',
      getValue: () => ({
        from: subDays(new Date(), 1),
        to: subDays(new Date(), 1)
      })
    },
    {
      id: 'last7days',
      label: 'آخر 7 أيام',
      getValue: () => ({
        from: subDays(new Date(), 7),
        to: new Date()
      })
    },
    {
      id: 'last30days',
      label: 'آخر 30 يوم',
      getValue: () => ({
        from: subDays(new Date(), 30),
        to: new Date()
      })
    },
    {
      id: 'thisWeek',
      label: 'هذا الأسبوع',
      getValue: () => ({
        from: startOfWeek(new Date(), { weekStartsOn: 6 }), // الأسبوع يبدأ السبت
        to: new Date()
      })
    },
    {
      id: 'thisMonth',
      label: 'هذا الشهر',
      getValue: () => ({
        from: startOfMonth(new Date()),
        to: new Date()
      })
    },
    {
      id: 'lastMonth',
      label: 'الشهر الماضي',
      getValue: () => {
        const lastMonth = subDays(startOfMonth(new Date()), 1)
        return {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth)
        }
      }
    },
    {
      id: 'custom',
      label: 'مخصص',
      getValue: () => ({
        from: subDays(new Date(), 7),
        to: new Date()
      })
    }
  ]

  const handlePresetSelect = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId)
    if (preset) {
      const range = preset.getValue()
      onChange(range)
      setSelectedPreset(presetId)
      if (presetId !== 'custom') {
        setIsOpen(false)
      }
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      if (!value.from || (value.from && value.to)) {
        // بداية تحديد نطاق جديد
        onChange({ from: date, to: date })
      } else {
        // إكمال النطاق
        const from = value.from < date ? value.from : date
        const to = value.from < date ? date : value.from
        onChange({ from, to })
        setIsOpen(false)
        setSelectedPreset('custom')
      }
    }
  }

  const isDateInRange = (date: Date) => {
    return value.from && value.to && date >= value.from && date <= value.to
  }

  const formatDateRange = () => {
    if (value.from && value.to) {
      if (format(value.from, 'yyyy-MM-dd') === format(value.to, 'yyyy-MM-dd')) {
        return format(value.from, 'dd MMM yyyy', { locale: ar })
      }
      return `${format(value.from, 'dd MMM', { locale: ar })} - ${format(value.to, 'dd MMM yyyy', { locale: ar })}`
    }
    return 'اختر التاريخ'
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value.from && 'text-muted-foreground',
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* أزرار الإعدادات السريعة */}
          {showPresetButtons && (
            <div className="border-r p-3">
              <div className="space-y-1">
                <h4 className="text-sm font-medium mb-2">الفترة المحددة مسبقاً</h4>
                {presets.map((presetOption) => (
                  <Button
                    key={presetOption.id}
                    variant={selectedPreset === presetOption.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => handlePresetSelect(presetOption.id)}
                  >
                    {presetOption.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* التقويم */}
          <div className="p-3">
            <CalendarComponent
              mode="single"
              selected={value.from}
              onSelect={handleDateSelect}
              disabled={(date) =>
                date > new Date() || date < new Date('1900-01-01')
              }
              initialFocus
              locale={ar}
              className="rounded-md border"
              modifiers={{
                inRange: isDateInRange,
                selected: (date) => 
                  (value.from && format(date, 'yyyy-MM-dd') === format(value.from, 'yyyy-MM-dd')) ||
                  (value.to && format(date, 'yyyy-MM-dd') === format(value.to, 'yyyy-MM-dd'))
              }}
              modifiersStyles={{
                inRange: { backgroundColor: 'rgb(59 130 246 / 0.1)', color: 'rgb(59 130 246)' },
                selected: { backgroundColor: 'rgb(59 130 246)', color: 'white' }
              }}
            />
            
            {/* معلومات النطاق المحدد */}
            {value.from && value.to && (
              <div className="mt-3 p-2 bg-slate-50 rounded text-xs">
                <div className="flex justify-between">
                  <span>البداية:</span>
                  <span className="font-medium">{format(value.from, 'dd/MM/yyyy', { locale: ar })}</span>
                </div>
                <div className="flex justify-between">
                  <span>النهاية:</span>
                  <span className="font-medium">{format(value.to, 'dd/MM/yyyy', { locale: ar })}</span>
                </div>
                <div className="flex justify-between border-t pt-1 mt-1">
                  <span>المدة:</span>
                  <span className="font-medium">
                    {Math.ceil((value.to.getTime() - value.from.getTime()) / (1000 * 60 * 60 * 24))} يوم
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}