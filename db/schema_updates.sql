-- Schema updates for automation features
-- Run these migrations to add expenses and inventory tables

-- Expenses table for expense tracking
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  farm_plan_id INTEGER NOT NULL REFERENCES farm_plans(id) ON DELETE CASCADE,
  crop_plan_id INTEGER REFERENCES crop_plans(id) ON DELETE SET NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  payment_method VARCHAR(50),
  vendor VARCHAR(255),
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expenses_farm_plan ON expenses(farm_plan_id);
CREATE INDEX IF NOT EXISTS idx_expenses_crop_plan ON expenses(crop_plan_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- Inventory table for inventory management
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  farm_plan_id INTEGER NOT NULL REFERENCES farm_plans(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL DEFAULT 'units',
  reorder_level DECIMAL(10, 2) DEFAULT 0,
  unit_cost DECIMAL(10, 2) DEFAULT 0,
  supplier VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_farm_plan ON inventory(farm_plan_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);

-- Comments for documentation
COMMENT ON TABLE expenses IS 'Farm expense tracking with categorization';
COMMENT ON TABLE inventory IS 'Farm inventory management with low-stock alerts';

COMMENT ON COLUMN expenses.category IS 'Category: seeds, fertilizer, pesticides, irrigation, equipment, labor, fuel, maintenance, transport, packaging, marketing, insurance, utilities, professional, other';
COMMENT ON COLUMN inventory.category IS 'Category: seeds, fertilizer, pesticides, equipment, tools, fuel, packaging, other';
COMMENT ON COLUMN inventory.reorder_level IS 'Alert threshold for low stock';
