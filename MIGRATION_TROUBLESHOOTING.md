# 🔧 حل مشاكل Migration - "Failed to fetch"

## المشكلة
عند محاولة تنفيذ migration في Supabase Dashboard، يظهر خطأ:
```
Failed to fetch (api.supabase.com)
```

## 🔍 الأسباب المحتملة

### 1. حجم الـ SQL كبير جداً
- Supabase Dashboard قد يفشل مع SQL طويل
- **الحل**: تقسيم إلى أجزاء أصغر

### 2. مشكلة في الاتصال
- Browser/Network issues
- CORS problems
- Supabase service outage

### 3. Timeout
- SQL يستغرق وقتاً طويلاً
- Supabase Dashboard timeout

---

## ✅ الحلول

### **الحل 1: تنفيذ Migration على دفعات (موصى به) ✅**

تم تقسيم `008_performance_indexes.sql` إلى 4 أجزاء:

#### **الجزء 1: Campaigns Indexes**
```sql
-- انسخ من: supabase/migrations/008_performance_indexes_part1.sql
```
شغّله في Supabase Dashboard → انتظر حتى يكتمل ✅

#### **الجزء 2: Campaign Results Indexes**
```sql
-- انسخ من: supabase/migrations/008_performance_indexes_part2.sql
```
شغّله → انتظر حتى يكتمل ✅

#### **الجزء 3: Groups & Sessions Indexes**
```sql
-- انسخ من: supabase/migrations/008_performance_indexes_part3.sql
```
شغّله → انتظر حتى يكتمل ✅

#### **الجزء 4: Group Members & Team Members Indexes**
```sql
-- انسخ من: supabase/migrations/008_performance_indexes_part4.sql
```
شغّله → انتظر حتى يكتمل ✅

**الترتيب مهم**: نفذ الأجزاء بالترتيب (1 → 2 → 3 → 4)

---

### **الحل 2: استخدام Supabase CLI (الطريقة الأفضل)**

إذا كان لديك Supabase CLI مثبت:

```bash
# 1. Login
npx supabase login

# 2. Link to your project
npx supabase link --project-ref your-project-ref

# 3. Run migration
npx supabase db push
```

---

### **الحل 3: تنفيذ كل Index على حدة**

إذا استمرت المشكلة، نفذ كل index على حدة:

```sql
-- Index 1
CREATE INDEX IF NOT EXISTS idx_campaigns_team_status 
  ON campaigns(team_id, status);
```

انتظر حتى يكتمل ✅

```sql
-- Index 2
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at 
  ON campaigns(created_at DESC);
```

انتظر حتى يكتمل ✅

... وهكذا لكل index

---

### **الحل 4: استخدام psql (للخبراء)**

```bash
# Connect to Supabase
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run migration
\i supabase/migrations/008_performance_indexes.sql
```

---

## 📋 Checklist للتحقق

### قبل التنفيذ:
- [ ] تأكد من أن Supabase Dashboard يعمل بشكل صحيح
- [ ] تحقق من الاتصال بالإنترنت
- [ ] جرب query بسيط أولاً: `SELECT 1;`

### أثناء التنفيذ:
- [ ] نفذ كل جزء على حدة
- [ ] انتظر حتى يكتمل كل جزء قبل الانتقال للجزء التالي
- [ ] تحقق من عدم وجود أخطاء

### بعد التنفيذ:
- [ ] تحقق من وجود Indexes:
```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

---

## 🔍 التحقق من Indexes

بعد تنفيذ جميع الأجزاء، تحقق من وجود الـ Indexes:

```sql
-- عدد Indexes
SELECT COUNT(*) 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%';

-- يجب أن يكون الناتج: 14 أو أكثر
```

---

## ⚠️ ملاحظات مهمة

### 1. IF NOT EXISTS
جميع الـ CREATE INDEX statements تستخدم `IF NOT EXISTS`، لذا:
- ✅ يمكن تنفيذها عدة مرات بدون خطأ
- ✅ إذا كان Index موجود بالفعل، سيتم تخطيه

### 2. Partial Indexes
بعض Indexes تستخدم `WHERE` clause:
```sql
WHERE status = 'sent'
WHERE is_active = true
WHERE is_bot = false
```
هذه **partial indexes** - أصغر وأسرع من full indexes

### 3. Composite Indexes
بعض Indexes مركبة (عدة أعمدة):
```sql
ON campaigns(team_id, status)
```
هذه مفيدة للـ queries التي تبحث في كلا العمودين

---

## 🚨 إذا استمرت المشكلة

### 1. تحقق من Supabase Status
اذهب إلى: https://status.supabase.com

### 2. جرب من متصفح آخر
- Chrome
- Firefox
- Edge

### 3. امسح Cache و Cookies
- Ctrl + Shift + Delete
- امسح Cache و Cookies
- أعد تسجيل الدخول

### 4. استخدم Supabase CLI
```bash
npx supabase db push
```

---

## 📞 الدعم

إذا استمرت المشكلة بعد تجربة جميع الحلول:
1. تحقق من Supabase Dashboard Logs
2. راجع Browser Console (F12)
3. اتصل بدعم Supabase

---

**جرب الحل 1 أولاً (تنفيذ على دفعات) - هو الأسهل والأكثر موثوقية! ✅**

