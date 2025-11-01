-- إضافة حقل access_hash لجدول group_members
-- هذا الحقل ضروري لإرسال رسائل تيليجرام

ALTER TABLE group_members
ADD COLUMN IF NOT EXISTS access_hash VARCHAR(255);

-- إنشاء index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_group_members_telegram_user_id 
ON group_members(telegram_user_id);

-- تعليق توضيحي
COMMENT ON COLUMN group_members.access_hash IS 'Telegram access hash required for sending messages';

