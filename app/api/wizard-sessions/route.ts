import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

// GET: Fetch all wizard sessions for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      [session.user.id],
    )

    return NextResponse.json({ sessions: result.rows })
  } catch (error) {
    console.error('Error fetching wizard sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch wizard sessions' }, { status: 500 })
  }
}

// POST: Create a new wizard session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { session_name, years, crops, total_percentage, current_step, step_data } = body

    // Validate required fields
    if (!session_name || !years || !crops) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate total_percentage
    if (total_percentage < 0 || total_percentage > 100) {
      return NextResponse.json({ error: 'Invalid total percentage' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO calculator_wizard_sessions 
        (user_id, session_name, years, crops, total_percentage, current_step, step_data)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        session.user.id,
        session_name,
        years,
        JSON.stringify(crops),
        total_percentage || 0,
        current_step || 1,
        JSON.stringify(step_data || {}),
      ],
    )

    return NextResponse.json({ session: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating wizard session:', error)
    return NextResponse.json({ error: 'Failed to create wizard session' }, { status: 500 })
  }
}

// PUT: Update an existing wizard session
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
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
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Build dynamic update query
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
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    values.push(id)
    values.push(session.user.id)

    const result = await query(
      `UPDATE calculator_wizard_sessions 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount++} AND user_id = $${paramCount}
      RETURNING *`,
      values,
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ session: result.rows[0] })
  } catch (error) {
    console.error('Error updating wizard session:', error)
    return NextResponse.json({ error: 'Failed to update wizard session' }, { status: 500 })
  }
}

// DELETE: Delete a wizard session
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    const result = await query(
      `DELETE FROM calculator_wizard_sessions 
      WHERE id = $1 AND user_id = $2
      RETURNING id`,
      [id, session.user.id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Session deleted successfully' })
  } catch (error) {
    console.error('Error deleting wizard session:', error)
    return NextResponse.json({ error: 'Failed to delete wizard session' }, { status: 500 })
  }
}
