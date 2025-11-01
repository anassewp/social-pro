'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

/**
 * Type definitions
 */
export interface TelegramSession {
  id: string
  user_id: string
  team_id: string
  phone_number: string
  session_name: string
  is_active: boolean
  last_used?: string
  created_at: string
  updated_at: string
}

/**
 * Fetch sessions for a team
 */
async function fetchSessions(teamId: string): Promise<TelegramSession[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('telegram_sessions')
    .select('id, user_id, team_id, phone_number, session_name, is_active, last_used, created_at, updated_at')
    .eq('team_id', teamId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * React Query Hook: useSessions
 */
export function useSessions(teamId: string | null) {
  return useQuery({
    queryKey: ['sessions', teamId],
    queryFn: () => fetchSessions(teamId!),
    enabled: !!teamId,
    staleTime: 30 * 1000, // 30 ثانية - للتنقل السريع
    refetchOnMount: true, // إعادة جلب البيانات عند mount
    refetchOnWindowFocus: false, // لا re-fetch عند focus
  })
}

/**
 * React Query Hook: useDeleteSession
 */
export function useDeleteSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/telegram/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'فشل في حذف الجلسة')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

