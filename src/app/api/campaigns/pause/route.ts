import { NextRequest } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { withErrorHandler, successResponse } from '@/lib/middleware/errorHandler'
import { ValidationError } from '@/lib/errors'
import { updateCampaignStatus, getCampaignById } from '@/lib/services/campaign.service'

/**
 * API Route لإيقاف أو استئناف حملة
 * 
 * @route POST /api/campaigns/pause
 * @body { campaignId: string, action: 'pause' | 'resume' }
 * @returns { success: boolean, message: string }
 */
async function handlePause(request: NextRequest) {
  const { campaignId, action } = await request.json()

  // التحقق من المدخلات
  if (!campaignId || !action || !['pause', 'resume'].includes(action)) {
    throw new ValidationError('معرف الحملة والإجراء (pause أو resume) مطلوبان')
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

  // جلب الحملة للحصول على created_by
  const campaign = await getCampaignById(supabase, campaignId)

  // استخدام Service Layer
  await updateCampaignStatus(
    supabase,
    campaignId,
    action,
    campaign.created_by
  )

  return successResponse({
    message: action === 'pause' 
      ? 'تم إيقاف الحملة مؤقتاً'
      : 'تم استئناف الحملة. سيستمر الإرسال تلقائياً.',
  })
}

export const POST = withErrorHandler(handlePause, { endpoint: '/api/campaigns/pause' })

