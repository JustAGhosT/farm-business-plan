import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const province = searchParams.get('province')
  const town = searchParams.get('town')

  try {
    let query = db.selectFrom('crops')

    if (province) {
      query = query.where('province', '=', province)
    }

    if (town) {
      query = query.where('town', '=', town)
    }

    const suggestions = await query.selectAll().execute()
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Error fetching crop suggestions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
