/**
 * Campaign Service
 * يحتوي على منطق العمل للحملات منفصل عن API routes
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { mergeConfig, calculateTargetCount, type CampaignConfig } from '@/lib/campaign/config'
import { NotFoundError, ValidationError } from '@/lib/errors'

export interface CreateCampaignInput {
  name: string
  description?: string
  message_template: string
  target_groups: string[]
  schedule_config?: any
  campaign_config?: Partial<CampaignConfig>
  teamId: string
  userId: string
}

export interface CampaignStats {
  total_members: number
  new_members: number
  duplicates_excluded: number
  duplicate_percentage: number
  target_count: number
  selection_mode: string
}

/**
 * إنشاء حملة جديدة
 */
export async function createCampaign(
  supabase: SupabaseClient,
  input: CreateCampaignInput
): Promise<{ campaign: any; stats: CampaignStats }> {
  const { name, description, message_template, target_groups, schedule_config, campaign_config, teamId, userId } = input

  // التحقق من المدخلات
  if (!name || !message_template || !target_groups || target_groups.length === 0) {
    throw new ValidationError('الاسم، قالب الرسالة، والمجموعات المستهدفة مطلوبة')
  }

  if (!teamId || !userId) {
    throw new ValidationError('معلومات الفريق والمستخدم مطلوبة')
  }

  // التحقق من أن المجموعات موجودة وتابعة للفريق
  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('id, telegram_id, name')
    .eq('team_id', teamId)
    .in('id', target_groups)

  if (groupsError || !groups || groups.length !== target_groups.length) {
    throw new ValidationError('بعض المجموعات المستهدفة غير موجودة أو غير تابعة للفريق')
  }

  // جلب جميع الأعضاء المستهدفين
  const { data: allMembers } = await supabase
    .from('group_members')
    .select('telegram_user_id, username')
    .in('group_id', target_groups)
    .eq('is_bot', false)

  const totalMembers = allMembers?.length || 0

  // التحقق من التكرار: استبعاد المستخدمين الذين تم إرسال رسائل إليهم مسبقاً
  let newMembersCount = totalMembers
  let duplicatesExcluded = 0

  if (totalMembers > 0) {
    // جلب قائمة المستخدمين الذين تم إرسال رسائل إليهم مسبقاً
    const { data: previousCampaigns } = await supabase
      .from('campaigns')
      .select('id')
      .eq('team_id', teamId)
      .neq('status', 'draft')

    const previousCampaignIds = previousCampaigns?.map(c => c.id) || []
    let previouslySentUserIds: Set<string> = new Set()
    
    if (previousCampaignIds.length > 0) {
      const { data: previousResults } = await supabase
        .from('campaign_results')
        .select('target_user_id, target_username')
        .in('campaign_id', previousCampaignIds)
        .eq('status', 'sent')

      if (previousResults) {
        previousResults.forEach(result => {
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
    const newMembers = allMembers?.filter(member => {
      const userId = member.telegram_user_id
      const username = member.username?.toLowerCase() || ''
      
      if (previouslySentUserIds.has(userId)) {
        return false
      }
      if (username && previouslySentUserIds.has(username)) {
        return false
      }
      return true
    }) || []

    newMembersCount = newMembers.length
    duplicatesExcluded = totalMembers - newMembersCount
  }

  // دمج الإعدادات المتقدمة
  const config = mergeConfig(campaign_config)
  
  // تطبيق التحكم بعدد الأشخاص
  const finalTargetCount = calculateTargetCount(newMembersCount, config.member_selection)
  const actuallyTargeted = Math.min(finalTargetCount, newMembersCount)

  // إنشاء الحملة
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .insert({
      name,
      description: description || null,
      team_id: teamId,
      created_by: userId,
      status: schedule_config ? 'scheduled' : 'draft',
      message_template,
      target_groups: JSON.stringify(target_groups),
      schedule_config: schedule_config ? JSON.stringify(schedule_config) : null,
      campaign_config: JSON.stringify(config),
      progress: JSON.stringify({
        sent: 0,
        failed: 0,
        total: actuallyTargeted,
        duplicates_excluded: duplicatesExcluded,
        original_count: newMembersCount
      })
    })
    .select()
    .single()

  if (campaignError) {
    throw new Error(`فشل في إنشاء الحملة: ${campaignError.message}`)
  }

  if (!campaign) {
    throw new Error('فشل في إنشاء الحملة: لم يتم إرجاع بيانات الحملة')
  }

  // تسجيل في audit logs
  await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      team_id: teamId,
      action: 'campaign_created',
      resource_type: 'campaign',
      resource_id: campaign.id,
      details: JSON.stringify({
        campaign_name: name,
        target_groups_count: target_groups.length,
        total_members: totalMembers,
        new_members: newMembersCount,
        duplicates_excluded: duplicatesExcluded
      })
    })

  const stats: CampaignStats = {
    total_members: totalMembers,
    new_members: newMembersCount,
    duplicates_excluded: duplicatesExcluded,
    duplicate_percentage: totalMembers > 0 
      ? Math.round((duplicatesExcluded / totalMembers) * 100) 
      : 0,
    target_count: actuallyTargeted,
    selection_mode: config.member_selection.mode
  }

  return {
    campaign: {
      ...campaign,
      target_groups: target_groups,
      progress: JSON.parse(campaign.progress)
    },
    stats
  }
}

/**
 * جلب حملة بواسطة ID
 */
export async function getCampaignById(
  supabase: SupabaseClient,
  campaignId: string,
  teamId?: string
): Promise<any> {
  let query = supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)

  if (teamId) {
    query = query.eq('team_id', teamId)
  }

  const { data: campaign, error } = await query.single()

  if (error || !campaign) {
    throw new NotFoundError('الحملة')
  }

  return {
    ...campaign,
    progress: typeof campaign.progress === 'string' 
      ? JSON.parse(campaign.progress) 
      : campaign.progress,
    target_groups: typeof campaign.target_groups === 'string'
      ? JSON.parse(campaign.target_groups)
      : campaign.target_groups,
  }
}

/**
 * تحديث حالة الحملة
 */
export async function updateCampaignStatus(
  supabase: SupabaseClient,
  campaignId: string,
  status: 'paused' | 'running',
  userId: string
): Promise<void> {
  // جلب الحملة للتحقق من وجودها
  const campaign = await getCampaignById(supabase, campaignId)

  // التحقق من الحالة الحالية
  if (status === 'paused' && campaign.status !== 'running') {
    throw new ValidationError('يمكن إيقاف الحملات التي في حالة "قيد التنفيذ" فقط')
  }

  if (status === 'running' && campaign.status !== 'paused') {
    throw new ValidationError('يمكن استئناف الحملات المتوقفة فقط')
  }

  // تحديث الحالة
  const { error: updateError } = await supabase
    .from('campaigns')
    .update({ status })
    .eq('id', campaignId)

  if (updateError) {
    throw new Error(`فشل في تحديث حالة الحملة: ${updateError.message}`)
  }

  // تسجيل في audit logs
  await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      team_id: campaign.team_id,
      action: status === 'paused' ? 'campaign_paused' : 'campaign_resumed',
      resource_type: 'campaign',
      resource_id: campaignId,
      details: JSON.stringify({
        campaign_name: campaign.name
      })
    })
}

/**
 * حذف حملة
 */
export async function deleteCampaign(
  supabase: SupabaseClient,
  campaignId: string,
  userId: string
): Promise<void> {
  // جلب الحملة للتحقق من وجودها وحالتها
  const campaign = await getCampaignById(supabase, campaignId)

  // التحقق من أن الحملة ليست قيد التنفيذ
  if (campaign.status === 'running') {
    throw new ValidationError('لا يمكن حذف حملة قيد التنفيذ. يرجى إيقافها أولاً.')
  }

  // حذف الحملة (سيتم حذف النتائج تلقائياً بسبب CASCADE)
  const { error: deleteError } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', campaignId)

  if (deleteError) {
    throw new Error(`فشل في حذف الحملة: ${deleteError.message}`)
  }

  // تسجيل في audit logs
  await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      team_id: campaign.team_id,
      action: 'campaign_deleted',
      resource_type: 'campaign',
      resource_id: campaignId,
      details: JSON.stringify({
        campaign_name: campaign.name
      })
    })
}

