/**
 * Tests for environment variable validation script
 */

const { isValidValue, isCI } = require('../../scripts/validate-env')

describe('Environment Validation Script', () => {
  describe('isValidValue', () => {
    it('should return false for empty values', () => {
      expect(isValidValue('')).toBe(false)
      expect(isValidValue(null)).toBe(false)
      expect(isValidValue(undefined)).toBe(false)
      expect(isValidValue('   ')).toBe(false)
    })

    it('should return false for placeholder values', () => {
      expect(isValidValue('your-secret-key')).toBe(false)
      expect(isValidValue('dummy-value')).toBe(false)
      expect(isValidValue('test_password')).toBe(false)
      expect(isValidValue('example-url')).toBe(false)
      expect(isValidValue('placeholder')).toBe(false)
      expect(isValidValue('changeme')).toBe(false)
    })

    it('should return true for valid values', () => {
      expect(isValidValue('actual-secret-key-123')).toBe(true)
      expect(isValidValue('postgresql://user:pass@host:5432/db')).toBe(true)
      expect(isValidValue('production-secret')).toBe(true)
      expect(isValidValue('real-client-id-abc123')).toBe(true)
    })

    it('should handle edge cases', () => {
      expect(isValidValue('YOUR-SECRET')).toBe(false) // uppercase placeholder
      expect(isValidValue('a')).toBe(true) // single character
      expect(isValidValue('123')).toBe(true) // numbers only
    })
  })

  describe('isCI', () => {
    const originalEnv = process.env

    beforeEach(() => {
      process.env = { ...originalEnv }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should detect GitHub Actions', () => {
      process.env.GITHUB_ACTIONS = 'true'
      expect(isCI()).toBe(true)
    })

    it('should detect CI flag', () => {
      process.env.CI = 'true'
      expect(isCI()).toBe(true)
    })

    it('should return false in local environment', () => {
      delete process.env.CI
      delete process.env.GITHUB_ACTIONS
      delete process.env.GITLAB_CI
      delete process.env.CIRCLECI
      delete process.env.TRAVIS
      delete process.env.JENKINS_HOME
      expect(isCI()).toBe(false)
    })
  })
})
