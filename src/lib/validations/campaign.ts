import { z } from 'zod'

/**
 * Schema للـ Campaign Configuration
 */
export const CampaignConfigSchema = z.object({
  member_selection: z.object({
    mode: z.enum(['auto', 'absolute', 'percent', 'random']),
    max_members: z.number().positive().max(10000).optional(),
    percent: z.number().min(0).max(1).optional(),
    random_range: z.tuple([z.number().positive(), z.number().positive()]).optional(),
  }),
  timing: z.object({
    mode: z.literal('random'),
    random_range_sec: z.tuple([z.number().positive(), z.number().positive()]),
    session_base_sec: z.number().positive().optional(),
    session_jitter_sec: z.number().positive().optional(),
  }),
  sessions: z.object({
    strategy: z.enum(['equal', 'random', 'weighted']),
    min_per_session: z.number().positive().optional(),
  }),
  anti_detection: z.object({
    rate_limit_per_session_per_hour: z.number().min(10).max(100).optional(),
    pause_probability: z.number().min(0).max(1).optional(),
    backoff: z.object({
      initial_sec: z.number().positive(),
      factor: z.number().positive(),
      max_sec: z.number().positive(),
    }).optional(),
  }),
  dedup: z.object({
    use_cache: z.boolean().optional(),
    cache_ttl_sec: z.number().positive().optional(),
  }),
}).optional()

/**
 * Schema لإنشاء حملة جديدة
 */
export const CreateCampaignSchema = z.object({
  name: z.string()
    .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل')
    .max(255, 'الاسم طويل جداً (الحد الأقصى 255 حرف)')
    .regex(/^[\u0600-\u06FFa-zA-Z0-9\s\-_.,!?]+$/, 'الاسم يحتوي على أحرف غير مسموحة'),
  
  message_template: z.string()
    .min(1, 'الرسالة مطلوبة')
    .max(4096, 'الرسالة طويلة جداً (الحد الأقصى 4096 حرف)'),
  
  target_groups: z.array(z.string().uuid('معرف مجموعة غير صالح'))
    .min(1, 'يجب اختيار مجموعة واحدة على الأقل')
    .max(50, 'عدد كبير جداً من المجموعات (الحد الأقصى 50)'),
  
  campaign_config: CampaignConfigSchema,
  
  start_immediately: z.boolean().optional(),
  
  session_ids: z.array(z.string().uuid('معرف جلسة غير صالح'))
    .min(1, 'يجب اختيار جلسة واحدة على الأقل عند البدء الفوري')
    .optional(),
})

/**
 * Schema لبدء حملة
 */
export const StartCampaignSchema = z.object({
  campaignId: z.string().uuid('معرف حملة غير صالح'),
  sessionIds: z.array(z.string().uuid('معرف جلسة غير صالح'))
    .min(1, 'يجب اختيار جلسة واحدة على الأقل')
    .max(10, 'عدد كبير جداً من الجلسات (الحد الأقصى 10)'),
})

/**
 * Schema لإيقاف/استئناف حملة
 */
export const PauseCampaignSchema = z.object({
  campaignId: z.string().uuid('معرف حملة غير صالح'),
  action: z.enum(['pause', 'resume']),
})

/**
 * Schema لحذف حملة
 */
export const DeleteCampaignSchema = z.object({
  campaignId: z.string().uuid('معرف حملة غير صالح'),
})

/**
 * Schema لاستخراج الأعضاء
 */
export const ExtractMembersSchema = z.object({
  groupId: z.string().uuid('معرف مجموعة غير صالح'),
  sessionId: z.string().uuid('معرف جلسة غير صالح'),
  forceRefresh: z.boolean().optional(),
})

/**
 * Schema لحفظ جلسة تيليجرام
 */
export const SaveTelegramSessionSchema = z.object({
  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'رقم هاتف غير صالح'),
  sessionName: z.string()
    .min(3, 'اسم الجلسة يجب أن يكون 3 أحرف على الأقل')
    .max(100, 'اسم الجلسة طويل جداً'),
  sessionString: z.string().min(1, 'Session string مطلوب'),
})

