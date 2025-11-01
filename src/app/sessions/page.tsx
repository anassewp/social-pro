'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AddSessionModal } from '@/components/telegram/AddSessionModal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone, Plus, Trash2, RefreshCw, User, Calendar, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSessions, useDeleteSession } from '@/lib/hooks/useSessions'
import { useRealtimeSubscription } from '@/lib/hooks/useRealtime'
import { PageLoading, SectionLoading } from '@/components/ui/Loading'

export default function SessionsPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const { user } = useAuth()
  
  // React Query Hooks
  const { data: sessions, isLoading, error, refetch } = useSessions(user?.team_id || null)
  const deleteSession = useDeleteSession()

  // Real-time subscription للجلسات
  useRealtimeSubscription('telegram_sessions', user?.team_id || null, {
    enabled: !!user?.team_id,
    onInsert: () => {
      console.log('✅ New session added - refetching...')
      refetch()
    },
    onUpdate: () => {
      console.log('📝 Session updated - refetching...')
      refetch()
    },
    onDelete: () => {
      console.log('🗑️ Session deleted - refetching...')
      refetch()
    },
  })

  const handleSessionAdded = () => {
    refetch()
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الجلسة؟')) {
      return
    }

    try {
      await deleteSession.mutateAsync(sessionId)
      // React Query will automatically refetch
    } catch (error: any) {
      alert(error.message || 'فشل في حذف الجلسة')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageLoading message="جاري تحميل الجلسات..." />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">حدث خطأ</p>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'فشل في جلب الجلسات'}
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 ml-2" />
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const sessionsList = sessions || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">جلسات تيليجرام</h1>
            <p className="text-muted-foreground">إدارة جلسات تيليجرام الخاصة بك</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة جلسة جديدة
          </Button>
        </div>

        {sessionsList.length === 0 ? (
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                <Phone className="h-5 w-5 ml-2 text-blue-600" />
                جلساتك النشطة
              </CardTitle>
              <CardDescription>
                لا توجد جلسات تيليجرام حتى الآن
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Phone className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">ابدأ بإضافة جلسة تيليجرام</h3>
                <p className="text-muted-foreground mb-6">أضف رقم هاتفك لإنشاء جلسة تيليجرام جديدة</p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة جلسة الآن
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessionsList.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center text-slate-900">
                      <Phone className="h-5 w-5 ml-2 text-blue-600" />
                      {session.phone_number}
                      {session.session_name && (
                        <span className="text-sm text-muted-foreground mr-2">
                          ({session.session_name})
                        </span>
                      )}
                    </CardTitle>
                    <Badge variant={session.is_active ? "default" : "secondary"}>
                      {session.is_active ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {session.last_used && (
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <User className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          آخر استخدام
                        </p>
                        <p className="text-xs text-slate-600">
                          {formatDate(session.last_used)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-slate-600">
                    <Calendar className="h-3 w-3" />
                    <span>تم الإنشاء: {formatDate(session.created_at)}</span>
                  </div>
                  
                  <div className="flex space-x-2 rtl:space-x-reverse pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSession(session.id)}
                      disabled={deleteSession.isPending}
                      className="flex-1"
                    >
                      <Trash2 className="h-3 w-3 ml-1" />
                      {deleteSession.isPending ? 'جاري الحذف...' : 'حذف'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AddSessionModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          onSessionAdded={handleSessionAdded}
        />
      </div>
    </DashboardLayout>
  )
}
