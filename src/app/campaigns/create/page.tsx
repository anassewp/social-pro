'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRight, Save, Send, AlertCircle, MessageSquare, Users, Clock, BarChart3, Settings, ChevronDown, ChevronUp, Zap, Shield, Activity } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ButtonLoading } from '@/components/ui/Loading'

export default function CreateCampaignPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [groups, setGroups] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])

  // بيانات النموذج
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [messageTemplate, setMessageTemplate] = useState('')
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [selectedSession, setSelectedSession] = useState('')
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])
  const [startImmediately, setStartImmediately] = useState(false)

  // إعدادات متقدمة
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [memberSelectionMode, setMemberSelectionMode] = useState<'auto' | 'absolute' | 'percent' | 'random'>('auto')
  const [maxMembers, setMaxMembers] = useState(1000)
  const [percentMembers, setPercentMembers] = useState(20)
  const [randomMin, setRandomMin] = useState(300)
  const [randomMax, setRandomMax] = useState(800)
  const [timingMode, setTimingMode] = useState<'random'>('random')
  const [delayMin, setDelayMin] = useState(3)
  const [delayMax, setDelayMax] = useState(8)
  const [sessionStrategy, setSessionStrategy] = useState<'equal' | 'random' | 'weighted'>('weighted')
  const [rateLimitPerHour, setRateLimitPerHour] = useState(30)
  const [pauseProbability, setPauseProbability] = useState(5)

  // إحصائيات
  const [totalMembers, setTotalMembers] = useState(0)
  const [duplicateStats, setDuplicateStats] = useState<{
    total_members: number
    new_members: number
    duplicates_excluded: number
    duplicate_percentage: number
  } | null>(null)
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)

  useEffect(() => {
    if (user?.team_id) {
      fetchGroups()
      fetchSessions()
    }
  }, [user])

  useEffect(() => {
    if (selectedGroups.length > 0) {
      calculateTotalMembers()
      checkDuplicates()
    } else {
      setTotalMembers(0)
      setDuplicateStats(null)
    }
  }, [selectedGroups])

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('team_id', user?.team_id)
        .order('name')

      if (!error && data) {
        setGroups(data)
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('telegram_sessions')
        .select('*')
        .eq('team_id', user?.team_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setSessions(data)
        if (data.length > 0 && !selectedSession) {
          setSelectedSession(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  const calculateTotalMembers = async () => {
    try {
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .in('group_id', selectedGroups)
        .eq('is_bot', false)

      setTotalMembers(count || 0)
    } catch (error) {
      console.error('Error calculating members:', error)
    }
  }

  const checkDuplicates = async () => {
    if (!user?.team_id || selectedGroups.length === 0) {
      setDuplicateStats(null)
      return
    }

    setCheckingDuplicates(true)
    try {
      const response = await fetch('/api/campaigns/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_groups: selectedGroups,
          teamId: user.team_id
        })
      })

      if (response.ok) {
        const data = await response.json()
        setDuplicateStats(data)
      } else {
        console.error('Error checking duplicates')
        setDuplicateStats(null)
      }
    } catch (error) {
      console.error('Error checking duplicates:', error)
      setDuplicateStats(null)
    } finally {
      setCheckingDuplicates(false)
    }
  }

  const handleGroupToggle = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId))
    } else {
      setSelectedGroups([...selectedGroups, groupId])
    }
  }

  const handleSelectAllGroups = () => {
    if (selectedGroups.length === groups.length) {
      setSelectedGroups([])
    } else {
      setSelectedGroups(groups.map(g => g.id))
    }
  }

  const handleSubmit = async () => {
    // التحقق من البيانات
    if (!name.trim()) {
      setError('اسم الحملة مطلوب')
      return
    }

    if (!messageTemplate.trim()) {
      setError('قالب الرسالة مطلوب')
      return
    }

    if (selectedGroups.length === 0) {
      setError('يجب اختيار مجموعة واحدة على الأقل')
      return
    }

    if (startImmediately && !selectedSession) {
      setError('يجب اختيار جلسة تيليجرام للبدء الفوري')
      return
    }

    if (!user?.team_id || !user?.id) {
      setError('معلومات المستخدم غير كاملة. يرجى تسجيل الدخول مرة أخرى')
      return
    }

    setLoading(true)
    setError('')

    try {
      // بناء الإعدادات المتقدمة
      const campaign_config = showAdvancedSettings ? {
        member_selection: {
          mode: memberSelectionMode,
          max_members: maxMembers,
          percent: percentMembers / 100,
          random_range: [randomMin, randomMax]
        },
        timing: {
          mode: timingMode,
          random_range_sec: [delayMin, delayMax],
          session_base_sec: delayMin,
          session_jitter_sec: delayMax - delayMin
        },
        sessions: {
          strategy: sessionStrategy,
          min_per_session: 10
        },
        anti_detection: {
          rate_limit_per_session_per_hour: rateLimitPerHour,
          pause_probability: pauseProbability / 100,
          backoff: {
            initial_sec: 60,
            factor: 2,
            max_sec: 3600
          }
        },
        dedup: {
          use_cache: true,
          cache_ttl_sec: 86400
        }
      } : undefined

      // إنشاء الحملة
      const response = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          message_template: messageTemplate.trim(),
          target_groups: selectedGroups,
          teamId: user?.team_id,
          userId: user?.id,
          campaign_config: campaign_config,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error?.message || responseData.error || 'فشل في إنشاء الحملة')
      }

      // استخراج البيانات من successResponse format
      const data = responseData.data || responseData
      const campaign = data.campaign || data

      // التحقق من أن الاستجابة تحتوي على campaign
      if (!campaign || !campaign.id) {
        throw new Error('فشل في إنشاء الحملة: لم يتم إرجاع بيانات الحملة من الخادم')
      }

      // إذا كان البدء فورياً، ابدأ الحملة
      if (startImmediately) {
        const sessionsToUse = selectedSessions.length > 0 ? selectedSessions : (selectedSession ? [selectedSession] : [])
        
        if (sessionsToUse.length === 0) {
          throw new Error('يجب اختيار جلسة واحدة على الأقل للبدء الفوري')
        }

        // تحذير إذا كانت الأعضاء قليلة
        if (duplicateStats && duplicateStats.new_members === 0) {
          throw new Error('⚠️ لا يوجد أعضاء جدد للإرسال إليهم!\n\nجميع الأعضاء في المجموعات المحددة تم إرسال رسائل إليهم مسبقاً.\n\nالحل: اختر مجموعات جديدة أو انتظر قبل إعادة الإرسال.')
        }

        if (duplicateStats && duplicateStats.new_members < 10) {
          const confirmStart = window.confirm(
            `⚠️ تحذير: يوجد ${duplicateStats.new_members} عضو جديد فقط!\n\n` +
            `هل تريد المتابعة؟\n\n` +
            `(يُفضل أن يكون لديك على الأقل 10 أعضاء جدد)`
          )
          if (!confirmStart) {
            // احذف الحملة إذا لم يرغب المستخدم بالمتابعة
            await fetch('/api/campaigns/delete', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ campaignId: campaign.id })
            })
            return
          }
        }

        const startResponse = await fetch('/api/campaigns/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId: campaign.id,
            sessionIds: sessionsToUse,
          }),
        })

        if (!startResponse.ok) {
          const startData = await startResponse.json()
          
          // عرض رسالة خطأ تفصيلية
          const errorMessage = startData.error || 'فشل في بدء الحملة'
          throw new Error(errorMessage)
        }
      }

      // الانتقال إلى صفحة الحملات
      router.push('/campaigns')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">إنشاء حملة جديدة</h1>
            <p className="text-muted-foreground">أنشئ حملة تسويقية لإرسال رسائل مخصصة</p>
          </div>
        </div>

        {/* معلومات الحملة */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات الحملة</CardTitle>
            <CardDescription>أدخل اسم ووصف الحملة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الحملة *</Label>
              <Input
                id="name"
                placeholder="مثال: حملة ترويجية لشهر نوفمبر"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف الحملة (اختياري)</Label>
              <Input
                id="description"
                placeholder="وصف قصير للحملة"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* قالب الرسالة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 ml-2 text-blue-600" />
              قالب الرسالة
            </CardTitle>
            <CardDescription>
              اكتب الرسالة التي سيتم إرسالها. يمكنك استخدام متغيرات: {'{first_name}'}, {'{last_name}'}, {'{username}'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">الرسالة *</Label>
              <textarea
                id="message"
                name="message"
                className="w-full min-h-[200px] p-3 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-y placeholder:text-muted-foreground"
                placeholder="مرحباً {first_name}،&#10;&#10;نود أن نعلمك بعرضنا الخاص..."
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
              />
              <div className="flex items-center justify-between text-xs">
                <p className={`${messageTemplate.length > 4000 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                  عدد الأحرف: {messageTemplate.length} / 4096
                </p>
                {messageTemplate.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const preview = messageTemplate
                        .replace(/{first_name}/g, 'أحمد')
                        .replace(/{last_name}/g, 'محمد')
                        .replace(/{username}/g, 'ahmed123')
                      alert(`معاينة الرسالة:\n\n${preview}`)
                    }}
                    className="text-xs"
                  >
                    معاينة
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <p className="text-xs font-medium mb-2 text-foreground flex items-center">
                <MessageSquare className="h-3 w-3 ml-1" />
                💡 نصائح للرسالة:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5 mr-4">
                <li className="flex items-start">
                  <span className="ml-1">•</span>
                  <span>استخدم {'{first_name}'}, {'{last_name}'}, {'{username}'} لتخصيص الرسالة</span>
                </li>
                <li className="flex items-start">
                  <span className="ml-1">•</span>
                  <span>اجعل الرسالة قصيرة وواضحة (150-300 حرف)</span>
                </li>
                <li className="flex items-start">
                  <span className="ml-1">•</span>
                  <span>تجنب الرسائل العشوائية (Spam) لتجنب الحظر</span>
                </li>
                <li className="flex items-start">
                  <span className="ml-1">•</span>
                  <span>استخدم أسلوب احترافي ومحترم</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* اختيار المجموعات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Users className="h-5 w-5 ml-2 text-blue-600" />
                المجموعات المستهدفة
              </span>
              <span className="text-sm font-normal text-slate-600">
                {selectedGroups.length} من {groups.length} محدد
              </span>
            </CardTitle>
            <CardDescription>
              اختر المجموعات التي تريد إرسال الرسائل لأعضائها
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {groups.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-lg border border-border">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-foreground mb-2">
                  لا توجد مجموعات. يرجى استيراد مجموعات أولاً.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => router.push('/groups')}
                >
                  الذهاب إلى المجموعات
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox
                      id="select-all"
                      checked={selectedGroups.length === groups.length}
                      onCheckedChange={handleSelectAllGroups}
                    />
                    <Label htmlFor="select-all" className="cursor-pointer font-medium text-foreground">
                      تحديد الكل
                    </Label>
                  </div>
                  {totalMembers > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        إجمالي الأعضاء: <strong className="text-primary">{totalMembers.toLocaleString()}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* إحصائيات التكرار */}
                {selectedGroups.length > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-border">
                    {checkingDuplicates ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ButtonLoading />
                        <span>جاري التحقق من التكرار...</span>
                      </div>
                    ) : duplicateStats ? (
                      <>
                        {duplicateStats.new_members === 0 && (
                          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-red-900 dark:text-red-100">⚠️ تحذير: لا يوجد أعضاء جدد!</p>
                                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                  جميع الأعضاء ({duplicateStats.total_members}) تم إرسال رسائل إليهم مسبقاً في حملات سابقة.
                                </p>
                                <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                                  💡 الحل: اختر مجموعات جديدة أو انتظر قبل إعادة الإرسال
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        {duplicateStats.new_members > 0 && duplicateStats.new_members < 10 && (
                          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">⚠️ تحذير: عدد قليل من الأعضاء الجدد</p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                  يوجد {duplicateStats.new_members} عضو جديد فقط. يُفضل أن يكون لديك على الأقل 10 أعضاء جدد.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-foreground flex items-center">
                            <BarChart3 className="h-4 w-4 ml-1" />
                            إحصائيات التحقق من التكرار
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white dark:bg-card p-3 rounded-lg border border-border">
                              <p className="text-xs text-muted-foreground mb-1">إجمالي الأعضاء</p>
                              <p className="text-lg font-bold text-foreground">
                                {duplicateStats.total_members.toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                              <p className="text-xs text-green-700 dark:text-green-400 mb-1">أعضاء جدد</p>
                              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                {duplicateStats.new_members.toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                              <p className="text-xs text-orange-700 dark:text-orange-400 mb-1">مستبعد (مكرر)</p>
                              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                {duplicateStats.duplicates_excluded.toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                              <p className="text-xs text-purple-700 dark:text-purple-400 mb-1">نسبة التكرار</p>
                              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                {duplicateStats.duplicate_percentage}%
                              </p>
                            </div>
                          </div>
                          {duplicateStats.duplicates_excluded > 0 && (
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                              <p className="text-xs text-blue-700 dark:text-blue-400">
                                ℹ️ سيتم استبعاد {duplicateStats.duplicates_excluded.toLocaleString()} عضو تم إرسال رسائل إليهم مسبقاً في حملات الفريق
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    ) : null}
                  </div>
                )}

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className={`flex items-center space-x-3 rtl:space-x-reverse p-4 border rounded-lg transition-all cursor-pointer ${
                        selectedGroups.includes(group.id)
                          ? 'bg-primary/5 border-primary/30 shadow-sm'
                          : 'bg-card border-border hover:bg-muted/50'
                      }`}
                      onClick={() => handleGroupToggle(group.id)}
                    >
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={selectedGroups.includes(group.id)}
                        onCheckedChange={() => handleGroupToggle(group.id)}
                      />
                      <Label
                        htmlFor={`group-${group.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${selectedGroups.includes(group.id) ? 'text-foreground' : 'text-foreground'}`}>
                              {group.name}
                            </p>
                            {group.username && (
                              <p className="text-xs text-primary mt-1">@{group.username}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {group.member_count?.toLocaleString() || 0} عضو
                          </Badge>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* الإعدادات المتقدمة */}
        <Card>
          <CardHeader>
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            >
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 ml-2 text-purple-600" />
                الإعدادات المتقدمة
              </CardTitle>
              {showAdvancedSettings ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <CardDescription>
              تحكم متقدم في عدد الأعضاء، التوقيت، الجلسات، والحماية من الكشف
            </CardDescription>
          </CardHeader>
          
          {showAdvancedSettings && (
            <CardContent className="space-y-6">
              {/* التحكم بعدد الأشخاص */}
              <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center">
                  <Users className="h-4 w-4 ml-2 text-blue-600" />
                  <h4 className="font-semibold text-foreground">التحكم بعدد الأشخاص</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="member-mode">الوضع</Label>
                  <Select value={memberSelectionMode} onValueChange={(value: any) => setMemberSelectionMode(value)}>
                    <SelectTrigger id="member-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">تلقائي (Auto) - موصى به</SelectItem>
                      <SelectItem value="absolute">عدد مطلق (Absolute)</SelectItem>
                      <SelectItem value="percent">نسبة مئوية (Percent)</SelectItem>
                      <SelectItem value="random">عشوائي (Random)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {memberSelectionMode === 'auto' && 'وضع ذكي يختار تلقائياً: 20% من المجموعات الصغيرة (<500)، وعدد محدد للكبيرة'}
                    {memberSelectionMode === 'absolute' && 'تحديد عدد ثابت من الأعضاء'}
                    {memberSelectionMode === 'percent' && 'تحديد نسبة مئوية من الأعضاء'}
                    {memberSelectionMode === 'random' && 'تحديد عدد عشوائي ضمن نطاق معين'}
                  </p>
                </div>

                {(memberSelectionMode === 'auto' || memberSelectionMode === 'absolute') && (
                  <div className="space-y-2">
                    <Label htmlFor="max-members">الحد الأقصى</Label>
                    <Input
                      id="max-members"
                      type="number"
                      value={maxMembers}
                      onChange={(e) => setMaxMembers(parseInt(e.target.value) || 1000)}
                      min="10"
                      max="10000"
                    />
                  </div>
                )}

                {(memberSelectionMode === 'auto' || memberSelectionMode === 'percent') && (
                  <div className="space-y-2">
                    <Label htmlFor="percent-members">النسبة المئوية (%)</Label>
                    <Input
                      id="percent-members"
                      type="number"
                      value={percentMembers}
                      onChange={(e) => setPercentMembers(parseInt(e.target.value) || 20)}
                      min="1"
                      max="100"
                    />
                  </div>
                )}

                {memberSelectionMode === 'random' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="random-min">الحد الأدنى</Label>
                      <Input
                        id="random-min"
                        type="number"
                        value={randomMin}
                        onChange={(e) => setRandomMin(parseInt(e.target.value) || 300)}
                        min="10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="random-max">الحد الأقصى</Label>
                      <Input
                        id="random-max"
                        type="number"
                        value={randomMax}
                        onChange={(e) => setRandomMax(parseInt(e.target.value) || 800)}
                        min={randomMin + 1}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* التوقيت بين الرسائل */}
              <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 ml-2 text-green-600" />
                  <h4 className="font-semibold text-foreground">التوقيت بين الرسائل</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="delay-min">الحد الأدنى (ثانية)</Label>
                    <Input
                      id="delay-min"
                      type="number"
                      value={delayMin}
                      onChange={(e) => setDelayMin(parseInt(e.target.value) || 3)}
                      min="1"
                      max="60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delay-max">الحد الأقصى (ثانية)</Label>
                    <Input
                      id="delay-max"
                      type="number"
                      value={delayMax}
                      onChange={(e) => setDelayMax(parseInt(e.target.value) || 8)}
                      min={delayMin + 1}
                      max="120"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  سيتم انتظار وقت عشوائي بين {delayMin}-{delayMax} ثانية بين كل رسالة
                </p>
              </div>

              {/* تعدد الجلسات */}
              <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 ml-2 text-purple-600" />
                  <h4 className="font-semibold text-foreground">استراتيجية توزيع الجلسات</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="session-strategy">الاستراتيجية</Label>
                  <Select value={sessionStrategy} onValueChange={(value: any) => setSessionStrategy(value)}>
                    <SelectTrigger id="session-strategy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weighted">مرجّح (Weighted) - موصى به</SelectItem>
                      <SelectItem value="equal">متساوي (Equal)</SelectItem>
                      <SelectItem value="random">عشوائي (Random)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {sessionStrategy === 'weighted' && 'توزيع ذكي حسب أداء الجلسة وموثوقيتها'}
                    {sessionStrategy === 'equal' && 'توزيع متساوي بين جميع الجلسات'}
                    {sessionStrategy === 'random' && 'توزيع عشوائي بين الجلسات'}
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-center">
                    <Zap className="h-3 w-3 ml-1" />
                    يجب اختيار جلسات متعددة في قسم "خيارات التنفيذ" للاستفادة من هذه الميزة
                  </p>
                </div>
              </div>

              {/* الحماية من الكشف */}
              <div className="space-y-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 ml-2 text-red-600" />
                  <h4 className="font-semibold text-foreground">الحماية من الكشف (Anti-Detection)</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rate-limit">الحد الأقصى للرسائل/ساعة (لكل جلسة)</Label>
                  <Input
                    id="rate-limit"
                    type="number"
                    value={rateLimitPerHour}
                    onChange={(e) => setRateLimitPerHour(parseInt(e.target.value) || 30)}
                    min="10"
                    max="100"
                  />
                  <p className="text-xs text-muted-foreground">
                    عدد الرسائل المسموح به لكل جلسة في الساعة
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pause-prob">احتمالية التوقف العشوائي (%)</Label>
                  <Input
                    id="pause-prob"
                    type="number"
                    value={pauseProbability}
                    onChange={(e) => setPauseProbability(parseInt(e.target.value) || 5)}
                    min="0"
                    max="20"
                  />
                  <p className="text-xs text-muted-foreground">
                    احتمالية التوقف لمدة 5-20 ثانية (لمحاكاة السلوك البشري)
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-xs text-orange-700 dark:text-orange-400 flex items-center">
                    <Shield className="h-3 w-3 ml-1" />
                    هذه الإعدادات تساعد على تجنب اكتشاف Telegram للإرسال الآلي
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* خيارات التنفيذ */}
        <Card>
          <CardHeader>
            <CardTitle>خيارات التنفيذ</CardTitle>
            <CardDescription>اختر متى تريد تنفيذ الحملة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox
                id="start-now"
                checked={startImmediately}
                onCheckedChange={(checked) => setStartImmediately(checked as boolean)}
              />
              <Label htmlFor="start-now" className="cursor-pointer">
                بدء الحملة فوراً بعد الإنشاء
              </Label>
            </div>

            {startImmediately && (
              <div className="space-y-4 mr-6">
                <div className="space-y-2">
                  <Label>اختر الجلسات</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    يمكنك اختيار جلسة واحدة أو عدة جلسات. عند اختيار عدة جلسات، سيتم توزيع الرسائل حسب الاستراتيجية المحددة في الإعدادات المتقدمة.
                  </p>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3 bg-muted/30">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center space-x-2 rtl:space-x-reverse p-2 hover:bg-accent rounded">
                        <Checkbox
                          id={`session-${session.id}`}
                          checked={selectedSessions.includes(session.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSessions([...selectedSessions, session.id])
                            } else {
                              setSelectedSessions(selectedSessions.filter(id => id !== session.id))
                            }
                          }}
                        />
                        <Label 
                          htmlFor={`session-${session.id}`} 
                          className="cursor-pointer flex-1"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{session.phone_number}</p>
                              {session.session_name && (
                                <p className="text-xs text-muted-foreground">{session.session_name}</p>
                              )}
                            </div>
                            {session.is_active && (
                              <Badge variant="outline" className="text-xs">نشط</Badge>
                            )}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>

                  {selectedSessions.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-400 flex items-center">
                        <Activity className="h-3 w-3 ml-1" />
                        تم تحديد {selectedSessions.length} جلسة. سيتم توزيع الرسائل بينها حسب الاستراتيجية المحددة.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!startImmediately && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center">
                  <Clock className="h-3 w-3 ml-1" />
                  ℹ️ سيتم حفظ الحملة كمسودة. يمكنك بدئها لاحقاً من صفحة الحملات.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* رسالة خطأ */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* أزرار الإجراءات */}
        <div className="flex space-x-3 rtl:space-x-reverse pb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
            className="flex-1"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || groups.length === 0 || sessions.length === 0}
            className="flex-1"
          >
            {loading ? (
              <>
                <ButtonLoading className="ml-2" />
                جاري الحفظ...
              </>
            ) : startImmediately ? (
              <>
                <Send className="h-4 w-4 ml-2" />
                إنشاء وبدء الحملة
              </>
            ) : (
              <>
                <Save className="h-4 w-4 ml-2" />
                حفظ كمسودة
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

