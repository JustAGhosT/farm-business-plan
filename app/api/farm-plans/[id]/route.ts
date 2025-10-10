import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { FarmPlanSchema, validateData } from '@/lib/validation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/farm-plans/[id]
 * Get a single farm plan by ID
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const queryText = `
      SELECT 
        fp.*,
        COUNT(DISTINCT cp.id) as crop_count,
        COUNT(DISTINCT t.id) as task_count
      FROM farm_plans fp
      LEFT JOIN crop_plans cp ON fp.id = cp.farm_plan_id
      LEFT JOIN tasks t ON fp.id = t.farm_plan_id
      WHERE fp.id = $1
      GROUP BY fp.id
    `

    const result = await query(queryText, [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Farm plan not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error fetching farm plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch farm plan' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/farm-plans/[id]
 * Update an existing farm plan
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    // Validate input
    const validation = validateData(FarmPlanSchema.partial(), body)
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

    // Build dynamic UPDATE query
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`)
      values.push(data.name)
    }
    if (data.location !== undefined) {
      fields.push(`location = $${paramIndex++}`)
      values.push(data.location)
    }
    if (data.province !== undefined) {
      fields.push(`province = $${paramIndex++}`)
      values.push(data.province)
    }
    if (data.coordinates !== undefined) {
      fields.push(`coordinates = $${paramIndex++}`)
      values.push(data.coordinates ? JSON.stringify(data.coordinates) : null)
    }
    if (data.farm_size !== undefined) {
      fields.push(`farm_size = $${paramIndex++}`)
      values.push(data.farm_size)
    }
    if (data.soil_type !== undefined) {
      fields.push(`soil_type = $${paramIndex++}`)
      values.push(data.soil_type)
    }
    if (data.water_source !== undefined) {
      fields.push(`water_source = $${paramIndex++}`)
      values.push(data.water_source)
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex++}`)
      values.push(data.status)
    }

    if (fields.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    // Add updated_at timestamp
    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const queryText = `
      UPDATE farm_plans 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await query(queryText, values)

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Farm plan not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Farm plan updated successfully',
    })
  } catch (error) {
    console.error('Error updating farm plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update farm plan' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/farm-plans/[id]
 * Delete a farm plan
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Check if farm plan exists
    const checkQuery = 'SELECT id FROM farm_plans WHERE id = $1'
    const checkResult = await query(checkQuery, [id])

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Farm plan not found' }, { status: 404 })
    }

    // Delete farm plan (cascade will handle related records)
    const deleteQuery = 'DELETE FROM farm_plans WHERE id = $1 RETURNING id'
    await query(deleteQuery, [id])

    return NextResponse.json({
      success: true,
      message: 'Farm plan deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting farm plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete farm plan' },
      { status: 500 }
    )
  }
}
