'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, AlertCircle, CheckCircle, XCircle, Loader2, RefreshCw, Clock, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { PageLoading } from '@/components/ui/Loading'

interface CampaignResult {
  id: string
  campaign_id: string
  target_user_id: string
  target_username: string | null
  status: 'sent' | 'failed'
  error_message: string | null
  sent_at: string
  session_id: string | null
}

export default function CampaignLogsPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [campaign, setCampaign] = useState<any>(null)
  const [results, setResults] = useState<CampaignResult[]>([])
  const [filter, setFilter] = useState<'all' | 'sent' | 'failed'>('all')

  useEffect(() => {
    if (user && params.id) {
      fetchCampaignLogs()
    }
  }, [user, params.id])

  const fetchCampaignLogs = async () => {
    try {
      setLoading(true)

      // جلب الحملة
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', params.id as string)
        .single()

      if (campaignError) throw campaignError

      // Parse progress to get error message if exists
      if (campaignData.progress) {
        try {
          const progress = JSON.parse(campaignData.progress)
          campaignData.errorMessage = progress.error
        } catch (e) {
          // ignore
        }
      }

      setCampaign(campaignData)

      // جلب النتائج
      const { data: resultsData, error: resultsError } = await supabase
        .from('campaign_results')
        .select('*')
        .eq('campaign_id', params.id as string)
        .order('sent_at', { ascending: false })

      if (resultsError) throw resultsError

      setResults(resultsData || [])
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredResults = results.filter(result => {
    if (filter === 'all') return true
    return result.status === filter
  })

  const stats = {
    total: results.length,
    sent: results.filter(r => r.status === 'sent').length,
    failed: results.filter(r => r.status === 'failed').length
  }

  // تحليل الأخطاء
  const errorAnalysis = results
    .filter(r => r.status === 'failed' && r.error_message)
    .reduce((acc, r) => {
      const errorMsg = r.error_message || 'Unknown error'
      acc[errorMsg] = (acc[errorMsg] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const topErrors = Object.entries(errorAnalysis)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoading message="جاري تحميل سجل الحملة..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">سجلات الحملة</h1>
              <p className="text-muted-foreground">{campaign?.name}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCampaignLogs}
          >
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
        </div>

        {/* رسالة الخطأ إذا فشلت الحملة */}
        {campaign?.status === 'failed' && campaign?.errorMessage && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">سبب فشل الحملة</h3>
                  <div className="text-sm text-red-800 dark:text-red-200 whitespace-pre-line leading-relaxed">
                    {campaign.errorMessage}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* إحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المحاولات</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">نجحت</p>
                  <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">فشلت</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* تحليل الأخطاء */}
        {topErrors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertCircle className="h-5 w-5 ml-2" />
                أكثر الأخطاء شيوعاً
              </CardTitle>
              <CardDescription>الأخطاء التي حدثت بكثرة في هذه الحملة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topErrors.map(([error, count], index) => (
                  <div key={index} className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{error}</p>
                      </div>
                      <Badge variant="destructive" className="mr-2">
                        {count} مرة
                      </Badge>
                    </div>
                    <div className="bg-red-100 dark:bg-red-900/30 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-red-600 h-full"
                        style={{ width: `${(count / stats.failed) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* قائمة النتائج */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>سجل التفصيلي</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  الكل ({stats.total})
                </Button>
                <Button
                  variant={filter === 'sent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('sent')}
                >
                  نجحت ({stats.sent})
                </Button>
                <Button
                  variant={filter === 'failed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('failed')}
                >
                  فشلت ({stats.failed})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>لا توجد نتائج</p>
                </div>
              ) : (
                filteredResults.map((result) => (
                  <div
                    key={result.id}
                    className={`p-4 border rounded-lg ${
                      result.status === 'sent'
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {result.status === 'sent' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <p className="font-medium text-foreground">
                            {result.target_username ? `@${result.target_username}` : `ID: ${result.target_user_id}`}
                          </p>
                        </div>
                        {result.error_message && (
                          <p className="text-sm text-red-600 dark:text-red-400 mr-6">
                            {result.error_message}
                          </p>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 ml-1" />
                          {new Date(result.sent_at).toLocaleString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

