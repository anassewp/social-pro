# إعداد Telegram API - SocialPro

## الخطوة 1: الحصول على API Keys

### 1. اذهب إلى Telegram API Portal
https://my.telegram.org/auth

### 2. سجل دخول برقم هاتفك
- أدخل رقم هاتفك مع رمز الدولة (+966 للسعودية)
- ستصلك رسالة تحقق على تيليجرام
- أدخل كود التحقق

### 3. إنشاء تطبيق جديد
اضغط "API development tools" واملأ:
- **App title**: SocialPro
- **Short name**: socialpro  
- **URL**: https://socialpro.com
- **Platform**: Web
- **Description**: Professional Telegram marketing platform

### 4. احفظ المفاتيح
ستحصل على:
- **API ID**: رقم (مثل: 12345678)
- **API Hash**: نص طويل (مثل: abcd1234efgh5678...)

## الخطوة 2: إضافة المفاتيح للمشروع

### في ملف .env.local أضف:
```env
# Telegram Configuration
TELEGRAM_API_ID=your_api_id_here
TELEGRAM_API_HASH=your_api_hash_here

# Encryption Key (سيتم إنشاؤه تلقائياً)
ENCRYPTION_KEY=your_32_character_encryption_key
```

### إنشاء مفتاح التشفير:
```bash
# في Terminal/PowerShell:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## الخطوة 3: تثبيت gramjs

```bash
npm install telegram
npm install @types/node
```

## الخطوة 4: اختبار الاتصال

بعد إضافة المفاتيح، سيتم إنشاء صفحة اختبار للتحقق من الاتصال.

## ملاحظات مهمة:

1. **احتفظ بالمفاتيح آمنة** - لا تشاركها مع أحد
2. **API ID و Hash خاصان بك** - لا تستخدم مفاتيح الآخرين
3. **مفتاح التشفير** مهم لحماية جلسات المستخدمين
4. **لا تضع المفاتيح في GitHub** - استخدم .env.local فقط

## التالي:
بعد إضافة المفاتيح سنبدأ تطوير:
1. نظام التحقق من رقم الهاتف
2. تشفير وحفظ الجلسات
3. واجهة إدارة الجلسات
4. استخراج المجموعات والأعضاء
