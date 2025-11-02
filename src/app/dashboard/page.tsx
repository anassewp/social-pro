'use client'

import { useEffect, useState, Suspense } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  MessageSquare, 
  BarChart3, 
  Plus, 
  Phone,
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { PageLoading } from '@/components/ui/Loading'
import { DynamicStatsCard } from '@/components/dynamic/DynamicImports'
import { LoadingSpinner } from '@/components/ui/LoadingStates'

interface DashboardStats {
  totalSessions: number
  activeSessions: number
  totalGroups: number
  totalCampaigns: number
  runningCampaigns: number
  totalMembers: number
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user?.team_id) {
      fetchStats()
    } else {
      // For users without teams, set default stats
      setStats({
        totalSessions: 0,
        activeSessions: 0,
        totalGroups: 0,
        totalCampaigns: 0,
        runningCampaigns: 0,
        totalMembers: 0
      })
      setStatsLoading(false)
    }
  }, [user])

  const fetchStats = async () => {
    if (!user?.team_id) return

    try {
      // جلب عدد الجلسات
      const { count: totalSessions } = await supabase
        .from('telegram_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', user.team_id)

      const { count: activeSessions } = await supabase
        .from('telegram_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', user.team_id)
        .eq('is_active', true)

      // جلب عدد المجموعات
      const { count: totalGroups } = await supabase
        .from('groups')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', user.team_id)

      // جلب عدد الحملات
      const { count: totalCampaigns } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', user.team_id)

      const { count: runningCampaigns } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', user.team_id)
        .eq('status', 'running')

      // جلب عدد الأعضاء (يجب استخدام JOIN مع groups)
      // أولاً: جلب IDs المجموعات التابعة للفريق
      const { data: teamGroups } = await supabase
        .from('groups')
        .select('id')
        .eq('team_id', user.team_id)
      
      const groupIds = teamGroups?.map(g => g.id) || []
      
      // ثم: جلب عدد الأعضاء من هذه المجموعات
      const { count: totalMembers } = groupIds.length > 0
        ? await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .in('group_id', groupIds)
            .eq('is_bot', false) // فقط المستخدمين الحقيقيين
        : { count: 0 }

      setStats({
        totalSessions: totalSessions || 0,
        activeSessions: activeSessions || 0,
        totalGroups: totalGroups || 0,
        totalCampaigns: totalCampaigns || 0,
        runningCampaigns: runningCampaigns || 0,
        totalMembers: totalMembers || 0
      })
    } catch (error) {
      console.error('Error in fetchStats:', error)
      // في حالة الخطأ، نعرض أصفار
      setStats({
        totalSessions: 0,
        activeSessions: 0,
        totalGroups: 0,
        totalCampaigns: 0,
        runningCampaigns: 0,
        totalMembers: 0
      })
    } finally {
      setStatsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PageLoading message="جاري تحميل لوحة التحكم..." />
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            مرحباً، {user?.user_metadata?.full_name || 'المستخدم'} 👋
          </h1>
          <p className="text-slate-600">
            {user?.team_name ? `فريق: ${user.team_name}` : 'إليك نظرة عامة على أداء منصتك اليوم'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Suspense fallback={<div className="h-24 animate-pulse bg-muted rounded-lg" />}>
            <DynamicStatsCard
              title="جلسات تيليجرام"
              value={statsLoading ? <LoadingSpinner size="sm" /> : stats?.activeSessions || 0}
              subtitle={`من أصل ${stats?.totalSessions || 0} جلسة`}
              icon={Phone}
              color="blue"
            />
          </Suspense>
          
          <Suspense fallback={<div className="h-24 animate-pulse bg-muted rounded-lg" />}>
            <DynamicStatsCard
              title="المجموعات النشطة"
              value={statsLoading ? <LoadingSpinner size="sm" /> : stats?.totalGroups || 0}
              subtitle="مجموعة مستوردة"
              icon={MessageSquare}
              color="green"
            />
          </Suspense>
          
          <Suspense fallback={<div className="h-24 animate-pulse bg-muted rounded-lg" />}>
            <DynamicStatsCard
              title="الحملات الجارية"
              value={statsLoading ? <LoadingSpinner size="sm" /> : stats?.runningCampaigns || 0}
              subtitle={`من أصل ${stats?.totalCampaigns || 0} حملة`}
              icon={BarChart3}
              color="purple"
            />
          </Suspense>
          
          <Suspense fallback={<div className="h-24 animate-pulse bg-muted rounded-lg" />}>
            <DynamicStatsCard
              title="إجمالي الأعضاء"
              value={statsLoading ? <LoadingSpinner size="sm" /> : stats?.totalMembers || 0}
              subtitle="عضو مستخرج"
              icon={Users}
              color="orange"
            />
          </Suspense>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900">
                  <TrendingUp className="h-5 w-5 ml-2 text-blue-600" />
                  إجراءات سريعة
                </CardTitle>
                <CardDescription>
                  ابدأ بالمهام الأساسية لإدارة حملاتك التسويقية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button asChild size="lg" className="h-20 flex-col">
                    <Link href="/sessions">
                      <Phone className="h-6 w-6 mb-2" />
                      إضافة جلسة تيليجرام
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" size="lg" className="h-20 flex-col">
                    <Link href="/groups">
                      <MessageSquare className="h-6 w-6 mb-2" />
                      استيراد مجموعات
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" size="lg" className="h-20 flex-col">
                    <Link href="/campaigns">
                      <BarChart3 className="h-6 w-6 mb-2" />
                      إنشاء حملة جديدة
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" size="lg" className="h-20 flex-col">
                    <Link href="/analytics">
                      <Activity className="h-6 w-6 mb-2" />
                      عرض التقارير
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-slate-900">
                <Clock className="h-5 w-5 ml-2 text-blue-600" />
                النشاط الأخير
              </CardTitle>
              <CardDescription>
                آخر الأنشطة في فريقك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">تم إنشاء الفريق بنجاح</p>
                    <p className="text-xs text-slate-600">منذ قليل</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">تم تسجيل دخول جديد</p>
                    <p className="text-xs text-slate-600">منذ دقيقتين</p>
                  </div>
                </div>
                
                <div className="text-center py-6 text-slate-600">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">ابدأ بإضافة جلسة تيليجرام</p>
                  <p className="text-xs">لرؤية المزيد من الأنشطة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
