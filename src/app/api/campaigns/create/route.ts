import { NextRequest } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { withErrorHandler, successResponse } from '@/lib/middleware/errorHandler'
import { createCampaign } from '@/lib/services/campaign.service'

/**
 * API Route لإنشاء حملة تسويقية جديدة
 * 
 * @route POST /api/campaigns/create
 * @body { 
 *   name: string, 
 *   description: string, 
 *   message_template: string,
 *   target_groups: string[],
 *   schedule_config?: object,
 *   campaign_config?: object,
 *   teamId: string,
 *   userId: string
 * }
 * @returns { success: boolean, campaign: object, stats: object }
 */
async function handleCreate(request: NextRequest) {
  const body = await request.json()
  const { 
    name, 
    description, 
    message_template,
    target_groups,
    schedule_config,
    campaign_config,
    teamId,
    userId
  } = body

  // التحقق من البيانات المطلوبة
  if (!teamId || !userId) {
    throw new Error('معلومات المستخدم والفريق مطلوبة')
  }

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

  // استخدام Service Layer
  const { campaign, stats } = await createCampaign(supabase, {
    name,
    description,
    message_template,
    target_groups,
    schedule_config,
    campaign_config,
    teamId,
    userId
  })

  return successResponse({
    message: 'تم إنشاء الحملة بنجاح',
    campaign,
    stats
  })
}

export const POST = withErrorHandler(handleCreate, { endpoint: '/api/campaigns/create' })
