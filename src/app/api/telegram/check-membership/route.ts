import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { decryptTelegramSession } from '@/lib/encryption'

/**
 * API Route للتحقق من عضوية الحساب في مجموعة
 * 
 * @route POST /api/telegram/check-membership
 * @body { groupId: string, sessionId: string }
 * @returns { isMember: boolean, canJoin: boolean, groupInfo: object }
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
      // جلب كيان المجموعة
      let entity: any = null
      
      // محاولة بـ username أولاً
      if (group.username) {
        try {
          entity = await client.getEntity(group.username)
        } catch (e) {
          console.log('Failed to get entity by username')
        }
      }
      
      // محاولة بـ telegram_id
      if (!entity) {
        try {
          entity = await client.getEntity(group.telegram_id)
        } catch (e) {
          console.log('Failed to get entity by id')
        }
      }

      if (!entity) {
        await client.disconnect()
        return NextResponse.json(
          { error: 'لم يتم العثور على المجموعة في تيليجرام' },
          { status: 404 }
        )
      }

      // التحقق من العضوية
      let isMember = false
      let canJoin = false
      
      try {
        // محاولة جلب معلومات المجموعة الكاملة
        const Api = (await import('telegram/tl')).Api
        const fullChat: any = await client.invoke(
          new Api.channels.GetFullChannel({
            channel: entity,
          })
        )

        // إذا تمكنا من الوصول، فنحن أعضاء
        isMember = true
        canJoin = false

      } catch (error: any) {
        // إذا فشل، فنحن لسنا أعضاء
        isMember = false
        
        // التحقق إذا كانت المجموعة عامة (يمكن الانضمام)
        if (entity.username) {
          canJoin = true
        } else {
          // مجموعة خاصة
          canJoin = false
        }
      }

      await client.disconnect()

      return NextResponse.json({
        success: true,
        isMember,
        canJoin,
        groupInfo: {
          name: group.name,
          username: group.username,
          type: group.type,
          memberCount: group.member_count
        }
      })

    } catch (error: any) {
      await client.disconnect()
      throw error
    }

  } catch (error: any) {
    console.error('Check membership error:', error)
    
    return NextResponse.json(
      { error: error.message || 'فشل في التحقق من العضوية' },
      { status: 500 }
    )
  }
}

