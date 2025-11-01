-- Enable Row Level Security on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is team member
CREATE OR REPLACE FUNCTION is_team_member(team_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM team_members 
        WHERE team_id = team_uuid 
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's role in team
CREATE OR REPLACE FUNCTION get_user_role_in_team(team_uuid UUID)
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role FROM team_members 
        WHERE team_id = team_uuid 
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin or manager in team
CREATE OR REPLACE FUNCTION is_team_admin_or_manager(team_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM team_members 
        WHERE team_id = team_uuid 
        AND user_id = auth.uid()
        AND role IN ('admin', 'manager')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Teams policies
CREATE POLICY "Users can view teams they are members of" ON teams
    FOR SELECT USING (
        owner_id = auth.uid() OR is_team_member(id)
    );

CREATE POLICY "Users can create teams" ON teams
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team owners can update their teams" ON teams
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Team owners can delete their teams" ON teams
    FOR DELETE USING (owner_id = auth.uid());

-- Team members policies
CREATE POLICY "Users can view team members of their teams" ON team_members
    FOR SELECT USING (is_team_member(team_id));

CREATE POLICY "Team admins and managers can invite members" ON team_members
    FOR INSERT WITH CHECK (is_team_admin_or_manager(team_id));

CREATE POLICY "Team admins and managers can update member roles" ON team_members
    FOR UPDATE USING (
        is_team_admin_or_manager(team_id) AND 
        user_id != auth.uid() -- Can't change own role
    );

CREATE POLICY "Team admins and managers can remove members" ON team_members
    FOR DELETE USING (
        is_team_admin_or_manager(team_id) AND 
        user_id != auth.uid() -- Can't remove themselves
    );

CREATE POLICY "Users can leave teams" ON team_members
    FOR DELETE USING (user_id = auth.uid());

-- Telegram sessions policies
CREATE POLICY "Users can view sessions in their teams" ON telegram_sessions
    FOR SELECT USING (is_team_member(team_id));

CREATE POLICY "Users can create sessions in their teams" ON telegram_sessions
    FOR INSERT WITH CHECK (
        is_team_member(team_id) AND user_id = auth.uid()
    );

CREATE POLICY "Users can update their own sessions" ON telegram_sessions
    FOR UPDATE USING (
        user_id = auth.uid() AND is_team_member(team_id)
    );

CREATE POLICY "Users can delete their own sessions" ON telegram_sessions
    FOR DELETE USING (
        user_id = auth.uid() AND is_team_member(team_id)
    );

-- Groups policies
CREATE POLICY "Users can view groups in their teams" ON groups
    FOR SELECT USING (is_team_member(team_id));

CREATE POLICY "Users can add groups to their teams" ON groups
    FOR INSERT WITH CHECK (
        is_team_member(team_id) AND added_by = auth.uid()
    );

CREATE POLICY "Team members can update groups" ON groups
    FOR UPDATE USING (is_team_member(team_id));

CREATE POLICY "Team admins and managers can delete groups" ON groups
    FOR DELETE USING (is_team_admin_or_manager(team_id));

-- Campaigns policies
CREATE POLICY "Users can view campaigns in their teams" ON campaigns
    FOR SELECT USING (is_team_member(team_id));

CREATE POLICY "Users can create campaigns in their teams" ON campaigns
    FOR INSERT WITH CHECK (
        is_team_member(team_id) AND created_by = auth.uid()
    );

CREATE POLICY "Campaign creators and team managers can update campaigns" ON campaigns
    FOR UPDATE USING (
        is_team_member(team_id) AND 
        (created_by = auth.uid() OR is_team_admin_or_manager(team_id))
    );

CREATE POLICY "Campaign creators and team managers can delete campaigns" ON campaigns
    FOR DELETE USING (
        is_team_member(team_id) AND 
        (created_by = auth.uid() OR is_team_admin_or_manager(team_id))
    );

-- Campaign results policies
CREATE POLICY "Users can view campaign results in their teams" ON campaign_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_results.campaign_id 
            AND is_team_member(campaigns.team_id)
        )
    );

CREATE POLICY "System can insert campaign results" ON campaign_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_results.campaign_id 
            AND is_team_member(campaigns.team_id)
        )
    );

-- Group members policies
CREATE POLICY "Users can view group members in their teams" ON group_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM groups 
            WHERE groups.id = group_members.group_id 
            AND is_team_member(groups.team_id)
        )
    );

CREATE POLICY "System can insert group members" ON group_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM groups 
            WHERE groups.id = group_members.group_id 
            AND is_team_member(groups.team_id)
        )
    );

CREATE POLICY "Team members can update group members" ON group_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM groups 
            WHERE groups.id = group_members.group_id 
            AND is_team_member(groups.team_id)
        )
    );

-- Audit logs policies
CREATE POLICY "Users can view audit logs for their teams" ON audit_logs
    FOR SELECT USING (
        user_id = auth.uid() OR 
        (team_id IS NOT NULL AND is_team_admin_or_manager(team_id))
    );

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true); -- System needs to log everything

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION is_team_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role_in_team(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_team_admin_or_manager(UUID) TO authenticated;
