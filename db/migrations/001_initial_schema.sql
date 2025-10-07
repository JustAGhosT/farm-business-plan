-- Initial migration: Create core database schema
-- Migration: 001_initial_schema
-- Created: 2025-01-07

-- This migration creates the base tables for the farm management application
-- Run with: psql -U username -d dbname -f db/migrations/001_initial_schema.sql

BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Farm Plans
CREATE TABLE IF NOT EXISTS farm_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    province VARCHAR(100),
    coordinates JSONB,
    farm_size DECIMAL(10, 2) NOT NULL,
    soil_type VARCHAR(255),
    water_source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    owner_id UUID,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived'))
);

-- Climate Data
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

-- Crop Plans
CREATE TABLE IF NOT EXISTS crop_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_plan_id UUID NOT NULL REFERENCES farm_plans(id) ON DELETE CASCADE,
    crop_name VARCHAR(255) NOT NULL,
    crop_variety VARCHAR(255),
    planting_area DECIMAL(10, 2) NOT NULL,
    planting_date DATE,
    harvest_date DATE,
    expected_yield DECIMAL(12, 2),
    yield_unit VARCHAR(50),
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'planted', 'growing', 'harvested', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Financial Data
CREATE TABLE IF NOT EXISTS financial_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_plan_id UUID NOT NULL REFERENCES crop_plans(id) ON DELETE CASCADE,
    initial_investment DECIMAL(15, 2),
    fixed_costs DECIMAL(15, 2),
    variable_costs DECIMAL(15, 2),
    monthly_operating_costs DECIMAL(15, 2),
    annual_operating_costs DECIMAL(15, 2),
    projected_revenue DECIMAL(15, 2),
    break_even_point INTEGER,
    roi_percentage DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks
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

-- Crop Templates
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

-- AI Recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_plan_id UUID NOT NULL REFERENCES farm_plans(id) ON DELETE CASCADE,
    recommendation_text TEXT NOT NULL,
    category VARCHAR(100),
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_farm_plans_owner ON farm_plans(owner_id);
CREATE INDEX IF NOT EXISTS idx_farm_plans_status ON farm_plans(status);
CREATE INDEX IF NOT EXISTS idx_climate_data_farm_plan ON climate_data(farm_plan_id);
CREATE INDEX IF NOT EXISTS idx_crop_plans_farm_plan ON crop_plans(farm_plan_id);
CREATE INDEX IF NOT EXISTS idx_crop_plans_status ON crop_plans(status);
CREATE INDEX IF NOT EXISTS idx_financial_data_crop_plan ON financial_data(crop_plan_id);
CREATE INDEX IF NOT EXISTS idx_tasks_farm_plan ON tasks(farm_plan_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_crop_templates_category ON crop_templates(category);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_farm_plan ON ai_recommendations(farm_plan_id);

-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
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

COMMIT;
