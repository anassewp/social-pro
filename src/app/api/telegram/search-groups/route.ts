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

    const { sessionId, query } = await request.json()

    if (!sessionId || !query) {
      return NextResponse.json(
        { error: 'معرف الجلسة والكلمة المفتاحية مطلوبة' },
        { status: 400 }
      )
    }

    // التحقق من أن الكلمة المفتاحية ليست فارغة
    if (typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'الكلمة المفتاحية يجب أن تكون نصاً غير فارغ' },
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

    // البحث العالمي في تيليجرام
    const Api = require('telegram/tl').Api
    const searchResults = await client.invoke(
      new Api.contacts.Search({
        q: query,
        limit: 50,
      })
    )

    const groups = []

    // معالجة النتائج
    for (const chat of searchResults.chats) {
      // تصفية: فقط المجموعات (ليس القنوات أو المستخدمين)
      if (chat.className === 'Channel' && chat.broadcast) {
        continue // تخطي القنوات
      }

      if (chat.className !== 'Channel' && chat.className !== 'Chat') {
        continue // تخطي أي شيء آخر
      }

      try {
        // محاولة جلب معلومات المجموعة الكاملة
        const fullChat: any = await client.invoke(
          new Api.channels.GetFullChannel({
            channel: chat,
          })
        )

        // التحقق من أن الأعضاء ظاهرين
        const canViewParticipants = !fullChat.fullChat?.participantsHidden

        if (!canViewParticipants) {
          continue // تخطي المجموعات التي أعضاؤها مخفيين
        }

        groups.push({
          id: chat.id.toString(),
          title: chat.title || 'بدون عنوان',
          username: chat.username || undefined,
          participantsCount: fullChat.fullChat?.participantsCount || 0,
          type: chat.megagroup ? 'supergroup' : 'group',
          canViewMembers: true,
        })
      } catch (error) {
        // إذا فشل جلب المعلومات، نتخطى هذه المجموعة
        console.log(`تخطي مجموعة ${chat.title || 'unknown'}: لا يمكن الوصول للأعضاء`)
        continue
      }
    }

    await client.disconnect()

    return NextResponse.json({
      success: true,
      groups,
      count: groups.length,
    })

  } catch (error: any) {
    console.error('Search groups error:', error)
    
    return NextResponse.json(
      { error: error.message || 'فشل في البحث عن المجموعات' },
      { status: 500 }
    )
  }
}
