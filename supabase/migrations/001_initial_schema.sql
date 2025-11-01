-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'operator');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'running', 'paused', 'completed', 'failed');
CREATE TYPE group_type AS ENUM ('channel', 'group', 'supergroup');

-- Create teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'operator',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES auth.users(id),
    UNIQUE(team_id, user_id)
);

-- Create telegram_sessions table
CREATE TABLE telegram_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    session_name VARCHAR(255) NOT NULL,
    encrypted_session TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, phone_number)
);

-- Create groups table
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    telegram_id VARCHAR(255) NOT NULL,
    type group_type NOT NULL,
    member_count INTEGER,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    added_by UUID NOT NULL REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, telegram_id)
);

-- Create campaigns table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    status campaign_status DEFAULT 'draft',
    message_template TEXT NOT NULL,
    target_groups JSONB NOT NULL DEFAULT '[]',
    schedule_config JSONB,
    progress JSONB DEFAULT '{"sent": 0, "failed": 0, "total": 0}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create campaign_results table
CREATE TABLE campaign_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    target_user_id VARCHAR(255),
    target_username VARCHAR(255),
    status VARCHAR(50) NOT NULL, -- 'sent', 'failed', 'blocked'
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group_members table
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    telegram_user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(20),
    is_bot BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE,
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, telegram_user_id)
);

-- Create audit_logs table for security tracking
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    team_id UUID REFERENCES teams(id),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_telegram_sessions_team_id ON telegram_sessions(team_id);
CREATE INDEX idx_telegram_sessions_user_id ON telegram_sessions(user_id);
CREATE INDEX idx_groups_team_id ON groups(team_id);
CREATE INDEX idx_campaigns_team_id ON campaigns(team_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaign_results_campaign_id ON campaign_results(campaign_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_team_id ON audit_logs(team_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_telegram_sessions_updated_at BEFORE UPDATE ON telegram_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
