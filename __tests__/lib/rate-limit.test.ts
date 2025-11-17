/**
 * Tests for rate limiting functionality
 */
import {
  rateLimiter,
  RATE_LIMITS,
  getRateLimitIdentifier,
  applyRateLimit,
  isRateLimitingDisabled,
} from '@/lib/rate-limit'

describe('Rate Limiter', () => {
  // Store original env value
  const originalEnv = process.env.DISABLE_RATE_LIMITING

  beforeEach(() => {
    // Reset rate limiter before each test
    rateLimiter.reset()
    // Reset environment variable
    delete process.env.DISABLE_RATE_LIMITING
  })

  afterAll(() => {
    // Restore original env value
    if (originalEnv !== undefined) {
      process.env.DISABLE_RATE_LIMITING = originalEnv
    } else {
      delete process.env.DISABLE_RATE_LIMITING
    }
  })

  describe('isRateLimitingDisabled', () => {
    it('should return false when env var is not set', () => {
      expect(isRateLimitingDisabled()).toBe(false)
    })

    it('should return false when env var is set to false', () => {
      process.env.DISABLE_RATE_LIMITING = 'false'
      expect(isRateLimitingDisabled()).toBe(false)
    })

    it('should return true when env var is set to true', () => {
      process.env.DISABLE_RATE_LIMITING = 'true'
      expect(isRateLimitingDisabled()).toBe(true)
    })
  })

  describe('RateLimiter.checkLimit', () => {
    it('should allow requests within limit', () => {
      const result1 = rateLimiter.checkLimit('test-id', 5, 60000)
      expect(result1.allowed).toBe(true)
      expect(result1.remaining).toBe(4)

      const result2 = rateLimiter.checkLimit('test-id', 5, 60000)
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBe(3)
    })

    it('should block requests exceeding limit', () => {
      // Make 5 requests (the limit)
      for (let i = 0; i < 5; i++) {
        const result = rateLimiter.checkLimit('test-id', 5, 60000)
        expect(result.allowed).toBe(true)
      }

      // 6th request should be blocked
      const result = rateLimiter.checkLimit('test-id', 5, 60000)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset after window expires', async () => {
      // Make requests up to the limit
      for (let i = 0; i < 3; i++) {
        rateLimiter.checkLimit('test-id', 3, 100)
      }

      // Exceed limit
      const blocked = rateLimiter.checkLimit('test-id', 3, 100)
      expect(blocked.allowed).toBe(false)

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150))

      // Should be allowed again
      const result = rateLimiter.checkLimit('test-id', 3, 100)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2)
    })

    it('should track different identifiers separately', () => {
      rateLimiter.checkLimit('user1', 2, 60000)
      rateLimiter.checkLimit('user1', 2, 60000)

      // user1 should be at limit
      const result1 = rateLimiter.checkLimit('user1', 2, 60000)
      expect(result1.allowed).toBe(false)

      // user2 should still be allowed
      const result2 = rateLimiter.checkLimit('user2', 2, 60000)
      expect(result2.allowed).toBe(true)
    })
  })

  describe('RATE_LIMITS configuration', () => {
    it('should have reasonable auth limits', () => {
      // Auth should allow at least 30 requests per 15 minutes
      // to accommodate NextAuth flows (signin, callback, session, etc.)
      expect(RATE_LIMITS.auth.maxRequests).toBeGreaterThanOrEqual(30)
      expect(RATE_LIMITS.auth.windowMs).toBe(15 * 60 * 1000)
    })

    it('should have standard API limits', () => {
      expect(RATE_LIMITS.api.maxRequests).toBe(100)
      expect(RATE_LIMITS.api.windowMs).toBe(15 * 60 * 1000)
    })

    it('should have relaxed read limits', () => {
      expect(RATE_LIMITS.read.maxRequests).toBe(300)
      expect(RATE_LIMITS.read.windowMs).toBe(15 * 60 * 1000)
    })

    it('should have stricter write limits', () => {
      expect(RATE_LIMITS.write.maxRequests).toBe(50)
      expect(RATE_LIMITS.write.windowMs).toBe(15 * 60 * 1000)
    })
  })

  describe('getRateLimitIdentifier', () => {
    it('should prefer user ID over IP', () => {
      const mockRequest = new Request('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      })
      const identifier = getRateLimitIdentifier(mockRequest, 'user123')
      expect(identifier).toBe('user:user123')
    })

    it('should use IP when user ID not available', () => {
      const mockRequest = new Request('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      })
      const identifier = getRateLimitIdentifier(mockRequest)
      expect(identifier).toBe('ip:192.168.1.1')
    })

    it('should extract IP from x-forwarded-for header', () => {
      const mockRequest = new Request('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
      })
      const identifier = getRateLimitIdentifier(mockRequest)
      expect(identifier).toBe('ip:192.168.1.1')
    })

    it('should extract IP from x-real-ip header', () => {
      const mockRequest = new Request('http://localhost:3000/api/test', {
        headers: { 'x-real-ip': '192.168.1.1' },
      })
      const identifier = getRateLimitIdentifier(mockRequest)
      expect(identifier).toBe('ip:192.168.1.1')
    })

    it('should handle missing IP gracefully', () => {
      const mockRequest = new Request('http://localhost:3000/api/test')
      const identifier = getRateLimitIdentifier(mockRequest)
      expect(identifier).toBe('ip:unknown')
    })
  })

  describe('applyRateLimit', () => {
    it('should return allowed status and headers', () => {
      const mockRequest = new Request('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      })
      const config = { maxRequests: 10, windowMs: 60000 }

      const result = applyRateLimit(mockRequest, config)

      expect(result.allowed).toBe(true)
      expect(result.headers['X-RateLimit-Limit']).toBe('10')
      expect(result.headers['X-RateLimit-Remaining']).toBe('9')
      expect(result.headers['X-RateLimit-Reset']).toBeDefined()
    })

    it('should use scope key when provided', () => {
      const mockRequest = new Request('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      })
      const config = { maxRequests: 2, windowMs: 60000 }

      // Different scope keys should have separate limits
      applyRateLimit(mockRequest, config, undefined, 'scope1')
      applyRateLimit(mockRequest, config, undefined, 'scope1')

      // scope1 should be at limit
      const result1 = applyRateLimit(mockRequest, config, undefined, 'scope1')
      expect(result1.allowed).toBe(false)

      // scope2 should still be allowed
      const result2 = applyRateLimit(mockRequest, config, undefined, 'scope2')
      expect(result2.allowed).toBe(true)
    })

    it('should block when limit exceeded', () => {
      const mockRequest = new Request('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      })
      const config = { maxRequests: 2, windowMs: 60000 }

      applyRateLimit(mockRequest, config)
      applyRateLimit(mockRequest, config)

      const result = applyRateLimit(mockRequest, config)
      expect(result.allowed).toBe(false)
      expect(result.headers['X-RateLimit-Remaining']).toBe('0')
    })

    it('should always allow requests when rate limiting is disabled', () => {
      process.env.DISABLE_RATE_LIMITING = 'true'

      const mockRequest = new Request('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      })
      const config = { maxRequests: 2, windowMs: 60000 }

      // Make many requests - should all be allowed
      for (let i = 0; i < 10; i++) {
        const result = applyRateLimit(mockRequest, config)
        expect(result.allowed).toBe(true)
        expect(result.headers['X-RateLimit-Disabled']).toBe('true')
        expect(result.headers['X-RateLimit-Remaining']).toBe('2')
      }
    })
  })

  describe('RateLimiter.cleanup', () => {
    it('should remove expired entries', async () => {
      // Add entries with short TTL
      rateLimiter.checkLimit('test1', 10, 100)
      rateLimiter.checkLimit('test2', 10, 100)

      expect(rateLimiter.getCount('test1')).toBe(1)
      expect(rateLimiter.getCount('test2')).toBe(1)

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150))

      // Cleanup
      rateLimiter.cleanup()

      // Counts should be reset
      expect(rateLimiter.getCount('test1')).toBe(0)
      expect(rateLimiter.getCount('test2')).toBe(0)
    })
  })
})
