'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Crop {
  id: string
  name: string
  percentage: number
  fixedCosts: string
  variableCostPerUnit: string
  pricePerUnit: string
}

interface YearBreakEven {
  year: number
  breakEvenUnits: number
  breakEvenRevenue: number
  projectedUnits: number
  projectedRevenue: number
  profitLoss: number
}

export default function BreakEvenCalculator() {
  const [years, setYears] = useState('5')
  const [crops, setCrops] = useState<Crop[]>([
    {
      id: '1',
      name: '',
      percentage: 100,
      fixedCosts: '',
      variableCostPerUnit: '',
      pricePerUnit: '',
    },
  ])
  const [projectedGrowth, setProjectedGrowth] = useState('10')

  const addCrop = () => {
    setCrops([
      ...crops,
      {
        id: Date.now().toString(),
        name: '',
        percentage: 0,
        fixedCosts: '',
        variableCostPerUnit: '',
        pricePerUnit: '',
      },
    ])
  }

  const removeCrop = (id: string) => {
    if (crops.length > 1) {
      setCrops(crops.filter((c) => c.id !== id))
    }
  }

  const updateCrop = (id: string, field: keyof Crop, value: string | number) => {
    setCrops(crops.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const calculateTotalBreakEven = () => {
    const totalFixed = crops.reduce((sum, crop) => {
      const fixed = parseFloat(crop.fixedCosts) || 0
      const percentage = crop.percentage / 100
      return sum + fixed * percentage
    }, 0)

    const weightedAvgPrice = crops.reduce((sum, crop) => {
      const price = parseFloat(crop.pricePerUnit) || 0
      const percentage = crop.percentage / 100
      return sum + price * percentage
    }, 0)

    const weightedAvgVariable = crops.reduce((sum, crop) => {
      const variable = parseFloat(crop.variableCostPerUnit) || 0
      const percentage = crop.percentage / 100
      return sum + variable * percentage
    }, 0)

    if (weightedAvgPrice <= weightedAvgVariable) {
      return {
        breakEvenUnits: 0,
        breakEvenRevenue: 0,
        contributionMargin: 0,
        contributionMarginRatio: 0,
        yearBreakEvens: [],
      }
    }

    const contributionMargin = weightedAvgPrice - weightedAvgVariable
    const contributionMarginRatio = (contributionMargin / weightedAvgPrice) * 100
    const breakEvenUnits = totalFixed / contributionMargin
    const breakEvenRevenue = breakEvenUnits * weightedAvgPrice

    // Calculate multi-year projections
    const numYears = parseInt(years) || 5
    const growth = parseFloat(projectedGrowth) / 100
    const yearBreakEvens: YearBreakEven[] = []

    for (let year = 1; year <= numYears; year++) {
      const projectedUnits = breakEvenUnits * Math.pow(1 + growth, year - 1)
      const projectedRevenue = projectedUnits * weightedAvgPrice
      const totalCosts = totalFixed + projectedUnits * weightedAvgVariable
      const profitLoss = projectedRevenue - totalCosts

      yearBreakEvens.push({
        year,
        breakEvenUnits,
        breakEvenRevenue,
        projectedUnits,
        projectedRevenue,
        profitLoss,
      })
    }

    return {
      totalFixed,
      breakEvenUnits,
      breakEvenRevenue,
      contributionMargin,
      contributionMarginRatio,
      yearBreakEvens,
    }
  }

  const results = calculateTotalBreakEven()
  const totalPercentage = crops.reduce((sum, c) => sum + (parseFloat(String(c.percentage)) || 0), 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/tools/calculators"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Calculators
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <span className="text-4xl mr-4">⚖️</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Multi-Crop Break-Even Analysis</h1>
                <p className="text-gray-600">
                  Determine break-even point with multi-year projections for multiple crops
                </p>
              </div>
            </div>
            <button
              onClick={addCrop}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              + Add Crop
            </button>
          </div>

          {/* Global Settings */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="years" className="block text-sm font-medium text-gray-700 mb-2">
                  Projection Period (Years)
                </label>
                <input
                  type="number"
                  id="years"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  min="1"
                  max="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="projectedGrowth"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Annual Growth Rate (%)
                </label>
                <input
                  type="number"
                  id="projectedGrowth"
                  value={projectedGrowth}
                  onChange={(e) => setProjectedGrowth(e.target.value)}
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Expected production growth</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Total Allocation</div>
                <div
                  className={`text-2xl font-bold ${totalPercentage === 100 ? 'text-green-600' : totalPercentage > 100 ? 'text-red-600' : 'text-yellow-600'}`}
                >
                  {totalPercentage.toFixed(0)}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {totalPercentage === 100
                    ? '✓ Complete'
                    : totalPercentage > 100
                      ? '⚠ Over 100%'
                      : '⚠ Under 100%'}
                </p>
              </div>
            </div>
          </div>

          {/* Crop Input Cards */}
          <div className="space-y-6 mb-8">
            {crops.map((crop, index) => (
              <div key={crop.id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Crop {index + 1}
                    {crop.name ? `: ${crop.name}` : ''}
                  </h3>
                  {crops.length > 1 && (
                    <button
                      onClick={() => removeCrop(crop.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Crop Name
                    </label>
                    <input
                      type="text"
                      value={crop.name}
                      onChange={(e) => updateCrop(crop.id, 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Dragon Fruit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      % of Production
                    </label>
                    <input
                      type="number"
                      value={crop.percentage}
                      onChange={(e) =>
                        updateCrop(crop.id, 'percentage', parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Allocation percentage</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Fixed Costs (ZAR)
                    </label>
                    <input
                      type="number"
                      value={crop.fixedCosts}
                      onChange={(e) => updateCrop(crop.id, 'fixedCosts', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 100000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Fixed costs at 100%</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Variable Cost per Unit (ZAR)
                    </label>
                    <input
                      type="number"
                      value={crop.variableCostPerUnit}
                      onChange={(e) => updateCrop(crop.id, 'variableCostPerUnit', e.target.value)}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 25.50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Cost per kg/unit</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selling Price per Unit (ZAR)
                    </label>
                    <input
                      type="number"
                      value={crop.pricePerUnit}
                      onChange={(e) => updateCrop(crop.id, 'pricePerUnit', e.target.value)}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 50.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Price charged to customers</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Break-Even Summary */}
          {results.breakEvenUnits > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Break-Even Summary</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-primary-50 rounded-lg p-4 border-2 border-primary-200">
                  <div className="text-sm text-gray-600 mb-1">Break-Even Units</div>
                  <div className="text-3xl font-bold text-primary-700">
                    {results.breakEvenUnits.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">Units to cover costs</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Break-Even Revenue</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(results.breakEvenRevenue)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Contribution Margin</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(results.contributionMargin)}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">Per unit</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Margin Ratio</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {results.contributionMarginRatio.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Interpretation:</strong>{' '}
                  {results.contributionMarginRatio > 50
                    ? 'Excellent margin! You have strong pricing power.'
                    : results.contributionMarginRatio > 30
                      ? 'Good margin. Consider ways to reduce costs or increase prices.'
                      : 'Low margin. Review pricing strategy and cost structure.'}
                </p>
              </div>
            </div>
          )}

          {/* Multi-Year Projections */}
          {results.breakEvenUnits > 0 && results.yearBreakEvens && results.yearBreakEvens.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Multi-Year Projections</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead className="bg-primary-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Year
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        Break-Even Units
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        Projected Units
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        Projected Revenue
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        Profit/Loss
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.yearBreakEvens.map((year) => (
                      <tr key={year.year} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          Year {year.year}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {year.breakEvenUnits.toFixed(0)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {year.projectedUnits.toFixed(0)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {formatCurrency(year.projectedRevenue)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                          <span className={year.profitLoss > 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(year.profitLoss)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Note:</strong> Projected units assume {projectedGrowth}% annual growth rate.
              </p>
            </div>
          )}

          {/* Per-Crop Break-Even Analysis */}
          {results.breakEvenUnits > 0 && crops.length > 1 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Break-Even by Crop</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead className="bg-primary-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Crop
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        Allocation
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        Fixed Costs
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        Contribution Margin
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        Break-Even Units
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {crops.map((crop) => {
                      const fixed = (parseFloat(crop.fixedCosts) || 0) * (crop.percentage / 100)
                      const variable = parseFloat(crop.variableCostPerUnit) || 0
                      const price = parseFloat(crop.pricePerUnit) || 0
                      const margin = price - variable
                      const breakEven = margin > 0 ? fixed / margin : 0
                      return (
                        <tr key={crop.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-medium">
                            {crop.name || 'Unnamed Crop'}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {crop.percentage}%
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {formatCurrency(fixed)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {formatCurrency(margin)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                            {breakEven.toFixed(0)} units
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold text-yellow-900 mb-2">💡 Tips for Break-Even Analysis</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
              <li>Include all fixed costs: rent, utilities, insurance, salaries</li>
              <li>Variable costs should only include costs that change with production</li>
              <li>Consider seasonal price variations in your selling price</li>
              <li>Calculate break-even for different pricing scenarios</li>
              <li>Monitor your actual sales against break-even targets monthly</li>
              <li>Allocate crops based on actual production capacity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
