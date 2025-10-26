import { createErrorResponse } from '@/lib/api-utils'
import { cropRepository } from '@/lib/repositories/cropRepository'
import { CropTemplateSchema, validateData } from '@/lib/validation'
import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/crop-templates
 * Get crop templates (optionally filtered by category or is_public)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isPublic = searchParams.get('is_public')

    const templates = await cropRepository.getAllTemplates(category, isPublic)

    return NextResponse.json({
      success: true,
      data: templates,
      count: templates.length,
    })
  } catch (error) {
    console.error('Error fetching crop templates:', error)
    return createErrorResponse('Failed to fetch crop templates', 500)
  }
}

/**
 * POST /api/crop-templates
 * Create a new crop template
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateData(CropTemplateSchema, body)
    if (!validation.success) {
      return createErrorResponse(
        'Validation failed',
        400,
        validation.errors?.issues,
        'VALIDATION_ERROR'
      )
    }

    const newTemplate = await cropRepository.createTemplate(validation.data!)

    return NextResponse.json(
      {
        success: true,
        data: newTemplate,
        message: 'Crop template created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating crop template:', error)
    return createErrorResponse('Failed to create crop template', 500)
  }
}

/**
 * PATCH /api/crop-templates
 * Update a crop template
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return createErrorResponse('Crop template ID is required', 400, undefined, 'MISSING_ID')
    }

    const updatedTemplate = await cropRepository.updateTemplate(id, updates)

    if (!updatedTemplate) {
      return createErrorResponse('Crop template not found or no fields to update', 404, undefined, 'NOT_FOUND')
    }

    return NextResponse.json({
      success: true,
      data: updatedTemplate,
      message: 'Crop template updated successfully',
    })
  } catch (error) {
    console.error('Error updating crop template:', error)
    return createErrorResponse('Failed to update crop template', 500)
  }
}

/**
 * DELETE /api/crop-templates
 * Delete a crop template
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return createErrorResponse('Crop template ID is required', 400, undefined, 'MISSING_ID')
    }

    const deletedTemplate = await cropRepository.deleteTemplate(id)

    if (!deletedTemplate) {
      return createErrorResponse('Crop template not found', 404, undefined, 'NOT_FOUND')
    }

    return NextResponse.json({
      success: true,
      message: 'Crop template deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting crop template:', error)
    return createErrorResponse('Failed to delete crop template', 500)
  }
}
