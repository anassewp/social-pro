import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { decryptTelegramSession } from '@/lib/encryption'

/**
 * API Route للانضمام إلى مجموعة تيليجرام
 * 
 * @route POST /api/telegram/join-group
 * @body { groupId: string, sessionId: string }
 * @returns { success: boolean, message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { groupId, sessionId } = await request.json()

    if (!groupId || !sessionId) {
      return NextResponse.json(
        { error: 'معرف المجموعة ومعرف الجلسة مطلوبان' },
        { status: 400 }
      )
    }

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

    // جلب معلومات المجموعة
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single()

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'المجموعة غير موجودة' },
        { status: 404 }
      )
    }

    // التحقق من أن المجموعة لديها username (عامة)
    if (!group.username) {
      return NextResponse.json(
        { error: 'هذه مجموعة خاصة. يجب أن تكون لديك دعوة للانضمام.' },
        { status: 400 }
      )
    }

    // جلب الجلسة
    const { data: session, error: sessionError } = await supabase
      .from('telegram_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'الجلسة غير موجودة' },
        { status: 404 }
      )
    }

    // فك تشفير الجلسة
    const decryptedSession = decryptTelegramSession(session.encrypted_session)
    const stringSession = new StringSession(decryptedSession)
    const client = new TelegramClient(
      stringSession,
      parseInt(process.env.TELEGRAM_API_ID || process.env.NEXT_PUBLIC_TELEGRAM_API_ID || '0'),
      process.env.TELEGRAM_API_HASH || process.env.NEXT_PUBLIC_TELEGRAM_API_HASH || '',
      {
        connectionRetries: 5,
      }
    )

    await client.connect()

    try {
      // محاولة الانضمام باستخدام username
      const Api = (await import('telegram/tl')).Api
      
      // الحصول على المجموعة
      const result: any = await client.invoke(
        new Api.contacts.ResolveUsername({
          username: group.username
        })
      )

      if (!result.chats || result.chats.length === 0) {
        throw new Error('لم يتم العثور على المجموعة')
      }

      const chat = result.chats[0]

      // محاولة الانضمام
      try {
        await client.invoke(
          new Api.channels.JoinChannel({
            channel: chat
          })
        )

        await client.disconnect()

        return NextResponse.json({
          success: true,
          message: 'تم الانضمام للمجموعة بنجاح! يمكنك الآن استخراج الأعضاء.'
        })

      } catch (joinError: any) {
        // التحقق من نوع الخطأ
        if (joinError.errorMessage === 'USER_ALREADY_PARTICIPANT') {
          await client.disconnect()
          return NextResponse.json({
            success: true,
            message: 'أنت عضو بالفعل في هذه المجموعة!'
          })
        }

        throw joinError
      }

    } catch (error: any) {
      await client.disconnect()
      
      // معالجة أخطاء محددة
      if (error.errorMessage === 'INVITE_HASH_INVALID') {
        throw new Error('رابط الدعوة غير صالح')
      } else if (error.errorMessage === 'CHANNELS_TOO_MUCH') {
        throw new Error('لقد وصلت للحد الأقصى من المجموعات. يرجى مغادرة بعض المجموعات أولاً.')
      } else if (error.errorMessage === 'USER_ALREADY_PARTICIPANT') {
        return NextResponse.json({
          success: true,
          message: 'أنت عضو بالفعل في هذه المجموعة!'
        })
      }

      throw error
    }

  } catch (error: any) {
    console.error('Join group error:', error)
    
    return NextResponse.json(
      { error: error.message || 'فشل في الانضمام للمجموعة' },
      { status: 500 }
    )
  }
}

