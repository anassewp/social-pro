'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export type LoadingType = 
  | 'initial' 
  | 'fetching' 
  | 'processing' 
  | 'uploading' 
  | 'downloading' 
  | 'saving' 
  | 'deleting' 
  | 'updating' 
  | 'searching' 
  | 'filtering' 
  | 'sorting'

export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error' | 'cancelled'

export interface LoadingState {
  id: string
  status: LoadingStatus
  type: LoadingType
  progress: number
  message: string
  error: Error | null
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

export interface LoadingOptions {
  /**
   * رسالة افتراضية
   */
  defaultMessage?: string

  /**
   * تفعيل شريط التقدم
   */
  enableProgress?: boolean

  /**
   * تفعيل الرسائل المتقدمة
   */
  advancedMessages?: boolean

  /**
   * تفعيل القياس الزمني
   */
  enableTiming?: boolean

  /**
   * تفعيل الحفظ التلقائي للحالات السابقة
   */
  persistHistory?: boolean

  /**
   * حد أقصى لعدد الحالات المحفوظة
   */
  maxHistorySize?: number
}

export function useLoadingState(
  id: string,
  options: LoadingOptions = {}
) {
  const {
    defaultMessage = 'جاري التحميل...',
    enableProgress = false,
    advancedMessages = true,
    enableTiming = true,
    persistHistory = false,
    maxHistorySize = 50,
  } = options

  const [state, setState] = useState<LoadingState>({
    id,
    status: 'idle',
    type: 'initial',
    progress: 0,
    message: defaultMessage,
    error: null,
    startTime: 0,
    metadata: {},
  })

  const [history, setHistory] = useState<LoadingState[]>([])
  const startTimeRef = useRef<number>()
  const intervalRef = useRef<NodeJS.Timeout>()

  // Advanced messages based on type and progress
  const getAdvancedMessage = useCallback((type: LoadingType, progress: number): string => {
    const messages = {
      initial: 'جاري التحضير...',
      fetching: progress < 30 ? 'جاري جلب البيانات...' : 'جاري معالجة البيانات...',
      processing: progress < 60 ? 'جاري المعالجة...' : 'جاري إنهاء المعالجة...',
      uploading: progress < 50 ? 'جاري رفع الملف...' : 'جاري إكمال الرفع...',
      downloading: progress < 50 ? 'جاري تحميل الملف...' : 'جاري حفظ الملف...',
      saving: 'جاري الحفظ...',
      deleting: 'جاري الحذف...',
      updating: 'جاري التحديث...',
      searching: 'جاري البحث...',
      filtering: 'جاري التصفية...',
      sorting: 'جاري الترتيب...',
    }

    if (advancedMessages) {
      return messages[type] || defaultMessage
    }

    return defaultMessage
  }, [advancedMessages, defaultMessage])

  // Start loading
  const startLoading = useCallback((
    type: LoadingType = 'initial',
    message?: string,
    metadata?: Record<string, any>
  ) => {
    const now = Date.now()
    startTimeRef.current = now

    setState(prev => ({
      ...prev,
      status: 'loading',
      type,
      progress: 0,
      message: message || getAdvancedMessage(type, 0),
      error: null,
      startTime: now,
      metadata,
    }))

    // Start progress timer if enabled
    if (enableProgress) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.status !== 'loading') return prev
          
          const elapsed = now - prev.startTime
          // Simulate realistic progress based on elapsed time
          const simulatedProgress = Math.min(
            Math.max((elapsed / 10000) * 100, 10), // Never below 10% after 1s
            95 // Never reach 100% automatically
          )
          
          return {
            ...prev,
            progress: simulatedProgress,
            message: getAdvancedMessage(prev.type, simulatedProgress),
          }
        })
      }, 200)
    }

    // Update history if enabled
    if (persistHistory) {
      setHistory(prev => {
        const newHistory = [...prev, {
          id,
          status: 'loading' as LoadingStatus,
          type,
          progress: 0,
          message: message || getAdvancedMessage(type, 0),
          error: null,
          startTime: now,
          metadata,
        }]
        return newHistory.slice(-maxHistorySize)
      })
    }
  }, [id, enableProgress, getAdvancedMessage, persistHistory, maxHistorySize])

  // Update progress
  const updateProgress = useCallback((progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(Math.max(progress, 0), 100),
      message: message || getAdvancedMessage(prev.type, progress),
    }))
  }, [getAdvancedMessage])

  // Update message
  const updateMessage = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      message,
    }))
  }, [])

  // Set error
  const setError = useCallback((error: Error | string, metadata?: Record<string, any>) => {
    const err = typeof error === 'string' ? new Error(error) : error
    const now = Date.now()

    setState(prev => ({
      ...prev,
      status: 'error',
      error: err,
      progress: 0,
      endTime: now,
      duration: enableTiming ? now - prev.startTime : undefined,
      metadata: { ...prev.metadata, ...metadata },
    }))

    // Clear intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Update history
    if (persistHistory) {
      setHistory(prev => [...prev, {
        ...state,
        status: 'error',
        error: err,
        endTime: now,
        duration: enableTiming ? now - state.startTime : undefined,
        metadata: { ...state.metadata, ...metadata },
      }].slice(-maxHistorySize))
    }
  }, [enableTiming, persistHistory, maxHistorySize, state])

  // Complete loading
  const completeLoading = useCallback((
    finalMessage?: string,
    metadata?: Record<string, any>
  ) => {
    const now = Date.now()

    setState(prev => ({
      ...prev,
      status: 'success',
      progress: 100,
      message: finalMessage || 'تم بنجاح!',
      endTime: now,
      duration: enableTiming ? now - prev.startTime : undefined,
      metadata: { ...prev.metadata, ...metadata },
    }))

    // Clear intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Update history
    if (persistHistory) {
      setHistory(prev => [...prev, {
        ...state,
        status: 'success',
        progress: 100,
        message: finalMessage || 'تم بنجاح!',
        endTime: now,
        duration: enableTiming ? now - state.startTime : undefined,
        metadata: { ...state.metadata, ...metadata },
      }].slice(-maxHistorySize))
    }
  }, [enableTiming, persistHistory, maxHistorySize, state])

  // Cancel loading
  const cancelLoading = useCallback((reason?: string) => {
    const now = Date.now()

    setState(prev => ({
      ...prev,
      status: 'cancelled',
      progress: 0,
      message: reason || 'تم الإلغاء',
      endTime: now,
      duration: enableTiming ? now - prev.startTime : undefined,
    }))

    // Clear intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [enableTiming])

  // Reset to idle
  const reset = useCallback(() => {
    setState({
      id,
      status: 'idle',
      type: 'initial',
      progress: 0,
      message: defaultMessage,
      error: null,
      startTime: 0,
      metadata: {},
    })

    // Clear intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [id, defaultMessage])

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Computed values
  const isLoading = state.status === 'loading'
  const isSuccess = state.status === 'success'
  const isError = state.status === 'error'
  const isCancelled = state.status === 'cancelled'
  const isIdle = state.status === 'idle'

  const duration = enableTiming && state.duration ? state.duration : 
                  enableTiming && isLoading && startTimeRef.current ? 
                  Date.now() - startTimeRef.current : undefined

  return {
    // State
    ...state,
    
    // Computed states
    isLoading,
    isSuccess,
    isError,
    isCancelled,
    isIdle,
    duration,
    
    // Actions
    startLoading,
    updateProgress,
    updateMessage,
    setError,
    completeLoading,
    cancelLoading,
    reset,
    
    // History
    history,
    clearHistory,
    
    // Utility functions
    getAdvancedMessage,
  }
}

// Hook for managing multiple loading states
export function useMultipleLoadingStates(
  states: Record<string, LoadingOptions>
) {
  const loadingStates = Object.entries(states).reduce((acc, [key, options]) => {
    acc[key] = useLoadingState(key, options)
    return acc
  }, {} as Record<string, ReturnType<typeof useLoadingState>>)

  // Global state aggregators
  const isAnyLoading = Object.values(loadingStates).some(state => state.isLoading)
  const isAnyError = Object.values(loadingStates).some(state => state.isError)
  const isAnySuccess = Object.values(loadingStates).some(state => state.isSuccess)

  const totalProgress = Object.values(loadingStates).reduce((acc, state) => {
    if (state.isLoading) {
      return acc + state.progress
    }
    return acc + (state.isSuccess ? 100 : 0)
  }, 0)

  const activeCount = Object.values(loadingStates).filter(state => state.isLoading).length
  const totalCount = Object.keys(loadingStates).length

  // Bulk operations
  const startAll = useCallback((type?: LoadingType, message?: string) => {
    Object.values(loadingStates).forEach(state => {
      state.startLoading(type, message)
    })
  }, [loadingStates])

  const resetAll = useCallback(() => {
    Object.values(loadingStates).forEach(state => {
      state.reset()
    })
  }, [loadingStates])

  const cancelAll = useCallback((reason?: string) => {
    Object.values(loadingStates).forEach(state => {
      state.cancelLoading(reason)
    })
  }, [loadingStates])

  return {
    loadingStates,
    
    // Global state
    isAnyLoading,
    isAnyError,
    isAnySuccess,
    totalProgress,
    activeCount,
    totalCount,
    
    // Bulk operations
    startAll,
    resetAll,
    cancelAll,
  }
}