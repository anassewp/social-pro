import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { withErrorHandler, successResponse } from '@/lib/middleware/errorHandler'
import { AuthenticationError } from '@/lib/errors'

/**
 * API Route لجلب قائمة أعضاء الفريق
 * @route GET /api/team/list
 * @returns قائمة أعضاء الفريق مع معلوماتهم
 */
async function handleList(request: NextRequest) {
  const supabase = await createClient()
  
  // التحقق من المصادقة
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new AuthenticationError()
  }

  // جلب معلومات الفريق الخاص بالمستخدم
  const { data: teamMember, error: teamError } = await supabase
    .from('team_members')
    .select('team_id, role')
    .eq('user_id', user.id)
    .single()

  if (teamError || !teamMember?.team_id) {
    throw new AuthenticationError('لا يوجد فريق مرتبط بحسابك')
  }

  // استخدام service role لجلب بيانات المستخدمين
  const serviceSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // جلب جميع أعضاء الفريق
  const { data: members, error: membersError } = await serviceSupabase
    .from('team_members')
    .select('id, user_id, role, joined_at, invited_by')
    .eq('team_id', teamMember.team_id)
    .order('joined_at', { ascending: false })

  if (membersError) {
    throw new Error(`فشل في جلب أعضاء الفريق: ${membersError.message}`)
  }

  // جلب بيانات المستخدمين من auth.users
  const userIds = members?.map(m => m.user_id) || []
  const formattedMembers = []

  if (userIds.length > 0) {
    // استخدام admin API لجلب بيانات المستخدمين
    // ملاحظة: يمكن تحسين الأداء عن طريق فلترة المستخدمين حسب userIds
    const { data: usersData, error: usersError } = await serviceSupabase.auth.admin.listUsers()

    if (usersError) {
      throw new Error(`فشل في جلب بيانات المستخدمين: ${usersError.message}`)
    }

    // إنشاء map للمستخدمين
    const usersMap = new Map(
      usersData?.users?.map(u => [u.id, u]) || []
    )

    // تنسيق البيانات
    for (const member of members || []) {
      const userData = usersMap.get(member.user_id)
      formattedMembers.push({
        id: member.id,
        userId: member.user_id,
        email: userData?.email || 'غير معروف',
        fullName: userData?.user_metadata?.full_name || 
                  userData?.email?.split('@')[0] || 
                  'مستخدم',
        role: member.role,
        joinedAt: member.joined_at,
        invitedBy: member.invited_by,
        isCurrentUser: member.user_id === user.id,
      })
    }
  }

  // جلب معلومات الفريق
  const { data: team, error: teamInfoError } = await supabase
    .from('teams')
    .select('id, name, description, owner_id, created_at')
    .eq('id', teamMember.team_id)
    .single()

  return successResponse({
    team: team || null,
    members: formattedMembers,
    currentUserRole: teamMember.role,
    isOwner: team?.owner_id === user.id,
  })
}

export const GET = withErrorHandler(handleList, { endpoint: '/api/team/list' })

