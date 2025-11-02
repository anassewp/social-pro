'use client'

import { ResponsiveTable } from './ResponsiveTable'
import { ResponsiveForm } from './ResponsiveForm'
import { TouchOptimizedButton } from './TouchOptimizedComponents'
import { useDeviceType } from '@/hooks/useDeviceType'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Example usage of the responsive components
export function ResponsiveDashboardExample() {
  const device = useDeviceType()

  const columns = [
    {
      key: 'id',
      title: 'الرقم',
      sortable: true,
      visible: true,
      mobileRender: (row: any) => `#${row.id}`
    },
    {
      key: 'name',
      title: 'الاسم',
      sortable: true,
      visible: true,
      render: (value: string) => (
        <div className="font-medium">{value}</div>
      ),
      mobileRender: (row: any) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-muted-foreground">{row.email}</div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'الحالة',
      sortable: true,
      visible: true,
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'default' : 'secondary'}>
          {value === 'active' ? 'نشط' : 'غير نشط'}
        </Badge>
      )
    },
    {
      key: 'created_at',
      title: 'تاريخ الإنشاء',
      sortable: true,
      visible: true,
      render: (value: string) => new Date(value).toLocaleDateString('ar-SA')
    }
  ]

  const sampleData = [
    { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', status: 'active', created_at: '2024-01-15' },
    { id: 2, name: 'فاطمة علي', email: 'fatima@example.com', status: 'inactive', created_at: '2024-01-16' },
    { id: 3, name: 'محمد أحمد', email: 'mohamed@example.com', status: 'active', created_at: '2024-01-17' },
  ]

  const formFields = [
    {
      name: 'name',
      label: 'الاسم',
      type: 'text' as const,
      required: true,
      placeholder: 'أدخل الاسم',
      validation: {
        minLength: 2,
        maxLength: 50
      }
    },
    {
      name: 'email',
      label: 'البريد الإلكتروني',
      type: 'email' as const,
      required: true,
      placeholder: 'example@domain.com',
      validation: {
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
      }
    },
    {
      name: 'status',
      label: 'الحالة',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'active', label: 'نشط' },
        { value: 'inactive', label: 'غير نشط' }
      ]
    },
    {
      name: 'description',
      label: 'الوصف',
      type: 'textarea' as const,
      placeholder: 'وصف اختياري...',
      validation: {
        maxLength: 500
      }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Device Info */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-2">معلومات الجهاز</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">النوع:</span>
            <span className="mr-2 text-muted-foreground">{device.type}</span>
          </div>
          <div>
            <span className="font-medium">الشاشة:</span>
            <span className="mr-2 text-muted-foreground">{device.screenWidth}x{device.screenHeight}</span>
          </div>
          <div>
            <span className="font-medium">الاتجاه:</span>
            <span className="mr-2 text-muted-foreground">{device.orientation === 'portrait' ? 'عمودي' : 'أفقي'}</span>
          </div>
          <div>
            <span className="font-medium">اللمس:</span>
            <span className="mr-2 text-muted-foreground">{device.supportsTouch ? 'مدعوم' : 'غير مدعوم'}</span>
          </div>
        </div>
      </Card>

      {/* Responsive Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">جدول البيانات المتجاوب</h2>
        <ResponsiveTable
          data={sampleData}
          columns={columns}
          searchable={true}
          filterable={true}
          exportable={true}
          actions={{
            view: (row) => console.log('View:', row),
            edit: (row) => console.log('Edit:', row),
            delete: (row) => console.log('Delete:', row)
          }}
        />
      </Card>

      {/* Responsive Form */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">نموذج متجاوب</h2>
        <ResponsiveForm
          fields={formFields}
          onSubmit={(data) => {
            console.log('Form submitted:', data)
          }}
          layout="vertical"
        />
      </Card>

      {/* Touch Optimized Buttons */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">أزرار محسنة للمس</h2>
        <div className="flex flex-wrap gap-3">
          <TouchOptimizedButton size="mobile" variant="default">
            زر الجوال
          </TouchOptimizedButton>
          <TouchOptimizedButton size="default" variant="outline">
            زر عادي
          </TouchOptimizedButton>
          <TouchOptimizedButton size="lg" variant="secondary">
            زر كبير
          </TouchOptimizedButton>
          <TouchOptimizedButton 
            size="icon" 
            variant="ghost"
            tooltip="معلومة"
          >
            ?
          </TouchOptimizedButton>
        </div>
      </Card>

      {/* Responsive Grid */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">شبكة متجاوبة</h2>
        <div className={cn(
          'grid gap-4',
          'grid-cols-1 mobile-sm:grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4'
        )}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                'bg-primary/10 border rounded-lg p-4 text-center',
                'transition-all hover:shadow-md'
              )}
            >
              <div className="font-medium">عنصر {i + 1}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {device.type} - {device.orientation === 'portrait' ? 'عمودي' : 'أفقي'}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}