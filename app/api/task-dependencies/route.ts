import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

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
      const result = await query(
        `SELECT td.*, t1.title as task_title, t2.title as depends_on_title,
                t1.status as task_status, t2.status as depends_on_status,
                t1.due_date as task_due_date, t2.due_date as depends_on_due_date
         FROM task_dependencies td
         JOIN tasks t1 ON t1.id = td.task_id
         JOIN tasks t2 ON t2.id = td.depends_on_task_id
         WHERE td.task_id = $1
         ORDER BY td.created_at DESC`,
        [taskId]
      )
      return NextResponse.json({ dependencies: result.rows })
    } else if (farmPlanId) {
      // Get all dependencies for tasks in a farm plan
      const result = await query(
        `SELECT td.*, t1.title as task_title, t2.title as depends_on_title,
                t1.status as task_status, t2.status as depends_on_status,
                t1.due_date as task_due_date, t2.due_date as depends_on_due_date
         FROM task_dependencies td
         JOIN tasks t1 ON t1.id = td.task_id
         JOIN tasks t2 ON t2.id = td.depends_on_task_id
         WHERE t1.farm_plan_id = $1
         ORDER BY t1.due_date, t1.created_at`,
        [farmPlanId]
      )
      return NextResponse.json({ dependencies: result.rows })
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
    const circularCheck = await query('SELECT check_circular_dependency($1, $2) as is_circular', [
      task_id,
      depends_on_task_id,
    ])

    if (circularCheck.rows[0].is_circular) {
      return NextResponse.json({ error: 'Circular dependency detected' }, { status: 400 })
    }

    // Create dependency
    const result = await query(
      `INSERT INTO task_dependencies (task_id, depends_on_task_id, dependency_type, lag_days)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [task_id, depends_on_task_id, dependency_type, lag_days]
    )

    // Log the change
    await query(
      `INSERT INTO change_log (target_type, target_id, action, user_id, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        'task',
        task_id,
        'add_dependency',
        session.user.id,
        `Added ${dependency_type} dependency on task ${depends_on_task_id}`,
      ]
    )

    return NextResponse.json({ dependency: result.rows[0] }, { status: 201 })
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
    const depResult = await query('SELECT * FROM task_dependencies WHERE id = $1', [dependencyId])

    if (depResult.rows.length === 0) {
      return NextResponse.json({ error: 'Dependency not found' }, { status: 404 })
    }

    const dependency = depResult.rows[0]

    // Delete dependency
    await query('DELETE FROM task_dependencies WHERE id = $1', [dependencyId])

    // Log the change
    await query(
      `INSERT INTO change_log (target_type, target_id, action, user_id, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        'task',
        dependency.task_id,
        'remove_dependency',
        session.user.id,
        `Removed dependency on task ${dependency.depends_on_task_id}`,
      ]
    )

    return NextResponse.json({ message: 'Dependency removed' })
  } catch (error) {
    console.error('Delete task dependency error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
