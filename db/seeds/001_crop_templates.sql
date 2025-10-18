-- Seed data for crop templates
-- This provides initial crop templates for common agricultural crops

BEGIN;

-- Dragon Fruit Template
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Dragon Fruit (Wall Farming)',
    'High-value exotic fruit with excellent market demand. Suitable for wall-farming method.',
    'Fruit',
    '{"spacing": "2m between plants", "support": "Wall or trellis system", "propagation": "Cuttings", "maturity": "18-24 months"}'::jsonb,
    '{"initial_investment_per_ha": 150000, "annual_revenue_per_ha": 100000, "roi_percentage": 40, "break_even_months": 24}'::jsonb,
    '{"climate": "Hot, subtropical", "temperature_range": "20-30°C", "rainfall": "400-600mm", "frost_tolerance": "None", "water_needs": "Moderate", "soil_ph": "6.0-7.0"}'::jsonb,
    '{"demand": "High", "price_range": "50-100 ZAR", "price_unit": "kg", "markets": ["Export", "Local retail", "Restaurants"], "season": "Year-round with peak Nov-Apr"}'::jsonb,
    true
);

-- Moringa Template
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Moringa (Leaf Production)',
    'Fast-growing superfood crop with leaves, powder, and seed oil production potential.',
    'Medicinal/Superfood',
    '{"spacing": "1m x 1m for intensive leaf production", "propagation": "Seeds or cuttings", "maturity": "6-8 months", "harvest_frequency": "Multiple times per year", "germination": {"temperature": "25-30°C", "days": "5-14", "substrate": "50% coir, 30% perlite, 20% vermiculite", "notes": "Seeds germinate well; cuttings root easily"}}'::jsonb,
    '{"initial_investment_per_ha": 70000, "annual_revenue_per_ha": 60000, "roi_percentage": 35, "break_even_months": 18}'::jsonb,
    '{"climate": "Tropical to subtropical", "temperature_range": "25-35°C", "rainfall": "250-1500mm", "frost_tolerance": "None", "water_needs": "Low to moderate", "soil_ph": "6.3-7.0"}'::jsonb,
    '{"demand": "Growing", "price_range": "40-80 ZAR (dried leaves)", "price_unit": "kg", "markets": ["Health food stores", "Export", "Powder production"], "season": "Year-round"}'::jsonb,
    true
);

-- Lucerne/Alfalfa Template
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Lucerne (Alfalfa)',
    'High-value forage crop for livestock feed. Perennial with multiple annual cuttings.',
    'Forage',
    '{"spacing": "Broadcast seeding 20-30 kg/ha", "propagation": "Seed", "maturity": "First cut 90-120 days", "harvest_frequency": "6-8 cuts per year", "germination": {"temperature": "15-30°C", "days": "7-14", "substrate": "Direct seeding preferred; if starting in trays: 50% coir, 25% perlite, 25% vermiculite", "notes": "Inoculate with Rhizobium for nitrogen fixation"}}'::jsonb,
    '{"initial_investment_per_ha": 50000, "annual_revenue_per_ha": 45000, "roi_percentage": 30, "break_even_months": 15}'::jsonb,
    '{"climate": "Temperate to subtropical", "temperature_range": "15-30°C", "rainfall": "500-800mm", "frost_tolerance": "Moderate", "water_needs": "High", "soil_ph": "6.5-7.5"}'::jsonb,
    '{"demand": "Stable", "price_range": "80-120 ZAR", "price_unit": "bale", "markets": ["Dairy farms", "Horse owners", "Livestock farmers"], "season": "Year-round production"}'::jsonb,
    true
);

-- Vegetables (General) Template
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Mixed Vegetables',
    'Intensive vegetable production including tomatoes, lettuce, peppers, and other high-demand crops.',
    'Vegetables',
    '{"spacing": "Varies by crop", "propagation": "Seeds or transplants", "maturity": "2-4 months", "harvest_frequency": "Continuous with succession planting", "germination": {"temperature": "15-30°C", "days": "3-14 (varies by crop)", "substrate": "50% coir, 25% perlite, 25% vermiculite for most crops", "notes": "Adjust substrate and temperature based on specific vegetable type"}}'::jsonb,
    '{"initial_investment_per_ha": 80000, "annual_revenue_per_ha": 120000, "roi_percentage": 50, "break_even_months": 8}'::jsonb,
    '{"climate": "Various", "temperature_range": "15-30°C", "rainfall": "500-800mm", "frost_tolerance": "Varies", "water_needs": "High", "soil_ph": "6.0-7.0"}'::jsonb,
    '{"demand": "High", "price_range": "Varies by crop", "markets": ["Local markets", "Retailers", "Restaurants"], "season": "Year-round with seasonal variations"}'::jsonb,
    true
);

-- Herbs Template
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Culinary Herbs (Basil, Parsley, etc.)',
    'High-value fresh herbs for culinary use. Quick turnover and consistent demand.',
    'Herbs',
    '{"spacing": "20-30cm between plants", "propagation": "Seeds or cuttings", "maturity": "1-2 months", "harvest_frequency": "Weekly when established", "germination": {"temperature": "18-24°C", "days": "7-21 (varies by herb)", "substrate": "60% coir, 40% perlite for good drainage", "notes": "Basil needs warmth (21-24°C); parsley slower (14-21 days)"}}'::jsonb,
    '{"initial_investment_per_ha": 60000, "annual_revenue_per_ha": 90000, "roi_percentage": 60, "break_even_months": 6}'::jsonb,
    '{"climate": "Temperate to subtropical", "temperature_range": "18-28°C", "rainfall": "400-600mm", "frost_tolerance": "Low", "water_needs": "Moderate", "soil_ph": "6.0-7.0"}'::jsonb,
    '{"demand": "High", "price_range": "100-200 ZAR (fresh)", "price_unit": "kg", "markets": ["Restaurants", "Retail", "Farmers markets"], "season": "Year-round with protection"}'::jsonb,
    true
);

COMMIT;
