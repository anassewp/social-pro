'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface TeamMember {
  id: string
  userId: string
  email: string
  fullName: string
  role: 'admin' | 'manager' | 'operator'
  joinedAt: string
  invitedBy: string | null
  isCurrentUser: boolean
}

interface TeamInfo {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
}

interface TeamData {
  team: TeamInfo | null
  members: TeamMember[]
  currentUserRole: 'admin' | 'manager' | 'operator'
  isOwner: boolean
}

/**
 * React Query Hook: useTeam
 * جلب معلومات الفريق وأعضائه
 */
export function useTeam() {
  const queryClient = useQueryClient()

  return useQuery<TeamData>({
    queryKey: ['team'],
    queryFn: async () => {
      const response = await fetch('/api/team/list')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'فشل في جلب معلومات الفريق')
      }

      const data = await response.json()
      return data.data || data
    },
    staleTime: 30 * 1000, // 30 ثانية
    refetchOnMount: true, // إعادة جلب البيانات عند mount
    refetchOnWindowFocus: false,
  })
}

/**
 * React Query Hook: useInviteMember
 * دعوة عضو جديد للفريق
 */
export function useInviteMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { email: string; role: 'admin' | 'manager' | 'operator' }) => {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'فشل في دعوة العضو')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}

/**
 * React Query Hook: useUpdateMemberRole
 * تحديث دور عضو في الفريق
 */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { memberId: string; role: 'admin' | 'manager' | 'operator' }) => {
      const response = await fetch('/api/team/role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'فشل في تحديث دور العضو')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}

/**
 * React Query Hook: useRemoveMember
 * إزالة عضو من الفريق
 */
export function useRemoveMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (memberId: string) => {
      const response = await fetch('/api/team/member', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'فشل في إزالة العضو')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}

