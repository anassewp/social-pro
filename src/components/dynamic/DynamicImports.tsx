'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/ui/Skeleton'

// Dynamic import for heavy components
export const DynamicStatsCard = dynamic(
  () => import('@/components/dashboard/StatsCard').then(mod => mod.StatsCard),
  {
    loading: () => <div className="h-24 animate-pulse bg-muted rounded-lg" />,
    ssr: false // Disable SSR for better client-side hydration
  }
)

export const DynamicCampaignDetailsModal = dynamic(
  () => import('@/components/campaigns/CampaignDetailsModal').then(mod => mod.CampaignDetailsModal),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-10 bg-muted rounded w-1/3" />
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

export const DynamicCSVUploadModal = dynamic(
  () => import('@/components/campaigns/CSVUploadModal').then(mod => mod.CSVUploadModal),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="h-32 bg-muted rounded" />
            <div className="flex justify-end space-x-2">
              <div className="h-8 w-16 bg-muted rounded" />
              <div className="h-8 w-20 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

export const DynamicInviteMemberModal = dynamic(
  () => import('@/components/team/InviteMemberModal').then(mod => mod.InviteMemberModal),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-10 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <div className="h-8 w-16 bg-muted rounded" />
              <div className="h-8 w-20 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

// Telegram-related modals
export const DynamicAddSessionModal = dynamic(
  () => import('@/components/telegram/AddSessionModal').then(mod => mod.AddSessionModal),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background p-6 rounded-lg max-w-lg w-full mx-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-10 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <div className="h-8 w-16 bg-muted rounded" />
              <div className="h-8 w-20 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

export const DynamicExtractMembersModal = dynamic(
  () => import('@/components/telegram/ExtractMembersModal').then(mod => mod.ExtractMembersModal),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background p-6 rounded-lg max-w-lg w-full mx-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-10 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <div className="h-8 w-16 bg-muted rounded" />
              <div className="h-8 w-20 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

export const DynamicImportGroupsModal = dynamic(
  () => import('@/components/telegram/ImportGroupsModal').then(mod => mod.ImportGroupsModal),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background p-6 rounded-lg max-w-lg w-full mx-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-10 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <div className="h-8 w-16 bg-muted rounded" />
              <div className="h-8 w-20 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

export const DynamicGlobalSearchModal = dynamic(
  () => import('@/components/telegram/GlobalSearchModal').then(mod => mod.GlobalSearchModal),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background p-6 rounded-lg max-w-2xl w-full mx-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="h-10 bg-muted rounded w-full" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

// Loading wrapper components
interface LoadingWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  isLoading?: boolean
}

export function LoadingWrapper({ 
  children, 
  fallback = null, 
  isLoading = false 
}: LoadingWrapperProps) {
  return (
    <Suspense fallback={fallback || <div className="animate-pulse">جاري التحميل...</div>}>
      {isLoading ? fallback : children}
    </Suspense>
  )
}

// Progressive loading component
interface ProgressiveLoadingProps {
  immediateComponent?: React.ReactNode
  delayedComponent?: React.ReactNode
  delay?: number
  isVisible?: boolean
}

export function ProgressiveLoading({
  immediateComponent,
  delayedComponent,
  delay = 100,
  isVisible = true
}: ProgressiveLoadingProps) {
  const [showDelayed, setShowDelayed] = React.useState(false)

  React.useEffect(() => {
    if (!isVisible) return

    const timer = setTimeout(() => {
      setShowDelayed(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, isVisible])

  return (
    <>
      {immediateComponent}
      {showDelayed && delayedComponent}
    </>
  )
}

// Error boundary for dynamic imports
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <Suspense fallback={fallback || <div>حدث خطأ في تحميل المكون</div>}>
        <Component {...props} />
      </Suspense>
    )
  }
}