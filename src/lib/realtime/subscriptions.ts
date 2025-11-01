/**
 * Real-time Subscriptions Manager
 * 
 * يدير الاشتراكات الفورية مع Supabase لتحديث البيانات تلقائياً
 */

import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import { QueryClient } from '@tanstack/react-query'

export interface SubscriptionConfig {
  table: string
  teamId: string
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
  filter?: string
}

export class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map()
  private queryClient: QueryClient
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient, queryClient: QueryClient) {
    this.supabase = supabase
    this.queryClient = queryClient
  }

  /**
   * إنشاء subscription للجدول
   */
  subscribe(config: SubscriptionConfig): RealtimeChannel | null {
    const channelKey = `${config.table}_${config.teamId}`

    // إذا كان subscription موجود، ألغيه أولاً
    if (this.channels.has(channelKey)) {
      this.unsubscribe(config.table, config.teamId)
    }

    // بناء filter للـ subscription
    let filter = `team_id=eq.${config.teamId}`
    if (config.filter) {
      filter += `,${config.filter}`
    }

    // إنشاء channel جديد
    const channel = this.supabase
      .channel(`${config.table}_${config.teamId}_channel`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: config.table,
          filter,
        },
        (payload) => {
          this.handleRealtimeEvent(config.table, payload, {
            onInsert: config.onInsert,
            onUpdate: config.onUpdate,
            onDelete: config.onDelete,
          })
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Real-time subscription active: ${config.table} for team ${config.teamId}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Real-time subscription error: ${config.table} for team ${config.teamId}`)
        }
      })

    this.channels.set(channelKey, channel)
    return channel
  }

  /**
   * معالجة أحداث real-time
   */
  private handleRealtimeEvent(
    table: string,
    payload: any,
    callbacks: {
      onInsert?: (payload: any) => void
      onUpdate?: (payload: any) => void
      onDelete?: (payload: any) => void
    }
  ) {
    const eventType = payload.eventType

    switch (eventType) {
      case 'INSERT':
        callbacks.onInsert?.(payload)
        this.invalidateCache(table)
        break

      case 'UPDATE':
        callbacks.onUpdate?.(payload)
        this.invalidateCache(table)
        break

      case 'DELETE':
        callbacks.onDelete?.(payload)
        this.invalidateCache(table)
        break
    }
  }

  /**
   * إلغاء صلاحية cache عند حدوث تغيير
   */
  private invalidateCache(table: string) {
    // تحديد query key حسب الجدول
    const tableToKeyMap: Record<string, string[]> = {
      telegram_sessions: ['sessions'],
      groups: ['groups'],
      campaigns: ['campaigns'],
      group_members: ['members', 'groups'], // members تؤثر على groups أيضاً
      team_members: ['team'],
    }

    const keys = tableToKeyMap[table] || []
    keys.forEach((key) => {
      this.queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0] as string
          return queryKey === key || queryKey.startsWith(key + '_')
        },
      })
    })
  }

  /**
   * إلغاء subscription
   */
  unsubscribe(table: string, teamId: string) {
    const channelKey = `${table}_${teamId}`
    const channel = this.channels.get(channelKey)

    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(channelKey)
      console.log(`🔌 Unsubscribed from ${table} for team ${teamId}`)
    }
  }

  /**
   * إلغاء جميع subscriptions
   */
  unsubscribeAll() {
    this.channels.forEach((channel, key) => {
      this.supabase.removeChannel(channel)
      console.log(`🔌 Unsubscribed from ${key}`)
    })
    this.channels.clear()
  }

  /**
   * الحصول على حالة subscription
   */
  getSubscriptionStatus(table: string, teamId: string): string | null {
    const channelKey = `${table}_${teamId}`
    const channel = this.channels.get(channelKey)
    if (!channel) return null
    
    // إرجاع حالة القناة مباشرة (string)
    return String(channel.state || 'UNKNOWN')
  }
}

/**
 * Hook helper لاستخدام Real-time Manager
 */
export function createRealtimeManager(
  supabase: SupabaseClient,
  queryClient: QueryClient
): RealtimeManager {
  return new RealtimeManager(supabase, queryClient)
}

