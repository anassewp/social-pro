'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Users, RefreshCw, Download, Search, Filter, User, Phone, CheckCircle2, AlertCircle, Crown, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { PageLoading, ButtonLoading } from '@/components/ui/Loading'

interface GroupMember {
  id: string
  telegram_user_id: string
  username: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  is_bot: boolean
  is_premium: boolean
  last_seen: string | null
  extracted_at: string
  group_id: string
  group?: {
    name: string
    username: string | null
  }
}

export default function MembersPage() {
  const [members, setMembers] = useState<GroupMember[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPremium, setFilterPremium] = useState<string>('all')
  const [filterBot, setFilterBot] = useState<string>('all')
  const [deletingAllMembers, setDeletingAllMembers] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (user?.team_id) {
      fetchGroups()
      fetchMembers()
    }
  }, [user])

  useEffect(() => {
    if (user?.team_id) {
      fetchMembers()
    }
  }, [selectedGroup])

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

  const fetchMembers = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('group_members')
        .select(`
          *,
          group:groups (
            name,
            username
          )
        `)
        .order('extracted_at', { ascending: false })

      // فلترة حسب المجموعة
      if (selectedGroup !== 'all') {
        query = query.eq('group_id', selectedGroup)
      } else {
        // فقط المجموعات التابعة للفريق
        const { data: teamGroups } = await supabase
          .from('groups')
          .select('id')
          .eq('team_id', user?.team_id)

        if (teamGroups && teamGroups.length > 0) {
          const groupIds = teamGroups.map(g => g.id)
          query = query.in('group_id', groupIds)
        }
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching members:', error)
      } else {
        setMembers(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // تصفية الأعضاء
  const filteredMembers = members.filter(member => {
    // البحث
    const matchesSearch = 
      (member.first_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.last_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.username?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.phone?.includes(searchQuery))

    // فلترة Premium
    const matchesPremium = 
      filterPremium === 'all' ||
      (filterPremium === 'premium' && member.is_premium) ||
      (filterPremium === 'regular' && !member.is_premium)

    // فلترة Bot
    const matchesBot = 
      filterBot === 'all' ||
      (filterBot === 'bot' && member.is_bot) ||
      (filterBot === 'user' && !member.is_bot)

    return matchesSearch && matchesPremium && matchesBot
  })

  const exportToCSV = () => {
    const headers = ['Telegram ID', 'Username', 'First Name', 'Last Name', 'Phone', 'Is Bot', 'Is Premium', 'Group']
    const rows = filteredMembers.map((member: any) => [
      member.telegram_user_id,
      member.username || '',
      member.first_name || '',
      member.last_name || '',
      member.phone || '',
      member.is_bot ? 'Yes' : 'No',
      member.is_premium ? 'Yes' : 'No',
      member.group?.name || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `members_${Date.now()}.csv`
    link.click()
  }

  const getFullName = (member: GroupMember) => {
    const parts = [member.first_name, member.last_name].filter(Boolean)
    return parts.length > 0 ? parts.join(' ') : 'بدون اسم'
  }

  const handleDeleteAllMembers = async () => {
    if (!confirm(`هل أنت متأكد من حذف جميع الأعضاء (${members.length} عضو)؟\n\n⚠️ تحذير: هذه العملية لا يمكن التراجع عنها!`)) {
      return
    }

    setDeletingAllMembers(true)
    try {
      const response = await fetch('/api/members/delete-all', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'فشل في حذف الأعضاء')
      }

      alert(`تم حذف ${data.count || members.length} عضو بنجاح`)
      fetchMembers()
    } catch (error: any) {
      console.error('Error deleting all members:', error)
      alert(error.message || 'فشل في حذف الأعضاء')
    } finally {
      setDeletingAllMembers(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoading message="جاري تحميل الأعضاء..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">الأعضاء المستخرجين</h1>
            <p className="text-slate-600">
              عرض وإدارة أعضاء المجموعات ({filteredMembers.length} من {members.length})
            </p>
          </div>
          <div className="flex space-x-2 rtl:space-x-reverse">
            {members.length > 0 && (
              <Button 
                variant="destructive"
                onClick={handleDeleteAllMembers}
                disabled={deletingAllMembers}
              >
                {deletingAllMembers ? (
                  <>
                    <ButtonLoading className="ml-2" />
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف جميع الأعضاء
                  </>
                )}
              </Button>
            )}
            <Button onClick={exportToCSV} disabled={filteredMembers.length === 0}>
              <Download className="h-4 w-4 ml-2" />
              تصدير CSV
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-slate-900">
              <Users className="h-5 w-5 ml-2 text-blue-600" />
              الأعضاء ({filteredMembers.length})
            </CardTitle>
            <CardDescription>
              {members.length === 0 ? 'لا يوجد أعضاء مستخرجين حتى الآن' : 'إدارة وتصدير الأعضاء'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* الفلاتر */}
            {members.length > 0 && (
              <div className="mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* البحث */}
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="ابحث عن عضو..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10 bg-white"
                    />
                  </div>

                  {/* اختيار المجموعة */}
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="جميع المجموعات" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all" className="bg-white hover:bg-slate-50">
                        جميع المجموعات
                      </SelectItem>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id} className="bg-white hover:bg-slate-50">
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* فلتر Premium */}
                  <Select value={filterPremium} onValueChange={setFilterPremium}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="الكل" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all" className="bg-white hover:bg-slate-50">الكل</SelectItem>
                      <SelectItem value="premium" className="bg-white hover:bg-slate-50">Premium فقط</SelectItem>
                      <SelectItem value="regular" className="bg-white hover:bg-slate-50">عادي فقط</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* فلتر Bot */}
                  <Select value={filterBot} onValueChange={setFilterBot}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="الكل" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all" className="bg-white hover:bg-slate-50">الكل</SelectItem>
                      <SelectItem value="user" className="bg-white hover:bg-slate-50">مستخدمين فقط</SelectItem>
                      <SelectItem value="bot" className="bg-white hover:bg-slate-50">بوتات فقط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {members.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">لا يوجد أعضاء مستخرجين</h3>
                <p className="text-slate-600 mb-6">ابدأ باستخراج أعضاء المجموعات من صفحة المجموعات</p>
                <Button onClick={() => window.location.href = '/groups'}>
                  الذهاب إلى المجموعات
                </Button>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">لا توجد نتائج</h3>
                <p className="text-slate-600">لا توجد أعضاء مطابقة لمعايير البحث</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map((member) => (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-3">
                      {/* الاسم والمعرف */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <User className="h-4 w-4 text-slate-500 flex-shrink-0" />
                            <h4 className="font-medium text-slate-900 truncate">
                              {getFullName(member)}
                            </h4>
                          </div>
                          {member.username && (
                            <p className="text-sm text-blue-600 mt-1">@{member.username}</p>
                          )}
                        </div>
                        <div className="flex flex-col space-y-1">
                          {member.is_premium && (
                            <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                              <Crown className="h-3 w-3 ml-1" />
                              Premium
                            </Badge>
                          )}
                          {member.is_bot && (
                            <Badge variant="secondary" className="text-xs">
                              Bot
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* رقم الهاتف */}
                      {member.phone && (
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Phone className="h-3 w-3 text-slate-500" />
                          <span className="text-xs text-slate-700" dir="ltr">{member.phone}</span>
                        </div>
                      )}

                      {/* المجموعة */}
                      {member.group && (
                        <div className="flex items-center space-x-2 rtl:space-x-reverse bg-slate-50 p-2 rounded">
                          <Users className="h-3 w-3 text-slate-500" />
                          <span className="text-xs text-slate-700 truncate">{member.group.name}</span>
                        </div>
                      )}

                      {/* معلومات إضافية */}
                      <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t">
                        <span>ID: {member.telegram_user_id}</span>
                        <span>
                          {new Date(member.extracted_at).toLocaleDateString('ar-SA', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

