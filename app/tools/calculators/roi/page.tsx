'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Crop {
  id: string
  name: string
  percentage: number
  initialInvestment: string
  annualRevenue: string
  annualCosts: string
}

interface YearResults {
  year: number
  revenue: number
  costs: number
  profit: number
  cumulativeProfit: number
}

export default function ROICalculator() {
  const [years, setYears] = useState('5')
  const [crops, setCrops] = useState<Crop[]>([
    {
      id: '1',
      name: '',
      percentage: 100,
      initialInvestment: '',
      annualRevenue: '',
      annualCosts: '',
    },
  ])

  const [savedMessage, setSavedMessage] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const addCrop = () => {
    setCrops([
      ...crops,
      {
        id: Date.now().toString(),
        name: '',
        percentage: 0,
        initialInvestment: '',
        annualRevenue: '',
        annualCosts: '',
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

  const calculateTotalROI = () => {
    const numYears = parseInt(years) || 1
    const totalInvestment = crops.reduce((sum, crop) => {
      const investment = parseFloat(crop.initialInvestment) || 0
      const percentage = crop.percentage / 100
      return sum + investment * percentage
    }, 0)

    const yearResults: YearResults[] = []
    let cumulativeProfit = -totalInvestment

    for (let year = 1; year <= numYears; year++) {
      const yearRevenue = crops.reduce((sum, crop) => {
        const revenue = parseFloat(crop.annualRevenue) || 0
        const percentage = crop.percentage / 100
        return sum + revenue * percentage
      }, 0)

      const yearCosts = crops.reduce((sum, crop) => {
        const costs = parseFloat(crop.annualCosts) || 0
        const percentage = crop.percentage / 100
        return sum + costs * percentage
      }, 0)

      const yearProfit = yearRevenue - yearCosts
      cumulativeProfit += yearProfit

      yearResults.push({
        year,
        revenue: yearRevenue,
        costs: yearCosts,
        profit: yearProfit,
        cumulativeProfit,
      })
    }

    const totalRevenue = yearResults.reduce((sum, yr) => sum + yr.revenue, 0)
    const totalCosts = yearResults.reduce((sum, yr) => sum + yr.costs, 0)
    const totalNetProfit = totalRevenue - totalCosts
    const annualNetProfit = totalNetProfit / numYears
    const roi = totalInvestment > 0 ? ((totalNetProfit - totalInvestment) / totalInvestment) * 100 : 0
    const paybackPeriod = annualNetProfit > 0 ? totalInvestment / annualNetProfit : 0

    return {
      totalInvestment,
      roi,
      netProfit: totalNetProfit,
      annualNetProfit,
      paybackPeriod,
      yearResults,
    }
  }

  const results = calculateTotalROI()
  const totalPercentage = crops.reduce((sum, c) => sum + (parseFloat(String(c.percentage)) || 0), 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleSaveCalculation = async () => {
    if (!results || results.totalInvestment === 0) return

    setIsSaving(true)
    setSavedMessage('')

    try {
      const response = await fetch('/api/calculator-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calculator_type: 'roi',
          input_data: { crops, years },
          results: results,
          notes: notes || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSavedMessage('✓ Calculation saved successfully!')
        setNotes('')
        setTimeout(() => setSavedMessage(''), 3000)
      } else {
        setSavedMessage('✗ Failed to save calculation')
      }
    } catch (error) {
      console.error('Error saving calculation:', error)
      setSavedMessage('✗ Error saving calculation')
    } finally {
      setIsSaving(false)
    }
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
              <span className="text-4xl mr-4">📈</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Multi-Crop ROI Calculator</h1>
                <p className="text-gray-600">
                  Calculate Return on Investment for multiple crops with year-by-year analysis
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
                  Time Period (Years)
                </label>
                <input
                  type="number"
                  id="years"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  min="1"
                  max="20"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Number of years for ROI calculation</p>
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Allocation percentage</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Initial Investment (ZAR)
                    </label>
                    <input
                      type="number"
                      value={crop.initialInvestment}
                      onChange={(e) => updateCrop(crop.id, 'initialInvestment', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 150000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Startup costs at 100%</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Revenue (ZAR)
                    </label>
                    <input
                      type="number"
                      value={crop.annualRevenue}
                      onChange={(e) => updateCrop(crop.id, 'annualRevenue', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 250000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Expected yearly revenue at 100%</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Operating Costs (ZAR)
                    </label>
                    <input
                      type="number"
                      value={crop.annualCosts}
                      onChange={(e) => updateCrop(crop.id, 'annualCosts', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 120000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Yearly expenses at 100%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Results Summary */}
          {results.totalInvestment > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">ROI Summary</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-primary-50 rounded-lg p-4 border-2 border-primary-200">
                  <div className="text-sm text-gray-600 mb-1">Return on Investment (ROI)</div>
                  <div
                    className={`text-3xl font-bold ${results.roi > 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {results.roi.toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {results.roi > 0 ? 'Positive return' : 'Negative return'} over {years} years
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Total Investment</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(results.totalInvestment)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Annual Net Profit</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(results.annualNetProfit)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Payback Period</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {results.paybackPeriod > 0 ? `${results.paybackPeriod.toFixed(1)} years` : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Interpretation:</strong>{' '}
                  {results.roi > 100
                    ? 'Excellent ROI! Your investment will more than double.'
                    : results.roi > 50
                      ? 'Good ROI. Your investment shows strong returns.'
                      : results.roi > 20
                        ? 'Moderate ROI. Consider ways to increase profitability.'
                        : results.roi > 0
                          ? 'Low ROI. Review costs and revenue projections.'
                          : 'Negative ROI. The operation is not profitable at these levels.'}
                </p>
              </div>
            </div>
          )}

          {/* Year-by-Year Analysis */}
          {results.totalInvestment > 0 && results.yearResults && results.yearResults.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Year-by-Year Analysis</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead className="bg-primary-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Year
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        Revenue
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        Costs
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        Net Profit
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        Cumulative Profit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.yearResults.map((year) => (
                      <tr key={year.year} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          Year {year.year}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {formatCurrency(year.revenue)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-red-600">
                          {formatCurrency(year.costs)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                          <span className={year.profit > 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(year.profit)}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                          <span
                            className={year.cumulativeProfit > 0 ? 'text-green-600' : 'text-red-600'}
                          >
                            {formatCurrency(year.cumulativeProfit)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Note:</strong> Cumulative profit includes the initial investment (shown as
                negative in Year 1).
              </p>
            </div>
          )}

          {/* Per-Crop ROI Breakdown */}
          {results.totalInvestment > 0 && crops.length > 1 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">ROI by Crop</h2>
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
                        Investment
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        Annual Profit
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        Crop ROI
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {crops.map((crop) => {
                      const investment = (parseFloat(crop.initialInvestment) || 0) * (crop.percentage / 100)
                      const revenue = (parseFloat(crop.annualRevenue) || 0) * (crop.percentage / 100)
                      const costs = (parseFloat(crop.annualCosts) || 0) * (crop.percentage / 100)
                      const profit = revenue - costs
                      const totalProfit = profit * parseInt(years)
                      const cropROI = investment > 0 ? ((totalProfit - investment) / investment) * 100 : 0
                      return (
                        <tr key={crop.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-medium">
                            {crop.name || 'Unnamed Crop'}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {crop.percentage}%
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {formatCurrency(investment)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            <span className={profit > 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(profit)}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                            <span className={cropROI > 0 ? 'text-green-600' : 'text-red-600'}>
                              {cropROI.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Save Calculation Section */}
          {results.totalInvestment > 0 && (
            <div className="mb-8 border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Save This Calculation</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={2}
                    placeholder="e.g., Q1 2024 projection, Conservative estimate"
                  />
                </div>
                <button
                  onClick={handleSaveCalculation}
                  disabled={isSaving}
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {isSaving ? 'Saving...' : '💾 Save Calculation'}
                </button>
                {savedMessage && (
                  <div
                    className={`text-center text-sm font-medium ${savedMessage.includes('✓') ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {savedMessage}
                  </div>
                )}
                <Link
                  href="/tools/calculators/history"
                  className="block w-full text-center bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  📊 View Calculation History
                </Link>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold text-yellow-900 mb-2">
              💡 Tips for Accurate ROI Calculation
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
              <li>Include all startup costs: land prep, infrastructure, equipment, initial inputs</li>
              <li>Be conservative with revenue estimates - factor in yield variability</li>
              <li>Account for all operating costs including labor, utilities, maintenance</li>
              <li>Consider seasonal variations and market price fluctuations</li>
              <li>Review and update your calculations regularly with actual data</li>
              <li>Allocate crops based on actual land/resource availability</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
