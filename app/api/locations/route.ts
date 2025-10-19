
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const { rows: provinces } = await db.query('SELECT * FROM provinces ORDER BY name')
    const { rows: towns } = await db.query('SELECT * FROM towns ORDER BY name')

    const locations = provinces.map((province) => ({
      ...province,
      towns: towns.filter((town) => town.province_id === province.id),
    }))

    return NextResponse.json({ locations })
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
