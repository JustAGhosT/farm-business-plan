import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withTransaction } from '@/lib/db'
import { TaskSchema, validateData } from '@/lib/validation'
import type { Task } from '@/lib/validation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface BatchTaskRequest {
  tasks: Partial<Task>[]
}

interface BatchUpdateRequest {
  updates: Array<{ id: string } & Partial<Task>>
}

/**
 * POST /api/tasks/batch
 * Create multiple tasks in a single transaction
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body: BatchTaskRequest = await request.json()
    
    if (!body.tasks || !Array.isArray(body.tasks) || body.tasks.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tasks array is required and must not be empty' },
        { status: 400 }
      )
    }
    
    // Limit batch size to prevent abuse
    if (body.tasks.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Maximum 50 tasks can be created at once' },
        { status: 400 }
      )
    }
    
    // Validate all tasks
    const validationErrors: any[] = []
    const validatedTasks: Task[] = []
    
    for (let i = 0; i < body.tasks.length; i++) {
      const validation = validateData(TaskSchema, body.tasks[i])
      if (!validation.success) {
        validationErrors.push({
          index: i,
          errors: validation.errors?.issues,
        })
      } else {
        validatedTasks.push(validation.data!)
      }
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed for some tasks',
          details: validationErrors,
        },
        { status: 400 }
      )
    }
    
    // Create all tasks in a transaction
    const createdTasks = await withTransaction(async (client) => {
      const tasks = []
      
      for (const taskData of validatedTasks) {
        const createdBy = session?.user?.id || null
        
        const result = await client.query(
          `INSERT INTO tasks (
            farm_plan_id, crop_plan_id, title, description, 
            status, priority, category, due_date,
            assigned_to, assigned_by, created_by, 
            estimated_duration, requires_approval, notes
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING *`,
          [
            taskData.farm_plan_id,
            taskData.crop_plan_id || null,
            taskData.title,
            taskData.description || null,
            taskData.status || 'pending',
            taskData.priority || 'medium',
            taskData.category || null,
            taskData.due_date || null,
            taskData.assigned_to || null,
            createdBy,
            createdBy,
            taskData.estimated_duration || null,
            taskData.requires_approval || false,
            taskData.notes || null,
          ]
        )
        
        tasks.push(result.rows[0])
      }
      
      return tasks
    })
    
    return NextResponse.json(
      {
        success: true,
        data: createdTasks,
        count: createdTasks.length,
        message: `${createdTasks.length} tasks created successfully`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating batch tasks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create batch tasks' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/tasks/batch
 * Update multiple tasks in a single transaction
 */
export async function PATCH(request: Request) {
  try {
    const body: BatchUpdateRequest = await request.json()
    
    if (!body.updates || !Array.isArray(body.updates) || body.updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Updates array is required and must not be empty' },
        { status: 400 }
      )
    }
    
    // Limit batch size
    if (body.updates.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Maximum 50 tasks can be updated at once' },
        { status: 400 }
      )
    }
    
    // Validate all have IDs
    for (const update of body.updates) {
      if (!update.id) {
        return NextResponse.json(
          { success: false, error: 'All updates must have an id field' },
          { status: 400 }
        )
      }
    }
    
    const ALLOWED_FIELDS = ['title', 'description', 'status', 'priority', 'category', 'due_date', 'assigned_to', 'estimated_duration', 'actual_duration', 'notes']
    
    // Update all tasks in a transaction
    const updatedTasks = await withTransaction(async (client) => {
      const tasks = []
      
      for (const update of body.updates) {
        const { id, ...updates } = update
        
        const fields: string[] = []
        const values: any[] = []
        let paramIndex = 1
        
        for (const [key, value] of Object.entries(updates)) {
          if (ALLOWED_FIELDS.includes(key)) {
            fields.push(`${key} = $${paramIndex++}`)
            values.push(value)
          }
        }
        
        if (fields.length === 0) {
          continue // Skip if no valid fields to update
        }
        
        fields.push(`updated_at = $${paramIndex++}`)
        values.push(new Date().toISOString())
        values.push(id)
        
        const result = await client.query(
          `UPDATE tasks
           SET ${fields.join(', ')}
           WHERE id = $${paramIndex}
           RETURNING *`,
          values
        )
        
        if (result.rows.length > 0) {
          tasks.push(result.rows[0])
        }
      }
      
      return tasks
    })
    
    return NextResponse.json({
      success: true,
      data: updatedTasks,
      count: updatedTasks.length,
      message: `${updatedTasks.length} tasks updated successfully`,
    })
  } catch (error) {
    console.error('Error updating batch tasks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update batch tasks' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tasks/batch
 * Delete multiple tasks in a single transaction
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get('ids')
    
    if (!idsParam) {
      return NextResponse.json(
        { success: false, error: 'ids parameter is required (comma-separated)' },
        { status: 400 }
      )
    }
    
    const ids = idsParam.split(',').map(id => id.trim()).filter(id => id.length > 0)
    
    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one task ID is required' },
        { status: 400 }
      )
    }
    
    // Limit batch size
    if (ids.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Maximum 50 tasks can be deleted at once' },
        { status: 400 }
      )
    }
    
    // Delete all tasks in a transaction
    const deletedCount = await withTransaction(async (client) => {
      const placeholders = ids.map((_, index) => `$${index + 1}`).join(',')
      const result = await client.query(
        `DELETE FROM tasks WHERE id IN (${placeholders}) RETURNING id`,
        ids
      )
      return result.rowCount || 0
    })
    
    return NextResponse.json({
      success: true,
      count: deletedCount,
      message: `${deletedCount} tasks deleted successfully`,
    })
  } catch (error) {
    console.error('Error deleting batch tasks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete batch tasks' },
      { status: 500 }
    )
  }
}
