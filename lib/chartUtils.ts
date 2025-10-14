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

export function prepareCropComparisonData(
  crops: Array<{ name: string; percentage: number }>,
  years: number = 5,
  totalHectares: number = 10
): CropChartData[] {
  return crops
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
}

export function getColorByProfitability(profitability: string): string {
  switch (profitability) {
    case 'high':
      return '#10b981' // green-500
    case 'medium':
      return '#f59e0b' // amber-500
    case 'low':
      return '#ef4444' // red-500
    default:
      return '#6b7280' // gray-500
  }
}

export function getColorByWaterNeeds(waterNeeds: string): string {
  switch (waterNeeds) {
    case 'low':
      return '#fbbf24' // amber-400 (good - low water)
    case 'medium':
      return '#3b82f6' // blue-500
    case 'high':
      return '#1e3a8a' // blue-900 (needs more water)
    default:
      return '#6b7280' // gray-500
  }
}

// Colors for crop allocation pie chart
export const CROP_COLORS = [
  '#10b981', // green-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
]
