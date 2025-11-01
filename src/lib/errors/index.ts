/**
 * Base Error Class للتطبيق
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public isOperational: boolean = true,
    public details?: any
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      ...(process.env.NODE_ENV === 'development' && {
        stack: this.stack,
      }),
    }
  }
}

/**
 * Validation Error - للأخطاء في البيانات المدخلة
 */
export class ValidationError extends AppError {
  constructor(
    message: string = 'بيانات غير صالحة',
    public fields?: Record<string, string>
  ) {
    super(message, 400, 'VALIDATION_ERROR', true, { fields })
  }
}

/**
 * Authentication Error - للأخطاء في المصادقة
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'غير مصرح بالوصول') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

/**
 * Authorization Error - للأخطاء في الصلاحيات
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'ليس لديك صلاحية للوصول لهذا المورد') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

/**
 * Not Found Error - للموارد غير الموجودة
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'المورد') {
    super(`${resource} غير موجود`, 404, 'NOT_FOUND')
  }
}

/**
 * Conflict Error - للنزاعات (مثل: duplicate entries)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'هذا العنصر موجود بالفعل') {
    super(message, 409, 'CONFLICT_ERROR')
  }
}

/**
 * Rate Limit Error - عند تجاوز الحد المسموح من الطلبات
 */
export class RateLimitError extends AppError {
  constructor(
    message: string = 'تجاوزت الحد المسموح من الطلبات. يرجى المحاولة لاحقاً',
    public retryAfter?: number
  ) {
    super(message, 429, 'RATE_LIMIT_ERROR', true, { retryAfter })
  }
}

/**
 * Telegram API Error - للأخطاء من Telegram API
 */
export class TelegramAPIError extends AppError {
  constructor(
    message: string,
    public telegramCode?: string,
    public originalError?: any
  ) {
    super(message, 500, 'TELEGRAM_API_ERROR', true, { telegramCode, originalError })
  }
}

/**
 * Database Error - لأخطاء قاعدة البيانات
 */
export class DatabaseError extends AppError {
  constructor(
    message: string = 'حدث خطأ في قاعدة البيانات',
    public query?: string
  ) {
    super(message, 500, 'DATABASE_ERROR', false, { query })
  }
}

/**
 * External Service Error - لأخطاء الخدمات الخارجية
 */
export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message: string = 'فشل في الاتصال بالخدمة الخارجية'
  ) {
    super(`${service}: ${message}`, 503, 'EXTERNAL_SERVICE_ERROR', true, { service })
  }
}

/**
 * Campaign Error - أخطاء خاصة بالحملات
 */
export class CampaignError extends AppError {
  constructor(
    message: string,
    code: string,
    statusCode: number = 400
  ) {
    super(message, statusCode, `CAMPAIGN_${code}`)
  }
}

/**
 * Helper function للتحقق من نوع الخطأ
 */
export function isAppError(error: any): error is AppError {
  return error instanceof AppError
}

/**
 * Helper function لاستخراج رسالة خطأ واضحة
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'حدث خطأ غير معروف'
}

/**
 * Helper function لتحويل Zod errors لـ ValidationError
 */
export function handleZodError(zodError: any): ValidationError {
  const fields: Record<string, string> = {}
  
  zodError.errors?.forEach((err: any) => {
    const path = err.path.join('.')
    fields[path] = err.message
  })
  
  return new ValidationError('بيانات غير صالحة', fields)
}

