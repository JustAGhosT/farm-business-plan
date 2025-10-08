import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { ClimateDataSchema, validateData } from '@/lib/validation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/climate-data
 * Get climate data (optionally filtered by farm_plan_id)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const farmPlanId = searchParams.get('farm_plan_id')

    let queryText = `
      SELECT cd.*, fp.name as farm_plan_name
      FROM climate_data cd
      JOIN farm_plans fp ON cd.farm_plan_id = fp.id
    `
    
    const params: any[] = []
    
    if (farmPlanId) {
      queryText += ' WHERE cd.farm_plan_id = $1'
      params.push(farmPlanId)
    }
    
    queryText += ' ORDER BY cd.created_at DESC'

    const result = await query(queryText, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    })
  } catch (error) {
    console.error('Error fetching climate data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch climate data' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/climate-data
 * Create new climate data entry
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = validateData(ClimateDataSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validation.errors?.issues 
        },
        { status: 400 }
      )
    }

    const data = validation.data!

    const queryText = `
      INSERT INTO climate_data (
        farm_plan_id, avg_temp_summer, avg_temp_winter, 
        annual_rainfall, frost_risk, growing_season_length, auto_populated
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `

    const params = [
      data.farm_plan_id,
      data.avg_temp_summer || null,
      data.avg_temp_winter || null,
      data.annual_rainfall || null,
      data.frost_risk || false,
      data.growing_season_length || null,
      data.auto_populated || false
    ]

    const result = await query(queryText, params)

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Climate data created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating climate data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create climate data' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/climate-data
 * Update climate data entry
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Climate data ID is required' },
        { status: 400 }
      )
    }

    const setClauses: string[] = []
    const params: any[] = []
    let paramIndex = 1

    // Build dynamic update query
    const allowedFields = [
      'avg_temp_summer', 'avg_temp_winter', 'annual_rainfall',
      'frost_risk', 'growing_season_length', 'auto_populated'
    ]

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = $${paramIndex}`)
        params.push(updates[field])
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
      UPDATE climate_data 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await query(queryText, params)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Climate data not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Climate data updated successfully'
    })
  } catch (error) {
    console.error('Error updating climate data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update climate data' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/climate-data
 * Delete climate data entry
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Climate data ID is required' },
        { status: 400 }
      )
    }

    const result = await query(
      'DELETE FROM climate_data WHERE id = $1 RETURNING id',
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Climate data not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Climate data deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting climate data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete climate data' },
      { status: 500 }
    )
  }
}
