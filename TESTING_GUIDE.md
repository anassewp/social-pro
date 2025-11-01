# دليل الاختبار للتحسينات

## المراحل المكتملة

### ✅ المرحلة 1: Error Monitoring
**ما تم إضافته:**
- Sentry integration مع fallback آمن
- تكوين Client, Server, Edge

**كيفية الاختبار:**
1. **بدون Sentry (default behavior):**
   - شغل التطبيق: `npm run dev`
   - افتح أي صفحة - يجب أن يعمل بشكل طبيعي
   - لا توجد أخطاء في console

2. **مع Sentry (production):**
   - أضف `NEXT_PUBLIC_SENTRY_DSN` في `.env.local`
   - شغل: `npm run build && npm start`
   - افتح صفحة بها خطأ متعمد
   - تحقق من Sentry dashboard

**التحقق:**
- ✅ النظام يعمل بدون Sentry
- ✅ لا توجد breaking changes
- ✅ الأخطاء تُسجل في console (fallback)

---

### ✅ المرحلة 2: توحيد Error Handling
**ما تم تحديثه:**
- `campaigns/pause` - يستخدم `withErrorHandler`
- `campaigns/delete` - يستخدم `withErrorHandler`
- `campaigns/create` - يستخدم `errorHandler`

**كيفية الاختبار:**
1. **اختبار pause/resume:**
   ```bash
   # POST /api/campaigns/pause
   curl -X POST http://localhost:3000/api/campaigns/pause \
     -H "Content-Type: application/json" \
     -d '{"campaignId": "invalid", "action": "pause"}'
   ```
   - يجب أن يرجع validation error موحد

2. **اختبار delete:**
   ```bash
   # DELETE /api/campaigns/delete
   curl -X DELETE http://localhost:3000/api/campaigns/delete \
     -H "Content-Type: application/json" \
     -d '{"campaignId": "invalid"}'
   ```
   - يجب أن يرجع validation error موحد

3. **اختبار create:**
   ```bash
   # POST /api/campaigns/create
   curl -X POST http://localhost:3000/api/campaigns/create \
     -H "Content-Type: application/json" \
     -d '{"name": ""}'
   ```
   - يجب أن يرجع validation error موحد

**التحقق:**
- ✅ جميع الـ responses لها نفس البنية
- ✅ رسائل الأخطاء موحدة
- ✅ Status codes صحيحة

---

### ✅ المرحلة 3: Service Layer
**ما تم إضافته:**
- `campaign.service.ts` مع functions:
  - `createCampaign`
  - `getCampaignById`
  - `updateCampaignStatus`
  - `deleteCampaign`

**كيفية الاختبار:**
1. **اختبار Create Campaign:**
   - استخدم نفس API endpoint
   - يجب أن يعمل بنفس الطريقة
   - التحقق من أن النتيجة صحيحة

2. **اختبار Update Status:**
   - استخدم pause/resume API
   - يجب أن يعمل بنفس الطريقة
   - التحقق من تحديث الحالة في DB

3. **اختبار Delete:**
   - استخدم delete API
   - يجب أن يعمل بنفس الطريقة
   - التحقق من حذف الحملة من DB

**التحقق:**
- ✅ API routes تستخدم Services
- ✅ منطق العمل منفصل
- ✅ لا توجد breaking changes

---

## اختبار شامل

### 1. اختبار End-to-End
```bash
# 1. إنشاء حملة
curl -X POST http://localhost:3000/api/campaigns/create \
  -H "Content-Type: application/json" \
  -d @test-campaign.json

# 2. إيقاف الحملة
curl -X POST http://localhost:3000/api/campaigns/pause \
  -H "Content-Type: application/json" \
  -d '{"campaignId": "...", "action": "pause"}'

# 3. حذف الحملة
curl -X DELETE http://localhost:3000/api/campaigns/delete \
  -H "Content-Type: application/json" \
  -d '{"campaignId": "..."}'
```

### 2. اختبار الأخطاء
- Invalid input → Validation error
- Missing campaign → NotFound error
- Database error → Internal error مع logging

### 3. اختبار Backward Compatibility
- ✅ جميع الـ API endpoints تعمل كما قبل
- ✅ Response format لم يتغير
- ✅ لا توجد breaking changes

---

## ملاحظات مهمة

1. **Error Monitoring**: اختياري - النظام يعمل بدونه
2. **Error Handling**: موحد الآن - نفس البنية في جميع الـ responses
3. **Service Layer**: منطق منفصل - سهولة الاختبار والصيانة

---

## المشاكل المحتملة

### إذا كان Sentry لا يعمل:
- ✅ هذا طبيعي - النظام يعمل بدون Sentry
- لإصلاح: أضف `NEXT_PUBLIC_SENTRY_DSN` في `.env.local`

### إذا كان هناك أخطاء TypeScript:
- ✅ الأخطاء موجودة في ملفات أخرى (ليست من التحسينات)
- التحسينات لا تحتوي على أخطاء TypeScript

### إذا كان API لا يعمل:
- ✅ تحقق من environment variables
- ✅ تحقق من Supabase connection
- ✅ تحقق من console للأخطاء
