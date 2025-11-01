-- Migration: إضافة session_id إلى campaign_results
-- Date: 2025-01-XX
-- Description: إضافة حقل session_id لتتبع الجلسة المستخدمة في إرسال كل رسالة

-- إضافة حقل session_id
ALTER TABLE campaign_results
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES telegram_sessions(id) ON DELETE SET NULL;

-- فهرس لتحسين الاستعلامات على session_id
CREATE INDEX IF NOT EXISTS idx_campaign_results_session_id ON campaign_results(session_id);

-- فهرس مركب للاستعلامات المعقدة
CREATE INDEX IF NOT EXISTS idx_campaign_results_session_status ON campaign_results(session_id, status) 
WHERE session_id IS NOT NULL;

COMMENT ON COLUMN campaign_results.session_id IS 'الجلسة المستخدمة لإرسال هذه الرسالة';

