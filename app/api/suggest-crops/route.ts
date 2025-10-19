import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

interface CropRow {
  crop_name: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const province = searchParams.get('province')
  const town = searchParams.get('town')

  if (!province || !town) {
    return NextResponse.json({ error: 'Province and town are required' }, { status: 400 })
  }

  try {
    const { rows } = await query<CropRow>(
      'SELECT crop_name FROM crop_suggestions WHERE province = $1 AND town = $2',
      [province, town]
    )
    const suggestions = rows.map((row: CropRow) => row.crop_name)
    return NextResponse.json({ crops: suggestions })
  } catch (error) {
    console.error('Error fetching crop suggestions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
