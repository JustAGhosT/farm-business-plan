-- Phase 2.3: Approval Workflows Migration
-- This migration adds tables needed for sequential and parallel approval workflows

-- ============================================
-- APPROVAL WORKFLOWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) CHECK (type IN ('sequential', 'parallel')) DEFAULT 'sequential',
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('farm-plan', 'crop-plan', 'financial-report', 'task', 'document')),
    target_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'approved', 'rejected', 'cancelled')),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_approval_workflows_target ON approval_workflows(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_created_by ON approval_workflows(created_by);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_status ON approval_workflows(status);

COMMENT ON TABLE approval_workflows IS 'Multi-stage approval workflows for plans, documents, and major decisions';
COMMENT ON COLUMN approval_workflows.type IS 'Sequential: stages must complete in order. Parallel: all stages can proceed simultaneously';
COMMENT ON COLUMN approval_workflows.target_type IS 'Type of entity requiring approval';
COMMENT ON COLUMN approval_workflows.target_id IS 'ID of the entity requiring approval';

-- ============================================
-- APPROVAL STAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS approval_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    required_approvals INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_approval_stages_workflow ON approval_stages(workflow_id);
CREATE INDEX IF NOT EXISTS idx_approval_stages_order ON approval_stages(workflow_id, order_index);
CREATE INDEX IF NOT EXISTS idx_approval_stages_status ON approval_stages(status);

COMMENT ON TABLE approval_stages IS 'Individual stages within an approval workflow';
COMMENT ON COLUMN approval_stages.order_index IS 'Order of execution for sequential workflows';
COMMENT ON COLUMN approval_stages.required_approvals IS 'Number of approvals needed for parallel approval';

-- ============================================
-- APPROVAL STAGE APPROVERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS approval_stage_approvers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id UUID NOT NULL REFERENCES approval_stages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100),
    notified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stage_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_approval_stage_approvers_stage ON approval_stage_approvers(stage_id);
CREATE INDEX IF NOT EXISTS idx_approval_stage_approvers_user ON approval_stage_approvers(user_id);

COMMENT ON TABLE approval_stage_approvers IS 'Users authorized to approve each stage';
COMMENT ON COLUMN approval_stage_approvers.role IS 'Optional role requirement for approver';

-- ============================================
-- APPROVALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id UUID NOT NULL REFERENCES approval_stages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    comments TEXT,
    signature TEXT,
    ip_address VARCHAR(45),
    UNIQUE(stage_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_approvals_stage ON approvals(stage_id);
CREATE INDEX IF NOT EXISTS idx_approvals_user ON approvals(user_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);

COMMENT ON TABLE approvals IS 'Individual approval decisions by users';
COMMENT ON COLUMN approvals.signature IS 'Digital signature data for approval';
COMMENT ON COLUMN approvals.ip_address IS 'IP address from which approval was made';

-- ============================================
-- HELPER FUNCTION: Update workflow status
-- ============================================
CREATE OR REPLACE FUNCTION update_workflow_status(p_workflow_id UUID)
RETURNS VOID AS $$
DECLARE
    v_workflow_type VARCHAR(50);
    v_total_stages INTEGER;
    v_approved_stages INTEGER;
    v_rejected_stages INTEGER;
    v_pending_stages INTEGER;
BEGIN
    -- Get workflow type
    SELECT type INTO v_workflow_type
    FROM approval_workflows
    WHERE id = p_workflow_id;
    
    -- Count stages by status
    SELECT 
        COUNT(*),
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END),
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END),
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)
    INTO v_total_stages, v_approved_stages, v_rejected_stages, v_pending_stages
    FROM approval_stages
    WHERE workflow_id = p_workflow_id;
    
    -- Update workflow status
    IF v_rejected_stages > 0 THEN
        UPDATE approval_workflows
        SET status = 'rejected', completed_at = CURRENT_TIMESTAMP
        WHERE id = p_workflow_id;
    ELSIF v_approved_stages = v_total_stages THEN
        UPDATE approval_workflows
        SET status = 'approved', completed_at = CURRENT_TIMESTAMP
        WHERE id = p_workflow_id;
    ELSIF v_pending_stages < v_total_stages THEN
        UPDATE approval_workflows
        SET status = 'in-progress'
        WHERE id = p_workflow_id AND status = 'pending';
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_workflow_status IS 'Update workflow status based on stage statuses';

-- ============================================
-- HELPER FUNCTION: Check stage approval status
-- ============================================
CREATE OR REPLACE FUNCTION check_stage_approval(p_stage_id UUID)
RETURNS VOID AS $$
DECLARE
    v_required_approvals INTEGER;
    v_approved_count INTEGER;
    v_rejected_count INTEGER;
BEGIN
    -- Get required approvals for this stage
    SELECT required_approvals INTO v_required_approvals
    FROM approval_stages
    WHERE id = p_stage_id;
    
    -- Count approvals and rejections
    SELECT 
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END),
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END)
    INTO v_approved_count, v_rejected_count
    FROM approvals
    WHERE stage_id = p_stage_id;
    
    -- Update stage status
    IF v_rejected_count > 0 THEN
        UPDATE approval_stages
        SET status = 'rejected', completed_at = CURRENT_TIMESTAMP
        WHERE id = p_stage_id;
    ELSIF v_approved_count >= v_required_approvals THEN
        UPDATE approval_stages
        SET status = 'approved', completed_at = CURRENT_TIMESTAMP
        WHERE id = p_stage_id;
    END IF;
    
    -- Update workflow status
    PERFORM update_workflow_status(
        (SELECT workflow_id FROM approval_stages WHERE id = p_stage_id)
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_stage_approval IS 'Check if stage has enough approvals and update status';

-- ============================================
-- TRIGGER: Update workflow timestamp
-- ============================================
DROP TRIGGER IF EXISTS update_approval_workflows_updated_at ON approval_workflows;
CREATE TRIGGER update_approval_workflows_updated_at
    BEFORE UPDATE ON approval_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_approval_stages_updated_at ON approval_stages;
CREATE TRIGGER update_approval_stages_updated_at
    BEFORE UPDATE ON approval_stages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
