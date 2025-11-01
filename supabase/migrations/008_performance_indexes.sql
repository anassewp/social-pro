-- Performance Indexes للتحسين من سرعة Queries

-- Campaigns: Index للبحث السريع حسب team_id و status
CREATE INDEX IF NOT EXISTS idx_campaigns_team_status 
  ON campaigns(team_id, status);

CREATE INDEX IF NOT EXISTS idx_campaigns_created_at 
  ON campaigns(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_campaigns_team_created 
  ON campaigns(team_id, created_at DESC);

-- Campaign Results: Indexes للبحث والتحليل
CREATE INDEX IF NOT EXISTS idx_campaign_results_campaign_status 
  ON campaign_results(campaign_id, status);

CREATE INDEX IF NOT EXISTS idx_campaign_results_sent_at 
  ON campaign_results(sent_at DESC) WHERE status = 'sent';

CREATE INDEX IF NOT EXISTS idx_campaign_results_target_user 
  ON campaign_results(target_user_id) WHERE status = 'sent';

-- Groups: Index للبحث حسب team و active status
CREATE INDEX IF NOT EXISTS idx_groups_team_active 
  ON groups(team_id, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_groups_telegram_id 
  ON groups(telegram_id);

-- Telegram Sessions: Index للبحث حسب team و active status
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_team_active 
  ON telegram_sessions(team_id, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_telegram_sessions_user 
  ON telegram_sessions(user_id);

-- Group Members: Indexes محسنة
CREATE INDEX IF NOT EXISTS idx_group_members_group_bot 
  ON group_members(group_id, is_bot) WHERE is_bot = false;

-- ✅ تصحيح: العمود يسمى telegram_user_id وليس telegram_id
CREATE INDEX IF NOT EXISTS idx_group_members_telegram_user_id_group 
  ON group_members(telegram_user_id, group_id);

-- Team Members: Index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_team_members_user_team 
  ON team_members(user_id, team_id);

CREATE INDEX IF NOT EXISTS idx_team_members_role 
  ON team_members(team_id, role);

-- Comments على الـ Indexes
COMMENT ON INDEX idx_campaigns_team_status IS 'تحسين البحث عن الحملات حسب الفريق والحالة';
COMMENT ON INDEX idx_campaign_results_campaign_status IS 'تحسين جلب نتائج الحملة حسب الحالة';
COMMENT ON INDEX idx_groups_team_active IS 'تحسين جلب المجموعات النشطة للفريق';

