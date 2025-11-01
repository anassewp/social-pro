'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MessageSquare, CheckCircle2, Import, Search, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { ButtonLoading, SectionLoading } from '@/components/ui/Loading'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface ImportGroupsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGroupsImported: () => void
}

type Step = 'select-session' | 'loading-groups' | 'select-groups' | 'importing' | 'success'

interface TelegramGroup {
  id: string
  title: string
  username?: string
  participantsCount?: number
  type: 'channel' | 'group' | 'supergroup'
}

export function ImportGroupsModal({ open, onOpenChange, onGroupsImported }: ImportGroupsModalProps) {
  const [step, setStep] = useState<Step>('select-session')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deletingSession, setDeletingSession] = useState(false)
  const [encryptionErrorSessionId, setEncryptionErrorSessionId] = useState<string | null>(null)
  
  // Data
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedSession, setSelectedSession] = useState('')
  const [availableGroups, setAvailableGroups] = useState<TelegramGroup[]>([])
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  
  const { user } = useAuth()
  const supabase = createClient()

  // تصفية المجموعات بناءً على البحث
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableGroups
    }

    const query = searchQuery.toLowerCase().trim()
    return availableGroups.filter(group => 
      group.title.toLowerCase().includes(query) ||
      (group.username && group.username.toLowerCase().includes(query))
    )
  }, [availableGroups, searchQuery])

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

      if (error) {
        console.error('Error fetching sessions:', error)
      } else {
        setSessions(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const resetForm = () => {
    setStep('select-session')
    setSelectedSession('')
    setAvailableGroups([])
    setSelectedGroups(new Set())
    setSearchQuery('')
    setError('')
    setLoading(false)
    setEncryptionErrorSessionId(null)
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الجلسة؟ ستحتاج لإعادة إضافتها لاحقاً.')) {
      return
    }

    setDeletingSession(true)
    setError('')

    try {
      const response = await fetch(`/api/telegram/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'فشل في حذف الجلسة')
      }

      // تحديث قائمة الجلسات
      await fetchSessions()
      
      // إعادة تعيين الجلسة المحددة إذا كانت هي المحذوفة
      if (selectedSession === sessionId) {
        setSelectedSession('')
      }
      
      // إعادة تعيين رسالة الخطأ
      setEncryptionErrorSessionId(null)
      setError('')
      
      alert('تم حذف الجلسة بنجاح. يمكنك الآن إضافة جلسة جديدة.')
    } catch (error: any) {
      setError(error.message || 'فشل في حذف الجلسة')
    } finally {
      setDeletingSession(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const loadGroups = async () => {
    if (!selectedSession) {
      setError('يرجى اختيار جلسة')
      return
    }

    setLoading(true)
    setError('')
    setStep('loading-groups')

    try {
      const response = await fetch('/api/telegram/get-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: selectedSession }),
      })

      const data = await response.json()

      if (!response.ok) {
        // تحسين رسالة الخطأ لفك التشفير
        let errorMessage = data.error || 'فشل في جلب المجموعات'
        
        // إذا كان الخطأ متعلقاً بفك التشفير
        if (errorMessage.includes('فشل في فك تشفير') || errorMessage.includes('ENCRYPTION_KEY')) {
          // حفظ معرف الجلسة لإظهار زر الحذف
          setEncryptionErrorSessionId(selectedSession)
          errorMessage = 
            '❌ الجلسة مشفرة بمفتاح مختلف!\n\n' +
            '🔍 المشكلة:\n' +
            'الجلسة المختارة مشفرة بمفتاح مختلف عن المفتاح الحالي في .env.local\n\n' +
            '💡 الحل:\n' +
            'يمكنك حذف هذه الجلسة التالفة وإعادة إضافتها لاحقاً، أو تأكد من أن ENCRYPTION_KEY في .env.local مطابق للمفتاح المستخدم عند التشفير'
        }
        
        throw new Error(errorMessage)
      }

      setAvailableGroups(data.groups || [])
      setStep('select-groups')
    } catch (error: any) {
      setError(error.message)
      setStep('select-session')
    } finally {
      setLoading(false)
    }
  }


  const toggleGroup = (groupId: string) => {
    const newSelected = new Set(selectedGroups)
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId)
    } else {
      newSelected.add(groupId)
    }
    setSelectedGroups(newSelected)
  }

  const selectAll = () => {
    // تحديد/إلغاء تحديد المجموعات المفلترة فقط
    const filteredIds = filteredGroups.map(g => g.id)
    const allFilteredSelected = filteredIds.every(id => selectedGroups.has(id))
    
    if (allFilteredSelected) {
      // إلغاء تحديد المجموعات المفلترة
      const newSelected = new Set(selectedGroups)
      filteredIds.forEach(id => newSelected.delete(id))
      setSelectedGroups(newSelected)
    } else {
      // تحديد جميع المجموعات المفلترة
      const newSelected = new Set(selectedGroups)
      filteredIds.forEach(id => newSelected.add(id))
      setSelectedGroups(newSelected)
    }
  }

  const importGroups = async () => {
    if (selectedGroups.size === 0) {
      setError('يرجى اختيار مجموعة واحدة على الأقل')
      return
    }

    setLoading(true)
    setError('')
    setStep('importing')

    try {
      const groupsToImport = availableGroups.filter(g => selectedGroups.has(g.id))

      const response = await fetch('/api/telegram/import-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSession,
          groups: groupsToImport,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'فشل في استيراد المجموعات')
      }

      setStep('success')
      setTimeout(() => {
        handleClose()
        onGroupsImported()
      }, 2000)
    } catch (error: any) {
      setError(error.message)
      setStep('select-groups')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 'select-session':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">اختر جلسة تيليجرام</h3>
              <p className="text-sm text-slate-600 mt-2">
                اختر الجلسة التي تريد استيراد المجموعات منها
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="session" className="text-slate-900">الجلسة</Label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger className="bg-white border-slate-300 hover:border-blue-500 transition-colors">
                  <SelectValue placeholder="اختر جلسة تيليجرام..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {sessions.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-sm bg-white">
                      لا توجد جلسات نشطة
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <SelectItem 
                        key={session.id} 
                        value={session.id}
                        className="bg-white hover:bg-slate-50"
                      >
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span>{session.phone_number}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {sessions.length === 0 && (
                <p className="text-xs text-slate-600">
                  لا توجد جلسات نشطة. يرجى إضافة جلسة أولاً.
                </p>
              )}
            </div>

            {error && (
              <div className="space-y-3">
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded whitespace-pre-line border border-red-200">
                  {error}
                </div>
                {encryptionErrorSessionId && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSession(encryptionErrorSessionId)}
                    disabled={deletingSession}
                    className="w-full"
                  >
                    {deletingSession ? (
                      <>
                        <ButtonLoading className="ml-2" />
                        جاري الحذف...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 ml-2" />
                        حذف هذه الجلسة التالفة
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            <Button 
              onClick={loadGroups} 
              disabled={!selectedSession || loading || deletingSession}
              className="w-full"
            >
              {loading ? (
                <>
                  <ButtonLoading className="ml-2" />
                  جاري التحميل...
                </>
              ) : (
                'التالي'
              )}
            </Button>
          </div>
        )

      case 'loading-groups':
        return (
          <div className="text-center py-12">
            <SectionLoading message="جاري جلب المجموعات..." />
            <p className="text-sm text-slate-600 mt-2">
              يرجى الانتظار بينما نجلب قائمة مجموعاتك
            </p>
          </div>
        )

      case 'select-groups':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-slate-900">اختر المجموعات</h3>
                <p className="text-sm text-slate-600">
                  {filteredGroups.length} من {availableGroups.length} مجموعة
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={selectAll}>
                {filteredGroups.every(g => selectedGroups.has(g.id)) ? 'إلغاء الكل' : 'تحديد الكل'}
              </Button>
            </div>

            {/* حقل البحث المحلي */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="groupSearch"
                name="groupSearch"
                type="search"
                autoComplete="off"
                placeholder="ابحث في المجموعات الحالية..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">لا توجد مجموعات مطابقة للبحث</p>
                </div>
              ) : (
                filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center space-x-3 rtl:space-x-reverse p-3 hover:bg-slate-50 rounded-lg cursor-pointer"
                  onClick={() => toggleGroup(group.id)}
                >
                  <Checkbox
                    checked={selectedGroups.has(group.id)}
                    onCheckedChange={() => toggleGroup(group.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {group.title}
                    </p>
                    <p className="text-xs text-slate-600">
                      {group.username && `@${group.username} • `}
                      {group.participantsCount || 0} عضو
                    </p>
                  </div>
                </div>
              ))
              )}
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded whitespace-pre-line border border-red-200">
                {error}
              </div>
            )}

            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button 
                onClick={() => setStep('select-session')} 
                variant="outline"
                className="flex-1"
              >
                رجوع
              </Button>
              <Button 
                onClick={importGroups} 
                disabled={selectedGroups.size === 0 || loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <ButtonLoading className="ml-2" />
                    جاري الاستيراد...
                  </>
                ) : (
                  <>
                    <Import className="h-4 w-4 ml-2" />
                    استيراد ({selectedGroups.size})
                  </>
                )}
              </Button>
            </div>
          </div>
        )

      case 'importing':
        return (
          <div className="text-center py-12">
            <SectionLoading message="جاري الاستيراد..." />
            <p className="text-sm text-slate-600 mt-2">
              يتم استيراد {selectedGroups.size} مجموعة
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center space-y-4 py-8">
            <div className="h-12 w-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-900">تم الاستيراد بنجاح!</h3>
            <p className="text-sm text-slate-600">
              تم استيراد {selectedGroups.size} مجموعة بنجاح
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-slate-900">استيراد مجموعات تيليجرام</DialogTitle>
          <DialogDescription className="text-slate-600">
            استورد مجموعاتك من تيليجرام لبدء حملاتك التسويقية
          </DialogDescription>
        </DialogHeader>
        
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  )
}
