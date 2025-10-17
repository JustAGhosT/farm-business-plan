import { CropTemplate, CROP_TEMPLATES } from './cropTemplates'

export interface CropChartData {
  name: string
  percentage: number
  revenue: number
  costs: number
  profit: number
  roi: number
  waterNeeds: string
  profitability: string
}

// Chart color constants with semantic names
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
}

// Memoization cache for expensive calculations
const cropComparisonCache = new Map<string, CropChartData[]>()
const CACHE_MAX_SIZE = 100 // Prevent unbounded growth

/**
 * Generate a cache key from function parameters
 */
function getCacheKey(
  crops: Array<{ name: string; percentage: number }>,
  years: number,
  totalHectares: number
): string {
  return JSON.stringify({ crops, years, totalHectares })
}

export function prepareCropComparisonData(
  crops: Array<{ name: string; percentage: number }>,
  years: number = 5,
  totalHectares: number = 10
): CropChartData[] {
  // Check cache first
  const cacheKey = getCacheKey(crops, years, totalHectares)
  const cached = cropComparisonCache.get(cacheKey)
  if (cached) {
    return cached
  }

  // Calculate if not in cache
  const result = crops
    .filter((crop) => crop.name.trim() !== '')
    .map((crop) => {
      const template = CROP_TEMPLATES.find((t) => t.name === crop.name)

      if (!template) {
        // Return basic data if template not found
        return {
          name: crop.name,
          percentage: crop.percentage,
          revenue: 0,
          costs: 0,
          profit: 0,
          roi: 0,
          waterNeeds: 'unknown',
          profitability: 'unknown',
        }
      }

      const hectares = (crop.percentage / 100) * totalHectares

      // Calculate year-by-year totals
      let totalRevenue = 0
      let totalCosts = 0

      for (let year = 1; year <= years; year++) {
        const production =
          template.baseProduction * Math.pow(1 + template.growthRate / 100, year - 1)
        const price = template.basePrice * Math.pow(1 + template.priceInflation / 100, year - 1)
        const yearRevenue = production * price * hectares
        const yearCosts =
          template.fixedCostsPerHa * hectares + production * template.variableCostPerUnit * hectares

        totalRevenue += yearRevenue
        totalCosts += yearCosts
      }

      const totalProfit = totalRevenue - totalCosts
      const initialInvestment = template.initialInvestmentPerHa * hectares
      const roi =
        initialInvestment > 0 ? ((totalProfit - initialInvestment) / initialInvestment) * 100 : 0

      return {
        name: crop.name,
        percentage: crop.percentage,
        revenue: totalRevenue,
        costs: totalCosts,
        profit: totalProfit,
        roi: roi,
        waterNeeds: template.waterNeeds,
        profitability: template.profitability,
      }
    })

  // Store in cache with size limit
  if (cropComparisonCache.size >= CACHE_MAX_SIZE) {
    // Remove oldest entry (first in Map)
    const firstKey = cropComparisonCache.keys().next().value
    if (firstKey !== undefined) {
      cropComparisonCache.delete(firstKey)
    }
  }
  cropComparisonCache.set(cacheKey, result)

  return result
}

export function getColorByProfitability(profitability: string): string {
  return (
    CHART_COLORS.profitability[profitability as keyof typeof CHART_COLORS.profitability] ||
    CHART_COLORS.profitability.unknown
  )
}

export function getColorByWaterNeeds(waterNeeds: string): string {
  return (
    CHART_COLORS.waterNeeds[waterNeeds as keyof typeof CHART_COLORS.waterNeeds] ||
    CHART_COLORS.waterNeeds.unknown
  )
}

// Colors for crop allocation pie chart - exported from constants
export const CROP_COLORS = CHART_COLORS.cropAllocation
