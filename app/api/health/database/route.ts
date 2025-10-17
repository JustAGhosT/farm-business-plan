import { NextResponse } from 'next/server'
import { getPoolMetrics, testConnection } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/health/database
 * Check database health and return connection pool metrics
 */
export async function GET() {
  try {
    const startTime = Date.now()
    
    // Test database connection
    const isConnected = await testConnection()
    const responseTime = Date.now() - startTime
    
    // Get pool metrics
    const metrics = getPoolMetrics()
    
    // Determine overall health status
    const status = isConnected ? 'healthy' : 'unhealthy'
    const poolUtilization = metrics.totalConnections > 0 
      ? (metrics.totalConnections - metrics.idleConnections) / metrics.totalConnections 
      : 0
    
    // Warnings based on metrics
    const warnings: string[] = []
    
    if (poolUtilization > 0.8) {
      warnings.push('High pool utilization (>80%)')
    }
    
    if (metrics.waitingRequests > 5) {
      warnings.push(`${metrics.waitingRequests} requests waiting for connection`)
    }
    
    if (responseTime > 1000) {
      warnings.push(`Slow database response time: ${responseTime}ms`)
    }
    
    return NextResponse.json({
      success: true,
      data: {
        status,
        timestamp: new Date().toISOString(),
        connection: {
          isConnected,
          responseTimeMs: responseTime,
        },
        pool: {
          totalConnections: metrics.totalConnections,
          idleConnections: metrics.idleConnections,
          activeConnections: metrics.totalConnections - metrics.idleConnections,
          waitingRequests: metrics.waitingRequests,
          utilizationPercentage: Math.round(poolUtilization * 100),
        },
        queries: {
          totalExecuted: metrics.queriesExecuted,
          lastQueryTime: metrics.lastQueryTime 
            ? new Date(metrics.lastQueryTime).toISOString() 
            : null,
        },
        warnings: warnings.length > 0 ? warnings : undefined,
      },
    })
  } catch (error) {
    console.error('Database health check failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Database health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 503 }
    )
  }
}
