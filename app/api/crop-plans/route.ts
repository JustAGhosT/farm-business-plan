import { createErrorResponse } from '@/lib/api-utils'
import { cropRepository } from '@/lib/repositories/cropRepository'
import { CropPlanSchema, validateData } from '@/lib/validation'
import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/crop-plans
 * Get crop plans (optionally filtered by farm_plan_id or status)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const farmPlanId = searchParams.get('farm_plan_id')
    const status = searchParams.get('status')

    const cropPlans = await cropRepository.getAllPlans(farmPlanId || undefined, status || undefined)

    return NextResponse.json({
      success: true,
      data: cropPlans,
      count: cropPlans.length,
    })
  } catch (error) {
    console.error('Error fetching crop plans:', error)
    return createErrorResponse('Failed to fetch crop plans', 500)
  }
}

/**
 * POST /api/crop-plans
 * Create a new crop plan
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateData(CropPlanSchema, body)
    if (!validation.success) {
      return createErrorResponse(
        'Validation failed',
        400,
        validation.errors?.issues,
        'VALIDATION_ERROR'
      )
    }

    const newCropPlan = await cropRepository.createPlan(validation.data!)

    return NextResponse.json(
      {
        success: true,
        data: newCropPlan,
        message: 'Crop plan created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating crop plan:', error)
    return createErrorResponse('Failed to create crop plan', 500)
  }
}

// Whitelist of allowed fields to prevent SQL injection - frozen for security
// Whitelist of allowed fields to prevent SQL injection - frozen for security
const ALLOWED_UPDATE_FIELDS = Object.freeze([
  'crop_name',
  'crop_variety',
  'planting_area',
  'planting_date',
  'harvest_date',
  'expected_yield',
  'yield_unit',
  'status',
]) as readonly string[]

/**
 * PATCH /api/crop-plans
 * Update a crop plan
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return createErrorResponse('Crop plan ID is required', 400, undefined, 'MISSING_ID')
    }

    const updatedCropPlan = await cropRepository.updatePlan(id, updates)

    if (!updatedCropPlan) {
      return createErrorResponse(
        'Crop plan not found or no fields to update',
        404,
        undefined,
        'NOT_FOUND'
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedCropPlan,
      message: 'Crop plan updated successfully',
    })
  } catch (error) {
    console.error('Error updating crop plan:', error)
    return createErrorResponse('Failed to update crop plan', 500)
  }
}

/**
 * DELETE /api/crop-plans
 * Delete a crop plan
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return createErrorResponse('Crop plan ID is required', 400, undefined, 'MISSING_ID')
    }

    const deletedCropPlan = await cropRepository.deletePlan(id)

    if (!deletedCropPlan) {
      return createErrorResponse('Crop plan not found', 404, undefined, 'NOT_FOUND')
    }

    return NextResponse.json({
      success: true,
      message: 'Crop plan deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting crop plan:', error)
    return createErrorResponse('Failed to delete crop plan', 500)
  }
}
