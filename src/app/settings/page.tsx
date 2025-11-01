'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings, Save, User, Shield, Bell } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">الإعدادات</h1>
          <p className="text-slate-600">إدارة إعدادات حسابك والتطبيق</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 ml-2" />
                  الملف الشخصي
                </CardTitle>
                <CardDescription>
                  تحديث معلوماتك الشخصية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="text-sm font-medium text-slate-700 mb-2 block">الاسم الكامل</label>
                  <Input 
                    id="fullName"
                    name="fullName"
                    autoComplete="name"
                    defaultValue={user?.user_metadata?.full_name || ''} 
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-slate-700 mb-2 block">البريد الإلكتروني</label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    defaultValue={user?.email || ''} 
                    placeholder="أدخل بريدك الإلكتروني"
                    disabled
                  />
                </div>
                <div>
                  <label htmlFor="companyName" className="text-sm font-medium text-slate-700 mb-2 block">اسم الشركة</label>
                  <Input 
                    id="companyName"
                    name="companyName"
                    autoComplete="organization"
                    defaultValue={user?.user_metadata?.company_name || ''} 
                    placeholder="أدخل اسم شركتك"
                  />
                </div>
                <Button>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 ml-2" />
                  الأمان
                </CardTitle>
                <CardDescription>
                  إدارة كلمة المرور والأمان
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="text-sm font-medium text-slate-700 mb-2 block">كلمة المرور الحالية</label>
                  <Input 
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    placeholder="أدخل كلمة المرور الحالية" 
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="text-sm font-medium text-slate-700 mb-2 block">كلمة المرور الجديدة</label>
                  <Input 
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="أدخل كلمة المرور الجديدة" 
                  />
                </div>
                <div>
                  <label htmlFor="confirmNewPassword" className="text-sm font-medium text-slate-700 mb-2 block">تأكيد كلمة المرور</label>
                  <Input 
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="أعد إدخال كلمة المرور الجديدة" 
                  />
                </div>
                <Button variant="outline">
                  <Shield className="h-4 w-4 ml-2" />
                  تحديث كلمة المرور
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Side Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 ml-2" />
                  الإشعارات
                </CardTitle>
                <CardDescription>
                  إدارة تفضيلات الإشعارات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="emailNotifications" className="text-sm font-medium cursor-pointer">إشعارات البريد الإلكتروني</label>
                  <input 
                    id="emailNotifications"
                    name="emailNotifications"
                    type="checkbox" 
                    className="rounded" 
                    defaultChecked 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="campaignNotifications" className="text-sm font-medium cursor-pointer">إشعارات الحملات</label>
                  <input 
                    id="campaignNotifications"
                    name="campaignNotifications"
                    type="checkbox" 
                    className="rounded" 
                    defaultChecked 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="weeklyReports" className="text-sm font-medium cursor-pointer">تقارير أسبوعية</label>
                  <input 
                    id="weeklyReports"
                    name="weeklyReports"
                    type="checkbox" 
                    className="rounded" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>معلومات الحساب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">نوع الحساب:</span>
                  <span className="font-medium">مجاني</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">تاريخ الإنشاء:</span>
                  <span className="font-medium">اليوم</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">آخر تسجيل دخول:</span>
                  <span className="font-medium">الآن</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
