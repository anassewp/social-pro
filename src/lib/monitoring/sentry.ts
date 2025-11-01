/**
 * Sentry Error Monitoring Integration
 * Safe implementation with fallback - works even if Sentry is not configured
 */

let sentryInitialized = false

/**
 * Initialize Sentry if DSN is provided
 */
export function initSentry() {
  // فقط في Production وبوجود DSN
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PUBLIC_SENTRY_DSN &&
    typeof window === 'undefined' // Server-side only for now
  ) {
    try {
      // Dynamic import لتجنب تحميل Sentry في Development
      // سيتم إضافة initialization في sentry.client.config.ts و sentry.server.config.ts
      sentryInitialized = true
    } catch (error) {
      console.warn('Failed to initialize Sentry:', error)
      sentryInitialized = false
    }
  }
}

/**
 * Capture exception in Sentry (safe - no-op if Sentry not configured)
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (!sentryInitialized) {
    // Fallback: log to console if Sentry not available
    console.error('Exception (Sentry not configured):', error, context)
    return
  }

  try {
    // Dynamic import to avoid bundling Sentry when not needed
    if (typeof window !== 'undefined') {
      // Client-side
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.captureException(error, {
          contexts: {
            additional: context,
          },
        })
      })
    } else {
      // Server-side
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.captureException(error, {
          contexts: {
            additional: context,
          },
        })
      })
    }
  } catch (err) {
    // Silent fallback - don't break the app if Sentry fails
    console.error('Sentry capture failed:', err)
  }
}

/**
 * Capture message in Sentry (safe - no-op if Sentry not configured)
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) {
  if (!sentryInitialized) {
    // Fallback: log to console
    const logFn = level === 'error' ? console.error : level === 'warning' ? console.warn : console.info
    logFn(`[${level.toUpperCase()}] ${message}`, context)
    return
  }

  try {
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.captureMessage(message, {
        level: level as any,
        contexts: {
          additional: context,
        },
      })
    })
  } catch (err) {
    // Silent fallback
    console.error('Sentry message capture failed:', err)
  }
}

/**
 * Set user context in Sentry
 */
export function setUserContext(userId?: string, email?: string, username?: string) {
  if (!sentryInitialized) return

  try {
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.setUser({
        id: userId,
        email,
        username,
      })
    })
  } catch (err) {
    // Silent fallback
  }
}

/**
 * Add breadcrumb to Sentry
 */
export function addBreadcrumb(message: string, category?: string, level: 'info' | 'warning' | 'error' = 'info', data?: Record<string, any>) {
  if (!sentryInitialized) return

  try {
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.addBreadcrumb({
        message,
        category,
        level: level as any,
        data,
      })
    })
  } catch (err) {
    // Silent fallback
  }
}

