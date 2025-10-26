import { createErrorResponse, validateUuidParam } from '@/lib/api-utils'
import { farmPlanRepository } from '@/lib/repositories/farmPlanRepository'
import { FarmPlanSchema, validateData } from '@/lib/validation'
import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/farm-plans/[id]
 * Get a single farm plan by ID
 */
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params
    const { id: rawId } = params

    // Validate ID parameter
    const validation = validateUuidParam(rawId)
    if (!validation.success) {
      return validation.response
    }
    const id = validation.id

    const farmPlan = await farmPlanRepository.getById(id)

    if (!farmPlan) {
      return createErrorResponse('Farm plan not found', 404, undefined, 'NOT_FOUND')
    }

    return NextResponse.json({
      success: true,
      data: farmPlan,
    })
  } catch (error) {
    console.error('Error fetching farm plan:', error)
    return createErrorResponse('Failed to fetch farm plan', 500)
  }
}

/**
 * PUT /api/farm-plans/[id]
 * Update an existing farm plan
 */
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params
    const { id: rawId } = params

    // Validate ID parameter
    const idValidation = validateUuidParam(rawId)
    if (!idValidation.success) {
      return idValidation.response
    }
    const id = idValidation.id

    const body = await request.json()

    // Validate input
    const validation = validateData(FarmPlanSchema.partial(), body)
    if (!validation.success) {
      return createErrorResponse(
        'Validation failed',
        400,
        validation.errors?.issues,
        'VALIDATION_ERROR'
      )
    }

    const updatedFarmPlan = await farmPlanRepository.update(id, validation.data!)

    if (!updatedFarmPlan) {
      return createErrorResponse('Farm plan not found or no fields to update', 404, undefined, 'NOT_FOUND')
    }

    return NextResponse.json({
      success: true,
      data: updatedFarmPlan,
      message: 'Farm plan updated successfully',
    })
  } catch (error) {
    console.error('Error updating farm plan:', error)
    return createErrorResponse('Failed to update farm plan', 500)
  }
}

/**
 * DELETE /api/farm-plans/[id]
 * Delete a farm plan
 */
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params
    const { id: rawId } = params

    // Validate ID parameter
    const validation = validateUuidParam(rawId)
    if (!validation.success) {
      return validation.response
    }
    const id = validation.id

    const deletedFarmPlan = await farmPlanRepository.delete(id)

    if (!deletedFarmPlan) {
      return createErrorResponse('Farm plan not found', 404, undefined, 'NOT_FOUND')
    }

    return NextResponse.json({
      success: true,
      message: 'Farm plan deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting farm plan:', error)
    return createErrorResponse('Failed to delete farm plan', 500)
  }
}
