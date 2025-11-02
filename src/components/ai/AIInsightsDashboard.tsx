'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Zap, 
  MessageCircle,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Heart,
  Share2,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface AIInsightsProps {
  campaignId?: string;
  className?: string;
}

interface InsightCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  description: string;
  confidence: number;
}

interface Recommendation {
  id: string;
  type: 'content' | 'timing' | 'audience' | 'budget' | 'creative';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  effort: 'low' | 'medium' | 'high';
  confidence: number;
  actionable: boolean;
}

export function AIInsightsDashboard({ campaignId, className }: AIInsightsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsightsData();
  }, [campaignId]);

  const loadInsightsData = async () => {
    setLoading(true);
    
    // محاكاة تحميل البيانات
    setTimeout(() => {
      // بيانات الإحصائيات
      setInsights([
        {
          title: 'معدل التفاعل المتوقع',
          value: '7.2%',
          change: 15.3,
          trend: 'up',
          icon: <Heart className="h-4 w-4" />,
          description: 'زيادة متوقعة بناءً على التحليلات',
          confidence: 89
        },
        {
          title: 'تحسين التحويل',
          value: '+24%',
          change: 24,
          trend: 'up',
          icon: <Target className="h-4 w-4" />,
          description: 'توقع تحسين في معدل التحويل',
          confidence: 82
        },
        {
          title: 'أفضل أوقات النشر',
          value: '8-10 مساءً',
          change: 0,
          trend: 'stable',
          icon: <Clock className="h-4 w-4" />,
          description: 'الوقت الأمثل لجمهورك',
          confidence: 91
        },
        {
          title: 'العائد المتوقع',
          value: '3.2x',
          change: 18.5,
          trend: 'up',
          icon: <DollarSign className="h-4 w-4" />,
          description: 'العائد على الاستثمار المتوقع',
          confidence: 78
        }
      ]);

      // التوصيات
      setRecommendations([
        {
          id: 'rec-1',
          type: 'content',
          title: 'تحسين جودة المحتوى',
          description: 'إضافة المزيد من المحتوى المرئي التفاعلي يمكن أن يزيد التفاعل بنسبة 40%',
          priority: 'high',
          impact: '+40% تفاعل',
          effort: 'medium',
          confidence: 85,
          actionable: true
        },
        {
          id: 'rec-2',
          type: 'timing',
          title: 'تحسين أوقات النشر',
          description: 'انشر في الساعات 8-10 مساءً لزيادة الوصول بنسبة 25%',
          priority: 'medium',
          impact: '+25% وصول',
          effort: 'low',
          confidence: 90,
          actionable: true
        },
        {
          id: 'rec-3',
          type: 'audience',
          title: 'تقسيم الجمهور',
          description: 'إنشاء شرائح دقيقة للجمهور لزيادة فعالية الاستهداف',
          priority: 'high',
          impact: '+35% فعالية',
          effort: 'high',
          confidence: 80,
          actionable: true
        }
      ]);

      // بيانات المشاعر
      setSentimentData({
        overall: 'positive',
        score: 0.73,
        total: 1247,
        positive: 892,
        negative: 234,
        neutral: 121,
        trends: [
          { date: '2024-01-01', positive: 65, negative: 20, neutral: 15 },
          { date: '2024-01-02', positive: 70, negative: 18, neutral: 12 },
          { date: '2024-01-03', positive: 68, negative: 22, neutral: 10 },
          { date: '2024-01-04', positive: 75, negative: 15, neutral: 10 },
          { date: '2024-01-05', positive: 72, negative: 18, neutral: 10 }
        ],
        emotions: {
          joy: 45,
          trust: 32,
          anticipation: 18,
          sadness: 3,
          anger: 2
        }
      });

      // بيانات الأداء
      setPerformanceData({
        current: {
          reach: 15420,
          engagement: 987,
          clicks: 456,
          conversions: 89,
          ctr: 2.95,
          conversionRate: 19.5
        },
        predicted: {
          reach: 18500,
          engagement: 1280,
          clicks: 620,
          conversions: 125,
          ctr: 3.35,
          conversionRate: 20.2
        },
        benchmarks: {
          industry: 3.2,
          competitors: 4.1,
          yourTarget: 5.0
        }
      });

      setLoading(false);
    }, 1000);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            تحليلات الذكاء الاصطناعي
          </h2>
          <p className="text-muted-foreground mt-2">
            رؤى ذكية وتوصيات لتحسين أداء حملاتك
          </p>
        </div>
        <Button variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          تقرير مفصل
        </Button>
      </div>

      {/* Key Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
              <div className="p-2 bg-blue-100 rounded-full">
                {insight.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insight.value}</div>
              <div className="flex items-center space-x-2 mt-2">
                {getTrendIcon(insight.trend)}
                <span className={`text-sm ${getTrendColor(insight.trend)}`}>
                  {insight.change > 0 ? '+' : ''}{insight.change}%
                </span>
                <Badge variant="outline" className="text-xs">
                  ثقة {insight.confidence}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {insight.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="sentiment">المشاعر</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
          <TabsTrigger value="predictions">التوقعات</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>تحليل المشاعر العام</CardTitle>
                <CardDescription>
                  تحليل مشاعر الجمهور حول حملاتك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      {sentimentData?.overall === 'positive' ? 'إيجابي' : 'محايد'}
                    </span>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">النقاط</div>
                      <div className="text-xl font-bold">
                        {((sentimentData?.score || 0) * 100).toFixed(0)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>إيجابي</span>
                      <span>{sentimentData?.positive || 0}</span>
                    </div>
                    <Progress value={((sentimentData?.positive || 0) / (sentimentData?.total || 1)) * 100} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>محايد</span>
                      <span>{sentimentData?.neutral || 0}</span>
                    </div>
                    <Progress value={((sentimentData?.neutral || 0) / (sentimentData?.total || 1)) * 100} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>سلبي</span>
                      <span>{sentimentData?.negative || 0}</span>
                    </div>
                    <Progress value={((sentimentData?.negative || 0) / (sentimentData?.total || 1)) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المؤشرات الرئيسية</CardTitle>
                <CardDescription>
                  أداء حملاتك مقارنة بالمعايير
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>الوصول</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">الحالي</div>
                      <div className="font-bold">{performanceData?.current?.reach?.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4" />
                      <span>التفاعل</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">الحالي</div>
                      <div className="font-bold">{performanceData?.current?.engagement?.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4" />
                      <span>التحويلات</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">الحالي</div>
                      <div className="font-bold">{performanceData?.current?.conversions}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sentiment Tab */}
        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>اتجاهات المشاعر</CardTitle>
                <CardDescription>
                  تطور المشاعر عبر الزمن
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sentimentData?.trends?.map((trend: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">{trend.date}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          <span>{trend.positive}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsDown className="h-4 w-4 text-red-600" />
                          <span>{trend.negative}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المشاعر السائدة</CardTitle>
                <CardDescription>
                  أكثر المشاعر تكراراً في التفاعلات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(sentimentData?.emotions || {}).map(([emotion, percentage]: [string, any]) => (
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
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>المقاييس الحالية vs المتوقعة</CardTitle>
                <CardDescription>
                  مقارنة بين الأداء الحالي والتوقعات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">الوصول الحالي</div>
                      <div className="text-xl font-bold">
                        {performanceData?.current?.reach?.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600">
                        متوقع: {performanceData?.predicted?.reach?.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">التفاعل الحالي</div>
                      <div className="text-xl font-bold">
                        {performanceData?.current?.engagement?.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600">
                        متوقع: {performanceData?.predicted?.engagement?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مقارنة المعايير</CardTitle>
                <CardDescription>
                  أداؤك مقارنة بالمعايير الصناعية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>معدل CTR</span>
                      <span>{performanceData?.current?.ctr}%</span>
                    </div>
                    <Progress value={(performanceData?.current?.ctr || 0) / 5 * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>معدل التحويل</span>
                      <span>{performanceData?.current?.conversionRate}%</span>
                    </div>
                    <Progress value={(performanceData?.current?.conversionRate || 0)} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Card key={rec.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      {rec.title}
                    </CardTitle>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {getPriorityLabel(rec.priority)}
                    </Badge>
                  </div>
                  <CardDescription>{rec.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">التأثير المتوقع</div>
                      <div className="font-semibold text-green-600">{rec.impact}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">مستوى الجهد</div>
                      <div className="font-semibold">{getEffortLabel(rec.effort)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">مستوى الثقة</div>
                      <div className="font-semibold">{rec.confidence}%</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      تطبيق التوصية
                    </Button>
                    <Button size="sm" variant="outline">
                      تفاصيل أكثر
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>توقعات الشهر القادم</CardTitle>
                <CardDescription>
                  التوقعات المبنية على البيانات التاريخية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">زيادة في التفاعل</span>
                    <span className="text-2xl font-bold text-blue-600">+28%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">تحسن في التحويل</span>
                    <span className="text-2xl font-bold text-green-600">+15%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">زيادة في الوصول</span>
                    <span className="text-2xl font-bold text-yellow-600">+22%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>العوامل المؤثرة</CardTitle>
                <CardDescription>
                  العوامل التي تؤثر على التوقعات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>جودة المحتوى</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>أوقات النشر</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>دقة الاستهداف</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
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

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    high: 'عالي',
    medium: 'متوسط',
    low: 'منخفض'
  };
  return labels[priority] || priority;
}

function getEffortLabel(effort: string): string {
  const labels: Record<string, string> = {
    low: 'منخفض',
    medium: 'متوسط',
    high: 'عالي'
  };
  return labels[effort] || effort;
}