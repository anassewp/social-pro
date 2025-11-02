'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface NetworkInfo {
  isOnline: boolean
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | '5g'
  downlink: number // Mbps
  rtt: number // milliseconds
  saveData: boolean
  connection?: any
}

export interface AdaptiveLoadingOptions {
  /**
   * تفعيل التحميل التدريجي
   */
  progressive?: boolean

  /**
   * تفعيل التحميل المؤجل للمحتوى غير المرئي
   */
  lazy?: boolean

 /**
   * حد الزمن الأقصى للتحميل (بالميللي ثانية)
   */
  timeout?: number

  /**
   * تفعيل إعادة المحاولة التلقائية
   */
  autoRetry?: boolean

  /**
   * عدد المحاولات القصوى
   */
  maxRetries?: number

  /**
   * تفعيل البيانات المحفوظة
   */
  respectSaveData?: boolean

  /**
   * حجم البيانات المتوقع (بايت)
   */
  expectedSize?: number

  /**
   * أولوية التحميل
   */
  priority?: 'high' | 'medium' | 'low'
}

export interface AdaptiveLoadingState {
  isLoading: boolean
  progress: number
  stage: 'initializing' | 'fetching' | 'processing' | 'complete' | 'error' | 'timeout'
  error: Error | null
  networkInfo: NetworkInfo
  retryCount: number
  canRetry: boolean
  timeElapsed: number
}

export function useAdaptiveLoading(
  operation: () => Promise<any>,
  options: AdaptiveLoadingOptions = {}
) {
  const {
    progressive = true,
    lazy = false,
    timeout = 10000,
    autoRetry = true,
    maxRetries = 3,
    respectSaveData = true,
    expectedSize,
    priority = 'medium',
  } = options

  const [state, setState] = useState<AdaptiveLoadingState>({
    isLoading: false,
    progress: 0,
    stage: 'initializing',
    error: null,
    networkInfo: {
      isOnline: true,
      effectiveType: '4g',
      downlink: 10,
      rtt: 100,
      saveData: false,
    },
    retryCount: 0,
    canRetry: true,
    timeElapsed: 0,
  })

  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    isOnline: navigator.onLine,
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false,
  })

  const timeoutRef = useRef<NodeJS.Timeout>()
  const startTimeRef = useRef<number>()
  const intervalRef = useRef<NodeJS.Timeout>()

  // Network detection
  useEffect(() => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection

    const updateNetworkInfo = () => {
      const info = {
        isOnline: navigator.onLine,
        effectiveType: connection?.effectiveType || '4g',
        downlink: connection?.downlink || 10,
        rtt: connection?.rtt || 100,
        saveData: connection?.saveData || false,
        connection,
      }
      setNetworkInfo(info)
    }

    updateNetworkInfo()

    const handleOnline = () => updateNetworkInfo()
    const handleOffline = () => updateNetworkInfo()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if (connection) {
      connection.addEventListener('change', updateNetworkInfo)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo)
      }
    }
  }, [])

  // Update network info in state
  useEffect(() => {
    setState(prev => ({ ...prev, networkInfo }))
  }, [networkInfo])

  // Calculate adaptive timeout based on network
  const getAdaptiveTimeout = useCallback(() => {
    const multipliers = {
      'slow-2g': 3,
      '2g': 2.5,
      '3g': 2,
      '4g': 1.5,
      '5g': 1,
    }
    
    const multiplier = multipliers[networkInfo.effectiveType] || 1
    let baseTimeout = timeout

    // Adjust for data size
    if (expectedSize && expectedSize > 1024 * 1024) { // > 1MB
      baseTimeout *= 1.5
    }

    // Adjust for save data
    if (respectSaveData && networkInfo.saveData) {
      baseTimeout *= 1.3
    }

    return Math.min(baseTimeout * multiplier, 60000) // Max 60 seconds
  }, [networkInfo, timeout, expectedSize, respectSaveData])

  // Update progress with stage information
  const updateProgress = useCallback((progress: number, stage: AdaptiveLoadingState['stage']) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(Math.max(progress, 0), 100),
      stage,
    }))
  }, [])

  // Start timer
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now()
    
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current
        setState(prev => ({ ...prev, timeElapsed: elapsed }))
      }
    }, 100)
  }, [])

  // Stop timer
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])

  // Set timeout
  const setTimeoutHandler = useCallback((callback: () => void) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    const adaptiveTimeout = getAdaptiveTimeout()
    timeoutRef.current = setTimeout(callback, adaptiveTimeout)
  }, [getAdaptiveTimeout])

  // Main execution function
  const execute = useCallback(async (isRetry = false) => {
    if (!networkInfo.isOnline) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        stage: 'error',
        error: new Error('غير متصل بالإنترنت'),
        canRetry: true,
      }))
      return
    }

    if (respectSaveData && networkInfo.saveData && priority !== 'high') {
      // Skip execution for low priority content on save data
      setState(prev => ({
        ...prev,
        isLoading: false,
        stage: 'complete',
        progress: 100,
      }))
      return
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      stage: 'initializing',
      progress: 0,
      error: null,
      retryCount: isRetry ? prev.retryCount + 1 : prev.retryCount,
      canRetry: true,
    }))

    startTimer()

    // Set timeout
    setTimeoutHandler(() => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        stage: 'timeout',
        error: new Error('انتهت مهلة التحميل'),
        canRetry: prev.retryCount < maxRetries,
      }))
      stopTimer()
    })

    try {
      // Stage 1: Initializing
      updateProgress(10, 'initializing')

      // Stage 2: Fetching (with network-aware delays)
      updateProgress(30, 'fetching')
      
      const networkDelay = {
        'slow-2g': 1000,
        '2g': 500,
        '3g': 200,
        '4g': 0,
        '5g': 0,
      }[networkInfo.effectiveType] || 0

      if (networkDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, networkDelay))
      }

      // Execute operation
      if (progressive) {
        // Simulate progressive loading
        updateProgress(50, 'processing')
        await new Promise(resolve => setTimeout(resolve, 100))
        updateProgress(70, 'processing')
        await new Promise(resolve => setTimeout(resolve, 100))
        updateProgress(90, 'processing')
      }

      const result = await operation()
      
      updateProgress(100, 'complete')
      stopTimer()

      setState(prev => ({
        ...prev,
        isLoading: false,
        stage: 'complete',
        error: null,
      }))

      return result

    } catch (error) {
      const err = error as Error
      stopTimer()

      setState(prev => ({
        ...prev,
        isLoading: false,
        stage: 'error',
        error: err,
        canRetry: prev.retryCount < maxRetries && autoRetry,
      }))

      // Auto retry if enabled and conditions are met
      if (autoRetry && state.retryCount < maxRetries && networkInfo.isOnline) {
        const retryDelay = Math.min(1000 * Math.pow(2, state.retryCount), 5000)
        
        setTimeout(() => {
          execute(true)
        }, retryDelay)
      }

      throw err
    }
  }, [
    networkInfo,
    operation,
    progressive,
    respectSaveData,
    priority,
    autoRetry,
    maxRetries,
    updateProgress,
    startTimer,
    stopTimer,
    setTimeoutHandler,
    state.retryCount,
  ])

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      stopTimer()
    }
  }, [stopTimer])

  // Retry function
  const retry = useCallback(() => {
    if (state.canRetry && networkInfo.isOnline) {
      execute(false)
    }
  }, [state.canRetry, networkInfo.isOnline, execute])

  // Reset function
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      progress: 0,
      stage: 'initializing',
      error: null,
      retryCount: 0,
      canRetry: true,
      timeElapsed: 0,
    }))
    stopTimer()
  }, [stopTimer])

  return {
    ...state,
    networkInfo,
    execute,
    retry,
    reset,
    canRetry: state.canRetry && networkInfo.isOnline,
    isSlowConnection: ['slow-2g', '2g'].includes(networkInfo.effectiveType),
    shouldShowProgress: progressive && networkInfo.downlink > 1,
  }
}

// Hook for monitoring connection quality
export function useConnectionQuality() {
  const [quality, setQuality] = useState<'excellent' | 'good' | 'fair' | 'poor' | 'offline'>('good')
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    isOnline: navigator.onLine,
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false,
  })

  useEffect(() => {
    const connection = (navigator as any).connection

    const updateQuality = () => {
      if (!navigator.onLine) {
        setQuality('offline')
        return
      }

      const effectiveType = connection?.effectiveType || '4g'
      const downlink = connection?.downlink || 10
      const rtt = connection?.rtt || 100

      if (effectiveType === '5g' && downlink > 10 && rtt < 50) {
        setQuality('excellent')
      } else if (['4g', '5g'].includes(effectiveType) && downlink > 5) {
        setQuality('good')
      } else if (effectiveType === '3g' && downlink > 1) {
        setQuality('fair')
      } else {
        setQuality('poor')
      }

      setNetworkInfo({
        isOnline: navigator.onLine,
        effectiveType,
        downlink,
        rtt,
        saveData: connection?.saveData || false,
        connection,
      })
    }

    updateQuality()

    const handleOnline = updateQuality
    const handleOffline = updateQuality

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if (connection) {
      connection.addEventListener('change', updateQuality)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (connection) {
        connection.removeEventListener('change', updateQuality)
      }
    }
  }, [])

  return { quality, networkInfo }
}