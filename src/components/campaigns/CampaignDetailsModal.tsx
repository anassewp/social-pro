'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  X,
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Users,
  Calendar,
  BarChart3,
  TrendingUp,
  Copy,
  RefreshCw
} from 'lucide-react'
import { ButtonLoading } from '@/components/ui/Loading'
import { createClient } from '@/lib/supabase/client'
import { type Campaign } from '@/lib/hooks/useCampaigns'

interface CampaignDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: Campaign | null
  onUpdate?: () => void
}

export function CampaignDetailsModal({
  open,
  onOpenChange,
  campaign,
  onUpdate
}: CampaignDetailsModalProps) {
  const [groups, setGroups] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && campaign) {
      fetchGroups()
      fetchResults()
    }
  }, [open, campaign])

  const fetchGroups = async () => {
    if (!campaign?.target_groups) return

    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('groups')
        .select('*')
        .in('id', campaign.target_groups)

      if (data) {
        setGroups(data)
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }

  const fetchResults = async () => {
    if (!campaign?.id) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('campaign_results')
        .select('*')
        .eq('campaign_id', campaign.id)
        .order('sent_at', { ascending: false })
        .limit(50)

      if (data) {
        setResults(data)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: Campaign['status']) => {
    const statusConfig = {
      draft: { label: 'مسودة', color: 'bg-muted text-muted-foreground', icon: Clock },
      scheduled: { label: 'مجدولة', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: Clock },
      running: { label: 'قيد التنفيذ', color: 'bg-green-500/10 text-green-600 dark:text-green-400', icon: Play },
      paused: { label: 'متوقفة', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400', icon: Pause },
      completed: { label: 'مكتملة', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', icon: CheckCircle2 },
      failed: { label: 'فشلت', color: 'bg-red-500/10 text-red-600 dark:text-red-400', icon: XCircle },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border`}>
        <Icon className="h-3 w-3 ml-1" />
        {config.label}
      </Badge>
    )
  }

  const getProgressPercentage = () => {
    if (!campaign?.progress?.total) return 0
    return Math.round(
      ((campaign.progress.sent + campaign.progress.failed) / campaign.progress.total) * 100
    )
  }

  const successRate = campaign?.progress?.sent
    ? Math.round((campaign.progress.sent / (campaign.progress.sent + campaign.progress.failed)) * 100)
    : 0

  if (!campaign) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                {campaign.name}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                {campaign.description || 'حملة تسويقية'}
              </DialogDescription>
            </div>
            {getStatusBadge(campaign.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* إحصائيات سريعة */}
          {campaign.progress.total > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">نجح</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {campaign.progress.sent.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">فشل</p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {campaign.progress.failed.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">إجمالي</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {campaign.progress.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">معدل النجاح</p>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {successRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* شريط التقدم */}
          {campaign.progress.total > 0 && (
            <Card className="bg-muted/30 border-border">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-foreground">التقدم</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">إكمال الحملة</span>
                  <span className="font-bold text-foreground">{getProgressPercentage()}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* قالب الرسالة */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground flex items-center">
                <MessageSquare className="h-4 w-4 ml-2" />
                قالب الرسالة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-4 rounded-lg border border-border">
                <p className="text-sm text-foreground whitespace-pre-wrap font-medium">
                  {campaign.message_template}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => {
                  navigator.clipboard.writeText(campaign.message_template)
                  alert('تم نسخ الرسالة!')
                }}
              >
                <Copy className="h-3 w-3 ml-1" />
                نسخ الرسالة
              </Button>
            </CardContent>
          </Card>

          {/* المجموعات المستهدفة */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground flex items-center">
                <Users className="h-4 w-4 ml-2" />
                المجموعات المستهدفة ({groups.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                  >
                    <div>
                      <p className="font-medium text-foreground">{group.name}</p>
                      {group.username && (
                        <p className="text-xs text-muted-foreground">@{group.username}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {group.member_count?.toLocaleString() || 0} عضو
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* معلومات التوقيت */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground flex items-center">
                <Calendar className="h-4 w-4 ml-2" />
                معلومات التوقيت
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">تم الإنشاء</span>
                  <span className="text-sm font-medium text-foreground">
                    {new Date(campaign.created_at).toLocaleString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {campaign.started_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">بدأت</span>
                    <span className="text-sm font-medium text-foreground">
                      {new Date(campaign.started_at).toLocaleString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                {campaign.completed_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">انتهت</span>
                    <span className="text-sm font-medium text-foreground">
                      {new Date(campaign.completed_at).toLocaleString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* النتائج الأخيرة */}
          {results.length > 0 && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 ml-2" />
                    النتائج الأخيرة
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchResults}
                    disabled={loading}
                  >
                    {loading ? <ButtonLoading className="ml-1" /> : <RefreshCw className="h-3 w-3 ml-1" />}
                    تحديث
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {results.map((result, idx) => (
                    <div
                      key={result.id || idx}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {result.target_username ? `@${result.target_username}` : result.target_user_id}
                        </p>
                        {result.error_message && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {result.error_message}
                          </p>
                        )}
                      </div>
                      {result.status === 'sent' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

