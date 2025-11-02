'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { RefreshCw, AlertCircle, Clock, Wifi, WifiOff, ChevronDown, ChevronUp } from 'lucide-react'

export interface RetryConfig {
  /**
   * عدد المحاولات القصوى
   */
  maxRetries: number

  /**
   * التأخير الأولي بين المحاولات (بالميللي ثانية)
   */
  initialDelay: number

  /**
   * عامل زيادة التأخير
   */
  backoffFactor: number

  /**
   * أقصى تأخير مسموح (بالميللي ثانية)
   */
  maxDelay: number

  /**
   * أنواع الأخطاء القابلة للإعادة
   */
  retryableErrors?: string[]

  /**
   * دالة للتحقق من إمكانية إعادة المحاولة
   */
  shouldRetry?: (error: Error) => boolean

  /**
   * دالة للتنفيذ
   */
  onRetry?: (attempt: number, error: Error) => void
}

export interface RetryState {
  attempt: number
  lastError: Error | null
  isRetrying: boolean
  canRetry: boolean
  nextRetryIn: number | null
}

const defaultConfig: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  backoffFactor: 2,
  maxDelay: 30000,
  retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR'],
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.initialDelay * Math.pow(config.backoffFactor, attempt - 1)
  return Math.min(delay, config.maxDelay)
}

export function useRetryableOperation(
  operation: () => Promise<any>,
  config: Partial<RetryConfig> = {}
) {
  const finalConfig = { ...defaultConfig, ...config }
  const [state, setState] = useState<RetryState>({
    attempt: 0,
    lastError: null,
    isRetrying: false,
    canRetry: true,
    nextRetryIn: null,
  })

  const execute = useCallback(async () => {
    let currentAttempt = 0
    let lastError: Error | null = null

    while (currentAttempt < finalConfig.maxRetries) {
      currentAttempt++
      setState(prev => ({
        ...prev,
        attempt: currentAttempt,
        isRetrying: currentAttempt > 1,
        lastError: null,
      }))

      try {
        const result = await operation()
        setState(prev => ({
          ...prev,
          isRetrying: false,
          lastError: null,
          canRetry: true,
          nextRetryIn: null,
        }))
        return result
      } catch (error) {
        lastError = error as Error
        
        // Check if this error is retryable
        const isRetryable = finalConfig.shouldRetry?.(lastError) || 
          finalConfig.retryableErrors?.some(type => 
            lastError.message.includes(type) || lastError.name.includes(type)
          )

        if (!isRetryable || currentAttempt >= finalConfig.maxRetries) {
          setState(prev => ({
            ...prev,
            isRetrying: false,
            lastError,
            canRetry: false,
            attempt: currentAttempt,
            nextRetryIn: null,
          }))
          throw lastError
        }

        const delay = calculateDelay(currentAttempt, finalConfig)
        
        setState(prev => ({
          ...prev,
          lastError,
          nextRetryIn: delay,
        }))

        // Wait before next retry
        await new Promise(resolve => setTimeout(resolve, delay))
        finalConfig.onRetry?.(currentAttempt, lastError)
      }
    }

    throw lastError
  }, [operation, finalConfig])

  const retry = useCallback(() => {
    setState(prev => ({
      ...prev,
      canRetry: prev.attempt < finalConfig.maxRetries,
      nextRetryIn: null,
    }))
    return execute()
  }, [execute, finalConfig.maxRetries])

  return {
    ...state,
    execute,
    retry,
  }
}

export interface RetryableComponentProps {
  /**
   * الدالة المراد تنفيذها
   */
  operation: () => Promise<any>

  /**
   * إعدادات إعادة المحاولة
   */
  config?: Partial<RetryConfig>

  /**
   * الأطفال عند النجاح
   */
  children: React.ReactNode

  /**
   * مكون الخطأ المخصص
   */
  errorComponent?: React.ComponentType<{ error: Error; onRetry: () => void; attempt: number }>

  /**
   * مكون التحميل المخصص
   */
  loadingComponent?: React.ComponentType<{ attempt: number }>

  /**
   * تخصيص className
   */
  className?: string

  /**
   * إظهار تفاصيل المحاولات
   */
  showAttemptDetails?: boolean

  /**
   * إظهار مؤقت العد التنازلي
   */
  showCountdown?: boolean

  /**
   * تمكين الإيقاف التلقائي
   */
  autoRetry?: boolean
}

export function RetryableComponent({
  operation,
  config,
  children,
  errorComponent: ErrorComponent,
  loadingComponent: LoadingComponent,
  className,
  showAttemptDetails = true,
  showCountdown = true,
  autoRetry = false,
}: RetryableComponentProps) {
  const { ...retryState } = useRetryableOperation(operation, config)
  const [countdown, setCountdown] = useState<number | null>(null)

  // Countdown timer for next retry
  useEffect(() => {
    if (retryState.nextRetryIn && showCountdown) {
      setCountdown(Math.ceil(retryState.nextRetryIn / 1000))
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer)
            return null
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [retryState.nextRetryIn, showCountdown])

  // Auto retry
  useEffect(() => {
    if (autoRetry && retryState.nextRetryIn === 0 && retryState.canRetry) {
      retryState.retry()
    }
  }, [autoRetry, retryState.nextRetryIn, retryState.canRetry, retryState])

  if (retryState.isRetrying || retryState.attempt === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-6 space-y-3', className)}>
        {LoadingComponent ? (
          <LoadingComponent attempt={retryState.attempt} />
        ) : (
          <>
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">
                {retryState.attempt === 0 ? 'جاري التحميل...' : `محاولة ${retryState.attempt} من ${config?.maxRetries || 3}`}
              </p>
              {showAttemptDetails && retryState.attempt > 1 && (
                <p className="text-xs text-muted-foreground">
                  {countdown !== null ? `إعادة المحاولة خلال ${countdown} ثانية` : 'جاري التحضير للمحاولة التالية...'}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  if (retryState.lastError && !retryState.canRetry) {
    const error = retryState.lastError
    
    if (ErrorComponent) {
      return (
        <ErrorComponent 
          error={error} 
          onRetry={retryState.retry} 
          attempt={retryState.attempt}
        />
      )
    }

    return (
      <div className={cn('p-6 border border-destructive/20 rounded-lg bg-destructive/5', className)}>
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-medium">فشل في التحميل</h3>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {error.message || 'حدث خطأ غير متوقع'}
            </p>
            
            {showAttemptDetails && (
              <div className="text-xs text-muted-foreground">
                تم إجراء {retryState.attempt} محاولات
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={retryState.retry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>إعادة المحاولة</span>
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function NetworkAwareRetry({
  operation,
  config,
  children,
  className,
}: Omit<RetryableComponentProps, 'operation'> & {
  operation: () => Promise<any>
}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const enhancedConfig = {
    ...config,
    shouldRetry: (error: Error) => {
      if (!isOnline) return false
      return config?.shouldRetry?.(error) ?? true
    }
  }

  if (!isOnline) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-6 space-y-3', className)}>
        <WifiOff className="h-12 w-12 text-muted-foreground" />
        <div className="text-center space-y-1">
          <h3 className="font-medium">غير متصل بالإنترنت</h3>
          <p className="text-sm text-muted-foreground">تحقق من اتصالك وأعد المحاولة</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Wifi className="h-3 w-3" />
          <span>سيتم إعادة المحاولة عند الاتصال</span>
        </div>
      </div>
    )
  }

  return (
    <RetryableComponent
      operation={operation}
      config={enhancedConfig}
      className={className}
    >
      {children}
    </RetryableComponent>
  )
}

export function ProgressiveRetry({
  operation,
  config,
  children,
  className,
  steps = 3,
}: RetryableComponentProps & {
  steps?: number
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const stepConfigs = [
    { delay: 1000, description: 'محاولة سريعة' },
    { delay: 3000, description: 'انتظار أكثر' },
    { delay: 8000, description: 'محاولة أخيرة' },
  ]

  const enhancedConfig = {
    ...config,
    maxRetries: steps,
    initialDelay: stepConfigs[0]?.delay || 1000,
    onRetry: (attempt: number) => {
      setCurrentStep(Math.min(attempt - 1, steps - 1))
      config?.onRetry?.(attempt, {} as Error)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">محاولات التحميل</h3>
        <span className="text-xs text-muted-foreground">
          {currentStep + 1} من {steps}
        </span>
      </div>
      
      <div className="space-y-2">
        {stepConfigs.slice(0, steps).map((step, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center space-x-3 p-2 rounded-lg transition-colors',
              index <= currentStep 
                ? 'bg-primary/10 text-primary' 
                : 'bg-muted text-muted-foreground'
            )}
          >
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs',
              index < currentStep 
                ? 'bg-primary text-primary-foreground' 
                : index === currentStep
                ? 'bg-primary text-primary-foreground animate-pulse'
                : 'bg-muted text-muted-foreground'
            )}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className="text-sm">{step.description}</span>
            {index === currentStep && (
              <RefreshCw className="h-4 w-4 animate-spin ml-auto" />
            )}
          </div>
        ))}
      </div>

      <RetryableComponent
        operation={operation}
        config={enhancedConfig}
        className="mt-4"
      >
        {children}
      </RetryableComponent>
    </div>
  )
}

// Exponential Backoff Visualizer
export function BackoffVisualizer({
  attempt,
  config,
  className,
}: {
  attempt: number
  config: RetryConfig
  className?: string
}) {
  const delays = Array.from({ length: config.maxRetries }, (_, i) => 
    calculateDelay(i + 1, config)
  )

  const formatDelay = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-sm font-medium">خطة إعادة المحاولة</h4>
      <div className="space-y-2">
        {delays.map((delay, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center justify-between p-2 rounded border',
              index + 1 === attempt
                ? 'bg-primary/10 border-primary/20 text-primary'
                : index + 1 < attempt
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-muted/50 border-muted text-muted-foreground'
            )}
          >
            <span className="text-sm">
              المحاولة {index + 1}
              {index + 1 === attempt && ' (حالية)'}
              {index + 1 < attempt && ' (مكتملة)'}
            </span>
            <span className="text-sm font-mono">
              {formatDelay(delay)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Smart Retry Button
export function SmartRetryButton({
  onRetry,
  isRetrying,
  canRetry,
  attempt,
  maxRetries,
  className,
}: {
  onRetry: () => void
  isRetrying: boolean
  canRetry: boolean
  attempt: number
  maxRetries: number
  className?: string
}) {
  const [showDetails, setShowDetails] = useState(false)

  if (!canRetry && attempt >= maxRetries) {
    return (
      <div className={cn('text-center space-y-2', className)}>
        <p className="text-sm text-muted-foreground">
          تم استخدام جميع المحاولات ({maxRetries})
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
        >
          إعادة تحميل الصفحة
        </button>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className={cn(
            'px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors',
            isRetrying
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          <RefreshCw className={cn('h-4 w-4', isRetrying && 'animate-spin')} />
          <span>
            {isRetrying ? 'جاري إعادة المحاولة...' : 'إعادة المحاولة'}
          </span>
        </button>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {showDetails && (
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>المحاولة {attempt} من {maxRetries}</p>
          {attempt < maxRetries && (
            <p>متبقي {maxRetries - attempt} محاولات</p>
          )}
        </div>
      )}
    </div>
  )
}