import { createErrorResponse } from '@/lib/api-utils'
import { query } from '@/lib/db'
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

    let queryText = `
      SELECT 
        fp.*,
        COUNT(DISTINCT cp.id) as crop_count,
        COUNT(DISTINCT t.id) as task_count
      FROM farm_plans fp
      LEFT JOIN crop_plans cp ON fp.id = cp.farm_plan_id
      LEFT JOIN tasks t ON fp.id = t.farm_plan_id
    `

    const params: any[] = []

    if (ownerId) {
      queryText += ' WHERE fp.owner_id = $1'
      params.push(ownerId)
    }

    queryText += ' GROUP BY fp.id ORDER BY fp.created_at DESC'

    const result = await query(queryText, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
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

    const data = validation.data!

    const queryText = `
      INSERT INTO farm_plans (
        name, location, province, coordinates, farm_size, 
        soil_type, water_source, status, owner_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `

    const params = [
      data.name,
      data.location,
      data.province || null,
      data.coordinates ? JSON.stringify(data.coordinates) : null,
      data.farm_size,
      data.soil_type || null,
      data.water_source || null,
      data.status || 'draft',
      data.owner_id || null,
    ]

    const result = await query(queryText, params)

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Farm plan created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating farm plan:', error)
    return createErrorResponse('Failed to create farm plan', 500)
  }
}
