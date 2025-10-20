'use client'

import WizardWrapper from '@/components/WizardWrapper'
import { useEffect, useState } from 'react'

interface YearProjection {
  year: number
  production: string
  price: string
  revenue: number
}

interface Crop {
  id: string
  name: string
  percentage: number
  baseProduction: string
  basePrice: string
  growthRate: string
  priceInflation: string
}

export default function RevenueCalculator() {
  const [years, setYears] = useState('5')
  const [crops, setCrops] = useState<Crop[]>([
    {
      id: '1',
      name: '',
      percentage: 100,
      baseProduction: '',
      basePrice: '',
      growthRate: '10',
      priceInflation: '5',
    },
  ])

  const addCrop = () => {
    setCrops([
      ...crops,
      {
        id: Date.now().toString(),
        name: '',
        percentage: 0,
        baseProduction: '',
        basePrice: '',
        growthRate: '10',
        priceInflation: '5',
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

  const calculateCropProjections = (crop: Crop): YearProjection[] => {
    const projections: YearProjection[] = []
    const base = parseFloat(crop.baseProduction) || 0
    const price = parseFloat(crop.basePrice) || 0
    const growth = parseFloat(crop.growthRate) / 100
    const inflation = parseFloat(crop.priceInflation) / 100
    const numYears = parseInt(years) || 5
    const percentage = crop.percentage / 100

    for (let year = 1; year <= numYears; year++) {
      const production = base * Math.pow(1 + growth, year - 1) * percentage
      const yearPrice = price * Math.pow(1 + inflation, year - 1)
      const revenue = production * yearPrice

      projections.push({
        year,
        production: production.toFixed(0),
        price: yearPrice.toFixed(2),
        revenue,
      })
    }

    return projections
  }

  const calculateTotalProjections = (): YearProjection[] => {
    const numYears = parseInt(years) || 5
    const totalProjections: YearProjection[] = []

    for (let year = 1; year <= numYears; year++) {
      let yearRevenue = 0
      crops.forEach((crop) => {
        const cropProjections = calculateCropProjections(crop)
        if (cropProjections[year - 1]) {
          yearRevenue += cropProjections[year - 1].revenue
        }
      })

      totalProjections.push({
        year,
        production: '',
        price: '',
        revenue: yearRevenue,
      })
    }

    return totalProjections
  }

  const totalProjections = calculateTotalProjections()
  const totalRevenue = totalProjections.reduce((sum, p) => sum + p.revenue, 0)
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
            baseProduction: '',
            basePrice: '',
            growthRate: '10',
            priceInflation: '5',
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
    wizardData.revenue = {
      years,
      crops,
      totalRevenue,
    }
    sessionStorage.setItem('calculatorWizardData', JSON.stringify(wizardData))
  }

  return (
    <WizardWrapper
      title="Revenue Projections"
      description="Project revenue for multiple crops based on yield and market prices."
      step={4}
      isFormValid={totalPercentage === 100}
      onNext={handleNext}
    >
      <div className="space-y-6">
        {/* Global Settings */}
        <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="grid md:grid-cols-2 gap-4">
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
                  ? '✓ Allocation complete'
                  : totalPercentage > 100
                    ? '⚠ Over 100% - adjust percentages'
                    : '⚠ Under 100% - add more crops or increase percentages'}
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
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <div className="grid md:grid-cols-3 gap-4">
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
                  % of Land/Resources
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
                  Base Production (kg/units)
                </label>
                <input
                  type="number"
                  value={crop.baseProduction}
                  onChange={(e) => updateCrop(crop.id, 'baseProduction', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 5000"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Year 1 production at 100%
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Base Price per Unit (ZAR)
                </label>
                <input
                  type="number"
                  value={crop.basePrice}
                  onChange={(e) => updateCrop(crop.id, 'basePrice', e.target.value)}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 45.00"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Current market price
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Annual Growth (%)
                </label>
                <input
                  type="number"
                  value={crop.growthRate}
                  onChange={(e) => updateCrop(crop.id, 'growthRate', e.target.value)}
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Production increase</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Inflation (%)
                </label>
                <input
                  type="number"
                  value={crop.priceInflation}
                  onChange={(e) => updateCrop(crop.id, 'priceInflation', e.target.value)}
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Annual price increase
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Results Section */}
        <div className="mt-8 pt-6 border-t dark:border-gray-600">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Revenue Projections
          </h2>
          <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <div className="text-lg text-green-800 dark:text-green-300">
              Total Projected Revenue
            </div>
            <div className="text-4xl font-bold text-green-900 dark:text-green-200">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-sm text-green-700 dark:text-green-400">over {years} years</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              Annual Projections
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Year
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Total Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {totalProjections.map((yearData) => (
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
                      <td className="px-6 py-4">{formatCurrency(yearData.revenue)}</td>
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
