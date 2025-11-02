'use client'

import React from 'react'
import { 
  ResponsiveLayout, 
  ResponsivePageHeader, 
  ResponsiveContentGrid, 
  ResponsiveCard,
  ResponsiveTable,
  ResponsiveForm,
  TouchOptimizedButton,
  useDeviceType,
  useBreakpoint
} from './index'

// Example data
const sampleData = [
  { id: 1, name: 'أحمد محمد', status: 'نشط', date: '2024-01-15' },
  { id: 2, name: 'فاطمة علي', status: 'غير نشط', date: '2024-01-16' },
  { id: 3, name: 'محمد أحمد', status: 'نشط', date: '2024-01-17' },
]

const columns = [
  { key: 'id', title: 'الرقم', sortable: true },
  { key: 'name', title: 'الاسم', sortable: true },
  { key: 'status', title: 'الحالة', sortable: true },
  { key: 'date', title: 'التاريخ', sortable: true },
]

const formFields = [
  { name: 'name', label: 'الاسم', type: 'text' as const, required: true },
  { name: 'email', label: 'البريد الإلكتروني', type: 'email' as const, required: true },
  { name: 'status', label: 'الحالة', type: 'select' as const, options: [
    { value: 'active', label: 'نشط' },
    { value: 'inactive', label: 'غير نشط' }
  ]},
]

/**
 * مثال شامل لاستخدام المكونات المتجاوبة
 * 
 * يوضح كيفية:
 * - إنشاء layout متجاوب
 * - استخدام جداول متجاوبة
 * - إنشاء نماذج متجاوبة
 * - تحسين التفاعل للمس
 * - التكيف مع أحجام الشاشات
 */
export function ResponsiveUsageExample() {
  const device = useDeviceType()
  const breakpoint = useBreakpoint()

  return (
    <ResponsiveLayout
      user={{ name: 'مستخدم تجريبي', role: 'مدير' }}
      notifications={3}
      title="مثال التصميم المتجاوب"
      breadcrumbs={[
        { label: 'الرئيسية' },
        { label: 'أمثلة' },
        { label: 'التصميم المتجاوب' }
      ]}
    >
      <div className="space-y-6">
        {/* Header مع عنوان وإجراءات */}
        <ResponsivePageHeader
          title="لوحة التحكم التفاعلية"
          description="مثال شامل للتصميم المتجاوب"
          actions={
            <TouchOptimizedButton size={device.isMobile ? 'mobile' : 'default'}>
              إضافة جديد
            </TouchOptimizedButton>
          }
        />

        {/* معلومات الجهاز */}
        <ResponsiveCard>
          <h3 className="text-lg font-semibold mb-4">معلومات الجهاز</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">النوع:</span>
              <div className="font-medium">{device.type}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">الشاشة:</span>
              <div className="font-medium">{device.screenWidth}x{device.screenHeight}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">الاتجاه:</span>
              <div className="font-medium">{device.orientation}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Breakpoint:</span>
              <div className="font-medium">{breakpoint.currentBreakpoint}</div>
            </div>
          </div>
        </ResponsiveCard>

        {/* جدول متجاوب */}
        <ResponsiveCard>
          <ResponsiveTable
            data={sampleData}
            columns={columns}
            searchable={true}
            filterable={true}
            actions={{
              view: (row) => console.log('View:', row),
              edit: (row) => console.log('Edit:', row)
            }}
          />
        </ResponsiveCard>

        {/* شبكة متجاوبة */}
        <ResponsiveContentGrid columns="auto" gap="md">
          <ResponsiveCard>
            <h4 className="font-semibold mb-2">إحصائيات سريعة</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>المستخدمون النشطون</span>
                <span className="font-medium">142</span>
              </div>
              <div className="flex justify-between">
                <span>الحملات الجارية</span>
                <span className="font-medium">23</span>
              </div>
              <div className="flex justify-between">
                <span>معدل التفاعل</span>
                <span className="font-medium">4.2%</span>
              </div>
            </div>
          </ResponsiveCard>

          <ResponsiveCard>
            <h4 className="font-semibold mb-2">أحداث حديثة</h4>
            <div className="space-y-2">
              <div className="text-sm">
                <div className="font-medium">حملة جديدة تم إنشاؤها</div>
                <div className="text-muted-foreground">منذ 5 دقائق</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">مستخدم جديد انضم</div>
                <div className="text-muted-foreground">منذ 15 دقيقة</div>
              </div>
            </div>
          </ResponsiveCard>

          <ResponsiveCard>
            <h4 className="font-semibold mb-2">إجراءات سريعة</h4>
            <div className="space-y-2">
              <TouchOptimizedButton size="sm" className="w-full">
                إنشاء حملة
              </TouchOptimizedButton>
              <TouchOptimizedButton size="sm" variant="outline" className="w-full">
                دعوة عضو
              </TouchOptimizedButton>
              <TouchOptimizedButton size="sm" variant="outline" className="w-full">
                عرض التقارير
              </TouchOptimizedButton>
            </div>
          </ResponsiveCard>
        </ResponsiveContentGrid>

        {/* نموذج متجاوب */}
        <ResponsiveCard>
          <ResponsiveForm
            fields={formFields}
            onSubmit={(data) => console.log('Form submitted:', data)}
            layout={device.isMobile ? 'vertical' : 'mixed'}
          />
        </ResponsiveCard>

        {/* مثال على التكيف مع الشاشة */}
        <ResponsiveCard>
          <h3 className="text-lg font-semibold mb-4">تخطيط متكيف</h3>
          <div className={cn(
            'grid gap-4',
            device.isMobile && 'grid-cols-1',
            device.isTablet && 'grid-cols-2',
            device.isDesktop && 'grid-cols-3'
          )}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-primary/10 p-4 rounded-lg text-center">
                <div className="font-medium">بطاقة {i + 1}</div>
                <div className="text-sm text-muted-foreground">
                  {device.type} - {breakpoint.currentBreakpoint}
                </div>
              </div>
            ))}
          </div>
        </ResponsiveCard>
      </div>
    </ResponsiveLayout>
  )
}

/**
 * مثال مبسط للتوضيح
 */
export function SimpleResponsiveExample() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
        مرحباً بك في التصميم المتجاوب
      </h1>
      <p className="text-base md:text-lg text-muted-foreground mb-6">
        هذا مثال بسيط يوضح كيفية إنشاء تخطيط يتكيف مع أحجام الشاشات المختلفة
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold mb-2">عنصر {i + 1}</h3>
            <p className="text-sm text-muted-foreground">
              محتوى يتكيف مع الشاشة
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}