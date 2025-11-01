import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * API Route للتحقق من التكرار قبل إنشاء الحملة
 * يعيد إحصائيات عن عدد الأعضاء الجدد والمكررين
 * 
 * @route POST /api/campaigns/check-duplicates
 * @body { target_groups: string[], teamId: string }
 * @returns { total_members: number, new_members: number, duplicates_excluded: number }
 */
export async function POST(request: NextRequest) {
  try {
    const { target_groups, teamId } = await request.json()

    if (!target_groups || !Array.isArray(target_groups) || target_groups.length === 0) {
      return NextResponse.json(
        { error: 'المجموعات المستهدفة مطلوبة' },
        { status: 400 }
      )
    }

    if (!teamId) {
      return NextResponse.json(
        { error: 'معرف الفريق مطلوب' },
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

    // جلب جميع الأعضاء المستهدفين
    const { data: allMembers } = await supabase
      .from('group_members')
      .select('telegram_user_id, username')
      .in('group_id', target_groups)
      .eq('is_bot', false)

    if (!allMembers || allMembers.length === 0) {
      return NextResponse.json({
        total_members: 0,
        new_members: 0,
        duplicates_excluded: 0
      })
    }

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
    const newMembers = allMembers.filter(member => {
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

    const totalMembers = allMembers.length
    const newMembersCount = newMembers.length
    const duplicateMembersCount = totalMembers - newMembersCount

    return NextResponse.json({
      total_members: totalMembers,
      new_members: newMembersCount,
      duplicates_excluded: duplicateMembersCount,
      duplicate_percentage: totalMembers > 0 
        ? Math.round((duplicateMembersCount / totalMembers) * 100) 
        : 0
    })

  } catch (error: any) {
    console.error('Check duplicates error:', error)
    return NextResponse.json(
      { error: error.message || 'فشل في التحقق من التكرار' },
      { status: 500 }
    )
  }
}

