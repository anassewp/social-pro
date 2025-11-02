# نظام التحليلات في الوقت الفعلي (Real-time Analytics)

نظام متكامل ومتطور لتحليل البيانات في الوقت الفعلي مع واجهة تفاعلية شاملة مبنية على Next.js و React.

## الميزات الرئيسية

### 🔄 التحليلات المباشرة
- مراقبة البيانات في الوقت الفعلي مع Supabase Realtime
- تحديث تلقائي كل 10-30 ثانية
- مؤشر حالة الاتصال المباشر

### 📊 المخططات التفاعلية
- مخططات خطية للأوقات الزمنية
- مخططات أعمدة للمقارنات
- مخططات دائرية للنسب
- خرائط الحرارة للسلوك
- مخططات الأداء والموارد

### 📈 المؤشرات الرئيسية
- إجمالي الزيارات والمستخدمين
- معدلات التحويل والنقر
- درجات الأداء والاستجابة
- إحصائيات الارتداد

### 🎯 تحليلات الحملات
- تتبع أداء كل حملة
- مقارنة النتائج
- معدلات التسليم والاستجابة
- تحليل ROI

### 🔥 خرائط الحرارة
- تتبع تفاعل المستخدمين البصري
- تحليل نقاط النقر
- عرض مناطق الاهتمام
- تحسين UX

### 🚨 نظام التنبيهات
- تنبيهات فورية للمشاكل
- تصنيف حسب الخطورة
- تتبع حالة الحل
- إعدادات مخصصة

### ⚡ مراقبة الأداء
- استخدام CPU والذاكرة
- أوقات الاستجابة
- معدلات الأخطاء
- وقت التشغيل

## التثبيت والإعداد

### المتطلبات
- Node.js 18+
- Next.js 15+
- React 18+
- Supabase

### تثبيت Dependencies

```bash
npm install
# أو
yarn install
```

### إعداد Supabase

1. أنشئ مشروع جديد في Supabase
2. قم بتشغيل SQL migrations في `supabase/migrations/`
3. أعد تكوين المتغيرات البيئية في `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### تشغيل التطوير

```bash
npm run dev
```

## الاستخدام

### الصفحة الرئيسية
زر الصفحة `/analytics` لاستخدام لوحة التحكم الكاملة:

```tsx
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'

export default function AnalyticsPage() {
  return (
    <AnalyticsDashboard 
      teamId="your-team-id"
      className="w-full"
    />
  )
}
```

### مكونات منفصلة

#### مكونات البطاقات
```tsx
import { MetricsCard } from '@/components/analytics/MetricsCard'

<MetricsCard
  title="إجمالي الزيارات"
  value={15420}
  change={12.5}
  icon={Eye}
  color="blue"
  formatValue={formatNumber}
/>
```

#### المخططات الزمنية
```tsx
import { TimeSeriesChart } from '@/components/analytics/TimeSeriesChart'

<TimeSeriesChart
  teamId="team-id"
  timeframe="day"
  metric="visits"
  height={300}
  showControls={true}
/>
```

#### خرائط الحرارة
```tsx
import { HeatmapChart } from '@/components/analytics/HeatmapChart'

<HeatmapChart
  teamId="team-id"
  height={400}
  showControls={true}
/>
```

#### تحليلات الحملات
```tsx
import { CampaignAnalytics } from '@/components/analytics/CampaignAnalytics'

<CampaignAnalytics
  teamId="team-id"
  className="w-full"
/>
```

### استخدام Hooks

```tsx
import { useAnalyticsMetrics, useTimeSeriesData } from '@/lib/analytics/useAnalytics'

// جلب المؤشرات الأساسية
const { metrics, isLoading } = useAnalyticsMetrics(teamId)

// جلب البيانات الزمنية
const { timeSeriesData } = useTimeSeriesData(teamId, 'visits', 'day')
```

## هيكل المشروع

```
src/
├── app/
│   └── analytics/
│       └── page.tsx                 # صفحة التحليلات الرئيسية
├── components/
│   ├── analytics/                   # مكونات التحليلات
│   │   ├── AnalyticsDashboard.tsx  # لوحة التحكم الرئيسية
│   │   ├── MetricsCard.tsx         # بطاقات المؤشرات
│   │   ├── TimeSeriesChart.tsx     # المخططات الزمنية
│   │   ├── PerformanceChart.tsx    # مخططات الأداء
│   │   ├── HeatmapChart.tsx        # خرائط الحرارة
│   │   ├── AlertsPanel.tsx         # لوحة التنبيهات
│   │   ├── CampaignAnalytics.tsx   # تحليلات الحملات
│   │   ├── RealTimeIndicator.tsx   # مؤشر الوقت الفعلي
│   │   ├── ExportModal.tsx         # نافذة التصدير
│   │   ├── DateRangePicker.tsx     # منتقي النطاق الزمني
│   │   ├── types.ts                # تعريفات الأنواع
│   │   └── index.ts                # تصدير المكونات
│   └── ui/                         # مكونات الواجهة
│       ├── calendar.tsx            # مكون التقويم
│       ├── popover.tsx             # نافذة منبثقة
│       ├── dropdown-menu.tsx       # قائمة منسدلة
│       ├── progress.tsx            # شريط التقدم
│       └── ...
├── lib/
│   ├── analytics/                  # منطق التحليلات
│   │   ├── useAnalytics.ts         # Hooks الرئيسية
│   │   ├── analytics-utils.ts      # دوال مساعدة
│   │   └── index.ts                # تصدير الدوال
│   └── hooks/
│       └── useRealtime.ts          # Hook للوقت الفعلي
```

## قاعدة البيانات

### الجداول المطلوبة

#### analytics_metrics
```sql
CREATE TABLE analytics_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id),
  total_visits INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  active_campaigns INTEGER DEFAULT 0,
  performance_score DECIMAL(5,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  session_duration INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  returning_visitors INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### analytics_timeseries
```sql
CREATE TABLE analytics_timeseries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id),
  metric VARCHAR(50) NOT NULL,
  timeframe VARCHAR(10) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  label TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### analytics_alerts
```sql
CREATE TABLE analytics_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id),
  type VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- تفعيل RLS
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_timeseries ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_alerts ENABLE ROW LEVEL SECURITY;

-- سياسة الوصول
CREATE POLICY "Users can view own team analytics" ON analytics_metrics
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM team_members WHERE team_id = analytics_metrics.team_id
  ));
```

## التصدير والمشاركة

### تنسيقات التصدير
- **CSV**: للبيانات الجدولية
- **JSON**: للبيانات المهيكلة
- **PDF**: للتقارير المجمعة
- **XLSX**: لجداول البيانات

### مثال التصدير
```tsx
import { exportToCSV, exportToJSON } from '@/lib/analytics/analytics-utils'

const handleExport = () => {
  exportToCSV(data, 'analytics-data.csv')
  exportToJSON(data, 'analytics-data.json')
}
```

## الأداء والتحسين

### React Query
- تخزين مؤقت ذكي للبيانات
- تحديث تدريجي
- منع الطلبات المكررة

### Lazy Loading
- تحميل المكونات عند الحاجة
- تحسين الأداء الأولي

### Virtual Scrolling
- للقوائم الطويلة
- استهلاك ذاكرة منخفض

## الأمان

### تشفير البيانات
- البيانات الحساسة مشفرة
- نقل آمن عبر HTTPS

### التحقق من الصلاحيات
- RLS في Supabase
- التحقق من هوية المستخدم

### معالجة الأخطاء
- Error Boundaries
- Fallbacks للبيانات

## الاختبار

```bash
# تشغيل الاختبارات
npm test

# اختبار التغطية
npm run test:coverage

# اختبار الأداء
npm run test:performance
```

## المساهمة

1. Fork المشروع
2. أنشئ branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى Branch (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## الدعم

للحصول على الدعم أو الإبلاغ عن مشاكل:
- فتح [GitHub Issue](https://github.com/your-repo/issues)
- مراجعة [الوثائق](docs/real-time-analytics.md)

## الإصدارات

- v1.0.0 - إصدار أولي مع جميع المكونات الأساسية
- v1.1.0 - إضافة خرائط الحرارة المتقدمة
- v1.2.0 - تحسين الأداء وإضافة المزيد من المخططات

## الشكر والتقدير

شكر خاص لـ:
- [Next.js](https://nextjs.org/) - Framework React
- [Supabase](https://supabase.com/) - قاعدة البيانات
- [Recharts](https://recharts.org/) - مكتبة المخططات
- [Radix UI](https://www.radix-ui.com/) - مكونات UI

---

تم تطوير هذا النظام بعناية لتوفير تجربة تحليلات متطورة وسهلة الاستخدام. نرحب بمساهماتكم واقتراحاتكم!