import { createErrorResponse } from '@/lib/api-utils'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import { TaskSchema, validateData } from '@/lib/validation'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

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
      count: result.rows.length,
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return createErrorResponse('Failed to fetch tasks', 500)
  }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    // Validate input
    const validation = validateData(TaskSchema, body)
    if (!validation.success) {
      return createErrorResponse(
        'Validation failed',
        400,
        validation.errors?.issues,
        'VALIDATION_ERROR'
      )
    }

    const data = validation.data!
    const createdBy = session?.user?.id || null

    const queryText = `
      INSERT INTO tasks (
        farm_plan_id, crop_plan_id, title, description, 
        status, priority, category, due_date,
        assigned_to, assigned_by, created_by, 
        estimated_duration, requires_approval, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
      data.due_date || null,
      data.assigned_to || null,
      createdBy,
      createdBy,
      data.estimated_duration || null,
      data.requires_approval || false,
      data.notes || null,
    ]

    const result = await query(queryText, params)
    const task = result.rows[0]

    // Create notification if task is assigned to someone
    if (data.assigned_to && data.assigned_to !== createdBy) {
      await query(
        `INSERT INTO notifications (
          user_id, type, title, message, priority, context_type, context_id, action_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          data.assigned_to,
          'task-assigned',
          'New Task Assigned',
          `You have been assigned a new task: ${data.title}`,
          data.priority || 'medium',
          'task',
          task.id,
          `/tools/dashboard?task=${task.id}`,
        ]
      )
    }

    // Log the change
    if (session?.user) {
      await query(
        `INSERT INTO change_log (
          target_type, target_id, user_id, user_name, action, description
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          'task',
          task.id,
          session.user.id,
          session.user.name || session.user.email,
          'created',
          `Created task: ${data.title}`,
        ]
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: task,
        message: 'Task created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating task:', error)
    return createErrorResponse('Failed to create task', 500)
  }
}

// Whitelist of allowed fields to prevent SQL injection - frozen for security
const ALLOWED_UPDATE_FIELDS = Object.freeze([
  'title',
  'description',
  'status',
  'priority',
  'category',
  'due_date',
  'assigned_to',
  'estimated_duration',
  'actual_duration',
  'notes',
]) as readonly string[]

/**
 * PATCH /api/tasks
 * Update a task (typically to change status, priority, or mark as completed)
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return createErrorResponse('Task ID is required', 400, undefined, 'MISSING_ID')
    }

    // Build dynamic UPDATE query with validated field names
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Validate and process only allowed fields
    for (const [key, value] of Object.entries(updates)) {
      if (ALLOWED_UPDATE_FIELDS.includes(key)) {
        fields.push(`${key} = $${paramIndex++}`)
        values.push(value)

        // If marking as completed, set completed_at
        if (key === 'status' && value === 'completed' && !updates.completed_at) {
          fields.push(`completed_at = $${paramIndex++}`)
          values.push(new Date().toISOString())
        }
      }
    }

    if (fields.length === 0) {
      return createErrorResponse('No valid fields to update', 400, undefined, 'NO_FIELDS')
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
      return createErrorResponse('Task not found', 404, undefined, 'NOT_FOUND')
    }

    const updatedTask = result.rows[0]
    const session = await getServerSession(authOptions)

    // Send notification if task assignment changed
    if (updates.assigned_to !== undefined && session?.user) {
      await query(
        `INSERT INTO notifications (
          user_id, type, title, message, priority, context_type, context_id, action_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          updates.assigned_to,
          'task-assigned',
          'Task Reassigned',
          `Task "${updatedTask.title}" has been assigned to you`,
          updatedTask.priority || 'medium',
          'task',
          updatedTask.id,
          `/tools/dashboard?task=${updatedTask.id}`,
        ]
      ).catch((err) => console.error('Failed to send notification:', err))
    }

    // Log the change
    if (session?.user) {
      const changedFields = Object.keys(updates)
        .filter((k) => k !== 'id')
        .join(', ')
      await query(
        `INSERT INTO change_log (
          target_type, target_id, user_id, user_name, action, description
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          'task',
          id,
          session.user.id,
          session.user.name || session.user.email,
          'updated',
          `Updated task fields: ${changedFields}`,
        ]
      ).catch((err) => console.error('Failed to log change:', err))
    }

    return NextResponse.json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully',
    })
  } catch (error) {
    console.error('Error updating task:', error)
    return createErrorResponse('Failed to update task', 500)
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
      return createErrorResponse('Task ID is required', 400, undefined, 'MISSING_ID')
    }

    const queryText = 'DELETE FROM tasks WHERE id = $1 RETURNING id'
    const result = await query(queryText, [id])

    if (result.rows.length === 0) {
      return createErrorResponse('Task not found', 404, undefined, 'NOT_FOUND')
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting task:', error)
    return createErrorResponse('Failed to delete task', 500)
  }
}
