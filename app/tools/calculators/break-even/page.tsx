'use client'

import WizardWrapper from '@/components/WizardWrapper'
import { useEffect, useState } from 'react'

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

  useEffect(() => {
    const raw = sessionStorage.getItem('calculatorWizardData')
    if (!raw) return

    try {
      const wizardData = JSON.parse(raw)
      if (wizardData.crops && wizardData.crops.length > 0) {
        setCrops(
          wizardData.crops.map((c: any) => ({
            ...c,
            fixedCosts: '',
            variableCostPerUnit: '',
            pricePerUnit: '',
          }))
        )
      }
      if (wizardData.years) {
        setYears(wizardData.years.toString())
      }
    } catch (e) {
      console.error('Failed to parse wizard data', e)
    }
  }, [])

  const handleNext = () => {
    const wizardData = JSON.parse(sessionStorage.getItem('calculatorWizardData') || '{}')
    wizardData.breakEven = {
      years,
      projectedGrowth,
      crops,
      results,
    }
    sessionStorage.setItem('calculatorWizardData', JSON.stringify(wizardData))
  }

  return (
    <WizardWrapper
      title="Break-Even Analysis"
      description="Determine the break-even point for your farm with multi-year projections."
      step={5}
      isFormValid={totalPercentage === 100}
      onNext={handleNext}
    >
      <div className="space-y-6">
        {/* Global Settings */}
        <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="years"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Projection Period (Years)
              </label>
              <input
                type="number"
                id="years"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                min="1"
                max="10"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label
                htmlFor="projectedGrowth"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Annual Growth Rate (%)
              </label>
              <input
                type="number"
                id="projectedGrowth"
                value={projectedGrowth}
                onChange={(e) => setProjectedGrowth(e.target.value)}
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Expected production growth
              </p>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Allocation
              </div>
              <div
                className={`text-2xl font-bold ${
                  totalPercentage === 100
                    ? 'text-green-600 dark:text-green-400'
                    : totalPercentage > 100
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                }`}
              >
                {totalPercentage.toFixed(0)}%
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
        {crops.map((crop, index) => (
          <div
            key={crop.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Crop {index + 1}
                {crop.name ? `: ${crop.name}` : ''}
              </h3>
              {crops.length > 1 && (
                <button
                  onClick={() => removeCrop(crop.id)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                  aria-label={`Remove ${crop.name || 'crop'} ${index + 1}`}
                  title={`Remove ${crop.name || 'crop'} ${index + 1}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Crop Name
                </label>
                <input
                  type="text"
                  value={crop.name}
                  onChange={(e) => updateCrop(crop.id, 'name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Dragon Fruit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 50"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Allocation percentage
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Annual Fixed Costs (ZAR)
                </label>
                <input
                  type="number"
                  value={crop.fixedCosts}
                  onChange={(e) => updateCrop(crop.id, 'fixedCosts', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 100000"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fixed costs at 100%</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Variable Cost per Unit (ZAR)
                </label>
                <input
                  type="number"
                  value={crop.variableCostPerUnit}
                  onChange={(e) => updateCrop(crop.id, 'variableCostPerUnit', e.target.value)}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 25.50"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cost per kg/unit</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selling Price per Unit (ZAR)
                </label>
                <input
                  type="number"
                  value={crop.pricePerUnit}
                  onChange={(e) => updateCrop(crop.id, 'pricePerUnit', e.target.value)}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 50.00"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Price charged to customers
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Results Section */}
        <div className="mt-8 pt-6 border-t dark:border-gray-600">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Results & Projections
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-center">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-blue-800 dark:text-blue-300">Break-Even Units</div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                {results.breakEvenUnits.toFixed(0)}
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-sm text-green-800 dark:text-green-300">Break-Even Revenue</div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-200">
                {formatCurrency(results.breakEvenRevenue)}
              </div>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-sm text-yellow-800 dark:text-yellow-300">
                Contribution Margin
              </div>
              <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
                {formatCurrency(results.contributionMargin)}
              </div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-sm text-purple-800 dark:text-purple-300">CM Ratio</div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                {results.contributionMarginRatio.toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              Multi-Year Projections
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Year
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Projected Units
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Projected Revenue
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Profit/Loss
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.yearBreakEvens.map((yearData) => (
                    <tr
                      key={yearData.year}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        {yearData.year}
                      </th>
                      <td className="px-6 py-4">{yearData.projectedUnits.toFixed(0)}</td>
                      <td className="px-6 py-4">{formatCurrency(yearData.projectedRevenue)}</td>
                      <td
                        className={`px-6 py-4 font-semibold ${
                          yearData.profitLoss >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-500 dark:text-red-400'
                        }`}
                      >
                        {formatCurrency(yearData.profitLoss)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </WizardWrapper>
  )
}
