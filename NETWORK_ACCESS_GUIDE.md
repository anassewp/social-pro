# 🌐 دليل الوصول من الشبكة المحلية

## المشكلة

عند الوصول من IP address (مثل: `http://177.88.46.98:3000`) بدلاً من `localhost`، قد لا تظهر صفحة تسجيل الدخول بسبب:

1. **Content Security Policy (CSP)** - يمنع الاتصال من origins مختلفة
2. **Cookies Domain** - بعض المتصفحات ترفض cookies من IP addresses
3. **Next.js Host Configuration** - يحتاج إعدادات خاصة

---

## ✅ الحل

### 1. تشغيل Next.js مع السماح بالوصول من الشبكة

#### الطريقة الأولى: استخدام `-H` flag

```bash
# أوقف السيرفر الحالي (Ctrl+C)
npm run dev -- -H 0.0.0.0
```

أو أضف script جديد في `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:network": "next dev -H 0.0.0.0",
    "start": "next start",
    "build": "next build",
    "lint": "eslint"
  }
}
```

ثم شغّل:
```bash
npm run dev:network
```

#### الطريقة الثانية: استخدام متغير البيئة

```bash
# Windows PowerShell
$env:HOSTNAME="0.0.0.0"; npm run dev

# Windows CMD
set HOSTNAME=0.0.0.0 && npm run dev

# Linux/Mac
HOSTNAME=0.0.0.0 npm run dev
```

---

### 2. تحديث package.json (موصى به)

```json
{
  "scripts": {
    "dev": "next dev -H 0.0.0.0",
    "dev:local": "next dev",
    "dev:network": "next dev -H 0.0.0.0",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

---

### 3. التحقق من Firewall

#### Windows:
1. افتح **Windows Defender Firewall**
2. اذهب لـ **Advanced settings**
3. أضف قاعدة **Inbound Rule**:
   - Port: `3000`
   - Protocol: `TCP`
   - Action: `Allow`

#### Linux:
```bash
# Ubuntu/Debian
sudo ufw allow 3000/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

---

### 4. التحقق من إعدادات Supabase

تأكد من أن `NEXT_PUBLIC_SUPABASE_URL` في `.env.local` يشير للـ URL الصحيح (لا يربطه بـ `localhost` فقط).

---

### 5. اختبار الوصول

#### من نفس الجهاز:
```
http://localhost:3000        ✅ يعمل
http://127.0.0.1:3000       ✅ يعمل
http://177.88.46.98:3000    ✅ يجب أن يعمل بعد الإعدادات
```

#### من جهاز آخر في نفس الشبكة:
```
http://177.88.46.98:3000    ✅ يجب أن يعمل
```

---

## 🔧 إعدادات إضافية (إذا استمرت المشكلة)

### تحديث Supabase Client Cookies (اختياري)

إذا كانت المشكلة في cookies، يمكن إضافة cookie domain configuration:

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Custom cookie handling if needed
          return document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
            ?.split('=')[1]
        },
      },
    }
  )
}
```

---

## 🚨 مشاكل محتملة وحلولها

### المشكلة 1: "ERR_CONNECTION_REFUSED"
**السبب**: السيرفر لا يستمع على `0.0.0.0`  
**الحل**: استخدم `-H 0.0.0.0` عند تشغيل السيرفر

### المشكلة 2: Cookies لا تعمل
**السبب**: بعض المتصفحات ترفض cookies من IP addresses  
**الحل**: 
- استخدم domain name بدلاً من IP (أضفه في `/etc/hosts` على Linux أو `C:\Windows\System32\drivers\etc\hosts` على Windows)
- أو استخدم HTTPS (يحتاج SSL certificate)

### المشكلة 3: CSP errors في Console
**السبب**: Content Security Policy يمنع الاتصال  
**الحل**: تم إصلاحه في `src/middleware.ts` - تأكد من restart السيرفر

### المشكلة 4: Supabase لا يعمل
**السبب**: Supabase URL مربوط بـ `localhost`  
**الحل**: تحقق من `NEXT_PUBLIC_SUPABASE_URL` في `.env.local`

---

## 📝 مثال كامل

```bash
# 1. أوقف السيرفر الحالي
# Ctrl+C

# 2. شغّل مع network access
npm run dev -- -H 0.0.0.0

# 3. يجب أن ترى:
# - Local:        http://localhost:3000
# - Network:      http://177.88.46.98:3000

# 4. افتح من متصفح:
# http://177.88.46.98:3000/login
```

---

## ✅ Checklist

- [ ] أضفت `-H 0.0.0.0` عند تشغيل السيرفر
- [ ] فتحت Port 3000 في Firewall
- [ ] تأكدت من أن IP address صحيح (استخدم `ipconfig` على Windows أو `ifconfig` على Linux)
- [ ] أعدت تشغيل السيرفر بعد تحديث `middleware.ts`
- [ ] تحققت من Console في المتصفح (F12) - لا يجب أن تكون هناك CSP errors

---

## 🎯 النتيجة المتوقعة

بعد تطبيق هذه الخطوات، يجب أن تكون قادراً على:

✅ الوصول من `http://177.88.46.98:3000/login`  
✅ الوصول من `http://177.88.46.98:3000/register`  
✅ رؤية صفحة تسجيل الدخول بشكل صحيح  
✅ عمل المصادقة بدون مشاكل

---

## 💡 نصيحة

للتطوير المحلي، يُفضل استخدام `localhost` لأنه:
- أكثر أماناً
- لا يحتاج إعدادات firewall
- cookies تعمل بشكل أفضل

استخدم IP address فقط عندما تحتاج الوصول من:
- جهاز آخر في نفس الشبكة
- اختبار على mobile device
- عرض demo للآخرين

