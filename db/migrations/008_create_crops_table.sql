CREATE TABLE crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    scientific_name TEXT,
    description TEXT,
    image_url TEXT,
    category TEXT,
    climate_requirements JSONB,
    cultivation_requirements TEXT,
    production_timeline JSONB,
    economic_analysis TEXT,
    market_analysis TEXT,
    risk_assessment JSONB,
    strategic_recommendations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
