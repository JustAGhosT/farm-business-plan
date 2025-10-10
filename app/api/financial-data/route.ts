import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { FinancialDataSchema, validateData } from '@/lib/validation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/financial-data
 * Get financial data (optionally filtered by crop_plan_id)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cropPlanId = searchParams.get('crop_plan_id')
    const farmPlanId = searchParams.get('farm_plan_id')

    let queryText = `
      SELECT 
        fd.*,
        cp.crop_name,
        cp.planting_area,
        fp.name as farm_plan_name
      FROM financial_data fd
      JOIN crop_plans cp ON fd.crop_plan_id = cp.id
      JOIN farm_plans fp ON cp.farm_plan_id = fp.id
      WHERE 1=1
    `

    const params: any[] = []
    let paramIndex = 1

    if (cropPlanId) {
      queryText += ` AND fd.crop_plan_id = $${paramIndex}`
      params.push(cropPlanId)
      paramIndex++
    }

    if (farmPlanId) {
      queryText += ` AND cp.farm_plan_id = $${paramIndex}`
      params.push(farmPlanId)
      paramIndex++
    }

    queryText += ' ORDER BY fd.created_at DESC'

    const result = await query(queryText, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error('Error fetching financial data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch financial data' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/financial-data
 * Create new financial data entry
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateData(FinancialDataSchema, body)
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
      INSERT INTO financial_data (
        crop_plan_id, initial_investment, fixed_costs, variable_costs,
        monthly_operating_costs, annual_operating_costs, projected_revenue,
        break_even_point, roi_percentage
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `

    const params = [
      data.crop_plan_id,
      data.initial_investment || null,
      data.fixed_costs || null,
      data.variable_costs || null,
      data.monthly_operating_costs || null,
      data.annual_operating_costs || null,
      data.projected_revenue || null,
      data.break_even_point || null,
      data.roi_percentage || null,
    ]

    const result = await query(queryText, params)

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Financial data created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating financial data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create financial data' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/financial-data
 * Update financial data entry
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Financial data ID is required' },
        { status: 400 }
      )
    }

    const setClauses: string[] = []
    const params: any[] = []
    let paramIndex = 1

    // Build dynamic update query
    const allowedFields = [
      'initial_investment',
      'fixed_costs',
      'variable_costs',
      'monthly_operating_costs',
      'annual_operating_costs',
      'projected_revenue',
      'break_even_point',
      'roi_percentage',
    ]

    allowedFields.forEach((field) => {
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
      UPDATE financial_data 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await query(queryText, params)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Financial data not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Financial data updated successfully',
    })
  } catch (error) {
    console.error('Error updating financial data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update financial data' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/financial-data
 * Delete financial data entry
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Financial data ID is required' },
        { status: 400 }
      )
    }

    const result = await query('DELETE FROM financial_data WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Financial data not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Financial data deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting financial data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete financial data' },
      { status: 500 }
    )
  }
}
