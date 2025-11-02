'use client'

import { 
  ResponsiveLayout, 
  ResponsivePageHeader, 
  ResponsiveContentGrid, 
  ResponsiveCard,
  ResponsiveTable,
  ResponsiveForm,
  TouchOptimizedButton,
  MobileNavigation,
  useDeviceType,
  useOrientation
} from '@/components/layout'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Phone, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Settings,
  UserCog,
  Activity,
  Plus,
  Filter,
  Download,
  Search,
  Bell,
  Grid3X3,
  List,
  ChevronRight,
  Mail,
  Calendar,
  Tag,
  Globe
} from 'lucide-react'

export default function ResponsiveTestPage() {
  const device = useDeviceType()
  const orientation = useOrientation()
  const [tableData] = useState([
    { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', status: 'نشط', role: 'مدير', created_at: '2024-01-15', last_login: 'منذ 5 دقائق' },
    { id: 2, name: 'فاطمة علي', email: 'fatima@example.com', status: 'غير نشط', role: 'محرر', created_at: '2024-01-16', last_login: 'منذ يوم' },
    { id: 3, name: 'محمد أحمد', email: 'mohamed@example.com', status: 'نشط', role: 'مشغل', created_at: '2024-01-17', last_login: 'منذ ساعتين' },
    { id: 4, name: 'سارة حسن', email: 'sara@example.com', status: 'نشط', role: 'مدير', created_at: '2024-01-18', last_login: 'منذ 30 دقيقة' },
    { id: 5, name: 'عمر خالد', email: 'omar@example.com', status: 'غير نشط', role: 'مشغل', created_at: '2024-01-19', last_login: 'منذ 3 أيام' },
  ])

  const columns = [
    {
      key: 'id',
      title: 'الرقم',
      sortable: true,
      visible: true,
      width: '80px',
      mobileRender: (row: any) => `#${row.id}`
    },
    {
      key: 'name',
      title: 'الاسم',
      sortable: true,
      visible: true,
      render: (value: string) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {value.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium">{value}</div>
          </div>
        </div>
      ),
      mobileRender: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {row.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{row.name}</div>
            <div className="text-sm text-muted-foreground truncate">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'الحالة',
      sortable: true,
      visible: true,
      render: (value: string) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value === 'نشط' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'role',
      title: 'الدور',
      sortable: true,
      visible: device.isDesktop || device.isTablet,
      render: (value: string) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
          {value}
        </span>
      )
    },
    {
      key: 'last_login',
      title: 'آخر دخول',
      visible: device.isDesktop,
      render: (value: string) => (
        <span className="text-sm text-muted-foreground">{value}</span>
      )
    },
    {
      key: 'created_at',
      title: 'تاريخ الإنشاء',
      sortable: true,
      visible: device.isDesktop,
      render: (value: string) => (
        <span className="text-sm">{new Date(value).toLocaleDateString('ar-SA')}</span>
      )
    }
  ]

  const formFields = [
    {
      name: 'name',
      label: 'الاسم الكامل',
      type: 'text' as const,
      required: true,
      placeholder: 'أدخل الاسم الكامل',
      validation: {
        minLength: 2,
        maxLength: 50
      },
      helpText: 'الاسم كما يظهر في الهوية'
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
      name: 'role',
      label: 'الدور',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'admin', label: 'مدير' },
        { value: 'manager', label: 'مدير فريق' },
        { value: 'editor', label: 'محرر' },
        { value: 'operator', label: 'مشغل' }
      ]
    },
    {
      name: 'status',
      label: 'الحالة',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'active', label: 'نشط' },
        { value: 'inactive', label: 'غير نشط' },
        { value: 'suspended', label: 'موقوف' }
      ]
    },
    {
      name: 'phone',
      label: 'رقم الهاتف',
      type: 'tel' as const,
      placeholder: '+966 50 123 4567',
      validation: {
        pattern: '^\\+?[1-9]\\d{1,14}$'
      },
      helpText: 'رقم الهاتف مع رمز الدولة'
    },
    {
      name: 'bio',
      label: 'نبذة شخصية',
      type: 'textarea' as const,
      placeholder: 'اكتب نبذة قصيرة عن yourself...',
      validation: {
        maxLength: 500
      }
    },
    {
      name: 'website',
      label: 'الموقع الإلكتروني',
      type: 'url' as const,
      placeholder: 'https://example.com',
      validation: {
        pattern: '^https?:\\/\\/.+'
      },
      helpText: 'رابط الموقع الشخصي أو الشركة'
    },
    {
      name: 'newsletter',
      label: 'اشتراك في النشرة الإخبارية',
      type: 'checkbox' as const,
      helpText: 'تلقي التحديثات والإشعارات المهمة'
    }
  ]

  const handleSubmit = async (data: Record<string, any>) => {
    console.log('Form submitted:', data)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('تم حفظ البيانات بنجاح!')
  }

  return (
    <ResponsiveLayout
      user={{
        name: 'أحمد محمد',
        email: 'ahmed@socialpro.com',
        role: 'مدير النظام',
        avatar: 'A'
      }}
      notifications={5}
      title="اختبار التصميم المتجاوب"
      breadcrumbs={[
        { label: 'الرئيسية', href: '/' },
        { label: 'التطوير', href: '/dev' },
        { label: 'اختبار التصميم المتجاوب' }
      ]}
      actions={
        <div className="flex gap-2">
          <TouchOptimizedButton variant="outline" size={device.isMobile ? 'mobile' : 'default'}>
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </TouchOptimizedButton>
          <TouchOptimizedButton size={device.isMobile ? 'mobile' : 'default'}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة جديد
          </TouchOptimizedButton>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Device Information Card */}
        <ResponsiveCard>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              معلومات الجهاز الحالي
            </h2>
            
            <div className={cn(
              'grid gap-4',
              'grid-cols-1 mobile-sm:grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4'
            )}>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">نوع الجهاز</div>
                <div className="font-medium capitalize">
                  {device.type === 'mobile' && '📱 هاتف'}
                  {device.type === 'tablet' && '📱 جهاز لوحي'}
                  {device.type === 'desktop' && '💻 كمبيوتر'}
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">حجم الشاشة</div>
                <div className="font-medium">{device.screenWidth} × {device.screenHeight}</div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">الاتجاه</div>
                <div className="font-medium">
                  {orientation === 'portrait' ? '📱 عمودي' : '📱 أفقي'}
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">دعم اللمس</div>
                <div className="font-medium">
                  {device.supportsTouch ? '✅ مدعوم' : '❌ غير مدعوم'}
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">سرعة الاتصال</div>
                <div className="font-medium">
                  {device.connectionSpeed === 'slow' && '🐌 بطيء'}
                  {device.connectionSpeed === 'medium' && '🚗 متوسط'}
                  {device.connectionSpeed === 'fast' && '🚀 سريع'}
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">PWA</div>
                <div className="font-medium">
                  {device.isPWA ? '✅ تطبيق ويب' : '❌ متصفح عادي'}
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">نسبة العرض</div>
                <div className="font-medium">{device.pixelRatio}x</div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">المعالج</div>
                <div className="font-medium">
                  {device.prefersReducedMotion ? '🐢 محسن' : '⚡ عادي'}
                </div>
              </div>
            </div>
          </div>
        </ResponsiveCard>

        {/* Responsive Table */}
        <ResponsiveCard>
          <ResponsivePageHeader
            title="جدول البيانات المتجاوب"
            description="جدول يتكيف مع حجم الشاشة ويوفر تجربة ممتازة على جميع الأجهزة"
            actions={
              <div className="flex gap-2">
                <TouchOptimizedButton variant="outline" size={device.isMobile ? 'mobile' : 'sm'}>
                  <Filter className="h-4 w-4 ml-2" />
                  تصفية
                </TouchOptimizedButton>
                <TouchOptimizedButton variant="outline" size={device.isMobile ? 'mobile' : 'sm'}>
                  <List className="h-4 w-4 ml-2" />
                  عرض القائمة
                </TouchOptimizedButton>
              </div>
            }
          />
          
          <ResponsiveTable
            data={tableData}
            columns={columns}
            searchable={true}
            filterable={true}
            exportable={true}
            pageSize={10}
            actions={{
              view: (row) => alert(`عرض ${row.name}`),
              edit: (row) => alert(`تعديل ${row.name}`),
              delete: (row) => confirm(`حذف ${row.name}؟`)
            }}
            emptyMessage="لا توجد بيانات"
          />
        </ResponsiveCard>

        {/* Responsive Form */}
        <ResponsiveCard>
          <ResponsivePageHeader
            title="نموذج متجاوب"
            description="نموذج يتكيف مع حجم الشاشة ويحسن تجربة الإدخال على الجوال"
            actions={
              <TouchOptimizedButton 
                variant="outline" 
                size={device.isMobile ? 'mobile' : 'sm'}
                tooltip="معلومة عن النموذج"
              >
                <Bell className="h-4 w-4 ml-2" />
                مساعدة
              </TouchOptimizedButton>
            }
          />
          
          <ResponsiveForm
            fields={formFields}
            onSubmit={handleSubmit}
            layout={device.isMobile ? 'vertical' : 'mixed'}
            compact={device.isMobile}
            showPasswordToggle={true}
            showValidationIcons={true}
            submitText="حفظ البيانات"
            cancelText="إلغاء"
          />
        </ResponsiveCard>

        {/* Touch Optimized Components */}
        <ResponsiveCard>
          <h2 className="text-lg font-semibold mb-4">مكونات محسنة للمس</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">أحجام الأزرار</h3>
              <div className="flex flex-wrap gap-3">
                <TouchOptimizedButton size="sm" variant="outline">
                  صغير
                </TouchOptimizedButton>
                <TouchOptimizedButton size="default" variant="outline">
                  عادي
                </TouchOptimizedButton>
                <TouchOptimizedButton size="lg" variant="outline">
                  كبير
                </TouchOptimizedButton>
                <TouchOptimizedButton size="mobile" variant="default">
                  محسن للجوال
                </TouchOptimizedButton>
                <TouchOptimizedButton 
                  size="icon" 
                  variant="ghost"
                  tooltip="معلومة"
                >
                  <Search className="h-4 w-4" />
                </TouchOptimizedButton>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">أنواع الأزرار</h3>
              <div className="flex flex-wrap gap-3">
                <TouchOptimizedButton variant="default">
                  افتراضي
                </TouchOptimizedButton>
                <TouchOptimizedButton variant="outline">
                  مخطط
                </TouchOptimizedButton>
                <TouchOptimizedButton variant="secondary">
                  ثانوي
                </TouchOptimizedButton>
                <TouchOptimizedButton variant="ghost">
                  شفاف
                </TouchOptimizedButton>
                <TouchOptimizedButton variant="destructive">
                  خطر
                </TouchOptimizedButton>
              </div>
            </div>
          </div>
        </ResponsiveCard>

        {/* Responsive Grid */}
        <ResponsiveCard>
          <ResponsivePageHeader
            title="شبكة متجاوبة"
            description="تخطيط يتكيف مع حجم الشاشة"
          />
          
          <ResponsiveContentGrid columns={device.isMobile ? 1 : device.isTablet ? 2 : 3} gap="lg">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i}
                className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 text-center hover:shadow-md transition-all duration-200"
              >
                <div className="text-2xl mb-2">
                  {['📊', '📈', '💬', '👥', '🎯', '📱'][i]}
                </div>
                <div className="font-medium">عنصر {i + 1}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {device.type} - {orientation === 'portrait' ? 'عمودي' : 'أفقي'}
                </div>
              </div>
            ))}
          </ResponsiveContentGrid>
        </ResponsiveCard>

        {/* Feature Highlights */}
        <ResponsiveContentGrid columns="auto">
          <ResponsiveCard>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold">محسن للجوال</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              تصميم Mobile-first يتكيف مع جميع أحجام الشاشات
            </p>
          </ResponsiveCard>

          <ResponsiveCard>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold">أداء محسن</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              تحسينات للأجهزة الضعيفة وسرعة التحميل
            </p>
          </ResponsiveCard>

          <ResponsiveCard>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Grid3X3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold">تفاعل ذكي</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              أزرار محسنة للمس مع ردود فعل haptic
            </p>
          </ResponsiveCard>
        </ResponsiveContentGrid>
      </div>
    </ResponsiveLayout>
  )
}