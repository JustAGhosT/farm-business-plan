import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/messages
 * Get messages for a specific context or thread
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get('thread_id')
    const contextType = searchParams.get('context_type')
    const contextId = searchParams.get('context_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let queryText = `
      SELECT 
        m.*,
        u.email as sender_email,
        (SELECT COUNT(*) FROM message_mentions mm WHERE mm.message_id = m.id) as mention_count,
        (SELECT COUNT(*) FROM message_attachments ma WHERE ma.message_id = m.id) as attachment_count,
        (SELECT COUNT(*) FROM messages replies WHERE replies.parent_message_id = m.id) as reply_count
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.is_deleted = false
    `

    const params: any[] = []
    let paramIndex = 1

    if (threadId) {
      queryText += ` AND m.thread_id = $${paramIndex}`
      params.push(threadId)
      paramIndex++
    }

    if (contextType) {
      queryText += ` AND m.context_type = $${paramIndex}`
      params.push(contextType)
      paramIndex++
    }

    if (contextId) {
      queryText += ` AND m.context_id = $${paramIndex}`
      params.push(contextId)
      paramIndex++
    }

    queryText += ` ORDER BY m.created_at ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await query(queryText, params)

    // Get unread count for user
    const unreadResult = await query(
      `SELECT COUNT(DISTINCT m.id) as unread_count
       FROM messages m
       LEFT JOIN message_read_receipts mrr ON m.id = mrr.message_id AND mrr.user_id = $1
       WHERE m.is_deleted = false 
       AND m.sender_id != $1
       AND mrr.id IS NULL
       ${threadId ? 'AND m.thread_id = $2' : ''}`,
      threadId ? [session.user.id, threadId] : [session.user.id]
    )

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      unreadCount: parseInt(unreadResult.rows[0]?.unread_count || '0'),
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 })
  }
}

/**
 * POST /api/messages
 * Create a new message
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { thread_id, content, context_type, context_id, context_section, parent_message_id } =
      body

    // Validate required fields
    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Validate context_type if provided
    if (context_type) {
      const validTypes = ['farm-plan', 'crop-plan', 'task', 'document', 'general']
      if (!validTypes.includes(context_type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid context_type. Must be one of: ${validTypes.join(', ')}`,
          },
          { status: 400 }
        )
      }
    }

    // Generate thread_id if not provided
    const finalThreadId = thread_id || crypto.randomUUID()

    // Insert message
    const result = await query(
      `INSERT INTO messages (
        thread_id, sender_id, sender_name, content,
        context_type, context_id, context_section, parent_message_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        finalThreadId,
        session.user.id,
        session.user.name || session.user.email,
        content,
        context_type || null,
        context_id || null,
        context_section || null,
        parent_message_id || null,
      ]
    )

    const message = result.rows[0]

    // Process @mentions
    const mentionCount = await query('SELECT process_message_mentions($1, $2) as count', [
      message.id,
      content,
    ])

    // Create notifications for mentions
    if (mentionCount.rows[0]?.count > 0) {
      const mentions = await query('SELECT user_id FROM message_mentions WHERE message_id = $1', [
        message.id,
      ])

      for (const mention of mentions.rows) {
        await query(
          `INSERT INTO notifications (
            user_id, type, title, message, priority, context_type, context_id, action_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            mention.user_id,
            'mention',
            'You were mentioned',
            `${session.user.name || session.user.email} mentioned you in a message`,
            'medium',
            'message',
            message.id,
            `/messages?thread_id=${finalThreadId}`,
          ]
        )
      }
    }

    // Log the change
    await query(
      `INSERT INTO change_log (
        target_type, target_id, user_id, user_name, action, description
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'document',
        message.id,
        session.user.id,
        session.user.name || session.user.email,
        'created',
        `Posted message in thread`,
      ]
    )

    return NextResponse.json(
      {
        success: true,
        data: message,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ success: false, error: 'Failed to create message' }, { status: 500 })
  }
}

/**
 * PATCH /api/messages
 * Update a message (edit content)
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, content } = body

    if (!id || !content) {
      return NextResponse.json(
        { success: false, error: 'Message ID and content are required' },
        { status: 400 }
      )
    }

    // Check if message exists and user is the sender
    const checkResult = await query(
      'SELECT sender_id, created_at FROM messages WHERE id = $1 AND is_deleted = false',
      [id]
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 })
    }

    if (checkResult.rows[0].sender_id !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own messages' },
        { status: 403 }
      )
    }

    // Check if message is within edit time limit (15 minutes)
    const createdAt = new Date(checkResult.rows[0].created_at)
    const now = new Date()
    const diffMinutes = (now.getTime() - createdAt.getTime()) / 60000

    if (diffMinutes > 15) {
      return NextResponse.json(
        { success: false, error: 'Messages can only be edited within 15 minutes of posting' },
        { status: 403 }
      )
    }

    // Update message
    const result = await query(
      `UPDATE messages 
       SET content = $1, edited_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [content, id]
    )

    // Reprocess mentions
    await query('DELETE FROM message_mentions WHERE message_id = $1', [id])
    await query('SELECT process_message_mentions($1, $2)', [id, content])

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json({ success: false, error: 'Failed to update message' }, { status: 500 })
  }
}

/**
 * DELETE /api/messages
 * Soft delete a message
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Message ID is required' }, { status: 400 })
    }

    // Check if message exists and user is the sender or admin
    const checkResult = await query(
      'SELECT sender_id FROM messages WHERE id = $1 AND is_deleted = false',
      [id]
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 })
    }

    const userCheck = await query('SELECT role FROM users WHERE id = $1', [session.user.id])

    if (checkResult.rows[0].sender_id !== session.user.id && userCheck.rows[0]?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own messages' },
        { status: 403 }
      )
    }

    // Soft delete
    await query('UPDATE messages SET is_deleted = true WHERE id = $1', [id])

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete message' }, { status: 500 })
  }
}
