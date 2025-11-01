import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { withErrorHandler, successResponse } from '@/lib/middleware/errorHandler'
import { ValidationError, AuthenticationError } from '@/lib/errors'
import { RemoveMemberSchema } from '@/lib/validations/team'
import { logger } from '@/lib/logger'

/**
 * API Route لإزالة عضو من الفريق
 * @route DELETE /api/team/member
 * @body { memberId: string }
 * @returns رسالة نجاح
 */
async function handleRemoveMember(request: NextRequest) {
  const supabase = await createClient()
  
  // التحقق من المصادقة
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new AuthenticationError()
  }

  const body = await request.json()
  
  // التحقق من البيانات
  const validationResult = RemoveMemberSchema.safeParse(body)
  
  if (!validationResult.success) {
    const fields = validationResult.error.issues.reduce((acc, err) => {
      acc[err.path.join('.')] = err.message
      return acc
    }, {} as Record<string, string>)
    
    throw new ValidationError('بيانات غير صالحة', fields)
  }

  const { memberId } = validationResult.data

  // جلب معلومات الفريق ودور المستخدم
  const { data: currentMember, error: teamError } = await supabase
    .from('team_members')
    .select('team_id, role')
    .eq('user_id', user.id)
    .single()

  if (teamError || !currentMember?.team_id) {
    throw new AuthenticationError('لا يوجد فريق مرتبط بحسابك')
  }

  // التحقق من الصلاحيات (admin أو manager يمكنهم إزالة الأعضاء)
  if (currentMember.role !== 'admin' && currentMember.role !== 'manager') {
    throw new ValidationError('ليس لديك صلاحية لإزالة أعضاء من الفريق')
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

  // منع إزالة نفسك (الأمان)
  if (targetMember.user_id === user.id) {
    throw new ValidationError('لا يمكنك إزالة نفسك من الفريق')
  }

  // التحقق من إزالة admin (admin آخر فقط يمكنه إزالة admin)
  if (targetMember.role === 'admin' && currentMember.role !== 'admin') {
    throw new ValidationError('ليس لديك صلاحية لإزالة مدير من الفريق')
  }

  // جلب معلومات الفريق للتحقق من owner
  const { data: team, error: teamInfoError } = await supabase
    .from('teams')
    .select('owner_id')
    .eq('id', currentMember.team_id)
    .single()

  // منع إزالة owner
  if (team?.owner_id === targetMember.user_id) {
    throw new ValidationError('لا يمكن إزالة مالك الفريق')
  }

  // استخدام service role للحذف
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

  // حذف العضو
  const { error: deleteError } = await serviceSupabase
    .from('team_members')
    .delete()
    .eq('id', memberId)

  if (deleteError) {
    throw new Error(`فشل في إزالة العضو: ${deleteError.message}`)
  }

  // تسجيل في audit logs
  await serviceSupabase
    .from('audit_logs')
    .insert({
      user_id: user.id,
      team_id: currentMember.team_id,
      action: 'team_member_removed',
      resource_type: 'team_member',
      resource_id: memberId,
      details: JSON.stringify({
        removed_user_id: targetMember.user_id,
        removed_role: targetMember.role,
      })
    })

  logger.info('Team member removed', {
    userId: user.id,
    teamId: currentMember.team_id,
    memberId,
    removedUserId: targetMember.user_id,
  })

  return successResponse({
    message: 'تم إزالة العضو من الفريق بنجاح',
  })
}

export const DELETE = withErrorHandler(handleRemoveMember, { endpoint: '/api/team/member' })

