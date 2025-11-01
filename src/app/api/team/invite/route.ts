import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { withErrorHandler, successResponse } from '@/lib/middleware/errorHandler'
import { ValidationError, AuthenticationError } from '@/lib/errors'
import { InviteMemberSchema } from '@/lib/validations/team'
import { logger } from '@/lib/logger'

/**
 * API Route لدعوة عضو جديد للفريق
 * @route POST /api/team/invite
 * @body { email: string, role: 'admin' | 'manager' | 'operator' }
 * @returns رسالة نجاح
 */
async function handleInvite(request: NextRequest) {
  const supabase = await createClient()
  
  // التحقق من المصادقة
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new AuthenticationError()
  }

  const body = await request.json()
  
  // التحقق من البيانات
  const validationResult = InviteMemberSchema.safeParse(body)
  
  if (!validationResult.success) {
    const fields = validationResult.error.issues.reduce((acc, err) => {
      acc[err.path.join('.')] = err.message
      return acc
    }, {} as Record<string, string>)
    
    throw new ValidationError('بيانات غير صالحة', fields)
  }

  const { email, role } = validationResult.data

  // جلب معلومات الفريق ودور المستخدم
  const { data: teamMember, error: teamError } = await supabase
    .from('team_members')
    .select('team_id, role')
    .eq('user_id', user.id)
    .single()

  if (teamError || !teamMember?.team_id) {
    throw new AuthenticationError('لا يوجد فريق مرتبط بحسابك')
  }

  // التحقق من الصلاحيات (admin أو manager فقط يمكنهم الدعوة)
  if (teamMember.role !== 'admin' && teamMember.role !== 'manager') {
    throw new ValidationError('ليس لديك صلاحية لدعوة أعضاء جدد')
  }

  // التحقق من أن العضو المراد دعوته ليس admin (admin يمكنه فقط دعوة admin آخر)
  if (role === 'admin' && teamMember.role !== 'admin') {
    throw new ValidationError('فقط المدير يمكنه دعوة مدير آخر')
  }

  // استخدام service role للتحقق من المستخدم
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

  // البحث عن المستخدم بالبريد الإلكتروني
  const { data: existingUsers, error: userSearchError } = await serviceSupabase.auth.admin.listUsers()

  if (userSearchError) {
    throw new Error(`فشل في البحث عن المستخدم: ${userSearchError.message}`)
  }

  const existingUser = existingUsers?.users?.find(u => u.email === email)

  // إذا كان المستخدم موجوداً بالفعل، أضفه مباشرة للفريق
  if (existingUser) {
    // التحقق من أن المستخدم ليس عضواً بالفعل
    const { data: existingMember, error: checkError } = await serviceSupabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamMember.team_id)
      .eq('user_id', existingUser.id)
      .single()

    if (existingMember) {
      throw new ValidationError('هذا المستخدم عضو بالفعل في الفريق')
    }

    // إضافة المستخدم للفريق
    const { error: insertError } = await serviceSupabase
      .from('team_members')
      .insert({
        team_id: teamMember.team_id,
        user_id: existingUser.id,
        role: role,
        invited_by: user.id,
      })

    if (insertError) {
      throw new Error(`فشل في إضافة العضو: ${insertError.message}`)
    }

    // تسجيل في audit logs
    await serviceSupabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        team_id: teamMember.team_id,
        action: 'team_member_added',
        resource_type: 'team_member',
        resource_id: existingUser.id,
        details: JSON.stringify({
          added_user_email: email,
          role: role,
        })
      })

    logger.info('Team member added', {
      userId: user.id,
      teamId: teamMember.team_id,
      addedUserId: existingUser.id,
      role,
    })

    return successResponse({
      message: 'تم إضافة العضو للفريق بنجاح',
      userExists: true,
    })
  }

  // إذا لم يكن المستخدم موجوداً، نرسل دعوة (في المستقبل يمكن إضافة نظام دعوات)
  // حالياً نعتبر أن المستخدم يجب أن يسجل أولاً
  throw new ValidationError(
    'المستخدم غير موجود في النظام. يجب أن يسجل المستخدم أولاً قبل إضافته للفريق'
  )
}

export const POST = withErrorHandler(handleInvite, { endpoint: '/api/team/invite' })

