/**
 * Centralized theme colors and chart color configurations
 * for the farm business plan application
 */

/**
 * Chart color constants with semantic names
 */
export const CHART_COLORS = {
  profitability: {
    high: '#10b981', // green-500
    medium: '#f59e0b', // amber-500
    low: '#ef4444', // red-500
    unknown: '#6b7280', // gray-500
  },
  waterNeeds: {
    low: '#fbbf24', // amber-400 (good - low water)
    medium: '#3b82f6', // blue-500
    high: '#1e3a8a', // blue-900 (needs more water)
    unknown: '#6b7280', // gray-500
  },
  cropAllocation: [
    '#10b981', // green-500
    '#3b82f6', // blue-500
    '#f59e0b', // amber-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#14b8a6', // teal-500
    '#f97316', // orange-500
  ],
  status: {
    draft: '#6b7280', // gray-500
    active: '#10b981', // green-500
    pending: '#f59e0b', // amber-500
    completed: '#3b82f6', // blue-500
    failed: '#ef4444', // red-500
    cancelled: '#9ca3af', // gray-400
  },
  priority: {
    low: '#3b82f6', // blue-500
    medium: '#f59e0b', // amber-500
    high: '#ef4444', // red-500
    critical: '#dc2626', // red-600
  },
} as const

/**
 * Standard color palette for general use
 */
export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

/**
 * Get color by profitability level
 */
export function getColorByProfitability(profitability: string): string {
  return (
    CHART_COLORS.profitability[profitability as keyof typeof CHART_COLORS.profitability] ||
    CHART_COLORS.profitability.unknown
  )
}

/**
 * Get color by water needs level
 */
export function getColorByWaterNeeds(waterNeeds: string): string {
  return (
    CHART_COLORS.waterNeeds[waterNeeds as keyof typeof CHART_COLORS.waterNeeds] ||
    CHART_COLORS.waterNeeds.unknown
  )
}

/**
 * Get color by status
 */
export function getColorByStatus(status: string): string {
  return (
    CHART_COLORS.status[status as keyof typeof CHART_COLORS.status] ||
    CHART_COLORS.status.draft
  )
}

/**
 * Get color by priority
 */
export function getColorByPriority(priority: string): string {
  return (
    CHART_COLORS.priority[priority as keyof typeof CHART_COLORS.priority] ||
    CHART_COLORS.priority.medium
  )
}

/**
 * Get crop allocation color by index
 */
export function getCropAllocationColor(index: number): string {
  return CHART_COLORS.cropAllocation[index % CHART_COLORS.cropAllocation.length]
}
