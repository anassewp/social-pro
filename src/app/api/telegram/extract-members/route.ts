import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { decryptTelegramSession } from '@/lib/encryption'

/**
 * API Route لاستخراج أعضاء مجموعة تيليجرام
 * 
 * @route POST /api/telegram/extract-members
 * @body { groupId: string, sessionId: string, saveToDatabase?: boolean }
 * @returns { success: boolean, members: Array, saved?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const { groupId, sessionId, saveToDatabase = true } = await request.json()

    // التحقق من المدخلات
    if (!groupId || !sessionId) {
      return NextResponse.json(
        { error: 'معرف المجموعة ومعرف الجلسة مطلوبان' },
        { status: 400 }
      )
    }

    // استخدام service role للوصول لقاعدة البيانات
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

    // فك تشفير الجلسة
    const decryptedSession = decryptTelegramSession(session.encrypted_session)

    // إنشاء عميل تيليجرام
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
        { error: 'لم يتم العثور على المجموعة في تيليجرام', needsJoin: false },
        { status: 404 }
      )
    }

    // التحقق من العضوية قبل محاولة الاستخراج
    try {
      const Api = (await import('telegram/tl')).Api
      await client.invoke(
        new Api.channels.GetFullChannel({
          channel: entity,
        })
      )
    } catch (error: any) {
      // إذا فشل، فنحن لسنا أعضاء
      await client.disconnect()
      
      // التحقق إذا كانت المجموعة عامة (يمكن الانضمام)
      const canJoin = !!(entity.username)
      
      return NextResponse.json(
        { 
          error: canJoin ? 'يجب أن تكون عضواً في المجموعة لاستخراج الأعضاء' : 'هذه مجموعة خاصة. يجب أن تكون عضواً فيها لاستخراج الأعضاء.',
          needsJoin: canJoin,
          canJoin: canJoin
        },
        { status: 403 }
      )
    }

    // استخراج الأعضاء
    const participants: any[] = []
    let offset = 0
    const limit = 200 // الحد الأقصى للطلب الواحد
    let skippedUsers = 0

    try {
      while (true) {
        const result: any = await client.invoke(
          new (require('telegram/tl').Api.channels.GetParticipants)({
            channel: entity,
            filter: new (require('telegram/tl').Api.ChannelParticipantsSearch)({ q: '' }),
            offset: offset,
            limit: limit,
            hash: 0,
          })
        )

        if (!result.users || result.users.length === 0) {
          break // انتهى الاستخراج
        }

        // إضافة فقط المستخدمين الذين لديهم ID صالح
        const validUsers = result.users.filter((user: any) => user && user.id)
        participants.push(...validUsers)
        
        // حساب المستخدمين المتخطين (بدون ID)
        skippedUsers += (result.users.length - validUsers.length)
        
        offset += result.users.length

        // إذا كان عدد الأعضاء أقل من الحد، فقد انتهينا
        if (result.users.length < limit) {
          break
        }

        // تأخير قصير لتجنب Rate Limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error: any) {
      console.error('Error extracting members:', error)
      await client.disconnect()
      
      // إذا كان الخطأ متعلق بعدم العضوية، أعد رسالة مناسبة
      if (error.message?.includes('not a member') || error.message?.includes('USER_NOT_PARTICIPANT')) {
        const canJoin = !!(entity.username)
        return NextResponse.json(
          { 
            error: canJoin ? 'يجب أن تكون عضواً في المجموعة لاستخراج الأعضاء' : 'هذه مجموعة خاصة. يجب أن تكون عضواً فيها لاستخراج الأعضاء.',
            needsJoin: canJoin,
            canJoin: canJoin
          },
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        { error: `فشل في استخراج الأعضاء: ${error.message}` },
        { status: 500 }
      )
    }

    await client.disconnect()

    // تنسيق البيانات (مع إضافة access_hash الضروري للإرسال)
    // تحسين: فقط استخراج الأعضاء النشطين والذين يملكون username
    const members = participants
      .filter((user: any) => {
        // فقط المستخدمين (ليس البوتات)
        if (!user || !user.id || user.bot) {
          return false
        }
        
        // فقط المستخدمين الذين لديهم username
        if (!user.username || user.username.trim().length === 0) {
          return false
        }
        
        // فقط المستخدمين النشطين (لديهم last_seen حديث أو لم يتم حظرهم)
        // نعتبر المستخدم نشطاً إذا:
        // 1. لديه status وليس deleted/deleted_username
        // 2. أو كان last_seen خلال آخر 6 أشهر
        const isDeleted = user.deleted || user.deletedUsername
        if (isDeleted) {
          return false
        }
        
        // التحقق من النشاط (last_seen)
        if (user.status) {
          const wasOnline = user.status.wasOnline
          if (wasOnline) {
            const lastSeenDate = new Date(wasOnline * 1000)
            const sixMonthsAgo = new Date()
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
            
            // إذا كان last_seen أقدم من 6 أشهر، نتخطاه
            if (lastSeenDate < sixMonthsAgo) {
              return false
            }
          }
        }
        
        return true
      })
      .map((user: any) => ({
        telegram_user_id: user.id?.toString() || '',
        access_hash: user.accessHash?.toString() || null, // ضروري لإرسال الرسائل
        username: user.username || null,
        first_name: user.firstName || null,
        last_name: user.lastName || null,
        phone: user.phone || null,
        is_bot: false, // تم تصفيتهم بالفعل
        is_premium: user.premium || false,
        last_seen: user.status?.wasOnline ? new Date(user.status.wasOnline * 1000).toISOString() : null,
      }))
      .filter((member: any) => member.telegram_user_id && member.username) // تأكد من وجود telegram_user_id و username

    // حفظ في قاعدة البيانات إذا طُلب ذلك
    let savedCount = 0
    if (saveToDatabase && members.length > 0) {
      // حذف الأعضاء القدامى لهذه المجموعة
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)

      // إضافة الأعضاء الجدد (على دفعات لتجنب حد الحجم)
      const batchSize = 100
      for (let i = 0; i < members.length; i += batchSize) {
        const batch = members.slice(i, i + batchSize).map(member => ({
          ...member,
          group_id: groupId,
        }))

        const { error: insertError } = await supabase
          .from('group_members')
          .insert(batch)

        if (insertError) {
          console.error('Error inserting batch:', insertError)
        } else {
          savedCount += batch.length
        }
      }

      // تحديث last_sync للمجموعة
      await supabase
        .from('groups')
        .update({ 
          last_sync: new Date().toISOString(),
          member_count: members.length
        })
        .eq('id', groupId)
    }

    // حساب عدد الأعضاء المتخطين (بعد التصفية)
    const totalParticipants = participants.length
    const filteredMembers = members.length
    const actuallySkipped = totalParticipants - filteredMembers

    return NextResponse.json({
      success: true,
      message: `تم استخراج ${filteredMembers} عضو نشط وله username${actuallySkipped > 0 ? ` (تم تخطي ${actuallySkipped} عضو: بوتات أو بدون username أو غير نشطين)` : ''}`,
      members: members,
      saved: savedCount,
      total: filteredMembers,
      skipped: actuallySkipped,
      totalFound: totalParticipants,
    })

  } catch (error: any) {
    console.error('Extract members error:', error)
    
    return NextResponse.json(
      { error: error.message || 'فشل في استخراج الأعضاء' },
      { status: 500 }
    )
  }
}

