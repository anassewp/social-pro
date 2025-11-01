/**
 * إعدادات الحملة المتقدمة
 */

export type MemberSelectionMode = 'auto' | 'absolute' | 'percent' | 'random'

export type SessionStrategy = 'equal' | 'random' | 'weighted'

export interface CampaignConfig {
  member_selection: {
    mode: MemberSelectionMode
    max_members?: number // للوضع absolute وauto
    percent?: number // للوضع percent وauto
    random_range?: [number, number] // للوضع random
  }
  timing: {
    mode: 'random'
    random_range_sec: [number, number] // [min, max]
    session_base_sec?: number // لكل جلسة
    session_jitter_sec?: number // لكل جلسة
  }
  sessions: {
    strategy: SessionStrategy
    min_per_session?: number
    session_ids?: string[] // إذا كانت محددة
  }
  anti_detection: {
    rate_limit_per_session_per_hour?: number
    pause_probability?: number // 0.0 - 1.0
    backoff?: {
      initial_sec: number
      factor: number
      max_sec: number
    }
  }
  dedup: {
    use_cache?: boolean
    cache_ttl_sec?: number
  }
}

export const DEFAULT_CAMPAIGN_CONFIG: CampaignConfig = {
  member_selection: {
    mode: 'auto',
    max_members: 1000,
    percent: 0.2,
    random_range: [300, 800]
  },
  timing: {
    mode: 'random',
    random_range_sec: [8, 20] // ✅ زيادة التأخير من 3-8 إلى 8-20 ثانية للحماية من PEER_FLOOD
  },
  sessions: {
    strategy: 'weighted',
    min_per_session: 10
  },
  anti_detection: {
    rate_limit_per_session_per_hour: 15, // ✅ تقليل من 30 إلى 15 رسالة/ساعة
    pause_probability: 0.1, // ✅ زيادة احتمالية التوقف من 5% إلى 10%
    backoff: {
      initial_sec: 180, // ✅ زيادة التأخير الأولي من 60 إلى 180 ثانية (3 دقائق)
      factor: 2,
      max_sec: 7200 // ✅ زيادة الحد الأقصى من ساعة إلى ساعتين
    }
  },
  dedup: {
    use_cache: false,
    cache_ttl_sec: 86400
  }
}

/**
 * حساب عدد الأعضاء المستهدفين بناءً على الإعدادات
 */
export function calculateTargetCount(
  totalMembers: number,
  config: CampaignConfig['member_selection']
): number {
  const { mode, max_members = 1000, percent = 0.2, random_range = [300, 800] } = config

  switch (mode) {
    case 'absolute':
      return Math.min(max_members, totalMembers)

    case 'percent':
      return Math.min(Math.floor(totalMembers * percent), totalMembers)

    case 'random':
      const [min, max] = random_range
      const randomCount = Math.floor(Math.random() * (max - min + 1)) + min
      return Math.min(randomCount, totalMembers)

    case 'auto':
    default:
      // ذكي: إذا group_size < 500 استخدم percent = 20% وmax = 200
      if (totalMembers < 500) {
        const autoCount = Math.floor(totalMembers * percent)
        return Math.min(autoCount, 200)
      }
      // وإلا استخدم min(max, floor(group_size * percent))
      return Math.min(max_members, Math.floor(totalMembers * percent))
  }
}

/**
 * حساب التأخير بين الرسائل مع jitter
 */
export function calculateDelay(
  config: CampaignConfig['timing'],
  sessionConfig?: { base_sec?: number; jitter_sec?: number }
): number {
  const { random_range_sec, session_base_sec, session_jitter_sec } = config
  const [min, max] = random_range_sec

  // إذا كان هناك إعدادات خاصة بالجلسة
  if (sessionConfig?.base_sec && sessionConfig?.jitter_sec) {
    const base = sessionConfig.base_sec * 1000
    const jitter = (Math.random() * 2 - 1) * sessionConfig.jitter_sec * 1000 // -jitter to +jitter
    return base + jitter
  }

  // استخدام session_base_sec و session_jitter_sec من config
  if (session_base_sec && session_jitter_sec) {
    const base = session_base_sec * 1000
    const jitter = (Math.random() * 2 - 1) * session_jitter_sec * 1000
    return base + jitter
  }

  // الوضع الافتراضي: نطاق عشوائي
  const delayMs = (Math.random() * (max - min) + min) * 1000
  return delayMs
}

/**
 * تحقق إذا كان يجب إضافة pause عشوائي
 */
export function shouldPause(config: CampaignConfig['anti_detection']): boolean {
  const { pause_probability = 0.05 } = config
  return Math.random() < pause_probability
}

/**
 * حساب exponential backoff
 */
export function calculateBackoff(
  attempt: number,
  config: CampaignConfig['anti_detection']['backoff']
): number {
  if (!config) return 0

  const { initial_sec, factor, max_sec } = config
  const backoffSec = Math.min(initial_sec * Math.pow(factor, attempt), max_sec)
  return backoffSec * 1000 // تحويل إلى milliseconds
}

/**
 * دمج الإعدادات الافتراضية مع الإعدادات المخصصة
 */
export function mergeConfig(customConfig?: Partial<CampaignConfig>): CampaignConfig {
  if (!customConfig) {
    return DEFAULT_CAMPAIGN_CONFIG
  }

  return {
    member_selection: {
      ...DEFAULT_CAMPAIGN_CONFIG.member_selection,
      ...customConfig.member_selection
    },
    timing: {
      ...DEFAULT_CAMPAIGN_CONFIG.timing,
      ...customConfig.timing
    },
    sessions: {
      ...DEFAULT_CAMPAIGN_CONFIG.sessions,
      ...customConfig.sessions
    },
    anti_detection: {
      ...DEFAULT_CAMPAIGN_CONFIG.anti_detection,
      ...customConfig.anti_detection
    },
    dedup: {
      ...DEFAULT_CAMPAIGN_CONFIG.dedup,
      ...customConfig.dedup
    }
  }
}

