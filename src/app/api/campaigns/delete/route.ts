import { NextRequest } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { withErrorHandler, successResponse } from '@/lib/middleware/errorHandler'
import { ValidationError } from '@/lib/errors'
import { deleteCampaign, getCampaignById } from '@/lib/services/campaign.service'

/**
 * API Route لحذف حملة
 * 
 * @route DELETE /api/campaigns/delete
 * @body { campaignId: string }
 * @returns { success: boolean, message: string }
 */
async function handleDelete(request: NextRequest) {
  const { campaignId } = await request.json()

  // التحقق من المدخلات
  if (!campaignId) {
    throw new ValidationError('معرف الحملة مطلوب')
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
  await deleteCampaign(
    supabase,
    campaignId,
    campaign.created_by
  )

  return successResponse({
    message: 'تم حذف الحملة بنجاح',
  })
}

export const DELETE = withErrorHandler(handleDelete, { endpoint: '/api/campaigns/delete' })

