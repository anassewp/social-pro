'use client'

import React, { useState, Suspense } from 'react'
import { DashboardSkeleton, CampaignsListSkeleton } from '@/components/ui/Skeleton'
import { 
  DynamicStatsCard,
  DynamicCampaignDetailsModal,
  DynamicCSVUploadModal,
  LoadingWrapper
} from '@/components/dynamic/DynamicImports'

// Dashboard-specific loading component
export function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardSkeleton />
        </Suspense>
      </div>
    </div>
  )
}

// Campaigns page loading component
export function CampaignsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<CampaignsListSkeleton />}>
          <CampaignsListSkeleton />
        </Suspense>
      </div>
    </div>
  )
}

// Groups page loading component
export function GroupsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-5 w-96 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-40 bg-muted animate-pulse rounded" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Groups List */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 bg-muted animate-pulse rounded-full" />
                  <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Members page loading component
export function MembersLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-5 w-96 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>

      {/* Search and Filters */}
      <div className="p-4 border rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
      </div>

      {/* Members Table */}
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Sessions page loading component
export function SessionsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-5 w-96 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-40 bg-muted animate-pulse rounded" />
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                <div className="h-6 w-16 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Team page loading component
export function TeamLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-5 w-96 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-40 bg-muted animate-pulse rounded" />
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Members List */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-muted animate-pulse rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Generic loading spinner component
export function LoadingSpinner({ 
  size = 'md', 
  text = 'جاري التحميل...',
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin`}>
        <div className="h-full w-full border-2 border-muted border-t-primary rounded-full"></div>
      </div>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}

// Full page loading overlay
export function LoadingOverlay({ 
  isVisible, 
  text = 'جاري التحميل...',
  progress 
}: { 
  isVisible: boolean
  text?: string
  progress?: number 
}) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background p-8 rounded-lg border shadow-lg max-w-sm w-full mx-4">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 animate-spin mx-auto">
            <div className="h-full w-full border-2 border-muted border-t-primary rounded-full"></div>
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-medium">{text}</p>
            {progress !== undefined && (
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{progress}%</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Context provider for loading states
export const LoadingContext = React.createContext<{
  setLoading: (key: string, loading: boolean) => void
  isLoading: (key: string) => boolean
}>({
  setLoading: () => {},
  isLoading: () => false
})