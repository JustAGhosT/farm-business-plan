/**
 * Tests for utility functions
 */
import {
  formatCurrency,
  parseCurrency,
  formatPercentage,
  formatDate,
  daysBetween,
  clamp,
  generateId,
  deepClone,
  isEmpty,
} from '@/lib/utils'

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency in ZAR', () => {
      expect(formatCurrency(1000)).toMatch(/R/)
      expect(formatCurrency(1000)).toMatch(/1/)
    })

    it('should handle decimal places', () => {
      const result = formatCurrency(1234.56, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      expect(result).toContain('1')
      expect(result).toContain('234')
    })

    it('should handle zero', () => {
      expect(formatCurrency(0)).toMatch(/R/)
    })

    it('should handle negative numbers', () => {
      const result = formatCurrency(-500)
      expect(result).toContain('5')
    })
  })

  describe('parseCurrency', () => {
    it('should parse basic currency string', () => {
      expect(parseCurrency('R 1000')).toBe(1000)
    })

    it('should handle comma separators', () => {
      expect(parseCurrency('R 1,000.50')).toBe(1000.50)
    })

    it('should handle multiple currency symbols', () => {
      expect(parseCurrency('$100')).toBe(100)
      expect(parseCurrency('€200')).toBe(200)
      expect(parseCurrency('£300')).toBe(300)
      expect(parseCurrency('¥400')).toBe(400)
    })

    it('should handle ZAR text', () => {
      expect(parseCurrency('ZAR 1000')).toBe(1000)
      expect(parseCurrency('zar 500')).toBe(500)
    })

    it('should handle invalid input', () => {
      expect(parseCurrency('')).toBe(0)
      expect(parseCurrency('invalid')).toBe(0)
      expect(parseCurrency('abc123')).toBe(0)
    })

    it('should handle null/undefined input', () => {
      expect(parseCurrency(null as any)).toBe(0)
      expect(parseCurrency(undefined as any)).toBe(0)
    })

    it('should handle negative numbers', () => {
      expect(parseCurrency('R -500')).toBe(-500)
      expect(parseCurrency('-1,234.56')).toBe(-1234.56)
    })

    it('should handle decimal numbers', () => {
      expect(parseCurrency('123.45')).toBe(123.45)
      expect(parseCurrency('R 1,234.56')).toBe(1234.56)
    })
  })

  describe('formatPercentage', () => {
    it('should format percentage with default decimals', () => {
      expect(formatPercentage(50)).toBe('50.0%')
    })

    it('should format percentage with custom decimals', () => {
      expect(formatPercentage(33.333, 2)).toBe('33.33%')
      expect(formatPercentage(50, 0)).toBe('50%')
    })
  })

  describe('formatDate', () => {
    it('should format valid date object', () => {
      const date = new Date('2023-10-15')
      const result = formatDate(date)
      expect(result).toContain('Oct')
      expect(result).toContain('2023')
    })

    it('should format valid date string', () => {
      const result = formatDate('2023-10-15')
      expect(result).toContain('Oct')
      expect(result).toContain('2023')
    })

    it('should handle invalid date string', () => {
      const result = formatDate('invalid-date')
      expect(result).toBe('Invalid Date')
    })

    it('should handle invalid date object', () => {
      const result = formatDate(new Date('invalid'))
      expect(result).toBe('Invalid Date')
    })

    it('should handle empty string', () => {
      const result = formatDate('')
      expect(result).toBe('Invalid Date')
    })
  })

  describe('daysBetween', () => {
    it('should calculate days between two dates', () => {
      const date1 = new Date('2023-10-01')
      const date2 = new Date('2023-10-15')
      expect(daysBetween(date1, date2)).toBe(14)
    })

    it('should handle date strings', () => {
      expect(daysBetween('2023-10-01', '2023-10-15')).toBe(14)
    })

    it('should return absolute difference', () => {
      expect(daysBetween('2023-10-15', '2023-10-01')).toBe(14)
    })

    it('should handle same date', () => {
      const date = new Date('2023-10-15')
      expect(daysBetween(date, date)).toBe(0)
    })

    it('should handle invalid first date', () => {
      const result = daysBetween('invalid', '2023-10-15')
      expect(result).toBe(0)
    })

    it('should handle invalid second date', () => {
      const result = daysBetween('2023-10-15', 'invalid')
      expect(result).toBe(0)
    })

    it('should handle both invalid dates', () => {
      const result = daysBetween('invalid1', 'invalid2')
      expect(result).toBe(0)
    })
  })

  describe('clamp', () => {
    it('should clamp value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
    })

    it('should clamp value to minimum', () => {
      expect(clamp(-5, 0, 10)).toBe(0)
    })

    it('should clamp value to maximum', () => {
      expect(clamp(15, 0, 10)).toBe(10)
    })

    it('should handle equal min and max', () => {
      expect(clamp(5, 10, 10)).toBe(10)
    })
  })

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })

    it('should generate string IDs', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })

    it('should contain timestamp', () => {
      const id = generateId()
      expect(id).toContain('_')
    })
  })

  describe('deepClone', () => {
    it('should deep clone object', () => {
      const obj = { a: 1, b: { c: 2 } }
      const cloned = deepClone(obj)
      expect(cloned).toEqual(obj)
      expect(cloned).not.toBe(obj)
      expect(cloned.b).not.toBe(obj.b)
    })

    it('should deep clone array', () => {
      const arr = [1, 2, { a: 3 }]
      const cloned = deepClone(arr)
      expect(cloned).toEqual(arr)
      expect(cloned).not.toBe(arr)
    })

    it('should handle null', () => {
      expect(deepClone(null)).toBe(null)
    })

    it('should handle primitives', () => {
      expect(deepClone(42)).toBe(42)
      expect(deepClone('test')).toBe('test')
      expect(deepClone(true)).toBe(true)
    })
  })

  describe('isEmpty', () => {
    it('should detect null and undefined', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
    })

    it('should detect empty string', () => {
      expect(isEmpty('')).toBe(true)
      expect(isEmpty('   ')).toBe(true)
    })

    it('should detect non-empty string', () => {
      expect(isEmpty('test')).toBe(false)
      expect(isEmpty('  a  ')).toBe(false)
    })

    it('should detect empty array', () => {
      expect(isEmpty([])).toBe(true)
    })

    it('should detect non-empty array', () => {
      expect(isEmpty([1])).toBe(false)
      expect(isEmpty([1, 2, 3])).toBe(false)
    })

    it('should detect empty object', () => {
      expect(isEmpty({})).toBe(true)
    })

    it('should detect non-empty object', () => {
      expect(isEmpty({ a: 1 })).toBe(false)
    })

    it('should handle other types', () => {
      expect(isEmpty(0)).toBe(false)
      expect(isEmpty(false)).toBe(false)
      expect(isEmpty(true)).toBe(false)
    })
  })
})
