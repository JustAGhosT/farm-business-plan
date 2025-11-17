import { query, withTransaction } from '@/lib/db'
import { PoolClient } from 'pg'

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

export const taskRepository = {
  async getAll(farmPlanId?: string, status?: string, priority?: string) {
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
    return result.rows
  },

  async create(taskData: any, createdBy: string | null) {
    const {
      farm_plan_id,
      crop_plan_id,
      title,
      description,
      status,
      priority,
      category,
      due_date,
      assigned_to,
      estimated_duration,
      requires_approval,
      notes,
    } = taskData

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
      farm_plan_id,
      crop_plan_id || null,
      title,
      description || null,
      status || 'pending',
      priority || 'medium',
      category || null,
      due_date || null,
      assigned_to || null,
      createdBy,
      createdBy,
      estimated_duration || null,
      requires_approval || false,
      notes || null,
    ]

    const result = await query(queryText, params)
    return result.rows[0]
  },

  async update(id: string, updates: any) {
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    for (const [key, value] of Object.entries(updates)) {
      if (ALLOWED_UPDATE_FIELDS.includes(key)) {
        fields.push(`${key} = $${paramIndex++}`)
        values.push(value)

        if (key === 'status' && value === 'completed' && !updates.completed_at) {
          fields.push(`completed_at = $${paramIndex++}`)
          values.push(new Date().toISOString())
        }
      }
    }

    if (fields.length === 0) {
      return null
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
    return result.rows[0]
  },

  async delete(id: string) {
    const result = await query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id])
    return result.rows[0]
  },

  async createMany(tasks: any[], createdBy: string | null) {
    return withTransaction(async (client: PoolClient) => {
      const createdTasks = []
      for (const taskData of tasks) {
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
        createdTasks.push(result.rows[0])
      }
      return createdTasks
    })
  },

  async updateMany(updates: any[]) {
    return withTransaction(async (client: PoolClient) => {
      const updatedTasks = []
      for (const update of updates) {
        const { id, ...taskUpdates } = update
        const fields: string[] = []
        const values: any[] = []
        let paramIndex = 1

        for (const [key, value] of Object.entries(taskUpdates)) {
          if (ALLOWED_UPDATE_FIELDS.includes(key)) {
            fields.push(`${key} = $${paramIndex++}`)
            values.push(value)
          }
        }

        if (fields.length === 0) {
          continue
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
          updatedTasks.push(result.rows[0])
        }
      }
      return updatedTasks
    })
  },

  async deleteMany(ids: string[]) {
    return withTransaction(async (client: PoolClient) => {
      const placeholders = ids.map((_, index) => `$${index + 1}`).join(',')
      const result = await client.query(
        `DELETE FROM tasks WHERE id IN (${placeholders}) RETURNING id`,
        ids
      )
      return result.rowCount || 0
    })
  },

  async getDependenciesByTaskId(taskId: string) {
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
    return result.rows
  },

  async getDependenciesByFarmPlanId(farmPlanId: string) {
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
    return result.rows
  },

  async checkCircularDependency(taskId: string, dependsOnTaskId: string) {
    const result = await query('SELECT check_circular_dependency($1, $2) as is_circular', [
      taskId,
      dependsOnTaskId,
    ])
    return result.rows[0].is_circular
  },

  async createDependency(dependencyData: any) {
    const {
      task_id,
      depends_on_task_id,
      dependency_type = 'finish-to-start',
      lag_days = 0,
    } = dependencyData
    const result = await query(
      `INSERT INTO task_dependencies (task_id, depends_on_task_id, dependency_type, lag_days)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [task_id, depends_on_task_id, dependency_type, lag_days]
    )
    return result.rows[0]
  },

  async getDependencyById(dependencyId: string) {
    const result = await query('SELECT * FROM task_dependencies WHERE id = $1', [dependencyId])
    return result.rows[0]
  },

  async deleteDependency(dependencyId: string) {
    const result = await query('DELETE FROM task_dependencies WHERE id = $1', [dependencyId])
    return (result.rowCount ?? 0) > 0
  },
}
