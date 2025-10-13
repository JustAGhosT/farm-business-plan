'use client'

import { useState } from 'react'
import Link from 'next/link'

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
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
              <span className="text-4xl mr-4">📊</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Multi-Crop Revenue Projections</h1>
                <p className="text-gray-600">
                  Project revenue for multiple crops based on yield and market prices
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
            <div className="grid md:grid-cols-2 gap-4">
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
                <div className="text-sm font-medium text-gray-700 mb-2">Total Allocation</div>
                <div
                  className={`text-2xl font-bold ${totalPercentage === 100 ? 'text-green-600' : totalPercentage > 100 ? 'text-red-600' : 'text-yellow-600'}`}
                >
                  {totalPercentage.toFixed(0)}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
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

                <div className="grid md:grid-cols-3 gap-4">
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
                      % of Land/Resources
                    </label>
                    <input
                      type="number"
                      value={crop.percentage}
                      onChange={(e) => updateCrop(crop.id, 'percentage', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Allocation percentage</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Production (kg/units)
                    </label>
                    <input
                      type="number"
                      value={crop.baseProduction}
                      onChange={(e) => updateCrop(crop.id, 'baseProduction', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 5000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Year 1 production at 100%</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Price per Unit (ZAR)
                    </label>
                    <input
                      type="number"
                      value={crop.basePrice}
                      onChange={(e) => updateCrop(crop.id, 'basePrice', e.target.value)}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 45.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Current market price</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Growth (%)
                    </label>
                    <input
                      type="number"
                      value={crop.growthRate}
                      onChange={(e) => updateCrop(crop.id, 'growthRate', e.target.value)}
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Production increase</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Inflation (%)
                    </label>
                    <input
                      type="number"
                      value={crop.priceInflation}
                      onChange={(e) => updateCrop(crop.id, 'priceInflation', e.target.value)}
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Annual price increase</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Summary */}
          {totalRevenue > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Revenue Summary</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-primary-50 rounded-lg p-4 border-2 border-primary-200">
                  <div className="text-sm text-gray-600 mb-1">Total {years}-Year Revenue</div>
                  <div className="text-2xl font-bold text-primary-700">
                    {formatCurrency(totalRevenue)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Average Annual Revenue</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(totalRevenue / totalProjections.length)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Year 1 Revenue</div>
                  <div className="text-xl font-bold text-gray-900">
                    {totalProjections[0] ? formatCurrency(totalProjections[0].revenue) : 'N/A'}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Final Year Revenue</div>
                  <div className="text-xl font-bold text-gray-900">
                    {totalProjections[totalProjections.length - 1]
                      ? formatCurrency(totalProjections[totalProjections.length - 1].revenue)
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Per-Crop Revenue Breakdown */}
          {totalRevenue > 0 && crops.length > 1 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Revenue by Crop</h2>
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
                        Total Revenue
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        % of Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {crops.map((crop) => {
                      const cropProjections = calculateCropProjections(crop)
                      const cropTotalRevenue = cropProjections.reduce((sum, p) => sum + p.revenue, 0)
                      const percentage = totalRevenue > 0 ? (cropTotalRevenue / totalRevenue) * 100 : 0
                      return (
                        <tr key={crop.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-medium">
                            {crop.name || 'Unnamed Crop'}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {crop.percentage}%
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                            {formatCurrency(cropTotalRevenue)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {percentage.toFixed(1)}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Year-by-Year Projections */}
          {totalRevenue > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Year-by-Year Total Projections</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead className="bg-primary-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Year
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        Total Revenue
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        Growth
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {totalProjections.map((proj, index) => {
                      const growth =
                        index > 0
                          ? ((proj.revenue - totalProjections[index - 1].revenue) /
                              totalProjections[index - 1].revenue) *
                            100
                          : 0
                      return (
                        <tr key={proj.year} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-medium">
                            Year {proj.year}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                            {formatCurrency(proj.revenue)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {index > 0 ? (
                              <span className={growth > 0 ? 'text-green-600' : 'text-red-600'}>
                                {growth > 0 ? '+' : ''}
                                {growth.toFixed(1)}%
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    <tr className="bg-gray-100 font-bold">
                      <td className="border border-gray-300 px-4 py-2">
                        Total
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {formatCurrency(totalRevenue)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold text-yellow-900 mb-2">💡 Tips for Revenue Projections</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
              <li>Be conservative with growth rates - use realistic estimates</li>
              <li>
                Allocate land/resources carefully - total should equal 100% for accurate projections
              </li>
              <li>
                Consider crop maturity periods - many crops take years to reach full production
              </li>
              <li>Factor in market price volatility and seasonal variations</li>
              <li>Include multiple scenarios (optimistic, base, pessimistic)</li>
              <li>Update projections regularly based on actual performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
