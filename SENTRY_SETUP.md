# إعداد Sentry Error Monitoring

تم إضافة تكامل Sentry للنظام مع fallback آمن. النظام يعمل بشكل طبيعي حتى بدون إعداد Sentry.

## الميزات

✅ **Safe Fallback**: النظام يعمل بشكل طبيعي حتى لو لم يتم تكوين Sentry
✅ **Production Only**: Sentry يعمل فقط في production environment
✅ **Error Filtering**: يتم تصفية الأخطاء غير المهمة تلقائياً
✅ **Performance Monitoring**: تتبع 10% من المعاملات لمراقبة الأداء

## الإعداد

### 1. الحصول على Sentry DSN

1. إنشاء حساب على [Sentry.io](https://sentry.io)
2. إنشاء مشروع جديد (Next.js)
3. نسخ DSN من إعدادات المشروع

### 2. إضافة Environment Variable

أضف في `.env.local`:

```env
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

**ملاحظة**: بدون هذا المتغير، النظام يعمل بشكل طبيعي بدون Sentry (safe fallback).

### 3. (اختياري) إضافة App Version

```env
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## كيفية العمل

### تلقائياً
- ✅ جميع الأخطاء في API routes تُرسل تلقائياً
- ✅ جميع الأخطاء في React Components (Error Boundary) تُرسل تلقائياً
- ✅ جميع الأخطاء في Logger تُرسل تلقائياً

### يدوياً

```typescript
import { captureException, captureMessage } from '@/lib/monitoring/sentry'

// إرسال exception
try {
  // some code
} catch (error) {
  captureException(error as Error, { context: 'additional info' })
}

// إرسال message
captureMessage('Something important happened', 'info', { userId: '123' })
```

## الأخطاء التي يتم تصفيتها

- ✅ Hydration errors (شائعة في Next.js)
- ✅ Darkreader warnings
- ✅ Timeout errors (سلوك متوقع)

## التحقق من العمل

1. تأكد من وجود `NEXT_PUBLIC_SENTRY_DSN` في `.env.local`
2. شغل `npm run build` و`npm start` (production mode)
3. افتح صفحة بها خطأ متعمد
4. تحقق من Sentry dashboard - يجب أن يظهر الخطأ

## Troubleshooting

### Sentry لا يرسل الأخطاء
- تأكد من أنك في production mode (`NODE_ENV=production`)
- تأكد من وجود `NEXT_PUBLIC_SENTRY_DSN` في environment variables
- تحقق من console للأخطاء (Sentry يطبع أخطاءه في console عند الفشل)

### النظام لا يعمل بعد إضافة Sentry
- النظام مصمم ليعمل بدون Sentry أيضاً
- إذا كان هناك مشكلة، تحقق من console للأخطاء
- يمكنك حذف `NEXT_PUBLIC_SENTRY_DSN` لإيقاف Sentry مؤقتاً

