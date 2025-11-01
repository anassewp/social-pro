/**
 * useRealtime Hook
 * Hook لإدارة الاشتراكات الفورية مع Supabase
 */

'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { RealtimeManager, createRealtimeManager } from '@/lib/realtime/subscriptions'

/**
 * Hook لإضافة real-time subscription للجدول
 */
export function useRealtimeSubscription(
  table: 'telegram_sessions' | 'groups' | 'campaigns' | 'group_members' | 'team_members',
  teamId: string | null,
  options?: {
    enabled?: boolean
    onInsert?: (payload: any) => void
    onUpdate?: (payload: any) => void
    onDelete?: (payload: any) => void
    filter?: string
  }
) {
  const queryClient = useQueryClient()
  const managerRef = useRef<RealtimeManager | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // إنشاء manager إذا لم يكن موجوداً
    if (!managerRef.current) {
      managerRef.current = createRealtimeManager(supabase, queryClient)
    }

    const manager = managerRef.current
    const enabled = options?.enabled !== false

    // التأكد من وجود teamId قبل الاشتراك
    if (!teamId || !enabled) {
      return
    }

    // إنشاء subscription
    manager.subscribe({
      table,
      teamId,
      onInsert: options?.onInsert,
      onUpdate: options?.onUpdate,
      onDelete: options?.onDelete,
      filter: options?.filter,
    })

    // Cleanup عند unmount أو تغيير teamId
    return () => {
      manager.unsubscribe(table, teamId)
    }
  }, [table, teamId, options?.enabled, supabase, queryClient])

  return managerRef.current
}

/**
 * Hook مركب لإضافة real-time subscriptions متعددة
 */
export function useMultipleRealtimeSubscriptions(
  teamId: string | null,
  subscriptions: Array<{
    table: 'telegram_sessions' | 'groups' | 'campaigns' | 'group_members' | 'team_members'
    enabled?: boolean
    onInsert?: (payload: any) => void
    onUpdate?: (payload: any) => void
    onDelete?: (payload: any) => void
    filter?: string
  }>
) {
  const queryClient = useQueryClient()
  const managerRef = useRef<RealtimeManager | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = createRealtimeManager(supabase, queryClient)
    }

    const manager = managerRef.current

    if (!teamId) {
      return
    }

    // إنشاء جميع subscriptions
    subscriptions.forEach((sub) => {
      if (sub.enabled !== false) {
        manager.subscribe({
          table: sub.table,
          teamId,
          onInsert: sub.onInsert,
          onUpdate: sub.onUpdate,
          onDelete: sub.onDelete,
          filter: sub.filter,
        })
      }
    })

    // Cleanup
    return () => {
      subscriptions.forEach((sub) => {
        manager.unsubscribe(sub.table, teamId)
      })
    }
  }, [teamId, JSON.stringify(subscriptions), supabase, queryClient])
}

