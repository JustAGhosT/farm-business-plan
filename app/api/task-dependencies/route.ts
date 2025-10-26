import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { taskRepository } from '@/lib/repositories/taskRepository'
import { systemRepository } from '@/lib/repositories/systemRepository'

// GET /api/task-dependencies - Get dependencies for tasks
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('task_id')
    const farmPlanId = searchParams.get('farm_plan_id')

    if (taskId) {
      // Get dependencies for a specific task
      const dependencies = await taskRepository.getDependenciesByTaskId(taskId)
      return NextResponse.json({ dependencies })
    } else if (farmPlanId) {
      // Get all dependencies for tasks in a farm plan
      const dependencies = await taskRepository.getDependenciesByFarmPlanId(farmPlanId)
      return NextResponse.json({ dependencies })
    } else {
      return NextResponse.json({ error: 'task_id or farm_plan_id required' }, { status: 400 })
    }
  } catch (error) {
    console.error('Get task dependencies error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/task-dependencies - Create a task dependency
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { task_id, depends_on_task_id, dependency_type = 'finish-to-start', lag_days = 0 } = body

    if (!task_id || !depends_on_task_id) {
      return NextResponse.json(
        { error: 'task_id and depends_on_task_id required' },
        { status: 400 }
      )
    }

    // Check for circular dependency
    const isCircular = await taskRepository.checkCircularDependency(task_id, depends_on_task_id)

    if (isCircular) {
      return NextResponse.json({ error: 'Circular dependency detected' }, { status: 400 })
    }

    // Create dependency
    const dependency = await taskRepository.createDependency({
      task_id,
      depends_on_task_id,
      dependency_type,
      lag_days,
    })

    // Log the change
    await systemRepository.logChange({
      target_type: 'task',
      target_id: task_id,
      action: 'add_dependency',
      user_id: session.user.id,
      description: `Added ${dependency_type} dependency on task ${depends_on_task_id}`,
    })

    return NextResponse.json({ dependency }, { status: 201 })
  } catch (error: any) {
    console.error('Create task dependency error:', error)
    if (error.code === '23505') {
      // Unique violation
      return NextResponse.json({ error: 'Dependency already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/task-dependencies - Remove a task dependency
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dependencyId = searchParams.get('id')

    if (!dependencyId) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    // Get dependency details before deleting
    const dependency = await taskRepository.getDependencyById(dependencyId)

    if (!dependency) {
      return NextResponse.json({ error: 'Dependency not found' }, { status: 404 })
    }

    // Delete dependency
    await taskRepository.deleteDependency(dependencyId)

    // Log the change
    await systemRepository.logChange({
      target_type: 'task',
      target_id: dependency.task_id,
      action: 'remove_dependency',
      user_id: session.user.id,
      description: `Removed dependency on task ${dependency.depends_on_task_id}`,
    })

    return NextResponse.json({ message: 'Dependency removed' })
  } catch (error) {
    console.error('Delete task dependency error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
