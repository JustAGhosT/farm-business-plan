import { createErrorResponse } from '@/lib/api-utils'
import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/inventory
 * Get inventory items with low-stock alerts
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const farmPlanId = searchParams.get('farm_plan_id')
    const category = searchParams.get('category')
    const lowStockOnly = searchParams.get('low_stock') === 'true'

    let queryText = `
      SELECT i.*, fp.name as farm_plan_name
      FROM inventory i
      LEFT JOIN farm_plans fp ON i.farm_plan_id = fp.id
      WHERE 1=1
    `

    const params: any[] = []
    let paramIndex = 1

    if (farmPlanId) {
      queryText += ` AND i.farm_plan_id = $${paramIndex}`
      params.push(farmPlanId)
      paramIndex++
    }

    if (category) {
      queryText += ` AND i.category = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    queryText += ' ORDER BY i.item_name ASC'

    const result = await query(queryText, params)

    // Calculate alerts
    const items = result.rows.map((item) => ({
      ...item,
      isLowStock: item.quantity <= item.reorder_level,
      stockStatus: getStockStatus(item.quantity, item.reorder_level),
    }))

    const filteredItems = lowStockOnly ? items.filter((item) => item.isLowStock) : items

    return NextResponse.json({
      success: true,
      data: filteredItems,
      count: filteredItems.length,
      alerts: {
        lowStock: items.filter((i) => i.isLowStock).length,
        critical: items.filter((i) => i.quantity === 0).length,
      },
    })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return createErrorResponse('Failed to fetch inventory', 500)
  }
}

/**
 * POST /api/inventory
 * Add new inventory item
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      farm_plan_id,
      item_name,
      category,
      quantity,
      unit,
      reorder_level,
      unit_cost,
      supplier,
      notes,
    } = body

    if (!farm_plan_id || !item_name || !category || quantity === undefined) {
      return createErrorResponse('Required fields missing', 400, undefined, 'MISSING_FIELDS')
    }

    const queryText = `
      INSERT INTO inventory (
        farm_plan_id, item_name, category, quantity,
        unit, reorder_level, unit_cost, supplier, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `

    const params = [
      farm_plan_id,
      item_name,
      category,
      quantity,
      unit || 'units',
      reorder_level || 0,
      unit_cost || 0,
      supplier || null,
      notes || null,
    ]

    const result = await query(queryText, params)

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Inventory item added successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding inventory:', error)
    return createErrorResponse('Failed to add inventory item', 500)
  }
}

/**
 * PATCH /api/inventory
 * Update inventory quantity or details
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, action, quantity: updateQuantity, ...updates } = body

    if (!id) {
      return createErrorResponse('Inventory ID is required', 400, undefined, 'MISSING_ID')
    }

    let queryText = ''
    let params: any[] = []

    if (action === 'add' || action === 'subtract') {
      // Quantity adjustment
      const operator = action === 'add' ? '+' : '-'
      queryText = `
        UPDATE inventory
        SET quantity = quantity ${operator} $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `
      params = [updateQuantity, id]
    } else {
      // Regular update
      const fields: string[] = []
      const values: any[] = []
      let paramIndex = 1

      const allowedFields = [
        'item_name',
        'category',
        'quantity',
        'unit',
        'reorder_level',
        'unit_cost',
        'supplier',
        'notes',
      ]

      allowedFields.forEach((field) => {
        if (updates[field] !== undefined) {
          fields.push(`${field} = $${paramIndex}`)
          values.push(updates[field])
          paramIndex++
        }
      })

      if (fields.length === 0) {
        return createErrorResponse('No fields to update', 400, undefined, 'NO_FIELDS')
      }

      fields.push('updated_at = CURRENT_TIMESTAMP')
      values.push(id)

      queryText = `
        UPDATE inventory
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `
      params = values
    }

    const result = await query(queryText, params)

    if (result.rows.length === 0) {
      return createErrorResponse('Inventory item not found', 404, undefined, 'NOT_FOUND')
    }

    const item = result.rows[0]
    const alert =
      item.quantity <= item.reorder_level
        ? { type: 'low_stock', message: `${item.item_name} is at or below reorder level` }
        : null

    return NextResponse.json({
      success: true,
      data: item,
      alert,
      message: 'Inventory updated successfully',
    })
  } catch (error) {
    console.error('Error updating inventory:', error)
    return createErrorResponse('Failed to update inventory', 500)
  }
}

/**
 * DELETE /api/inventory
 * Delete an inventory item
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return createErrorResponse('Inventory ID is required', 400, undefined, 'MISSING_ID')
    }

    const result = await query('DELETE FROM inventory WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return createErrorResponse('Inventory item not found', 404, undefined, 'NOT_FOUND')
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory item deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting inventory:', error)
    return createErrorResponse('Failed to delete inventory item', 500)
  }
}

function getStockStatus(quantity: number, reorderLevel: number): string {
  if (quantity === 0) return 'out_of_stock'
  if (quantity <= reorderLevel) return 'low_stock'
  if (quantity <= reorderLevel * 1.5) return 'warning'
  return 'healthy'
}
