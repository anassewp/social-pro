# فحص إعدادات Supabase

## خطوات التحقق من المشكلة:

### 1. اختبار الاتصال
افتح: http://localhost:3000/test-auth
- اضغط "اختبار الاتصال بـ Supabase"
- يجب أن ترى "✅ الاتصال بـ Supabase يعمل بنجاح!"

### 2. فحص إعدادات Auth في Supabase
اذهب إلى لوحة تحكم Supabase:
https://jtvcvbhtorryrpnfwuzf.supabase.co

#### أ) Authentication > Settings
تأكد من:
- ✅ **Enable email confirmations**: مفعل
- ✅ **Site URL**: `http://localhost:3000`
- ✅ **Redirect URLs**: يحتوي على `http://localhost:3000/**`

#### ب) Authentication > URL Configuration
أضف هذه URLs:
```
Site URL: http://localhost:3000
Additional Redirect URLs:
http://localhost:3000
http://localhost:3000/auth/callback
http://localhost:3000/dashboard
```

### 3. فحص الجداول
اذهب إلى **Table Editor** وتأكد من وجود:
- ✅ teams
- ✅ team_members  
- ✅ telegram_sessions
- ✅ campaigns
- ✅ groups
- ✅ audit_logs

### 4. فحص RLS Policies
اذهب إلى **Authentication > Policies** وتأكد من وجود policies لكل جدول.

### 5. اختبار إنشاء حساب
في صفحة الاختبار:
1. أدخل بريد إلكتروني صحيح
2. أدخل كلمة مرور (8 أحرف على الأقل)
3. اضغط "اختبار إنشاء حساب"

## الأخطاء الشائعة وحلولها:

### خطأ "Invalid API key"
- تحقق من NEXT_PUBLIC_SUPABASE_ANON_KEY في .env.local

### خطأ "Database connection failed"  
- تحقق من NEXT_PUBLIC_SUPABASE_URL في .env.local

### خطأ "Email not confirmed"
- تحقق من إعدادات Email confirmations في Supabase

### خطأ "Signup disabled"
- تأكد من تفعيل التسجيل في Authentication > Settings

## إذا استمرت المشكلة:
1. تحقق من Console المتصفح للأخطاء
2. تحقق من Network tab في Developer Tools
3. تحقق من Logs في Supabase Dashboard
