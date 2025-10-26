import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT id, name, slug, description, image_url, category
      FROM crops
      ORDER BY name;
    `
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching crops:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
