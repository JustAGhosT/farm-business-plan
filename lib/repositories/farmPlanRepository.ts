import { query } from '@/lib/db'

export const farmPlanRepository = {
  async getAll(ownerId?: string) {
    let queryText = `
      SELECT
        fp.*,
        COUNT(DISTINCT cp.id) as crop_count,
        COUNT(DISTINCT t.id) as task_count
      FROM farm_plans fp
      LEFT JOIN crop_plans cp ON fp.id = cp.farm_plan_id
      LEFT JOIN tasks t ON fp.id = t.farm_plan_id
    `

    const params: any[] = []

    if (ownerId) {
      queryText += ' WHERE fp.owner_id = $1'
      params.push(ownerId)
    }

    queryText += ' GROUP BY fp.id ORDER BY fp.created_at DESC'

    const result = await query(queryText, params)
    return result.rows
  },

  async getById(id: string) {
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
    return result.rows[0]
  },

  async create(planData: any) {
    const {
      name,
      location,
      province,
      coordinates,
      farm_size,
      soil_type,
      water_source,
      status,
      owner_id,
    } = planData

    const queryText = `
      INSERT INTO farm_plans (
        name, location, province, coordinates, farm_size,
        soil_type, water_source, status, owner_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `

    const params = [
      name,
      location,
      province || null,
      coordinates ? JSON.stringify(coordinates) : null,
      farm_size,
      soil_type || null,
      water_source || null,
      status || 'draft',
      owner_id || null,
    ]

    const result = await query(queryText, params)
    return result.rows[0]
  },

  async update(id: string, planData: any) {
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (planData.name !== undefined) {
      fields.push(`name = $${paramIndex++}`)
      values.push(planData.name)
    }
    if (planData.location !== undefined) {
      fields.push(`location = $${paramIndex++}`)
      values.push(planData.location)
    }
    if (planData.province !== undefined) {
      fields.push(`province = $${paramIndex++}`)
      values.push(planData.province)
    }
    if (planData.coordinates !== undefined) {
      fields.push(`coordinates = $${paramIndex++}`)
      values.push(planData.coordinates ? JSON.stringify(planData.coordinates) : null)
    }
    if (planData.farm_size !== undefined) {
      fields.push(`farm_size = $${paramIndex++}`)
      values.push(planData.farm_size)
    }
    if (planData.soil_type !== undefined) {
      fields.push(`soil_type = $${paramIndex++}`)
      values.push(planData.soil_type)
    }
    if (planData.water_source !== undefined) {
      fields.push(`water_source = $${paramIndex++}`)
      values.push(planData.water_source)
    }
    if (planData.status !== undefined) {
      fields.push(`status = $${paramIndex++}`)
      values.push(planData.status)
    }

    if (fields.length === 0) {
      return null
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const queryText = `
      UPDATE farm_plans
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await query(queryText, values)
    return result.rows[0]
  },

  async delete(id: string) {
    const result = await query('DELETE FROM farm_plans WHERE id = $1 RETURNING id', [id])
    return result.rows[0]
  },
}
