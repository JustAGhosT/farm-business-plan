/**
 * Simple in-memory rate limiting implementation
 * For production, consider using Redis or a distributed solution
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry>
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    this.requests = new Map()

    // Cleanup expired entries every minute
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanup()
      }, 60000)
    }
  }

  /**
   * Check if request is allowed and update counter
   * Returns true if allowed, false if rate limit exceeded
   */
  checkLimit(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.requests.get(identifier)

    // If no entry or entry expired, create new one
    if (!entry || now >= entry.resetTime) {
      const resetTime = now + windowMs
      this.requests.set(identifier, {
        count: 1,
        resetTime,
      })
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime,
      }
    }

    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      }
    }

    // Increment counter
    entry.count++
    this.requests.set(identifier, entry)

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
    }
  }

  /**
   * Remove expired entries
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.requests.entries()) {
      if (now >= entry.resetTime) {
        this.requests.delete(key)
      }
    }
  }

  /**
   * Reset all rate limits
   */
  reset(): void {
    this.requests.clear()
  }

  /**
   * Get current request count for identifier
   */
  getCount(identifier: string): number {
    const entry = this.requests.get(identifier)
    if (!entry || Date.now() >= entry.resetTime) {
      return 0
    }
    return entry.count
  }

  /**
   * Cleanup interval on destroy
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter()

/**
 * Rate limit configuration presets
 */
export const RATE_LIMITS = {
  // Strict limit for authentication endpoints
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // Standard limit for API endpoints
  api: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // Relaxed limit for read-only endpoints
  read: {
    maxRequests: 300,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // Stricter limit for write operations
  write: {
    maxRequests: 50,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
} as const

/**
 * Get identifier for rate limiting (IP address or user ID)
 */
export function getRateLimitIdentifier(request: Request, userId?: string): string {
  // Prefer user ID if available
  if (userId) {
    return `user:${userId}`
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return `ip:${ip}`
}

/**
 * Apply rate limiting to request
 */
export function applyRateLimit(
  request: Request,
  config: { maxRequests: number; windowMs: number },
  userId?: string
): { allowed: boolean; headers: Record<string, string> } {
  const identifier = getRateLimitIdentifier(request, userId)
  const result = rateLimiter.checkLimit(identifier, config.maxRequests, config.windowMs)

  const headers = {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  }

  return {
    allowed: result.allowed,
    headers,
  }
}
