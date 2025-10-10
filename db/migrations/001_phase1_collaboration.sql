-- Phase 1: Foundation - Collaboration Features Migration
-- This migration adds tables and columns needed for Phase 1 collaboration features

-- ============================================
-- 1. UPDATE USERS TABLE - Add new roles
-- ============================================
ALTER TABLE users 
    DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
    ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'manager', 'agronomist', 'consultant', 'viewer'));

COMMENT ON COLUMN users.role IS 'User role: user (basic), admin (full access), manager (farm management), agronomist (crop expertise), consultant (advisory), viewer (read-only)';

-- ============================================
-- 2. UPDATE TASKS TABLE - Add assignment and tracking fields
-- ============================================
ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS estimated_duration INTEGER, -- in hours
    ADD COLUMN IF NOT EXISTS actual_duration INTEGER, -- in hours
    ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add priority 'critical' to existing check constraint
ALTER TABLE tasks 
    DROP CONSTRAINT IF EXISTS tasks_priority_check;

ALTER TABLE tasks
    ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high', 'critical'));

-- Create indexes for new task fields
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- ============================================
-- 3. CREATE CHANGE LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS change_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('farm-plan', 'crop-plan', 'task', 'financial-data', 'document')),
    target_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'approved', 'rejected')),
    field VARCHAR(255),
    old_value TEXT,
    new_value TEXT,
    description TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB -- For additional context (IP, device, etc.)
);

-- Create indexes for change log
CREATE INDEX IF NOT EXISTS idx_change_log_target ON change_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_change_log_user ON change_log(user_id);
CREATE INDEX IF NOT EXISTS idx_change_log_timestamp ON change_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_change_log_action ON change_log(action);

COMMENT ON TABLE change_log IS 'Audit trail tracking all changes to plans, tasks, and data';

-- ============================================
-- 4. CREATE USER PERMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_plan_id UUID NOT NULL REFERENCES farm_plans(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'manager', 'agronomist', 'consultant', 'viewer', 'custom')),
    can_view BOOLEAN DEFAULT true,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_approve BOOLEAN DEFAULT false,
    can_invite BOOLEAN DEFAULT false,
    custom_permissions JSONB, -- For granular custom permissions
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, farm_plan_id)
);

-- Create indexes for permissions
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_farm_plan ON user_permissions(farm_plan_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_role ON user_permissions(role);

COMMENT ON TABLE user_permissions IS 'Granular permissions for users on specific farm plans';

-- ============================================
-- 5. CREATE ONLINE USERS TABLE (for real-time collaboration)
-- ============================================
CREATE TABLE IF NOT EXISTS online_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    farm_plan_id UUID REFERENCES farm_plans(id) ON DELETE CASCADE,
    current_section VARCHAR(255), -- What section they're viewing
    action VARCHAR(50) CHECK (action IN ('viewing', 'editing', 'commenting')),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(255) NOT NULL,
    UNIQUE(user_id, session_id)
);

-- Create indexes for online users
CREATE INDEX IF NOT EXISTS idx_online_users_user ON online_users(user_id);
CREATE INDEX IF NOT EXISTS idx_online_users_farm_plan ON online_users(farm_plan_id);
CREATE INDEX IF NOT EXISTS idx_online_users_last_activity ON online_users(last_activity DESC);

COMMENT ON TABLE online_users IS 'Track currently online users and their activity for real-time collaboration';

-- ============================================
-- 6. CREATE NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL CHECK (type IN ('task-assigned', 'approval-requested', 'approval-completed', 'mention', 'deadline-approaching', 'workflow-update', 'message', 'alert')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    context_type VARCHAR(50),
    context_id UUID,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    action_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

COMMENT ON TABLE notifications IS 'System notifications for users about tasks, approvals, and other events';

-- ============================================
-- 7. ADD UPDATED_AT TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to user_permissions
DROP TRIGGER IF EXISTS update_user_permissions_updated_at ON user_permissions;
CREATE TRIGGER update_user_permissions_updated_at
    BEFORE UPDATE ON user_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. CREATE FUNCTION TO LOG CHANGES
-- ============================================
CREATE OR REPLACE FUNCTION log_change(
    p_target_type VARCHAR(50),
    p_target_id UUID,
    p_user_id UUID,
    p_user_name VARCHAR(255),
    p_action VARCHAR(50),
    p_description TEXT,
    p_field VARCHAR(255) DEFAULT NULL,
    p_old_value TEXT DEFAULT NULL,
    p_new_value TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO change_log (
        target_type, target_id, user_id, user_name, action,
        description, field, old_value, new_value, metadata
    ) VALUES (
        p_target_type, p_target_id, p_user_id, p_user_name, p_action,
        p_description, p_field, p_old_value, p_new_value, p_metadata
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_change IS 'Helper function to log changes to entities';

-- ============================================
-- 9. CREATE FUNCTION TO CLEAN OLD ONLINE USERS
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_stale_online_users()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Delete users inactive for more than 5 minutes
    DELETE FROM online_users
    WHERE last_activity < (CURRENT_TIMESTAMP - INTERVAL '5 minutes');
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_stale_online_users IS 'Remove stale online user records (inactive > 5 minutes)';

-- ============================================
-- 10. GRANT PERMISSIONS (if needed for specific roles)
-- ============================================
-- These would be adjusted based on your database user setup
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;
