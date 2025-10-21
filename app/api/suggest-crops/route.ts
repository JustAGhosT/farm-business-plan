import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const province = searchParams.get('province')
  const town = searchParams.get('town')

  try {
    let baseQuery = 'SELECT * FROM crops'
    const whereClauses = []
    const params = []
    let paramIndex = 1

    if (province) {
      whereClauses.push(`province = $${paramIndex++}`)
      params.push(province)
    }

    if (town) {
      whereClauses.push(`town = $${paramIndex++}`)
      params.push(town)
    }

    if (whereClauses.length > 0) {
      baseQuery += ' WHERE ' + whereClauses.join(' AND ')
    }

    const result = await query(baseQuery, params)
    const suggestions = result.rows
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Error fetching crop suggestions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
