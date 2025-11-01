import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { encryptTelegramSession } from '@/lib/encryption'

export async function POST(request: NextRequest) {
  try {
    const { sessionString, userInfo, phoneNumber, teamId, userId } = await request.json()

    if (!sessionString || !phoneNumber || !teamId || !userId) {
      return NextResponse.json(
        { error: 'جميع البيانات مطلوبة' },
        { status: 400 }
      )
    }

    // تشفير الجلسة
    const encryptedSession = encryptTelegramSession(sessionString)

    // استخدام service role للكتابة في قاعدة البيانات
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    const { data, error } = await supabase
      .from('telegram_sessions')
      .insert({
        user_id: userId,
        team_id: teamId,
        phone_number: phoneNumber,
        session_name: userInfo?.firstName || phoneNumber,
        encrypted_session: encryptedSession,
        is_active: true,
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      throw new Error(`فشل في حفظ الجلسة: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'تم حفظ الجلسة بنجاح',
      data
    })

  } catch (error: any) {
    console.error('Save session error:', error)
    
    return NextResponse.json(
      { error: error.message || 'فشل في حفظ الجلسة' },
      { status: 500 }
    )
  }
}
