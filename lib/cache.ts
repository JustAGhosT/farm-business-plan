/**
 * Simple in-memory cache for query results
 * Useful for frequently accessed, rarely changing data
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class QueryCache {
  private cache: Map<string, CacheEntry<any>>
  private maxSize: number

  constructor(maxSize: number = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  /**
   * Get cached value if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }
    
    // Check if entry has expired
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  /**
   * Set a value in the cache with TTL (time to live in milliseconds)
   */
  set<T>(key: string, data: T, ttl: number = 60000): void {
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Remove a specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Remove expired entries
   */
  cleanup(): number {
    const now = Date.now()
    let removed = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        removed++
      }
    }
    
    return removed
  }
}

// Export singleton instance
export const queryCache = new QueryCache(100)

/**
 * Higher-order function to wrap database queries with caching
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60000 // Default 1 minute TTL
): Promise<T> {
  // Try to get from cache first
  const cached = queryCache.get<T>(key)
  if (cached !== null) {
    return cached
  }
  
  // If not in cache, fetch and store
  const data = await fetcher()
  queryCache.set(key, data, ttl)
  
  return data
}

/**
 * Invalidate cache entries by pattern
 */
export function invalidateCachePattern(pattern: string): number {
  let removed = 0
  const regex = new RegExp(pattern)
  
  for (const key of queryCache['cache'].keys()) {
    if (regex.test(key)) {
      queryCache.delete(key)
      removed++
    }
  }
  
  return removed
}

// Run cleanup periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const removed = queryCache.cleanup()
    if (removed > 0) {
      console.log(`Cache cleanup: removed ${removed} expired entries`)
    }
  }, 5 * 60 * 1000)
}
