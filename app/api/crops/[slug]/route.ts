import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const { slug } = params
    const { rows } = await sql`
      SELECT *
      FROM crops
      WHERE slug = ${slug};
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Crop not found' }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('Error fetching crop:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
