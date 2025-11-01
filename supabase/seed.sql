-- Insert sample data for development and testing

-- Note: In production, users will be created through Supabase Auth
-- This is just for development purposes

-- Insert sample teams (will be created by actual users in production)
-- INSERT INTO teams (id, name, description, owner_id) VALUES
-- ('550e8400-e29b-41d4-a716-446655440001', 'Marketing Agency Pro', 'Professional marketing agency specializing in Telegram campaigns', '550e8400-e29b-41d4-a716-446655440000'),
-- ('550e8400-e29b-41d4-a716-446655440002', 'Digital Solutions Ltd', 'Digital marketing solutions for businesses', '550e8400-e29b-41d4-a716-446655440000');

-- Insert sample team members (will be created when users join teams)
-- INSERT INTO team_members (team_id, user_id, role, invited_by) VALUES
-- ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin', NULL),
-- ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'admin', NULL);

-- Create a function to initialize user data after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a default team for the new user
  INSERT INTO public.teams (name, description, owner_id)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Team'),
    'Default team created automatically',
    NEW.id
  );
  
  -- Add the user as admin to their default team
  INSERT INTO public.team_members (team_id, user_id, role)
  SELECT id, NEW.id, 'admin'
  FROM public.teams
  WHERE owner_id = NEW.id
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to handle new user signups
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to log important actions
CREATE OR REPLACE FUNCTION public.log_action(
  action_name TEXT,
  resource_type TEXT,
  resource_id TEXT DEFAULT NULL,
  details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    action_name,
    resource_type,
    resource_id,
    details
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's teams
CREATE OR REPLACE FUNCTION public.get_user_teams()
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  team_description TEXT,
  user_role user_role,
  is_owner BOOLEAN,
  member_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.description,
    tm.role,
    (t.owner_id = auth.uid()) as is_owner,
    (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
  FROM teams t
  JOIN team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = auth.uid()
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get team statistics
CREATE OR REPLACE FUNCTION public.get_team_stats(team_uuid UUID)
RETURNS TABLE (
  total_sessions BIGINT,
  active_sessions BIGINT,
  total_groups BIGINT,
  total_campaigns BIGINT,
  running_campaigns BIGINT,
  total_members BIGINT
) AS $$
BEGIN
  -- Check if user has access to this team
  IF NOT is_team_member(team_uuid) THEN
    RAISE EXCEPTION 'Access denied to team statistics';
  END IF;
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM telegram_sessions WHERE team_id = team_uuid) as total_sessions,
    (SELECT COUNT(*) FROM telegram_sessions WHERE team_id = team_uuid AND is_active = true) as active_sessions,
    (SELECT COUNT(*) FROM groups WHERE team_id = team_uuid AND is_active = true) as total_groups,
    (SELECT COUNT(*) FROM campaigns WHERE team_id = team_uuid) as total_campaigns,
    (SELECT COUNT(*) FROM campaigns WHERE team_id = team_uuid AND status = 'running') as running_campaigns,
    (SELECT COUNT(*) FROM team_members WHERE team_id = team_uuid) as total_members;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION public.log_action(TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_teams() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_team_stats(UUID) TO authenticated;
