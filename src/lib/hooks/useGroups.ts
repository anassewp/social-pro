'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

/**
 * Type definitions
 */
export interface Group {
  id: string
  name: string
  username?: string
  telegram_id: string
  type: 'channel' | 'group' | 'supergroup'
  member_count?: number
  team_id: string
  added_by: string
  is_active: boolean
  last_sync?: string
  created_at: string
  updated_at: string
}

/**
 * Fetch groups for a team
 */
async function fetchGroups(teamId: string): Promise<Group[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('groups')
    .select('id, name, username, telegram_id, type, member_count, team_id, added_by, is_active, last_sync, created_at, updated_at')
    .eq('team_id', teamId)
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * React Query Hook: useGroups
 */
export function useGroups(teamId: string | null) {
  return useQuery({
    queryKey: ['groups', teamId],
    queryFn: () => fetchGroups(teamId!),
    enabled: !!teamId,
    staleTime: 30 * 1000, // 30 ثانية - للتنقل السريع
    refetchOnMount: true, // إعادة جلب البيانات عند mount
    refetchOnWindowFocus: false, // لا re-fetch عند focus
  })
}

