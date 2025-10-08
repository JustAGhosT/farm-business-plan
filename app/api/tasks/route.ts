import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { TaskSchema, validateData } from '@/lib/validation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/tasks
 * Get all tasks (optionally filtered by farm_plan_id, status, priority)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const farmPlanId = searchParams.get('farm_plan_id')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    let queryText = `
      SELECT 
        t.*,
        fp.name as farm_plan_name,
        cp.crop_name
      FROM tasks t
      JOIN farm_plans fp ON t.farm_plan_id = fp.id
      LEFT JOIN crop_plans cp ON t.crop_plan_id = cp.id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramIndex = 1
    
    if (farmPlanId) {
      queryText += ` AND t.farm_plan_id = $${paramIndex}`
      params.push(farmPlanId)
      paramIndex++
    }
    
    if (status) {
      queryText += ` AND t.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }
    
    if (priority) {
      queryText += ` AND t.priority = $${paramIndex}`
      params.push(priority)
      paramIndex++
    }
    
    queryText += ' ORDER BY t.due_date ASC, t.priority DESC, t.created_at DESC'

    const result = await query(queryText, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = validateData(TaskSchema, body)
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
      INSERT INTO tasks (
        farm_plan_id, crop_plan_id, title, description, 
        status, priority, category, due_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `

    const params = [
      data.farm_plan_id,
      data.crop_plan_id || null,
      data.title,
      data.description || null,
      data.status || 'pending',
      data.priority || 'medium',
      data.category || null,
      data.due_date || null
    ]

    const result = await query(queryText, params)

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Task created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/tasks
 * Update a task (typically to change status, priority, or mark as completed)
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // Build dynamic UPDATE query
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (updates.title !== undefined) {
      fields.push(`title = $${paramIndex++}`)
      values.push(updates.title)
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramIndex++}`)
      values.push(updates.description)
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex++}`)
      values.push(updates.status)
      
      // If marking as completed, set completed_at
      if (updates.status === 'completed' && !updates.completed_at) {
        fields.push(`completed_at = $${paramIndex++}`)
        values.push(new Date().toISOString())
      }
    }
    if (updates.priority !== undefined) {
      fields.push(`priority = $${paramIndex++}`)
      values.push(updates.priority)
    }
    if (updates.category !== undefined) {
      fields.push(`category = $${paramIndex++}`)
      values.push(updates.category)
    }
    if (updates.due_date !== undefined) {
      fields.push(`due_date = $${paramIndex++}`)
      values.push(updates.due_date)
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      )
    }

    fields.push(`updated_at = $${paramIndex++}`)
    values.push(new Date().toISOString())
    values.push(id)

    const queryText = `
      UPDATE tasks
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await query(queryText, values)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Task updated successfully'
    })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tasks
 * Delete a task
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const queryText = 'DELETE FROM tasks WHERE id = $1 RETURNING id'
    const result = await query(queryText, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
