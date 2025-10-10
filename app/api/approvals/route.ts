import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { stage_id, status, comments, signature } = body

    if (!stage_id || !status) {
      return NextResponse.json(
        { success: false, error: 'stage_id and status required' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status must be approved or rejected' },
        { status: 400 }
      )
    }

    // Update approval
    const result = await query(
      `UPDATE approvals 
       SET status = $1, timestamp = CURRENT_TIMESTAMP, comments = $2, signature = $3
       WHERE stage_id = $4 AND user_id = $5
       RETURNING *`,
      [status, comments || null, signature || null, stage_id, session.user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Approval not found or not authorized' },
        { status: 404 }
      )
    }

    // Check stage approval status
    await query('SELECT check_stage_approval($1)', [stage_id])

    // Log the change
    await query(
      `INSERT INTO change_log (target_type, target_id, user_id, user_name, action, description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'approval',
        result.rows[0].id,
        session.user.id,
        session.user.name || session.user.email,
        status,
        `${status} approval stage`,
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error processing approval:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process approval' },
      { status: 500 }
    )
  }
}
