/**
 * Tests for cache utility functions
 */
import { queryCache, withCache, invalidateCachePattern } from '@/lib/cache'

describe('Cache Functions', () => {
  beforeEach(() => {
    // Clear cache before each test
    queryCache.clear()
  })

  describe('QueryCache', () => {
    it('should set and get values', () => {
      queryCache.set('key1', 'value1', 10000)
      expect(queryCache.get('key1')).toBe('value1')
    })

    it('should return null for non-existent keys', () => {
      expect(queryCache.get('nonexistent')).toBeNull()
    })

    it('should handle expired entries', async () => {
      queryCache.set('key1', 'value1', 100) // 100ms TTL
      expect(queryCache.get('key1')).toBe('value1')
      
      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150))
      expect(queryCache.get('key1')).toBeNull()
    })

    it('should delete specific keys', () => {
      queryCache.set('key1', 'value1', 10000)
      queryCache.set('key2', 'value2', 10000)
      
      expect(queryCache.delete('key1')).toBe(true)
      expect(queryCache.get('key1')).toBeNull()
      expect(queryCache.get('key2')).toBe('value2')
    })

    it('should clear all entries', () => {
      queryCache.set('key1', 'value1', 10000)
      queryCache.set('key2', 'value2', 10000)
      
      queryCache.clear()
      expect(queryCache.get('key1')).toBeNull()
      expect(queryCache.get('key2')).toBeNull()
    })

    it('should return cache size', () => {
      queryCache.set('key1', 'value1', 10000)
      queryCache.set('key2', 'value2', 10000)
      expect(queryCache.size()).toBe(2)
    })

    it('should cleanup expired entries', async () => {
      queryCache.set('key1', 'value1', 100) // Will expire
      queryCache.set('key2', 'value2', 10000) // Won't expire
      
      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150))
      
      const removed = queryCache.cleanup()
      expect(removed).toBe(1)
      expect(queryCache.get('key1')).toBeNull()
      expect(queryCache.get('key2')).toBe('value2')
    })

    it('should handle max size limit', () => {
      // Create a small cache
      const smallCache = new (queryCache.constructor as any)(3)
      
      smallCache.set('key1', 'value1', 10000)
      smallCache.set('key2', 'value2', 10000)
      smallCache.set('key3', 'value3', 10000)
      smallCache.set('key4', 'value4', 10000) // Should remove oldest
      
      expect(smallCache.size()).toBeLessThanOrEqual(3)
    })

    it('should provide keys iterator', () => {
      queryCache.set('key1', 'value1', 10000)
      queryCache.set('key2', 'value2', 10000)
      
      const keys = Array.from(queryCache.keys())
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys.length).toBe(2)
    })
  })

  describe('withCache', () => {
    it('should cache function results', async () => {
      let callCount = 0
      const fetcher = async () => {
        callCount++
        return 'result'
      }

      const result1 = await withCache('test-key', fetcher, 10000)
      const result2 = await withCache('test-key', fetcher, 10000)

      expect(result1).toBe('result')
      expect(result2).toBe('result')
      expect(callCount).toBe(1) // Fetcher should only be called once
    })

    it('should call fetcher again after expiration', async () => {
      let callCount = 0
      const fetcher = async () => {
        callCount++
        return 'result'
      }

      await withCache('test-key', fetcher, 100)
      
      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150))
      
      await withCache('test-key', fetcher, 100)

      expect(callCount).toBe(2) // Fetcher should be called twice
    })

    it('should handle different keys separately', async () => {
      const fetcher1 = async () => 'result1'
      const fetcher2 = async () => 'result2'

      const result1 = await withCache('key1', fetcher1, 10000)
      const result2 = await withCache('key2', fetcher2, 10000)

      expect(result1).toBe('result1')
      expect(result2).toBe('result2')
    })
  })

  describe('invalidateCachePattern', () => {
    it('should invalidate matching keys', () => {
      queryCache.set('user:1', 'data1', 10000)
      queryCache.set('user:2', 'data2', 10000)
      queryCache.set('post:1', 'data3', 10000)

      const removed = invalidateCachePattern('user:')
      
      expect(removed).toBe(2)
      expect(queryCache.get('user:1')).toBeNull()
      expect(queryCache.get('user:2')).toBeNull()
      expect(queryCache.get('post:1')).toBe('data3')
    })

    it('should handle regex patterns', () => {
      queryCache.set('user-1', 'data1', 10000)
      queryCache.set('user-2', 'data2', 10000)
      queryCache.set('admin-1', 'data3', 10000)

      const removed = invalidateCachePattern('^user-')
      
      expect(removed).toBe(2)
      expect(queryCache.get('user-1')).toBeNull()
      expect(queryCache.get('user-2')).toBeNull()
      expect(queryCache.get('admin-1')).toBe('data3')
    })

    it('should return 0 when no matches', () => {
      queryCache.set('key1', 'data1', 10000)
      
      const removed = invalidateCachePattern('nonexistent')
      expect(removed).toBe(0)
    })

    it('should use public keys() method instead of private cache access', () => {
      queryCache.set('test1', 'data1', 10000)
      queryCache.set('test2', 'data2', 10000)

      // This should not throw an error
      expect(() => invalidateCachePattern('test')).not.toThrow()
    })
  })
})
