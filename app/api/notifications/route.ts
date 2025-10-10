import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/notifications
 * Get notifications for the current user
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
    const isRead = searchParams.get('is_read')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let queryText = `
      SELECT * FROM notifications
      WHERE user_id = $1
    `
    
    const params: any[] = [session.user.id]
    let paramIndex = 2
    
    if (isRead !== null && isRead !== undefined) {
      queryText += ` AND is_read = $${paramIndex}`
      params.push(isRead === 'true')
      paramIndex++
    }
    
    if (type) {
      queryText += ` AND type = $${paramIndex}`
      params.push(type)
      paramIndex++
    }
    
    // Don't show expired notifications
    queryText += ` AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`
    
    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await query(queryText, params)

    // Get unread count
    const unreadResult = await query(
      `SELECT COUNT(*) as unread_count 
       FROM notifications 
       WHERE user_id = $1 AND is_read = false 
       AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`,
      [session.user.id]
    )

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      unreadCount: parseInt(unreadResult.rows[0]?.unread_count || '0')
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, ids, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all notifications as read for the user
      await query(
        `UPDATE notifications 
         SET is_read = true, read_at = CURRENT_TIMESTAMP 
         WHERE user_id = $1 AND is_read = false`,
        [session.user.id]
      )

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      })
    }

    if (ids && Array.isArray(ids)) {
      // Mark multiple notifications as read
      await query(
        `UPDATE notifications 
         SET is_read = true, read_at = CURRENT_TIMESTAMP 
         WHERE id = ANY($1) AND user_id = $2`,
        [ids, session.user.id]
      )

      return NextResponse.json({
        success: true,
        message: `${ids.length} notifications marked as read`
      })
    }

    if (id) {
      // Mark single notification as read
      const result = await query(
        `UPDATE notifications 
         SET is_read = true, read_at = CURRENT_TIMESTAMP 
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [id, session.user.id]
      )

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Notification not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: result.rows[0]
      })
    }

    return NextResponse.json(
      { success: false, error: 'Must provide id, ids, or markAllAsRead' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications
 * Delete a notification
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
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    const result = await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, session.user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}
