'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'

interface Scenario {
  id: string
  name: string
  cropType: string
  initialInvestment: number
  annualRevenue: number
  annualCosts: number
  years: number
  color: string
  results?: {
    roi: number
    netProfit: number
    annualNetProfit: number
    paybackPeriod: number
  }
}

export default function ScenarioComparison() {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: '1',
      name: 'Scenario 1',
      cropType: 'Dragon Fruit',
      initialInvestment: 100000,
      annualRevenue: 50000,
      annualCosts: 25000,
      years: 5,
      color: '#10b981',
    },
  ])

  const [editingScenario, setEditingScenario] = useState<string | null>(null)

  const calculateScenarioResults = (scenario: Scenario) => {
    const investment = scenario.initialInvestment
    const revenue = scenario.annualRevenue
    const costs = scenario.annualCosts
    const years = scenario.years

    const annualNetProfit = revenue - costs
    const totalNetProfit = annualNetProfit * years
    const roi = investment > 0 ? ((totalNetProfit - investment) / investment) * 100 : 0
    const paybackPeriod = annualNetProfit > 0 ? investment / annualNetProfit : 0

    return {
      roi,
      netProfit: totalNetProfit,
      annualNetProfit,
      paybackPeriod,
    }
  }

  const addScenario = () => {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: `Scenario ${scenarios.length + 1}`,
      cropType: '',
      initialInvestment: 0,
      annualRevenue: 0,
      annualCosts: 0,
      years: 5,
      color: colors[scenarios.length % colors.length],
    }
    setScenarios([...scenarios, newScenario])
    setEditingScenario(newScenario.id)
  }

  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id))
  }

  const updateScenario = (id: string, field: keyof Scenario, value: any) => {
    setScenarios(
      scenarios.map((s) => {
        if (s.id === id) {
          const updated = { ...s, [field]: value }
          updated.results = calculateScenarioResults(updated)
          return updated
        }
        return s
      })
    )
  }

  const scenariosWithResults = scenarios.map((s) => ({
    ...s,
    results: s.results || calculateScenarioResults(s),
  }))

  const comparisonData = scenariosWithResults.map((s) => ({
    name: s.name,
    'Initial Investment': s.initialInvestment,
    'Annual Revenue': s.annualRevenue,
    'Annual Costs': s.annualCosts,
    ROI: s.results.roi,
    'Net Profit': s.results.netProfit,
    'Payback Period': s.results.paybackPeriod,
  }))

  const roiComparisonData = scenariosWithResults.map((s) => ({
    name: s.name,
    ROI: s.results.roi,
  }))

  const profitComparisonData = scenariosWithResults.map((s) => ({
    name: s.name,
    'Net Profit': s.results.netProfit / 1000, // In thousands
  }))

  const radarData = [
    {
      metric: 'ROI',
      ...scenariosWithResults.reduce((acc, s) => {
        acc[s.name] = Math.min(s.results.roi, 100) // Cap at 100 for visualization
        return acc
      }, {} as any),
    },
    {
      metric: 'Revenue/Investment',
      ...scenariosWithResults.reduce((acc, s) => {
        acc[s.name] = Math.min((s.annualRevenue / s.initialInvestment) * 100, 100)
        return acc
      }, {} as any),
    },
    {
      metric: 'Profit Margin',
      ...scenariosWithResults.reduce((acc, s) => {
        acc[s.name] = Math.min(((s.annualRevenue - s.annualCosts) / s.annualRevenue) * 100, 100)
        return acc
      }, {} as any),
    },
    {
      metric: 'Payback Speed',
      ...scenariosWithResults.reduce((acc, s) => {
        acc[s.name] = Math.max(0, 100 - s.results.paybackPeriod * 10) // Inverse, higher is better
        return acc
      }, {} as any),
    },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
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
              <span className="text-4xl mr-4">📊</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Multi-Scenario Financial Modeling
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Compare different investment scenarios, crops, and strategies side-by-side
                </p>
              </div>
            </div>
            <button
              onClick={addScenario}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              + Add Scenario
            </button>
          </div>

          {/* Scenarios Input Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="border-2 rounded-lg p-6 dark:bg-gray-700"
                style={{ borderColor: scenario.color }}
              >
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    value={scenario.name}
                    onChange={(e) => updateScenario(scenario.id, 'name', e.target.value)}
                    className="text-lg font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1 dark:text-white"
                  />
                  {scenarios.length > 1 && (
                    <button
                      onClick={() => removeScenario(scenario.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Remove scenario"
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

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Crop Type
                    </label>
                    <input
                      type="text"
                      value={scenario.cropType}
                      onChange={(e) => updateScenario(scenario.id, 'cropType', e.target.value)}
                      placeholder="e.g., Dragon Fruit, Moringa"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Initial Investment (ZAR)
                    </label>
                    <input
                      type="number"
                      value={scenario.initialInvestment}
                      onChange={(e) =>
                        updateScenario(scenario.id, 'initialInvestment', parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Annual Revenue (ZAR)
                    </label>
                    <input
                      type="number"
                      value={scenario.annualRevenue}
                      onChange={(e) =>
                        updateScenario(scenario.id, 'annualRevenue', parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Annual Costs (ZAR)
                    </label>
                    <input
                      type="number"
                      value={scenario.annualCosts}
                      onChange={(e) =>
                        updateScenario(scenario.id, 'annualCosts', parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Time Horizon (Years)
                    </label>
                    <input
                      type="number"
                      value={scenario.years}
                      onChange={(e) =>
                        updateScenario(scenario.id, 'years', parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                {/* Quick Results */}
                {scenario.results && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">ROI</div>
                        <div className="font-bold text-green-600 dark:text-green-400">
                          {scenario.results.roi.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Payback</div>
                        <div className="font-bold dark:text-white">
                          {scenario.results.paybackPeriod.toFixed(1)} yrs
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Comparison Charts */}
          {scenarios.length > 1 && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  ROI Comparison
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={roiComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ROI" fill="#10b981" name="ROI %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Net Profit Comparison
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={profitComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}k ZAR`} />
                    <Legend />
                    <Bar dataKey="Net Profit" fill="#3b82f6" name="Net Profit (thousands ZAR)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Overall Performance Comparison
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    {scenariosWithResults.map((scenario) => (
                      <Radar
                        key={scenario.id}
                        name={scenario.name}
                        dataKey={scenario.name}
                        stroke={scenario.color}
                        fill={scenario.color}
                        fillOpacity={0.3}
                      />
                    ))}
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* Detailed Comparison Table */}
          <div className="overflow-x-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Detailed Comparison
            </h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                    Metric
                  </th>
                  {scenariosWithResults.map((scenario) => (
                    <th
                      key={scenario.id}
                      className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center"
                      style={{ color: scenario.color }}
                    >
                      {scenario.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                    Crop Type
                  </td>
                  {scenariosWithResults.map((scenario) => (
                    <td
                      key={scenario.id}
                      className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center dark:text-white"
                    >
                      {scenario.cropType || '-'}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                    Initial Investment
                  </td>
                  {scenariosWithResults.map((scenario) => (
                    <td
                      key={scenario.id}
                      className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center dark:text-white"
                    >
                      {formatCurrency(scenario.initialInvestment)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                    Annual Revenue
                  </td>
                  {scenariosWithResults.map((scenario) => (
                    <td
                      key={scenario.id}
                      className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center dark:text-white"
                    >
                      {formatCurrency(scenario.annualRevenue)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                    Annual Costs
                  </td>
                  {scenariosWithResults.map((scenario) => (
                    <td
                      key={scenario.id}
                      className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center dark:text-white"
                    >
                      {formatCurrency(scenario.annualCosts)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                    Annual Net Profit
                  </td>
                  {scenariosWithResults.map((scenario) => (
                    <td
                      key={scenario.id}
                      className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-bold text-green-600 dark:text-green-400"
                    >
                      {formatCurrency(scenario.results.annualNetProfit)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                    Total Net Profit ({scenariosWithResults[0].years} years)
                  </td>
                  {scenariosWithResults.map((scenario) => (
                    <td
                      key={scenario.id}
                      className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-bold text-green-600 dark:text-green-400"
                    >
                      {formatCurrency(scenario.results.netProfit)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                    ROI
                  </td>
                  {scenariosWithResults.map((scenario) => (
                    <td
                      key={scenario.id}
                      className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-bold text-primary-600 dark:text-primary-400"
                    >
                      {scenario.results.roi.toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                    Payback Period
                  </td>
                  {scenariosWithResults.map((scenario) => (
                    <td
                      key={scenario.id}
                      className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-bold dark:text-white"
                    >
                      {scenario.results.paybackPeriod.toFixed(1)} years
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Best Scenario Recommendation */}
          {scenarios.length > 1 && (
            <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                📊 Recommendation
              </h3>
              <div className="space-y-2">
                {(() => {
                  const bestROI = scenariosWithResults.reduce((prev, current) =>
                    current.results.roi > prev.results.roi ? current : prev
                  )
                  const bestPayback = scenariosWithResults.reduce((prev, current) =>
                    current.results.paybackPeriod < prev.results.paybackPeriod ? current : prev
                  )
                  const bestProfit = scenariosWithResults.reduce((prev, current) =>
                    current.results.netProfit > prev.results.netProfit ? current : prev
                  )

                  return (
                    <>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-bold" style={{ color: bestROI.color }}>
                          {bestROI.name}
                        </span>{' '}
                        has the highest ROI at {bestROI.results.roi.toFixed(1)}%
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-bold" style={{ color: bestPayback.color }}>
                          {bestPayback.name}
                        </span>{' '}
                        has the fastest payback period at{' '}
                        {bestPayback.results.paybackPeriod.toFixed(1)} years
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-bold" style={{ color: bestProfit.color }}>
                          {bestProfit.name}
                        </span>{' '}
                        generates the highest net profit at{' '}
                        {formatCurrency(bestProfit.results.netProfit)}
                      </p>
                    </>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
