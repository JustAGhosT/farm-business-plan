import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { CalculatorResultSchema, validateData } from '@/lib/validation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/calculator-results
 * Get calculator results (optionally filtered by farm_plan_id, calculator_type, user_id)
 * 
 * Query params:
 * - farm_plan_id: UUID (optional) - Filter by farm plan
 * - crop_plan_id: UUID (optional) - Filter by crop plan
 * - calculator_type: string (optional) - Filter by calculator type
 * - user_id: UUID (optional) - Filter by user
 * - limit: number (optional) - Limit results (default: 50)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const farmPlanId = searchParams.get('farm_plan_id')
    const cropPlanId = searchParams.get('crop_plan_id')
    const calculatorType = searchParams.get('calculator_type')
    const userId = searchParams.get('user_id')
    const limit = parseInt(searchParams.get('limit') || '50')

    let queryText = `
      SELECT 
        cr.*,
        fp.name as farm_plan_name,
        cp.crop_name
      FROM calculator_results cr
      LEFT JOIN farm_plans fp ON cr.farm_plan_id = fp.id
      LEFT JOIN crop_plans cp ON cr.crop_plan_id = cp.id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramIndex = 1
    
    if (farmPlanId) {
      queryText += ` AND cr.farm_plan_id = $${paramIndex}`
      params.push(farmPlanId)
      paramIndex++
    }
    
    if (cropPlanId) {
      queryText += ` AND cr.crop_plan_id = $${paramIndex}`
      params.push(cropPlanId)
      paramIndex++
    }
    
    if (calculatorType) {
      queryText += ` AND cr.calculator_type = $${paramIndex}`
      params.push(calculatorType)
      paramIndex++
    }
    
    if (userId) {
      queryText += ` AND cr.user_id = $${paramIndex}`
      params.push(userId)
      paramIndex++
    }
    
    queryText += ` ORDER BY cr.created_at DESC LIMIT $${paramIndex}`
    params.push(limit)

    const result = await query(queryText, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    })
  } catch (error) {
    console.error('Error fetching calculator results:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calculator results' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/calculator-results
 * Create a new calculator result
 * 
 * Request body: CalculatorResult object (without id)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate the data
    const validation = validateData(CalculatorResultSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      )
    }

    const data = validation.data!

    const queryText = `
      INSERT INTO calculator_results (
        farm_plan_id, crop_plan_id, user_id, calculator_type, 
        input_data, results, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `

    const result = await query(queryText, [
      data.farm_plan_id || null,
      data.crop_plan_id || null,
      data.user_id || null,
      data.calculator_type,
      JSON.stringify(data.input_data),
      JSON.stringify(data.results),
      data.notes || null
    ])

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating calculator result:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create calculator result' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/calculator-results?id=uuid
 * Delete a calculator result
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Calculator result ID is required' },
        { status: 400 }
      )
    }

    const queryText = 'DELETE FROM calculator_results WHERE id = $1 RETURNING id'
    const result = await query(queryText, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Calculator result not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Calculator result deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting calculator result:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete calculator result' },
      { status: 500 }
    )
  }
}
