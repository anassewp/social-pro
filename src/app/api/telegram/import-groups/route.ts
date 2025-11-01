import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, groups } = await request.json()

    if (!sessionId || !groups || groups.length === 0) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة مفقودة' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // جلب معلومات الجلسة للحصول على team_id و user_id
    const { data: session, error: sessionError } = await supabase
      .from('telegram_sessions')
      .select('team_id, user_id')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'الجلسة غير موجودة' },
        { status: 404 }
      )
    }

    // إعداد البيانات للإدراج
    const groupsToInsert = groups.map((group: any) => ({
      name: group.title,
      username: group.username || null,
      telegram_id: group.id,
      type: group.type,
      member_count: group.participantsCount || 0,
      team_id: session.team_id,
      added_by: session.user_id,
      is_active: true,
    }))

    // إدراج المجموعات (مع تجاهل التكرارات)
    const { data, error } = await supabase
      .from('groups')
      .upsert(groupsToInsert, {
        onConflict: 'team_id,telegram_id',
        ignoreDuplicates: false,
      })
      .select()

    if (error) {
      console.error('Insert groups error:', error)
      return NextResponse.json(
        { error: 'فشل في حفظ المجموعات' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      imported: groups.length,
      message: `تم استيراد ${groups.length} مجموعة بنجاح`,
    })

  } catch (error: any) {
    console.error('Import groups error:', error)
    
    return NextResponse.json(
      { error: error.message || 'فشل في استيراد المجموعات' },
      { status: 500 }
    )
  }
}
