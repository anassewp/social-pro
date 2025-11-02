'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react'

export interface ProgressIndicatorProps {
  /**
   * قيمة التقدم الحالية (0-100)
   */
  progress: number

  /**
   * نص يُظهر الحالة الحالية
   */
  status?: string

  /**
   * حجم المؤشر
   */
  size?: 'sm' | 'default' | 'lg'

  /**
   * متغيرات الألوان
   */
  variant?: 'primary' | 'success' | 'warning' | 'error'

  /**
   * حالة التحميل
   */
  isLoading?: boolean

  /**
   * نوع شريط التقدم
   */
  type?: 'linear' | 'circular' | 'steps' | 'infinite'

  /**
   * عدد الخطوات (للـ steps)
   */
  steps?: number

  /**
   * الخطوة الحالية
   */
  currentStep?: number

  /**
   * ارقام الخطوات
   */
  stepLabels?: string[]

  /**
   * تخصيص className
   */
  className?: string

  /**
   * مدة الانيميشن (بالميللي ثانية)
   */
  animationDuration?: number
}

const sizeClasses = {
  sm: { height: 'h-1', iconSize: 'h-3 w-3' },
  default: { height: 'h-2', iconSize: 'h-4 w-4' },
  lg: { height: 'h-3', iconSize: 'h-5 w-5' },
}

const variantClasses = {
  primary: {
    background: 'bg-muted',
    progress: 'bg-primary',
    icon: 'text-primary',
    text: 'text-foreground',
  },
  success: {
    background: 'bg-green-100',
    progress: 'bg-green-500',
    icon: 'text-green-500',
    text: 'text-green-700',
  },
  warning: {
    background: 'bg-yellow-100',
    progress: 'bg-yellow-500',
    icon: 'text-yellow-500',
    text: 'text-yellow-700',
  },
  error: {
    background: 'bg-red-100',
    progress: 'bg-red-500',
    icon: 'text-red-500',
    text: 'text-red-700',
  },
}

export function ProgressIndicator({
  progress = 0,
  status,
  size = 'default',
  variant = 'primary',
  isLoading = false,
  type = 'linear',
  steps = 5,
  currentStep = 1,
  stepLabels = [],
  className,
  animationDuration = 300,
}: ProgressIndicatorProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress)
    }, 50)
    return () => clearTimeout(timer)
  }, [progress])

  if (type === 'circular') {
    return (
      <div className={cn('relative flex items-center justify-center', className)}>
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 32 32">
            {/* Background circle */}
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              className={cn(variantClasses[variant].background)}
            />
            {/* Progress circle */}
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 14}`}
              strokeDashoffset={`${2 * Math.PI * 14 * (1 - animatedProgress / 100)}`}
              className={cn(
                'transition-all duration-300',
                variantClasses[variant].progress
              )}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Icon/Text in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isLoading ? (
              <Loader2 className={cn(sizeClasses[size].iconSize, 'animate-spin', variantClasses[variant].icon)} />
            ) : animatedProgress >= 100 ? (
              <CheckCircle className={cn(sizeClasses[size].iconSize, variantClasses[variant].icon)} />
            ) : (
              <span className={cn('text-xs font-medium', variantClasses[variant].text)}>
                {Math.round(animatedProgress)}%
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'steps') {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between">
          {Array.from({ length: steps }).map((_, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber <= currentStep
            const isCurrent = stepNumber === currentStep
            const isUpcoming = stepNumber > currentStep
            
            return (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center space-y-1">
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300',
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isCurrent
                        ? cn('border-primary text-primary', variantClasses[variant].icon)
                        : 'border-muted text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : isLoading && isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  
                  {stepLabels[index] && (
                    <span className={cn(
                      'text-xs text-center max-w-16',
                      isCompleted || isCurrent ? variantClasses[variant].text : 'text-muted-foreground'
                    )}>
                      {stepLabels[index]}
                    </span>
                  )}
                </div>
                
                {index < steps - 1 && (
                  <div className={cn(
                    'flex-1 h-0.5 mx-2 transition-all duration-300',
                    stepNumber < currentStep ? variantClasses[variant].progress : 'bg-muted'
                  )} />
                )}
              </div>
            )
          })}
        </div>
        
        {status && (
          <div className="text-center">
            <span className={cn('text-sm', variantClasses[variant].text)}>
              {status}
            </span>
          </div>
        )}
      </div>
    )
  }

  if (type === 'infinite') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className={cn(
          'relative overflow-hidden',
          sizeClasses[size].height,
          'rounded-full',
          variantClasses[variant].background
        )}>
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full transition-all duration-1000',
              variantClasses[variant].progress,
              'animate-[loading_2s_ease-in-out_infinite]'
            )}
            style={{
              width: `${animatedProgress}%`,
              animation: 'loading 2s ease-in-out infinite',
            }}
          />
        </div>
        
        {status && (
          <div className="flex items-center justify-center space-x-2">
            {isLoading ? (
              <Loader2 className={cn('h-4 w-4 animate-spin', variantClasses[variant].icon)} />
            ) : (
              <Clock className={cn('h-4 w-4', variantClasses[variant].icon)} />
            )}
            <span className={cn('text-sm', variantClasses[variant].text)}>
              {status}
            </span>
          </div>
        )}
      </div>
    )
  }

  // Linear progress
  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn(
        'relative w-full rounded-full overflow-hidden',
        sizeClasses[size].height,
        variantClasses[variant].background
      )}>
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full transition-all duration-300 ease-out',
            variantClasses[variant].progress
          )}
          style={{ 
            width: `${animatedProgress}%`,
            transitionDuration: `${animationDuration}ms`
          }}
        />
        
        {isLoading && animatedProgress < 100 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse" />
          </div>
        )}
      </div>
      
      {status && (
        <div className="flex items-center justify-between text-sm">
          <span className={cn('font-medium', variantClasses[variant].text)}>
            {status}
          </span>
          <span className={cn('text-muted-foreground', variantClasses[variant].text)}>
            {Math.round(animatedProgress)}%
          </span>
        </div>
      )}
    </div>
  )
}

// Animated Progress Bar Component
export function AnimatedProgressBar({
  progress,
  label,
  className,
  animated = true,
}: {
  progress: number
  label?: string
  className?: string
  animated?: boolean
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <span>{progress}%</span>
        </div>
      )}
      
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full bg-primary transition-all duration-500 ease-out',
            animated && 'animate-pulse'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// Circular Progress with Center Text
export function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 8,
  label,
  subLabel,
  className,
}: {
  progress: number
  size?: number
  strokeWidth?: number
  label?: string
  subLabel?: string
  className?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-primary transition-all duration-300"
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-foreground">{progress}%</div>
          {subLabel && (
            <div className="text-xs text-muted-foreground text-center">{subLabel}</div>
          )}
        </div>
      </div>
      
      {label && (
        <div className="text-center">
          <div className="text-sm font-medium text-foreground">{label}</div>
        </div>
      )}
    </div>
  )
}