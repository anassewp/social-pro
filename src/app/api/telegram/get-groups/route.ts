import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { decryptTelegramSession } from '@/lib/encryption'

export async function POST(request: NextRequest) {
  try {
    // التحقق من متغيرات البيئة المطلوبة
    const apiId = process.env.TELEGRAM_API_ID || process.env.NEXT_PUBLIC_TELEGRAM_API_ID
    const apiHash = process.env.TELEGRAM_API_HASH || process.env.NEXT_PUBLIC_TELEGRAM_API_HASH
    
    if (!apiId || !apiHash) {
      return NextResponse.json(
        { 
          error: '❌ متغيرات البيئة مفقودة!\n\n' +
                 '🔧 يجب إضافة:\n' +
                 'TELEGRAM_API_ID=your_api_id\n' +
                 'TELEGRAM_API_HASH=your_api_hash\n' +
                 'في ملف .env.local'
        },
        { status: 500 }
      )
    }

    const parsedApiId = parseInt(apiId)
    if (isNaN(parsedApiId) || parsedApiId === 0) {
      return NextResponse.json(
        { error: '❌ TELEGRAM_API_ID غير صالح' },
        { status: 500 }
      )
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'معرف الجلسة مطلوب' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // جلب الجلسة من قاعدة البيانات
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

    // التحقق من وجود البيانات المشفرة
    if (!session.encrypted_session) {
      return NextResponse.json(
        { error: '❌ الجلسة لا تحتوي على بيانات مشفرة' },
        { status: 400 }
      )
    }

    // فك تشفير الجلسة
    let decryptedSession: string
    try {
      decryptedSession = decryptTelegramSession(session.encrypted_session)
    } catch (decryptError: any) {
      console.error('Decryption failed for session:', sessionId, decryptError)
      return NextResponse.json(
        { 
          error: '❌ فشل في فك تشفير الجلسة!\n\n' + decryptError.message
        },
        { status: 500 }
      )
    }

    // التحقق من أن الجلسة المفكوكة ليست فارغة
    if (!decryptedSession || decryptedSession.trim().length === 0) {
      return NextResponse.json(
        { error: '❌ الجلسة المفكوكة فارغة' },
        { status: 500 }
      )
    }

    // إنشاء عميل تيليجرام
    const stringSession = new StringSession(decryptedSession)
    const client = new TelegramClient(
      stringSession,
      parsedApiId,
      apiHash,
      {
        connectionRetries: 5,
      }
    )

    await client.connect()

    // جلب المجموعات فقط (بدون القنوات)
    const dialogs = await client.getDialogs({
      limit: 100,
    })

    const groups = []

    for (const dialog of dialogs) {
      const entity: any = dialog.entity

      if (!entity) continue

      // تصفية: فقط المجموعات (ليس القنوات)
      if (entity.className === 'Channel' && entity.broadcast) {
        continue // تخطي القنوات
      }

      if (entity.className !== 'Channel' && entity.className !== 'Chat') {
        continue // تخطي أي شيء آخر
      }

      // التحقق من إمكانية رؤية الأعضاء
      try {
        // محاولة جلب معلومات المجموعة الكاملة
        const fullChat: any = await client.invoke(
          new (require('telegram/tl').Api.channels.GetFullChannel)({
            channel: entity,
          })
        )

        // التحقق من أن الأعضاء ظاهرين (ليست مخفية)
        const canViewParticipants = !fullChat.fullChat?.participantsHidden

        if (!canViewParticipants) {
          continue // تخطي المجموعات التي أعضاؤها مخفيين
        }

        // إضافة المجموعة إلى القائمة
        groups.push({
          id: entity.id.toString(),
          title: entity.title || 'بدون عنوان',
          username: entity.username || undefined,
          participantsCount: fullChat.fullChat?.participantsCount || 0,
          type: entity.megagroup ? 'supergroup' : 'group',
          canViewMembers: true,
        })
      } catch (error) {
        // إذا فشل جلب المعلومات، نتخطى هذه المجموعة
        console.log(`تخطي مجموعة ${entity.title || 'unknown'}: لا يمكن الوصول للأعضاء`)
        continue
      }
    }

    await client.disconnect()

    return NextResponse.json({
      success: true,
      groups,
    })

  } catch (error: any) {
    console.error('Get groups error:', error)
    
    return NextResponse.json(
      { error: error.message || 'فشل في جلب المجموعات' },
      { status: 500 }
    )
  }
}
