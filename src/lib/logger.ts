/**
 * مستويات Logging
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * سياق إضافي للـ logs
 */
export interface LogContext {
  userId?: string
  teamId?: string
  campaignId?: string
  sessionId?: string
  requestId?: string
  ip?: string
  userAgent?: string
  duration?: number
  [key: string]: any
}

/**
 * بنية Log Entry
 */
interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

/**
 * Logger Class
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  /**
   * تنسيق Log Entry
   */
  private formatLogEntry(entry: LogEntry): string {
    if (this.isDevelopment) {
      // في Development: تنسيق جميل وملون
      return JSON.stringify(entry, null, 2)
    }
    
    // في Production: JSON على سطر واحد (للـ log aggregators)
    return JSON.stringify(entry)
  }

  /**
   * طباعة Log حسب المستوى
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          ...(this.isDevelopment && { stack: error.stack }),
        },
      }),
    }

    const formatted = this.formatLogEntry(entry)

    // طباعة في Console
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted)
        break
      case LogLevel.INFO:
        console.info(formatted)
        break
      case LogLevel.WARN:
        console.warn(formatted)
        break
      case LogLevel.ERROR:
        console.error(formatted)
        break
    }

    // في Production: أرسل للـ logging service
    if (this.isProduction) {
      this.sendToLoggingService(entry)
    }
  }

  /**
   * إرسال للـ logging service (مثل: Logtail, Datadog, CloudWatch)
   */
  private async sendToLoggingService(entry: LogEntry) {
    // TODO: تكامل مع logging service
    // مثال:
    // await fetch('https://in.logtail.com', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.LOGTAIL_TOKEN}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(entry),
    // })
  }

  /**
   * Debug log - للمعلومات التفصيلية جداً
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, context)
    }
  }

  /**
   * Info log - للمعلومات العامة
   */
  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * Warning log - للتحذيرات
   */
  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context)
  }

  /**
   * Error log - للأخطاء
   */
  error(message: string, error?: Error, context?: LogContext) {
    this.log(LogLevel.ERROR, message, context, error)
    
    // إرسال للـ Sentry إذا كان متاحاً
    if (error && this.isProduction) {
      try {
        const { captureException } = require('@/lib/monitoring/sentry')
        captureException(error, context)
      } catch {
        // Silent fallback - Sentry might not be configured
      }
    }
  }

  /**
   * Request log - لتسجيل HTTP requests
   */
  request(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ) {
    this.info(`${method} ${url} ${statusCode} - ${duration}ms`, {
      ...context,
      method,
      url,
      statusCode,
      duration,
    })
  }
}

/**
 * Logger instance المشتركة
 */
export const logger = new Logger()

/**
 * Helper functions للاستخدام السريع
 */
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: LogContext) =>
    logger.error(message, error, context),
}

