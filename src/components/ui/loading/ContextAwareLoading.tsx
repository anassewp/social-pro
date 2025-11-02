'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react'

export interface LoadingState {
  id: string
  type: 'global' | 'page' | 'section' | 'component' | 'data'
  status: 'loading' | 'success' | 'error' | 'idle'
  progress?: number
  message?: string
  error?: string | Error
  metadata?: {
    startTime: number
    endTime?: number
    attempts: number
    maxRetries?: number
  }
}

export interface LoadingContextType {
  states: Record<string, LoadingState>
  setLoading: (id: string, state: Partial<LoadingState>) => void
  setSuccess: (id: string, message?: string) => void
  setError: (id: string, error: string | Error) => void
  setProgress: (id: string, progress: number) => void
  removeLoading: (id: string) => void
  getGlobalLoading: () => boolean
  getPageLoading: (page?: string) => boolean
  getSectionLoading: (section: string) => boolean
  getComponentLoading: (component: string) => boolean
  resetAll: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function useLoadingContext() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoadingContext must be used within a LoadingProvider')
  }
  return context
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [states, setStates] = useState<Record<string, LoadingState>>({})

  const updateState = useCallback((id: string, updates: Partial<LoadingState>) => {
    setStates(prev => ({
      ...prev,
      [id]: {
        id,
        type: 'component',
        status: 'idle',
        metadata: { startTime: Date.now(), attempts: 0 },
        ...prev[id],
        ...updates,
      }
    }))
  }, [])

  const setLoading = useCallback((id: string, state: Partial<LoadingState>) => {
    updateState(id, {
      status: 'loading',
      ...state,
      metadata: {
        ...state.metadata,
        startTime: Date.now(),
        attempts: (states[id]?.metadata?.attempts || 0) + 1,
      }
    })
  }, [updateState, states])

  const setSuccess = useCallback((id: string, message?: string) => {
    updateState(id, {
      status: 'success',
      message,
      progress: 100,
      metadata: {
        ...states[id]?.metadata,
        endTime: Date.now(),
      }
    })
  }, [updateState, states])

  const setError = useCallback((id: string, error: string | Error) => {
    updateState(id, {
      status: 'error',
      error,
      metadata: {
        ...states[id]?.metadata,
        endTime: Date.now(),
      }
    })
  }, [updateState, states])

  const setProgress = useCallback((id: string, progress: number) => {
    updateState(id, { progress })
  }, [updateState])

  const removeLoading = useCallback((id: string) => {
    setStates(prev => {
      const newStates = { ...prev }
      delete newStates[id]
      return newStates
    })
  }, [])

  const getGlobalLoading = useCallback(() => {
    return Object.values(states).some(state => state.type === 'global' && state.status === 'loading')
  }, [states])

  const getPageLoading = useCallback((page?: string) => {
    return Object.values(states).some(state => 
      state.type === 'page' && 
      state.status === 'loading' &&
      (!page || state.id.includes(page))
    )
  }, [states])

  const getSectionLoading = useCallback((section: string) => {
    return Object.values(states).some(state => 
      state.type === 'section' && 
      state.status === 'loading' &&
      state.id.includes(section)
    )
  }, [states])

  const getComponentLoading = useCallback((component: string) => {
    return Object.values(states).some(state => 
      state.type === 'component' && 
      state.status === 'loading' &&
      state.id.includes(component)
    )
  }, [states])

  const resetAll = useCallback(() => {
    setStates({})
  }, [])

  // Auto-cleanup old states
  useEffect(() => {
    const cleanup = setInterval(() => {
      setStates(prev => {
        const now = Date.now()
        const newStates: Record<string, LoadingState> = {}
        
        Object.entries(prev).forEach(([id, state]) => {
          // Keep successful states for 5 seconds, error states for 10 seconds
          const maxAge = state.status === 'success' ? 5000 : state.status === 'error' ? 10000 : 0
          
          if (!state.metadata?.endTime || (now - state.metadata.endTime) < maxAge) {
            newStates[id] = state
          }
        })
        
        return newStates
      })
    }, 10000)

    return () => clearInterval(cleanup)
  }, [])

  return (
    <LoadingContext.Provider value={{
      states,
      setLoading,
      setSuccess,
      setError,
      setProgress,
      removeLoading,
      getGlobalLoading,
      getPageLoading,
      getSectionLoading,
      getComponentLoading,
      resetAll,
    }}>
      {children}
    </LoadingContext.Provider>
  )
}

// Smart Loading Wrapper Component
export function SmartLoadingWrapper({
  id,
  type = 'component',
  children,
  fallback,
  showProgress = false,
  autoHide = false,
  className,
}: {
  id: string
  type?: 'global' | 'page' | 'section' | 'component' | 'data'
  children: React.ReactNode
  fallback?: React.ReactNode
  showProgress?: boolean
  autoHide?: boolean
  className?: string
}) {
  const { states, setLoading, setSuccess, setError, setProgress, removeLoading } = useLoadingContext()
  const state = states[id]

  useEffect(() => {
    return () => {
      if (autoHide) {
        removeLoading(id)
      }
    }
  }, [id, autoHide, removeLoading])

  if (!state) {
    // Initialize loading state
    setLoading(id, { type })
    return <>{children}</>
  }

  if (state.status === 'loading') {
    return (
      <div className={cn('relative', className)}>
        {fallback || (
          <LoadingStateComponent state={state} showProgress={showProgress} />
        )}
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className={cn('p-4 border border-destructive/20 rounded-lg bg-destructive/5', className)}>
        <div className="flex items-center space-x-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">حدث خطأ</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {typeof state.error === 'string' ? state.error : state.error?.message}
        </p>
      </div>
    )
  }

  if (state.status === 'success' && autoHide) {
    return <>{children}</>
  }

  return <>{children}</>
}

function LoadingStateComponent({ 
  state, 
  showProgress = false 
}: { 
  state: LoadingState
  showProgress?: boolean 
}) {
  const getTypeIcon = () => {
    switch (state.type) {
      case 'global':
        return '🌐'
      case 'page':
        return '📄'
      case 'section':
        return '📋'
      case 'data':
        return '📊'
      default:
        return '⚙️'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="flex items-center space-x-3">
        <span className="text-lg">{getTypeIcon()}</span>
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
      
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-foreground">
          {state.message || 'جاري التحميل...'}
        </p>
        {state.metadata && (
          <p className="text-xs text-muted-foreground">
            محاولة {state.metadata.attempts}
          </p>
        )}
      </div>

      {showProgress && state.progress !== undefined && (
        <div className="w-full max-w-xs">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${state.progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1">
            {Math.round(state.progress)}%
          </p>
        </div>
      )}
    </div>
  )
}

// Page Loading Indicator
export function PageLoadingIndicator({
  page,
  className,
}: {
  page?: string
  className?: string
}) {
  const { getPageLoading } = useLoadingContext()
  const isLoading = getPageLoading(page)

  if (!isLoading) return null

  return (
    <div className={cn('fixed top-0 left-0 right-0 z-50', className)}>
      <div className="h-1 bg-primary/20">
        <div className="h-full bg-primary animate-pulse" />
      </div>
    </div>
  )
}

// Section Loading Overlay
export function SectionLoadingOverlay({
  section,
  children,
  className,
  showBackdrop = true,
}: {
  section: string
  children: React.ReactNode
  className?: string
  showBackdrop?: boolean
}) {
  const { getSectionLoading } = useLoadingContext()
  const isLoading = getSectionLoading(section)

  if (!isLoading) return <>{children}</>

  return (
    <div className={cn('relative', className)}>
      <div className={cn(
        'absolute inset-0 z-10 flex items-center justify-center',
        showBackdrop && 'bg-background/80 backdrop-blur-sm'
      )}>
        <div className="bg-background border rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">جاري تحميل {section}...</span>
          </div>
        </div>
      </div>
      <div className={showBackdrop ? 'blur-sm' : ''}>
        {children}
      </div>
    </div>
  )
}

// Global Loading Bar
export function GlobalLoadingBar({
  position = 'top',
  className,
}: {
  position?: 'top' | 'bottom'
  className?: string
}) {
  const { getGlobalLoading, states } = useLoadingContext()
  const isLoading = getGlobalLoading()
  const loadingStates = Object.values(states).filter(s => s.type === 'global' && s.status === 'loading')
  
  const progress = loadingStates.length > 0 
    ? loadingStates.reduce((acc, state) => acc + (state.progress || 0), 0) / loadingStates.length
    : 0

  if (!isLoading) return null

  const positionClasses = position === 'top' ? 'top-0' : 'bottom-0'

  return (
    <div className={cn(
      'fixed left-0 right-0 z-50',
      positionClasses,
      className
    )}>
      <div className="h-1 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// Component Status Badge
export function ComponentStatusBadge({
  id,
  showIcon = true,
  className,
}: {
  id: string
  showIcon?: boolean
  className?: string
}) {
  const { states } = useLoadingContext()
  const state = states[id]

  if (!state) return null

  const getStatusColor = () => {
    switch (state.status) {
      case 'loading':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = () => {
    switch (state.status) {
      case 'loading':
        return state.message || 'تحميل...'
      case 'success':
        return state.message || 'تم بنجاح'
      case 'error':
        return 'خطأ'
      default:
        return ''
    }
  }

  const getStatusIcon = () => {
    switch (state.status) {
      case 'loading':
        return <Loader2 className="h-3 w-3 animate-spin" />
      case 'success':
        return <CheckCircle className="h-3 w-3" />
      case 'error':
        return <AlertTriangle className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <div className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
      getStatusColor(),
      className
    )}>
      {showIcon && getStatusIcon()}
      <span>{getStatusText()}</span>
    </div>
  )
}

// Loading State Manager Hook
export function useLoadingState(id: string, type: LoadingState['type'] = 'component') {
  const context = useLoadingContext()

  const startLoading = useCallback((message?: string) => {
    context.setLoading(id, { type, message })
  }, [context, id, type])

  const completeLoading = useCallback((message?: string) => {
    context.setSuccess(id, message)
  }, [context, id])

  const failLoading = useCallback((error: string | Error) => {
    context.setError(id, error)
  }, [context, id])

  const updateProgress = useCallback((progress: number) => {
    context.setProgress(id, progress)
  }, [context, id])

  const reset = useCallback(() => {
    context.removeLoading(id)
  }, [context, id])

  return {
    state: context.states[id],
    startLoading,
    completeLoading,
    failLoading,
    updateProgress,
    reset,
  }
}