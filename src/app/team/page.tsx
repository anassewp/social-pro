'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, Loader2, Shield, AlertCircle } from 'lucide-react'
import { useTeam } from '@/lib/hooks/useTeam'
import { useRealtimeSubscription } from '@/lib/hooks/useRealtime'
import { InviteMemberModal } from '@/components/team/InviteMemberModal'
import { MemberCard } from '@/components/team/MemberCard'
import { USER_ROLES } from '@/lib/constants'
import { PageLoading } from '@/components/ui/Loading'

export default function TeamPage() {
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const { data: teamData, isLoading, error, refetch } = useTeam()

  const canInvite = teamData?.currentUserRole === USER_ROLES.ADMIN || 
                    teamData?.currentUserRole === USER_ROLES.MANAGER

  // Real-time subscription لأعضاء الفريق
  useRealtimeSubscription('team_members', teamData?.team?.id || null, {
    enabled: !!teamData?.team?.id,
    onInsert: () => {
      console.log('✅ New team member added - refetching...')
      refetch()
    },
    onUpdate: () => {
      console.log('📝 Team member updated - refetching...')
      refetch()
    },
    onDelete: () => {
      console.log('🗑️ Team member removed - refetching...')
      refetch()
    },
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageLoading message="جاري تحميل معلومات الفريق..." />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  خطأ في تحميل معلومات الفريق
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {error instanceof Error ? error.message : 'حدث خطأ غير متوقع'}
                </p>
                <Button onClick={() => refetch()} variant="outline">
                  إعادة المحاولة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!teamData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md">
            <CardContent className="p-6">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  لا يوجد فريق
                </h3>
                <p className="text-sm text-slate-600">
                  لم يتم العثور على فريق مرتبط بحسابك
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const { team, members, currentUserRole, isOwner } = teamData

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">الفريق</h1>
            <p className="text-slate-600 mt-1">
              {team?.name || 'فريقي'}
            </p>
          </div>
          {canInvite && (
            <Button onClick={() => setInviteModalOpen(true)}>
              <UserPlus className="h-4 w-4 ml-2" />
              دعوة عضو جديد
            </Button>
          )}
        </div>

        {/* Team Info Card */}
        {team && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 ml-2" />
                معلومات الفريق
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-slate-700">اسم الفريق:</span>
                  <span className="text-sm text-slate-900 mr-2">{team.name}</span>
                </div>
                {team.description && (
                  <div>
                    <span className="text-sm font-medium text-slate-700">الوصف:</span>
                    <span className="text-sm text-slate-900 mr-2">{team.description}</span>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-slate-700">عدد الأعضاء:</span>
                  <span className="text-sm text-slate-900 mr-2">{members.length}</span>
                </div>
                {isOwner && (
                  <div>
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                      أنت المالك
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 ml-2" />
              أعضاء الفريق ({members.length})
            </CardTitle>
            <CardDescription>
              إدارة أعضاء فريقك وصلاحياتهم
            </CardDescription>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  لا يوجد أعضاء بعد
                </h3>
                <p className="text-slate-500 mb-6">
                  ابدأ بدعوة أعضاء جدد للفريق
                </p>
                {canInvite && (
                  <Button onClick={() => setInviteModalOpen(true)}>
                    <UserPlus className="h-4 w-4 ml-2" />
                    دعوة الآن
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    currentUserRole={currentUserRole}
                    isOwner={isOwner}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invite Modal */}
      <InviteMemberModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
      />
    </DashboardLayout>
  )
}
