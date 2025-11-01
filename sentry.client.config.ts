/**
 * Sentry Client Configuration
 * Only initializes if DSN is provided - Safe fallback if not configured
 */

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

// Only initialize if DSN is provided
if (SENTRY_DSN && process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: SENTRY_DSN,
    enabled: true,
    environment: process.env.NODE_ENV || 'production',
    
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    
    // Error Filtering
    beforeSend(event, hint) {
      // Filter out non-critical errors
      if (event.exception) {
        const error = hint.originalException
        
        // Skip hydration errors (common in Next.js)
        if (error instanceof Error && error.message.includes('Hydration')) {
          return null
        }
        
        // Skip darkreader warnings
        if (error instanceof Error && error.message.includes('darkreader')) {
          return null
        }
      }
      
      return event
    },
    
    // Integrations - commented out for compatibility
    // integrations: [
    //   Sentry.browserTracingIntegration(),
    //   Sentry.replayIntegration({
    //     maskAllText: true,
    //     blockAllMedia: true,
    //   }),
    // ],
    
    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || undefined,
  })
}

