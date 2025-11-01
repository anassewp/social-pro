import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { errorHandler, successResponse } from '@/lib/middleware/errorHandler'
import { AuthenticationError, ValidationError } from '@/lib/errors'
import { z } from 'zod'
import { logger } from '@/lib/logger'

/**
 * Schema للـ pagination params
 */
const ListCampaignsSchema = z.object({
  page: z.string().nullable().optional().transform(v => {
    const parsed = parseInt(v || '1', 10)
    return isNaN(parsed) ? 1 : parsed
  }),
  pageSize: z.string().nullable().optional().transform(v => {
    const parsed = parseInt(v || '20', 10)
    return isNaN(parsed) ? 20 : parsed
  }),
  status: z.string().nullable().optional().transform(v => {
    const validStatuses = ['all', 'draft', 'scheduled', 'running', 'paused', 'completed', 'failed']
    return (v && validStatuses.includes(v)) ? v : 'all'
  }),
  search: z.string().nullable().optional().transform(v => v || undefined),
})

/**
 * GET /api/campaigns/list
 * جلب الحملات مع pagination
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new AuthenticationError()
    }
    
    // Get user's team
    const { data: teamData, error: teamError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
    
    if (teamError || !teamData?.team_id) {
      logger.warn('User has no team', {
        userId: user.id,
        error: teamError?.message,
      })
      throw new AuthenticationError('لا يوجد فريق مرتبط بحسابك')
    }
    
    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const rawParams = {
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
      status: searchParams.get('status'),
      search: searchParams.get('search'),
    }
    
    // Validate with safeParse to get better error messages
    const validationResult = ListCampaignsSchema.safeParse(rawParams)
    
    if (!validationResult.success) {
      const fields = validationResult.error.issues.reduce((acc, err) => {
        acc[err.path.join('.')] = err.message
        return acc
      }, {} as Record<string, string>)
      
      logger.warn('Validation error', {
        errors: validationResult.error.issues,
        params: rawParams,
      })
      
      throw new ValidationError('معاملات غير صالحة', fields)
    }
    
    const { page = 1, pageSize = 20, status = 'all', search } = validationResult.data
    
    // Validate pagination
    if (page < 1) {
      throw new ValidationError('رقم الصفحة يجب أن يكون أكبر من 0')
    }
    if (pageSize < 1 || pageSize > 100) {
      throw new ValidationError('حجم الصفحة يجب أن يكون بين 1 و 100')
    }
    
    const offset = (page - 1) * pageSize
    
    // Build query
    let query = supabase
      .from('campaigns')
      .select(
        'id, name, description, team_id, created_by, status, message_template, target_groups, progress, campaign_config, created_at, updated_at, started_at, completed_at',
        { count: 'exact' }
      )
      .eq('team_id', teamData.team_id)
    
    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    
    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)
    
    // Execute query
    const { data, error, count } = await query
    
    if (error) {
      logger.error('Failed to fetch campaigns', error as Error, {
        userId: user.id,
        teamId: teamData.team_id,
        errorCode: error.code,
        errorMessage: error.message,
      })
      throw new Error(`فشل في جلب الحملات: ${error.message}`)
    }
    
    // Parse JSON fields
    const campaigns = (data || []).map((campaign: any) => ({
      ...campaign,
      progress: typeof campaign.progress === 'string' 
        ? JSON.parse(campaign.progress) 
        : campaign.progress,
      target_groups: typeof campaign.target_groups === 'string'
        ? JSON.parse(campaign.target_groups)
        : campaign.target_groups,
    }))
    
    // Calculate pagination metadata
    const total = count || 0
    const totalPages = Math.ceil(total / pageSize)
    
    logger.request(
      'GET',
      '/api/campaigns/list',
      200,
      Date.now() - startTime,
      {
        userId: user.id,
        teamId: teamData.team_id,
        page,
        pageSize,
        total,
      }
    )
    
    return successResponse({
      data: campaigns,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
    
  } catch (error) {
    return errorHandler(error, {
      endpoint: '/api/campaigns/list',
      duration: Date.now() - startTime,
    })
  }
}

