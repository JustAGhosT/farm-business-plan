import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/change-log
 * Get change log entries (optionally filtered by target_type, target_id, user_id)
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetType = searchParams.get('target_type')
    const targetId = searchParams.get('target_id')
    const userId = searchParams.get('user_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let queryText = `
      SELECT 
        cl.*,
        u.name as user_full_name,
        u.email as user_email
      FROM change_log cl
      LEFT JOIN users u ON cl.user_id = u.id
      WHERE 1=1
    `

    const params: any[] = []
    let paramIndex = 1

    if (targetType) {
      queryText += ` AND cl.target_type = $${paramIndex}`
      params.push(targetType)
      paramIndex++
    }

    if (targetId) {
      queryText += ` AND cl.target_id = $${paramIndex}`
      params.push(targetId)
      paramIndex++
    }

    if (userId) {
      queryText += ` AND cl.user_id = $${paramIndex}`
      params.push(userId)
      paramIndex++
    }

    queryText += ` ORDER BY cl.timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await query(queryText, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error('Error fetching change log:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch change log' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/change-log
 * Create a new change log entry
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { target_type, target_id, action, description, field, old_value, new_value, metadata } =
      body

    // Validate required fields
    if (!target_type || !target_id || !action || !description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: target_type, target_id, action, description',
        },
        { status: 400 }
      )
    }

    // Validate target_type
    const validTargetTypes = ['farm-plan', 'crop-plan', 'task', 'financial-data', 'document']
    if (!validTargetTypes.includes(target_type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid target_type. Must be one of: ${validTargetTypes.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate action
    const validActions = ['created', 'updated', 'deleted', 'approved', 'rejected']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO change_log (
        target_type, target_id, user_id, user_name, action,
        description, field, old_value, new_value, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        target_type,
        target_id,
        session.user.id,
        session.user.name,
        action,
        description,
        field || null,
        old_value || null,
        new_value || null,
        metadata ? JSON.stringify(metadata) : null,
      ]
    )

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating change log entry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create change log entry' },
      { status: 500 }
    )
  }
}
