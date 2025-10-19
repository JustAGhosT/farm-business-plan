
import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

interface Province {
  id: string
  name: string
  [key: string]: any
}

interface Town {
  id: string
  name: string
  province_id: string
  [key: string]: any
}

export async function GET() {
  try {
    const { rows: provinces } = await query<Province>('SELECT * FROM provinces ORDER BY name')
    const { rows: towns } = await query<Town>('SELECT * FROM towns ORDER BY name')

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
