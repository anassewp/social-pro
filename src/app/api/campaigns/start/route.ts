import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { decryptTelegramSession } from '@/lib/encryption'
import { mergeConfig, calculateDelay, shouldPause, calculateBackoff, type CampaignConfig } from '@/lib/campaign/config'
import { distributeMembers, type SessionInfo } from '@/lib/campaign/session-distribution'
import { checkRateLimit, recordMessage } from '@/lib/campaign/rate-limiter'

/**
 * API Route لبدء تنفيذ حملة تسويقية
 * 
 * @route POST /api/campaigns/start
 * @body { campaignId: string, sessionId: string }
 * @returns { success: boolean, message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { campaignId, sessionId, sessionIds } = await request.json()

    // التحقق من المدخلات - دعم جلسة واحدة أو عدة جلسات
    if (!campaignId) {
      return NextResponse.json(
        { error: 'معرف الحملة مطلوب' },
        { status: 400 }
      )
    }

    // دعم sessionId (واحد) أو sessionIds (عدة)
    const targetSessionIds: string[] = sessionIds || (sessionId ? [sessionId] : [])
    
    if (targetSessionIds.length === 0) {
      return NextResponse.json(
        { error: 'يجب تحديد جلسة واحدة على الأقل' },
        { status: 400 }
      )
    }

    // استخدام service role
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

    // جلب الحملة
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'الحملة غير موجودة' },
        { status: 404 }
      )
    }

    // التحقق من حالة الحملة
    if (campaign.status === 'running') {
      return NextResponse.json(
        { error: 'الحملة قيد التنفيذ بالفعل' },
        { status: 400 }
      )
    }

    if (campaign.status === 'completed') {
      return NextResponse.json(
        { error: 'هذه الحملة مكتملة بالفعل' },
        { status: 400 }
      )
    }

    // جلب الجلسات
    const { data: sessions, error: sessionsError } = await supabase
      .from('telegram_sessions')
      .select('*')
      .in('id', targetSessionIds)
      .eq('team_id', campaign.team_id)
      .eq('is_active', true)

    if (sessionsError || !sessions || sessions.length === 0) {
      return NextResponse.json(
        { error: 'الجلسات المحددة غير موجودة أو غير نشطة' },
        { status: 404 }
      )
    }

    if (sessions.length !== targetSessionIds.length) {
      return NextResponse.json(
        { error: 'بعض الجلسات المحددة غير موجودة' },
        { status: 404 }
      )
    }

    // تحديث حالة الحملة إلى running
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ 
        status: 'running',
        started_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    if (updateError) {
      throw new Error('فشل في تحديث حالة الحملة')
    }

    // بدء عملية الإرسال في الخلفية
    // ملاحظة: في الإنتاج، يجب استخدام Queue system (مثل Bull أو AWS SQS)
    processCampaign(campaignId, targetSessionIds, campaign, sessions, supabase)
      .catch(error => console.error('Campaign processing error:', error))

    // تسجيل في audit logs
    await supabase
      .from('audit_logs')
      .insert({
        user_id: campaign.created_by,
        team_id: campaign.team_id,
        action: 'campaign_started',
        resource_type: 'campaign',
        resource_id: campaignId,
        details: JSON.stringify({
          campaign_name: campaign.name,
          session_ids: targetSessionIds,
          sessions_count: sessions.length
        })
      })

    return NextResponse.json({
      success: true,
      message: 'تم بدء الحملة بنجاح. سيتم إرسال الرسائل تدريجياً.',
    })

  } catch (error: any) {
    console.error('Start campaign error:', error)
    
    return NextResponse.json(
      { error: error.message || 'فشل في بدء الحملة' },
      { status: 500 }
    )
  }
}

/**
 * معالجة الحملة وإرسال الرسائل
 */
async function processCampaign(
  campaignId: string,
  sessionIds: string[],
  campaign: any,
  sessions: any[],
  supabase: any
) {
  const clients = new Map<string, TelegramClient>()

  try {
    // تحميل الإعدادات المتقدمة
    const config: CampaignConfig = campaign.campaign_config 
      ? mergeConfig(JSON.parse(campaign.campaign_config))
      : mergeConfig()

    // إنشاء عملاء تيليجرام لجميع الجلسات
    for (const session of sessions) {
      try {
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
        clients.set(session.id, client)
      } catch (error) {
        console.error(`Failed to connect session ${session.id}:`, error)
        // نستمر بالجلسات الأخرى
      }
    }

    if (clients.size === 0) {
      const sessionIds = sessions.map(s => s.id).join(', ')
      throw new Error(`❌ فشل في الاتصال بجميع الجلسات!\n\n📝 الجلسات المحاولة: ${sessionIds}\n\n🔧 الحل:\n1. تحقق من صحة TELEGRAM_API_ID و TELEGRAM_API_HASH في ملف .env\n2. اذهب إلى /sessions وتأكد من أن الجلسات نشطة\n3. إذا لم تكن نشطة، أعد تسجيل الدخول\n4. تأكد من أن الجلسات تنتمي لنفس الفريق`)
    }

    console.log(`[Campaign ${campaignId}] Successfully connected to ${clients.size} session(s)`)

    // جلب المجموعات المستهدفة
    const targetGroups = JSON.parse(campaign.target_groups)
    
    // جلب جميع الأعضاء المستهدفين (نحتاج access_hash للإرسال)
    const { data: allMembers, error: membersError } = await supabase
      .from('group_members')
      .select('*')
      .in('group_id', targetGroups)
      .eq('is_bot', false) // تخطي البوتات
      .not('access_hash', 'is', null) // فقط الأعضاء الذين لديهم access_hash

    console.log(`[Campaign ${campaignId}] Found ${allMembers?.length || 0} members from groups:`, targetGroups)

    if (membersError) {
      throw new Error(`خطأ في جلب الأعضاء: ${membersError.message}`)
    }

    if (!allMembers || allMembers.length === 0) {
      // التحقق من سبب عدم وجود أعضاء
      const { data: totalMembersCount } = await supabase
        .from('group_members')
        .select('id', { count: 'exact', head: true })
        .in('group_id', targetGroups)
        .eq('is_bot', false)

      const { data: membersWithoutHash } = await supabase
        .from('group_members')
        .select('id', { count: 'exact', head: true })
        .in('group_id', targetGroups)
        .eq('is_bot', false)
        .is('access_hash', null)

      const totalCount = totalMembersCount?.count || 0
      const withoutHashCount = membersWithoutHash?.count || 0

      if (totalCount === 0) {
        throw new Error(`❌ لا يوجد أعضاء في المجموعات المستهدفة!\n\n📝 الحل:\n1. اذهب إلى صفحة المجموعات (/groups)\n2. اضغط "استخراج الأعضاء" على كل مجموعة\n3. انتظر حتى يكتمل الاستخراج\n4. أعد إنشاء الحملة`)
      } else if (withoutHashCount === totalCount) {
        throw new Error(`⚠️ تم العثور على ${totalCount} عضو، لكن جميعهم بدون access_hash!\n\n📝 الحل:\n1. اذهب إلى صفحة المجموعات (/groups)\n2. احذف الأعضاء الحاليين\n3. أعد استخراج الأعضاء مرة أخرى\n4. تأكد من أن الجلسة منضمة للمجموعة`)
      } else {
        throw new Error(`⚠️ تم العثور على ${totalCount} عضو، لكن ${withoutHashCount} منهم بدون access_hash!\n\nفقط الأعضاء الذين لديهم access_hash يمكن إرسال رسائل إليهم.\n\n📝 الحل: أعد استخراج الأعضاء من المجموعات`)
      }
    }

    // التحقق من التكرار: استبعاد المستخدمين الذين تم إرسال رسائل إليهم مسبقاً في حملات الفريق
    const { data: previousCampaigns } = await supabase
      .from('campaigns')
      .select('id')
      .eq('team_id', campaign.team_id)
      .neq('status', 'draft')
      .neq('id', campaignId) // استبعاد الحملة الحالية

    const previousCampaignIds = previousCampaigns?.map((c: any) => c.id) || []
    let previouslySentUserIds: Set<string> = new Set()
    
    if (previousCampaignIds.length > 0) {
      const { data: previousResults } = await supabase
        .from('campaign_results')
        .select('target_user_id, target_username')
        .in('campaign_id', previousCampaignIds)
        .eq('status', 'sent')

      if (previousResults) {
        previousResults.forEach((result: any) => {
          if (result.target_user_id) {
            previouslySentUserIds.add(result.target_user_id)
          }
          if (result.target_username) {
            previouslySentUserIds.add(result.target_username.toLowerCase())
          }
        })
      }
    }

    // تصفية الأعضاء: استبعاد المكررين
    const members = allMembers.filter((member: any) => {
      const userId = member.telegram_user_id
      const username = member.username?.toLowerCase() || ''
      
      if (previouslySentUserIds.has(userId)) {
        return false
      }
      if (username && previouslySentUserIds.has(username)) {
        return false
      }
      return true
    })

    const duplicatesExcluded = allMembers.length - members.length
    console.log(`[Campaign ${campaignId}] After filtering duplicates: ${members.length} members (excluded ${duplicatesExcluded} duplicates)`)

    if (members.length === 0) {
      throw new Error(`❌ لا يوجد أعضاء جدد للإرسال إليهم!\n\n📊 الإحصائيات:\n- إجمالي الأعضاء: ${allMembers.length}\n- تم استبعاد ${duplicatesExcluded} عضو (تم إرسال رسائل إليهم مسبقاً)\n\n💡 الحل:\n1. اختر مجموعات جديدة لم ترسل لها من قبل\n2. أو انتظر فترة قبل إعادة الإرسال لنفس الأعضاء`)
    }

    // تطبيق التحكم بعدد الأشخاص (إذا لم يتم تطبيقه مسبقاً)
    const progress = JSON.parse(campaign.progress)
    const globalSent = progress.sent || 0
    const globalFailed = progress.failed || 0
    const originalCount = progress.original_count || members.length
    const targetCount = progress.total || members.length

    // تحديد الأعضاء المستهدفين (إذا كان targetCount أقل من العدد الفعلي)
    let targetMembers = members
    if (targetCount < members.length) {
      // خلط عشوائي ثم أخذ العدد المطلوب
      targetMembers = [...members].sort(() => Math.random() - 0.5).slice(0, targetCount)
    }

    // إعداد معلومات الجلسات للتوزيع
    const sessionInfos: SessionInfo[] = sessions.map(session => ({
      id: session.id,
      activityScore: 50, // TODO: حساب من campaign_results
      reliability: 85, // TODO: حساب من campaign_results
      currentLoad: 0
    }))

    // توزيع الأعضاء على الجلسات
    const distribution = distributeMembers(
      targetMembers,
      sessionInfos,
      config.sessions.strategy,
      config.sessions.min_per_session || 10
    )

    // تحديث التقدم مع عدد المكررين المستبعدين
    if (duplicatesExcluded > 0 && !progress.duplicates_excluded) {
      await supabase
        .from('campaigns')
        .update({
          progress: JSON.stringify({
            ...progress,
            duplicates_excluded: duplicatesExcluded,
            total: targetCount
          })
        })
        .eq('id', campaignId)
    }

    // إعداد متغيرات Anti-Detection لكل جلسة
    let totalSent = globalSent
    let totalFailed = globalFailed
    
    // معالجة كل جلسة بالتوازي (Parallel Processing)
    const sendPromises = Array.from(distribution.entries()).map(async ([sessionId, sessionMembers]) => {
      const client = clients.get(sessionId)
      if (!client) {
        console.error(`Client not found for session ${sessionId}`)
        return
      }

      let sessionSent = 0
      let sessionFailed = 0
      let consecutiveErrors = 0

      for (const member of sessionMembers) {
        try {
          // التحقق من حالة الحملة
          const { data: currentCampaign } = await supabase
            .from('campaigns')
            .select('status')
            .eq('id', campaignId)
            .single()

          if (currentCampaign?.status === 'paused') {
            console.log(`Campaign paused, stopping session ${sessionId}...`)
            break
          }

          // Rate Limiting Check
          const rateLimit = checkRateLimit(
            sessionId,
            config.anti_detection.rate_limit_per_session_per_hour || 30
          )
          
          if (!rateLimit.allowed) {
            const waitTime = rateLimit.resetAt - Date.now()
            console.log(`Rate limit reached for session ${sessionId}, waiting ${waitTime / 1000}s`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
          }

        // تخصيص الرسالة للعضو
        let message = campaign.message_template
        message = message.replace('{first_name}', member.first_name || 'عزيزي')
        message = message.replace('{last_name}', member.last_name || '')
        message = message.replace('{username}', member.username || '')

        // محاولة الحصول على الـ entity بطرق متعددة (أكثر موثوقية)
        let entity = null
        
        // الطريقة 1: استخدام username إذا كان موجوداً (الأكثر موثوقية)
        if (member.username) {
          try {
            entity = await client.getEntity(member.username)
          } catch (e) {
            console.log(`Failed to get entity by username: ${member.username}`)
          }
        }

        // الطريقة 2: استخدام InputPeerUser مع access_hash
        if (!entity && member.access_hash) {
          try {
            const Api = (await import('telegram/tl')).Api
            const inputPeer = new Api.InputPeerUser({
              userId: member.telegram_user_id,
              accessHash: member.access_hash
            })
            entity = inputPeer
          } catch (e) {
            console.log(`Failed to create InputPeerUser for ${member.telegram_user_id}`)
          }
        }

        // الطريقة 3: محاولة الحصول من user_id مباشرة (للمستخدمين في cache)
        if (!entity) {
          try {
            entity = await client.getEntity(parseInt(member.telegram_user_id))
          } catch (e) {
            console.log(`Failed to get entity by id: ${member.telegram_user_id}`)
          }
        }

        // إذا فشلت جميع الطرق، تخطي هذا العضو
        if (!entity) {
          throw new Error('لم يتم العثور على المستخدم. ربما حظر الحساب أو غير موجود.')
        }

          // إرسال الرسالة
          await client.sendMessage(entity, {
            message: message
          })

          sessionSent++
          totalSent++ // global counter
          consecutiveErrors = 0
          
          // تسجيل للـ Rate Limiting
          recordMessage(sessionId)

          // حفظ النتيجة
          await supabase
            .from('campaign_results')
            .insert({
              campaign_id: campaignId,
              target_user_id: member.telegram_user_id,
              target_username: member.username,
              status: 'sent',
              sent_at: new Date().toISOString(),
              session_id: sessionId // إضافة session_id للنتائج
            })

          // حساب التأخير بناءً على الإعدادات (مع jitter للجلسة)
          const delay = calculateDelay(config.timing, {
            base_sec: config.timing.session_base_sec,
            jitter_sec: config.timing.session_jitter_sec
          })
          await new Promise(resolve => setTimeout(resolve, delay))

          // Anti-Detection: pause عشوائي أطول
          if (shouldPause(config.anti_detection)) {
            const pauseDuration = 15 + Math.random() * 30 // 15-45 ثانية (زيادة من 5-20)
            console.log(`[${sessionId}] 🔒 Anti-Detection: Pausing for ${pauseDuration.toFixed(1)}s`)
            await new Promise(resolve => setTimeout(resolve, pauseDuration * 1000))
          }

        } catch (error: any) {
          const errorMessage = error.message || String(error)
          console.error(`[${sessionId}] Failed to send to ${member.telegram_user_id}:`, errorMessage)
          
          sessionFailed++
          totalFailed++ // global counter

          // ✅ معالجة خاصة لـ PEER_ID_INVALID: لا نزيد consecutiveErrors
          if (errorMessage.includes('PEER_ID_INVALID')) {
            console.log(`[${sessionId}] ⚠️ PEER_ID_INVALID - المستخدم غير صالح (حذف حسابه، حظرك، أو رقم خاطئ)`)
            
            // حفظ الخطأ مع رسالة واضحة
            await supabase
              .from('campaign_results')
              .insert({
                campaign_id: campaignId,
                target_user_id: member.telegram_user_id,
                target_username: member.username,
                status: 'failed',
                error_message: '❌ PEER_ID_INVALID: المستخدم غير صالح (حذف حسابه أو حظرك)',
                sent_at: new Date().toISOString(),
                session_id: sessionId
              })
            
            // لا نزيد consecutiveErrors لأن هذا ليس خطأ في الإرسال
            // تأخير بسيط قبل المتابعة
            await new Promise(resolve => setTimeout(resolve, 2000))
            continue // المتابعة للعضو التالي
          }

          // ✅ معالجة خاصة لـ PEER_FLOOD: توقف طويل جداً
          if (errorMessage.includes('PEER_FLOOD')) {
            console.error(`[${sessionId}] 🚨 PEER_FLOOD DETECTED! تم اكتشاف spam من قبل تيليجرام!`)
            
            consecutiveErrors += 5 // زيادة كبيرة للأخطاء المتتالية
            
            // حفظ الخطأ مع رسالة واضحة
            await supabase
              .from('campaign_results')
              .insert({
                campaign_id: campaignId,
                target_user_id: member.telegram_user_id,
                target_username: member.username,
                status: 'failed',
                error_message: '🚨 PEER_FLOOD: تم اكتشاف spam! يُرجى تقليل سرعة الإرسال واستخدام حسابات أقدم وأكثر نشاطاً.',
                sent_at: new Date().toISOString(),
                session_id: sessionId
              })
            
            // 🛑 توقف لمدة ساعة على الأقل
            const floodWaitTime = 3600000 // ساعة واحدة
            console.log(`[${sessionId}] ⏸️ Pausing for ${floodWaitTime / 60000} minutes due to PEER_FLOOD`)
            await new Promise(resolve => setTimeout(resolve, floodWaitTime))
            
            // إعادة تعيين consecutiveErrors بعد التوقف الطويل
            consecutiveErrors = 0
            continue
          }

          // ✅ أخطاء أخرى: معالجة عادية
          consecutiveErrors++

          // حفظ الخطأ
          await supabase
            .from('campaign_results')
            .insert({
              campaign_id: campaignId,
              target_user_id: member.telegram_user_id,
              target_username: member.username,
              status: 'failed',
              error_message: errorMessage,
              sent_at: new Date().toISOString(),
              session_id: sessionId
            })

          // ✅ إذا وصلنا لـ 10 أخطاء متتالية، نوقف هذه الجلسة
          if (consecutiveErrors >= 10) {
            console.error(`[${sessionId}] 🛑 Reached 10 consecutive errors. Stopping this session to prevent ban.`)
            break // الخروج من حلقة الإرسال لهذه الجلسة
          }

          // Exponential Backoff عند الأخطاء المتتالية
          if (consecutiveErrors > 0 && config.anti_detection.backoff) {
            const backoffDelay = calculateBackoff(consecutiveErrors - 1, config.anti_detection.backoff)
            if (backoffDelay > 0) {
              console.log(`[${sessionId}] Exponential Backoff: Waiting ${backoffDelay / 1000}s after ${consecutiveErrors} errors`)
              await new Promise(resolve => setTimeout(resolve, backoffDelay))
            }
          } else {
            // تأخير عادي حتى عند الخطأ
            const delay = calculateDelay(config.timing)
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }

        // تحديث التقدم كل 10 رسائل لهذه الجلسة
        if ((sessionSent + sessionFailed) % 10 === 0) {
          // جلب التقدم الحالي وتحديثه
          const { data: currentCampaign } = await supabase
            .from('campaigns')
            .select('progress')
            .eq('id', campaignId)
            .single()
          
          if (currentCampaign) {
            await supabase
              .from('campaigns')
              .update({
                progress: JSON.stringify({ 
                  sent: totalSent,
                  failed: totalFailed,
                  total: targetCount,
                  duplicates_excluded: duplicatesExcluded,
                  original_count: originalCount
                })
              })
              .eq('id', campaignId)
          }
        }
      }

      console.log(`[${sessionId}] Completed: ${sessionSent} sent, ${sessionFailed} failed`)
    })

    // انتظار اكتمال جميع الجلسات
    await Promise.all(sendPromises)

    // جلب التقدم النهائي بعد اكتمال جميع الجلسات
    const { data: finalCampaign } = await supabase
      .from('campaigns')
      .select('progress')
      .eq('id', campaignId)
      .single()

    const finalProgress = finalCampaign ? JSON.parse(finalCampaign.progress) : progress

    // تحديث الحالة النهائية
    await supabase
      .from('campaigns')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress: JSON.stringify({ 
          sent: finalProgress.sent || globalSent, 
          failed: finalProgress.failed || globalFailed, 
          total: targetCount,
          duplicates_excluded: duplicatesExcluded,
          original_count: originalCount
        })
      })
      .eq('id', campaignId)

    // فصل جميع العملاء
    for (const [sessionId, client] of clients.entries()) {
      try {
        await client.disconnect()
      } catch (e) {
        console.error(`Failed to disconnect session ${sessionId}:`, e)
      }
    }

  } catch (error: any) {
    console.error('Campaign processing error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      campaignId,
      sessionIds
    })

    // تحديث الحالة إلى failed مع رسالة الخطأ
    await supabase
      .from('campaigns')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        progress: JSON.stringify({
          sent: 0,
          failed: 0,
          total: 0,
          error: error.message || 'حدث خطأ غير معروف'
        })
      })
      .eq('id', campaignId)

    // فصل جميع العملاء في حالة الخطأ
    for (const [sessionId, client] of clients.entries()) {
      try {
        await client.disconnect()
      } catch (e) {
        // ignore
      }
    }
  }
}

