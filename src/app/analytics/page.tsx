'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function AnalyticsPage() {
  // استخدام teamId افتراضي للعرض (في التطبيق الحقيقي يجب جلبه من auth/session)
  const teamId = "demo-team-id"

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <AnalyticsDashboard 
          teamId={teamId}
          className="w-full"
        />
      </ErrorBoundary>
    </DashboardLayout>
  )
}
