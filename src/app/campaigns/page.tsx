'use client'

import { useState, useMemo, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Plus, 
  RefreshCw, 
  Play, 
  Pause, 
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Copy,
  Calendar,
  MessageSquare,
  Users,
  FileText
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CampaignDetailsModal } from '@/components/campaigns/CampaignDetailsModal'
import { PaginationControls } from '@/components/campaigns/PaginationControls'
import { useCampaigns, useDeleteCampaign, usePauseCampaign, type Campaign } from '@/lib/hooks/useCampaigns'
import { useRealtimeSubscription } from '@/lib/hooks/useRealtime'
import { PageLoading } from '@/components/ui/Loading'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CampaignsPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  // Pagination & Filtering State
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  
  const deleteCampaign = useDeleteCampaign()
  const pauseCampaign = usePauseCampaign()
  
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('')
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1) // Reset to first page on search
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])
  
  // Reset page when status filter changes
  useEffect(() => {
    setPage(1)
  }, [statusFilter])
  
  // React Query with debounced search
  const { data, isLoading, error, refetch } = useCampaigns(
    user?.team_id || '',
    {
      page,
      pageSize,
      status: statusFilter,
      search: debouncedSearch || undefined,
    }
  )
  
  const campaigns = data?.data || []
  const pagination = data?.pagination

  // Real-time subscription للحملات
  useRealtimeSubscription('campaigns', user?.team_id || null, {
    enabled: !!user?.team_id,
    onInsert: () => {
      console.log('✅ New campaign created - refetching...')
      refetch()
    },
    onUpdate: () => {
      console.log('📝 Campaign updated - refetching...')
      refetch()
    },
    onDelete: () => {
      console.log('🗑️ Campaign deleted - refetching...')
      refetch()
    },
  })

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحملة؟')) {
      return
    }

    try {
      await deleteCampaign.mutateAsync(campaignId)
      // React Query will automatically refetch
    } catch (error: any) {
      alert(error.message || 'فشل في حذف الحملة')
    }
  }

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      await pauseCampaign.mutateAsync({ campaignId, action: 'pause' })
      // React Query will automatically refetch
    } catch (error: any) {
      alert(error.message || 'فشل في إيقاف الحملة')
    }
  }

  const handleResumeCampaign = async (campaignId: string) => {
    try {
      await pauseCampaign.mutateAsync({ campaignId, action: 'resume' })
      // React Query will automatically refetch
    } catch (error: any) {
      alert(error.message || 'فشل في استئناف الحملة')
    }
  }

  const getStatusBadge = (status: Campaign['status']) => {
    const statusConfig = {
      draft: { 
        label: 'مسودة', 
        color: 'bg-muted text-muted-foreground border-border', 
        icon: Clock 
      },
      scheduled: { 
        label: 'مجدولة', 
        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', 
        icon: Clock 
      },
      running: { 
        label: 'قيد التنفيذ', 
        color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20', 
        icon: Play 
      },
      paused: { 
        label: 'متوقفة', 
        color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20', 
        icon: Pause 
      },
      completed: { 
        label: 'مكتملة', 
        color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', 
        icon: CheckCircle2 
      },
      failed: { 
        label: 'فشلت', 
        color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20', 
        icon: XCircle 
      },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border font-medium`}>
        <Icon className="h-3 w-3 ml-1" />
        {config.label}
      </Badge>
    )
  }

  const getProgressPercentage = (progress: Campaign['progress']) => {
    if (progress.total === 0) return 0
    return Math.round(((progress.sent + progress.failed) / progress.total) * 100)
  }

  // حساب الإحصائيات (من البيانات المحملة)
  const stats = useMemo(() => ({
    total: pagination?.total || 0,
    running: campaigns.filter(c => c.status === 'running').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    totalSent: campaigns.reduce((sum, c) => sum + (c.progress?.sent || 0), 0),
    totalFailed: campaigns.reduce((sum, c) => sum + (c.progress?.failed || 0), 0),
    successRate: campaigns.length > 0 
      ? Math.round(
          (campaigns.filter(c => c.status === 'completed').length / campaigns.length) * 100
        )
      : 0
  }), [campaigns, pagination])

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageLoading message="جاري تحميل الحملات..." />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">حدث خطأ</p>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'فشل في جلب الحملات'}
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 ml-2" />
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">الحملات التسويقية</h1>
            <p className="text-muted-foreground">إدارة حملاتك التسويقية عبر تيليجرام</p>
          </div>
          <Button asChild>
            <Link href="/campaigns/create">
            <Plus className="h-4 w-4 ml-2" />
            إنشاء حملة جديدة
            </Link>
          </Button>
        </div>

        {/* إحصائيات سريعة */}
        {campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs font-medium mb-1">إجمالي الحملات</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <BarChart3 className="h-10 w-10 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs font-medium mb-1">قيد التنفيذ</p>
                    <p className="text-3xl font-bold">{stats.running}</p>
                  </div>
                  <Play className="h-10 w-10 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs font-medium mb-1">مكتملة</p>
                    <p className="text-3xl font-bold">{stats.completed}</p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs font-medium mb-1">معدل النجاح</p>
                    <p className="text-3xl font-bold">{stats.successRate}%</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* البحث والفلترة */}
        {campaigns.length > 0 && (
        <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* البحث */}
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="ابحث عن حملة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 bg-background border-border text-foreground"
                  />
                </div>

                {/* فلترة حسب الحالة */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-background border-border">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 ml-2 text-muted-foreground" />
                      <SelectValue placeholder="جميع الحالات" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all" className="bg-popover hover:bg-accent">
                      جميع الحالات
                    </SelectItem>
                    <SelectItem value="draft" className="bg-popover hover:bg-accent">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 ml-2" />
                        مسودات
                      </div>
                    </SelectItem>
                    <SelectItem value="running" className="bg-popover hover:bg-accent">
                      <div className="flex items-center">
                        <Play className="h-3 w-3 ml-2" />
                        قيد التنفيذ
                      </div>
                    </SelectItem>
                    <SelectItem value="paused" className="bg-popover hover:bg-accent">
                      <div className="flex items-center">
                        <Pause className="h-3 w-3 ml-2" />
                        متوقفة
                      </div>
                    </SelectItem>
                    <SelectItem value="completed" className="bg-popover hover:bg-accent">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-3 w-3 ml-2" />
                        مكتملة
                      </div>
                    </SelectItem>
                    <SelectItem value="failed" className="bg-popover hover:bg-accent">
                      <div className="flex items-center">
                        <XCircle className="h-3 w-3 ml-2" />
                        فشلت
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {searchQuery || statusFilter !== 'all' ? (
                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                  <span>عرض {campaigns.length} من {pagination?.total || 0} حملة</span>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                      setPage(1)
                    }}
                    className="text-primary hover:text-primary/80 underline"
                  >
                    إعادة تعيين
                  </button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <BarChart3 className="h-5 w-5 ml-2 text-primary" />
              حملاتك ({pagination?.total || 0})
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {campaigns.length === 0 ? 'لا توجد حملات حتى الآن' : 'إدارة وتتبع حملاتك'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 && !isLoading ? (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">ابدأ حملتك الأولى</h3>
                <p className="text-muted-foreground mb-6">
                  أنشئ حملة تسويقية جديدة لإرسال رسائل مخصصة لأعضاء المجموعات
                </p>
                <Button asChild>
                  <Link href="/campaigns/create">
                  <Plus className="h-4 w-4 ml-2" />
                  إنشاء حملة الآن
                  </Link>
                </Button>
              </div>
            ) : campaigns.length === 0 && !isLoading ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">لا توجد نتائج</h3>
                <p className="text-muted-foreground mb-6">
                  لا توجد حملات مطابقة لمعايير البحث والفلترة
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setPage(1)
                  }}
                >
                  إعادة تعيين الفلاتر
                </Button>
              </div>
            ) : (
              <>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <Card 
                    key={campaign.id} 
                    className="hover:shadow-lg transition-all duration-200 border-border bg-card hover:border-primary/20"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        {/* معلومات الحملة */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <h4 className="text-lg font-semibold text-foreground">
                              {campaign.name}
                            </h4>
                            {getStatusBadge(campaign.status)}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedCampaign(campaign)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="h-4 w-4 ml-1" />
                              تفاصيل
                            </Button>
                          </div>
                          
                          {campaign.description && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {campaign.description}
                            </p>
                          )}

                          {/* معلومات سريعة */}
                          <div className="flex items-center gap-4 mb-4 flex-wrap text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>رسالة مخصصة</span>
                            </div>
                            {campaign.progress.total > 0 && (
                              <>
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>{campaign.progress.total.toLocaleString()} مستهدف</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                  <span className="text-green-600 dark:text-green-400">
                                    {campaign.progress.sent.toLocaleString()} نجح
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* شريط التقدم المحسّن */}
                          {campaign.status !== 'draft' && campaign.progress.total > 0 && (
                            <div className="space-y-3 bg-muted/50 p-4 rounded-lg border border-border">
                              <div className="flex items-center justify-between text-xs font-medium text-foreground">
                                <span>التقدم</span>
                                <span className="text-primary font-bold">
                                  {getProgressPercentage(campaign.progress)}%
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-primary to-primary/80 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                                  style={{ width: `${getProgressPercentage(campaign.progress)}%` }}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">نجح</p>
                                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                      {campaign.progress.sent.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-4 w-4 text-red-500" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">فشل</p>
                                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                      {campaign.progress.failed.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* معلومات التوقيت */}
                          <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(campaign.created_at).toLocaleDateString('ar-SA', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            {campaign.started_at && (
                              <div className="flex items-center gap-1">
                                <Play className="h-3 w-3" />
                                <span>
                                  بدأت: {new Date(campaign.started_at).toLocaleDateString('ar-SA', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            )}
                            {campaign.completed_at && (
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>
                                  انتهت: {new Date(campaign.completed_at).toLocaleDateString('ar-SA', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* أزرار الإجراءات */}
                        <div className="flex flex-col gap-2">
                          {campaign.status === 'running' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePauseCampaign(campaign.id)}
                              disabled={deleteCampaign.isPending || pauseCampaign.isPending}
                              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                            >
                              <Pause className="h-4 w-4 ml-1" />
                              إيقاف
                            </Button>
                          )}
                          
                          {campaign.status === 'paused' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResumeCampaign(campaign.id)}
                              disabled={deleteCampaign.isPending || pauseCampaign.isPending}
                              className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                            >
                              <Play className="h-4 w-4 ml-1" />
                              استئناف
                            </Button>
                          )}

                          {campaign.status !== 'running' && campaign.status !== 'paused' && (
                            <>
                              {campaign.status === 'draft' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    // TODO: Start campaign
                                    alert('قريباً: بدء الحملة من هنا')
                                  }}
                                  className="border-primary text-primary hover:bg-primary/10"
                                >
                                  <Play className="h-4 w-4 ml-1" />
                                  بدء
                                </Button>
                              )}
                              
                              {(campaign.status === 'failed' || campaign.status === 'completed') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => router.push(`/campaigns/${campaign.id}/logs`)}
                                >
                                  <FileText className="h-4 w-4 ml-1" />
                                  السجلات
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-destructive text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteCampaign(campaign.id)}
                                disabled={deleteCampaign.isPending || pauseCampaign.isPending}
                              >
                                <Trash2 className="h-4 w-4 ml-1" />
                                حذف
                              </Button>
                            </>
                          )}
                        </div>
                  </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
                
                {/* Pagination Controls */}
                {pagination && pagination.totalPages > 1 && (
                  <PaginationControls
                    pagination={pagination}
                    onPageChange={setPage}
                    isLoading={isLoading}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Modal تفاصيل الحملة */}
        {selectedCampaign && (
          <CampaignDetailsModal
            open={true}
            onOpenChange={(open) => !open && setSelectedCampaign(null)}
            campaign={selectedCampaign as any}
            onUpdate={() => refetch()}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
