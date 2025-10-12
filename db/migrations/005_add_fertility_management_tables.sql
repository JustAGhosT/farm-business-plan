-- Migration: Add fertility management tables
-- This migration adds tables for storing crop fertility and nutrient data

BEGIN;

-- ============================================
-- CROP FERTILITY DATA TABLE
-- ============================================
-- Stores nutrient removal rates and fertility requirements for each crop
CREATE TABLE IF NOT EXISTS crop_fertility_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_name VARCHAR(255) NOT NULL UNIQUE,
    crop_category VARCHAR(100), -- Field Crops, Vegetables, Specialty, etc.
    
    -- Nutrient removal rates
    p2o5_removal_rate DECIMAL(6, 3) NOT NULL, -- lb per unit
    k2o_removal_rate DECIMAL(6, 3) NOT NULL, -- lb per unit
    nitrogen_removal_rate DECIMAL(6, 3), -- lb per unit (for some crops)
    sulfur_removal_rate DECIMAL(6, 3), -- lb per unit (optional)
    calcium_removal_rate DECIMAL(6, 3), -- lb per unit (optional)
    boron_removal_rate DECIMAL(6, 4), -- lb per unit (optional, smaller amounts)
    
    -- Unit information
    yield_unit VARCHAR(50) NOT NULL, -- bu, ton, cwt, etc.
    unit_description TEXT,
    
    -- General recommendations
    description TEXT,
    fertility_notes TEXT,
    
    -- Special requirements (stored as JSONB for flexibility)
    micronutrients JSONB, -- {B: 2-3 lb/ac, Zn: 5 lb/ac, etc.}
    ph_range JSONB, -- {min: 6.0, max: 7.0, optimal: 6.5}
    special_requirements JSONB, -- Additional fertility considerations
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- NITROGEN PROGRAMS TABLE
-- ============================================
-- Stores nitrogen management strategies for crop transitions
CREATE TABLE IF NOT EXISTS nitrogen_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_crop VARCHAR(255) NOT NULL,
    to_crop VARCHAR(255) NOT NULL,
    transition_name VARCHAR(255) NOT NULL, -- e.g., "soybean-to-potato"
    
    -- Nitrogen credit/requirement
    nitrogen_credit DECIMAL(6, 2), -- lb N/ac credit from previous crop
    nitrogen_requirement TEXT, -- Description of N needs
    
    -- Application strategy
    application_strategy JSONB, -- {preplant: "100-150 lb N/ac", sidedress: "Fertigation during bulking", etc.}
    
    -- Monitoring requirements
    monitoring_requirements JSONB, -- {petioleTarget: "13,000-15,000 ppm NO₃-N", frequency: "weekly"}
    
    -- Additional notes
    notes TEXT,
    recommendations TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(from_crop, to_crop)
);

-- ============================================
-- COVER CROPS TABLE
-- ============================================
-- Stores cover crop recommendations by rotation window
CREATE TABLE IF NOT EXISTS cover_crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    after_crop VARCHAR(255) NOT NULL,
    primary_cover_crop VARCHAR(255) NOT NULL,
    optional_cover_crops TEXT[],
    
    benefits TEXT NOT NULL,
    timing TEXT,
    termination_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- POTASSIUM SOURCES TABLE
-- ============================================
-- Stores potassium source recommendations by crop
CREATE TABLE IF NOT EXISTS potassium_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_name VARCHAR(255) NOT NULL UNIQUE,
    preferred_source VARCHAR(255) NOT NULL, -- K₂SO₄, KCl, etc.
    reason TEXT,
    sources_to_avoid TEXT[],
    alternatives TEXT,
    application_timing TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CROP MONITORING PROTOCOLS TABLE
-- ============================================
-- Stores tissue testing and monitoring protocols for crops
CREATE TABLE IF NOT EXISTS crop_monitoring_protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_name VARCHAR(255) NOT NULL UNIQUE,
    
    -- Tissue testing
    sample_type VARCHAR(255), -- Petiole, Leaf, etc.
    sample_frequency VARCHAR(255), -- Weekly, Biweekly, etc.
    sample_timing TEXT, -- Growth stage details
    target_range TEXT, -- Target nutrient levels
    
    -- Actions
    monitoring_action TEXT,
    
    -- Additional protocols
    visual_indicators TEXT[],
    symptoms_to_watch TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_crop_fertility_crop_name ON crop_fertility_data(crop_name);
CREATE INDEX idx_crop_fertility_category ON crop_fertility_data(crop_category);
CREATE INDEX idx_nitrogen_programs_from_crop ON nitrogen_programs(from_crop);
CREATE INDEX idx_nitrogen_programs_to_crop ON nitrogen_programs(to_crop);
CREATE INDEX idx_cover_crops_after_crop ON cover_crops(after_crop);
CREATE INDEX idx_potassium_sources_crop ON potassium_sources(crop_name);
CREATE INDEX idx_monitoring_protocols_crop ON crop_monitoring_protocols(crop_name);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_crop_fertility_data_updated_at 
    BEFORE UPDATE ON crop_fertility_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nitrogen_programs_updated_at 
    BEFORE UPDATE ON nitrogen_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cover_crops_updated_at 
    BEFORE UPDATE ON cover_crops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_potassium_sources_updated_at 
    BEFORE UPDATE ON potassium_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crop_monitoring_protocols_updated_at 
    BEFORE UPDATE ON crop_monitoring_protocols
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
