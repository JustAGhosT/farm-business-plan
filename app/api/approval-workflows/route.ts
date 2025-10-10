import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetType = searchParams.get('target_type')
    const targetId = searchParams.get('target_id')

    let queryText = `SELECT w.*, u.name as creator_name FROM approval_workflows w JOIN users u ON w.created_by = u.id WHERE 1=1`
    const params: any[] = []
    let paramIndex = 1

    if (targetType) {
      queryText += ` AND w.target_type = $${paramIndex++}`
      params.push(targetType)
    }
    if (targetId) {
      queryText += ` AND w.target_id = $${paramIndex++}`
      params.push(targetId)
    }

    queryText += ` ORDER BY w.created_at DESC`
    const result = await query(queryText, params)

    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workflows' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type = 'sequential', target_type, target_id, stages } = body

    if (!name || !target_type || !target_id || !stages?.length) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const workflowResult = await query(
      `INSERT INTO approval_workflows (name, type, target_type, target_id, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, type, target_type, target_id, session.user.id, 'pending']
    )

    const workflow = workflowResult.rows[0]

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i]
      const stageResult = await query(
        `INSERT INTO approval_stages (workflow_id, order_index, name, required_approvals)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [workflow.id, i + 1, stage.name, stage.required_approvals || 1]
      )

      for (const approver of stage.approvers || []) {
        await query(`INSERT INTO approval_stage_approvers (stage_id, user_id) VALUES ($1, $2)`, [
          stageResult.rows[0].id,
          approver.user_id,
        ])
        await query(
          `INSERT INTO approvals (stage_id, user_id, user_name, status)
           VALUES ($1, $2, $3, $4)`,
          [stageResult.rows[0].id, approver.user_id, approver.user_name, 'pending']
        )
      }
    }

    return NextResponse.json({ success: true, data: workflow }, { status: 201 })
  } catch (error) {
    console.error('Error creating workflow:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create workflow' },
      { status: 500 }
    )
  }
}
