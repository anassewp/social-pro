'use client'

import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'
import { captureException } from '@/lib/monitoring/sentry'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

/**
 * Error Boundary Component
 * يلتقط الأخطاء في مكونات React ويعرض UI بديل
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log الخطأ
    logger.error('React Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    })
    
    // استدعاء callback إذا كان موجوداً
    this.props.onError?.(error, errorInfo)
    
    // إرسال للـ Sentry (safe - no-op if not configured)
    captureException(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    })
    
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // استخدام fallback مخصص إذا كان موجوداً
      if (this.props.fallback) {
        return this.props.fallback
      }

      // UI افتراضي للأخطاء
      return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="h-20 w-20 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                حدث خطأ غير متوقع
              </h2>
              <p className="text-muted-foreground">
                نعتذر عن الإزعاج. حدث خطأ أثناء عرض هذه الصفحة.
              </p>
            </div>

            {/* Error Details (في Development فقط) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-right">
                <p className="text-sm font-mono text-red-900 dark:text-red-100 mb-2">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                variant="default"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                إعادة المحاولة
              </Button>
              
              <Button
                onClick={() => window.location.href = '/dashboard'}
                variant="outline"
              >
                العودة للوحة التحكم
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-sm text-muted-foreground">
              إذا استمرت المشكلة، يرجى{' '}
              <button
                onClick={() => window.location.reload()}
                className="text-primary underline hover:no-underline"
              >
                إعادة تحميل الصفحة
              </button>
              {' '}أو الاتصال بالدعم الفني.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook لإعادة تعيين Error Boundary من خارجها
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const throwError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  return { resetError, throwError }
}

