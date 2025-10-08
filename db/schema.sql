-- Farm Business Plan Database Schema
-- PostgreSQL compatible schema for farm management application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL for OAuth users
    role VARCHAR(50) DEFAULT 'user', -- 'user', 'admin', 'manager'
    auth_provider VARCHAR(50) DEFAULT 'credentials', -- 'credentials', 'github', 'google'
    auth_provider_id VARCHAR(255), -- Provider's user ID for OAuth
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- FARM PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS farm_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    province VARCHAR(100),
    coordinates JSONB,
    farm_size DECIMAL(10, 2) NOT NULL, -- in hectares
    soil_type VARCHAR(255),
    water_source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    owner_id UUID, -- For future user management
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived'))
);

-- ============================================
-- CLIMATE DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS climate_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_plan_id UUID NOT NULL REFERENCES farm_plans(id) ON DELETE CASCADE,
    avg_temp_summer DECIMAL(5, 2),
    avg_temp_winter DECIMAL(5, 2),
    annual_rainfall DECIMAL(8, 2),
    frost_risk BOOLEAN DEFAULT false,
    growing_season_length INTEGER,
    auto_populated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CROP PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS crop_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_plan_id UUID NOT NULL REFERENCES farm_plans(id) ON DELETE CASCADE,
    crop_name VARCHAR(255) NOT NULL,
    crop_variety VARCHAR(255),
    planting_area DECIMAL(10, 2) NOT NULL, -- in hectares
    planting_date DATE,
    harvest_date DATE,
    expected_yield DECIMAL(12, 2),
    yield_unit VARCHAR(50),
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'planted', 'growing', 'harvested', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- FINANCIAL DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS financial_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_plan_id UUID NOT NULL REFERENCES crop_plans(id) ON DELETE CASCADE,
    initial_investment DECIMAL(15, 2),
    fixed_costs DECIMAL(15, 2),
    variable_costs DECIMAL(15, 2),
    monthly_operating_costs DECIMAL(15, 2),
    annual_operating_costs DECIMAL(15, 2),
    projected_revenue DECIMAL(15, 2),
    break_even_point INTEGER, -- in months
    roi_percentage DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_plan_id UUID NOT NULL REFERENCES farm_plans(id) ON DELETE CASCADE,
    crop_plan_id UUID REFERENCES crop_plans(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    category VARCHAR(100),
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CROP TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS crop_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100),
    technical_specs JSONB,
    financial_projections JSONB,
    growing_requirements JSONB,
    market_info JSONB,
    is_public BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AI RECOMMENDATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_plan_id UUID NOT NULL REFERENCES farm_plans(id) ON DELETE CASCADE,
    recommendation_text TEXT NOT NULL,
    category VARCHAR(100),
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_farm_plans_owner ON farm_plans(owner_id);
CREATE INDEX idx_farm_plans_status ON farm_plans(status);
CREATE INDEX idx_climate_data_farm_plan ON climate_data(farm_plan_id);
CREATE INDEX idx_crop_plans_farm_plan ON crop_plans(farm_plan_id);
CREATE INDEX idx_crop_plans_status ON crop_plans(status);
CREATE INDEX idx_financial_data_crop_plan ON financial_data(crop_plan_id);
CREATE INDEX idx_tasks_farm_plan ON tasks(farm_plan_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_crop_templates_category ON crop_templates(category);
CREATE INDEX idx_ai_recommendations_farm_plan ON ai_recommendations(farm_plan_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farm_plans_updated_at BEFORE UPDATE ON farm_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_climate_data_updated_at BEFORE UPDATE ON climate_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crop_plans_updated_at BEFORE UPDATE ON crop_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_data_updated_at BEFORE UPDATE ON financial_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crop_templates_updated_at BEFORE UPDATE ON crop_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS
-- ============================================

-- View for farm plan summary with crop and financial data
CREATE OR REPLACE VIEW farm_plan_summary AS
SELECT 
    fp.id,
    fp.name,
    fp.location,
    fp.province,
    fp.farm_size,
    fp.status,
    COUNT(DISTINCT cp.id) as total_crops,
    SUM(cp.planting_area) as total_planted_area,
    SUM(fd.initial_investment) as total_investment,
    SUM(fd.projected_revenue) as total_projected_revenue,
    AVG(fd.roi_percentage) as avg_roi,
    fp.created_at,
    fp.updated_at
FROM farm_plans fp
LEFT JOIN crop_plans cp ON fp.id = cp.farm_plan_id
LEFT JOIN financial_data fd ON cp.id = fd.crop_plan_id
GROUP BY fp.id, fp.name, fp.location, fp.province, fp.farm_size, fp.status, fp.created_at, fp.updated_at;

-- View for active tasks
CREATE OR REPLACE VIEW active_tasks AS
SELECT 
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.category,
    t.due_date,
    fp.name as farm_plan_name,
    cp.crop_name,
    t.created_at
FROM tasks t
JOIN farm_plans fp ON t.farm_plan_id = fp.id
LEFT JOIN crop_plans cp ON t.crop_plan_id = cp.id
WHERE t.status IN ('pending', 'in-progress')
ORDER BY t.priority DESC, t.due_date ASC;
