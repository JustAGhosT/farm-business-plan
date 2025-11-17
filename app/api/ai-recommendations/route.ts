import { createErrorResponse } from '@/lib/api-utils'
import { query } from '@/lib/db'
import { AIRecommendationSchema, validateData } from '@/lib/validation'
import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/ai-recommendations
 * Get AI recommendations (optionally filtered by farm_plan_id or category)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const farmPlanId = searchParams.get('farm_plan_id')
    const category = searchParams.get('category')

    let queryText = `
      SELECT 
        ar.*,
        fp.name as farm_plan_name
      FROM ai_recommendations ar
      JOIN farm_plans fp ON ar.farm_plan_id = fp.id
      WHERE 1=1
    `

    const params: any[] = []
    let paramIndex = 1

    if (farmPlanId) {
      queryText += ` AND ar.farm_plan_id = $${paramIndex}`
      params.push(farmPlanId)
      paramIndex++
    }

    if (category) {
      queryText += ` AND ar.category = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    queryText += ' ORDER BY ar.priority DESC, ar.created_at DESC'

    const result = await query(queryText, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error('Error fetching AI recommendations:', error)
    return createErrorResponse('Failed to fetch AI recommendations', 500)
  }
}

/**
 * POST /api/ai-recommendations
 * Create a new AI recommendation
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateData(AIRecommendationSchema, body)
    if (!validation.success) {
      return createErrorResponse(
        'Validation failed',
        400,
        validation.errors?.issues,
        'VALIDATION_ERROR'
      )
    }

    const data = validation.data!

    const queryText = `
      INSERT INTO ai_recommendations (
        farm_plan_id, recommendation_text, category, priority
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `

    const params = [
      data.farm_plan_id,
      data.recommendation_text,
      data.category || null,
      data.priority || 0,
    ]

    const result = await query(queryText, params)

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'AI recommendation created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating AI recommendation:', error)
    return createErrorResponse('Failed to create AI recommendation', 500)
  }
}

/**
 * PATCH /api/ai-recommendations
 * Update an AI recommendation
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return createErrorResponse('AI recommendation ID is required', 400, undefined, 'MISSING_ID')
    }

    const setClauses: string[] = []
    const params: any[] = []
    let paramIndex = 1

    // Build dynamic update query
    const allowedFields = ['recommendation_text', 'category', 'priority']

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = $${paramIndex}`)
        params.push(updates[field])
        paramIndex++
      }
    })

    if (setClauses.length === 0) {
      return createErrorResponse('No valid fields to update', 400, undefined, 'NO_FIELDS')
    }

    params.push(id)
    const queryText = `
      UPDATE ai_recommendations 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await query(queryText, params)

    if (result.rows.length === 0) {
      return createErrorResponse('AI recommendation not found', 404, undefined, 'NOT_FOUND')
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'AI recommendation updated successfully',
    })
  } catch (error) {
    console.error('Error updating AI recommendation:', error)
    return createErrorResponse('Failed to update AI recommendation', 500)
  }
}

/**
 * DELETE /api/ai-recommendations
 * Delete an AI recommendation
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return createErrorResponse('AI recommendation ID is required', 400, undefined, 'MISSING_ID')
    }

    const result = await query('DELETE FROM ai_recommendations WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return createErrorResponse('AI recommendation not found', 404, undefined, 'NOT_FOUND')
    }

    return NextResponse.json({
      success: true,
      message: 'AI recommendation deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting AI recommendation:', error)
    return createErrorResponse('Failed to delete AI recommendation', 500)
  }
}
