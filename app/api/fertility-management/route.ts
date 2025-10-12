import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

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

    const fertilityPlan = generateFertilityPlan(crops, soilTests, yieldTargets, soilType)

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
 * Get fertility management reference data
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      nutrientRemovalRates: NUTRIENT_REMOVAL_RATES,
      nitrogenPrograms: NITROGEN_PROGRAMS,
      potassiumSources: POTASSIUM_SOURCES,
      coverCrops: COVER_CROPS,
      monitoringSystem: MONITORING_SYSTEM,
    },
  })
}

function generateFertilityPlan(
  crops: string[],
  soilTests: any,
  yieldTargets: any,
  soilType: string
) {
  const plan = {
    cropSequence: crops,
    soilType: soilType || 'unknown',
    nutrientRecommendations: [] as any[],
    transitionGuidance: [] as any[],
    monitoringSchedule: generateMonitoringSchedule(crops),
    coverCropPlan: generateCoverCropPlan(crops),
    criticalAmendments: generateCriticalAmendments(crops, soilType),
  }

  // Generate crop-by-crop nutrient recommendations
  for (let i = 0; i < crops.length; i++) {
    const crop = crops[i]
    const nextCrop = crops[i + 1]
    const removalData = NUTRIENT_REMOVAL_RATES[crop as keyof typeof NUTRIENT_REMOVAL_RATES]

    if (removalData) {
      const yieldTarget = yieldTargets?.[crop] || 'Not specified'
      const nutrientRemoval = calculateNutrientRemoval(crop, yieldTarget)

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
      const guidance =
        NITROGEN_PROGRAMS[transitionKey as keyof typeof NITROGEN_PROGRAMS] ||
        'Standard rotation practices apply'

      plan.transitionGuidance.push({
        from: crop,
        to: nextCrop,
        guidance,
      })
    }
  }

  return plan
}

function calculateNutrientRemoval(crop: string, yieldTarget: number | string) {
  const removalData = NUTRIENT_REMOVAL_RATES[crop as keyof typeof NUTRIENT_REMOVAL_RATES]

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
    boron_lb: 'boron_lb' in removalData ? (removalData.boron_lb * yieldTarget).toFixed(2) : undefined,
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

function generateCoverCropPlan(crops: string[]) {
  const coverCropPlan = [] as any[]

  crops.forEach((crop, index) => {
    const nextCrop = crops[index + 1]
    const afterKey = `after-${crop}` as keyof typeof COVER_CROPS

    if (COVER_CROPS[afterKey]) {
      coverCropPlan.push({
        after: crop,
        before: nextCrop || 'Next rotation',
        recommendation: COVER_CROPS[afterKey],
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
