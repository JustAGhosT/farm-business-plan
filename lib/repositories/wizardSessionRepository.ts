import { query } from '@/lib/db'

export const wizardSessionRepository = {
  async getAll(userId: string) {
    const result = await query(
      `SELECT
        id,
        session_name,
        years,
        crops,
        total_percentage,
        current_step,
        step_data,
        completed_steps,
        is_completed,
        created_at,
        updated_at
      FROM calculator_wizard_sessions
      WHERE user_id = $1
      ORDER BY updated_at DESC`,
      [userId]
    )
    return result.rows
  },

  async create(userId: string, sessionData: any) {
    const { session_name, years, crops, total_percentage, current_step, step_data } = sessionData
    const result = await query(
      `INSERT INTO calculator_wizard_sessions
        (user_id, session_name, years, crops, total_percentage, current_step, step_data)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        userId,
        session_name,
        years,
        JSON.stringify(crops),
        total_percentage || 0,
        current_step || 1,
        JSON.stringify(step_data || {}),
      ]
    )
    return result.rows[0]
  },

  async update(userId: string, sessionData: any) {
    const {
      id,
      session_name,
      years,
      crops,
      total_percentage,
      current_step,
      step_data,
      completed_steps,
      is_completed,
    } = sessionData

    const updates = []
    const values = []
    let paramCount = 1

    if (session_name !== undefined) {
      updates.push(`session_name = $${paramCount++}`)
      values.push(session_name)
    }
    if (years !== undefined) {
      updates.push(`years = $${paramCount++}`)
      values.push(years)
    }
    if (crops !== undefined) {
      updates.push(`crops = $${paramCount++}`)
      values.push(JSON.stringify(crops))
    }
    if (total_percentage !== undefined) {
      updates.push(`total_percentage = $${paramCount++}`)
      values.push(total_percentage)
    }
    if (current_step !== undefined) {
      updates.push(`current_step = $${paramCount++}`)
      values.push(current_step)
    }
    if (step_data !== undefined) {
      updates.push(`step_data = $${paramCount++}`)
      values.push(JSON.stringify(step_data))
    }
    if (completed_steps !== undefined) {
      updates.push(`completed_steps = $${paramCount++}`)
      values.push(completed_steps)
    }
    if (is_completed !== undefined) {
      updates.push(`is_completed = $${paramCount++}`)
      values.push(is_completed)
    }

    if (updates.length === 0) {
      return null
    }

    values.push(id)
    values.push(userId)

    const result = await query(
      `UPDATE calculator_wizard_sessions
      SET ${updates.join(', ')}
      WHERE id = $${paramCount++} AND user_id = $${paramCount}
      RETURNING *`,
      values
    )
    return result.rows[0]
  },

  async delete(userId: string, sessionId: string) {
    const result = await query(
      `DELETE FROM calculator_wizard_sessions
      WHERE id = $1 AND user_id = $2
      RETURNING id`,
      [sessionId, userId]
    )
    return result.rows[0]
  },
}
