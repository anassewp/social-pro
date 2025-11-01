# تعليمات الإعداد - SocialPro

## المرحلة الأولى: إعداد البنية التحتية ✅

تم إكمال المرحلة الأولى بنجاح! تم إنشاء:

### ✅ ما تم إنجازه:

1. **مشروع Next.js مع TypeScript**
   - إعداد Next.js 16 مع TypeScript
   - تكوين Tailwind CSS v4
   - دعم اللغة العربية (RTL)

2. **تكامل Supabase الكامل**
   - ملفات العميل والخادم
   - Middleware للمصادقة
   - تعريفات TypeScript للقاعدة

3. **قاعدة البيانات والأمان**
   - جداول قاعدة البيانات الأساسية
   - Row Level Security (RLS) policies
   - وظائف مساعدة للأمان

4. **واجهات المستخدم الأساسية**
   - صفحة تسجيل الدخول
   - صفحة التسجيل
   - لوحة التحكم الأساسية
   - مكونات UI (Button, Input, Card)

5. **نظام المصادقة**
   - Hook مخصص للمصادقة
   - إدارة الجلسات
   - حماية الصفحات

## الخطوات التالية للمطور:

### 1. إعداد Supabase (مطلوب فوراً)

```bash
# إنشاء مشروع Supabase جديد
npx supabase init
npx supabase start

# أو استخدام مشروع موجود
# قم بنسخ URL و Keys من لوحة تحكم Supabase
```

### 2. تحديث متغيرات البيئة

```env
# في ملف .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. تشغيل Migrations

```bash
# تطبيق الجداول والسياسات
npx supabase db push

# أو نسخ محتوى الملفات يدوياً:
# - supabase/migrations/001_initial_schema.sql
# - supabase/migrations/002_rls_policies.sql
# - supabase/seed.sql
```

### 4. تشغيل المشروع

```bash
npm run dev
```

### 5. اختبار النظام

1. افتح http://localhost:3000
2. سجل حساب جديد
3. تحقق من البريد الإلكتروني
4. سجل دخول
5. تحقق من لوحة التحكم

## المرحلة التالية: إدارة جلسات تيليجرام

### المطلوب للمرحلة الثانية:

1. **Telegram API Credentials**
   ```
   TELEGRAM_API_ID=your_api_id
   TELEGRAM_API_HASH=your_api_hash
   ```

2. **مفتاح التشفير**
   ```bash
   # إنشاء مفتاح تشفير عشوائي
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **تثبيت gramjs**
   ```bash
   npm install telegram
   ```

## هيكل المشروع الحالي

```
src/
├── app/
│   ├── login/page.tsx          ✅ صفحة تسجيل الدخول
│   ├── register/page.tsx       ✅ صفحة التسجيل
│   ├── dashboard/page.tsx      ✅ لوحة التحكم
│   ├── layout.tsx              ✅ Layout رئيسي
│   ├── page.tsx                ✅ صفحة إعادة توجيه
│   └── globals.css             ✅ تصميم عام
├── components/ui/              ✅ مكونات UI أساسية
├── lib/
│   ├── supabase/              ✅ تكوين Supabase
│   ├── hooks/                 ✅ React Hooks
│   ├── types/                 ✅ تعريفات TypeScript
│   ├── constants.ts           ✅ ثوابت التطبيق
│   └── utils.ts               ✅ وظائف مساعدة
└── middleware.ts              ✅ حماية الصفحات

supabase/
├── migrations/
│   ├── 001_initial_schema.sql ✅ جداول قاعدة البيانات
│   └── 002_rls_policies.sql   ✅ سياسات الأمان
├── config.toml                ✅ تكوين Supabase
└── seed.sql                   ✅ بيانات أولية
```

## ملاحظات مهمة:

1. **الأمان**: جميع الجداول محمية بـ RLS
2. **الأدوار**: نظام أدوار ثلاثي (Admin/Manager/Operator)
3. **RTL**: دعم كامل للغة العربية
4. **TypeScript**: تعريفات كاملة لقاعدة البيانات

## المشاكل المحتملة وحلولها:

### خطأ في الاتصال بـ Supabase
```bash
# تأكد من صحة المتغيرات
echo $NEXT_PUBLIC_SUPABASE_URL
```

### خطأ في RLS
```sql
-- تحقق من السياسات في Supabase Dashboard
SELECT * FROM pg_policies;
```

### خطأ في المصادقة
```bash
# تحقق من إعدادات Auth في Supabase
# Auth > Settings > Site URL
```

---

**الحالة**: المرحلة الأولى مكتملة ✅  
**التالي**: إعداد Supabase وبدء المرحلة الثانية (جلسات تيليجرام)  
**الأولوية**: عالية جداً - يجب إعداد Supabase قبل المتابعة
