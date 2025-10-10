import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/expenses
 * Get expense records with filtering and categorization
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const farmPlanId = searchParams.get('farm_plan_id')
    const category = searchParams.get('category')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let queryText = `
      SELECT e.*, fp.name as farm_plan_name, cp.crop_name
      FROM expenses e
      LEFT JOIN farm_plans fp ON e.farm_plan_id = fp.id
      LEFT JOIN crop_plans cp ON e.crop_plan_id = cp.id
      WHERE 1=1
    `

    const params: any[] = []
    let paramIndex = 1

    if (farmPlanId) {
      queryText += ` AND e.farm_plan_id = $${paramIndex}`
      params.push(farmPlanId)
      paramIndex++
    }

    if (category) {
      queryText += ` AND e.category = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    if (startDate) {
      queryText += ` AND e.expense_date >= $${paramIndex}`
      params.push(startDate)
      paramIndex++
    }

    if (endDate) {
      queryText += ` AND e.expense_date <= $${paramIndex}`
      params.push(endDate)
      paramIndex++
    }

    queryText += ' ORDER BY e.expense_date DESC, e.created_at DESC'

    const result = await query(queryText, params)

    // Calculate summary statistics
    const summary = calculateExpenseSummary(result.rows)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      summary,
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

/**
 * POST /api/expenses
 * Create a new expense record
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      farm_plan_id,
      crop_plan_id,
      category,
      description,
      amount,
      expense_date,
      payment_method,
      vendor,
      receipt_url,
    } = body

    if (!farm_plan_id || !category || !amount || !expense_date) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      )
    }

    const queryText = `
      INSERT INTO expenses (
        farm_plan_id, crop_plan_id, category, description,
        amount, expense_date, payment_method, vendor, receipt_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `

    const params = [
      farm_plan_id,
      crop_plan_id || null,
      category,
      description || null,
      amount,
      expense_date,
      payment_method || null,
      vendor || null,
      receipt_url || null,
    ]

    const result = await query(queryText, params)

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Expense created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ success: false, error: 'Failed to create expense' }, { status: 500 })
  }
}

/**
 * PATCH /api/expenses
 * Update an expense record
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Expense ID is required' }, { status: 400 })
    }

    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    const allowedFields = [
      'category',
      'description',
      'amount',
      'expense_date',
      'payment_method',
      'vendor',
      'receipt_url',
      'crop_plan_id',
    ]

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`)
        values.push(updates[field])
        paramIndex++
      }
    })

    if (fields.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    values.push(id)
    const queryText = `
      UPDATE expenses
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await query(queryText, values)

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Expense updated successfully',
    })
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json({ success: false, error: 'Failed to update expense' }, { status: 500 })
  }
}

/**
 * DELETE /api/expenses
 * Delete an expense record
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Expense ID is required' }, { status: 400 })
    }

    const result = await query('DELETE FROM expenses WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete expense' }, { status: 500 })
  }
}

function calculateExpenseSummary(expenses: any[]) {
  const summary: any = {
    total: 0,
    byCategory: {} as Record<string, number>,
    byMonth: {} as Record<string, number>,
    count: expenses.length,
  }

  expenses.forEach((expense) => {
    const amount = parseFloat(expense.amount) || 0
    summary.total += amount

    // By category
    if (!summary.byCategory[expense.category]) {
      summary.byCategory[expense.category] = 0
    }
    summary.byCategory[expense.category] += amount

    // By month
    if (expense.expense_date) {
      const monthKey = expense.expense_date.substring(0, 7) // YYYY-MM
      if (!summary.byMonth[monthKey]) {
        summary.byMonth[monthKey] = 0
      }
      summary.byMonth[monthKey] += amount
    }
  })

  // Calculate category percentages
  summary.categoryPercentages = {}
  Object.keys(summary.byCategory).forEach((category) => {
    summary.categoryPercentages[category] = (
      (summary.byCategory[category] / summary.total) *
      100
    ).toFixed(2)
  })

  return summary
}
