'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Smile, 
  Frown, 
  Meh,
  AlertTriangle,
  MessageCircle,
  BarChart3,
  PieChart,
  Activity,
  ThumbsUp,
  ThumbsDown,
  Users,
  Clock,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Bell,
  Calendar,
  Target
} from 'lucide-react';

interface SentimentData {
  overall: {
    sentiment: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
    score: number;
    confidence: number;
    totalMentions: number;
  };
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  trends: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
    total: number;
  }>;
  emotions: {
    joy: number;
    trust: number;
    anticipation: number;
    sadness: number;
    anger: number;
    surprise: number;
    disgust: number;
    fear: number;
  };
  topTopics: Array<{
    topic: string;
    sentiment: string;
    count: number;
    change: number;
  }>;
  influencers: Array<{
    name: string;
    influence: number;
    sentiment: string;
    followers: number;
  }>;
  realtimeMentions: Array<{
    id: string;
    text: string;
    sentiment: string;
    confidence: number;
    platform: string;
    timestamp: Date;
  }>;
}

interface PlatformData {
  platform: string;
  mentions: number;
  sentiment: number;
  trend: 'up' | 'down' | 'stable';
  topKeywords: string[];
}

interface SentimentAlert {
  id: string;
  type: 'negative_spike' | 'positive_spike' | 'mention_volume' | 'keyword_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  data: any;
}

interface SentimentAnalyzerProps {
  campaignId?: string;
  className?: string;
  realtime?: boolean;
}

export function SentimentAnalyzer({ campaignId, className, realtime = false }: SentimentAnalyzerProps) {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [platformData, setPlatformData] = useState<PlatformData[]>([]);
  const [alerts, setAlerts] = useState<SentimentAlert[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadSentimentData();
    const interval = setInterval(() => {
      if (realtime) {
        loadSentimentData();
      }
    }, 30000); // تحديث كل 30 ثانية في الوقت الفعلي

    return () => clearInterval(interval);
  }, [campaignId, selectedPeriod, realtime]);

  const loadSentimentData = async () => {
    setIsLoading(true);
    
    // محاكاة تحميل البيانات
    setTimeout(() => {
      // بيانات المشاعر
      const mockSentimentData: SentimentData = {
        overall: {
          sentiment: 'positive',
          score: 0.73,
          confidence: 0.87,
          totalMentions: 1247
        },
        distribution: {
          positive: 892,
          neutral: 234,
          negative: 121
        },
        trends: [
          { date: '2024-01-20', positive: 75, neutral: 18, negative: 7, total: 156 },
          { date: '2024-01-21', positive: 78, neutral: 15, negative: 7, total: 142 },
          { date: '2024-01-22', positive: 72, neutral: 20, negative: 8, total: 167 },
          { date: '2024-01-23', positive: 80, neutral: 15, negative: 5, total: 189 },
          { date: '2024-01-24', positive: 77, neutral: 18, negative: 5, total: 201 },
          { date: '2024-01-25', positive: 74, neutral: 20, negative: 6, total: 198 },
          { date: '2024-01-26', positive: 82, neutral: 13, negative: 5, total: 194 }
        ],
        emotions: {
          joy: 45,
          trust: 32,
          anticipation: 18,
          sadness: 3,
          anger: 2,
          surprise: 8,
          disgust: 1,
          fear: 2
        },
        topTopics: [
          { topic: 'جودة الخدمة', sentiment: 'positive', count: 234, change: 15 },
          { topic: 'سرعة التوصيل', sentiment: 'positive', count: 189, change: 12 },
          { topic: 'سعر مرتفع', sentiment: 'negative', count: 45, change: -8 },
          { topic: 'تجربة المستخدم', sentiment: 'positive', count: 156, change: 9 },
          { topic: 'دعم العملاء', sentiment: 'positive', count: 128, change: 6 }
        ],
        influencers: [
          { name: 'أحمد محمد', influence: 85, sentiment: 'positive', followers: 12500 },
          { name: 'سارة العلي', influence: 78, sentiment: 'positive', followers: 8900 },
          { name: 'خالد السعد', influence: 72, sentiment: 'neutral', followers: 15600 }
        ],
        realtimeMentions: [
          {
            id: '1',
            text: 'خدمة ممتازة وتوصيل سريع جداً! شكراً لكم',
            sentiment: 'positive',
            confidence: 0.92,
            platform: 'twitter',
            timestamp: new Date()
          },
          {
            id: '2',
            text: 'الجودة رائعة والمنتج وصل في الوقت المحدد',
            sentiment: 'positive',
            confidence: 0.89,
            platform: 'instagram',
            timestamp: new Date(Date.now() - 5000)
          },
          {
            id: '3',
            text: 'البريد الإلكتروني للخدمة لم يعمل بشكل صحيح',
            sentiment: 'negative',
            confidence: 0.85,
            platform: 'facebook',
            timestamp: new Date(Date.now() - 10000)
          }
        ]
      };

      // بيانات المنصات
      const mockPlatformData: PlatformData[] = [
        {
          platform: 'twitter',
          mentions: 456,
          sentiment: 0.76,
          trend: 'up',
          topKeywords: ['خدمة', 'توصيل', 'جودة', 'شكراً']
        },
        {
          platform: 'instagram',
          mentions: 389,
          sentiment: 0.81,
          trend: 'up',
          topKeywords: ['جميل', 'رائع', 'احترافية', 'توصية']
        },
        {
          platform: 'facebook',
          mentions: 234,
          sentiment: 0.68,
          trend: 'stable',
          topKeywords: ['سعر', 'خدمة', 'دعم', 'استفسار']
        },
        {
          platform: 'telegram',
          mentions: 168,
          sentiment: 0.73,
          trend: 'up',
          topKeywords: ['سريع', 'فعال', 'دقيق', 'مفيد']
        }
      ];

      // التنبيهات
      const mockAlerts: SentimentAlert[] = [
        {
          id: 'alert-1',
          type: 'negative_spike',
          severity: 'medium',
          title: 'ارتفاع طفيف في التعليقات السلبية',
          message: 'تم رصد 3 تعليقات سلبية في الساعة الماضية حول خدمة البريد الإلكتروني',
          timestamp: new Date(Date.now() - 300000),
          acknowledged: false,
          data: { negativeMentions: 3 }
        },
        {
          id: 'alert-2',
          type: 'mention_volume',
          severity: 'low',
          title: 'زيادة في عدد الإشارات',
          message: 'زيادة 25% في عدد الإشارات مقارنة بالمتوسط الأسبوعي',
          timestamp: new Date(Date.now() - 600000),
          acknowledged: true,
          data: { volumeIncrease: 25 }
        }
      ];

      setSentimentData(mockSentimentData);
      setPlatformData(mockPlatformData);
      setAlerts(mockAlerts);
      setLastUpdate(new Date());
      setIsLoading(false);
    }, 1000);
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
      case 'very_positive':
        return <ThumbsUp className="h-5 w-5 text-green-600" />;
      case 'negative':
      case 'very_negative':
        return <ThumbsDown className="h-5 w-5 text-red-600" />;
      default:
        return <Meh className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
      case 'very_positive':
        return 'text-green-600';
      case 'negative':
      case 'very_negative':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    const labels: Record<string, string> = {
      'very_positive': 'إيجابي جداً',
      'positive': 'إيجابي',
      'neutral': 'محايد',
      'negative': 'سلبي',
      'very_negative': 'سلبي جداً'
    };
    return labels[sentiment] || sentiment;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'negative_spike':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'positive_spike':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'mention_volume':
        return <MessageCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!sentimentData) return null;

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-pink-600" />
            تحليل المشاعر
          </h2>
          <p className="text-muted-foreground mt-2">
            تحليل مشاعر العملاء والجمهور حول حملاتك
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unacknowledgedAlerts.length > 0 && (
            <Badge variant="outline" className="text-red-600 border-red-600">
              <Bell className="h-3 w-3 mr-1" />
              {unacknowledgedAlerts.length} تنبيه
            </Badge>
          )}
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="24h">آخر 24 ساعة</option>
            <option value="7d">آخر 7 أيام</option>
            <option value="30d">آخر 30 يوم</option>
            <option value="90d">آخر 90 يوم</option>
          </select>
          <Button variant="outline" size="sm" onClick={loadSentimentData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            تحديث
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاعر العامة</CardTitle>
            {getSentimentIcon(sentimentData.overall.sentiment)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getSentimentLabel(sentimentData.overall.sentiment)}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="text-sm text-muted-foreground">
                نقاط: {((sentimentData.overall.score + 1) / 2 * 100).toFixed(0)}
              </div>
              <Badge variant="outline" className="text-xs">
                ثقة {((sentimentData.overall.confidence) * 100).toFixed(0)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإشارات</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sentimentData.overall.totalMentions.toLocaleString()}
            </div>
            <div className="text-sm text-green-600 mt-2">
              +12% من الفترة السابقة
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التوزيع</CardTitle>
            <PieChart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">إيجابي</span>
                <span>{sentimentData.distribution.positive}</span>
              </div>
              <Progress value={(sentimentData.distribution.positive / sentimentData.overall.totalMentions) * 100} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-yellow-600">محايد</span>
                <span>{sentimentData.distribution.neutral}</span>
              </div>
              <Progress value={(sentimentData.distribution.neutral / sentimentData.overall.totalMentions) * 100} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-red-600">سلبي</span>
                <span>{sentimentData.distribution.negative}</span>
              </div>
              <Progress value={(sentimentData.distribution.negative / sentimentData.overall.totalMentions) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آخر تحديث</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastUpdate.toLocaleTimeString('ar-SA', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {realtime && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Activity className="h-3 w-3 mr-1" />
                  الوقت الفعلي
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
          <TabsTrigger value="emotions">المشاعر</TabsTrigger>
          <TabsTrigger value="platforms">المنصات</TabsTrigger>
          <TabsTrigger value="realtime">الوقت الفعلي</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>المواضيع الرئيسية</CardTitle>
                <CardDescription>
                  أكثر المواضيع تداولاً وتقييمها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sentimentData.topTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          topic.sentiment === 'positive' ? 'bg-green-100' :
                          topic.sentiment === 'negative' ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                          {topic.sentiment === 'positive' ? (
                            <ThumbsUp className="h-4 w-4 text-green-600" />
                          ) : topic.sentiment === 'negative' ? (
                            <ThumbsDown className="h-4 w-4 text-red-600" />
                          ) : (
                            <Meh className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{topic.topic}</div>
                          <div className="text-sm text-gray-500">{topic.count} إشارة</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={
                          topic.change > 0 ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'
                        }>
                          {topic.change > 0 ? '+' : ''}{topic.change}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المؤثرون</CardTitle>
                <CardDescription>
                  الأشخاص ذوو التأثير العالي في النقاش
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sentimentData.influencers.map((influencer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {influencer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{influencer.name}</div>
                          <div className="text-sm text-gray-500">
                            {influencer.followers.toLocaleString()} متابع
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium">{influencer.influence}%</span>
                          {getSentimentIcon(influencer.sentiment)}
                        </div>
                        <div className="text-xs text-gray-500">تأثير</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>اتجاهات المشاعر عبر الزمن</CardTitle>
              <CardDescription>
                تطور المشاعر الإيجابية والسلبية والمحايدة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sentimentData.trends.map((trend, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        {new Date(trend.date).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{trend.positive}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Meh className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">{trend.neutral}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      <span className="text-sm">{trend.negative}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emotions Tab */}
        <TabsContent value="emotions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>المشاعر التفصيلية</CardTitle>
                <CardDescription>
                  تحليل عميق للمشاعر المختلفة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(sentimentData.emotions).map(([emotion, percentage]) => (
                    <div key={emotion} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{getEmotionLabel(emotion)}</span>
                        <span>{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع المشاعر</CardTitle>
                <CardDescription>
                  النسب المئوية للمشاعر المختلفة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(sentimentData.emotions).map(([emotion, percentage]) => (
                    <div key={emotion} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-2">
                        {getEmotionIcon(emotion)}
                      </div>
                      <div className="text-lg font-bold">{percentage}%</div>
                      <div className="text-sm text-gray-600">{getEmotionLabel(emotion)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {platformData.map((platform, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{platform.platform}</span>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(platform.trend)}
                      <Badge variant="outline" className={getSentimentColor(
                        platform.sentiment > 0.6 ? 'positive' : 
                        platform.sentiment < 0.4 ? 'negative' : 'neutral'
                      )}>
                        {((platform.sentiment + 1) / 2 * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {platform.mentions} إشارة على {platform.platform}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>المشاعر</span>
                        <span>{((platform.sentiment + 1) / 2 * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={((platform.sentiment + 1) / 2 * 100)} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">الكلمات المفتاحية الشائعة:</div>
                      <div className="flex flex-wrap gap-2">
                        {platform.topKeywords.map((keyword, kIndex) => (
                          <Badge key={kIndex} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                الإشارات في الوقت الفعلي
              </CardTitle>
              <CardDescription>
                آخر الإشارات والتعليقات من جميع المنصات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sentimentData.realtimeMentions.map((mention) => (
                  <div key={mention.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${
                      mention.sentiment === 'positive' ? 'bg-green-100' :
                      mention.sentiment === 'negative' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {getSentimentIcon(mention.sentiment)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {mention.platform}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            ثقة {((mention.confidence) * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {mention.timestamp.toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{mention.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alerts */}
      {unacknowledgedAlerts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Bell className="h-5 w-5" />
              تنبيهات مهمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unacknowledgedAlerts.map((alert) => (
                <div key={alert.id} className={`p-4 border rounded-lg ${getAlertColor(alert.severity)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getAlertIcon(alert.type)}
                      <span className="font-medium">{alert.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {alert.severity === 'critical' ? 'حرج' :
                         alert.severity === 'high' ? 'عالي' :
                         alert.severity === 'medium' ? 'متوسط' : 'منخفض'}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        تأكيد
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper functions
function getEmotionLabel(emotion: string): string {
  const labels: Record<string, string> = {
    joy: 'فرح',
    trust: 'ثقة',
    anticipation: 'توقع',
    sadness: 'حزن',
    anger: 'غضب',
    surprise: 'مفاجأة',
    disgust: 'اشمئزاز',
    fear: 'خوف'
  };
  return labels[emotion] || emotion;
}

function getEmotionIcon(emotion: string): React.ReactNode {
  switch (emotion) {
    case 'joy':
      return <Smile className="h-6 w-6 text-yellow-500" />;
    case 'sadness':
      return <Frown className="h-6 w-6 text-blue-500" />;
    case 'anger':
      return <Frown className="h-6 w-6 text-red-500" />;
    default:
      return <Meh className="h-6 w-6 text-gray-500" />;
  }
}