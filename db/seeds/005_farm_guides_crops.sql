-- Seed data for the new crops table for the Farming Guides feature

INSERT INTO crops (
    name,
    slug,
    scientific_name,
    description,
    image_url,
    category,
    climate_requirements,
    cultivation_requirements,
    production_timeline,
    economic_analysis,
    market_analysis,
    risk_assessment,
    strategic_recommendations
) VALUES
(
    'Jalapeño Peppers (Organic)',
    'jalapeno-peppers',
    'Capsicum annuum',
    'A popular chili pepper with a mild to moderate heat, ideal for fresh use and value-added products like sauces and pickles. This guide outlines a dual-cohort strategy for a 6-month continuous harvest.',
    '/images/crops/jalapeno.jpg',
    'Annual, Vegetable (Fruit)',
    '{
        "Temperature range": "21-29°C (Optimal)",
        "Frost tolerance": "Sensitive",
        "Water needs": "Moderate (Consistent moisture)",
        "Light requirements": "Full sun (6-8 hours/day)",
        "Soil type preference": "Well-drained, sandy loam",
        "pH requirements": "6.0-6.8",
        "Drainage needs": "Excellent (Prevents root rot)"
    }',
    '#### Land Preparation
- Incorporate 5-10 tons/ha of compost to improve organic matter and water retention.
- Create raised beds to ensure excellent drainage.
- Amend soil with lime if pH is below 6.0.

#### Planting
- **Method**: Transplanting seedlings (purchased and self-grown).
- **Optimal planting time**: September (for early summer harvest) and October (for extended season).
- **Spacing**: 30-45 cm within row, 60-90 cm between rows.
- **Planting depth**: Same depth as the seedling container.

#### Water Management
- **Establishment phase**: Consistent watering to keep soil moist.
- **Mature plants**: Drip irrigation is ideal to provide 2.5-5 cm of water per week.
- **Critical water periods**: Flowering and fruit development.

#### Ongoing Care
- **Weed management**: Mulching to suppress weeds and retain moisture.
- **Pest and disease management**: Monitor for common pests like aphids and implement organic controls as needed.
- **Support**: Staking may be necessary as plants become heavy with fruit.',
    '{
        "Cohort 1: Seedlings": {
            "First Harvest": "Mid-November 2025",
            "Peak Production": "Dec 2025 - Feb 2026",
            "Final Harvest": "Mar-Apr 2026"
        },
        "Cohort 2: Seeds": {
            "Germination": "Early November 2025",
            "Transplant Ready": "Mid-December 2025",
            "First Harvest": "Feb-Mar 2026",
            "Final Harvest": "May 2026"
        }
    }',
    '#### Initial Investment
- **Seedlings Purchase**: 75 units @ R15 = R1,125
- **Seed Purchase**: ~100 seeds @ R2 = R200
- **Total Investment**: **R1,325**

#### Revenue Projections (Combined Cohorts)
- **September Seedlings (75 plants)**: R5,900 - R10,400
- **October Seeds (60 plants)**: R4,000 - R7,000
- **Total Potential Revenue**: **R9,900 - R17,400**

*Note: Net profit does not account for ongoing operational costs (water, fertilizer, labor).*',
    '#### Target Markets
- **Primary**: Direct-to-consumer (local markets), restaurants, and lodges in the Bela-Bela tourism hub.
- **Secondary**: Value-added processing for sauces and pickles.

#### Competitive Advantage
- **Timing**: Harvesting in November while others are still establishing plants.
- **Continuous Supply**: A dual-cohort strategy provides a 6-month continuous supply that few small growers can match.',
    '{
        "Pest Outbreak": {"Probability": "Medium", "Impact": "Medium", "Mitigation": "Implement Integrated Pest Management (IPM); regular scouting."},
        "Water Shortage": {"Probability": "Medium", "Impact": "High", "Mitigation": "Drip irrigation for efficiency; explore backup water sources."},
        "Market Saturation": {"Probability": "Low", "Impact": "Medium", "Mitigation": "Focus on value-added products; build direct client relationships."},
        "Crop Failure (one cohort)": {"Probability": "Low", "Impact": "Medium", "Mitigation": "Dual-cohort strategy inherently mitigates this risk."}
    }',
    'The dual-cohort jalapeño strategy is a low-risk, high-reward approach that provides immediate cash flow, extended market presence, and invaluable operational learning. It is **highly recommended**.'
),
(
    'Heirloom Tomatoes',
    'heirloom-tomatoes',
    'Solanum lycopersicum',
    'A high-value crop prized for its unique flavors, colors, and shapes. Heirloom tomatoes can command premium prices but require careful management of water, pests, and diseases.',
    '/images/crops/heirloom-tomato.jpg',
    'Annual, Vegetable (Fruit)',
    '{
        "Temperature range": "21-29°C (Optimal)",
        "Frost tolerance": "Sensitive",
        "Water needs": "High (Consistent moisture is key)",
        "Light requirements": "Full sun (8+ hours/day)",
        "Soil type preference": "Fertile, well-drained loam",
        "pH requirements": "6.2-6.8",
        "Drainage needs": "Excellent"
    }',
    '#### Land Preparation
- Incorporate large amounts of well-rotted compost or manure.
- Prepare deep, loose soil to accommodate extensive root systems.
- Install sturdy trellising or staking systems before planting.

#### Planting
- **Method**: Transplanting seedlings.
- **Optimal planting time**: After the last frost date (e.g., late August/early September).
- **Spacing**: 60-90 cm within row, 1.2-1.5 m between rows.
- **Planting depth**: Plant deep, burying the bottom two-thirds of the stem to encourage root growth.

#### Water Management
- **System**: Drip irrigation is essential to prevent foliage diseases.
- **Frequency**: Deep, infrequent watering to encourage deep roots.

#### Ongoing Care
- **Pruning**: Prune indeterminate varieties to a few main stems to improve air circulation and fruit size.
- **Weed management**: Heavy mulching is critical to retain moisture and suppress weeds.',
    '{
        "Seed Starting": "6-8 weeks before transplant",
        "Transplanting": "Sep/Oct",
        "First Harvest": "~70-90 days from transplant",
        "Peak Production": "Dec - Mar",
        "Final Harvest": "Apr/May"
    }',
    '#### Initial Investment
- High-quality heirloom seeds can be expensive.
- Requires robust trellising infrastructure.

#### Revenue Projections
- Premium pricing can lead to high revenue per square meter.',
    '#### Target Markets
- Farmers markets are the primary channel.
- High-end restaurants and lodges seeking unique ingredients.

#### Competitive Advantage
- Offering unique varieties not found in commercial supermarkets.
- Superior flavor and quality.',
    '{
        "Disease (Blight)": {"Probability": "High", "Impact": "High", "Mitigation": "Drip irrigation, proper spacing, pruning, crop rotation."},
        "Pest (Hornworm)": {"Probability": "Medium", "Impact": "High", "Mitigation": "Regular scouting and manual removal."},
        "Water Stress": {"Probability": "Medium", "Impact": "High", "Mitigation": "Reliable irrigation, heavy mulching."}
    }',
    'Heirloom tomatoes are a high-reward crop that fits well into a "Quick Wins" or "Medium-Term Expansion" phase. Success is highly dependent on proactive management. Recommended to start with a small trial plot before scaling.'
),
(
    'Microgreens',
    'microgreens',
    'Various (e.g., Helianthus annuus)',
    'Young, tender greens harvested just after the first true leaves have developed. Microgreens are known for their intense flavor, high nutritional value, and quick turnaround time.',
    '/images/crops/microgreens.jpg',
    'Annual, Leafy Green',
    '{
        "Temperature range": "18-24°C (Ideal for indoor)",
        "Frost tolerance": "N/A (Grown indoors/protected)",
        "Water needs": "Low (Frequent misting)",
        "Light requirements": "Medium (Supplemental light)"
    }',
    '#### Setup
- Shelving units (4-5 tiers is common).
- 1020 trays (shallow, with and without drainage holes).
- Grow lights (LED or fluorescent).
- Fans for air circulation.

#### Planting
- **Method**: Direct seeding at high density.
- **Process**: Fill tray with moist growing medium, spread seeds evenly, and cover for a 2-4 day "blackout" period.

#### Water Management
- **System**: Misting during germination, then bottom-watering once greens are established to prevent mold.

#### Ongoing Care
- **Air Circulation**: A small fan is crucial to prevent mold.
- **Lighting**: Provide 12-16 hours of light per day.',
    '{
        "Soaking (for some seeds)": "4-8 hours",
        "Sowing & Blackout": "Day 0-4",
        "Germination & Growth": "Day 4-10",
        "Harvest": "Day 7-14"
    }',
    '#### Initial Investment
- Relatively low startup costs (shelving, trays, lights, seeds).

#### Revenue Projections
- Extremely high revenue per square meter due to fast crop cycles.

#### Profitability
- Excellent cash flow crop. Profitability is dependent on consistent sales channels.',
    '#### Target Markets
- Restaurants and cafes for garnishes and salads.
- Direct-to-consumer through farmers markets and subscription boxes.
- Health food stores.

#### Competitive Advantage
- Extreme freshness and reliable, year-round supply.',
    '{
        "Mold/Damping Off": {"Probability": "High", "Impact": "High", "Mitigation": "Good air circulation, proper bottom-watering, seed sanitation."},
        "Inconsistent Germination": {"Probability": "Medium", "Impact": "Medium", "Mitigation": "Use high-quality seed, ensure proper blackout period."}
    }',
    'Microgreens are an ideal "Quick Wins" crop. They provide immediate and consistent cash flow with a low initial investment. Highly recommended to start production as soon as possible, even on a very small scale.'
),
(
    'Gourmet Mushrooms',
    'gourmet-mushrooms',
    'Pleurotus ostreatus',
    'Oyster mushrooms are a popular gourmet variety, prized for their delicate flavor and velvety texture. They can be grown indoors year-round on agricultural waste products.',
    '/images/crops/oyster-mushrooms.jpg',
    'Fungus',
    '{
        "Temperature range": "15-24°C (Fruiting)",
        "Humidity": "85-95% (Fruiting)",
        "Light requirements": "Low (Indirect light only)",
        "Air Exchange": "High (Requires frequent fresh air)"
    }',
    '#### Setup ("Fruiting Chamber")
- An insulated shed, container, or dedicated room.
- Humidifier with a controller.
- Exhaust fan with a timer to vent CO2 and bring in fresh air.
- Shelving to hold mushroom grow bags/blocks.

#### Process
1. **Obtain "Ready-to-Fruit" Blocks**: For beginners, it''s easiest to buy pre-inoculated substrate blocks.
2. **Initiate Pinning**: Cut slits in the bags and place them in the high-humidity fruiting chamber.
3. **Fruiting**: Maintain high humidity and provide frequent fresh air exchange.',
    '{
        "Initiation": "Day 0",
        "Pinning": "Day 3-7",
        "First Harvest": "Day 10-14",
        "Second Flush": "Day 20-28"
    }',
    '#### Initial Investment
- Moderate cost to set up a dedicated fruiting chamber with environmental controls.

#### Profitability
- Excellent ROI once the initial setup is paid off. Profitability depends on consistent production and sales.',
    '#### Target Markets
- Chefs at high-end restaurants are the primary customers.
- Farmers markets and specialty grocery stores.

#### Competitive Advantage
- Provide a much fresher product than what''s available in supermarkets.
- Offer unique varieties (Pink, Yellow, King Oysters).',
    '{
        "Contamination (Mold)": {"Probability": "High", "Impact": "High", "Mitigation": "Maintain sterile procedures; source high-quality substrate."},
        "Improper Fruiting": {"Probability": "Medium", "Impact": "High", "Mitigation": "Tightly control humidity and fresh air exchange."}
    }',
    'Gourmet mushrooms are an excellent "Medium-Term Expansion" crop. They require a dedicated space and initial investment in environmental controls, but offer very high returns and a stable, year-round income stream.'
);
