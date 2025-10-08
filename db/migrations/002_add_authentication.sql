-- Migration: 002_add_authentication
-- Description: Adds user authentication tables and updates farm_plans
-- Created: 2025-01-08

BEGIN;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- NULL for OAuth users
  role VARCHAR(50) DEFAULT 'user', -- 'user', 'admin', 'manager'
  auth_provider VARCHAR(50) DEFAULT 'credentials', -- 'credentials', 'github', 'google'
  auth_provider_id VARCHAR(255), -- Provider's user ID for OAuth
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_email') THEN
    CREATE INDEX idx_users_email ON users(email);
  END IF;
END
$$;

-- Update farm_plans to reference users (only if column doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_plans' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE farm_plans ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Create index on owner_id for faster lookups (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_farm_plans_owner_user') THEN
    CREATE INDEX idx_farm_plans_owner_user ON farm_plans(owner_id);
  END IF;
END
$$;

-- Create trigger for updated_at on users table
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists before creating
DROP TRIGGER IF EXISTS update_users_updated_at_trigger ON users;

CREATE TRIGGER update_users_updated_at_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

COMMIT;
