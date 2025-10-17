import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { CropPlanSchema, validateData } from '@/lib/validation'

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

    let queryText = `
      SELECT 
        cp.*,
        fp.name as farm_plan_name,
        COUNT(DISTINCT fd.id) as financial_data_count,
        COUNT(DISTINCT t.id) as task_count
      FROM crop_plans cp
      JOIN farm_plans fp ON cp.farm_plan_id = fp.id
      LEFT JOIN financial_data fd ON cp.id = fd.crop_plan_id
      LEFT JOIN tasks t ON cp.id = t.crop_plan_id
      WHERE 1=1
    `

    const params: any[] = []
    let paramIndex = 1

    if (farmPlanId) {
      queryText += ` AND cp.farm_plan_id = $${paramIndex}`
      params.push(farmPlanId)
      paramIndex++
    }

    if (status) {
      queryText += ` AND cp.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    queryText += ' GROUP BY cp.id, fp.name ORDER BY cp.created_at DESC'

    const result = await query(queryText, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error('Error fetching crop plans:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch crop plans' },
      { status: 500 }
    )
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
      INSERT INTO crop_plans (
        farm_plan_id, crop_name, crop_variety, planting_area,
        planting_date, harvest_date, expected_yield, yield_unit, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `

    const params = [
      data.farm_plan_id,
      data.crop_name,
      data.crop_variety || null,
      data.planting_area,
      data.planting_date || null,
      data.harvest_date || null,
      data.expected_yield || null,
      data.yield_unit || null,
      data.status || 'planned',
    ]

    const result = await query(queryText, params)

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Crop plan created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating crop plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create crop plan' },
      { status: 500 }
    )
  }
}

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
      return NextResponse.json(
        { success: false, error: 'Crop plan ID is required' },
        { status: 400 }
      )
    }

    const setClauses: string[] = []
    const params: any[] = []
    let paramIndex = 1

    // Build dynamic update query with validated field names
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = $${paramIndex}`)
        params.push(updates[field])
        paramIndex++
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    params.push(id)
    const queryText = `
      UPDATE crop_plans 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await query(queryText, params)

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Crop plan not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Crop plan updated successfully',
    })
  } catch (error) {
    console.error('Error updating crop plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update crop plan' },
      { status: 500 }
    )
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
      return NextResponse.json(
        { success: false, error: 'Crop plan ID is required' },
        { status: 400 }
      )
    }

    const result = await query('DELETE FROM crop_plans WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Crop plan not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Crop plan deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting crop plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete crop plan' },
      { status: 500 }
    )
  }
}
