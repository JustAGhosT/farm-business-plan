# Fertility Management API

## Overview

The Fertility Management API provides science-based nutrient recommendations based on soil testing, crop-specific removal rates, and precision agriculture principles. This endpoint replaces blanket annual applications with targeted, efficient strategies.

## Base URL

```
/api/fertility-management
```

## Endpoints

### GET /api/fertility-management

Get reference data for nutrient removal rates, nitrogen programs, potassium sources, cover crops, and monitoring systems.

#### Request

No parameters required.

#### Response

```json
{
  "success": true,
  "data": {
    "nutrientRemovalRates": {
      "soybean": {
        "p2o5_lb": 0.75,
        "k2o_lb": 1.17,
        "unit": "bu",
        "description": "Soybean grain removal rates per bushel"
      },
      "potato": {
        "p2o5_lb": 3.0,
        "k2o_lb": 12.5,
        "sulfur_lb": 1.5,
        "unit": "ton",
        "description": "Potato tuber removal rates per ton",
        "notes": "Add 15-30 lb S/ac (sulfate) on sands/irrigated ground"
      },
      "beetroot": {
        "p2o5_lb": 2.5,
        "k2o_lb": 10.0,
        "boron_lb": 0.15,
        "unit": "ton",
        "description": "Beetroot removal rates per ton",
        "notes": "Requires 2-3 lb B/ac preplant, maintain pH 6.2-7.0"
      },
      "grain-sorghum": {
        "p2o5_lb": 0.42,
        "k2o_lb": 0.23,
        "unit": "bu",
        "description": "Grain sorghum removal rates per bushel"
      },
      "sunflower": {
        "p2o5_lb": 1.2,
        "k2o_lb": 0.8,
        "unit": "cwt",
        "description": "Sunflower grain removal rates per cwt",
        "notes": "Returns K via residue cycling - account for residue return"
      }
    },
    "nitrogenPrograms": {
      "soybean-to-potato": {
        "soybeanCredit": 37.5,
        "potatoStrategy": {
          "description": "Split application with petiole nitrate monitoring",
          "preplant": "Base N on soil test, typical 100-150 lb N/ac",
          "sidedress": "Fertigation during bulking, monitor petioles",
          "petioleTarget": "13,000-15,000 ppm NO₃-N during bulking",
          "sulfur": "15-30 lb S/ac as sulfate form"
        }
      },
      "potato-to-sorghum": {
        /* ... */
      },
      "sorghum-to-beetroot": {
        /* ... */
      },
      "beetroot-to-sunflower": {
        /* ... */
      },
      "sunflower-to-soybean": {
        /* ... */
      }
    },
    "potassiumSources": {
      /* ... */
    },
    "coverCrops": {
      /* ... */
    },
    "monitoringSystem": {
      /* ... */
    }
  }
}
```

---

### POST /api/fertility-management

Generate a comprehensive fertility management plan based on crop rotation and site conditions.

#### Request Body

```json
{
  "crops": ["soybean", "potato", "grain-sorghum", "beetroot", "sunflower"],
  "yieldTargets": {
    "soybean": 50,
    "potato": 20,
    "grain-sorghum": 100,
    "beetroot": 15,
    "sunflower": 30
  },
  "soilTests": {
    "pH": 6.5,
    "P_ppm": 25,
    "K_ppm": 180,
    "OM_percent": 2.5
  },
  "soilType": "sandy loam"
}
```

#### Parameters

| Parameter    | Type   | Required | Description                                                   |
| ------------ | ------ | -------- | ------------------------------------------------------------- |
| crops        | array  | Yes      | Array of crop names in rotation sequence                      |
| yieldTargets | object | No       | Expected yield by crop (in crop-specific units)               |
| soilTests    | object | No       | Recent soil test results                                      |
| soilType     | string | No       | Soil classification (e.g., "sandy loam", "clay", "silt loam") |

## Supported Crops

The fertility management system now supports **18 crops** across multiple categories:

### Field Crops

- `soybean` - Nitrogen-fixing legume (bushels)
- `grain-sorghum` - Drought-tolerant grain (bushels)
- `maize` - Corn for grain or silage (bushels)
- `wheat` - Small grain cereal (bushels)
- `lucerne` - Alfalfa for hay (tons)

### High-Value Crops

- `potato` - High-value tuber crop (tons)
- `sweet-potato` - Root crop with high K needs (tons)

### Root Vegetables

- `beetroot` - Root vegetable with B requirements (tons)
- `carrot` - Root crop requiring loose soil (tons)
- `onion` - Bulb crop with S requirements (tons)

### Fruiting Vegetables

- `tomato` - Heavy feeder with Ca needs (tons)
- `pepper` - Bell/chili peppers (tons)
- `cucumber` - Fast-growing vine crop (tons)

### Leafy Vegetables

- `lettuce` - Quick crop, nitrogen-responsive (tons)
- `spinach` - Heavy N feeder (tons)
- `cabbage` - Heavy feeder, head crop (tons)

### Specialty Crops

- `dragon-fruit` - Perennial cactus fruit (tons)
- `moringa` - Multi-harvest leaf crop (tons)
- `sunflower` - Oilseed crop (hundredweight/cwt)

#### Response

```json
{
  "success": true,
  "data": {
    "cropSequence": ["soybean", "potato", "grain-sorghum", "beetroot", "sunflower"],
    "soilType": "sandy loam",
    "nutrientRecommendations": [
      {
        "crop": "potato",
        "yieldTarget": 20,
        "unit": "ton",
        "removal": {
          "p2o5_lb": 60,
          "k2o_lb": 250,
          "sulfur_lb": 30
        },
        "recommendations": [
          "Base P/K rates on soil test results using sufficiency strategy",
          "Use K₂SO₄ (SOP) for quality - avoid heavy preplant KCl",
          "Split N: preplant/at-plant + early sidedress/fertigation",
          "Monitor petiole nitrate weekly during bulking (target 13,000-15,000 ppm)",
          "Add 15-30 lb S/ac as sulfate form",
          "Sandy soil: Expect low residual K, check 0-6\" depth"
        ],
        "notes": "Add 15-30 lb S/ac (sulfate) on sands/irrigated ground"
      }
      // ... more crops
    ],
    "transitionGuidance": [
      {
        "from": "soybean",
        "to": "potato",
        "guidance": {
          "soybeanCredit": 37.5,
          "potatoStrategy": {
            "description": "Split application with petiole nitrate monitoring",
            "preplant": "Base N on soil test, typical 100-150 lb N/ac",
            "sidedress": "Fertigation during bulking, monitor petioles",
            "petioleTarget": "13,000-15,000 ppm NO₃-N during bulking",
            "sulfur": "15-30 lb S/ac as sulfate form"
          }
        }
      }
      // ... more transitions
    ],
    "monitoringSchedule": {
      "soilTesting": {
        "annual": "Test 0-6\" every crop year (pH, P, K, Zn, OM, CEC)",
        "nitrate": "Test 0-24\" nitrate-N and sulfate-S each year",
        "method": "Zone or grid sampling for variable-rate application"
      },
      "tissueTesting": [
        {
          "crop": "potato",
          "protocol": {
            "sample": "Petiole NO₃ weekly from tuber initiation through bulking",
            "target": "13,000-15,000 ppm NO₃-N",
            "action": "Adjust fertigation to keep within range"
          }
        }
        // ... more crops
      ]
    },
    "coverCropPlan": [
      {
        "after": "potato",
        "before": "grain-sorghum",
        "recommendation": {
          "primary": "Rye",
          "optional": "Crimson clover with rye for spring N",
          "benefits": "Catch leachable N, protect soil structure",
          "timing": "Plant immediately after harvest"
        }
      }
      // ... more cover crop recommendations
    ],
    "criticalAmendments": {
      "phosphorus": {
        "strategy": "Sufficiency-based (apply when soil tests indicate yield response)",
        "placement": "Band placement for efficiency where applicable",
        "avoidBlanket": "Replace fixed annual P/K with soil-test + removal-based plans"
      },
      "potassium": {
        "strategy": "Soil test + removal rates",
        "residueCycling": "Account for K returned via crop residues (sunflower, sorghum)",
        "sources": {
          "potato": {
            "preferred": "K₂SO₄ (Sulfate of Potash - SOP)",
            "reason": "Better for specific gravity and fry color",
            "avoid": "Heavy preplant KCl near tuber bulking"
          }
        }
      },
      "sulfur": {
        "crops": ["potato", "sunflower"],
        "rate": "15-30 lb S/ac as sulfate form",
        "conditions": "Especially on sandy/irrigated soils"
      },
      "boron": {
        "targetCrops": ["beetroot"],
        "optionalCrops": ["sunflower (if local response documented)"],
        "rate": "2-3 lb B/ac for beets, preplant broadcast",
        "warning": "Narrow safety margin - do not exceed label rates"
      }
    }
  },
  "message": "Fertility management plan generated successfully"
}
```

---

### PUT /api/fertility-management

Generate fertility management plan with AI-ready recommendations for integration with the AI recommendations system.

#### Request Body

```json
{
  "farmPlanId": 123,
  "crops": ["soybean", "potato", "tomato"],
  "yieldTargets": {
    "soybean": 50,
    "potato": 20,
    "tomato": 15
  },
  "soilType": "sandy loam",
  "includeAI": true
}
```

#### Parameters

| Parameter    | Type    | Required | Description                                       |
| ------------ | ------- | -------- | ------------------------------------------------- |
| farmPlanId   | number  | No       | Farm plan ID for linking recommendations          |
| crops        | array   | Yes      | Array of crop names in rotation sequence          |
| yieldTargets | object  | No       | Expected yield by crop                            |
| soilType     | string  | No       | Soil classification                               |
| includeAI    | boolean | No       | Generate AI-ready recommendations (default: true) |

#### Response

```json
{
  "success": true,
  "data": {
    "fertilityPlan": {
      "cropSequence": ["soybean", "potato", "tomato"],
      "soilType": "sandy loam",
      "nutrientRecommendations": [
        /* full plan */
      ],
      "transitionGuidance": [
        /* transitions */
      ],
      "monitoringSchedule": {
        /* schedule */
      },
      "coverCropPlan": [
        /* cover crops */
      ],
      "criticalAmendments": {
        /* amendments */
      }
    },
    "aiRecommendations": [
      {
        "category": "fertility",
        "priority": 10,
        "recommendation_text": "Critical: Sufficiency-based P/K strategy. Switch from blanket applications to reduce costs by 10-30%."
      },
      {
        "category": "fertility",
        "priority": 8,
        "recommendation_text": "POTATO: Use K₂SO₄ (SOP) for quality | Split N applications | Monitor petiole nitrate weekly"
      },
      {
        "category": "fertility",
        "priority": 6,
        "recommendation_text": "potato: Targeting 20 ton will remove 60 lb P₂O₅ and 250 lb K₂O per acre."
      },
      {
        "category": "operations",
        "priority": 9,
        "recommendation_text": "Monitoring: Test 0-6\" annually for pH, P, K, Zn, OM, CEC"
      },
      {
        "category": "sustainability",
        "priority": 7,
        "recommendation_text": "After potato: Plant Rye to catch leachable N and protect soil structure"
      }
    ],
    "farmPlanId": 123
  },
  "message": "Fertility plan with AI recommendations generated successfully"
}
```

#### AI Recommendation Categories

The PUT endpoint generates AI-ready recommendations categorized for easy integration:

| Category           | Description                                                   | Priority Range |
| ------------------ | ------------------------------------------------------------- | -------------- |
| **fertility**      | Nutrient management, fertilizer recommendations, soil testing | 6-10           |
| **crop-rotation**  | Crop sequence and transition guidance                         | 7              |
| **operations**     | Monitoring schedules and procedures                           | 9              |
| **sustainability** | Cover crops, soil health practices                            | 7              |

**Priority Levels:**

- 10: Critical amendments and strategies
- 9: Essential monitoring and operations
- 8: Crop-specific high-priority recommendations
- 7: Transitions, cover crops, sustainability
- 6: Nutrient removal calculations and planning

---

## Usage Examples

### Example 1: Get Reference Data

```javascript
const response = await fetch('/api/fertility-management')
const data = await response.json()

console.log('Potato P removal rate:', data.data.nutrientRemovalRates.potato.p2o5_lb)
// Output: 3.0 lb P₂O₅ per ton
```

### Example 2: Generate Fertility Plan for Soybean-Potato Rotation

```javascript
const plan = await fetch('/api/fertility-management', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    crops: ['soybean', 'potato'],
    yieldTargets: {
      soybean: 50, // bu/ac
      potato: 20, // tons/ac
    },
    soilType: 'sandy loam',
  }),
})

const result = await plan.json()

if (result.success) {
  console.log('Potato P₂O₅ removal:', result.data.nutrientRecommendations[1].removal.p2o5_lb)
  // Output: 60 lb P₂O₅ (20 tons × 3 lb/ton)

  console.log('Soybean N credit:', result.data.transitionGuidance[0].guidance.soybeanCredit)
  // Output: 37.5 lb N/ac
}
```

### Example 3: Get Monitoring Schedule for Multiple Crops

```javascript
const plan = await fetch('/api/fertility-management', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    crops: ['potato', 'beetroot', 'sunflower'],
    soilType: 'sandy',
  }),
})

const result = await plan.json()

result.data.monitoringSchedule.tissueTesting.forEach((test) => {
  console.log(`${test.crop}:`, test.protocol.sample)
})

// Output:
// potato: Petiole NO₃ weekly from tuber initiation through bulking
// beetroot: Tissue testing plus visual for B deficiency
// sunflower: Scout for B/Zn symptoms
```

### Example 4: Calculate Nutrient Removal for High Yield

```javascript
const plan = await fetch('/api/fertility-management', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    crops: ['potato'],
    yieldTargets: { potato: 25 }, // High yield target
    soilType: 'loam',
  }),
})

const result = await plan.json()
const removal = result.data.nutrientRecommendations[0].removal

console.log(`For 25 ton/ac potato yield:`)
console.log(`P₂O₅ removal: ${removal.p2o5_lb} lb/ac`) // 75 lb
console.log(`K₂O removal: ${removal.k2o_lb} lb/ac`) // 312.5 lb
console.log(`S removal: ${removal.sulfur_lb} lb/ac`) // 37.5 lb
```

## Error Responses

### 400 Bad Request - Missing Crops

```json
{
  "success": false,
  "error": "Crops array is required"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to generate fertility management plan",
  "details": "Error message details"
}
```

## Integration with Other APIs

The Fertility Management API works seamlessly with:

- **AI Recommendations API** (`/api/ai-recommendations`) - Use PUT endpoint to generate AI-ready recommendations
- **Crop Rotation API** (`/api/crop-rotation`) - For complete rotation planning
- **Farm Plans API** (`/api/farm-plans`) - For site-specific planning
- **Task Scheduling API** (`/api/task-scheduling`) - For scheduling soil tests and applications

### Example: Integrating with AI Recommendations

```javascript
// Step 1: Generate fertility plan with AI recommendations
const fertilityResponse = await fetch('/api/fertility-management', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    farmPlanId: 123,
    crops: ['dragon-fruit', 'moringa', 'tomato'],
    yieldTargets: { 'dragon-fruit': 10, moringa: 5, tomato: 15 },
    soilType: 'sandy loam',
    includeAI: true,
  }),
})

const fertilityData = await fertilityResponse.json()

// Step 2: Save AI recommendations to database
for (const aiRec of fertilityData.data.aiRecommendations) {
  await fetch('/api/ai-recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      farm_plan_id: 123,
      recommendation_text: aiRec.recommendation_text,
      category: aiRec.category,
      priority: aiRec.priority,
    }),
  })
}

console.log(`Saved ${fertilityData.data.aiRecommendations.length} AI recommendations`)
```

### Example: New Crop Support

```javascript
// Dragon fruit fertility plan
const dragonFruitPlan = await fetch('/api/fertility-management', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    crops: ['dragon-fruit'],
    yieldTargets: { 'dragon-fruit': 12 }, // 12 tons per acre
    soilType: 'well-drained loam',
  }),
})

const plan = await dragonFruitPlan.json()
console.log('Dragon fruit recommendations:', plan.data.nutrientRecommendations[0])
// Output includes: Ca requirements, organic matter benefits, pH management

// Vegetable crop mix
const veggiePlan = await fetch('/api/fertility-management', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    crops: ['tomato', 'cucumber', 'lettuce', 'spinach'],
    yieldTargets: { tomato: 15, cucumber: 12, lettuce: 8, spinach: 6 },
    soilType: 'sandy loam',
  }),
})

const vegData = await veggiePlan.json()
console.log('Vegetable crops monitored:', vegData.data.nutrientRecommendations.length)
// Output: 4 crops with specific recommendations for each
```

## Best Practices

1. **Soil Testing First**: Always obtain current soil test results before generating recommendations
2. **Accurate Yield Targets**: Use realistic yield targets based on historical data
3. **Update Regularly**: Regenerate plans annually or when rotation changes
4. **Monitor Tissue**: Follow the monitoring schedule, especially for potato petiole nitrate
5. **Account for Residues**: Don't forget to credit K from sunflower and sorghum residues
6. **White Mold Management**: Enforce the 3-year break between sunflower and soybean where white mold is present

## Key Principles

1. **Sufficiency Strategy**: Apply P/K only when soil tests indicate a yield response
2. **Removal-Based**: Calculate removals using crop-specific rates and actual yields
3. **Transition Management**: Account for N credits and immobilization between crops
4. **Quality Focus**: Use appropriate K sources (SOP for potatoes) to maintain crop quality
5. **Precise Micronutrients**: Apply boron and sulfur only where needed, based on testing

## References

- University of Minnesota Extension - Soil Fertility Management
- Illinois Extension - Crop Nutrient Removal Rates
- NDSU Extension - Crop Production Guidelines
- New England Vegetable Management Guide - Nutrient Management
- SARE - Sustainable Agriculture Practices

---

For more information, see:

- [Fertility Management Guide](/docs/fertility-management.md)
- [Operations Manual - Fertility Monitoring](/docs/operations-manual.md#48-fertility-management-and-soil-monitoring)
- [Crop Rotation API](/docs/guides/api-reference/AUTOMATION_APIS.md#crop-rotation-planning-api)
