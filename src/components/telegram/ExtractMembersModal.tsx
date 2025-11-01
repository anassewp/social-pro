'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Users, CheckCircle2, AlertCircle, Download } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { ButtonLoading, SectionLoading } from '@/components/ui/Loading'

interface ExtractMembersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId?: string
  groupName?: string
  onMembersExtracted?: () => void
}

type Step = 'select_session' | 'check_membership' | 'need_join' | 'joining' | 'extracting' | 'success' | 'error'

export function ExtractMembersModal({ 
  open, 
  onOpenChange, 
  groupId,
  groupName,
  onMembersExtracted 
}: ExtractMembersModalProps) {
  const [step, setStep] = useState<Step>('select_session')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedSession, setSelectedSession] = useState('')
  const [extractedData, setExtractedData] = useState<any>(null)
  const [membershipInfo, setMembershipInfo] = useState<any>(null)
  
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (open && user?.team_id) {
      fetchSessions()
    }
  }, [open, user])

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('telegram_sessions')
        .select('*')
        .eq('team_id', user?.team_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching sessions:', error)
      } else {
        setSessions(data || [])
        if (data && data.length > 0) {
          setSelectedSession(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const checkMembership = async () => {
    if (!selectedSession || !groupId) {
      setError('يرجى اختيار جلسة')
      return
    }

    setLoading(true)
    setError('')
    setStep('check_membership')

    try {
      const response = await fetch('/api/telegram/check-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: groupId,
          sessionId: selectedSession,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'فشل في التحقق من العضوية')
      }

      setMembershipInfo(data)

      // إذا كان عضواً بالفعل، ابدأ الاستخراج مباشرة
      if (data.isMember) {
        handleExtract()
      } else if (data.canJoin) {
        // إذا لم يكن عضواً ويمكن الانضمام، اعرض زر الانضمام
        setStep('need_join')
        setLoading(false)
      } else {
        // مجموعة خاصة ولا يمكن الانضمام
        throw new Error('هذه مجموعة خاصة. يجب أن تكون عضواً فيها لاستخراج الأعضاء.')
      }
    } catch (error: any) {
      setError(error.message)
      setStep('error')
      setLoading(false)
    }
  }

  const handleJoinGroup = async () => {
    setLoading(true)
    setError('')
    setStep('joining')

    try {
      const response = await fetch('/api/telegram/join-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: groupId,
          sessionId: selectedSession,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'فشل في الانضمام للمجموعة')
      }

      // بعد الانضمام بنجاح، ابدأ الاستخراج
      handleExtract()
    } catch (error: any) {
      setError(error.message)
      setStep('error')
      setLoading(false)
    }
  }

  const handleExtract = async () => {
    setLoading(true)
    setError('')
    setStep('extracting')

    try {
      const response = await fetch('/api/telegram/extract-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: groupId,
          sessionId: selectedSession,
          saveToDatabase: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // إذا كان الخطأ يتطلب الانضمام أولاً، اعرض زر الانضمام
        if (response.status === 403 && data.needsJoin && data.canJoin) {
          setStep('need_join')
          setError('')
          setLoading(false)
          return
        }
        throw new Error(data.error || 'فشل في استخراج الأعضاء')
      }

      setExtractedData(data)
      setStep('success')
      
      // استدعاء callback
      if (onMembersExtracted) {
        onMembersExtracted()
      }
    } catch (error: any) {
      setError(error.message)
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('select_session')
    setError('')
    setExtractedData(null)
    setSelectedSession('')
    onOpenChange(false)
  }

  const exportToCSV = () => {
    if (!extractedData?.members) return

    const headers = ['ID', 'Username', 'First Name', 'Last Name', 'Phone', 'Is Bot', 'Is Premium']
    const rows = extractedData.members.map((member: any) => [
      member.telegram_user_id,
      member.username || '',
      member.first_name || '',
      member.last_name || '',
      member.phone || '',
      member.is_bot ? 'Yes' : 'No',
      member.is_premium ? 'Yes' : 'No',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${groupName || 'group'}_members_${Date.now()}.csv`
    link.click()
  }

  const renderStepContent = () => {
    switch (step) {
      case 'select_session':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">استخراج الأعضاء</h3>
              <p className="text-sm text-slate-600 mt-2">
                اختر جلسة تيليجرام لاستخراج أعضاء المجموعة: <strong>{groupName}</strong>
              </p>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-6 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                <p className="text-sm text-yellow-800">
                  لا توجد جلسات تيليجرام نشطة. يرجى إضافة جلسة أولاً.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="session" className="text-slate-900">اختر الجلسة</Label>
                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="اختر جلسة تيليجرام" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id} className="bg-white hover:bg-slate-50">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span>{session.phone_number}</span>
                          {session.session_name && (
                            <span className="text-xs text-slate-500">({session.session_name})</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                💡 ملاحظة:
              </p>
              <ul className="text-xs text-blue-700 mt-2 space-y-1 mr-4">
                <li>• قد تستغرق عملية الاستخراج بعض الوقت حسب حجم المجموعة</li>
                <li>• سيتم حفظ الأعضاء تلقائياً في قاعدة البيانات</li>
                <li>• يمكنك تصدير البيانات بعد الانتهاء</li>
              </ul>
            </div>

            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button 
                onClick={handleClose} 
                variant="outline"
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button 
                onClick={checkMembership} 
                disabled={loading || sessions.length === 0 || !selectedSession}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <ButtonLoading className="ml-2" />
                    جاري التحقق...
                  </>
                ) : (
                  'التالي'
                )}
              </Button>
            </div>
          </div>
        )

      case 'check_membership':
        return (
          <div className="text-center space-y-4 py-8">
            <SectionLoading message="جاري التحقق من العضوية..." />
            <p className="text-sm text-slate-600">
              يتم التحقق من عضويتك في المجموعة
            </p>
          </div>
        )

      case 'need_join':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">يجب الانضمام أولاً</h3>
              <p className="text-sm text-slate-600 mt-2">
                لاستخراج أعضاء المجموعة <strong>{groupName}</strong>، يجب أن تكون عضواً فيها
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">ℹ️ معلومات المجموعة:</p>
              {membershipInfo && (
                <div className="text-xs text-blue-700 space-y-1">
                  <p>• الاسم: {membershipInfo.groupInfo.name}</p>
                  {membershipInfo.groupInfo.username && (
                    <p>• المعرف: @{membershipInfo.groupInfo.username}</p>
                  )}
                  {membershipInfo.groupInfo.memberCount && (
                    <p>• عدد الأعضاء: {membershipInfo.groupInfo.memberCount.toLocaleString()}</p>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button 
                onClick={handleClose} 
                variant="outline"
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleJoinGroup} 
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <ButtonLoading className="ml-2" />
                    جاري الانضمام...
                  </>
                ) : (
                  'الانضمام الآن'
                )}
              </Button>
            </div>
          </div>
        )

      case 'joining':
        return (
          <div className="text-center space-y-4 py-8">
            <SectionLoading message="جاري الانضمام..." />
            <p className="text-sm text-slate-600">
              يتم الانضمام للمجموعة. سيبدأ الاستخراج تلقائياً بعد الانضمام.
            </p>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-green-800">
                💡 قد يستغرق هذا بضع ثوانٍ
              </p>
            </div>
          </div>
        )

      case 'extracting':
        return (
          <div className="text-center space-y-4 py-8">
            <SectionLoading message="جاري الاستخراج..." />
            <p className="text-sm text-slate-600">
              يتم استخراج أعضاء المجموعة من تيليجرام. قد يستغرق هذا بضع دقائق.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-xs text-slate-600">يرجى عدم إغلاق هذه النافذة</p>
            </div>
          </div>
        )

      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="h-16 w-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-900">تم الاستخراج بنجاح!</h3>
            <div className="bg-green-50 p-4 rounded-lg space-y-2">
              <p className="text-sm text-green-800">
                تم استخراج <strong>{extractedData?.total || 0}</strong> عضو من المجموعة
              </p>
              <p className="text-xs text-green-700">
                تم حفظ <strong>{extractedData?.saved || 0}</strong> عضو في قاعدة البيانات
              </p>
            </div>

            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button 
                onClick={exportToCSV}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 ml-2" />
                تصدير CSV
              </Button>
              <Button 
                onClick={handleClose}
                className="flex-1"
              >
                تم
              </Button>
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="text-center space-y-4">
            <div className="h-16 w-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-red-900">فشل الاستخراج</h3>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>

            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button 
                onClick={handleClose}
                variant="outline"
                className="flex-1"
              >
                إغلاق
              </Button>
              <Button 
                onClick={() => setStep('select_session')}
                className="flex-1"
              >
                إعادة المحاولة
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-900">استخراج أعضاء المجموعة</DialogTitle>
          <DialogDescription className="text-slate-600">
            استخراج قائمة بجميع أعضاء المجموعة من تيليجرام
          </DialogDescription>
        </DialogHeader>
        
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  )
}

