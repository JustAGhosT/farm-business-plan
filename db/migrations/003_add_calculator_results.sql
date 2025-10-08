-- Migration: Add calculator_results table
-- This table stores financial calculator results for historical tracking and comparison

CREATE TABLE IF NOT EXISTS calculator_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_plan_id UUID REFERENCES farm_plans(id) ON DELETE CASCADE,
    crop_plan_id UUID REFERENCES crop_plans(id) ON DELETE CASCADE,
    user_id UUID, -- For future user management
    calculator_type VARCHAR(50) NOT NULL CHECK (calculator_type IN ('roi', 'break-even', 'investment', 'loan', 'operating-costs', 'revenue', 'cash-flow', 'profit-margin')),
    input_data JSONB NOT NULL, -- Store all input values
    results JSONB NOT NULL, -- Store all calculated results
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_calculator_results_farm_plan ON calculator_results(farm_plan_id);
CREATE INDEX idx_calculator_results_crop_plan ON calculator_results(crop_plan_id);
CREATE INDEX idx_calculator_results_user ON calculator_results(user_id);
CREATE INDEX idx_calculator_results_type ON calculator_results(calculator_type);
CREATE INDEX idx_calculator_results_created ON calculator_results(created_at DESC);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_calculator_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculator_results_updated_at
    BEFORE UPDATE ON calculator_results
    FOR EACH ROW
    EXECUTE FUNCTION update_calculator_results_updated_at();
