/**
 * Rate Limiting للجلسات
 */

export interface RateLimitTracker {
  sessionId: string
  messagesPerHour: Map<number, number> // timestamp (hour) -> count
  currentHour: number
}

const rateLimitTrackers = new Map<string, RateLimitTracker>()

/**
 * التحقق من Rate Limit للجلسة
 */
export function checkRateLimit(
  sessionId: string,
  limitPerHour: number = 30
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const currentHour = Math.floor(now / (60 * 60 * 1000)) // timestamp للساعة الحالية
  
  let tracker = rateLimitTrackers.get(sessionId)
  
  if (!tracker || tracker.currentHour !== currentHour) {
    // إنشاء tracker جديد أو تحديث للساعة الحالية
    tracker = {
      sessionId,
      messagesPerHour: new Map(),
      currentHour
    }
    rateLimitTrackers.set(sessionId, tracker)
  }

  // تنظيف السجلات القديمة (أقدم من 24 ساعة)
  const dayAgo = currentHour - 24
  for (const [hour, _] of tracker.messagesPerHour.entries()) {
    if (hour < dayAgo) {
      tracker.messagesPerHour.delete(hour)
    }
  }

  // حساب الرسائل المرسلة في الساعة الحالية
  const currentCount = tracker.messagesPerHour.get(currentHour) || 0
  
  const allowed = currentCount < limitPerHour
  const remaining = Math.max(0, limitPerHour - currentCount)
  const resetAt = (currentHour + 1) * 60 * 60 * 1000 // بداية الساعة القادمة

  return { allowed, remaining, resetAt }
}

/**
 * تسجيل رسالة مرسلة للـ Rate Limiting
 */
export function recordMessage(sessionId: string): void {
  const now = Date.now()
  const currentHour = Math.floor(now / (60 * 60 * 1000))
  
  let tracker = rateLimitTrackers.get(sessionId)
  
  if (!tracker || tracker.currentHour !== currentHour) {
    tracker = {
      sessionId,
      messagesPerHour: new Map(),
      currentHour
    }
    rateLimitTrackers.set(sessionId, tracker)
  }

  const currentCount = tracker.messagesPerHour.get(currentHour) || 0
  tracker.messagesPerHour.set(currentHour, currentCount + 1)
}

/**
 * حساب activity score للجلسة من campaign_results
 */
export async function calculateActivityScore(
  sessionId: string,
  supabase: any,
  hours: number = 24
): Promise<number> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
  
  // احسب عدد الرسائل المرسلة بنجاح في آخر 24 ساعة
  // ملاحظة: هذا مثال - قد تحتاج لربط campaign_results بـ session_id
  // حالياً سنرجع قيمة افتراضية
  return 50 // قيمة افتراضية
}

/**
 * حساب reliability للجلسة من campaign_results
 */
export async function calculateReliability(
  sessionId: string,
  supabase: any,
  hours: number = 24
): Promise<number> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
  
  // احسب معدل النجاح (sent / total)
  // ملاحظة: هذا مثال - قد تحتاج لربط campaign_results بـ session_id
  // حالياً سنرجع قيمة افتراضية
  return 85 // قيمة افتراضية (85% success rate)
}

