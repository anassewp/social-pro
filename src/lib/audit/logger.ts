import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

/**
 * أنواع الإجراءات القابلة للتدقيق
 */
export enum AuditAction {
  // User actions
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTER = 'user_register',
  USER_PASSWORD_RESET = 'user_password_reset',
  
  // Campaign actions
  CAMPAIGN_CREATED = 'campaign_created',
  CAMPAIGN_STARTED = 'campaign_started',
  CAMPAIGN_PAUSED = 'campaign_paused',
  CAMPAIGN_RESUMED = 'campaign_resumed',
  CAMPAIGN_DELETED = 'campaign_deleted',
  CAMPAIGN_COMPLETED = 'campaign_completed',
  CAMPAIGN_FAILED = 'campaign_failed',
  
  // Session actions
  SESSION_ADDED = 'session_added',
  SESSION_DELETED = 'session_deleted',
  SESSION_UPDATED = 'session_updated',
  
  // Group actions
  GROUP_ADDED = 'group_added',
  GROUP_DELETED = 'group_deleted',
  MEMBERS_EXTRACTED = 'members_extracted',
  
  // Team actions
  TEAM_CREATED = 'team_created',
  TEAM_UPDATED = 'team_updated',
  TEAM_MEMBER_ADDED = 'team_member_added',
  TEAM_MEMBER_REMOVED = 'team_member_removed',
  TEAM_MEMBER_ROLE_CHANGED = 'team_member_role_changed',
  
  // Permission changes
  PERMISSION_CHANGED = 'permission_changed',
}

/**
 * بنية Audit Log Entry
 */
export interface AuditLogEntry {
  action: AuditAction
  user_id: string
  team_id?: string
  resource_type?: string
  resource_id?: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
}

/**
 * تسجيل إجراء في Audit Log
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = await createClient()
    
    // حفظ في قاعدة البيانات
    const { error } = await supabase.from('audit_logs').insert({
      action: entry.action,
      user_id: entry.user_id,
      team_id: entry.team_id,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,
      details: entry.details,
      ip_address: entry.ip_address,
      user_agent: entry.user_agent,
      // created_at سيُضاف تلقائياً من DEFAULT NOW()
    })
    
    if (error) {
      logger.error('Failed to log audit entry', error as Error, {
        action: entry.action,
        userId: entry.user_id,
      })
      return
    }
    
    // Log أيضاً في structured logger
    logger.info(`Audit: ${entry.action}`, {
      userId: entry.user_id,
      teamId: entry.team_id,
      resourceType: entry.resource_type,
      resourceId: entry.resource_id,
      ...entry.details,
    })
    
    // في Production: أرسل للـ monitoring service
    if (process.env.NODE_ENV === 'production') {
      // await sendToMonitoringService(entry)
    }
  } catch (error) {
    // لا نريد أن يفشل الـ API بسبب فشل Audit logging
    logger.error('Audit logging failed', error as Error)
  }
}

/**
 * Helper لاستخراج IP من Request
 */
export function getClientIP(request: Request): string | undefined {
  // Try different headers
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  return undefined
}

/**
 * Helper لاستخراج User Agent من Request
 */
export function getUserAgent(request: Request): string | undefined {
  return request.headers.get('user-agent') || undefined
}

/**
 * Helper لإنشاء Audit Log Entry من Request
 */
export function createAuditEntry(
  action: AuditAction,
  userId: string,
  request: Request,
  additional?: Partial<AuditLogEntry>
): AuditLogEntry {
  return {
    action,
    user_id: userId,
    ip_address: getClientIP(request),
    user_agent: getUserAgent(request),
    ...additional,
  }
}

