-- Migration: إضافة فهارس لتحسين أداء نظام التحقق من التكرار
-- Date: 2025-01-XX
-- Description: فهارس لتحسين استعلامات التحقق من المستخدمين المكررين في الحملات

-- فهرس لـ campaign_results على target_user_id لتحسين البحث السريع
CREATE INDEX IF NOT EXISTS idx_campaign_results_user_id ON campaign_results(target_user_id);

-- فهرس مركب لتحسين الاستعلامات التي تبحث عن مستخدمين معينين في حملات فريق معين
CREATE INDEX IF NOT EXISTS idx_campaign_results_user_status ON campaign_results(target_user_id, status) 
WHERE status = 'sent';

-- فهرس على target_username أيضاً للبحث السريع
CREATE INDEX IF NOT EXISTS idx_campaign_results_username ON campaign_results(target_username) 
WHERE target_username IS NOT NULL;

-- فهرس على group_members لتحسين البحث عن الأعضاء حسب telegram_user_id
CREATE INDEX IF NOT EXISTS idx_group_members_telegram_user_id ON group_members(telegram_user_id);

-- فهرس مركب على group_members لتحسين الاستعلامات المعقدة
CREATE INDEX IF NOT EXISTS idx_group_members_group_bot ON group_members(group_id, is_bot);

COMMENT ON INDEX idx_campaign_results_user_id IS 'فهرس لتحسين البحث عن المستخدمين الذين تم إرسال رسائل إليهم مسبقاً';
COMMENT ON INDEX idx_campaign_results_user_status IS 'فهرس مركب لتحسين الاستعلامات على المستخدمين الذين تم الإرسال إليهم بنجاح';
COMMENT ON INDEX idx_campaign_results_username IS 'فهرس لتحسين البحث عن المستخدمين حسب اسم المستخدم';
COMMENT ON INDEX idx_group_members_telegram_user_id IS 'فهرس لتحسين البحث عن الأعضاء حسب معرف تيليجرام';
COMMENT ON INDEX idx_group_members_group_bot IS 'فهرس مركب لتحسين فلترة الأعضاء حسب المجموعة والبوت';

