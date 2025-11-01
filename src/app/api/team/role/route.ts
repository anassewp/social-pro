import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { withErrorHandler, successResponse } from '@/lib/middleware/errorHandler'
import { ValidationError, AuthenticationError } from '@/lib/errors'
import { UpdateMemberRoleSchema } from '@/lib/validations/team'
import { logger } from '@/lib/logger'

/**
 * API Route لتحديث دور عضو في الفريق
 * @route PUT /api/team/role
 * @body { memberId: string, role: 'admin' | 'manager' | 'operator' }
 * @returns رسالة نجاح
 */
async function handleUpdateRole(request: NextRequest) {
  const supabase = await createClient()
  
  // التحقق من المصادقة
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new AuthenticationError()
  }

  const body = await request.json()
  
  // التحقق من البيانات
  const validationResult = UpdateMemberRoleSchema.safeParse(body)
  
  if (!validationResult.success) {
    const fields = validationResult.error.issues.reduce((acc, err) => {
      acc[err.path.join('.')] = err.message
      return acc
    }, {} as Record<string, string>)
    
    throw new ValidationError('بيانات غير صالحة', fields)
  }

  const { memberId, role } = validationResult.data

  // جلب معلومات الفريق ودور المستخدم
  const { data: currentMember, error: teamError } = await supabase
    .from('team_members')
    .select('team_id, role')
    .eq('user_id', user.id)
    .single()

  if (teamError || !currentMember?.team_id) {
    throw new AuthenticationError('لا يوجد فريق مرتبط بحسابك')
  }

  // التحقق من الصلاحيات (admin فقط يمكنه تعديل الأدوار)
  if (currentMember.role !== 'admin') {
    throw new ValidationError('فقط المدير يمكنه تعديل أدوار الأعضاء')
  }

  // التحقق من أن العضو المحدد موجود في نفس الفريق
  const { data: targetMember, error: targetError } = await supabase
    .from('team_members')
    .select('user_id, role, team_id')
    .eq('id', memberId)
    .single()

  if (targetError || !targetMember) {
    throw new ValidationError('العضو المحدد غير موجود')
  }

  if (targetMember.team_id !== currentMember.team_id) {
    throw new ValidationError('العضو المحدد ليس في نفس الفريق')
  }

  // منع تغيير دور نفسك (الأمان)
  if (targetMember.user_id === user.id) {
    throw new ValidationError('لا يمكنك تغيير دورك الخاص')
  }

  // التحقق من تغيير دور admin (admin آخر فقط يمكنه تغيير دور admin)
  if (targetMember.role === 'admin' && currentMember.role !== 'admin') {
    throw new ValidationError('ليس لديك صلاحية لتعديل دور مدير آخر')
  }

  // استخدام service role للتحديث
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

  // تحديث الدور
  const { error: updateError } = await serviceSupabase
    .from('team_members')
    .update({ role: role })
    .eq('id', memberId)

  if (updateError) {
    throw new Error(`فشل في تحديث دور العضو: ${updateError.message}`)
  }

  // تسجيل في audit logs
  await serviceSupabase
    .from('audit_logs')
    .insert({
      user_id: user.id,
      team_id: currentMember.team_id,
      action: 'team_member_role_updated',
      resource_type: 'team_member',
      resource_id: memberId,
      details: JSON.stringify({
        member_user_id: targetMember.user_id,
        old_role: targetMember.role,
        new_role: role,
      })
    })

  logger.info('Team member role updated', {
    userId: user.id,
    teamId: currentMember.team_id,
    memberId,
    oldRole: targetMember.role,
    newRole: role,
  })

  return successResponse({
    message: 'تم تحديث دور العضو بنجاح',
  })
}

export const PUT = withErrorHandler(handleUpdateRole, { endpoint: '/api/team/role' })

