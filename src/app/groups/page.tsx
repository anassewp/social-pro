'use client'

import { useState, useEffect, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Plus, Import, RefreshCw, Trash2, Users, Calendar, Shield, Search, SlidersHorizontal, ArrowUpDown, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/hooks/useAuth'
import { useGroups } from '@/lib/hooks/useGroups'
import { useSessions } from '@/lib/hooks/useSessions'
import { useRealtimeSubscription } from '@/lib/hooks/useRealtime'
import { createClient } from '@/lib/supabase/client'
import { PageLoading, ButtonLoading } from '@/components/ui/Loading'
import { ImportGroupsModal } from '@/components/telegram/ImportGroupsModal'
import { GlobalSearchModal } from '@/components/telegram/GlobalSearchModal'
import { ExtractMembersModal } from '@/components/telegram/ExtractMembersModal'

export default function GroupsPage() {
  const [showImportModal, setShowImportModal] = useState(false)
  const [updatingGroupId, setUpdatingGroupId] = useState<string | null>(null)
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [showGlobalSearch, setShowGlobalSearch] = useState(false)
  const [showExtractModal, setShowExtractModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [deletingAllGroups, setDeletingAllGroups] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()
  
  // React Query Hooks
  const { data: groups, isLoading, error, refetch } = useGroups(user?.team_id || null)
  const { data: activeSessions } = useSessions(user?.team_id || null)

  // Real-time subscription للمجموعات
  useRealtimeSubscription('groups', user?.team_id || null, {
    enabled: !!user?.team_id,
    onInsert: () => {
      console.log('✅ New group added - refetching...')
      refetch()
    },
    onUpdate: () => {
      console.log('📝 Group updated - refetching...')
      refetch()
    },
    onDelete: () => {
      console.log('🗑️ Group deleted - refetching...')
      refetch()
    },
  })

  // Real-time subscription للأعضاء (يؤثر على member_count)
  useRealtimeSubscription('group_members', user?.team_id || null, {
    enabled: !!user?.team_id,
    onInsert: () => {
      refetch()
    },
    onDelete: () => {
      refetch()
    },
  })

  // تصفية وترتيب المجموعات (Client-side filtering)
  const filteredAndSortedGroups = useMemo(() => {
    const groupsList = groups || []
    return groupsList
      .filter(group => {
        // فلترة حسب البحث
        const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (group.username && group.username.toLowerCase().includes(searchQuery.toLowerCase()))
        
        // فلترة حسب النوع
        const matchesType = filterType === 'all' || group.type === filterType
        
        return matchesSearch && matchesType
      })
      .sort((a, b) => {
        // ترتيب حسب الخيار المحدد
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name, 'ar')
          case 'members':
            return (b.member_count || 0) - (a.member_count || 0)
          case 'created_at':
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
      })
  }, [groups, searchQuery, filterType, sortBy])
  
  const activeSessionsList = activeSessions || []
  const groupsList = groups || []

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المجموعة؟')) {
      return
    }

    setDeletingGroupId(groupId)
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId)

      if (error) {
        console.error('Error deleting group:', error)
        alert('فشل في حذف المجموعة')
      } else {
        // React Query will automatically refetch
        refetch()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ أثناء الحذف')
    } finally {
      setDeletingGroupId(null)
    }
  }

  const handleUpdateGroup = async (groupId: string) => {
    setUpdatingGroupId(groupId)
    try {
      // هنا يمكن إضافة API call لتحديث معلومات المجموعة من تيليجرام
      // في الوقت الحالي سنقوم فقط بتحديث last_sync
      const { error } = await supabase
        .from('groups')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', groupId)

      if (error) {
        console.error('Error updating group:', error)
        alert('فشل في تحديث المجموعة')
      } else {
        // React Query will automatically refetch
        refetch()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ أثناء التحديث')
    } finally {
      setUpdatingGroupId(null)
    }
  }

  const handleExtractMembers = (group: any) => {
    setSelectedGroup(group)
    setShowExtractModal(true)
  }

  const handleMembersExtracted = () => {
    // إعادة جلب المجموعات لتحديث العدد
    refetch()
  }

  const handleDeleteAllGroups = async () => {
    if (!confirm(`هل أنت متأكد من حذف جميع المجموعات (${groupsList.length} مجموعة)؟\n\n⚠️ تحذير: هذه العملية لا يمكن التراجع عنها!`)) {
      return
    }

    setDeletingAllGroups(true)
    try {
      const response = await fetch('/api/groups/delete-all', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'فشل في حذف المجموعات')
      }

      alert(`تم حذف ${data.count || groupsList.length} مجموعة بنجاح`)
      refetch()
    } catch (error: any) {
      console.error('Error deleting all groups:', error)
      alert(error.message || 'فشل في حذف المجموعات')
    } finally {
      setDeletingAllGroups(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageLoading message="جاري تحميل المجموعات..." />
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
              {error instanceof Error ? error.message : 'فشل في جلب المجموعات'}
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">المجموعات</h1>
            <p className="text-muted-foreground">إدارة مجموعات تيليجرام المستوردة</p>
          </div>
          <div className="flex space-x-2 rtl:space-x-reverse">
            {groupsList.length > 0 && (
              <Button 
                variant="destructive"
                onClick={handleDeleteAllGroups}
                disabled={deletingAllGroups}
              >
                {deletingAllGroups ? (
                  <>
                    <ButtonLoading className="ml-2" />
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف الكل
                  </>
                )}
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => activeSessionsList.length > 0 ? setShowGlobalSearch(true) : alert('يرجى إضافة جلسة تيليجرام أولاً')}
            >
              <Search className="h-4 w-4 ml-2" />
              بحث عالمي
            </Button>
            <Button onClick={() => setShowImportModal(true)}>
              <Import className="h-4 w-4 ml-2" />
              استيراد مجموعات
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <MessageSquare className="h-5 w-5 ml-2 text-blue-600" />
              مجموعاتك المستوردة ({filteredAndSortedGroups.length} من {groupsList.length})
            </CardTitle>
            <CardDescription>
              {groupsList.length === 0 ? 'لا توجد مجموعات مستوردة حتى الآن' : 'إدارة مجموعاتك المستوردة'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* شريط البحث والفلترة */}
            {groupsList.length > 0 && (
              <div className="mb-6 space-y-4">
                {/* عرض عدد النتائج */}
                {(searchQuery || filterType !== 'all' || sortBy !== 'created_at') && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-slate-600">
                      <span>عرض {filteredAndSortedGroups.length} من {groupsList.length} مجموعة</span>
                      {(searchQuery || filterType !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchQuery('')
                            setFilterType('all')
                            setSortBy('created_at')
                          }}
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          إعادة تعيين
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* البحث */}
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="ابحث عن مجموعة..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10 bg-white"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* فلترة حسب النوع */}
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="bg-white border-slate-300 hover:border-blue-500 transition-colors">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                        <SelectValue placeholder="نوع المجموعة" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all" className="bg-white hover:bg-slate-50">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <MessageSquare className="h-4 w-4 text-slate-500" />
                          <span>جميع الأنواع</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="group" className="bg-white hover:bg-slate-50">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span>مجموعة</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="supergroup" className="bg-white hover:bg-slate-50">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <span>سوبر جروب</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* الترتيب */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-white border-slate-300 hover:border-blue-500 transition-colors">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <ArrowUpDown className="h-4 w-4 text-slate-500" />
                        <SelectValue placeholder="ترتيب حسب" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="created_at" className="bg-white hover:bg-slate-50">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <span>الأحدث</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="name" className="bg-white hover:bg-slate-50">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <MessageSquare className="h-4 w-4 text-slate-500" />
                          <span>الاسم</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="members" className="bg-white hover:bg-slate-50">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Users className="h-4 w-4 text-slate-500" />
                          <span>عدد الأعضاء</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            
            {groupsList.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">ابدأ بإستيراد المجموعات</h3>
                <p className="text-slate-600 mb-6">استورد مجموعات تيليجرام لبدء حملاتك التسويقية</p>
                <Button onClick={() => setShowImportModal(true)}>
                  <Import className="h-4 w-4 ml-2" />
                  استيراد الآن
                </Button>
              </div>
            ) : filteredAndSortedGroups.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">لا توجد نتائج</h3>
                <p className="text-slate-600">لا توجد مجموعات مطابقة لمعايير البحث</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedGroups.map((group) => (
                  <Card key={group.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg text-slate-900 truncate">
                            {group.name}
                          </CardTitle>
                          {group.username && (
                            <p className="text-sm text-blue-600 mt-1">@{group.username}</p>
                          )}
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          group.type === 'supergroup' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {group.type === 'supergroup' ? 'سوبر جروب' : 'مجموعة'}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* عدد الأعضاء */}
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-700">
                          {group.member_count?.toLocaleString() || 0} عضو
                        </span>
                      </div>

                      {/* تاريخ الإضافة */}
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="text-xs text-slate-600">
                          {new Date(group.created_at).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      {/* الحالة */}
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Shield className={`h-4 w-4 ${group.is_active ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className={`text-xs font-medium ${
                          group.is_active ? 'text-green-700' : 'text-gray-500'
                        }`}>
                          {group.is_active ? 'نشطة' : 'غير نشطة'}
                        </span>
                      </div>

                      {/* أزرار الإجراءات */}
                      <div className="space-y-2 pt-2 border-t">
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleExtractMembers(group)}
                        >
                          <Users className="h-3 w-3 ml-1" />
                          استخراج الأعضاء
                        </Button>
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleUpdateGroup(group.id)}
                            disabled={updatingGroupId === group.id}
                          >
                            {updatingGroupId === group.id ? (
                              <>
                                <ButtonLoading className="ml-1" />
                                تحديث...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-3 w-3 ml-1" />
                                تحديث
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteGroup(group.id)}
                            disabled={deletingGroupId === group.id}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <ImportGroupsModal
          open={showImportModal}
          onOpenChange={setShowImportModal}
          onGroupsImported={refetch}
        />

        <GlobalSearchModal
          open={showGlobalSearch}
          onOpenChange={setShowGlobalSearch}
          sessions={activeSessionsList}
          existingGroups={groupsList}
          onGroupsAdded={refetch}
        />

        <ExtractMembersModal
          open={showExtractModal}
          onOpenChange={setShowExtractModal}
          groupId={selectedGroup?.id}
          groupName={selectedGroup?.name}
          onMembersExtracted={handleMembersExtracted}
        />
      </div>
    </DashboardLayout>
  )
}
