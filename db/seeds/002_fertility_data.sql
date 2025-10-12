-- Seed data for fertility management
-- This populates crop fertility data, nitrogen programs, cover crops, potassium sources, and monitoring protocols

BEGIN;

-- ============================================
-- CROP FERTILITY DATA
-- ============================================

-- Field Crops
INSERT INTO crop_fertility_data (crop_name, crop_category, p2o5_removal_rate, k2o_removal_rate, yield_unit, description, fertility_notes) VALUES
('soybean', 'Field Crops', 0.75, 1.17, 'bu', 'Soybean grain removal rates per bushel', 'Nitrogen-fixing legume, provides 30-45 lb N/ac credit to following crop'),
('grain-sorghum', 'Field Crops', 0.42, 0.23, 'bu', 'Grain sorghum removal rates per bushel', 'Returns K via residue cycling - account for residue return'),
('maize', 'Field Crops', 0.37, 0.27, 'bu', 'Maize (corn) grain removal rates per bushel', 'Heavy nitrogen feeder, remove entire plant = 2-3x grain-only removal'),
('wheat', 'Field Crops', 0.55, 0.32, 'bu', 'Wheat grain removal rates per bushel', 'Moderate feeder, residue returns significant K if not baled'),
('lucerne', 'Field Crops', 0.55, 2.0, 'ton', 'Lucerne (alfalfa) hay removal rates per ton', 'Nitrogen-fixing legume, focus on P/K and sulfur, maintain pH 6.5-7.5');

-- Update with sulfur for lucerne
UPDATE crop_fertility_data SET sulfur_removal_rate = 0.25 WHERE crop_name = 'lucerne';

-- High-Value Crops
INSERT INTO crop_fertility_data (crop_name, crop_category, p2o5_removal_rate, k2o_removal_rate, sulfur_removal_rate, yield_unit, description, fertility_notes) VALUES
('potato', 'High-Value Crops', 3.0, 12.5, 1.5, 'ton', 'Potato tuber removal rates per ton', 'Add 15-30 lb S/ac (sulfate) on sands/irrigated ground. Use K₂SO₄ (SOP) for quality'),
('sweet-potato', 'High-Value Crops', 2.2, 11.0, NULL, 'ton', 'Sweet potato root removal rates per ton', 'High K requirement, avoid excess N which promotes vine over root');

-- Root Vegetables
INSERT INTO crop_fertility_data (crop_name, crop_category, p2o5_removal_rate, k2o_removal_rate, boron_removal_rate, yield_unit, description, fertility_notes) VALUES
('beetroot', 'Root Vegetables', 2.5, 10.0, 0.15, 'ton', 'Beetroot removal rates per ton', 'Requires 2-3 lb B/ac preplant, maintain pH 6.2-7.0');

INSERT INTO crop_fertility_data (crop_name, crop_category, p2o5_removal_rate, k2o_removal_rate, yield_unit, description, fertility_notes) VALUES
('carrot', 'Root Vegetables', 1.8, 7.0, 'ton', 'Carrot root removal rates per ton', 'Moderate feeder, avoid fresh manure, requires loose soil for straight roots'),
('onion', 'Root Vegetables', 1.5, 5.5, 'ton', 'Onion bulb removal rates per ton', 'Moderate feeder, sulfur important for pungency and storage quality');

UPDATE crop_fertility_data SET sulfur_removal_rate = 1.2 WHERE crop_name = 'onion';

-- Fruiting Vegetables
INSERT INTO crop_fertility_data (crop_name, crop_category, p2o5_removal_rate, k2o_removal_rate, calcium_removal_rate, yield_unit, description, fertility_notes) VALUES
('tomato', 'Fruiting Vegetables', 2.2, 10.0, 1.2, 'ton', 'Tomato fruit removal rates per ton', 'Heavy feeder, requires consistent Ca for blossom end rot prevention'),
('pepper', 'Fruiting Vegetables', 2.0, 8.5, 1.0, 'ton', 'Pepper (bell/chili) fruit removal rates per ton', 'Moderate feeder, sensitive to salt, avoid excess N for better fruit set');

INSERT INTO crop_fertility_data (crop_name, crop_category, p2o5_removal_rate, k2o_removal_rate, yield_unit, description, fertility_notes) VALUES
('cucumber', 'Fruiting Vegetables', 1.5, 6.0, 'ton', 'Cucumber fruit removal rates per ton', 'Fast-growing, requires frequent light fertilization, sensitive to salt');

-- Leafy Vegetables
INSERT INTO crop_fertility_data (crop_name, crop_category, p2o5_removal_rate, k2o_removal_rate, nitrogen_removal_rate, yield_unit, description, fertility_notes) VALUES
('lettuce', 'Leafy Vegetables', 1.0, 4.5, 4.0, 'ton', 'Lettuce head removal rates per ton', 'Quick crop, nitrogen-responsive, prefers cooler temperatures'),
('spinach', 'Leafy Vegetables', 1.2, 5.0, 5.5, 'ton', 'Spinach leaf removal rates per ton', 'Heavy nitrogen feeder, maintain adequate Fe and Mg, prefers pH 6.0-7.0');

INSERT INTO crop_fertility_data (crop_name, crop_category, p2o5_removal_rate, k2o_removal_rate, calcium_removal_rate, yield_unit, description, fertility_notes) VALUES
('cabbage', 'Leafy Vegetables', 1.6, 7.5, 1.3, 'ton', 'Cabbage head removal rates per ton', 'Heavy feeder, requires consistent high nutrition');

-- Specialty Crops
INSERT INTO crop_fertility_data (crop_name, crop_category, p2o5_removal_rate, k2o_removal_rate, calcium_removal_rate, yield_unit, description, fertility_notes) VALUES
('dragon-fruit', 'Specialty Crops', 2.0, 8.0, 1.5, 'ton', 'Dragon fruit removal rates per ton', 'Perennial crop, maintain soil pH 6.0-7.0, benefits from organic matter'),
('moringa', 'Specialty Crops', 1.8, 6.5, NULL, 'ton', 'Moringa leaf removal rates per ton', 'Multiple harvests per year, light feeder, benefits from organic amendments');

INSERT INTO crop_fertility_data (crop_name, crop_category, p2o5_removal_rate, k2o_removal_rate, nitrogen_removal_rate, yield_unit, description, fertility_notes) VALUES
('moringa', 'Specialty Crops', 1.8, 6.5, 5.0, 'ton', 'Moringa leaf removal rates per ton', 'Multiple harvests per year, light feeder, benefits from organic amendments')
ON CONFLICT (crop_name) DO UPDATE SET nitrogen_removal_rate = 5.0;

INSERT INTO crop_fertility_data (crop_name, crop_category, p2o5_removal_rate, k2o_removal_rate, yield_unit, description, fertility_notes) VALUES
('sunflower', 'Specialty Crops', 1.2, 0.8, 'cwt', 'Sunflower grain removal rates per cwt', 'Returns K via residue cycling - account for residue return');

-- Update pH ranges
UPDATE crop_fertility_data SET ph_range = '{"min": 6.0, "max": 7.5, "optimal": 6.5}'::jsonb WHERE crop_name = 'soybean';
UPDATE crop_fertility_data SET ph_range = '{"min": 5.5, "max": 6.5, "optimal": 6.0}'::jsonb WHERE crop_name = 'potato';
UPDATE crop_fertility_data SET ph_range = '{"min": 6.2, "max": 7.0, "optimal": 6.5}'::jsonb WHERE crop_name = 'beetroot';
UPDATE crop_fertility_data SET ph_range = '{"min": 6.0, "max": 7.0, "optimal": 6.5}'::jsonb WHERE crop_name IN ('tomato', 'dragon-fruit', 'spinach', 'lettuce');
UPDATE crop_fertility_data SET ph_range = '{"min": 6.5, "max": 7.5, "optimal": 7.0}'::jsonb WHERE crop_name = 'lucerne';

-- ============================================
-- NITROGEN PROGRAMS
-- ============================================

INSERT INTO nitrogen_programs (from_crop, to_crop, transition_name, nitrogen_credit, nitrogen_requirement, application_strategy, monitoring_requirements, recommendations) VALUES
('soybean', 'potato', 'soybean-to-potato', 37.5, 'Split application with petiole nitrate monitoring',
 '{"preplant": "Base N on soil test, typical 100-150 lb N/ac", "sidedress": "Fertigation during bulking, monitor petioles", "sulfur": "15-30 lb S/ac as sulfate form"}'::jsonb,
 '{"petioleTarget": "13,000-15,000 ppm NO₃-N during bulking", "frequency": "weekly"}'::jsonb,
 ARRAY['Credit 30-45 lb N/ac from soybean', 'Split N applications', 'Monitor petiole nitrate weekly']),

('potato', 'grain-sorghum', 'potato-to-sorghum', NULL, 'Sorghum uses leftover soil N efficiently',
 '{"soilTest": "Sample nitrate to 24\" depth to set rates", "recommendation": "Credit residual N, reduce applied rates"}'::jsonb,
 '{"residualK": "Check 0-6\" K, may be low on sands"}'::jsonb,
 ARRAY['Sample nitrate to 24" to set N rates', 'Credit residual N from potato', 'Check K on sandy soils']),

('grain-sorghum', 'beetroot', 'sorghum-to-beetroot', NULL, 'Counter N immobilization from sorghum residues',
 '{"starterN": "20-40 lb N/ac early unless residue was young", "timing": "At emergence or shortly after"}'::jsonb,
 '{"pH": {"target": "6.2-7.0", "reason": "Maximize micronutrient availability"}, "boron": {"preplant": "2-3 lb B/ac broadcast uniformly", "foliar": "Small midseason application if symptoms appear"}}'::jsonb,
 ARRAY['Add 20-40 lb N/ac early to counter immobilization', 'Maintain pH 6.2-7.0', 'Apply 2-3 lb B/ac preplant']),

('beetroot', 'sunflower', 'beetroot-to-sunflower', NULL, 'Nutritionally compatible transition',
 '{"placement": "Band P/K 2x2, keep salt away from seed", "nitrogen": {"soilTest": "Credit soil profile nitrate to 24\"", "deepSampling": "Can tap 4-6 ft where testing practical"}}'::jsonb,
 NULL,
 ARRAY['Band P/K 2x2 from seed', 'Keep all salt away from seed', 'Credit nitrate to 24" or deeper']),

('sunflower', 'soybean', 'sunflower-to-soybean', NULL, 'Insert sorghum/cereal buffer if white-mold history',
 '{"whiteMoldManagement": {"minBreak": "3-year non-host break for white mold management", "alternative": "Use varietal tolerance + canopy management + narrow intervals"}, "allelopathy": "Small-grain or oat/rye buffer to dilute allelopathy"}'::jsonb,
 NULL,
 ARRAY['Maintain 3-year break if white mold present', 'Insert cereal buffer crop', 'Plant oat/rye to dilute allelopathy']);

-- ============================================
-- COVER CROPS
-- ============================================

INSERT INTO cover_crops (after_crop, primary_cover_crop, optional_cover_crops, benefits, timing, termination_notes) VALUES
('potato', 'Rye', ARRAY['Crimson clover with rye for spring N'], 'Catch leachable N, protect soil structure', 'Plant immediately after harvest', 'Terminate 2-3 weeks before next planting'),
('sunflower', 'Small-grain or oat/rye buffer', NULL, 'Dilute allelopathy before soybeans, add biomass', 'Post-harvest', 'Before soybean planting'),
('general-biomass', 'Sorghum-sudangrass', NULL, 'Excellent biomass production, breaks compaction', 'Summer fallow', 'Terminate early (30+ days) before high-N crop to minimize immobilization');

-- ============================================
-- POTASSIUM SOURCES
-- ============================================

INSERT INTO potassium_sources (crop_name, preferred_source, reason, sources_to_avoid, alternatives, application_timing) VALUES
('potato', 'K₂SO₄ (Sulfate of Potash - SOP)', 'Better for specific gravity and fry color', ARRAY['Heavy preplant KCl near tuber bulking'], 'If using KCl for economics, apply well ahead of bulking and away from root zone', 'Apply before or at planting, avoid heavy applications near bulking'),
('general', 'KCl or K₂SO₄ based on crop', 'KCl is economical, K₂SO₄ for quality crops', NULL, NULL, 'Keep heavy K applications away from sensitive crop root zones');

-- ============================================
-- CROP MONITORING PROTOCOLS
-- ============================================

INSERT INTO crop_monitoring_protocols (crop_name, sample_type, sample_frequency, sample_timing, target_range, monitoring_action, visual_indicators, symptoms_to_watch) VALUES
('potato', 'Petiole NO₃', 'Weekly', 'From tuber initiation through bulking', '13,000-15,000 ppm NO₃-N', 'Adjust fertigation to keep within range', ARRAY['Leaf color', 'Growth vigor'], ARRAY['Yellowing (N deficiency)', 'Excessive vine growth']),

('beetroot', 'Leaf tissue', 'As needed', 'During active growth', 'Boron sufficiency', 'Foliar B application only if needed', ARRAY['Heart rot', 'Black spot', 'Internal browning'], ARRAY['Boron deficiency symptoms']),

('sunflower', 'Visual scouting', 'Bi-weekly', 'Throughout growth', 'B and Zn sufficiency', 'Apply only with documented deficiency', ARRAY['Leaf discoloration', 'Growth abnormalities'], ARRAY['B/Zn deficiency symptoms']),

('tomato', 'Leaf tissue', 'Every 2 weeks', 'Throughout fruiting', 'Ca sufficiency', 'Monitor for blossom end rot, adjust Ca', ARRAY['Blossom end rot', 'Fruit quality'], ARRAY['Calcium deficiency', 'Irregular watering effects']),

('cucumber', 'Visual + tissue', 'Weekly during production', 'During fruiting', 'N, K sufficiency', 'Adjust fertigation', ARRAY['Leaf color', 'Fruit size'], ARRAY['Nutrient deficiencies', 'Salt stress']);

COMMIT;
