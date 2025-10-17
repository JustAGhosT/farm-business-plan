/**
 * Utility functions for the farm business plan application
 */

export interface CurrencyFormatOptions {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

/**
 * Format currency values in South African Rand (ZAR)
 */
export function formatCurrency(amount: number, options: CurrencyFormatOptions = {}): string {
  const { minimumFractionDigits = 0, maximumFractionDigits = 0, locale = 'en-ZA' } = options

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}

/**
 * Parse currency string to number (removes currency symbols and formatting)
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols, spaces, and parse
  const cleaned = value.replace(/[R\s,]/g, '')
  return parseFloat(cleaned) || 0
}

/**
 * Format number as percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format date in South African format (DD MMM YYYY)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date

  const day = d.getDate()
  const month = d.toLocaleString('en-ZA', { month: 'short' })
  const year = d.getFullYear()

  return `${day} ${month} ${year}`
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2

  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}
