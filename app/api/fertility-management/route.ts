import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * Helper function to fetch nutrient removal rates from database
 */
async function fetchNutrientRemovalRates() {
  const result = await query('SELECT * FROM crop_fertility_data ORDER BY crop_category, crop_name')

  const rates: Record<string, any> = {}
  result.rows.forEach((row: any) => {
    rates[row.crop_name] = {
      p2o5_lb: parseFloat(row.p2o5_removal_rate),
      k2o_lb: parseFloat(row.k2o_removal_rate),
      nitrogen_lb: row.nitrogen_removal_rate ? parseFloat(row.nitrogen_removal_rate) : undefined,
      sulfur_lb: row.sulfur_removal_rate ? parseFloat(row.sulfur_removal_rate) : undefined,
      calcium_lb: row.calcium_removal_rate ? parseFloat(row.calcium_removal_rate) : undefined,
      boron_lb: row.boron_removal_rate ? parseFloat(row.boron_removal_rate) : undefined,
      unit: row.yield_unit,
      description: row.description,
      notes: row.fertility_notes,
      category: row.crop_category,
      ph_range: row.ph_range,
      micronutrients: row.micronutrients,
      special_requirements: row.special_requirements,
    }
  })

  return rates
}

/**
 * Helper function to fetch nitrogen programs from database
 */
async function fetchNitrogenPrograms() {
  const result = await query('SELECT * FROM nitrogen_programs ORDER BY from_crop, to_crop')

  const programs: Record<string, any> = {}
  result.rows.forEach((row: any) => {
    programs[row.transition_name] = {
      nitrogenCredit: row.nitrogen_credit ? parseFloat(row.nitrogen_credit) : null,
      nitrogenRequirement: row.nitrogen_requirement,
      applicationStrategy: row.application_strategy,
      monitoringRequirements: row.monitoring_requirements,
      notes: row.notes,
      recommendations: row.recommendations,
    }
  })

  return programs
}

/**
 * Helper function to fetch potassium sources from database
 */
async function fetchPotassiumSources() {
  const result = await query('SELECT * FROM potassium_sources')

  const sources: Record<string, any> = {}
  result.rows.forEach((row: any) => {
    sources[row.crop_name] = {
      preferred: row.preferred_source,
      reason: row.reason,
      avoid: row.sources_to_avoid,
      alternatives: row.alternatives,
      timing: row.application_timing,
    }
  })

  return sources
}

/**
 * Helper function to fetch cover crops from database
 */
async function fetchCoverCrops() {
  const result = await query('SELECT * FROM cover_crops ORDER BY after_crop')

  const coverCrops: Record<string, any> = {}
  result.rows.forEach((row: any) => {
    coverCrops[`after-${row.after_crop}`] = {
      primary: row.primary_cover_crop,
      optional: row.optional_cover_crops ? row.optional_cover_crops.join(', ') : null,
      benefits: row.benefits,
      timing: row.timing,
      terminationNotes: row.termination_notes,
    }
  })

  return coverCrops
}

/**
 * Helper function to fetch monitoring protocols from database
 */
async function fetchMonitoringSystem() {
  const result = await query('SELECT * FROM crop_monitoring_protocols ORDER BY crop_name')

  const tissueChecks: Record<string, any> = {}
  result.rows.forEach((row: any) => {
    tissueChecks[row.crop_name] = {
      sample: `${row.sample_type} ${row.sample_frequency}`,
      sampleTiming: row.sample_timing,
      target: row.target_range,
      action: row.monitoring_action,
      visualIndicators: row.visual_indicators,
      symptomsToWatch: row.symptoms_to_watch,
    }
  })

  return {
    soilSampling: {
      frequency: 'Every crop year',
      depths: {
        standard: '0-6" (pH, P, K, Zn, OM, CEC)',
        nitrate: '0-24" nitrate-N and sulfate-S',
        deep: '2-4 ft nitrate before first sunflower (to quantify deep N)',
      },
      method: 'Zone/grid sample to support variable-rate application',
    },
    tissueChecks,
    diseaseManagement: {
      whiteMold: {
        crop: 'Sunflower and soybean',
        requirement: '3-year non-host break when white mold present',
        mitigation: 'Varietal tolerance + canopy management for shorter intervals',
      },
    },
  }
}

/**
 * Nutrient removal rates per unit yield
 * Based on University of Minnesota Extension, Illinois Extension, and other sources
 */
const NUTRIENT_REMOVAL_RATES = {
  soybean: {
    // Per bushel
    p2o5_lb: 0.75,
    k2o_lb: 1.17,
    unit: 'bu',
    description: 'Soybean grain removal rates per bushel',
  },
  'grain-sorghum': {
    // Per bushel
    p2o5_lb: 0.42,
    k2o_lb: 0.23, // Average of 0.21-0.25 range
    unit: 'bu',
    description: 'Grain sorghum removal rates per bushel',
  },
  potato: {
    // Per ton of tubers
    p2o5_lb: 3.0,
    k2o_lb: 12.5,
    sulfur_lb: 1.5, // 15-30 lb/ac for typical 10-20 ton yield
    unit: 'ton',
    description: 'Potato tuber removal rates per ton',
    notes: 'Add 15-30 lb S/ac (sulfate) on sands/irrigated ground',
  },
  beetroot: {
    // Per ton
    p2o5_lb: 2.5,
    k2o_lb: 10.0,
    boron_lb: 0.15,
    unit: 'ton',
    description: 'Beetroot removal rates per ton',
    notes: 'Requires 2-3 lb B/ac preplant, maintain pH 6.2-7.0',
  },
  sunflower: {
    // Per hundredweight (cwt)
    p2o5_lb: 1.2,
    k2o_lb: 0.8,
    unit: 'cwt',
    description: 'Sunflower grain removal rates per cwt',
    notes: 'Returns K via residue cycling - account for residue return',
  },
  // Additional crops
  'dragon-fruit': {
    // Per ton of fruit
    p2o5_lb: 2.0,
    k2o_lb: 8.0,
    calcium_lb: 1.5,
    unit: 'ton',
    description: 'Dragon fruit removal rates per ton',
    notes: 'Perennial crop, maintain soil pH 6.0-7.0, benefits from organic matter',
  },
  moringa: {
    // Per ton of leaf harvest
    p2o5_lb: 1.8,
    k2o_lb: 6.5,
    nitrogen_lb: 5.0,
    unit: 'ton',
    description: 'Moringa leaf removal rates per ton',
    notes: 'Multiple harvests per year, light feeder, benefits from organic amendments',
  },
  lucerne: {
    // Per ton of hay
    p2o5_lb: 0.55,
    k2o_lb: 2.0,
    sulfur_lb: 0.25,
    unit: 'ton',
    description: 'Lucerne (alfalfa) hay removal rates per ton',
    notes: 'Nitrogen-fixing legume, focus on P/K and sulfur, maintain pH 6.5-7.5',
  },
  tomato: {
    // Per ton of fruit
    p2o5_lb: 2.2,
    k2o_lb: 10.0,
    calcium_lb: 1.2,
    unit: 'ton',
    description: 'Tomato fruit removal rates per ton',
    notes: 'Heavy feeder, requires consistent Ca for blossom end rot prevention',
  },
  pepper: {
    // Per ton of fruit
    p2o5_lb: 2.0,
    k2o_lb: 8.5,
    calcium_lb: 1.0,
    unit: 'ton',
    description: 'Pepper (bell/chili) fruit removal rates per ton',
    notes: 'Moderate feeder, sensitive to salt, avoid excess N for better fruit set',
  },
  cucumber: {
    // Per ton of fruit
    p2o5_lb: 1.5,
    k2o_lb: 6.0,
    unit: 'ton',
    description: 'Cucumber fruit removal rates per ton',
    notes: 'Fast-growing, requires frequent light fertilization, sensitive to salt',
  },
  lettuce: {
    // Per ton of heads
    p2o5_lb: 1.0,
    k2o_lb: 4.5,
    nitrogen_lb: 4.0,
    unit: 'ton',
    description: 'Lettuce head removal rates per ton',
    notes: 'Quick crop, nitrogen-responsive, prefers cooler temperatures',
  },
  spinach: {
    // Per ton of leaves
    p2o5_lb: 1.2,
    k2o_lb: 5.0,
    nitrogen_lb: 5.5,
    unit: 'ton',
    description: 'Spinach leaf removal rates per ton',
    notes: 'Heavy nitrogen feeder, maintain adequate Fe and Mg, prefers pH 6.0-7.0',
  },
  carrot: {
    // Per ton of roots
    p2o5_lb: 1.8,
    k2o_lb: 7.0,
    unit: 'ton',
    description: 'Carrot root removal rates per ton',
    notes: 'Moderate feeder, avoid fresh manure, requires loose soil for straight roots',
  },
  onion: {
    // Per ton of bulbs
    p2o5_lb: 1.5,
    k2o_lb: 5.5,
    sulfur_lb: 1.2,
    unit: 'ton',
    description: 'Onion bulb removal rates per ton',
    notes: 'Moderate feeder, sulfur important for pungency and storage quality',
  },
  maize: {
    // Per bushel (grain)
    p2o5_lb: 0.37,
    k2o_lb: 0.27,
    unit: 'bu',
    description: 'Maize (corn) grain removal rates per bushel',
    notes: 'Heavy nitrogen feeder, remove entire plant = 2-3x grain-only removal',
  },
  wheat: {
    // Per bushel (grain)
    p2o5_lb: 0.55,
    k2o_lb: 0.32,
    unit: 'bu',
    description: 'Wheat grain removal rates per bushel',
    notes: 'Moderate feeder, residue returns significant K if not baled',
  },
  cabbage: {
    // Per ton of heads
    p2o5_lb: 1.6,
    k2o_lb: 7.5,
    calcium_lb: 1.3,
    unit: 'ton',
    description: 'Cabbage head removal rates per ton',
    notes: 'Heavy feeder, requires consistent moisture and nutrition',
  },
  'sweet-potato': {
    // Per ton of roots
    p2o5_lb: 2.2,
    k2o_lb: 11.0,
    unit: 'ton',
    description: 'Sweet potato root removal rates per ton',
    notes: 'High K requirement, avoid excess N which promotes vine over root',
  },
}

/**
 * Nitrogen program recommendations by crop transition
 */
const NITROGEN_PROGRAMS = {
  'soybean-to-potato': {
    soybeanCredit: 37.5, // Conservative 30-45 lb N/ac average
    potatoStrategy: {
      description: 'Split application with petiole nitrate monitoring',
      preplant: 'Base N on soil test, typical 100-150 lb N/ac',
      sidedress: 'Fertigation during bulking, monitor petioles',
      petioleTarget: '13,000-15,000 ppm NO₃-N during bulking',
      sulfur: '15-30 lb S/ac as sulfate form',
    },
  },
  'potato-to-sorghum': {
    residualK: 'Check 0-6" K, may be low on sands',
    nitrogenStrategy: {
      description: 'Sorghum uses leftover soil N efficiently',
      soilTest: 'Sample nitrate to 24" depth to set rates',
      recommendation: 'Credit residual N, reduce applied rates',
    },
  },
  'sorghum-to-beetroot': {
    immobilization: {
      description: 'Counter N immobilization from sorghum residues',
      starterN: '20-40 lb N/ac early unless residue was young',
      timing: 'At emergence or shortly after',
    },
    pH: {
      target: '6.2-7.0',
      reason: 'Maximize micronutrient availability',
    },
    boron: {
      preplant: '2-3 lb B/ac broadcast uniformly',
      foliar: 'Small midseason application if symptoms appear',
      warning: 'Narrow safety margin - do not exceed label rates',
    },
  },
  'beetroot-to-sunflower': {
    description: 'Nutritionally compatible transition',
    placement: 'Band P/K 2x2, keep salt away from seed',
    sensitivity: 'Sunflower is sensitive to salt near seed',
    nitrogen: {
      soilTest: 'Credit soil profile nitrate to 24"',
      deepSampling: 'Can tap 4-6 ft where testing practical',
      recommendation: 'Follow local price/yield-based tables',
    },
  },
  'sunflower-to-soybean': {
    whiteMoldRisk: {
      recommendation: 'Insert sorghum/cereal buffer if white-mold history',
      minBreak: '3-year non-host break for white mold management',
      alternative: 'Use varietal tolerance + canopy management + narrow intervals',
    },
    allelopathy: 'Small-grain or oat/rye buffer to dilute allelopathy',
  },
}

/**
 * Potassium source recommendations
 */
const POTASSIUM_SOURCES = {
  potato: {
    preferred: 'K₂SO₄ (Sulfate of Potash - SOP)',
    reason: 'Better for specific gravity and fry color',
    avoid: 'Heavy preplant KCl near tuber bulking',
    alternative: 'If using KCl for economics, apply well ahead of bulking and away from root zone',
  },
  general: {
    kcl: 'Muriate of Potash (KCl) - economical but can affect quality',
    k2so4: 'Sulfate of Potash (SOP) - premium quality, includes sulfur',
    timing: 'Keep heavy K applications away from sensitive crop root zones',
  },
}

/**
 * Cover crop recommendations by rotation window
 */
const COVER_CROPS = {
  'after-potato': {
    primary: 'Rye',
    optional: 'Crimson clover with rye for spring N',
    benefits: 'Catch leachable N, protect soil structure',
    timing: 'Plant immediately after harvest',
  },
  'after-sunflower': {
    primary: 'Small-grain or oat/rye buffer',
    reason: 'Dilute allelopathy before soybeans',
    benefits: 'Break allelopathic effects, add biomass',
  },
  'for-biomass': {
    crop: 'Sorghum-sudangrass',
    benefits: 'Excellent biomass production, breaks compaction',
    warning: 'Terminate early before high N-demand crop to minimize immobilization',
  },
}

/**
 * Monitoring system recommendations
 */
const MONITORING_SYSTEM = {
  soilSampling: {
    frequency: 'Every crop year',
    depths: {
      standard: '0-6" (pH, P, K, Zn, OM, CEC)',
      nitrate: '0-24" nitrate-N and sulfate-S',
      deep: '2-4 ft nitrate before first sunflower (to quantify deep N)',
    },
    method: 'Zone/grid sample to support variable-rate application',
  },
  tissueChecks: {
    potato: {
      sample: 'Petiole NO₃ weekly from tuber initiation through bulking',
      target: '13,000-15,000 ppm NO₃-N',
      action: 'Adjust fertigation to keep within range',
    },
    beetroot: {
      sample: 'Tissue testing plus visual for B deficiency',
      symptoms: 'Heart rot, black spot indicate B deficiency',
      action: 'Foliar application only if needed',
    },
    sunflower: {
      sample: 'Scout for B/Zn symptoms',
      action: 'Apply only with evidence - local responses vary',
      note: 'Northern Great Plains often show no response even on low-B soils',
    },
  },
  diseaseManagement: {
    whiteMold: {
      crop: 'Sunflower and soybean',
      requirement: '3-year non-host break when white mold present',
      mitigation: 'Varietal tolerance + canopy management for shorter intervals',
    },
  },
}

/**
 * POST /api/fertility-management
 * Generate fertility management plan based on crop rotation and soil conditions
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { crops, soilTests, yieldTargets, soilType } = body

    if (!crops || !Array.isArray(crops) || crops.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Crops array is required' },
        { status: 400 }
      )
    }

    // Fetch data from database
    const [nutrientRemovalRates, nitrogenPrograms, coverCrops] = await Promise.all([
      fetchNutrientRemovalRates(),
      fetchNitrogenPrograms(),
      fetchCoverCrops(),
    ])

    const fertilityPlan = generateFertilityPlan(
      crops,
      soilTests,
      yieldTargets,
      soilType,
      nutrientRemovalRates,
      nitrogenPrograms,
      coverCrops
    )

    return NextResponse.json({
      success: true,
      data: fertilityPlan,
      message: 'Fertility management plan generated successfully',
    })
  } catch (error) {
    console.error('Error generating fertility plan:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate fertility management plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/fertility-management
 * Get fertility management reference data from database
 */
export async function GET() {
  try {
    const [nutrientRemovalRates, nitrogenPrograms, potassiumSources, coverCrops, monitoringSystem] =
      await Promise.all([
        fetchNutrientRemovalRates(),
        fetchNitrogenPrograms(),
        fetchPotassiumSources(),
        fetchCoverCrops(),
        fetchMonitoringSystem(),
      ])

    return NextResponse.json({
      success: true,
      data: {
        nutrientRemovalRates,
        nitrogenPrograms,
        potassiumSources,
        coverCrops,
        monitoringSystem,
      },
    })
  } catch (error) {
    console.error('Error fetching fertility data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch fertility management data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/fertility-management
 * Generate AI-ready fertility recommendations for integration
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { farmPlanId, crops, yieldTargets, soilType, includeAI = true } = body

    if (!crops || !Array.isArray(crops) || crops.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Crops array is required' },
        { status: 400 }
      )
    }

    // Fetch data from database
    const [nutrientRemovalRates, nitrogenPrograms, coverCrops] = await Promise.all([
      fetchNutrientRemovalRates(),
      fetchNitrogenPrograms(),
      fetchCoverCrops(),
    ])

    const fertilityPlan = generateFertilityPlan(
      crops,
      null,
      yieldTargets,
      soilType,
      nutrientRemovalRates,
      nitrogenPrograms,
      coverCrops
    )

    // Generate AI-ready recommendations
    const aiRecommendations = []

    if (includeAI) {
      // High priority: Critical amendments
      aiRecommendations.push({
        category: 'fertility',
        priority: 10,
        recommendation_text: `Critical: ${fertilityPlan.criticalAmendments.phosphorus.strategy}. Switch from blanket annual applications to soil-test based rates to reduce costs by 10-30%.`,
      })

      // Crop-specific recommendations
      for (const rec of fertilityPlan.nutrientRecommendations) {
        if (rec.recommendations && rec.recommendations.length > 0) {
          const topRecommendations = rec.recommendations.slice(0, 3).join(' | ')
          aiRecommendations.push({
            category: 'fertility',
            priority: 8,
            recommendation_text: `${rec.crop.toUpperCase()}: ${topRecommendations}`,
          })
        }

        // Nutrient removal summary
        if (typeof rec.yieldTarget === 'number' && rec.removal.p2o5_lb) {
          aiRecommendations.push({
            category: 'fertility',
            priority: 6,
            recommendation_text: `${rec.crop}: Targeting ${rec.yieldTarget} ${rec.unit} will remove ${rec.removal.p2o5_lb} lb P₂O₅ and ${rec.removal.k2o_lb} lb K₂O per acre. Plan replacement based on soil tests.`,
          })
        }
      }

      // Transition guidance
      for (const transition of fertilityPlan.transitionGuidance) {
        if (typeof transition.guidance === 'object' && transition.guidance !== null) {
          aiRecommendations.push({
            category: 'crop-rotation',
            priority: 7,
            recommendation_text: `Transition ${transition.from} → ${transition.to}: ${JSON.stringify(transition.guidance).substring(0, 200)}...`,
          })
        }
      }

      // Monitoring schedule
      aiRecommendations.push({
        category: 'operations',
        priority: 9,
        recommendation_text: `Monitoring: ${fertilityPlan.monitoringSchedule.soilTesting.annual}. ${fertilityPlan.monitoringSchedule.soilTesting.nitrate}`,
      })

      // Cover crops
      for (const coverPlan of fertilityPlan.coverCropPlan) {
        aiRecommendations.push({
          category: 'sustainability',
          priority: 7,
          recommendation_text: `After ${coverPlan.after}: Plant ${coverPlan.recommendation.primary}. Benefits: ${coverPlan.recommendation.benefits}`,
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        fertilityPlan,
        aiRecommendations,
        farmPlanId: farmPlanId || null,
      },
      message: 'Fertility plan with AI recommendations generated successfully',
    })
  } catch (error) {
    console.error('Error generating AI-integrated fertility plan:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate AI-integrated fertility plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

function generateFertilityPlan(
  crops: string[],
  soilTests: any,
  yieldTargets: any,
  soilType: string,
  nutrientRemovalRates?: any,
  nitrogenPrograms?: any,
  coverCrops?: any
) {
  const plan = {
    cropSequence: crops,
    soilType: soilType || 'unknown',
    nutrientRecommendations: [] as any[],
    transitionGuidance: [] as any[],
    monitoringSchedule: generateMonitoringSchedule(crops),
    coverCropPlan: generateCoverCropPlan(crops, coverCrops),
    criticalAmendments: generateCriticalAmendments(crops, soilType),
  }

  // Use provided data or fall back to constants
  const removalRates = nutrientRemovalRates || NUTRIENT_REMOVAL_RATES
  const nitrogenProgs = nitrogenPrograms || NITROGEN_PROGRAMS

  // Generate crop-by-crop nutrient recommendations
  for (let i = 0; i < crops.length; i++) {
    const crop = crops[i]
    const nextCrop = crops[i + 1]
    const removalData = removalRates[crop]

    if (removalData) {
      const yieldTarget = yieldTargets?.[crop] || 'Not specified'
      const nutrientRemoval = calculateNutrientRemoval(crop, yieldTarget, removalRates)

      plan.nutrientRecommendations.push({
        crop,
        yieldTarget,
        unit: removalData.unit,
        removal: nutrientRemoval,
        recommendations: generateCropRecommendations(crop, soilTests, soilType),
        notes: 'notes' in removalData ? removalData.notes : '',
      })
    }

    // Add transition guidance
    if (nextCrop) {
      const transitionKey = `${crop}-to-${nextCrop}`
      const guidance = nitrogenProgs[transitionKey] || 'Standard rotation practices apply'

      plan.transitionGuidance.push({
        from: crop,
        to: nextCrop,
        guidance,
      })
    }
  }

  return plan
}

function calculateNutrientRemoval(crop: string, yieldTarget: number | string, removalRates?: any) {
  const rates = removalRates || NUTRIENT_REMOVAL_RATES
  const removalData = rates[crop]

  if (!removalData || typeof yieldTarget !== 'number') {
    return {
      p2o5: 'Yield target needed',
      k2o: 'Yield target needed',
    }
  }

  return {
    p2o5_lb: Math.round(removalData.p2o5_lb * yieldTarget),
    k2o_lb: Math.round(removalData.k2o_lb * yieldTarget),
    sulfur_lb:
      'sulfur_lb' in removalData ? Math.round(removalData.sulfur_lb * yieldTarget) : undefined,
    boron_lb:
      'boron_lb' in removalData ? (removalData.boron_lb * yieldTarget).toFixed(2) : undefined,
  }
}

function generateCropRecommendations(crop: string, soilTests: any, soilType: string) {
  const recommendations = []

  // Base recommendations on soil test sufficiency strategy
  recommendations.push(
    'Base P/K rates on soil test results using sufficiency strategy (apply when tests indicate yield response)'
  )

  if (crop === 'potato') {
    recommendations.push('Use K₂SO₄ (SOP) for quality - avoid heavy preplant KCl')
    recommendations.push('Split N: preplant/at-plant + early sidedress/fertigation')
    recommendations.push('Monitor petiole nitrate weekly during bulking (target 13,000-15,000 ppm)')
    recommendations.push('Add 15-30 lb S/ac as sulfate form')

    if (soilType?.toLowerCase().includes('sand')) {
      recommendations.push('Sandy soil: Expect low residual K, check 0-6" depth')
    }
  }

  if (crop === 'beetroot') {
    recommendations.push('Maintain soil pH at 6.2-7.0 for optimal micronutrient availability')
    recommendations.push('Apply 2-3 lb B/ac preplant broadcast uniformly')
    recommendations.push('Monitor for boron deficiency symptoms (heart rot, black spot)')
    recommendations.push('Counter N immobilization if following sorghum: add 20-40 lb N/ac early')
  }

  if (crop === 'sunflower') {
    recommendations.push('Band P/K 2x2 - keep salt away from seed (sunflower is sensitive)')
    recommendations.push('Credit soil profile nitrate to 24" (can tap 4-6 ft depth)')
    recommendations.push('Account for K returned via residue cycling')
    recommendations.push('Test for B/Zn deficiency before applying - local responses vary')
  }

  if (crop === 'soybean') {
    recommendations.push('Provides 30-45 lb N/ac credit to following crop')
    recommendations.push('Maintain 3-year break from sunflower if white mold is present')
    recommendations.push('Focus on adequate P/K for nodulation and yield')
  }

  if (crop === 'grain-sorghum') {
    recommendations.push('Sample nitrate to 24" to set N rates - uses residual N efficiently')
    recommendations.push('Residue cycling returns K - account for residue return')

    if (soilType?.toLowerCase().includes('sand')) {
      recommendations.push('Check 0-6" K on sandy soils, may need in-season K')
    }
  }

  // New crops recommendations
  if (crop === 'dragon-fruit') {
    recommendations.push('Perennial crop: Apply balanced nutrition year-round')
    recommendations.push('Maintain soil pH 6.0-7.0 for optimal nutrient uptake')
    recommendations.push('Benefits from organic matter - apply compost annually')
    recommendations.push('Monitor Ca levels - important for fruit quality')
    recommendations.push('Avoid waterlogging - ensure excellent drainage')
  }

  if (crop === 'moringa') {
    recommendations.push('Light feeder - avoid excess N which promotes vegetative growth')
    recommendations.push('Multiple harvests per year - split fertilization accordingly')
    recommendations.push('Benefits from organic amendments - apply compost/manure')
    recommendations.push('Drought-tolerant once established - moderate fertilizer needs')
  }

  if (crop === 'lucerne') {
    recommendations.push('Nitrogen-fixing legume - focus on P, K, and S')
    recommendations.push('Maintain pH 6.5-7.5 for optimal nodulation')
    recommendations.push('Apply S at 10-20 lb/ac if soil S < 10 ppm')
    recommendations.push('High K removal - replace based on yield and soil tests')
    recommendations.push('Inoculate with proper Rhizobium at planting if new field')
  }

  if (crop === 'tomato') {
    recommendations.push('Heavy feeder - requires consistent nutrition throughout season')
    recommendations.push('Apply Ca at 100-150 lb/ac to prevent blossom end rot')
    recommendations.push('Split N applications - excessive early N delays fruiting')
    recommendations.push('Monitor Mg levels - deficiency common with heavy K application')
    recommendations.push('Use drip fertigation for precise nutrient delivery')
  }

  if (crop === 'pepper') {
    recommendations.push('Moderate feeder - avoid excess N which delays fruit set')
    recommendations.push('Sensitive to salt - use low-salt fertilizers, avoid over-application')
    recommendations.push('Apply Ca for fruit quality and firmness')
    recommendations.push('Consistent moisture and nutrition prevent flower/fruit drop')
  }

  if (crop === 'cucumber') {
    recommendations.push('Fast-growing - requires frequent light fertilization')
    recommendations.push('Sensitive to salt - use low EC fertilizers, monitor soil salinity')
    recommendations.push('Split N applications weekly during production')
    recommendations.push('Adequate K improves fruit quality and disease resistance')
  }

  if (crop === 'lettuce') {
    recommendations.push('Quick crop (45-70 days) - nitrogen-responsive')
    recommendations.push('Apply N in small frequent doses for consistent growth')
    recommendations.push('Prefers cooler temperatures - adjust fertility with season')
    recommendations.push('Avoid excess N near harvest - affects shelf life')
  }

  if (crop === 'spinach') {
    recommendations.push('Heavy nitrogen feeder - apply 100-150 lb N/ac split')
    recommendations.push('Maintain adequate Fe and Mg - monitor for deficiency')
    recommendations.push('Prefers pH 6.0-7.0 for optimal nutrient availability')
    recommendations.push('Quick crop - front-load nutrition for rapid growth')
  }

  if (crop === 'carrot') {
    recommendations.push('Moderate feeder - avoid fresh manure (causes forking)')
    recommendations.push('Requires loose, friable soil for straight root development')
    recommendations.push('Split N: 40% preplant, 60% sidedress at 4-6 weeks')
    recommendations.push('Adequate K improves root quality and sweetness')
  }

  if (crop === 'onion') {
    recommendations.push('Moderate feeder with shallow root system')
    recommendations.push('Apply S at 20-30 lb/ac - affects pungency and storage quality')
    recommendations.push('Split N: 50% preplant, 50% sidedress before bulbing')
    recommendations.push('Avoid late-season N - delays maturity and affects storage')
  }

  if (crop === 'maize') {
    recommendations.push('Heavy nitrogen feeder - typical 150-200 lb N/ac for good yield')
    recommendations.push('Split N: 30% preplant, 70% sidedress at V6-V8 stage')
    recommendations.push('If removing stover, increase P/K by 2-3x grain-only removal')
    recommendations.push('Monitor for S deficiency on sandy/low OM soils')
  }

  if (crop === 'wheat') {
    recommendations.push('Moderate feeder - typical 100-120 lb N/ac depending on yield')
    recommendations.push('Fall-planted: Apply 30-40 lb N/ac at planting, remainder in spring')
    recommendations.push('If not baling straw, residue returns significant K')
    recommendations.push('Monitor for S deficiency - apply 15-20 lb/ac if needed')
  }

  if (crop === 'cabbage') {
    recommendations.push('Heavy feeder - requires consistent high nutrition')
    recommendations.push('Apply Ca for head quality and splitting prevention')
    recommendations.push('Split N: 40% preplant, 60% sidedress during head formation')
    recommendations.push('Adequate B important - apply 1-2 lb B/ac if soil test low')
  }

  if (crop === 'sweet-potato') {
    recommendations.push('High K requirement for quality roots and storage')
    recommendations.push('Avoid excess N - promotes vine growth over root development')
    recommendations.push('Apply K at 150-200 lb K₂O/ac based on soil test')
    recommendations.push('Moderate P needs - excessive P may reduce quality')
  }

  return recommendations
}

function generateMonitoringSchedule(crops: string[]) {
  const schedule = {
    soilTesting: {
      annual: 'Test 0-6" every crop year (pH, P, K, Zn, OM, CEC)',
      nitrate: 'Test 0-24" nitrate-N and sulfate-S each year',
      method: 'Zone or grid sampling for variable-rate application',
    },
    tissueTesting: [] as any[],
  }

  crops.forEach((crop) => {
    if (MONITORING_SYSTEM.tissueChecks[crop as keyof typeof MONITORING_SYSTEM.tissueChecks]) {
      schedule.tissueTesting.push({
        crop,
        protocol:
          MONITORING_SYSTEM.tissueChecks[crop as keyof typeof MONITORING_SYSTEM.tissueChecks],
      })
    }
  })

  return schedule
}

function generateCoverCropPlan(crops: string[], coverCropsData?: any) {
  const coverCropPlan = [] as any[]
  const coverCrops = coverCropsData || COVER_CROPS

  crops.forEach((crop, index) => {
    const nextCrop = crops[index + 1]
    const afterKey = `after-${crop}`

    if (coverCrops[afterKey]) {
      coverCropPlan.push({
        after: crop,
        before: nextCrop || 'Next rotation',
        recommendation: coverCrops[afterKey],
      })
    }
  })

  return coverCropPlan
}

function generateCriticalAmendments(crops: string[], soilType: string) {
  const amendments = {
    phosphorus: {
      strategy: 'Sufficiency-based (apply when soil tests indicate yield response)',
      placement: 'Band placement for efficiency where applicable',
      avoidBlanket: 'Replace fixed annual P/K with soil-test + removal-based plans',
    },
    potassium: {
      strategy: 'Soil test + removal rates',
      residueCycling: 'Account for K returned via crop residues (sunflower, sorghum)',
      sources: POTASSIUM_SOURCES,
    },
    sulfur: {
      crops: ['potato', 'sunflower'],
      rate: '15-30 lb S/ac as sulfate form',
      conditions: 'Especially on sandy/irrigated soils',
    },
    boron: {
      targetCrops: ['beetroot'],
      optionalCrops: ['sunflower (if local response documented)'],
      rate: '2-3 lb B/ac for beets, preplant broadcast',
      warning: 'Narrow safety margin - do not exceed label rates',
    },
  }

  return amendments
}
