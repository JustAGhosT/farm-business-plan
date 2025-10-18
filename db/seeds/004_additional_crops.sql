-- Seed data for additional crop templates
-- This provides new crop templates for Limpopo, North West, and Mpumalanga regions

BEGIN;

-- Cotton
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Cotton',
    'Drought-tolerant fiber crop suitable for the warmer climates of North West and Limpopo. Well-suited for areas like Zeerust.',
    'Field Crops',
    '{"spacing": "90-100cm rows, 10-15cm in-row", "propagation": "Direct seeding", "maturity": "150-180 days", "harvest_frequency": "Once per season", "plantDensity": "100,000-120,000 plants/ha"}'::jsonb,
    '{"initial_investment_per_ha": 60000, "annual_revenue_per_ha": 75000, "roi_percentage": 25, "break_even_months": 12, "productive_years": "1 (annual)"}'::jsonb,
    '{"climate": "Hot, semi-arid", "temperature_range": "25-35°C", "rainfall": "500-700mm", "frost_tolerance": "None", "water_needs": "Moderate", "soil_ph": "6.0-7.5", "soil_type": "Well-drained loam"}'::jsonb,
    '{"demand": "High", "price_range_per_ton": "20,000-25,000 ZAR", "markets": ["Ginneries", "Textile industry", "Export"], "season": "Summer crop", "notes": "Ideal for rotation with maize or sorghum."}'::jsonb,
    true
);

-- Groundnuts (Peanuts)
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Groundnuts (Peanuts)',
    'Nitrogen-fixing legume that thrives in the sandy soils of the North West province, particularly around Lichtenburg and surrounding areas.',
    'Field Crops',
    '{"spacing": "75-90cm rows, 5-10cm in-row", "propagation": "Direct seeding", "maturity": "120-150 days", "harvest_frequency": "Once per season", "plantDensity": "250,000-350,000 plants/ha"}'::jsonb,
    '{"initial_investment_per_ha": 50000, "annual_revenue_per_ha": 65000, "roi_percentage": 30, "break_even_months": 10, "productive_years": "1 (annual)"}'::jsonb,
    '{"climate": "Warm temperate to subtropical", "temperature_range": "25-30°C", "rainfall": "500-700mm", "frost_tolerance": "None", "water_needs": "Moderate", "soil_ph": "5.8-6.5", "soil_type": "Sandy loam"}'::jsonb,
    '{"demand": "Stable", "price_range_per_ton": "12,000-18,000 ZAR", "markets": ["Processors for peanut butter", "Snack food industry", "Oil production"], "season": "Summer crop", "notes": "Excellent rotation crop for maize."}'::jsonb,
    true
);

-- Avocado
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Avocado',
    'High-value subtropical fruit crop, ideal for the frost-free areas of Limpopo and Mpumalanga.',
    'Specialty Crops',
    '{"spacing": "6m x 6m to 8m x 8m", "propagation": "Grafted trees", "maturity": "3-4 years to first harvest", "harvest_frequency": "Once per year", "plantDensity": "156-277 trees/ha"}'::jsonb,
    '{"initial_investment_per_ha": 250000, "annual_revenue_per_ha": 350000, "roi_percentage": 40, "break_even_months": 60, "productive_years": "30+"}'::jsonb,
    '{"climate": "Subtropical", "temperature_range": "20-30°C", "rainfall": "800-1200mm", "frost_tolerance": "Low to none", "water_needs": "High", "soil_ph": "5.5-6.5", "soil_type": "Well-drained, deep loam"}'::jsonb,
    '{"demand": "Very High", "price_range_per_kg": "25-40 ZAR", "markets": ["Export (Europe)", "Local retail", "Food service"], "season": "Varies by cultivar (e.g., Fuerte in winter, Hass in summer)"}'::jsonb,
    true
);

-- Mango
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Mango',
    'Popular subtropical fruit well-suited for the hot, dry conditions found in Limpopo and parts of Mpumalanga.',
    'Specialty Crops',
    '{"spacing": "10m x 5m initially, thinning later", "propagation": "Grafted trees", "maturity": "3-5 years to first harvest", "harvest_frequency": "Once per year", "plantDensity": "200 trees/ha"}'::jsonb,
    '{"initial_investment_per_ha": 180000, "annual_revenue_per_ha": 250000, "roi_percentage": 38, "break_even_months": 72, "productive_years": "40+"}'::jsonb,
    '{"climate": "Subtropical to tropical", "temperature_range": "24-30°C", "rainfall": "600-1000mm", "frost_tolerance": "None", "water_needs": "Moderate, critical during flowering and fruit set", "soil_ph": "5.5-7.0", "soil_type": "Well-drained sandy loam"}'::jsonb,
    '{"demand": "High", "price_range_per_kg": "15-30 ZAR", "markets": ["Local fresh markets", "Juicing and drying processors", "Export"], "season": "Summer to early autumn"}'::jsonb,
    true
);

-- Macadamia
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Macadamia',
    'High-value nut crop thriving in the subtropical climates of Mpumalanga and Limpopo, with significant export potential.',
    'Specialty Crops',
    '{"spacing": "8m x 4m", "propagation": "Grafted trees", "maturity": "4-6 years to first harvest", "harvest_frequency": "Once per year", "plantDensity": "312 trees/ha"}'::jsonb,
    '{"initial_investment_per_ha": 300000, "annual_revenue_per_ha": 400000, "roi_percentage": 33, "break_even_months": 84, "productive_years": "50+"}'::jsonb,
    '{"climate": "Subtropical", "temperature_range": "16-28°C", "rainfall": "1000-2000mm", "frost_tolerance": "Low", "water_needs": "High", "soil_ph": "5.0-6.0", "soil_type": "Deep, well-drained"}'::jsonb,
    '{"demand": "Very High (Export)", "price_range_per_kg_nis": "80-120 ZAR", "markets": ["Export (China, USA, Europe)", "Local processors"], "season": "Harvest from March to July"}'::jsonb,
    true
);

-- Butternut Squash
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Butternut Squash',
    'A reliable and widely cultivated vegetable crop that performs well across Limpopo, North West, and Mpumalanga.',
    'Fruiting Vegetables',
    '{"spacing": "1.5m rows, 50-60cm in-row", "propagation": "Direct seed or transplants", "maturity": "80-100 days", "harvest_frequency": "Once per season", "plantDensity": "10,000-12,000 plants/ha"}'::jsonb,
    '{"initial_investment_per_ha": 45000, "annual_revenue_per_ha": 80000, "roi_percentage": 78, "break_even_months": 6, "productive_years": "1 (annual)"}'::jsonb,
    '{"climate": "Warm temperate", "temperature_range": "22-28°C", "rainfall": "500-800mm", "frost_tolerance": "None", "water_needs": "Moderate to high", "soil_ph": "6.0-7.0", "soil_type": "Well-drained loam with high organic matter"}'::jsonb,
    '{"demand": "High", "price_range_per_ton": "4,000-7,000 ZAR", "markets": ["Retail", "Fresh produce markets", "Processing"], "season": "Warm season", "storage": "Can be stored for 3-6 months."}'::jsonb,
    true
);

COMMIT;
