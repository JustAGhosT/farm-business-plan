-- Migration: Add Calculator Wizard Sessions
-- Description: Store wizard progress for data persistence and resume functionality
-- Created: 2025-10-13

-- Create calculator_wizard_sessions table
CREATE TABLE IF NOT EXISTS calculator_wizard_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_name VARCHAR(255) NOT NULL,
    years INTEGER NOT NULL DEFAULT 5,
    crops JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    current_step INTEGER DEFAULT 1,
    step_data JSONB DEFAULT '{}'::jsonb,
    completed_steps INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_percentage CHECK (total_percentage >= 0 AND total_percentage <= 100),
    CONSTRAINT valid_step CHECK (current_step >= 1 AND current_step <= 6)
);

-- Create index for faster lookups
CREATE INDEX idx_wizard_sessions_user_id ON calculator_wizard_sessions(user_id);
CREATE INDEX idx_wizard_sessions_updated_at ON calculator_wizard_sessions(updated_at DESC);
CREATE INDEX idx_wizard_sessions_is_completed ON calculator_wizard_sessions(is_completed);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_wizard_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_wizard_session_timestamp
    BEFORE UPDATE ON calculator_wizard_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_wizard_session_updated_at();

-- Add comments for documentation
COMMENT ON TABLE calculator_wizard_sessions IS 'Stores calculator wizard progress for data persistence';
COMMENT ON COLUMN calculator_wizard_sessions.session_name IS 'User-friendly name for the wizard session';
COMMENT ON COLUMN calculator_wizard_sessions.years IS 'Planning period in years';
COMMENT ON COLUMN calculator_wizard_sessions.crops IS 'Array of crop objects with name, percentage, and details';
COMMENT ON COLUMN calculator_wizard_sessions.total_percentage IS 'Total allocation percentage (must equal 100 for valid session)';
COMMENT ON COLUMN calculator_wizard_sessions.current_step IS 'Current step in wizard (1-6)';
COMMENT ON COLUMN calculator_wizard_sessions.step_data IS 'JSON object storing data from each calculator step';
COMMENT ON COLUMN calculator_wizard_sessions.completed_steps IS 'Array of completed step numbers';
COMMENT ON COLUMN calculator_wizard_sessions.is_completed IS 'Whether the wizard has been fully completed';
