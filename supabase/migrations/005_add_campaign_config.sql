-- Migration: إضافة حقل campaign_config للإعدادات المتقدمة
-- Date: 2025-01-XX
-- Description: إضافة حقل JSONB لحفظ إعدادات الحملة المتقدمة (member selection, timing, sessions, anti-detection)

-- إضافة حقل campaign_config
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS campaign_config JSONB;

-- فهرس لتحسين الاستعلامات على campaign_config
CREATE INDEX IF NOT EXISTS idx_campaigns_config ON campaigns USING GIN (campaign_config);

COMMENT ON COLUMN campaigns.campaign_config IS 'إعدادات الحملة المتقدمة: member_selection, timing, sessions, anti_detection, dedup';

