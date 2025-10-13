-- Migration 007: Seed Extended Crop Templates for Bela Bela, Limpopo Region
-- Created: 2025-01-13
-- Description: Seeds comprehensive crop templates with all 18 crops suitable for the region

BEGIN;

-- Delete existing crop templates to avoid duplicates
DELETE FROM crop_templates;

-- Insert 18 comprehensive crop templates optimized for Bela Bela, Limpopo Province

-- 1. Dragon Fruit
INSERT INTO crop_templates (
    name, description, category,
    technical_specs, financial_projections, growing_requirements, market_info,
    is_public
) VALUES (
    'Dragon Fruit',
    'High-value exotic fruit with wall-farming potential',
    'Fruit',
    '{"base_production_kg_per_ha": 12000, "maturity_years": 3, "growing_season": "Summer (Dec-Mar)", "yield_unit": "kg"}'::jsonb,
    '{"base_price_zar_per_kg": 65, "growth_rate_percent": 15, "price_inflation_percent": 3, "fixed_costs_per_ha": 45000, "variable_cost_per_unit": 18, "initial_investment_per_ha": 180000, "land_prep": 25000, "infrastructure": 85000, "equipment": 35000, "initial_inputs": 20000, "working_capital": 15000}'::jsonb,
    '{"region": "Bela Bela, Limpopo", "water_needs": "medium", "soil_type": "Well-drained sandy loam", "climate": "Hot summers, mild winters"}'::jsonb,
    '{"profitability": "high", "demand": "Growing export market", "export_potential": true, "price_trend": "Increasing"}'::jsonb,
    true
);

-- 2. Moringa
INSERT INTO crop_templates (
    name, description, category,
    technical_specs, financial_projections, growing_requirements, market_info,
    is_public
) VALUES (
    'Moringa',
    'Superfood crop with high nutritional value and global demand',
    'Specialty',
    '{"base_production_kg_per_ha": 8000, "maturity_years": 1, "growing_season": "Year-round", "yield_unit": "kg (dried leaves)"}'::jsonb,
    '{"base_price_zar_per_kg": 45, "growth_rate_percent": 10, "price_inflation_percent": 5, "fixed_costs_per_ha": 28000, "variable_cost_per_unit": 12, "initial_investment_per_ha": 95000, "land_prep": 18000, "infrastructure": 35000, "equipment": 22000, "initial_inputs": 12000, "working_capital": 8000}'::jsonb,
    '{"region": "Bela Bela, Limpopo", "water_needs": "low", "soil_type": "Adapts to various soils", "climate": "Drought-tolerant, heat-loving"}'::jsonb,
    '{"profitability": "high", "demand": "Growing health food market", "export_potential": true, "price_trend": "Strong growth"}'::jsonb,
    true
);

-- 3. Lucerne (Alfalfa)
INSERT INTO crop_templates (
    name, description, category,
    technical_specs, financial_projections, growing_requirements, market_info,
    is_public
) VALUES (
    'Lucerne (Alfalfa)',
    'High-value forage crop with multiple annual harvests',
    'Forage',
    '{"base_production_kg_per_ha": 18000, "maturity_years": 1, "growing_season": "Multiple cuts per year", "yield_unit": "kg (hay)"}'::jsonb,
    '{"base_price_zar_per_kg": 3.5, "growth_rate_percent": 5, "price_inflation_percent": 4, "fixed_costs_per_ha": 35000, "variable_cost_per_unit": 0.8, "initial_investment_per_ha": 75000, "land_prep": 22000, "infrastructure": 28000, "equipment": 18000, "initial_inputs": 5000, "working_capital": 2000}'::jsonb,
    '{"region": "Bela Bela, Limpopo", "water_needs": "high", "soil_type": "Deep, well-drained", "climate": "Needs irrigation"}'::jsonb,
    '{"profitability": "medium", "demand": "Stable livestock feed market", "export_potential": false, "price_trend": "Stable"}'::jsonb,
    true
);

-- 4. Tomatoes
INSERT INTO crop_templates (
    name, description, category,
    technical_specs, financial_projections, growing_requirements, market_info,
    is_public
) VALUES (
    'Tomatoes',
    'Popular vegetable crop for local and export markets',
    'Vegetable',
    '{"base_production_kg_per_ha": 60000, "maturity_years": 1, "growing_season": "Year-round with tunnels", "yield_unit": "kg"}'::jsonb,
    '{"base_price_zar_per_kg": 12, "growth_rate_percent": 3, "price_inflation_percent": 6, "fixed_costs_per_ha": 85000, "variable_cost_per_unit": 3.5, "initial_investment_per_ha": 120000, "land_prep": 20000, "infrastructure": 55000, "equipment": 25000, "initial_inputs": 15000, "working_capital": 5000}'::jsonb,
    '{"region": "Bela Bela, Limpopo", "water_needs": "high", "soil_type": "Loamy, well-drained", "climate": "Requires protection in extreme heat"}'::jsonb,
    '{"profitability": "medium", "demand": "High year-round", "export_potential": true, "price_trend": "Seasonal fluctuation"}'::jsonb,
    true
);

-- 5. Maize
INSERT INTO crop_templates (
    name, description, category,
    technical_specs, financial_projections, growing_requirements, market_info,
    is_public
) VALUES (
    'Maize',
    'Staple grain crop for local consumption and animal feed',
    'Grain',
    '{"base_production_kg_per_ha": 6000, "maturity_years": 1, "growing_season": "Summer (Oct-Mar)", "yield_unit": "kg"}'::jsonb,
    '{"base_price_zar_per_kg": 3.8, "growth_rate_percent": 2, "price_inflation_percent": 5, "fixed_costs_per_ha": 15000, "variable_cost_per_unit": 0.9, "initial_investment_per_ha": 35000, "land_prep": 8000, "infrastructure": 12000, "equipment": 10000, "initial_inputs": 4000, "working_capital": 1000}'::jsonb,
    '{"region": "Bela Bela, Limpopo", "water_needs": "medium", "soil_type": "Loamy soil", "climate": "Summer rainfall region"}'::jsonb,
    '{"profitability": "low", "demand": "Stable commodity market", "export_potential": false, "price_trend": "Stable with inflation"}'::jsonb,
    true
);

-- 6. Butternut Squash
INSERT INTO crop_templates (
    name, description, category,
    technical_specs, financial_projections, growing_requirements, market_info,
    is_public
) VALUES (
    'Butternut Squash',
    'Hardy vegetable with good storage potential',
    'Vegetable',
    '{"base_production_kg_per_ha": 35000, "maturity_years": 1, "growing_season": "Summer (Nov-Apr)", "yield_unit": "kg"}'::jsonb,
    '{"base_price_zar_per_kg": 8, "growth_rate_percent": 4, "price_inflation_percent": 5, "fixed_costs_per_ha": 38000, "variable_cost_per_unit": 2.2, "initial_investment_per_ha": 65000, "land_prep": 15000, "infrastructure": 22000, "equipment": 18000, "initial_inputs": 8000, "working_capital": 2000}'::jsonb,
    '{"region": "Bela Bela, Limpopo", "water_needs": "medium", "soil_type": "Well-drained loam", "climate": "Warm season crop"}'::jsonb,
    '{"profitability": "medium", "demand": "Good local market", "export_potential": false, "price_trend": "Stable"}'::jsonb,
    true
);

-- 7. Citrus (Oranges)
INSERT INTO crop_templates (
    name, description, category,
    technical_specs, financial_projections, growing_requirements, market_info,
    is_public
) VALUES (
    'Citrus (Oranges)',
    'Perennial fruit crop with consistent demand',
    'Fruit',
    '{"base_production_kg_per_ha": 25000, "maturity_years": 4, "growing_season": "Winter harvest (Jun-Aug)", "yield_unit": "kg"}'::jsonb,
    '{"base_price_zar_per_kg": 6.5, "growth_rate_percent": 8, "price_inflation_percent": 4, "fixed_costs_per_ha": 55000, "variable_cost_per_unit": 1.8, "initial_investment_per_ha": 145000, "land_prep": 28000, "infrastructure": 62000, "equipment": 32000, "initial_inputs": 18000, "working_capital": 5000}'::jsonb,
    '{"region": "Bela Bela, Limpopo", "water_needs": "high", "soil_type": "Well-drained, slightly acidic", "climate": "Subtropical to warm temperate"}'::jsonb,
    '{"profitability": "medium", "demand": "Stable local and export", "export_potential": true, "price_trend": "Stable"}'::jsonb,
    true
);

-- 8. Sorghum
INSERT INTO crop_templates (
    name, description, category,
    technical_specs, financial_projections, growing_requirements, market_info,
    is_public
) VALUES (
    'Sorghum',
    'Drought-resistant grain crop ideal for dry conditions',
    'Grain',
    '{"base_production_kg_per_ha": 3500, "maturity_years": 1, "growing_season": "Summer (Nov-Apr)", "yield_unit": "kg"}'::jsonb,
    '{"base_price_zar_per_kg": 4.2, "growth_rate_percent": 2, "price_inflation_percent": 4, "fixed_costs_per_ha": 12000, "variable_cost_per_unit": 1.0, "initial_investment_per_ha": 28000, "land_prep": 7000, "infrastructure": 8000, "equipment": 9000, "initial_inputs": 3000, "working_capital": 1000}'::jsonb,
    '{"region": "Bela Bela, Limpopo", "water_needs": "low", "soil_type": "Adapts to various soils", "climate": "Excellent drought tolerance"}'::jsonb,
    '{"profitability": "low", "demand": "Animal feed and brewing", "export_potential": false, "price_trend": "Stable commodity"}'::jsonb,
    true
);

-- 9. Groundnuts (Peanuts)
INSERT INTO crop_templates (
    name, description, category,
    technical_specs, financial_projections, growing_requirements, market_info,
    is_public
) VALUES (
    'Groundnuts (Peanuts)',
    'High-protein legume with nitrogen-fixing properties',
    'Legume',
    '{"base_production_kg_per_ha": 2500, "maturity_years": 1, "growing_season": "Summer (Oct-Mar)", "yield_unit": "kg"}'::jsonb,
    '{"base_price_zar_per_kg": 18, "growth_rate_percent": 3, "price_inflation_percent": 5, "fixed_costs_per_ha": 24000, "variable_cost_per_unit": 5.5, "initial_investment_per_ha": 48000, "land_prep": 12000, "infrastructure": 15000, "equipment": 14000, "initial_inputs": 5000, "working_capital": 2000}'::jsonb,
    '{"region": "Bela Bela, Limpopo", "water_needs": "low", "soil_type": "Sandy loam", "climate": "Warm season, drought-tolerant"}'::jsonb,
    '{"profitability": "high", "demand": "Growing snack and oil market", "export_potential": true, "price_trend": "Increasing"}'::jsonb,
    true
);

-- 10. Sunflower
INSERT INTO crop_templates (
    name, description, category,
    technical_specs, financial_projections, growing_requirements, market_info,
    is_public
) VALUES (
    'Sunflower',
    'Drought-tolerant oilseed crop with multiple uses',
    'Oilseed',
    '{"base_production_kg_per_ha": 2000, "maturity_years": 1, "growing_season": "Summer (Nov-Mar)", "yield_unit": "kg"}'::jsonb,
    '{"base_price_zar_per_kg": 7.5, "growth_rate_percent": 2, "price_inflation_percent": 4, "fixed_costs_per_ha": 16000, "variable_cost_per_unit": 2.0, "initial_investment_per_ha": 32000, "land_prep": 8000, "infrastructure": 10000, "equipment": 10000, "initial_inputs": 3000, "working_capital": 1000}'::jsonb,
    '{"region": "Bela Bela, Limpopo", "water_needs": "low", "soil_type": "Well-drained", "climate": "Drought-tolerant"}'::jsonb,
    '{"profitability": "medium", "demand": "Oil processing market", "export_potential": true, "price_trend": "Stable"}'::jsonb,
    true
);

-- 11. Dry Beans
INSERT INTO crop_templates (
    name, description, category,
    technical_specs, financial_projections, growing_requirements, market_info,
    is_public
) VALUES (
    'Dry Beans',
    'Protein-rich legume crop with stable market demand',
    'Legume',
    '{"base_production_kg_per_ha": 1800, "maturity_years": 1, "growing_season": "Summer (Oct-Feb)", "yield_unit": "kg"}'::jsonb,
    '{"base_price_zar_per_kg": 12, "growth_rate_percent": 2, "price_inflation_percent": 5, "fixed_costs_per_ha": 20000, "variable_cost_per_unit": 3.5, "initial_investment_per_ha": 38000, "land_prep": 10000, "infrastructure": 12000, "equipment": 11000, "initial_inputs": 4000, "working_capital": 1000}'::jsonb,
    '{"region": "Bela Bela, Limpopo", "water_needs": "medium", "soil_type": "Well-drained loam", "climate": "Warm season"}'::jsonb,
    '{"profitability": "low", "demand": "Stable food market", "export_potential": false, "price_trend": "Stable"}'::jsonb,
    true
);

-- 12. Sweet Potato
INSERT INTO crop_templates (
    name, description, category,
    technical_specs, financial_projections, growing_requirements, market_info,
    is_public
) VALUES (
    'Sweet Potato',
    'Nutritious root crop with high yield potential',
    'Root Crop',
    '{"base_production_kg_per_ha": 25000, "maturity_years": 1, "growing_season": "Summer (Sep-Mar)", "yield_unit": "kg"}'::jsonb,
    '{"base_price_zar_per_kg": 7, "growth_rate_percent": 4, "price_inflation_percent": 5, "fixed_costs_per_ha": 32000, "variable_cost_per_unit": 1.8, "initial_investment_per_ha": 55000, "land_prep": 14000, "infrastructure": 18000, "equipment": 15000, "initial_inputs": 6000, "working_capital": 2000}'::jsonb,
    '{"region": "Bela Bela, Limpopo", "water_needs": "low", "soil_type": "Sandy loam", "climate": "Warm season, drought-tolerant"}'::jsonb,
    '{"profitability": "medium", "demand": "Growing health food market", "export_potential": false, "price_trend": "Increasing"}'::jsonb,
    true
);

-- 13. Cabbage
INSERT INTO crop_templates (
    name, description, category,
    technical_specs, financial_projections, growing_requirements, market_info,
    is_public
) VALUES (
    'Cabbage',
    'Cool-season vegetable with multiple plantings per year',
    'Vegetable',
    '{"base_production_kg_per_ha": 40000, "maturity_years": 1, "growing_season": "Cool season (Apr-Aug)", "yield_unit": "kg"}'::jsonb,
    '{"base_price_zar_per_kg": 6, "growth_rate_percent": 3, "price_inflation_percent": 6, "fixed_costs_per_ha": 42000, "variable_cost_per_unit": 1.5, "initial_investment_per_ha": 68000, "land_prep": 16000, "infrastructure": 24000, "equipment": 18000, "initial_inputs": 8000, "working_capital": 2000}'::jsonb,
    '{"region": "Bela Bela, Limpopo", "water_needs": "medium", "soil_type": "Rich, well-drained", "climate": "Prefers cooler temperatures"}'::jsonb,
    '{"profitability": "low", "demand": "Stable vegetable market", "export_potential": false, "price_trend": "Seasonal variation"}'::jsonb,
    true
);

-- 14. Onions
INSERT INTO crop_templates (
    name, description, category,
    technical_specs, financial_projections, growing_requirements, market_info,
    is_public
) VALUES (
    'Onions',
    'High-demand vegetable crop with good storage potential',
    'Vegetable',
    '{"base_production_kg_per_ha": 45000, "maturity_years": 1, "growing_season": "Winter (May-Sep)", "yield_unit": "kg"}'::jsonb,
    '{"base_price_zar_per_kg": 8.5, "growth_rate_percent": 3, "price_inflation_percent": 6, "fixed_costs_per_ha": 55000, "variable_cost_per_unit": 2.0, "initial_investment_per_ha": 82000, "land_prep": 18000, "infrastructure": 28000, "equipment": 22000, "initial_inputs": 11000, "working_capital": 3000}'::jsonb,
    '{"region": "Bela Bela, Limpopo", "water_needs": "high", "soil_type": "Well-drained loam", "climate": "Cooler season crop"}'::jsonb,
    '{"profitability": "medium", "demand": "High year-round", "export_potential": true, "price_trend": "Seasonal fluctuation"}'::jsonb,
    true
);

-- 15. Peppers (Sweet & Chili)
INSERT INTO crop_templates (
    name, description, category,
    technical_specs, financial_projections, growing_requirements, market_info,
    is_public
) VALUES (
    'Peppers (Sweet & Chili)',
    'High-value specialty crop for fresh and processed markets',
    'Vegetable',
    '{"base_production_kg_per_ha": 35000, "maturity_years": 1, "growing_season": "Year-round with tunnels", "yield_unit": "kg"}'::jsonb,
    '{"base_price_zar_per_kg": 22, "growth_rate_percent": 4, "price_inflation_percent": 5, "fixed_costs_per_ha": 68000, "variable_cost_per_unit": 5.5, "initial_investment_per_ha": 105000, "land_prep": 20000, "infrastructure": 45000, "equipment": 24000, "initial_inputs": 12000, "working_capital": 4000}'::jsonb,
    '{"region": "Bela Bela, Limpopo", "water_needs": "high", "soil_type": "Well-drained, rich", "climate": "Warm season, protected cultivation"}'::jsonb,
    '{"profitability": "high", "demand": "Growing fresh and processing", "export_potential": true, "price_trend": "Strong growth"}'::jsonb,
    true
);

-- 16. Avocado
INSERT INTO crop_templates (
    name, description, category,
    technical_specs, financial_projections, growing_requirements, market_info,
    is_public
) VALUES (
    'Avocado',
    'Premium fruit crop with growing global demand',
    'Fruit',
    '{"base_production_kg_per_ha": 12000, "maturity_years": 5, "growing_season": "Year-round harvest", "yield_unit": "kg"}'::jsonb,
    '{"base_price_zar_per_kg": 35, "growth_rate_percent": 12, "price_inflation_percent": 4, "fixed_costs_per_ha": 62000, "variable_cost_per_unit": 8.0, "initial_investment_per_ha": 195000, "land_prep": 32000, "infrastructure": 75000, "equipment": 48000, "initial_inputs": 30000, "working_capital": 10000}'::jsonb,
    '{"region": "Bela Bela, Limpopo", "water_needs": "medium", "soil_type": "Well-drained, deep", "climate": "Subtropical, frost-sensitive"}'::jsonb,
    '{"profitability": "high", "demand": "Strong export market", "export_potential": true, "price_trend": "Growing demand"}'::jsonb,
    true
);

-- 17. Mango
INSERT INTO crop_templates (
    name, description, category,
    technical_specs, financial_projections, growing_requirements, market_info,
    is_public
) VALUES (
    'Mango',
    'Tropical fruit well-suited to warm Limpopo climate',
    'Fruit',
    '{"base_production_kg_per_ha": 15000, "maturity_years": 4, "growing_season": "Summer (Nov-Feb)", "yield_unit": "kg"}'::jsonb,
    '{"base_price_zar_per_kg": 18, "growth_rate_percent": 10, "price_inflation_percent": 4, "fixed_costs_per_ha": 48000, "variable_cost_per_unit": 4.5, "initial_investment_per_ha": 165000, "land_prep": 28000, "infrastructure": 68000, "equipment": 42000, "initial_inputs": 20000, "working_capital": 7000}'::jsonb,
    '{"region": "Bela Bela, Limpopo", "water_needs": "medium", "soil_type": "Well-drained loam", "climate": "Hot, tropical climate"}'::jsonb,
    '{"profitability": "high", "demand": "Strong local and export", "export_potential": true, "price_trend": "Growing"}'::jsonb,
    true
);

-- 18. Pecan Nuts
INSERT INTO crop_templates (
    name, description, category,
    technical_specs, financial_projections, growing_requirements, market_info,
    is_public
) VALUES (
    'Pecan Nuts',
    'Long-term perennial investment with premium market',
    'Nuts',
    '{"base_production_kg_per_ha": 3500, "maturity_years": 7, "growing_season": "Autumn harvest (Apr-Jun)", "yield_unit": "kg (shelled)"}'::jsonb,
    '{"base_price_zar_per_kg": 145, "growth_rate_percent": 15, "price_inflation_percent": 3, "fixed_costs_per_ha": 72000, "variable_cost_per_unit": 38, "initial_investment_per_ha": 285000, "land_prep": 38000, "infrastructure": 125000, "equipment": 75000, "initial_inputs": 35000, "working_capital": 12000}'::jsonb,
    '{"region": "Bela Bela, Limpopo", "water_needs": "low", "soil_type": "Deep, well-drained", "climate": "Requires winter chill"}'::jsonb,
    '{"profitability": "high", "demand": "Premium export market", "export_potential": true, "price_trend": "Strong growth"}'::jsonb,
    true
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_crop_templates_name ON crop_templates(name);
CREATE INDEX IF NOT EXISTS idx_crop_templates_category ON crop_templates(category);

COMMIT;
