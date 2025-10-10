-- Phase 2.4: Task Dependencies & Critical Path (Weeks 5-6)

-- Task Dependencies Table
CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  dependency_type VARCHAR(50) NOT NULL DEFAULT 'finish-to-start', -- finish-to-start, start-to-start, finish-to-finish, start-to-finish
  lag_days INTEGER DEFAULT 0, -- positive for delay, negative for lead time
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id),
  CONSTRAINT unique_dependency UNIQUE (task_id, depends_on_task_id)
);

CREATE INDEX idx_task_dependencies_task ON task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);

-- Function to check for circular dependencies
CREATE OR REPLACE FUNCTION check_circular_dependency(
  p_task_id UUID,
  p_depends_on UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_circular BOOLEAN;
BEGIN
  -- Check if adding this dependency would create a circular dependency
  WITH RECURSIVE dep_chain AS (
    -- Start with the dependency we want to add
    SELECT p_depends_on AS task_id, 1 AS depth
    UNION ALL
    -- Follow the chain of dependencies
    SELECT td.depends_on_task_id, dc.depth + 1
    FROM dep_chain dc
    JOIN task_dependencies td ON td.task_id = dc.task_id
    WHERE dc.depth < 20 -- prevent infinite recursion
  )
  SELECT EXISTS (
    SELECT 1 FROM dep_chain WHERE task_id = p_task_id
  ) INTO v_circular;
  
  RETURN v_circular;
END;
$$ LANGUAGE plpgsql;

-- Task Templates Table
CREATE TABLE IF NOT EXISTS task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  crop_type VARCHAR(100), -- null for general templates
  tasks JSONB NOT NULL, -- array of task definitions with dependencies
  created_by UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_templates_category ON task_templates(category);
CREATE INDEX idx_task_templates_crop_type ON task_templates(crop_type);
CREATE INDEX idx_task_templates_created_by ON task_templates(created_by);

-- Comments
COMMENT ON TABLE task_dependencies IS 'Defines dependencies between tasks for project management';
COMMENT ON TABLE task_templates IS 'Reusable task sequences with predefined dependencies';

COMMENT ON COLUMN task_dependencies.dependency_type IS 'finish-to-start: B starts after A finishes, start-to-start: B starts when A starts, finish-to-finish: B finishes when A finishes, start-to-finish: B finishes when A starts';
COMMENT ON COLUMN task_dependencies.lag_days IS 'Positive for delay (wait X days), negative for lead time (can start X days before)';
