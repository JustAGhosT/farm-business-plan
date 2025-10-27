import { createErrorResponse } from '@/lib/api-utils'
import { farmPlanRepository } from '@/lib/repositories/farmPlanRepository'
import { FarmPlanSchema, validateData } from '@/lib/validation'
import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/farm-plans
 * Get all farm plans (optionally filtered by owner_id)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('owner_id')

    const farmPlans = await farmPlanRepository.getAll(ownerId || undefined)

    return NextResponse.json({
      success: true,
      data: farmPlans,
      count: farmPlans.length,
    })
  } catch (error) {
    console.error('Error fetching farm plans:', error)
    return createErrorResponse('Failed to fetch farm plans', 500)
  }
}

/**
 * POST /api/farm-plans
 * Create a new farm plan
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateData(FarmPlanSchema, body)
    if (!validation.success) {
      return createErrorResponse(
        'Validation failed',
        400,
        validation.errors?.issues,
        'VALIDATION_ERROR'
      )
    }

    const newFarmPlan = await farmPlanRepository.create(validation.data!)

    return NextResponse.json(
      {
        success: true,
        data: newFarmPlan,
        message: 'Farm plan created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating farm plan:', error)
    return createErrorResponse('Failed to create farm plan', 500)
  }
}
