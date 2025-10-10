import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { CropTemplateSchema, validateData } from '@/lib/validation'

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

    let queryText = `
      SELECT * FROM crop_templates
      WHERE 1=1
    `

    const params: any[] = []
    let paramIndex = 1

    if (category) {
      queryText += ` AND category = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    if (isPublic !== null && isPublic !== undefined) {
      queryText += ` AND is_public = $${paramIndex}`
      params.push(isPublic === 'true')
      paramIndex++
    }

    queryText += ' ORDER BY name ASC'

    const result = await query(queryText, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error('Error fetching crop templates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch crop templates' },
      { status: 500 }
    )
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
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.errors?.issues,
        },
        { status: 400 }
      )
    }

    const data = validation.data!

    const queryText = `
      INSERT INTO crop_templates (
        name, description, category, technical_specs,
        financial_projections, growing_requirements, market_info,
        is_public, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `

    const params = [
      data.name,
      data.description || null,
      data.category || null,
      data.technical_specs ? JSON.stringify(data.technical_specs) : null,
      data.financial_projections ? JSON.stringify(data.financial_projections) : null,
      data.growing_requirements ? JSON.stringify(data.growing_requirements) : null,
      data.market_info ? JSON.stringify(data.market_info) : null,
      data.is_public !== undefined ? data.is_public : true,
      data.created_by || null,
    ]

    const result = await query(queryText, params)

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Crop template created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating crop template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create crop template' },
      { status: 500 }
    )
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
      return NextResponse.json(
        { success: false, error: 'Crop template ID is required' },
        { status: 400 }
      )
    }

    const setClauses: string[] = []
    const params: any[] = []
    let paramIndex = 1

    // Build dynamic update query
    const allowedFields = [
      'name',
      'description',
      'category',
      'technical_specs',
      'financial_projections',
      'growing_requirements',
      'market_info',
      'is_public',
    ]

    const jsonFields = [
      'technical_specs',
      'financial_projections',
      'growing_requirements',
      'market_info',
    ]

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        // Convert objects to JSON string for JSONB fields
        if (jsonFields.includes(field) && updates[field] !== null) {
          setClauses.push(`${field} = $${paramIndex}`)
          params.push(JSON.stringify(updates[field]))
        } else {
          setClauses.push(`${field} = $${paramIndex}`)
          params.push(updates[field])
        }
        paramIndex++
      }
    })

    if (setClauses.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    params.push(id)
    const queryText = `
      UPDATE crop_templates 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await query(queryText, params)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Crop template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Crop template updated successfully',
    })
  } catch (error) {
    console.error('Error updating crop template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update crop template' },
      { status: 500 }
    )
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
      return NextResponse.json(
        { success: false, error: 'Crop template ID is required' },
        { status: 400 }
      )
    }

    const result = await query('DELETE FROM crop_templates WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Crop template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Crop template deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting crop template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete crop template' },
      { status: 500 }
    )
  }
}
