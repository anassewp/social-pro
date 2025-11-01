/**
 * Cache Manager - نظام إدارة الذاكرة المؤقتة المتقدم
 * 
 * يوفر:
 * - Cache persistence للبيانات المهمة
 * - Cache invalidation strategy ذكي
 * - Cache statistics و monitoring
 */

import { QueryClient } from '@tanstack/react-query'

export interface CacheConfig {
  // مدة صلاحية البيانات (بالميلي ثانية)
  staleTime: number
  // مدة الاحتفاظ بالبيانات في الذاكرة بعد عدم الاستخدام
  gcTime: number
  // ما إذا كانت البيانات مهمة ويجب حفظها في localStorage
  persistent?: boolean
  // Cache key prefix للتعرف على نوع البيانات
  keyPrefix: string
}

export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // الجلسات - بيانات متغيرة لكن ليست حرجة جداً
  sessions: {
    staleTime: 2 * 60 * 1000, // 2 دقيقة
    gcTime: 10 * 60 * 1000, // 10 دقائق
    persistent: false,
    keyPrefix: 'sessions',
  },
  
  // المجموعات - بيانات مستقرة نسبياً
  groups: {
    staleTime: 5 * 60 * 1000, // 5 دقائق
    gcTime: 30 * 60 * 1000, // 30 دقيقة
    persistent: true,
    keyPrefix: 'groups',
  },
  
  // الحملات - بيانات مهمة وتحتاج تحديث
  campaigns: {
    staleTime: 1 * 60 * 1000, // 1 دقيقة
    gcTime: 15 * 60 * 1000, // 15 دقيقة
    persistent: true,
    keyPrefix: 'campaigns',
  },
  
  // الأعضاء - بيانات كثيرة، نحتاج caching قوي
  members: {
    staleTime: 3 * 60 * 1000, // 3 دقائق
    gcTime: 20 * 60 * 1000, // 20 دقيقة
    persistent: true,
    keyPrefix: 'members',
  },
  
  // معلومات الفريق - بيانات مستقرة جداً
  team: {
    staleTime: 10 * 60 * 1000, // 10 دقائق
    gcTime: 60 * 60 * 1000, // ساعة كاملة
    persistent: true,
    keyPrefix: 'team',
  },
  
  // Dashboard stats - بيانات تتغير بسرعة
  dashboard: {
    staleTime: 30 * 1000, // 30 ثانية
    gcTime: 5 * 60 * 1000, // 5 دقائق
    persistent: false,
    keyPrefix: 'dashboard',
  },
}

/**
 * Cache Invalidation Strategy
 * استراتيجيات لإلغاء صلاحية البيانات المخزنة
 */
export class CacheInvalidationStrategy {
  constructor(private queryClient: QueryClient) {}

  /**
   * إلغاء صلاحية cache لجدول معين
   */
  invalidateTable(tableName: keyof typeof CACHE_CONFIGS) {
    const config = CACHE_CONFIGS[tableName]
    if (!config) return

    // Invalidate جميع queries التي تبدأ بـ key prefix
    this.queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0] as string
        return key === config.keyPrefix || key.startsWith(config.keyPrefix + '_')
      },
    })

    // إذا كانت البيانات persistent، احذفها من localStorage أيضاً
    if (config.persistent && typeof window !== 'undefined') {
      const { CachePersistenceManager } = require('@/lib/cache/persistence')
      CachePersistenceManager.clearTableCache(config.keyPrefix)
    }
  }

  /**
   * إلغاء صلاحية cache لـ item معين
   */
  invalidateItem(tableName: keyof typeof CACHE_CONFIGS, itemId: string) {
    const config = CACHE_CONFIGS[tableName]
    if (!config) return

    this.queryClient.invalidateQueries({
      queryKey: [config.keyPrefix, itemId],
    })
  }

  /**
   * إلغاء صلاحية جميع cache المتعلق بفريق معين
   */
  invalidateTeamCache(teamId: string) {
    Object.keys(CACHE_CONFIGS).forEach((tableName) => {
      this.queryClient.invalidateQueries({
        predicate: (query) => {
          // التحقق إذا كان query يحتوي على team_id
          return JSON.stringify(query.queryKey).includes(teamId)
        },
      })
    })
  }

  /**
   * إلغاء صلاحية جميع cache
   */
  invalidateAll() {
    this.queryClient.invalidateQueries()
    
    // مسح localStorage أيضاً
    if (typeof window !== 'undefined') {
      const { CachePersistenceManager } = require('@/lib/cache/persistence')
      CachePersistenceManager.clearCache()
    }
  }

  /**
   * إزالة cache قديم (أكثر من gcTime)
   */
  clearExpiredCache() {
    this.queryClient.clear()
    
    // تنظيف localStorage
    if (typeof window !== 'undefined') {
      const { CachePersistenceManager } = require('@/lib/cache/persistence')
      CachePersistenceManager.cleanupIfNeeded()
    }
  }
}

/**
 * Cache Statistics - إحصائيات الـ cache
 */
export function getCacheStats(queryClient: QueryClient) {
  const cache = queryClient.getQueryCache()
  const queries = cache.getAll()

  const stats = {
    totalQueries: queries.length,
    activeQueries: queries.filter((q) => q.state.status === 'success').length,
    loadingQueries: queries.filter((q) => q.state.status === 'pending').length,
    errorQueries: queries.filter((q) => q.state.status === 'error').length,
    staleQueries: queries.filter((q) => q.isStale()).length,
  }

  return stats
}

