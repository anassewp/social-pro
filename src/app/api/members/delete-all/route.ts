import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * حذف جميع الأعضاء لفريق معين
 * @route DELETE /api/members/delete-all
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // الحصول على معلومات المستخدم
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'غير مصرح لك بهذه العملية' },
        { status: 401 }
      )
    }

    // جلب team_id ودور المستخدم من team_members
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('team_id, role')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (teamError || !teamMembers?.team_id) {
      return NextResponse.json(
        { error: 'لم يتم العثور على فريق المستخدم' },
        { status: 404 }
      )
    }

    // التحقق من أن المستخدم admin أو manager
    if (teamMembers.role !== 'admin' && teamMembers.role !== 'manager') {
      return NextResponse.json(
        { error: 'يجب أن تكون admin أو manager لحذف الأعضاء' },
        { status: 403 }
      )
    }

    // استخدام service role للحذف (لتجاوز RLS)
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

    // جلب جميع المجموعات التابعة للفريق
    const { data: groups, error: groupsError } = await serviceSupabase
      .from('groups')
      .select('id')
      .eq('team_id', teamMembers.team_id)

    if (groupsError) {
      return NextResponse.json(
        { error: 'فشل في جلب المجموعات', details: groupsError.message },
        { status: 500 }
      )
    }

    const groupIds = groups?.map(g => g.id) || []

    if (groupIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'لا توجد أعضاء لحذفها',
        count: 0
      })
    }

    // حذف جميع الأعضاء للمجموعات التابعة للفريق
    const { error: deleteError, count } = await serviceSupabase
      .from('group_members')
      .delete()
      .in('group_id', groupIds)

    if (deleteError) {
      console.error('Error deleting members:', deleteError)
      return NextResponse.json(
        { 
          error: 'فشل في حذف الأعضاء',
          details: deleteError.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف جميع الأعضاء بنجاح',
      count: count || 0
    })

  } catch (error: any) {
    console.error('Delete all members error:', error)
    
    return NextResponse.json(
      { error: error.message || 'فشل في حذف الأعضاء' },
      { status: 500 }
    )
  }
}

