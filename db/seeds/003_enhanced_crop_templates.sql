-- Enhanced seed data for crop templates
-- This provides comprehensive crop templates for all 18 crops with fertility integration

BEGIN;

-- Delete existing data to avoid conflicts
DELETE FROM crop_templates;

-- ============================================
-- SPECIALTY CROPS
-- ============================================

-- Dragon Fruit
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Dragon Fruit (Wall Farming)',
    'High-value exotic fruit with excellent market demand. Perennial cactus fruit suitable for wall-farming method.',
    'Specialty Crops',
    '{"spacing": "2m between plants", "support": "Wall or trellis system", "propagation": "Cuttings", "maturity": "18-24 months", "plantDensity": "1,600-2,000 plants/ha"}'::jsonb,
    '{"initial_investment_per_ha": 150000, "annual_revenue_per_ha": 100000, "roi_percentage": 40, "break_even_months": 24, "productive_years": "15-20"}'::jsonb,
    '{"climate": "Hot, subtropical", "temperature_range": "20-30°C", "rainfall": "400-600mm", "frost_tolerance": "None", "water_needs": "Moderate", "soil_ph": "6.0-7.0", "soil_type": "Well-drained, sandy loam", "fertility": "Moderate feeder, benefits from organic matter"}'::jsonb,
    '{"demand": "High", "price_range": "50-100 ZAR", "price_unit": "kg", "markets": ["Export", "Local retail", "Restaurants"], "season": "Year-round with peak Nov-Apr", "storage": "7-14 days refrigerated"}'::jsonb,
    true
);

-- Moringa
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Moringa (Leaf Production)',
    'Fast-growing superfood crop with leaves, powder, and seed oil production potential. Multiple harvests per year.',
    'Specialty Crops',
    '{"spacing": "1m x 1m for intensive leaf production", "propagation": "Seeds or cuttings", "maturity": "6-8 months", "harvest_frequency": "Multiple times per year (6-8 harvests)", "plantDensity": "10,000 plants/ha", "germination": {"temperature": "25-30°C", "days": "5-14", "substrate": "50% coir, 30% perlite, 20% vermiculite", "notes": "Seeds germinate well; cuttings root easily"}}'::jsonb,
    '{"initial_investment_per_ha": 70000, "annual_revenue_per_ha": 60000, "roi_percentage": 35, "break_even_months": 18, "productive_years": "8-10"}'::jsonb,
    '{"climate": "Tropical to subtropical", "temperature_range": "25-35°C", "rainfall": "250-1500mm", "frost_tolerance": "None", "water_needs": "Low to moderate", "soil_ph": "6.3-7.0", "soil_type": "Well-drained", "fertility": "Light feeder, drought-tolerant"}'::jsonb,
    '{"demand": "Growing", "price_range": "40-80 ZAR (dried leaves)", "price_unit": "kg", "markets": ["Health food stores", "Export", "Powder production"], "season": "Year-round", "value_added": "Leaf powder, tea, oil"}'::jsonb,
    true
);

-- Sunflower
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Sunflower (Oilseed)',
    'Oilseed crop with deep roots, drought tolerance, and good rotation value. Returns K via residue cycling.',
    'Specialty Crops',
    '{"spacing": "60-75cm rows, 20-30cm in-row", "propagation": "Direct seeding", "maturity": "90-120 days", "harvest_frequency": "Once per season", "plantDensity": "40,000-60,000 plants/ha", "germination": {"temperature": "20-30°C", "days": "7-14", "substrate": "50% coir, 50% perlite for nursery starts; direct seed preferred", "notes": "Large seeds, easy to handle; sensitive to salt - keep fertilizer away from seed"}}'::jsonb,
    '{"initial_investment_per_ha": 45000, "annual_revenue_per_ha": 55000, "roi_percentage": 25, "break_even_months": 12, "productive_years": "1 (annual)"}'::jsonb,
    '{"climate": "Temperate to subtropical", "temperature_range": "20-30°C", "rainfall": "400-600mm", "frost_tolerance": "Moderate", "water_needs": "Moderate", "soil_ph": "6.0-7.5", "soil_type": "Well-drained", "fertility": "Deep rooted, can tap 4-6 ft for nutrients"}'::jsonb,
    '{"demand": "Stable", "price_range": "8,000-12,000 ZAR", "price_unit": "ton", "markets": ["Oil processors", "Direct sale", "Export"], "season": "Summer crop", "uses": "Oil, birdseed, confectionery"}'::jsonb,
    true
);

-- ============================================
-- FIELD CROPS
-- ============================================

-- Lucerne/Alfalfa
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Lucerne (Alfalfa)',
    'High-value perennial forage crop for livestock feed. Nitrogen-fixing legume with multiple annual cuttings.',
    'Field Crops',
    '{"spacing": "Broadcast seeding 20-30 kg/ha", "propagation": "Seed", "maturity": "First cut 90-120 days", "harvest_frequency": "6-8 cuts per year", "plantDensity": "Broadcast", "germination": {"temperature": "15-30°C", "days": "7-14", "substrate": "Direct seeding preferred; if starting in trays: 50% coir, 25% perlite, 25% vermiculite", "notes": "Inoculate with Rhizobium for nitrogen fixation"}}'::jsonb,
    '{"initial_investment_per_ha": 50000, "annual_revenue_per_ha": 45000, "roi_percentage": 30, "break_even_months": 15, "productive_years": "3-5"}'::jsonb,
    '{"climate": "Temperate to subtropical", "temperature_range": "15-30°C", "rainfall": "500-800mm", "frost_tolerance": "High", "water_needs": "High", "soil_ph": "6.5-7.5", "soil_type": "Deep, fertile loam", "fertility": "N-fixing, focus on P, K, S"}'::jsonb,
    '{"demand": "Stable", "price_range": "80-120 ZAR", "price_unit": "bale", "markets": ["Dairy farms", "Horse owners", "Livestock farmers"], "season": "Year-round production", "quality_factors": "Protein content, leaf-to-stem ratio"}'::jsonb,
    true
);

-- Soybean
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Soybean',
    'Nitrogen-fixing legume providing rotation benefits. Provides 30-45 lb N/ac credit to following crop.',
    'Field Crops',
    '{"spacing": "45-75cm rows, 5-10cm in-row", "propagation": "Direct seeding", "maturity": "100-140 days", "harvest_frequency": "Once per season", "plantDensity": "300,000-500,000 plants/ha", "germination": {"temperature": "20-30°C", "days": "5-10", "substrate": "Direct seeding preferred; 50% coir, 50% perlite if transplanting", "notes": "Inoculate with proper Rhizobium at planting if new field; pre-soak seeds 8-12 hours for faster germination"}}'::jsonb,
    '{"initial_investment_per_ha": 40000, "annual_revenue_per_ha": 50000, "roi_percentage": 25, "break_even_months": 10, "productive_years": "1 (annual)"}'::jsonb,
    '{"climate": "Temperate to subtropical", "temperature_range": "20-30°C", "rainfall": "500-700mm", "frost_tolerance": "Low", "water_needs": "Moderate to high", "soil_ph": "6.0-7.0", "soil_type": "Well-drained loam", "fertility": "N-fixing, focus on P/K for nodulation"}'::jsonb,
    '{"demand": "High", "price_range": "7,000-10,000 ZAR", "price_unit": "ton", "markets": ["Processors", "Export", "Livestock feed"], "season": "Summer crop", "uses": "Oil, protein meal, food"}'::jsonb,
    true
);

-- Grain Sorghum
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Grain Sorghum',
    'Drought-tolerant grain crop. Uses residual N efficiently, residue returns K to soil.',
    'Field Crops',
    '{"spacing": "60-90cm rows, 10-15cm in-row", "propagation": "Direct seeding", "maturity": "90-120 days", "harvest_frequency": "Once per season", "plantDensity": "150,000-300,000 plants/ha", "germination": {"temperature": "25-35°C", "days": "7-12", "substrate": "Direct seeding preferred; needs warm soil (18°C minimum)", "notes": "Counter N immobilization if following high-residue crops"}}'::jsonb,
    '{"initial_investment_per_ha": 35000, "annual_revenue_per_ha": 42000, "roi_percentage": 20, "break_even_months": 8, "productive_years": "1 (annual)"}'::jsonb,
    '{"climate": "Hot, semi-arid", "temperature_range": "25-35°C", "rainfall": "400-600mm", "frost_tolerance": "Low", "water_needs": "Low to moderate", "soil_ph": "5.5-7.5", "soil_type": "Well-drained", "fertility": "Efficient N user, sample to 24\""}'::jsonb,
    '{"demand": "Stable", "price_range": "3,500-5,000 ZAR", "price_unit": "ton", "markets": ["Livestock feed", "Breweries", "Food processors"], "season": "Summer crop", "uses": "Animal feed, brewing, food"}'::jsonb,
    true
);

-- Maize/Corn
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Maize (Corn)',
    'Heavy nitrogen feeder, versatile grain crop. High yielding with proper management.',
    'Field Crops',
    '{"spacing": "75-90cm rows, 20-25cm in-row", "propagation": "Direct seeding", "maturity": "100-140 days", "harvest_frequency": "Once per season", "plantDensity": "50,000-80,000 plants/ha", "germination": {"temperature": "18-32°C", "days": "7-10", "substrate": "Direct seeding preferred; 50% coir, 50% perlite if transplanting", "notes": "Large seeds, easy to handle; needs soil temp above 16°C"}}'::jsonb,
    '{"initial_investment_per_ha": 55000, "annual_revenue_per_ha": 70000, "roi_percentage": 30, "break_even_months": 9, "productive_years": "1 (annual)"}'::jsonb,
    '{"climate": "Temperate to subtropical", "temperature_range": "18-32°C", "rainfall": "500-800mm", "frost_tolerance": "Low", "water_needs": "High", "soil_ph": "5.8-7.0", "soil_type": "Fertile loam", "fertility": "Heavy N feeder (150-200 lb N/ac)"}'::jsonb,
    '{"demand": "Very high", "price_range": "3,000-4,500 ZAR", "price_unit": "ton", "markets": ["Millers", "Livestock feed", "Industrial"], "season": "Summer crop", "uses": "Human food, animal feed, industrial"}'::jsonb,
    true
);

-- Wheat
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Wheat',
    'Moderate feeder, cool-season small grain. Residue returns K if not baled.',
    'Field Crops',
    '{"spacing": "Broadcast or drilled 15-18cm rows", "propagation": "Seed", "maturity": "120-150 days", "harvest_frequency": "Once per season", "plantDensity": "150-180 kg seed/ha", "germination": {"temperature": "15-25°C", "days": "7-14", "substrate": "Direct seeding; broadcast or drill seeding", "notes": "Cool season crop, plant in fall for winter growth"}}'::jsonb,
    '{"initial_investment_per_ha": 45000, "annual_revenue_per_ha": 55000, "roi_percentage": 22, "break_even_months": 10, "productive_years": "1 (annual)"}'::jsonb,
    '{"climate": "Cool temperate", "temperature_range": "15-25°C", "rainfall": "400-650mm", "frost_tolerance": "High", "water_needs": "Moderate", "soil_ph": "6.0-7.5", "soil_type": "Well-drained loam", "fertility": "Moderate (100-120 lb N/ac)"}'::jsonb,
    '{"demand": "High", "price_range": "4,000-5,500 ZAR", "price_unit": "ton", "markets": ["Millers", "Bakers", "Export"], "season": "Winter crop", "quality_factors": "Protein content, gluten strength"}'::jsonb,
    true
);

-- ============================================
-- HIGH-VALUE CROPS
-- ============================================

-- Potato
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Potato',
    'High-value tuber crop. Use K₂SO₄ (SOP) for quality. Requires split N and petiole monitoring.',
    'High-Value Crops',
    '{"spacing": "75-90cm rows, 25-30cm in-row", "propagation": "Seed potatoes", "maturity": "90-120 days", "harvest_frequency": "Once per season", "plantDensity": "40,000-50,000 plants/ha"}'::jsonb,
    '{"initial_investment_per_ha": 120000, "annual_revenue_per_ha": 150000, "roi_percentage": 35, "break_even_months": 14, "productive_years": "1 (annual)"}'::jsonb,
    '{"climate": "Cool temperate", "temperature_range": "15-22°C", "rainfall": "500-700mm", "frost_tolerance": "None", "water_needs": "High", "soil_ph": "5.5-6.5", "soil_type": "Loose, well-drained", "fertility": "Heavy feeder, monitor petiole NO₃ weekly"}'::jsonb,
    '{"demand": "Very high", "price_range": "6,000-10,000 ZAR", "price_unit": "ton", "markets": ["Retail", "Processors", "Food service"], "season": "Cool season", "quality_factors": "Size, specific gravity, fry color"}'::jsonb,
    true
);

-- Sweet Potato
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Sweet Potato',
    'High K requirement root crop. Avoid excess N which promotes vine over root development.',
    'High-Value Crops',
    '{"spacing": "90-100cm rows, 30-40cm in-row", "propagation": "Slips/cuttings", "maturity": "100-150 days", "harvest_frequency": "Once per season", "plantDensity": "25,000-40,000 plants/ha"}'::jsonb,
    '{"initial_investment_per_ha": 75000, "annual_revenue_per_ha": 90000, "roi_percentage": 30, "break_even_months": 12, "productive_years": "1 (annual)"}'::jsonb,
    '{"climate": "Warm subtropical", "temperature_range": "24-28°C", "rainfall": "500-1000mm", "frost_tolerance": "None", "water_needs": "Moderate", "soil_ph": "5.5-6.5", "soil_type": "Sandy loam", "fertility": "High K need (150-200 lb K₂O/ac)"}'::jsonb,
    '{"demand": "High", "price_range": "5,000-8,000 ZAR", "price_unit": "ton", "markets": ["Retail", "Export", "Food service"], "season": "Warm season", "quality_factors": "Size, color, sweetness, storage"}'::jsonb,
    true
);

-- ============================================
-- ROOT VEGETABLES
-- ============================================

-- Beetroot
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Beetroot',
    'Root vegetable requiring 2-3 lb B/ac preplant. Maintain pH 6.2-7.0 for micronutrient availability.',
    'Root Vegetables',
    '{"spacing": "45-60cm rows, 5-10cm in-row", "propagation": "Direct seeding", "maturity": "60-90 days", "harvest_frequency": "Once per planting", "plantDensity": "300,000-500,000 plants/ha", "germination": {"temperature": "15-23°C", "days": "7-14", "substrate": "50% coir, 25% perlite, 25% vermiculite", "notes": "Each seed ball contains 2-4 seeds; thin to one plant"}}'::jsonb,
    '{"initial_investment_per_ha": 55000, "annual_revenue_per_ha": 75000, "roi_percentage": 35, "break_even_months": 8, "productive_years": "1 (annual with succession)"}'::jsonb,
    '{"climate": "Cool temperate", "temperature_range": "15-23°C", "rainfall": "400-600mm", "frost_tolerance": "Light frost tolerant", "water_needs": "Moderate", "soil_ph": "6.2-7.0", "soil_type": "Well-drained loam", "fertility": "Apply 2-3 lb B/ac, monitor for heart rot"}'::jsonb,
    '{"demand": "Moderate to high", "price_range": "8-15 ZAR", "price_unit": "kg", "markets": ["Retail", "Restaurants", "Processing"], "season": "Cool season", "storage": "3-4 months refrigerated"}'::jsonb,
    true
);

-- Carrot
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Carrot',
    'Moderate feeder, avoid fresh manure. Requires loose, friable soil for straight root development.',
    'Root Vegetables',
    '{"spacing": "30-45cm rows, 2-5cm in-row", "propagation": "Direct seeding", "maturity": "70-100 days", "harvest_frequency": "Once per planting", "plantDensity": "800,000-1,200,000 plants/ha", "germination": {"temperature": "16-21°C", "days": "14-21", "substrate": "50% coir, 50% perlite for fine texture", "notes": "Small seeds require fine, moist substrate; keep consistently moist"}}'::jsonb,
    '{"initial_investment_per_ha": 60000, "annual_revenue_per_ha": 85000, "roi_percentage": 40, "break_even_months": 7, "productive_years": "1 (annual with succession)"}'::jsonb,
    '{"climate": "Cool temperate", "temperature_range": "16-21°C", "rainfall": "400-600mm", "frost_tolerance": "Light frost tolerant", "water_needs": "Moderate to high", "soil_ph": "6.0-6.8", "soil_type": "Deep sandy loam, stone-free", "fertility": "Split N: 40% preplant, 60% sidedress at 4-6 weeks"}'::jsonb,
    '{"demand": "High", "price_range": "6-12 ZAR", "price_unit": "kg", "markets": ["Retail", "Processing", "Export"], "season": "Cool season", "quality_factors": "Straightness, color, size uniformity"}'::jsonb,
    true
);

-- Onion
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Onion',
    'Moderate feeder with shallow roots. Sulfur important for pungency and storage quality.',
    'Root Vegetables',
    '{"spacing": "30-40cm rows, 8-12cm in-row", "propagation": "Sets or transplants", "maturity": "90-150 days", "harvest_frequency": "Once per season", "plantDensity": "300,000-500,000 plants/ha"}'::jsonb,
    '{"initial_investment_per_ha": 70000, "annual_revenue_per_ha": 95000, "roi_percentage": 35, "break_even_months": 9, "productive_years": "1 (annual)"}'::jsonb,
    '{"climate": "Cool to moderate", "temperature_range": "13-24°C", "rainfall": "350-550mm", "frost_tolerance": "Light frost tolerant", "water_needs": "Moderate", "soil_ph": "6.0-7.0", "soil_type": "Well-drained loam", "fertility": "Apply 20-30 lb S/ac for quality, split N 50/50"}'::jsonb,
    '{"demand": "Very high", "price_range": "5-12 ZAR", "price_unit": "kg", "markets": ["Retail", "Export", "Food service"], "season": "Cool season", "storage": "3-8 months depending on variety"}'::jsonb,
    true
);

-- ============================================
-- FRUITING VEGETABLES
-- ============================================

-- Tomato
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Tomato',
    'Heavy feeder requiring consistent Ca for blossom end rot prevention. Use drip fertigation for precision.',
    'Fruiting Vegetables',
    '{"spacing": "90-120cm rows, 45-60cm in-row", "propagation": "Transplants", "maturity": "70-90 days", "harvest_frequency": "Multiple harvests over 3-4 months", "plantDensity": "10,000-25,000 plants/ha", "germination": {"temperature": "21-29°C", "days": "5-10", "substrate": "50% coir, 25% perlite, 25% vermiculite", "notes": "Start indoors 6-8 weeks before transplant; needs consistent warmth"}}'::jsonb,
    '{"initial_investment_per_ha": 95000, "annual_revenue_per_ha": 180000, "roi_percentage": 90, "break_even_months": 6, "productive_years": "1 (annual, extended with protection)"}'::jsonb,
    '{"climate": "Warm temperate", "temperature_range": "20-28°C", "rainfall": "500-800mm", "frost_tolerance": "None", "water_needs": "High, consistent", "soil_ph": "6.0-7.0", "soil_type": "Well-drained loam", "fertility": "Apply Ca 100-150 lb/ac, split N, monitor Mg"}'::jsonb,
    '{"demand": "Very high", "price_range": "8-20 ZAR", "price_unit": "kg", "markets": ["Retail", "Restaurants", "Processing"], "season": "Warm season", "quality_factors": "Firmness, color, flavor, shelf life"}'::jsonb,
    true
);

-- Pepper
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Pepper (Bell/Chili)',
    'Moderate feeder, sensitive to salt. Avoid excess N which delays fruit set.',
    'Fruiting Vegetables',
    '{"spacing": "75-90cm rows, 40-50cm in-row", "propagation": "Transplants", "maturity": "65-90 days", "harvest_frequency": "Multiple harvests", "plantDensity": "20,000-30,000 plants/ha", "germination": {"temperature": "24-29°C", "days": "7-14", "substrate": "50% coir, 25% perlite, 25% vermiculite", "notes": "Start indoors 8-10 weeks before transplant; needs warmth (slower than tomato)"}}'::jsonb,
    '{"initial_investment_per_ha": 85000, "annual_revenue_per_ha": 140000, "roi_percentage": 65, "break_even_months": 7, "productive_years": "1 (annual)"}'::jsonb,
    '{"climate": "Warm temperate", "temperature_range": "21-28°C", "rainfall": "500-800mm", "frost_tolerance": "None", "water_needs": "Moderate to high", "soil_ph": "6.0-7.0", "soil_type": "Well-drained loam", "fertility": "Use low-salt fertilizers, consistent moisture"}'::jsonb,
    '{"demand": "High", "price_range": "12-25 ZAR", "price_unit": "kg", "markets": ["Retail", "Restaurants", "Processing"], "season": "Warm season", "quality_factors": "Size, color, firmness, heat level (chili)"}'::jsonb,
    true
);

-- Cucumber
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Cucumber',
    'Fast-growing, requires frequent light fertilization. Sensitive to salt stress.',
    'Fruiting Vegetables',
    '{"spacing": "100-150cm rows, 30-45cm in-row", "propagation": "Direct seed or transplants", "maturity": "50-70 days", "harvest_frequency": "Daily to every 2-3 days", "plantDensity": "20,000-40,000 plants/ha", "germination": {"temperature": "21-29°C", "days": "3-10", "substrate": "50% coir, 30% perlite, 20% vermiculite", "notes": "Fast germinator; can direct seed after last frost or start indoors 3-4 weeks early"}}'::jsonb,
    '{"initial_investment_per_ha": 75000, "annual_revenue_per_ha": 120000, "roi_percentage": 60, "break_even_months": 5, "productive_years": "1 (annual)"}'::jsonb,
    '{"climate": "Warm temperate", "temperature_range": "21-29°C", "rainfall": "500-800mm", "frost_tolerance": "None", "water_needs": "High", "soil_ph": "6.0-7.0", "soil_type": "Well-drained loam", "fertility": "Frequent light fertilization, monitor salinity"}'::jsonb,
    '{"demand": "High", "price_range": "6-15 ZAR", "price_unit": "kg", "markets": ["Retail", "Pickling", "Fresh markets"], "season": "Warm season", "quality_factors": "Straightness, color, crispness"}'::jsonb,
    true
);

-- ============================================
-- LEAFY VEGETABLES
-- ============================================

-- Lettuce
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Lettuce',
    'Quick crop (45-70 days), nitrogen-responsive. Prefers cooler temperatures.',
    'Leafy Vegetables',
    '{"spacing": "30-40cm rows, 20-30cm in-row", "propagation": "Direct seed or transplants", "maturity": "45-70 days", "harvest_frequency": "Once per planting", "plantDensity": "100,000-150,000 plants/ha", "germination": {"temperature": "15-20°C", "days": "2-10", "substrate": "50% coir, 50% perlite", "notes": "Light-sensitive; don't cover seeds deeply; prefers cool conditions"}}'::jsonb,
    '{"initial_investment_per_ha": 60000, "annual_revenue_per_ha": 95000, "roi_percentage": 58, "break_even_months": 5, "productive_years": "1 (annual with succession)"}'::jsonb,
    '{"climate": "Cool temperate", "temperature_range": "15-20°C", "rainfall": "400-600mm", "frost_tolerance": "Light frost tolerant", "water_needs": "High", "soil_ph": "6.0-7.0", "soil_type": "Well-drained loam", "fertility": "Apply N in small frequent doses, avoid excess near harvest"}'::jsonb,
    '{"demand": "Very high", "price_range": "8-20 ZAR", "price_unit": "head", "markets": ["Retail", "Restaurants", "Fast food"], "season": "Cool season", "quality_factors": "Crispness, head formation, shelf life"}'::jsonb,
    true
);

-- Spinach
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Spinach',
    'Heavy nitrogen feeder. Maintain adequate Fe and Mg. Prefers pH 6.0-7.0.',
    'Leafy Vegetables',
    '{"spacing": "30-40cm rows, 8-15cm in-row", "propagation": "Direct seeding", "maturity": "40-60 days", "harvest_frequency": "Cut and come again or single harvest", "plantDensity": "400,000-800,000 plants/ha", "germination": {"temperature": "10-20°C", "days": "7-14", "substrate": "50% coir, 25% perlite, 25% vermiculite", "notes": "Direct seed preferred; soak seeds 24h for faster germination; cool season crop"}}'::jsonb,
    '{"initial_investment_per_ha": 55000, "annual_revenue_per_ha": 85000, "roi_percentage": 55, "break_even_months": 4, "productive_years": "1 (annual with succession)"}'::jsonb,
    '{"climate": "Cool temperate", "temperature_range": "10-20°C", "rainfall": "400-600mm", "frost_tolerance": "Frost tolerant", "water_needs": "Moderate to high", "soil_ph": "6.0-7.0", "soil_type": "Well-drained loam", "fertility": "Apply 100-150 lb N/ac split, monitor Fe/Mg"}'::jsonb,
    '{"demand": "High", "price_range": "15-30 ZAR", "price_unit": "kg", "markets": ["Retail", "Restaurants", "Processing"], "season": "Cool season", "quality_factors": "Leaf size, color, tenderness"}'::jsonb,
    true
);

-- Cabbage
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info, is_public)
VALUES (
    'Cabbage',
    'Heavy feeder requiring consistent high nutrition. Apply Ca for head quality.',
    'Leafy Vegetables',
    '{"spacing": "60-75cm rows, 40-50cm in-row", "propagation": "Transplants", "maturity": "70-120 days", "harvest_frequency": "Once per planting", "plantDensity": "30,000-45,000 plants/ha", "germination": {"temperature": "15-20°C", "days": "4-10", "substrate": "50% coir, 25% perlite, 25% vermiculite", "notes": "Start indoors 4-6 weeks before transplant; cool season crop"}}'::jsonb,
    '{"initial_investment_per_ha": 70000, "annual_revenue_per_ha": 110000, "roi_percentage": 57, "break_even_months": 6, "productive_years": "1 (annual with succession)"}'::jsonb,
    '{"climate": "Cool temperate", "temperature_range": "15-20°C", "rainfall": "500-700mm", "frost_tolerance": "Frost tolerant", "water_needs": "High", "soil_ph": "6.0-7.0", "soil_type": "Fertile loam", "fertility": "Split N 40/60, apply Ca for head quality, adequate B (1-2 lb/ac)"}'::jsonb,
    '{"demand": "High", "price_range": "10-25 ZAR", "price_unit": "head", "markets": ["Retail", "Processing", "Food service"], "season": "Cool season", "storage": "3-4 months refrigerated"}'::jsonb,
    true
);

COMMIT;
