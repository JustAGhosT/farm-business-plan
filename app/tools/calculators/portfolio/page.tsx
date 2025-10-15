'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface CropAllocation {
  id: string
  cropName: string
  percentage: number
  investmentPerHectare: number
  revenuePerHectare: number
  costsPerHectare: number
  color: string
}

interface Portfolio {
  id: string
  name: string
  totalLandHectares: number
  years: number
  crops: CropAllocation[]
}

const DEFAULT_COLORS = [
  '#10b981', // green
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
]

export default function PortfolioPlanner() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([
    {
      id: '1',
      name: 'Portfolio 1',
      totalLandHectares: 10,
      years: 5,
      crops: [
        {
          id: '1',
          cropName: 'Dragon Fruit',
          percentage: 40,
          investmentPerHectare: 100000,
          revenuePerHectare: 50000,
          costsPerHectare: 25000,
          color: DEFAULT_COLORS[0],
        },
        {
          id: '2',
          cropName: 'Soy',
          percentage: 30,
          investmentPerHectare: 20000,
          revenuePerHectare: 15000,
          costsPerHectare: 8000,
          color: DEFAULT_COLORS[1],
        },
        {
          id: '3',
          cropName: 'Sunflower',
          percentage: 30,
          investmentPerHectare: 25000,
          revenuePerHectare: 18000,
          costsPerHectare: 10000,
          color: DEFAULT_COLORS[2],
        },
      ],
    },
  ])

  const calculatePortfolioResults = (portfolio: Portfolio) => {
    let totalInitialInvestment = 0
    let totalAnnualRevenue = 0
    let totalAnnualCosts = 0

    portfolio.crops.forEach((crop) => {
      const hectares = (crop.percentage / 100) * portfolio.totalLandHectares
      totalInitialInvestment += crop.investmentPerHectare * hectares
      totalAnnualRevenue += crop.revenuePerHectare * hectares
      totalAnnualCosts += crop.costsPerHectare * hectares
    })

    const annualNetProfit = totalAnnualRevenue - totalAnnualCosts
    const totalNetProfit = annualNetProfit * portfolio.years
    const roi =
      totalInitialInvestment > 0
        ? ((totalNetProfit - totalInitialInvestment) / totalInitialInvestment) * 100
        : 0
    const paybackPeriod = annualNetProfit > 0 ? totalInitialInvestment / annualNetProfit : 0

    return {
      totalInitialInvestment,
      totalAnnualRevenue,
      totalAnnualCosts,
      annualNetProfit,
      totalNetProfit,
      roi,
      paybackPeriod,
    }
  }

  const addPortfolio = () => {
    const newPortfolio: Portfolio = {
      id: Date.now().toString(),
      name: `Portfolio ${portfolios.length + 1}`,
      totalLandHectares: 10,
      years: 5,
      crops: [
        {
          id: Date.now().toString(),
          cropName: '',
          percentage: 100,
          investmentPerHectare: 0,
          revenuePerHectare: 0,
          costsPerHectare: 0,
          color: DEFAULT_COLORS[0],
        },
      ],
    }
    setPortfolios([...portfolios, newPortfolio])
  }

  const removePortfolio = (portfolioId: string) => {
    setPortfolios(portfolios.filter((p) => p.id !== portfolioId))
  }

  const updatePortfolio = (portfolioId: string, field: keyof Portfolio, value: any) => {
    setPortfolios(
      portfolios.map((p) => {
        if (p.id === portfolioId) {
          return { ...p, [field]: value }
        }
        return p
      })
    )
  }

  const addCropToPortfolio = (portfolioId: string) => {
    setPortfolios(
      portfolios.map((p) => {
        if (p.id === portfolioId && p.crops.length < 10) {
          const newCrop: CropAllocation = {
            id: Date.now().toString(),
            cropName: '',
            percentage: 0,
            investmentPerHectare: 0,
            revenuePerHectare: 0,
            costsPerHectare: 0,
            color: DEFAULT_COLORS[p.crops.length % DEFAULT_COLORS.length],
          }
          return { ...p, crops: [...p.crops, newCrop] }
        }
        return p
      })
    )
  }

  const removeCropFromPortfolio = (portfolioId: string, cropId: string) => {
    setPortfolios(
      portfolios.map((p) => {
        if (p.id === portfolioId) {
          return { ...p, crops: p.crops.filter((c) => c.id !== cropId) }
        }
        return p
      })
    )
  }

  const updateCrop = (
    portfolioId: string,
    cropId: string,
    field: keyof CropAllocation,
    value: any
  ) => {
    setPortfolios(
      portfolios.map((p) => {
        if (p.id === portfolioId) {
          return {
            ...p,
            crops: p.crops.map((c) => {
              if (c.id === cropId) {
                return { ...c, [field]: value }
              }
              return c
            }),
          }
        }
        return p
      })
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const portfoliosWithResults = portfolios.map((p) => ({
    ...p,
    results: calculatePortfolioResults(p),
  }))

  const getTotalPercentage = (portfolio: Portfolio) => {
    return portfolio.crops.reduce((sum, crop) => sum + crop.percentage, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link
          href="/tools/calculators"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 mb-6 transition-colors"
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <span className="text-4xl mr-4">🌾</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Portfolio Crop Allocation Planner
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Allocate percentages across multiple crops (e.g., 10% Dragon Fruit, 40% Soy, 50%
                  Sunflower) - up to 10 crops per portfolio
                </p>
              </div>
            </div>
            <button
              onClick={addPortfolio}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              + Add Portfolio
            </button>
          </div>

          {/* Portfolio Cards */}
          {portfolios.map((portfolio) => {
            const totalPercentage = getTotalPercentage(portfolio)
            const isValidAllocation = totalPercentage === 100
            const results = portfoliosWithResults.find((p) => p.id === portfolio.id)?.results

            return (
              <div
                key={portfolio.id}
                className="mb-8 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6"
              >
                {/* Portfolio Header */}
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    value={portfolio.name}
                    onChange={(e) => updatePortfolio(portfolio.id, 'name', e.target.value)}
                    className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1 dark:text-white"
                    aria-label="Portfolio name"
                  />
                  <div className="flex items-center gap-4">
                    {!isValidAllocation && (
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        Total: {totalPercentage}% (Must equal 100%)
                      </span>
                    )}
                    {isValidAllocation && (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        ✓ Valid Allocation
                      </span>
                    )}
                    {portfolios.length > 1 && (
                      <button
                        onClick={() => removePortfolio(portfolio.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Remove portfolio"
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
                </div>

                {/* Portfolio Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor={`land-${portfolio.id}`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Total Land (Hectares)
                    </label>
                    <input
                      id={`land-${portfolio.id}`}
                      type="number"
                      value={portfolio.totalLandHectares}
                      onChange={(e) =>
                        updatePortfolio(
                          portfolio.id,
                          'totalLandHectares',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`years-${portfolio.id}`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Time Horizon (Years)
                    </label>
                    <input
                      id={`years-${portfolio.id}`}
                      type="number"
                      value={portfolio.years}
                      onChange={(e) =>
                        updatePortfolio(portfolio.id, 'years', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Number of Crops
                    </label>
                    <div className="text-lg font-bold dark:text-white pt-2">
                      {portfolio.crops.length} / 10
                    </div>
                  </div>
                </div>

                {/* Crop Allocations */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Crop Allocations
                    </h3>
                    <button
                      onClick={() => addCropToPortfolio(portfolio.id)}
                      disabled={portfolio.crops.length >= 10}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                    >
                      + Add Crop
                    </button>
                  </div>

                  <div className="space-y-3">
                    {portfolio.crops.map((crop) => (
                      <div
                        key={crop.id}
                        className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 border rounded-lg dark:border-gray-600"
                        style={
                          {
                            ['--crop-color' as string]: crop.color,
                            borderLeftWidth: '4px',
                            borderLeftColor: 'var(--crop-color)',
                          } as React.CSSProperties
                        }
                      >
                        <div>
                          <label
                            htmlFor={`crop-name-${portfolio.id}-${crop.id}`}
                            className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Crop Name
                          </label>
                          <input
                            id={`crop-name-${portfolio.id}-${crop.id}`}
                            type="text"
                            value={crop.cropName}
                            onChange={(e) =>
                              updateCrop(portfolio.id, crop.id, 'cropName', e.target.value)
                            }
                            placeholder="e.g., Soy"
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`percentage-${portfolio.id}-${crop.id}`}
                            className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            % of Land
                          </label>
                          <input
                            id={`percentage-${portfolio.id}-${crop.id}`}
                            type="number"
                            value={crop.percentage}
                            onChange={(e) =>
                              updateCrop(
                                portfolio.id,
                                crop.id,
                                'percentage',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="0"
                            max="100"
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`investment-${portfolio.id}-${crop.id}`}
                            className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Investment/Ha
                          </label>
                          <input
                            id={`investment-${portfolio.id}-${crop.id}`}
                            type="number"
                            value={crop.investmentPerHectare}
                            onChange={(e) =>
                              updateCrop(
                                portfolio.id,
                                crop.id,
                                'investmentPerHectare',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`revenue-${portfolio.id}-${crop.id}`}
                            className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Revenue/Ha
                          </label>
                          <input
                            id={`revenue-${portfolio.id}-${crop.id}`}
                            type="number"
                            value={crop.revenuePerHectare}
                            onChange={(e) =>
                              updateCrop(
                                portfolio.id,
                                crop.id,
                                'revenuePerHectare',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`costs-${portfolio.id}-${crop.id}`}
                            className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Costs/Ha
                          </label>
                          <input
                            id={`costs-${portfolio.id}-${crop.id}`}
                            type="number"
                            value={crop.costsPerHectare}
                            onChange={(e) =>
                              updateCrop(
                                portfolio.id,
                                crop.id,
                                'costsPerHectare',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div className="flex items-end">
                          {portfolio.crops.length > 1 && (
                            <button
                              onClick={() => removeCropFromPortfolio(portfolio.id, crop.id)}
                              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Allocation & Results */}
                {isValidAllocation && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Pie Chart */}
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                          Land Allocation
                        </h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={portfolio.crops.map((crop) => ({
                                name: crop.cropName,
                                value: crop.percentage,
                              }))}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={(entry) => `${entry.name} ${entry.value}%`}
                            >
                              {portfolio.crops.map((crop, index) => (
                                <Cell key={`cell-${index}`} fill={crop.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Financial Summary */}
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                          Portfolio Summary
                        </h4>
                        {results && (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Total Investment:
                              </span>
                              <span className="font-bold dark:text-white">
                                {formatCurrency(results.totalInitialInvestment)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Annual Revenue:
                              </span>
                              <span className="font-bold dark:text-white">
                                {formatCurrency(results.totalAnnualRevenue)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Annual Costs:
                              </span>
                              <span className="font-bold dark:text-white">
                                {formatCurrency(results.totalAnnualCosts)}
                              </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t dark:border-gray-600">
                              <span className="text-gray-600 dark:text-gray-400">
                                Annual Net Profit:
                              </span>
                              <span className="font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(results.annualNetProfit)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Total Profit ({portfolio.years}yr):
                              </span>
                              <span className="font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(results.totalNetProfit)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">ROI:</span>
                              <span className="font-bold text-primary-600 dark:text-primary-400">
                                {results.roi.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Payback Period:
                              </span>
                              <span className="font-bold dark:text-white">
                                {results.paybackPeriod.toFixed(1)} years
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Crop-by-Crop Breakdown */}
                    <div className="mt-6">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                        Crop-by-Crop Breakdown
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                                Crop
                              </th>
                              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
                                % Land
                              </th>
                              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
                                Hectares
                              </th>
                              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
                                Investment
                              </th>
                              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
                                Annual Revenue
                              </th>
                              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
                                Annual Costs
                              </th>
                              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
                                Annual Profit
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {portfolio.crops.map((crop) => {
                              const hectares = (crop.percentage / 100) * portfolio.totalLandHectares
                              const investment = crop.investmentPerHectare * hectares
                              const revenue = crop.revenuePerHectare * hectares
                              const costs = crop.costsPerHectare * hectares
                              const profit = revenue - costs

                              return (
                                <tr key={crop.id}>
                                  <td
                                    className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium"
                                    style={
                                      {
                                        ['--crop-color' as string]: crop.color,
                                        color: 'var(--crop-color)',
                                      } as React.CSSProperties
                                    }
                                  >
                                    {crop.cropName || 'Unnamed'}
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right dark:text-white">
                                    {crop.percentage}%
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right dark:text-white">
                                    {hectares.toFixed(1)} ha
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right dark:text-white">
                                    {formatCurrency(investment)}
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right dark:text-white">
                                    {formatCurrency(revenue)}
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right dark:text-white">
                                    {formatCurrency(costs)}
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(profit)}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}

          {/* Portfolio Comparison */}
          {portfolios.length > 1 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Portfolio Comparison
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* ROI Comparison */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    ROI Comparison
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={portfoliosWithResults.map((p) => ({
                        name: p.name,
                        ROI: p.results.roi,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="ROI" fill="#10b981" name="ROI %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Net Profit Comparison */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Total Profit Comparison
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={portfoliosWithResults.map((p) => ({
                        name: p.name,
                        'Net Profit': p.results.totalNetProfit / 1000,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value}k ZAR`} />
                      <Legend />
                      <Bar dataKey="Net Profit" fill="#3b82f6" name="Net Profit (thousands ZAR)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                        Metric
                      </th>
                      {portfoliosWithResults.map((portfolio) => (
                        <th
                          key={portfolio.id}
                          className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center"
                        >
                          {portfolio.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                        Number of Crops
                      </td>
                      {portfoliosWithResults.map((portfolio) => (
                        <td
                          key={portfolio.id}
                          className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center dark:text-white"
                        >
                          {portfolio.crops.length}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                        Total Investment
                      </td>
                      {portfoliosWithResults.map((portfolio) => (
                        <td
                          key={portfolio.id}
                          className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center dark:text-white"
                        >
                          {formatCurrency(portfolio.results.totalInitialInvestment)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                        Annual Profit
                      </td>
                      {portfoliosWithResults.map((portfolio) => (
                        <td
                          key={portfolio.id}
                          className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-bold text-green-600 dark:text-green-400"
                        >
                          {formatCurrency(portfolio.results.annualNetProfit)}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                        ROI
                      </td>
                      {portfoliosWithResults.map((portfolio) => (
                        <td
                          key={portfolio.id}
                          className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-bold text-primary-600 dark:text-primary-400"
                        >
                          {portfolio.results.roi.toFixed(1)}%
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                        Payback Period
                      </td>
                      {portfoliosWithResults.map((portfolio) => (
                        <td
                          key={portfolio.id}
                          className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-bold dark:text-white"
                        >
                          {portfolio.results.paybackPeriod.toFixed(1)} years
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Best Portfolio */}
              <div className="mt-6 p-6 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  📊 Recommendation
                </h3>
                <div className="space-y-2">
                  {(() => {
                    const bestROI = portfoliosWithResults.reduce((prev, current) =>
                      current.results.roi > prev.results.roi ? current : prev
                    )
                    const bestPayback = portfoliosWithResults.reduce((prev, current) =>
                      current.results.paybackPeriod < prev.results.paybackPeriod ? current : prev
                    )
                    const bestProfit = portfoliosWithResults.reduce((prev, current) =>
                      current.results.totalNetProfit > prev.results.totalNetProfit ? current : prev
                    )

                    return (
                      <>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-bold">{bestROI.name}</span> has the highest ROI at{' '}
                          {bestROI.results.roi.toFixed(1)}%
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-bold">{bestPayback.name}</span> has the fastest
                          payback period at {bestPayback.results.paybackPeriod.toFixed(1)} years
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-bold">{bestProfit.name}</span> generates the highest
                          net profit at {formatCurrency(bestProfit.results.totalNetProfit)}
                        </p>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
