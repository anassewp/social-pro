'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { PaginationParams, PaginatedResponse } from '@/lib/types/pagination'

/**
 * Type definitions
 */
export interface Campaign {
  id: string
  name: string
  description?: string
  team_id: string
  created_by: string
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed'
  message_template: string
  target_groups: string[]
  schedule_config?: any
  progress: {
    sent: number
    failed: number
    total: number
    duplicates_excluded?: number
    original_count?: number
    error?: string
  }
  campaign_config?: any
  created_at: string
  updated_at: string
  started_at?: string
  completed_at?: string
}

/**
 * Fetch campaigns with pagination
 */
async function fetchCampaigns(
  teamId: string,
  params: PaginationParams & { status?: string; search?: string }
): Promise<PaginatedResponse<Campaign>> {
  const { page, pageSize, status, search } = params
  
  // بناء query string
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    ...(status && status !== 'all' && { status }),
    ...(search && { search }),
  })
  
  const response = await fetch(`/api/campaigns/list?${queryParams}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'فشل في جلب الحملات')
  }
  
  const result = await response.json()
  return result.data
}

/**
 * Fetch single campaign
 */
async function fetchCampaign(campaignId: string): Promise<Campaign | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single()

  if (error) throw error
  if (!data) return null

  return {
    ...data,
    progress: typeof data.progress === 'string' 
      ? JSON.parse(data.progress) 
      : data.progress,
    target_groups: typeof data.target_groups === 'string'
      ? JSON.parse(data.target_groups)
      : data.target_groups,
  }
}

/**
 * React Query Hook: useCampaigns
 * جلب الحملات مع pagination وcaching تلقائي
 */
export function useCampaigns(
  teamId: string,
  params: PaginationParams & { status?: string; search?: string } = { page: 1, pageSize: 20 }
) {
  return useQuery({
    queryKey: ['campaigns', teamId, params.page, params.pageSize, params.status, params.search],
    queryFn: () => fetchCampaigns(teamId, params),
    staleTime: 30 * 1000, // 30 ثانية - للتنقل السريع
    refetchOnMount: true, // إعادة جلب البيانات عند mount
    refetchOnWindowFocus: false, // لا re-fetch عند focus
    enabled: !!teamId, // فقط إذا كان teamId موجود
  })
}

/**
 * React Query Hook: useCampaign
 * جلب حملة واحدة
 */
export function useCampaign(campaignId: string | null) {
  return useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => fetchCampaign(campaignId!),
    enabled: !!campaignId,
    staleTime: 1 * 60 * 1000, // دقيقة واحدة
  })
}

/**
 * React Query Hook: useCreateCampaign
 * إنشاء حملة جديدة مع optimistic updates
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      message_template: string
      target_groups: string[]
      campaign_config?: any
      start_immediately?: boolean
      session_ids?: string[]
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('غير مصرح')

      // Get user's team
      const { data: teamData } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .single()

      if (!teamData) throw new Error('لا يوجد فريق')

      const response = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'فشل في إنشاء الحملة')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // Invalidate campaigns list to refetch
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      
      // إذا تم البدء فوراً، invalidate أيضاً
      if (variables.start_immediately) {
        queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      }
    },
  })
}

/**
 * React Query Hook: useDeleteCampaign
 * حذف حملة
 */
export function useDeleteCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await fetch(`/api/campaigns/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'فشل في حذف الحملة')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate campaigns list
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

/**
 * React Query Hook: usePauseCampaign
 * إيقاف/استئناف حملة
 */
export function usePauseCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ campaignId, action }: { campaignId: string; action: 'pause' | 'resume' }) => {
      const response = await fetch(`/api/campaigns/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, action }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || `فشل في ${action === 'pause' ? 'إيقاف' : 'استئناف'} الحملة`)
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalidate specific campaign
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.campaignId] })
      
      // Invalidate campaigns list
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

