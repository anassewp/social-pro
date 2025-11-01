-- إنشاء جدول Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(100) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes للبحث السريع
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_team_id ON audit_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);

-- RLS Policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: المستخدمون يمكنهم رؤية audit logs فريقهم فقط
CREATE POLICY "Users can view their team's audit logs"
  ON audit_logs FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Policy: فقط النظام يمكنه الكتابة (سيتم من server-side)
-- لا نحتاج INSERT policy لأن الكتابة من API routes

COMMENT ON TABLE audit_logs IS 'سجل التدقيق لجميع الأنشطة الحساسة في النظام';
COMMENT ON COLUMN audit_logs.action IS 'نوع الإجراء المنفذ (مثل: campaign_created, session_deleted)';
COMMENT ON COLUMN audit_logs.details IS 'تفاصيل إضافية عن الإجراء بصيغة JSON';

