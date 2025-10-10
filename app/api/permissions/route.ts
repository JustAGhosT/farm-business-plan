import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/permissions
 * Get user permissions (optionally filtered by user_id or farm_plan_id)
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

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id') || session.user.id
    const farmPlanId = searchParams.get('farm_plan_id')

    let queryText = `
      SELECT 
        up.*,
        u.name as user_name,
        u.email as user_email,
        fp.name as farm_plan_name,
        gb.name as granted_by_name
      FROM user_permissions up
      JOIN users u ON up.user_id = u.id
      JOIN farm_plans fp ON up.farm_plan_id = fp.id
      LEFT JOIN users gb ON up.granted_by = gb.id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramIndex = 1
    
    if (userId) {
      queryText += ` AND up.user_id = $${paramIndex}`
      params.push(userId)
      paramIndex++
    }
    
    if (farmPlanId) {
      queryText += ` AND up.farm_plan_id = $${paramIndex}`
      params.push(farmPlanId)
      paramIndex++
    }
    
    queryText += ' ORDER BY up.created_at DESC'

    const result = await query(queryText, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch permissions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/permissions
 * Grant permissions to a user for a farm plan
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
      user_id,
      farm_plan_id,
      role,
      can_view = true,
      can_edit = false,
      can_delete = false,
      can_approve = false,
      can_invite = false,
      custom_permissions,
      expires_at
    } = body

    // Validate required fields
    if (!user_id || !farm_plan_id || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: user_id, farm_plan_id, role' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['owner', 'manager', 'agronomist', 'consultant', 'viewer', 'custom']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if granter has permission to grant permissions
    const granterPermCheck = await query(
      `SELECT can_invite FROM user_permissions 
       WHERE user_id = $1 AND farm_plan_id = $2`,
      [session.user.id, farm_plan_id]
    )

    if (granterPermCheck.rows.length === 0 || !granterPermCheck.rows[0].can_invite) {
      // Check if user is admin
      const userCheck = await query(
        'SELECT role FROM users WHERE id = $1',
        [session.user.id]
      )
      
      if (!userCheck.rows[0] || userCheck.rows[0].role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'You do not have permission to grant permissions' },
          { status: 403 }
        )
      }
    }

    // Insert or update permissions
    const result = await query(
      `INSERT INTO user_permissions (
        user_id, farm_plan_id, role, can_view, can_edit, can_delete,
        can_approve, can_invite, custom_permissions, granted_by, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (user_id, farm_plan_id) 
      DO UPDATE SET
        role = EXCLUDED.role,
        can_view = EXCLUDED.can_view,
        can_edit = EXCLUDED.can_edit,
        can_delete = EXCLUDED.can_delete,
        can_approve = EXCLUDED.can_approve,
        can_invite = EXCLUDED.can_invite,
        custom_permissions = EXCLUDED.custom_permissions,
        granted_by = EXCLUDED.granted_by,
        expires_at = EXCLUDED.expires_at,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        user_id,
        farm_plan_id,
        role,
        can_view,
        can_edit,
        can_delete,
        can_approve,
        can_invite,
        custom_permissions ? JSON.stringify(custom_permissions) : null,
        session.user.id,
        expires_at || null
      ]
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating permission:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create permission' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/permissions?id={id}
 * Revoke permissions
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
    const permissionId = searchParams.get('id')

    if (!permissionId) {
      return NextResponse.json(
        { success: false, error: 'Missing permission ID' },
        { status: 400 }
      )
    }

    // Check if user has permission to revoke
    const permCheck = await query(
      `SELECT up.farm_plan_id, up2.can_invite 
       FROM user_permissions up
       LEFT JOIN user_permissions up2 ON up.farm_plan_id = up2.farm_plan_id AND up2.user_id = $1
       WHERE up.id = $2`,
      [session.user.id, permissionId]
    )

    if (permCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Permission not found' },
        { status: 404 }
      )
    }

    if (!permCheck.rows[0].can_invite) {
      // Check if user is admin
      const userCheck = await query(
        'SELECT role FROM users WHERE id = $1',
        [session.user.id]
      )
      
      if (!userCheck.rows[0] || userCheck.rows[0].role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'You do not have permission to revoke permissions' },
          { status: 403 }
        )
      }
    }

    await query('DELETE FROM user_permissions WHERE id = $1', [permissionId])

    return NextResponse.json({
      success: true,
      message: 'Permission revoked successfully'
    })
  } catch (error) {
    console.error('Error deleting permission:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete permission' },
      { status: 500 }
    )
  }
}
