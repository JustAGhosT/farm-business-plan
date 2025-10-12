# Database Migrations and Seeds for Fertility Management

## Overview

This directory contains database migrations and seed files for the comprehensive fertility management system. All fertility data has been moved from hardcoded JSON/constants in the API code to properly structured database tables.

## Migration Files

### 005_add_fertility_management_tables.sql

Creates 5 new tables for storing fertility management data:

1. **crop_fertility_data** - Stores nutrient removal rates and fertility requirements for 18 crops
   - Nutrient removal rates (P₂O₅, K₂O, N, S, Ca, B)
   - Yield units (bu, ton, cwt)
   - pH ranges and micronutrient requirements
   - Fertility notes and recommendations

2. **nitrogen_programs** - Stores nitrogen management strategies for crop transitions
   - N credits between crops (e.g., soybean provides 30-45 lb N/ac)
   - Application strategies (split, sidedress, fertigation)
   - Monitoring requirements (petiole nitrate targets, etc.)

3. **cover_crops** - Stores cover crop recommendations by rotation window
   - Primary and optional cover crops
   - Benefits and timing
   - Termination notes

4. **potassium_sources** - Stores K source recommendations by crop
   - Preferred sources (K₂SO₄ for potatoes, KCl for general use)
   - Timing and placement recommendations
   - Sources to avoid

5. **crop_monitoring_protocols** - Stores tissue testing and monitoring protocols
   - Sample types and frequency
   - Target ranges
   - Visual indicators and symptoms to watch

## Seed Files

### 002_fertility_data.sql

Populates all fertility management tables with data for 18 crops:

**Field Crops:** Soybean, Grain Sorghum, Maize, Wheat, Lucerne  
**High-Value Crops:** Potato, Sweet Potato  
**Root Vegetables:** Beetroot, Carrot, Onion  
**Fruiting Vegetables:** Tomato, Pepper, Cucumber  
**Leafy Vegetables:** Lettuce, Spinach, Cabbage  
**Specialty Crops:** Dragon Fruit, Moringa, Sunflower

### 003_enhanced_crop_templates.sql

Enhanced crop templates seed file that includes comprehensive information for all 18 crops:

- Technical specifications (spacing, propagation, maturity)
- Financial projections (investment, revenue, ROI, break-even)
- Growing requirements (climate, temperature, rainfall, soil pH, fertility notes)
- Market information (demand, pricing, markets, quality factors)

## Running Migrations

### Using psql:

```bash
# Run migration
psql -U your_user -d farm_business_plan -f db/migrations/005_add_fertility_management_tables.sql

# Run seed files
psql -U your_user -d farm_business_plan -f db/seeds/002_fertility_data.sql
psql -U your_user -d farm_business_plan -f db/seeds/003_enhanced_crop_templates.sql
```

### Using node-postgres:

```javascript
const { query } = require('./lib/db')
const fs = require('fs')

// Run migration
const migrationSQL = fs.readFileSync(
  'db/migrations/005_add_fertility_management_tables.sql',
  'utf8'
)
await query(migrationSQL)

// Run seeds
const seedSQL = fs.readFileSync('db/seeds/002_fertility_data.sql', 'utf8')
await query(seedSQL)
```

## API Integration

The fertility management API (`/api/fertility-management`) now fetches data from these database tables instead of using hardcoded constants:

- **GET /api/fertility-management** - Fetches all reference data from database
- **POST /api/fertility-management** - Generates fertility plans using database data
- **PUT /api/fertility-management** - Generates AI-ready recommendations using database data

## Benefits of Database Storage

1. **Scalability** - Easy to add new crops without code changes
2. **Maintainability** - Update fertility data without redeploying application
3. **Flexibility** - User-specific or region-specific fertility recommendations possible
4. **Performance** - Indexed queries for fast data retrieval
5. **Data Integrity** - Proper relationships and constraints enforced
6. **Auditing** - Track changes to fertility recommendations over time

## Data Sources

All fertility recommendations are based on peer-reviewed sources:

- University of Minnesota Extension
- Illinois Extension
- NDSU Extension
- New England Vegetable Management Guide
- SARE (Sustainable Agriculture Research)
- Kansas State eUpdate
- And other agricultural research institutions

## Future Enhancements

Potential improvements to the fertility management database:

1. **Regional Variations** - Store region-specific fertility recommendations
2. **User Customization** - Allow users to override default recommendations
3. **Historical Data** - Track actual vs. predicted nutrient removal
4. **Soil Test Integration** - Store and analyze soil test results over time
5. **Recommendation Engine** - ML-based recommendations based on historical performance

## Maintenance

### Updating Fertility Data

```sql
-- Example: Update potato P₂O₅ removal rate
UPDATE crop_fertility_data
SET p2o5_removal_rate = 3.2
WHERE crop_name = 'potato';

-- Example: Add new nitrogen program
INSERT INTO nitrogen_programs (from_crop, to_crop, transition_name, nitrogen_credit, recommendations)
VALUES ('wheat', 'soybean', 'wheat-to-soybean', NULL, ARRAY['Standard rotation practices']);
```

### Adding New Crops

```sql
-- Add new crop fertility data
INSERT INTO crop_fertility_data (
  crop_name, crop_category, p2o5_removal_rate, k2o_removal_rate,
  yield_unit, description, fertility_notes
) VALUES (
  'broccoli', 'Vegetables', 1.8, 7.5, 'ton',
  'Broccoli head removal rates per ton',
  'Moderate feeder, requires consistent Ca and B'
);

-- Add corresponding crop template
INSERT INTO crop_templates (name, description, category, technical_specs, financial_projections, growing_requirements, market_info)
VALUES (...);
```

## Schema Updates

When updating the schema:

1. Create a new migration file (e.g., `006_update_fertility_tables.sql`)
2. Include both forward (changes) and rollback SQL
3. Test migrations on a development database first
4. Document changes in this README
5. Update seed files if necessary

## Rollback

To rollback the fertility management tables:

```sql
BEGIN;

DROP TABLE IF EXISTS crop_monitoring_protocols;
DROP TABLE IF EXISTS potassium_sources;
DROP TABLE IF EXISTS cover_crops;
DROP TABLE IF EXISTS nitrogen_programs;
DROP TABLE IF EXISTS crop_fertility_data;

COMMIT;
```

**Note:** This will delete all fertility data. Make sure to backup first!
