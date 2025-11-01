'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Users, MessageSquare, CheckCircle2, Globe, Filter, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { ButtonLoading } from '@/components/ui/Loading'

// كلمات مفتاحية مقترحة
const SUGGESTED_KEYWORDS = [
  { category: 'تقنية', keywords: ['برمجة', 'تطوير', 'تقنية', 'ذكاء اصطناعي', 'أمن سيبراني', 'تصميم'] },
  { category: 'تسويق', keywords: ['تسويق', 'تجارة إلكترونية', 'دروبشيبينغ', 'أفلييت', 'سوشيال ميديا'] },
  { category: 'تعليم', keywords: ['تعليم', 'دورات', 'جامعة', 'لغات', 'دراسة'] },
  { category: 'أعمال', keywords: ['ريادة أعمال', 'استثمار', 'عقارات', 'فريلانس', 'وظائف'] },
  { category: 'ترفيه', keywords: ['أفلام', 'مسلسلات', 'ألعاب', 'رياضة', 'موسيقى'] },
  { category: 'صحة', keywords: ['صحة', 'رياضة', 'تغذية', 'طب', 'لياقة'] },
]

interface GlobalSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessions: any[]
  existingGroups: any[]
  onGroupsAdded: () => void
}

interface SearchResult {
  id: string
  title: string
  username?: string
  participantsCount: number
  type: 'group' | 'supergroup'
  canViewMembers: boolean
  description?: string
  isExisting?: boolean
}

export function GlobalSearchModal({ 
  open, 
  onOpenChange, 
  sessions,
  existingGroups,
  onGroupsAdded 
}: GlobalSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSession, setSelectedSession] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set())
  const [searchProgress, setSearchProgress] = useState({ current: 0, total: 0, keyword: '' })
  
  // فلاتر
  const [minMembers, setMinMembers] = useState<string>('0')
  const [hideExisting, setHideExisting] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')

  const { user } = useAuth()
  const supabase = createClient()

  const handleKeywordClick = (keyword: string) => {
    const newSelected = new Set(selectedKeywords)
    if (newSelected.has(keyword)) {
      newSelected.delete(keyword)
    } else {
      newSelected.add(keyword)
    }
    setSelectedKeywords(newSelected)
    
    // تحديث حقل البحث بالكلمات المحددة
    setSearchQuery(Array.from(newSelected).join(' '))
  }

  const clearKeywords = () => {
    setSelectedKeywords(new Set())
    setSearchQuery('')
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('يرجى إدخال كلمة بحث')
      return
    }

    if (!selectedSession) {
      setError('يرجى اختيار جلسة تيليجرام')
      return
    }

    setSearching(true)
    setError('')
    setSearchResults([])
    setSelectedGroups(new Set())
    setShowSuggestions(false)

    try {
      // تقسيم الكلمات المفتاحية
      const keywords = searchQuery.trim().split(/\s+/)
      const allResults: SearchResult[] = []
      const seenIds = new Set<string>()

      // تحديث التقدم
      setSearchProgress({ current: 0, total: keywords.length, keyword: '' })

      // البحث عن كل كلمة على حدة
      for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i]
        
        // تحديث التقدم
        setSearchProgress({ current: i + 1, total: keywords.length, keyword })
        
        try {
          const response = await fetch('/api/telegram/search-groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              sessionId: selectedSession,
              query: keyword 
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            // تحسين رسالة الخطأ لفك التشفير
            let errorMessage = data.error || 'فشل في البحث عن المجموعات'
            
            // إذا كان الخطأ متعلقاً بفك التشفير
            if (errorMessage.includes('فشل في فك تشفير') || errorMessage.includes('ENCRYPTION_KEY')) {
              setError(
                '❌ الجلسة مشفرة بمفتاح مختلف!\n\n' +
                '🔍 المشكلة:\n' +
                'الجلسة المختارة مشفرة بمفتاح مختلف عن المفتاح الحالي في .env.local\n\n' +
                '💡 الحل:\n' +
                '1. اذهب إلى صفحة الجلسات (/sessions)\n' +
                '2. احذف الجلسة التالفة\n' +
                '3. أضف الجلسة مرة أخرى مع نفس رقم الهاتف\n' +
                '4. أو تأكد من أن ENCRYPTION_KEY في .env.local مطابق للمفتاح المستخدم عند التشفير'
              )
              setSearching(false)
              return
            }
            
            // للأخطاء الأخرى، نتابع البحث عن الكلمات المتبقية
            console.error(`خطأ في البحث عن "${keyword}":`, errorMessage)
          } else if (data.groups) {
            // إضافة النتائج الجديدة فقط (تجنب التكرار)
            data.groups.forEach((group: SearchResult) => {
              if (!seenIds.has(group.id)) {
                seenIds.add(group.id)
                allResults.push({
                  ...group,
                  isExisting: existingGroups.some(g => g.telegram_id === group.id)
                })
              }
            })
          }

          // تحديث النتائج المؤقتة بعد كل بحث
          setSearchResults([...allResults])
          
        } catch (error: any) {
          console.error(`خطأ في البحث عن "${keyword}":`, error)
          // إذا كان خطأ في الاتصال، نتابع البحث عن باقي الكلمات
          if (allResults.length === 0 && keywords.length === 1) {
            setError('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى')
          }
        }
      }

      // إعادة تعيين التقدم
      setSearchProgress({ current: 0, total: 0, keyword: '' })

      if (allResults.length === 0) {
        setError('لم يتم العثور على نتائج')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSearching(false)
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
    const filteredIds = filteredResults.map(g => g.id)
    const allSelected = filteredIds.every(id => selectedGroups.has(id))
    
    if (allSelected) {
      const newSelected = new Set(selectedGroups)
      filteredIds.forEach(id => newSelected.delete(id))
      setSelectedGroups(newSelected)
    } else {
      const newSelected = new Set(selectedGroups)
      filteredIds.forEach(id => newSelected.add(id))
      setSelectedGroups(newSelected)
    }
  }

  // تطبيق الفلاتر
  const filteredResults = searchResults.filter(group => {
    // فلتر المجموعات الموجودة
    if (hideExisting && group.isExisting) return false
    
    // فلتر عدد الأعضاء
    if (group.participantsCount < parseInt(minMembers)) return false
    
    // فلتر النوع
    if (filterType !== 'all' && group.type !== filterType) return false
    
    return true
  })

  const handleAddGroups = async () => {
    if (selectedGroups.size === 0) {
      setError('يرجى اختيار مجموعة واحدة على الأقل')
      return
    }

    setAdding(true)
    setError('')

    try {
      const groupsToAdd = searchResults.filter(g => selectedGroups.has(g.id))

      const response = await fetch('/api/telegram/import-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: selectedSession,
          groups: groupsToAdd 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'فشل في إضافة المجموعات')
      }

      // تحديث القائمة وإغلاق Modal
      onGroupsAdded()
      onOpenChange(false)
      
      // إعادة تعيين
      setSearchQuery('')
      setSearchResults([])
      setSelectedGroups(new Set())
    } catch (error: any) {
      setError(error.message)
    } finally {
      setAdding(false)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedGroups(new Set())
    setError('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center text-slate-900">
            <Globe className="h-5 w-5 ml-2 text-blue-600" />
            البحث عن مجموعات جديدة في تيليجرام
          </DialogTitle>
          <DialogDescription>
            ابحث عن مجموعات جديدة وأضفها إلى قائمتك
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {/* اختيار الجلسة */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-900 flex items-center space-x-2 rtl:space-x-reverse">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span>اختر جلسة تيليجرام</span>
            </Label>
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger className="bg-white border-slate-300 hover:border-blue-500 transition-colors">
                <SelectValue placeholder="اختر جلسة للبحث..." />
              </SelectTrigger>
              <SelectContent className="max-h-64 bg-white">
                {sessions.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm bg-white">
                    لا توجد جلسات نشطة
                  </div>
                ) : (
                  sessions.map((session) => (
                    <SelectItem 
                      key={session.id} 
                      value={session.id}
                      className="cursor-pointer bg-white hover:bg-slate-50"
                    >
                      <div className="flex items-center space-x-2 rtl:space-x-reverse py-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">
                            {session.phone_number}
                          </span>
                          {session.session_name && (
                            <span className="text-xs text-slate-500">
                              {session.session_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* شريط البحث */}
          <div className="space-y-3">
            {/* عرض الكلمات المحددة */}
            {selectedKeywords.size > 0 && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-900 font-medium">الكلمات المحددة:</span>
                <div className="flex flex-wrap gap-2 flex-1">
                  {Array.from(selectedKeywords).map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
                    >
                      <span>{keyword}</span>
                      <button
                        onClick={() => handleKeywordClick(keyword)}
                        className="hover:bg-blue-700 rounded-full p-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearKeywords}
                  className="text-blue-700 hover:text-blue-900"
                >
                  مسح الكل
                </Button>
              </div>
            )}

            <div className="flex space-x-2 rtl:space-x-reverse">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="searchQuery"
                  name="searchQuery"
                  type="search"
                  autoComplete="off"
                  placeholder="ابحث عن مجموعات... أو اختر كلمات من الأسفل"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pr-10"
                  disabled={searching || !selectedSession}
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim() || !selectedSession}
              >
                {searching ? (
                  <>
                    <ButtonLoading className="ml-2" />
                    جاري البحث...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 ml-2" />
                    بحث
                  </>
                )}
              </Button>
            </div>

            {/* مؤشر التقدم */}
            {searching && searchProgress.total > 1 && (
              <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-900 font-medium">
                    جاري البحث عن: "{searchProgress.keyword}"
                  </span>
                  <span className="text-blue-700">
                    {searchProgress.current} من {searchProgress.total}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(searchProgress.current / searchProgress.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-blue-700">
                  تم العثور على {searchResults.length} مجموعة حتى الآن...
                </p>
              </div>
            )}

            {/* الفلاتر */}
            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-600 font-medium">الحد الأدنى للأعضاء</Label>
                  <Select value={minMembers} onValueChange={setMinMembers}>
                    <SelectTrigger className="bg-white border-slate-300 hover:border-blue-500 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="0" className="bg-white hover:bg-slate-50">الكل</SelectItem>
                      <SelectItem value="100" className="bg-white hover:bg-slate-50">100+</SelectItem>
                      <SelectItem value="500" className="bg-white hover:bg-slate-50">500+</SelectItem>
                      <SelectItem value="1000" className="bg-white hover:bg-slate-50">1,000+</SelectItem>
                      <SelectItem value="5000" className="bg-white hover:bg-slate-50">5,000+</SelectItem>
                      <SelectItem value="10000" className="bg-white hover:bg-slate-50">10,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-slate-600 font-medium">نوع المجموعة</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="bg-white border-slate-300 hover:border-blue-500 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all" className="bg-white hover:bg-slate-50">جميع الأنواع</SelectItem>
                      <SelectItem value="group" className="bg-white hover:bg-slate-50">مجموعة</SelectItem>
                      <SelectItem value="supergroup" className="bg-white hover:bg-slate-50">سوبر جروب</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                    <Checkbox
                      checked={hideExisting}
                      onCheckedChange={(checked) => setHideExisting(checked as boolean)}
                    />
                    <span className="text-sm text-slate-700">إخفاء المجموعات الموجودة</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* الكلمات المفتاحية المقترحة */}
          {showSuggestions && searchResults.length === 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-medium text-slate-900">كلمات مفتاحية مقترحة</h3>
                </div>
                <span className="text-xs text-slate-500">اضغط لاختيار عدة كلمات</span>
              </div>
              <div className="space-y-3">
                {SUGGESTED_KEYWORDS.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <h4 className="text-xs font-medium text-slate-600">{category.category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {category.keywords.map((keyword) => {
                        const isSelected = selectedKeywords.has(keyword)
                        return (
                          <button
                            key={keyword}
                            onClick={() => handleKeywordClick(keyword)}
                            className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-md scale-105'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                          >
                            {isSelected && '✓ '}
                            {keyword}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* رسالة الخطأ */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded whitespace-pre-line border border-red-200">
              {error}
            </div>
          )}

          {/* النتائج */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  {filteredResults.length} نتيجة {filteredResults.length !== searchResults.length && `من ${searchResults.length}`}
                </p>
                {filteredResults.length > 0 && (
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    {filteredResults.every(g => selectedGroups.has(g.id)) ? 'إلغاء الكل' : 'تحديد الكل'}
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredResults.map((group) => (
                  <div
                    key={group.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedGroups.has(group.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    } ${group.isExisting ? 'opacity-50' : ''}`}
                    onClick={() => !group.isExisting && toggleGroup(group.id)}
                  >
                    <div className="flex items-start space-x-3 rtl:space-x-reverse">
                      {!group.isExisting && (
                        <Checkbox
                          checked={selectedGroups.has(group.id)}
                          onCheckedChange={() => toggleGroup(group.id)}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 truncate">
                              {group.title}
                              {group.isExisting && (
                                <span className="mr-2 text-xs text-green-600">(موجودة مسبقاً)</span>
                              )}
                            </h4>
                            {group.username && (
                              <p className="text-sm text-blue-600">@{group.username}</p>
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
                        <div className="flex items-center space-x-4 rtl:space-x-reverse mt-2">
                          <div className="flex items-center space-x-1 rtl:space-x-reverse text-sm text-slate-600">
                            <Users className="h-4 w-4" />
                            <span>{group.participantsCount.toLocaleString()} عضو</span>
                          </div>
                          {group.canViewMembers && (
                            <span className="text-xs text-green-600 flex items-center space-x-1 rtl:space-x-reverse">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>الأعضاء ظاهرين</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* رسالة فارغة */}
          {!searching && searchResults.length === 0 && !error && !showSuggestions && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">ابحث عن مجموعات</h3>
              <p className="text-slate-600 mb-4">أدخل كلمة بحث للعثور على مجموعات جديدة</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSuggestions(true)}
              >
                <Sparkles className="h-4 w-4 ml-2" />
                عرض الكلمات المقترحة
              </Button>
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        {searchResults.length > 0 && (
          <div className="flex space-x-2 rtl:space-x-reverse pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleAddGroups}
              disabled={selectedGroups.size === 0 || adding}
              className="flex-1"
            >
              {adding ? (
                <>
                  <ButtonLoading className="ml-2" />
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                  إضافة ({selectedGroups.size})
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
