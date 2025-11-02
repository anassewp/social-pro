# SocialPro - منصة التسويق الاحترافية عبر تيليجرام

منصة تسويق احترافية متكاملة مصممة للوكالات التسويقية لإدارة حملات تيليجرام بكفاءة عالية وأمان محكم مع نظام Loading States محسن ومتقدم.

## 🚀 المميزات الرئيسية

### 🎨 **نظام Loading States محسن**
- **مؤشرات تقدم متقدمة**: Linear, Circular, Steps, Infinite مع دعم كامل للعربية
- **تأثيرات Shimmer متنوعة**: 5 أنواع مختلفة (Wave, Pulse, Scan, Gradient, Dots)
- **تحميل تكيفي ذكي**: تكيف مع نوع الشبكة (2G, 3G, 4G, 5G) و Save Data
- **آليات إعادة المحاولة**: Exponential Backoff مع كشف الأخطاء القابلة للإعادة
- **Loading Context**: إدارة مركزية لحالات التحميل في جميع أنحاء التطبيق
- **Skeleton Screens**: استبدال Spinners بواجهات هيكلية جذابة

### 🔐 **إدارة الجلسات الآمنة**: تشفير وتخزين جلسات تيليجرام بأمان عالي
### 👥 **نظام الفرق والأدوار**: دعم الوكالات متعددة المستخدمين مع صلاحيات متدرجة
### 📊 **استخراج الأعضاء**: استخراج وتنظيم أعضاء المجموعات بذكاء
### 📢 **الحملات التسويقية**: تنفيذ حملات متطورة مع تتبع فوري
### 📈 **التحليلات الشاملة**: رؤى مفصلة وتقارير احترافية
### 🛡️ **الأمان المتقدم**: Row Level Security وتشفير البيانات

## 🛠️ التقنيات المستخدمة

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Telegram Integration**: gramjs
- **UI Components**: Radix UI + shadcn/ui + **نظام Loading States محسن**
- **Icons**: Lucide React
- **Styling**: Tailwind CSS + class-variance-authority
- **Loading States**: React Context + Custom Hooks + Network Detection
- **Testing**: Jest + React Testing Library + Accessibility Testing

## 📋 المتطلبات الأساسية

- Node.js 18+ 
- npm أو yarn
- حساب Supabase
- Telegram API credentials (api_id, api_hash)

## ⚡ التثبيت والإعداد

### 1. استنساخ المشروع
```bash
git clone <repository-url>
cd social-pro
```

### 2. تثبيت التبعيات
```bash
npm install
```

### 3. إعداد متغيرات البيئة
انسخ ملف `.env.example` إلى `.env.local` وأضف القيم المطلوبة:

```bash
cp .env.example .env.local
```

املأ المتغيرات التالية:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Telegram Configuration
TELEGRAM_API_ID=your_telegram_api_id
TELEGRAM_API_HASH=your_telegram_api_hash

# Encryption Key
ENCRYPTION_KEY=your_32_character_encryption_key

# Loading States Configuration
NEXT_PUBLIC_LOADING_TIMEOUT=10000
NEXT_PUBLIC_LOADING_RETRY_MAX=3
NEXT_PUBLIC_SLOW_CONNECTION_THRESHOLD=2
NEXT_PUBLIC_FAST_CONNECTION_THRESHOLD=10
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### 4. إعداد قاعدة البيانات
```bash
# تشغيل migrations
npx supabase db push

# تشغيل seed data (اختياري)
npx supabase db seed
```

### 5. تشغيل المشروع
```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

## 🏗️ بنية المشروع

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # صفحات المصادقة
│   ├── dashboard/         # لوحة التحكم الرئيسية
│   ├── teams/             # إدارة الفرق
│   ├── sessions/          # إدارة جلسات تيليجرام
│   ├── campaigns/         # إدارة الحملات
│   └── analytics/         # التحليلات والتقارير
├── components/            # مكونات React قابلة للإعادة
│   ├── ui/               # مكونات UI الأساسية
│   ├── auth/             # مكونات المصادقة
│   ├── dashboard/        # مكونات لوحة التحكم
│   └── forms/            # مكونات النماذج
├── lib/                  # مكتبات ووظائف مساعدة
│   ├── supabase/         # تكوين Supabase
│   ├── types/            # تعريفات TypeScript
│   ├── utils/            # وظائف مساعدة
│   └── hooks/            # React Hooks مخصصة
└── styles/               # ملفات التصميم
```

## 🔐 الأمان والخصوصية

- **Row Level Security (RLS)**: حماية البيانات على مستوى الصفوف
- **تشفير الجلسات**: تشفير جلسات تيليجرام قبل التخزين
- **مصادقة آمنة**: استخدام Supabase Auth مع JWT
- **سجل التدقيق**: تتبع جميع الأنشطة الحساسة
- **صلاحيات متدرجة**: نظام أدوار محكم (Admin/Manager/Operator)

## 🚀 النشر

### Vercel (موصى به)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=.next
```

## 📚 الوثائق

- [دليل المطور](./docs/developer-guide.md)
- [دليل المستخدم](./docs/user-guide.md)
- [API Reference](./docs/api-reference.md)
- [أمثلة الاستخدام](./docs/examples.md)
- **Loading States Optimization**:
  - [دليل التحسين الشامل](./docs/loading-states-optimization.md)
  - [إعدادات التكوين](./docs/loading-states-configuration.md)
  - [أمثلة تطبيقية](./docs/examples/LoadingStatesExamples.tsx)
  - [اختبارات شاملة](../tests/components/loading/loading.test.tsx)

## 🤝 المساهمة

نرحب بالمساهمات! يرجى قراءة [دليل المساهمة](./CONTRIBUTING.md) قبل البدء.

## 📄 الترخيص

هذا المشروع مرخص تحت [MIT License](./LICENSE).

## 🆘 الدعم

- [Issues](https://github.com/your-repo/social-pro/issues)
- [Discussions](https://github.com/your-repo/social-pro/discussions)
- البريد الإلكتروني: support@socialpro.com

## 🎨 **نظام Loading States المتقدم**

### مثال سريع / Quick Example

```tsx
import { 
  ProgressIndicator, 
  CardLoader, 
  AdaptiveLoading,
  useLoadingState 
} from '@/components/ui/loading'

// Progress Indicator
<ProgressIndicator
  progress={75}
  status="جاري التحميل..."
  variant="primary"
/>

// Adaptive Loading
<AdaptiveLoading
  isLoading={isLoading}
  priority="high"
  networkAware={true}
>
  <YourComponent />
</AdaptiveLoading>

// Smart Loading State
const { isLoading, startLoading, completeLoading } = useLoadingState('my-operation')
```

### المميزات الرئيسية

- ✅ **دعم كامل للعربية**: جميع الرسائل والنصوص
- ✅ **تكيف ذكي مع الشبكة**: كشف نوع الاتصال وتحسين الأداء
- ✅ **تأثيرات بصرية جذابة**: Shimmer effects متنوعة ومتقدمة
- ✅ **آليات إعادة المحاولة**: Exponential Backoff مع كشف الأخطاء
- ✅ **Loading Context**: إدارة مركزية لحالات التحميل
- ✅ **اختبارات شاملة**: 100% coverage مع accessibility testing
- ✅ **أداء محسن**: Memory management و lazy loading

### الملفات الرئيسية

```
src/
├── components/ui/loading/           # مكونات Loading محسنة
│   ├── ProgressIndicator.tsx       # مؤشرات التقدم
│   ├── ShimmerEffect.tsx          # تأثيرات التوهج
│   ├── AdaptiveLoading.tsx        # تحميل تكيفي
│   ├── CardTableLoaders.tsx       # محملات البطاقات والجداول
│   ├── ContextAwareLoading.tsx    # Loading مدرك للسياق
│   └── RetryMechanisms.tsx        # آليات إعادة المحاولة
├── hooks/                          # Hooks محسنة
│   ├── useAdaptiveLoading.ts      # Hook للتحميل التكيفي
│   ├── useLoadingState.ts         # Hook لإدارة حالة التحميل
│   └── useNetworkDetection.ts     # Hook لكشف الشبكة
└── tests/components/loading/       # اختبارات شاملة
    └── loading.test.tsx           # ملف الاختبارات الرئيسي
```

### الاستخدام السريع

```tsx
// إعداد Provider في app/layout.tsx
import { LoadingProvider } from '@/components/ui/loading'

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </body>
    </html>
  )
}
```

للمزيد من التفاصيل والأمثلة المتقدمة، راجع [دليل Loading States](./docs/loading-states-optimization.md)

## 🗺️ خارطة الطريق

- [x] المرحلة 1: إعداد البنية التحتية
- [x] المرحلة 2: نظام المصادقة والأدوار
- [ ] المرحلة 3: إدارة جلسات تيليجرام
- [ ] المرحلة 4: استخراج الأعضاء
- [ ] المرحلة 5: نظام الحملات
- [ ] المرحلة 6: التحليلات والتقارير

## 📊 الإحصائيات

![GitHub stars](https://img.shields.io/github/stars/your-repo/social-pro)
![GitHub forks](https://img.shields.io/github/forks/your-repo/social-pro)
![GitHub issues](https://img.shields.io/github/issues/your-repo/social-pro)
![GitHub license](https://img.shields.io/github/license/your-repo/social-pro)

---

**SocialPro** - تطوير الوكالات التسويقية إلى المستوى التالي 🚀
