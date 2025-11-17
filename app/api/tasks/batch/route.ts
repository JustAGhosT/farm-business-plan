import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { taskRepository } from '@/lib/repositories/taskRepository'
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
    const createdBy = session?.user?.id || null
    const createdTasks = await taskRepository.createMany(validatedTasks, createdBy)

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

    const ALLOWED_FIELDS = [
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
    ]

    // Update all tasks in a transaction
    const updatedTasks = await taskRepository.updateMany(body.updates)

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

    const ids = idsParam
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0)

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
    const deletedCount = await taskRepository.deleteMany(ids)

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
