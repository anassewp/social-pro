'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity, Download } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">التقارير والتحليلات</h1>
            <p className="text-slate-600">تحليل أداء حملاتك التسويقية</p>
          </div>
          <Button>
            <Download className="h-4 w-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 ml-2" />
              تحليلات الأداء
            </CardTitle>
            <CardDescription>
              لا توجد بيانات كافية لعرض التحليلات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">ابدأ حملة لرؤية التحليلات</h3>
              <p className="text-slate-500 mb-6">بمجرد تشغيل حملاتك ستظهر هنا تحليلات مفصلة للأداء</p>
              <Button>
                <Activity className="h-4 w-4 ml-2" />
                عرض الإحصائيات
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
