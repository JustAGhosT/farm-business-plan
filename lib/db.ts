import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg'

// Database connection pool
let pool: Pool | null = null
let poolInitializing = false

// Pool metrics for monitoring
interface PoolMetrics {
  totalConnections: number
  idleConnections: number
  waitingRequests: number
  queriesExecuted: number
  lastQueryTime: number
}

let poolMetrics: PoolMetrics = {
  totalConnections: 0,
  idleConnections: 0,
  waitingRequests: 0,
  queriesExecuted: 0,
  lastQueryTime: 0,
}

/**
 * Get current pool metrics
 */
export function getPoolMetrics(): PoolMetrics {
  if (pool) {
    return {
      ...poolMetrics,
      totalConnections: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingRequests: pool.waitingCount,
    }
  }
  return poolMetrics
}

/**
 * Log pool metrics periodically (call this in development/monitoring)
 */
export function logPoolMetrics(): void {
  const metrics = getPoolMetrics()
  console.log('Database Pool Metrics:', {
    totalConnections: metrics.totalConnections,
    idleConnections: metrics.idleConnections,
    waitingRequests: metrics.waitingRequests,
    queriesExecuted: metrics.queriesExecuted,
    lastQueryTime: metrics.lastQueryTime ? new Date(metrics.lastQueryTime).toISOString() : 'N/A',
  })
}

/**
 * Get or create database connection pool
 */
export function getPool(): Pool {
  // If pool exists, return it immediately
  if (pool) {
    return pool
  }

  // If pool is being initialized, wait for it
  if (poolInitializing) {
    // Simple spinlock - in production, consider using a promise-based approach
    while (poolInitializing) {
      // Wait for initialization to complete
    }
    if (pool) {
      return pool
    }
  }

  // Set flag to prevent concurrent initialization
  poolInitializing = true

  try {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!connectionString) {
      throw new Error(
        'Database connection string not configured. Set DATABASE_URL or POSTGRES_URL environment variable.'
      )
    }

    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle database client', err)
    })

    console.log('Database pool created')
  } finally {
    poolInitializing = false
  }

  return pool!
}

/**
 * Query the database with optional timeout
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[],
  timeoutMs: number = 30000 // Default 30 second timeout
): Promise<QueryResult<T>> {
  const pool = getPool()
  const start = Date.now()

  try {
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Query timeout after ${timeoutMs}ms`))
      }, timeoutMs)
    })

    // Race the query against the timeout
    const result = (await Promise.race([
      pool.query<T>(text, params),
      timeoutPromise,
    ])) as QueryResult<T>

    const duration = Date.now() - start

    // Update metrics
    poolMetrics.queriesExecuted++
    poolMetrics.lastQueryTime = Date.now()

    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: result.rowCount })
    }

    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool()
  return await pool.connect()
}

/**
 * Close the database pool (for cleanup)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
    console.log('Database pool closed')
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as now')
    console.log('Database connection successful:', result.rows[0].now)
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}
