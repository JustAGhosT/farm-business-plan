import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * POST /api/crop-rotation
 * Generate optimal crop rotation plan based on soil health, market demand, and crop history
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { farm_plan_id, hectares, years = 3 } = body

    if (!farm_plan_id || !hectares) {
      return NextResponse.json(
        { success: false, error: 'Farm plan ID and hectares are required' },
        { status: 400 }
      )
    }

    // Get farm plan details
    const farmPlanResult = await query('SELECT * FROM farm_plans WHERE id = $1', [farm_plan_id])

    if (farmPlanResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Farm plan not found' }, { status: 404 })
    }

    const farmPlan = farmPlanResult.rows[0]

    // Get existing crop plans (history)
    const existingCropsResult = await query(
      'SELECT * FROM crop_plans WHERE farm_plan_id = $1 ORDER BY created_at DESC',
      [farm_plan_id]
    )

    const rotationPlan = generateRotationPlan(farmPlan, existingCropsResult.rows, hectares, years)

    return NextResponse.json({
      success: true,
      data: rotationPlan,
      message: `Generated ${years}-year crop rotation plan`,
    })
  } catch (error) {
    console.error('Error generating crop rotation:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate crop rotation plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

function generateRotationPlan(
  farmPlan: any,
  existingCrops: any[],
  hectares: number,
  years: number
) {
  const cropRotationSequences = getCropRotationSequences()
  const lastCrop = existingCrops[0]?.crop_name || null

  // Find optimal sequence based on last crop
  let sequence = cropRotationSequences.default
  if (lastCrop) {
    for (const [key, value] of Object.entries(cropRotationSequences)) {
      if (key !== 'default' && key.includes(lastCrop)) {
        sequence = value
        break
      }
    }
  }

  const plan = []
  const currentYear = new Date().getFullYear()

  for (let year = 0; year < years; year++) {
    const cropIndex = year % sequence.length
    const crop = sequence[cropIndex]

    plan.push({
      year: currentYear + year,
      season: year % 2 === 0 ? 'Spring/Summer' : 'Fall/Winter',
      crop: crop.name,
      hectares: hectares,
      benefits: crop.benefits,
      soilImprovement: crop.soilImprovement,
      marketDemand: crop.marketDemand,
      estimatedRevenue: calculateRevenue(crop.name, hectares),
      plantingMonth: crop.plantingMonth,
      harvestMonth: crop.harvestMonth,
      notes: crop.notes,
    })
  }

  return {
    farmPlanId: farmPlan.id,
    totalHectares: hectares,
    rotationYears: years,
    schedule: plan,
    principles: {
      nutrientManagement: 'Alternate between nitrogen-fixing and heavy-feeding crops',
      pestControl: 'Rotate crop families to disrupt pest and disease cycles',
      soilHealth: 'Include cover crops and green manure in rotation',
      marketDiversity: 'Balance high-value cash crops with stable staple crops',
    },
    recommendations: generateRotationRecommendations(plan),
  }
}

function getCropRotationSequences() {
  return {
    default: [
      {
        name: 'Legumes (e.g., Beans, Lucerne)',
        benefits: 'Nitrogen fixation, soil improvement',
        soilImprovement: 'high',
        marketDemand: 'medium',
        plantingMonth: 'September',
        harvestMonth: 'December',
        notes: 'Fixes nitrogen, improves soil structure',
        fertilityNotes: 'Base P/K on soil tests, provides 30-45 lb N/ac credit to next crop',
      },
      {
        name: 'Leafy Vegetables (e.g., Spinach, Lettuce)',
        benefits: 'Quick returns, utilizes nitrogen',
        soilImprovement: 'low',
        marketDemand: 'high',
        plantingMonth: 'March',
        harvestMonth: 'May',
        notes: 'Benefits from nitrogen left by legumes',
        fertilityNotes: 'Credit N from previous legumes, focus on P/K sufficiency',
      },
      {
        name: 'Root Crops (e.g., Carrots, Beetroot)',
        benefits: 'Different nutrient needs, breaks disease cycle',
        soilImprovement: 'medium',
        marketDemand: 'medium',
        plantingMonth: 'August',
        harvestMonth: 'November',
        notes: 'Different root zone from previous crops',
        fertilityNotes: 'Maintain pH 6.2-7.0, apply 2-3 lb B/ac for beets',
      },
      {
        name: 'Fruiting Crops (e.g., Tomatoes, Peppers)',
        benefits: 'High value, different pest profile',
        soilImprovement: 'low',
        marketDemand: 'high',
        plantingMonth: 'October',
        harvestMonth: 'February',
        notes: 'Heavy feeders, add compost before planting',
        fertilityNotes: 'Band P/K for efficiency, split N applications',
      },
    ],
    'dragon-fruit': [
      {
        name: 'Dragon Fruit',
        benefits: 'Perennial, long-term investment',
        soilImprovement: 'low',
        marketDemand: 'high',
        plantingMonth: 'Year-round',
        harvestMonth: 'Year 2+',
        notes: '3-5 year productive cycle',
        fertilityNotes: 'Soil test-based P/K, annual monitoring of pH and nutrients',
      },
    ],
    moringa: [
      {
        name: 'Moringa',
        benefits: 'Fast-growing, multiple harvests',
        soilImprovement: 'high',
        marketDemand: 'medium',
        plantingMonth: 'Spring',
        harvestMonth: 'Multiple',
        notes: 'Can be intercropped',
        fertilityNotes: 'Light feeder, benefits from organic matter, test soil annually',
      },
    ],
    precision: [
      {
        name: 'Soybean',
        benefits: 'Nitrogen fixation, disease break',
        soilImprovement: 'high',
        marketDemand: 'high',
        plantingMonth: 'October-December',
        harvestMonth: 'March-May',
        notes: 'Provides 30-45 lb N/ac credit to next crop',
        fertilityNotes: 'Focus on P/K for nodulation, 3-year break from sunflower for white mold',
      },
      {
        name: 'Potato',
        benefits: 'High value cash crop',
        soilImprovement: 'medium',
        marketDemand: 'high',
        plantingMonth: 'August-September',
        harvestMonth: 'December-January',
        notes: 'Split N, monitor petiole nitrate during bulking',
        fertilityNotes: 'Use K₂SO₄ (SOP), add 15-30 lb S/ac, avoid heavy preplant KCl',
      },
      {
        name: 'Grain Sorghum',
        benefits: 'Drought tolerant, uses residual N efficiently',
        soilImprovement: 'medium',
        marketDemand: 'medium',
        plantingMonth: 'October-November',
        harvestMonth: 'February-March',
        notes: 'Sample nitrate to 24" to set rates',
        fertilityNotes: 'Credit residual N, check 0-6" K on sands, residue returns K',
      },
      {
        name: 'Beetroot',
        benefits: 'Different nutrient profile, market diversity',
        soilImprovement: 'medium',
        marketDemand: 'medium',
        plantingMonth: 'March-April',
        harvestMonth: 'June-July',
        notes: 'Counter N immobilization from sorghum with 20-40 lb N/ac early',
        fertilityNotes: 'Apply 2-3 lb B/ac preplant, maintain pH 6.2-7.0, monitor for B deficiency',
      },
      {
        name: 'Sunflower',
        benefits: 'Deep rooted, breaks disease cycle',
        soilImprovement: 'medium',
        marketDemand: 'high',
        plantingMonth: 'October-November',
        harvestMonth: 'February-March',
        notes: 'Band P/K 2x2, keep salt away from seed',
        fertilityNotes: 'Credit nitrate to 24", residue returns K, test for B/Zn before applying',
      },
    ],
  }
}

function calculateRevenue(cropName: string, hectares: number): number {
  const revenuePerHectare: Record<string, number> = {
    'Legumes (e.g., Beans, Lucerne)': 45000,
    'Leafy Vegetables (e.g., Spinach, Lettuce)': 120000,
    'Root Crops (e.g., Carrots, Beetroot)': 80000,
    'Fruiting Crops (e.g., Tomatoes, Peppers)': 150000,
    'Dragon Fruit': 200000,
    Moringa: 85000,
  }

  return (revenuePerHectare[cropName] || 60000) * hectares
}

function generateRotationRecommendations(plan: any[]): string[] {
  const recommendations = []

  recommendations.push(
    'Base P/K rates on soil tests using sufficiency strategy (apply only when tests indicate yield response)'
  )
  recommendations.push(
    'Replace fixed annual P/K with soil-test + removal-based plans to avoid waste'
  )
  recommendations.push(
    'Always include a nitrogen-fixing crop every 2-3 years to maintain soil fertility'
  )
  recommendations.push('Add organic compost between crop cycles to improve soil structure')
  recommendations.push('Consider cover crops during fallow periods to prevent erosion and catch N')
  recommendations.push('Test soil annually: 0-6" for pH, P, K, Zn, OM, CEC; 0-24" for nitrate-N')
  recommendations.push(
    'Use zone/grid sampling for variable-rate application to optimize input efficiency'
  )
  recommendations.push('Keep detailed records of crop performance for future planning')

  // Check for diversity
  const uniqueCrops = new Set(plan.map((p) => p.crop)).size
  if (uniqueCrops < 3) {
    recommendations.push(
      'Consider increasing crop diversity for better soil health and risk management'
    )
  }

  // Check for specific crop sequences that need special attention
  const cropNames = plan.map((p) => p.crop.toLowerCase())
  const hasSoybean = cropNames.some((c) => c.includes('soybean'))
  const hasSunflower = cropNames.some((c) => c.includes('sunflower'))
  const hasPotato = cropNames.some((c) => c.includes('potato'))
  const hasBeetroot = cropNames.some((c) => c.includes('beet'))

  if (hasSoybean && hasSunflower) {
    recommendations.push(
      'WARNING: Maintain 3-year break between sunflower and soybean to manage white mold risk'
    )
    recommendations.push('Insert sorghum/cereal buffer between sunflower and soybean if possible')
  }

  if (hasPotato) {
    recommendations.push(
      'For potatoes: Use K₂SO₄ (SOP) instead of KCl to maintain quality (specific gravity, fry color)'
    )
    recommendations.push(
      'Monitor potato petiole nitrate weekly during bulking (target 13,000-15,000 ppm)'
    )
    recommendations.push('Add 15-30 lb S/ac as sulfate, especially on sandy/irrigated soils')
  }

  if (hasBeetroot) {
    recommendations.push('For beetroot: Apply 2-3 lb B/ac preplant, maintain soil pH at 6.2-7.0')
    recommendations.push('Monitor beets for boron deficiency symptoms (heart rot, black spot)')
  }

  return recommendations
}
