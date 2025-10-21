import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg'

// Database connection pool
let pool: Pool | null = null
let poolInitializing = false
let poolInitPromise: Promise<Pool> | null = null

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
 * Initialize database connection pool
 */
function initializePool(): Pool {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

  if (!connectionString) {
    throw new Error(
      'Database connection string not configured. Set DATABASE_URL or POSTGRES_URL environment variable.'
    )
  }

  // Determine SSL configuration
  let sslConfig: boolean | { rejectUnauthorized: boolean } = false

  // Only use SSL in production and not during build phase
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PHASE !== 'phase-production-build'
  ) {
    // Check if the connection string explicitly disables SSL
    if (!connectionString.includes('sslmode=disable')) {
      sslConfig = { rejectUnauthorized: false }
    }
  }

  const newPool = new Pool({
    connectionString,
    ssl: sslConfig,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })

  // Handle pool errors
  newPool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err)
  })

  console.log('Database pool created')
  return newPool
}

/**
 * Get or create database connection pool
 */
export function getPool(): Pool {
  // If pool exists, return it immediately
  if (pool) {
    return pool
  }

  // If pool is being initialized, wait for it by using the async version
  // This prevents race conditions while maintaining backward compatibility
  if (poolInitializing) {
    throw new Error('Database pool is being initialized. Please use getPoolAsync() or retry.')
  }

  // Set flag to prevent concurrent initialization
  poolInitializing = true

  // Create promise for async callers
  poolInitPromise = new Promise<Pool>((resolve, reject) => {
    try {
      pool = initializePool()
      poolInitializing = false
      resolve(pool)
    } catch (error) {
      poolInitializing = false
      poolInitPromise = null
      reject(error)
    }
  })

  return pool!
}

/**
 * Get or create database connection pool (async version)
 * This is the preferred method for async contexts
 */
export async function getPoolAsync(): Promise<Pool> {
  // If pool exists, return it immediately
  if (pool) {
    return pool
  }

  // If pool is being initialized, wait for it
  if (poolInitializing && poolInitPromise) {
    return await poolInitPromise
  }

  // If pool is being initialized but promise doesn't exist, create it
  if (poolInitializing) {
    poolInitPromise = Promise.resolve(getPool())
    return await poolInitPromise
  }

  // Set flag to prevent concurrent initialization
  poolInitializing = true

  // Create promise for concurrent requests
  poolInitPromise = new Promise<Pool>((resolve, reject) => {
    try {
      pool = initializePool()
      resolve(pool)
    } catch (error) {
      reject(error)
    } finally {
      poolInitializing = false
      poolInitPromise = null
    }
  })

  return await poolInitPromise
}

/**
 * Check if error is transient and should be retried
 */
function isTransientError(error: any): boolean {
  if (!error) return false

  const message = error.message || ''
  const code = error.code || ''

  // Connection errors
  if (code === 'ECONNREFUSED' || code === 'ECONNRESET' || code === 'ETIMEDOUT') {
    return true
  }

  // PostgreSQL transient errors
  const transientCodes = [
    '40001', // serialization_failure
    '40P01', // deadlock_detected
    '08003', // connection_does_not_exist
    '08006', // connection_failure
    '08001', // sqlclient_unable_to_establish_sqlconnection
    '57P03', // cannot_connect_now
  ]

  return transientCodes.includes(code) || message.includes('Connection terminated')
}

/**
 * Query the database with optional timeout and retry logic
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[],
  timeoutMs: number = 30000, // Default 30 second timeout
  maxRetries: number = 3
): Promise<QueryResult<T>> {
  const pool = getPool()
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
        console.log('Executed query', { text, duration, rows: result.rowCount, attempt })
      }

      return result
    } catch (error) {
      lastError = error

      // Only retry on transient errors and if we have retries left
      if (attempt < maxRetries && isTransientError(error)) {
        const delay = Math.min(100 * Math.pow(2, attempt - 1), 1000) // Exponential backoff, max 1s
        console.warn(
          `Query failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms:`,
          error
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      console.error('Database query error:', error)
      throw error
    }
  }

  throw lastError
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool()
  return await pool.connect()
}

/**
 * Execute a function within a database transaction
 * Automatically handles commit/rollback
 */
export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getClient()

  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Reset pool metrics (useful for testing or when pool is recreated)
 */
export function resetPoolMetrics(): void {
  poolMetrics = {
    totalConnections: 0,
    idleConnections: 0,
    waitingRequests: 0,
    queriesExecuted: 0,
    lastQueryTime: 0,
  }
}

/**
 * Close the database pool (for cleanup)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
    poolInitializing = false
    poolInitPromise = null
    resetPoolMetrics()
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
