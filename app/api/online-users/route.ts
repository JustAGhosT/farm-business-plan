import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/online-users
 * Get currently online users (optionally filtered by farm_plan_id)
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // First, cleanup stale users (inactive > 5 minutes)
    await query('SELECT cleanup_stale_online_users()')

    const { searchParams } = new URL(request.url)
    const farmPlanId = searchParams.get('farm_plan_id')

    let queryText = `
      SELECT 
        ou.*,
        u.email as user_email
      FROM online_users ou
      JOIN users u ON ou.user_id = u.id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramIndex = 1
    
    if (farmPlanId) {
      queryText += ` AND ou.farm_plan_id = $${paramIndex}`
      params.push(farmPlanId)
      paramIndex++
    }
    
    queryText += ' ORDER BY ou.last_activity DESC'

    const result = await query(queryText, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    })
  } catch (error) {
    console.error('Error fetching online users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch online users' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/online-users
 * Update user's online status (heartbeat)
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      farm_plan_id,
      current_section,
      action = 'viewing',
      session_id
    } = body

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: 'session_id is required' },
        { status: 400 }
      )
    }

    // Validate action
    const validActions = ['viewing', 'editing', 'commenting']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      )
    }

    // Upsert online user record
    const result = await query(
      `INSERT INTO online_users (
        user_id, user_name, farm_plan_id, current_section, action, session_id, last_activity
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, session_id) 
      DO UPDATE SET
        farm_plan_id = EXCLUDED.farm_plan_id,
        current_section = EXCLUDED.current_section,
        action = EXCLUDED.action,
        last_activity = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        session.user.id,
        session.user.name || session.user.email,
        farm_plan_id || null,
        current_section || null,
        action,
        session_id
      ]
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error updating online status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update online status' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/online-users
 * Remove user from online status (logout/disconnect)
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'session_id is required' },
        { status: 400 }
      )
    }

    await query(
      'DELETE FROM online_users WHERE user_id = $1 AND session_id = $2',
      [session.user.id, sessionId]
    )

    return NextResponse.json({
      success: true,
      message: 'User removed from online status'
    })
  } catch (error) {
    console.error('Error removing online status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove online status' },
      { status: 500 }
    )
  }
}
