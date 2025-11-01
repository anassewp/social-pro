/**
 * Cache Persistence Manager
 * إدارة حفظ واستعادة Cache من localStorage
 * 
 * يستخدم localStorage مباشرة بدون مكتبات إضافية
 */

import { QueryClient } from '@tanstack/react-query'

/**
 * البيانات المهمة التي يجب حفظها
 */
const PERSISTENT_KEYS = ['groups', 'campaigns', 'team', 'members'] as const

/**
 * إعدادات Persistence
 */
export const PERSISTENCE_CONFIG = {
  // Key للتعرف على البيانات المخزنة
  STORAGE_KEY: 'socialpro-query-cache',
  BACKUP_KEY: 'socialpro-query-cache-backup',
  
  // Max age للبيانات المخزنة (7 أيام)
  MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  
  // Version buster - للتحديث القسري عند تحديث الإصدار
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Max size للـ cache (5MB)
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
}

/**
 * Helper functions لإدارة Cache يدوياً
 */
export class CachePersistenceManager {
  private static readonly CACHE_KEY = PERSISTENCE_CONFIG.STORAGE_KEY
  private static readonly BACKUP_KEY = PERSISTENCE_CONFIG.BACKUP_KEY

  /**
   * حفظ cache يدوياً في localStorage
   */
  static saveCache(queryClient: QueryClient): boolean {
    if (typeof window === 'undefined') return false

    try {
      const cache = queryClient.getQueryCache()
      const queries = cache.getAll()
      
      // فلترة البيانات المهمة فقط
      const persistentQueries = queries.filter((query) => {
        const queryKey = query.queryKey[0] as string
        const persistentKeys = ['groups', 'campaigns', 'team', 'members']
        return persistentKeys.some(key => 
          queryKey === key || queryKey.startsWith(key + '_')
        )
      })

      const cacheData = persistentQueries.map((query) => ({
        queryKey: query.queryKey,
        state: {
          data: query.state.data,
          dataUpdatedAt: query.state.dataUpdatedAt,
          status: query.state.status,
        },
        meta: query.meta,
      }))

      // حفظ backup أولاً
      const existingData = localStorage.getItem(this.CACHE_KEY)
      if (existingData) {
        localStorage.setItem(this.BACKUP_KEY, existingData)
      }

      // حفظ البيانات الجديدة
      localStorage.setItem(this.CACHE_KEY, JSON.stringify({
        queries: cacheData,
        timestamp: Date.now(),
        version: PERSISTENCE_CONFIG.VERSION,
      }))

      return true
    } catch (error) {
      console.error('Failed to save cache:', error)
      return false
    }
  }

  /**
   * استعادة cache من localStorage
   */
  static restoreCache(queryClient: QueryClient): boolean {
    if (typeof window === 'undefined') return false

    try {
      const cacheData = localStorage.getItem(this.CACHE_KEY)
      if (!cacheData) return false

      const parsed = JSON.parse(cacheData)

      // التحقق من الإصدار
      if (parsed.version !== PERSISTENCE_CONFIG.VERSION) {
        console.warn('Cache version mismatch, clearing cache')
        this.clearCache()
        return false
      }

      // التحقق من عمر البيانات
      if (parsed.timestamp && Date.now() - parsed.timestamp > PERSISTENCE_CONFIG.MAX_AGE) {
        console.warn('Cache expired, clearing')
        this.clearCache()
        return false
      }

      // استعادة queries - استخدام queryClient.setQueryData
      let restoredCount = 0
      
      parsed.queries?.forEach((item: any) => {
        try {
          // التحقق من أن البيانات valid قبل الاستعادة
          if (item.state && item.state.data !== undefined && item.queryKey) {
            queryClient.setQueryData(item.queryKey, item.state.data, {
              updatedAt: item.state.dataUpdatedAt || Date.now(),
            })
            restoredCount++
          }
        } catch (error) {
          console.warn('Failed to restore query:', item.queryKey, error)
        }
      })
      
      if (restoredCount > 0) {
        console.log(`✅ Restored ${restoredCount} queries from cache`)
      }

      return restoredCount > 0
    } catch (error) {
      console.error('Failed to restore cache:', error)
      // محاولة استعادة backup
      return this.restoreBackup(queryClient)
    }
  }

  /**
   * استعادة backup
   */
  static restoreBackup(queryClient: QueryClient): boolean {
    if (typeof window === 'undefined') return false

    try {
      const backupData = localStorage.getItem(this.BACKUP_KEY)
      if (!backupData) return false

      const parsed = JSON.parse(backupData)

      parsed.queries?.forEach((item: any) => {
        try {
          if (item.state && item.state.data !== undefined && item.queryKey) {
            queryClient.setQueryData(item.queryKey, item.state.data, {
              updatedAt: item.state.dataUpdatedAt || Date.now(),
            })
          }
        } catch (error) {
          console.warn('Failed to restore backup query:', item.queryKey, error)
        }
      })

      return true
    } catch (error) {
      console.error('Failed to restore backup:', error)
      return false
    }
  }

  /**
   * مسح cache من localStorage
   */
  static clearCache(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(this.CACHE_KEY)
      localStorage.removeItem(this.BACKUP_KEY)
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  /**
   * مسح cache لجدول معين
   */
  static clearTableCache(tableName: string): void {
    if (typeof window === 'undefined') return

    try {
      const cacheData = localStorage.getItem(this.CACHE_KEY)
      if (!cacheData) return

      const parsed = JSON.parse(cacheData)
      if (!parsed.queries) return

      // فلترة queries التي لا تبدأ بـ tableName
      const beforeCount = parsed.queries.length
      parsed.queries = parsed.queries.filter((item: any) => {
        const queryKey = item.queryKey?.[0] as string
        return !(queryKey === tableName || queryKey?.startsWith(tableName + '_'))
      })
      
      const afterCount = parsed.queries.length
      
      if (beforeCount !== afterCount) {
        parsed.timestamp = Date.now() // تحديث timestamp
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(parsed))
        console.log(`🗑️ Cleared ${beforeCount - afterCount} queries for table: ${tableName}`)
      }
    } catch (error) {
      console.error('Failed to clear table cache:', error)
    }
  }

  /**
   * الحصول على حجم cache
   */
  static getCacheSize(): number {
    if (typeof window === 'undefined') return 0

    try {
      const cacheData = localStorage.getItem(this.CACHE_KEY)
      if (!cacheData) return 0

      return new Blob([cacheData]).size // حجم بالبايت
    } catch (error) {
      return 0
    }
  }

  /**
   * فحص إذا كان localStorage ممتلئ
   */
  static isStorageFull(): boolean {
    if (typeof window === 'undefined') return false

    try {
      // محاولة كتابة بيانات صغيرة
      const testKey = '__storage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return false
    } catch (error) {
      // localStorage ممتلئ
      return true
    }
  }

  /**
   * تنظيف cache القديم تلقائياً عند الوصول للحد الأقصى
   */
  static cleanupIfNeeded(): void {
    if (typeof window === 'undefined') return

    try {
      const cacheSize = this.getCacheSize()
      
      // إذا تجاوز الحجم المسموح، احذف أقدم البيانات
      if (cacheSize > PERSISTENCE_CONFIG.MAX_SIZE) {
        console.warn('Cache size exceeded, cleaning up old data...')
        
        const cacheData = localStorage.getItem(this.CACHE_KEY)
        if (!cacheData) return

        const parsed = JSON.parse(cacheData)
        if (!parsed.queries || parsed.queries.length === 0) return

        // ترتيب حسب timestamp (الأقدم أولاً)
        parsed.queries.sort((a: any, b: any) => {
          const aTime = a.state?.dataUpdatedAt || 0
          const bTime = b.state?.dataUpdatedAt || 0
          return aTime - bTime
        })

        // حذف النصف الأقدم
        const removeCount = Math.floor(parsed.queries.length / 2)
        parsed.queries = parsed.queries.slice(removeCount)
        parsed.timestamp = Date.now()

        localStorage.setItem(this.CACHE_KEY, JSON.stringify(parsed))
        console.log(`🧹 Cleaned up ${removeCount} old queries`)
      }
    } catch (error) {
      console.error('Failed to cleanup cache:', error)
    }
  }

  /**
   * الحصول على معلومات Cache
   */
  static getCacheInfo(): {
    size: number
    queryCount: number
    timestamp: number | null
    version: string | null
  } {
    if (typeof window === 'undefined') {
      return { size: 0, queryCount: 0, timestamp: null, version: null }
    }

    try {
      const cacheData = localStorage.getItem(this.CACHE_KEY)
      if (!cacheData) {
        return { size: 0, queryCount: 0, timestamp: null, version: null }
      }

      const parsed = JSON.parse(cacheData)
      return {
        size: this.getCacheSize(),
        queryCount: parsed.queries?.length || 0,
        timestamp: parsed.timestamp || null,
        version: parsed.version || null,
      }
    } catch (error) {
      return { size: 0, queryCount: 0, timestamp: null, version: null }
    }
  }
}

