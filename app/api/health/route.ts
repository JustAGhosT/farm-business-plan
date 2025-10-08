import { NextResponse } from 'next/server'

// Force this route to be dynamic (not pre-rendered during build)
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Farm Business Plan API is running'
  })
}
