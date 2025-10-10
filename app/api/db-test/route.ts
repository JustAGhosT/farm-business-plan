import { NextResponse } from 'next/server'
import { Pool } from 'pg'

// Force this route to be dynamic (not pre-rendered during build)
// This prevents database connection attempts during the build process
export const dynamic = 'force-dynamic'

// Example API route demonstrating database connectivity
// This uses connection pooling which is recommended for serverless environments

// Create a connection pool
// In production (Netlify), use DATABASE_URL_POOLER for better performance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL_POOLER || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
})

export async function GET() {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW() as current_time, version() as version')

    return NextResponse.json({
      success: true,
      message: 'Database connected successfully',
      timestamp: result.rows[0].current_time,
      version: result.rows[0].version,
    })
  } catch (error) {
    console.error('Database connection error:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Note: Connection pool cleanup is handled automatically by the serverless environment
// For long-running Node.js servers, you would need to handle pool.end() manually
