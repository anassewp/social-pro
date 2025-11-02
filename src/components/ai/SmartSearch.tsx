'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  SortAsc, 
  Clock, 
  TrendingUp, 
  Star, 
  Eye,
  BarChart3,
  Tag,
  Calendar,
  Target,
  DollarSign,
  Users,
  X,
  ChevronDown,
  Lightbulb,
  History,
  BookmarkPlus,
  Download
} from 'lucide-react';

interface SearchFilters {
  status?: string[];
  platform?: string[];
  budget?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    start?: string;
    end?: string;
  };
  roi?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
}

interface SearchResult {
  id: string;
  name: string;
  type: 'campaign' | 'member' | 'group' | 'analytics';
  description?: string;
  status: string;
  score: number;
  highlights: string[];
  metadata: Record<string, any>;
  lastModified: Date;
  thumbnail?: string;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  createdAt: Date;
  lastUsed: Date;
  isPublic: boolean;
  resultCount: number;
}

interface SearchSuggestion {
  text: string;
  type: 'query' | 'filter' | 'recent';
  count?: number;
}

interface SmartSearchProps {
  onSearchResults?: (results: SearchResult[]) => void;
  initialQuery?: string;
  className?: string;
}

export function SmartSearch({ onSearchResults, initialQuery = '', className }: SmartSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSearchHistory();
    loadSavedSearches();
    loadMockResults();
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      generateSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const loadSearchHistory = () => {
    const history = [
      'حملة رمضان التسويقية',
      'تحليلات يناير 2024',
      'الحملات عالية ROI',
      'جمهور الشباب 18-25',
      'انستجرام ستوريز'
    ];
    setSearchHistory(history);
  };

  const loadSavedSearches = () => {
    const saved: SavedSearch[] = [
      {
        id: '1',
        name: 'الحملات النشطة',
        query: 'حملات نشطة',
        filters: { status: ['active'] },
        createdAt: new Date('2024-01-15'),
        lastUsed: new Date('2024-01-20'),
        isPublic: false,
        resultCount: 12
      },
      {
        id: '2',
        name: 'تحليلات الربع الأول',
        query: 'تحليلات Q1',
        filters: { dateRange: { start: '2024-01-01', end: '2024-03-31' } },
        createdAt: new Date('2024-01-10'),
        lastUsed: new Date('2024-01-22'),
        isPublic: true,
        resultCount: 8
      }
    ];
    setSavedSearches(saved);
  };

  const loadMockResults = () => {
    const mockResults: SearchResult[] = [
      {
        id: '1',
        name: 'حملة رمضان 2024',
        type: 'campaign',
        description: 'حملة تسويقية شاملة لشهر رمضان الكريم',
        status: 'نشطة',
        score: 95,
        highlights: ['ROI 3.2x', 'تفاعل عالي', 'وصول ممتاز'],
        metadata: {
          budget: 50000,
          spent: 35000,
          roi: 3.2,
          platform: ['instagram', 'telegram'],
          startDate: '2024-03-01',
          endDate: '2024-03-31'
        },
        lastModified: new Date('2024-01-22'),
        thumbnail: '/api/placeholder/100/100'
      },
      {
        id: '2',
        name: 'حملة العودة للمدارس',
        type: 'campaign',
        description: 'حملة موجهة للطلاب وأولياء الأمور',
        status: 'مجدولة',
        score: 88,
        highlights: ['استهداف دقيق', 'محتوى تعليمي'],
        metadata: {
          budget: 30000,
          roi: 2.8,
          platform: ['facebook', 'twitter'],
          startDate: '2024-08-01',
          endDate: '2024-09-30'
        },
        lastModified: new Date('2024-01-20')
      },
      {
        id: '3',
        name: 'تحليلات شهر يناير',
        type: 'analytics',
        description: 'تقرير شامل لأداء الحملات في يناير',
        status: 'مكتمل',
        score: 92,
        highlights: ['ارتفاع 25%', 'أفضل أداء'],
        metadata: {
          period: 'يناير 2024',
          totalCampaigns: 8,
          avgROI: 2.5,
          totalReach: 150000
        },
        lastModified: new Date('2024-01-31')
      }
    ];
    setResults(mockResults);
  };

  const generateSuggestions = async (searchQuery: string) => {
    // محاكاة اقتراحات ذكية
    const mockSuggestions: SearchSuggestion[] = [
      { text: `${searchQuery} عالية الأداء`, type: 'query' },
      { text: `${searchQuery} في الربع الأول`, type: 'query' },
      { text: `فلتر: حالة نشطة`, type: 'filter' },
      { text: `فلتر: ROI أعلى من 3`, type: 'filter' },
      { text: `البحث الأخير: حملات رمضان`, type: 'recent' }
    ];
    setSuggestions(mockSuggestions.slice(0, 5));
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    
    // محاكاة البحث
    setTimeout(() => {
      const filteredResults = results.filter(result => {
        const matchesQuery = result.name.toLowerCase().includes(query.toLowerCase()) ||
                            result.description?.toLowerCase().includes(query.toLowerCase()) ||
                            result.metadata.platform?.some((p: string) => 
                              p.toLowerCase().includes(query.toLowerCase())
                            );

        const matchesFilters = Object.entries(filters).every(([key, value]) => {
          if (!value || (Array.isArray(value) && value.length === 0)) return true;
          
          switch (key) {
            case 'status':
              return Array.isArray(value) ? value.includes(result.status) : value === result.status;
            case 'platform':
              return Array.isArray(value) ? 
                value.some(p => result.metadata.platform?.includes(p)) : false;
            case 'budget':
              return value && typeof value === 'object' ? 
                (value.min === undefined || result.metadata.budget >= value.min) &&
                (value.max === undefined || result.metadata.budget <= value.max) : true;
            default:
              return true;
          }
        });

        return matchesQuery && matchesFilters;
      });

      setResults(filteredResults);
      onSearchResults?.(filteredResults);
      
      // إضافة للبحث
      if (!searchHistory.includes(query)) {
        setSearchHistory(prev => [query, ...prev.slice(0, 9)]);
      }
      
      setIsSearching(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'filter') {
      setFilters(prev => ({ ...prev, status: ['active'] }));
    } else {
      setQuery(suggestion.text);
      handleSearch();
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const saveSearch = () => {
    const savedSearch: SavedSearch = {
      id: Date.now().toString(),
      name: query || 'بحث بدون اسم',
      query,
      filters,
      createdAt: new Date(),
      lastUsed: new Date(),
      isPublic: false,
      resultCount: results.length
    };
    setSavedSearches(prev => [savedSearch, ...prev]);
  };

  const loadSearch = (savedSearch: SavedSearch) => {
    setQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    handleSearch();
  };

  const deleteSavedSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== id));
  };

  const exportResults = () => {
    // محاكاة تصدير البيانات
    const data = selectedResults.length > 0 ? 
      results.filter(r => selectedResults.includes(r.id)) : 
      results;
    
    const csvContent = [
      ['الاسم', 'النوع', 'الحالة', 'النقاط', 'الميزانية', 'ROI'].join(','),
      ...data.map(r => [
        r.name,
        r.type,
        r.status,
        r.score,
        r.metadata.budget || '',
        r.metadata.roi || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'campaign': return <Target className="h-4 w-4" />;
      case 'analytics': return <BarChart3 className="h-4 w-4" />;
      case 'member': return <Users className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'campaign': return 'bg-blue-100 text-blue-800';
      case 'analytics': return 'bg-green-100 text-green-800';
      case 'member': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'نشطة': case 'active': return 'bg-green-100 text-green-800';
      case 'مجدولة': case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'مكتمل': case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث الذكي
          </CardTitle>
          <CardDescription>
            ابحث في حملاتك وبياناتك بطريقة ذكية ومتقدمة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="ابحث عن الحملات، التحليلات، أو أي شيء..."
                className="pr-20"
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'bg-blue-100' : ''}
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="text-sm font-medium mb-2">اقتراحات:</div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs"
                    >
                      {suggestion.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            {showFilters && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">الفلاتر</h3>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={clearFilters}>
                      <X className="h-3 w-3 mr-1" />
                      مسح
                    </Button>
                    <Button size="sm" variant="outline" onClick={saveSearch}>
                      <BookmarkPlus className="h-3 w-3 mr-1" />
                      حفظ
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">الحالة</label>
                    <div className="space-y-2">
                      {['active', 'scheduled', 'completed'].map(status => (
                        <label key={status} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={filters.status?.includes(status)}
                            onChange={(e) => {
                              const current = filters.status || [];
                              const updated = e.target.checked
                                ? [...current, status]
                                : current.filter(s => s !== status);
                              handleFilterChange('status', updated);
                            }}
                          />
                          <span className="text-sm">
                            {status === 'active' ? 'نشطة' : 
                             status === 'scheduled' ? 'مجدولة' : 'مكتملة'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Platform Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">المنصة</label>
                    <div className="space-y-2">
                      {['instagram', 'facebook', 'telegram', 'twitter'].map(platform => (
                        <label key={platform} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={filters.platform?.includes(platform)}
                            onChange={(e) => {
                              const current = filters.platform || [];
                              const updated = e.target.checked
                                ? [...current, platform]
                                : current.filter(p => p !== platform);
                              handleFilterChange('platform', updated);
                            }}
                          />
                          <span className="text-sm">{platform}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Budget Range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">الميزانية (ريال)</label>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="الحد الأدنى"
                        value={filters.budget?.min || ''}
                        onChange={(e) => handleFilterChange('budget', {
                          ...filters.budget,
                          min: Number(e.target.value) || undefined
                        })}
                      />
                      <Input
                        type="number"
                        placeholder="الحد الأقصى"
                        value={filters.budget?.max || ''}
                        onChange={(e) => handleFilterChange('budget', {
                          ...filters.budget,
                          max: Number(e.target.value) || undefined
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Tabs */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">الكل ({results.length})</TabsTrigger>
            <TabsTrigger value="campaigns">حملات ({results.filter(r => r.type === 'campaign').length})</TabsTrigger>
            <TabsTrigger value="analytics">تحليلات ({results.filter(r => r.type === 'analytics').length})</TabsTrigger>
            <TabsTrigger value="other">أخرى</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-2">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="relevance">الأكثر صلة</option>
            <option value="date">الأحدث</option>
            <option value="name">الاسم</option>
            <option value="score">النقاط</option>
          </select>
          <Button variant="outline" size="sm" onClick={exportResults}>
            <Download className="h-4 w-4 mr-1" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Search History & Saved Searches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="h-4 w-4" />
              آخر عمليات البحث
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {searchHistory.slice(0, 5).map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    setQuery(item);
                    handleSearch();
                  }}
                >
                  <Clock className="h-3 w-3 mr-2" />
                  {item}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BookmarkPlus className="h-4 w-4" />
              عمليات البحث المحفوظة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedSearches.slice(0, 3).map(search => (
                <div key={search.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="text-xs font-medium">{search.name}</div>
                    <div className="text-xs text-gray-500">
                      {search.resultCount} نتيجة
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => loadSearch(search)}
                    >
                      <Search className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => deleteSavedSearch(search.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              نصائح البحث
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Search className="h-3 w-3" />
                <span>استخدم الكلمات المفتاحية المحددة</span>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-3 w-3" />
                <span>طبق الفلاتر لتضييق النتائج</span>
              </div>
              <div className="flex items-center gap-2">
                <SortAsc className="h-3 w-3" />
                <span>رتب النتائج حسب الصلة</span>
              </div>
              <div className="flex items-center gap-2">
                <BookmarkPlus className="h-3 w-3" />
                <span>احفظ عمليات البحث المتكررة</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Results */}
      <Card>
        <CardContent className="p-0">
          {results.length > 0 ? (
            <div className="space-y-1">
              {results
                .filter(result => {
                  if (activeTab === 'all') return true;
                  if (activeTab === 'campaigns') return result.type === 'campaign';
                  if (activeTab === 'analytics') return result.type === 'analytics';
                  return !['campaign', 'analytics'].includes(result.type);
                })
                .map((result) => (
                <div key={result.id} className="flex items-center justify-between p-4 border-b hover:bg-gray-50">
                  <div className="flex items-center space-x-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedResults.includes(result.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedResults(prev => [...prev, result.id]);
                        } else {
                          setSelectedResults(prev => prev.filter(id => id !== result.id));
                        }
                      }}
                    />
                    
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getResultIcon(result.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium">{result.name}</h3>
                          <Badge className={getTypeColor(result.type)}>
                            {result.type === 'campaign' ? 'حملة' : 
                             result.type === 'analytics' ? 'تحليلات' : result.type}
                          </Badge>
                          <Badge className={getStatusColor(result.status)}>
                            {result.status}
                          </Badge>
                        </div>
                        
                        {result.description && (
                          <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>{result.score}% صلة</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{result.lastModified.toLocaleDateString('ar-SA')}</span>
                          </div>
                          {result.metadata.budget && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-3 w-3" />
                              <span>{result.metadata.budget.toLocaleString()} ريال</span>
                            </div>
                          )}
                          {result.metadata.roi && (
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>ROI: {result.metadata.roi}x</span>
                            </div>
                          )}
                        </div>
                        
                        {result.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {result.highlights.map((highlight, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد نتائج</h3>
              <p className="text-gray-600">جرب تعديل مصطلحات البحث أو الفلاتر</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}