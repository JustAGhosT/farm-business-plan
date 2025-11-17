/**
 * Tests for database utility functions
 */

// Set environment variable before importing the module
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb'

// Mock the pg module before any imports
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    connect: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      release: jest.fn(),
    }),
    end: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    totalCount: 0,
    idleCount: 0,
    waitingCount: 0,
  }

  return {
    Pool: jest.fn(() => mockPool),
  }
})

import { getPool, getPoolAsync, closePool, resetPoolMetrics, getPoolMetrics } from '@/lib/db'

describe('Database Functions', () => {
  beforeEach(() => {
    // Set required environment variable
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb'
  })

  afterEach(async () => {
    // Clean up
    try {
      await closePool()
    } catch (error) {
      // Ignore cleanup errors
    }
  })

  describe('getPool', () => {
    it('should create and return a pool', () => {
      const pool = getPool()
      expect(pool).toBeDefined()
      expect(pool).toHaveProperty('query')
    })

    it('should return the same pool on subsequent calls', () => {
      const pool1 = getPool()
      const pool2 = getPool()
      expect(pool1).toBe(pool2)
    })
  })

  describe('getPoolAsync', () => {
    it('should create and return a pool asynchronously', async () => {
      const pool = await getPoolAsync()
      expect(pool).toBeDefined()
      expect(pool).toHaveProperty('query')
    })

    it('should return the same pool on subsequent calls', async () => {
      const pool1 = await getPoolAsync()
      const pool2 = await getPoolAsync()
      expect(pool1).toBe(pool2)
    })

    it('should handle concurrent initialization', async () => {
      // Reset to force new initialization
      await closePool()

      // Make multiple concurrent calls
      const promises = [getPoolAsync(), getPoolAsync(), getPoolAsync()]

      const pools = await Promise.all(promises)

      // All should return the same pool instance
      expect(pools[0]).toBe(pools[1])
      expect(pools[1]).toBe(pools[2])
    })
  })

  describe('getPoolMetrics', () => {
    it('should return pool metrics', () => {
      getPool() // Initialize pool
      const metrics = getPoolMetrics()

      expect(metrics).toHaveProperty('totalConnections')
      expect(metrics).toHaveProperty('idleConnections')
      expect(metrics).toHaveProperty('waitingRequests')
      expect(metrics).toHaveProperty('queriesExecuted')
      expect(metrics).toHaveProperty('lastQueryTime')
    })

    it('should return metrics when pool does not exist', () => {
      const metrics = getPoolMetrics()
      expect(metrics).toBeDefined()
      expect(metrics.totalConnections).toBeDefined()
    })
  })

  describe('resetPoolMetrics', () => {
    it('should reset metrics to initial state', () => {
      resetPoolMetrics()
      const metrics = getPoolMetrics()

      expect(metrics.queriesExecuted).toBe(0)
      expect(metrics.lastQueryTime).toBe(0)
    })
  })

  describe('closePool', () => {
    it('should close the pool', async () => {
      getPool() // Initialize pool
      await closePool()

      // Getting pool again should create a new one
      const newPool = getPool()
      expect(newPool).toBeDefined()
    })

    it('should handle closing when pool does not exist', async () => {
      await expect(closePool()).resolves.not.toThrow()
    })

    it('should reset metrics on close', async () => {
      getPool()
      await closePool()

      const metrics = getPoolMetrics()
      expect(metrics.queriesExecuted).toBe(0)
    })
  })
})
