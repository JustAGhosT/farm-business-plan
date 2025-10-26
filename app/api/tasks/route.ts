import { createErrorResponse } from '@/lib/api-utils'
import { authOptions } from '@/lib/auth'
import { communicationRepository } from '@/lib/repositories/communicationRepository'
import { systemRepository } from '@/lib/repositories/systemRepository'
import { taskRepository } from '@/lib/repositories/taskRepository'
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

    const tasks = await taskRepository.getAll(
      farmPlanId || undefined,
      status || undefined,
      priority || undefined
    )

    return NextResponse.json({
      success: true,
      data: tasks,
      count: tasks.length,
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

    const task = await taskRepository.create(data, createdBy)

    // Create notification if task is assigned to someone
    if (data.assigned_to && data.assigned_to !== createdBy) {
      await communicationRepository.createNotification({
        user_id: data.assigned_to,
        type: 'task-assigned',
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${data.title}`,
        priority: data.priority || 'medium',
        context_type: 'task',
        context_id: task.id,
        action_url: `/tools/dashboard?task=${task.id}`,
      })
    }

    // Log the change
    if (session?.user) {
      await systemRepository.logChange({
        target_type: 'task',
        target_id: task.id,
        user_id: session.user.id,
        user_name: session.user.name || session.user.email,
        action: 'created',
        description: `Created task: ${data.title}`,
      })
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

    const updatedTask = await taskRepository.update(id, updates)

    if (!updatedTask) {
      return createErrorResponse(
        'Task not found or no fields to update',
        404,
        undefined,
        'NOT_FOUND'
      )
    }

    const session = await getServerSession(authOptions)

    // Send notification if task assignment changed
    if (updates.assigned_to !== undefined && session?.user) {
      await communicationRepository
        .createNotification({
          user_id: updates.assigned_to,
          type: 'task-assigned',
          title: 'Task Reassigned',
          message: `Task "${updatedTask.title}" has been assigned to you`,
          priority: updatedTask.priority || 'medium',
          context_type: 'task',
          context_id: updatedTask.id,
          action_url: `/tools/dashboard?task=${updatedTask.id}`,
        })
        .catch((err) => console.error('Failed to send notification:', err))
    }

    // Log the change
    if (session?.user) {
      const changedFields = Object.keys(updates)
        .filter((k) => k !== 'id')
        .join(', ')
      await systemRepository
        .logChange({
          target_type: 'task',
          target_id: id,
          user_id: session.user.id,
          user_name: session.user.name || session.user.email,
          action: 'updated',
          description: `Updated task fields: ${changedFields}`,
        })
        .catch((err) => console.error('Failed to log change:', err))
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

    const deletedTask = await taskRepository.delete(id)

    if (!deletedTask) {
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
