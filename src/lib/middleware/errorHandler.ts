import { NextResponse } from 'next/server'
import { AppError, isAppError, ValidationError, handleZodError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { captureException } from '@/lib/monitoring/sentry'
import { ZodError } from 'zod'

/**
 * معالج مركزي للأخطاء في API Routes
 */
export function errorHandler(error: unknown, context?: Record<string, any>): NextResponse {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationError = handleZodError(error)
    logger.warn('Validation error', {
      ...context,
      fields: validationError.fields,
    })
    
    return NextResponse.json(
      {
        error: {
          message: validationError.message,
          code: validationError.code,
          fields: validationError.fields,
        },
      },
      { status: validationError.statusCode }
    )
  }
  
  // Handle custom AppError instances
  if (isAppError(error)) {
    // Log based on severity
    if (error.statusCode >= 500) {
      logger.error(error.message, error as Error, context)
    } else {
      logger.warn(error.message, {
        ...context,
        code: error.code,
        statusCode: error.statusCode,
      })
    }
    
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          ...(error.details && { details: error.details }),
        },
      },
      { status: error.statusCode }
    )
  }
  
  // Handle standard Error instances
  if (error instanceof Error) {
    logger.error('Unexpected error', error, context)
    // إرسال للـ Sentry (safe - no-op if not configured)
    captureException(error, context)
    
    // في Development: أظهر التفاصيل
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        {
          error: {
            message: error.message,
            code: 'INTERNAL_ERROR',
            stack: error.stack,
          },
        },
        { status: 500 }
      )
    }
    
    // في Production: رسالة عامة
    return NextResponse.json(
      {
        error: {
          message: 'حدث خطأ داخلي. يرجى المحاولة لاحقاً',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    )
  }
  
  // Handle unknown errors
  const unknownError = new Error(String(error))
  logger.error('Unknown error type', unknownError, context)
  captureException(unknownError, context)
  
  return NextResponse.json(
    {
      error: {
        message: 'حدث خطأ غير متوقع',
        code: 'UNKNOWN_ERROR',
      },
    },
    { status: 500 }
  )
}

/**
 * Wrapper للـ API routes لمعالجة الأخطاء تلقائياً
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  context?: Record<string, any>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return errorHandler(error, context)
    }
  }
}

/**
 * Helper لإنشاء response ناجح
 */
export function successResponse<T = any>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  )
}

/**
 * Helper لإنشاء response للعملية الناجحة بدون data
 */
export function okResponse(message?: string): NextResponse {
  return NextResponse.json(
    {
      success: true,
      ...(message && { message }),
    },
    { status: 200 }
  )
}

