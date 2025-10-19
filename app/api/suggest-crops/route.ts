
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const province = searchParams.get('province')
  const town = searchParams.get('town')

  if (!province || !town) {
    return NextResponse.json({ error: 'Province and town are required' }, { status: 400 })
  }

  try {
    const { rows } = await db.query(
      'SELECT crop_name FROM crop_suggestions WHERE province = $1 AND town = $2',
      [province, town]
    )
    const suggestions = rows.map((row) => row.crop_name)
    return NextResponse.json({ crops: suggestions })
  } catch (error) {
    console.error('Error fetching crop suggestions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
