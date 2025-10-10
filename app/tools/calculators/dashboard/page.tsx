'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface FinancialMetrics {
  totalInvestment: number
  totalRevenue: number
  totalProfit: number
  averageROI: number
  calculationCount: number
  recentCalculations: any[]
}

export default function FinancialDashboard() {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30') // days

  useEffect(() => {
    fetchMetrics()
  }, [timeRange])

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/calculator-results?limit=100`)
      const data = await response.json()

      if (data.success) {
        const calculations = data.data

        // Calculate metrics
        const totalInvestment = calculations.reduce(
          (sum: number, calc: any) =>
            sum + (calc.input_data?.initialInvestment || calc.input_data?.principal || 0),
          0
        )

        const totalRevenue = calculations.reduce((sum: number, calc: any) => {
          const revenue =
            calc.results?.totalRevenue ||
            calc.results?.revenue ||
            calc.input_data?.annualRevenue ||
            0
          return sum + revenue
        }, 0)

        const totalProfit = calculations.reduce(
          (sum: number, calc: any) => sum + (calc.results?.netProfit || calc.results?.profit || 0),
          0
        )

        const roiCalculations = calculations.filter((c: any) => c.results?.roi !== undefined)
        const averageROI =
          roiCalculations.length > 0
            ? roiCalculations.reduce((sum: number, c: any) => sum + c.results.roi, 0) /
              roiCalculations.length
            : 0

        setMetrics({
          totalInvestment,
          totalRevenue,
          totalProfit,
          averageROI,
          calculationCount: calculations.length,
          recentCalculations: calculations.slice(0, 10),
        })
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getCalculatorTypeDistribution = () => {
    if (!metrics) return []

    const distribution: { [key: string]: number } = {}
    metrics.recentCalculations.forEach((calc) => {
      distribution[calc.calculator_type] = (distribution[calc.calculator_type] || 0) + 1
    })

    return Object.entries(distribution).map(([name, value]) => ({ name, value }))
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Financial Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Overview of your farm financial metrics and calculations
            </p>
          </div>
          <Link
            href="/tools/calculators"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Calculators
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading metrics...</p>
          </div>
        ) : !metrics || metrics.calculationCount === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No financial data yet. Start by running some calculations.
            </p>
            <Link
              href="/tools/calculators"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go to Calculators
            </Link>
          </div>
        ) : (
          <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Investment
                  </h3>
                  <span className="text-2xl">💰</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(metrics.totalInvestment)}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Projected Revenue
                  </h3>
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Expected Profit
                  </h3>
                  <span className="text-2xl">💵</span>
                </div>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(metrics.totalProfit)}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Average ROI
                  </h3>
                  <span className="text-2xl">📈</span>
                </div>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {metrics.averageROI.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Calculator Type Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Calculator Usage
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getCalculatorTypeDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getCalculatorTypeDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* ROI Trend */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  ROI Trend (Recent Calculations)
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={metrics.recentCalculations
                      .filter((c) => c.results?.roi)
                      .slice(0, 10)
                      .reverse()
                      .map((c, i) => ({
                        name: `#${i + 1}`,
                        roi: c.results.roi,
                      }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="roi"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="ROI %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Calculations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Calculations
                </h2>
                <Link
                  href="/tools/calculators/history"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {metrics.recentCalculations.slice(0, 5).map((calc) => (
                  <div
                    key={calc.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-primary-600 rounded mr-2">
                        {calc.calculator_type.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(calc.created_at).toLocaleDateString()}
                      </span>
                      {calc.notes && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 italic">
                          {calc.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {calc.results?.roi !== undefined && (
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {calc.results.roi.toFixed(1)}% ROI
                        </p>
                      )}
                      {calc.results?.netProfit !== undefined && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(calc.results.netProfit)} profit
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/tools/calculators/roi"
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <span className="text-4xl mb-2 block">📈</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Calculate ROI
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Analyze return on investment for new projects
                </p>
              </Link>

              <Link
                href="/tools/calculators/break-even"
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <span className="text-4xl mb-2 block">⚖️</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Break-Even Analysis
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Determine when you&apos;ll break even on costs
                </p>
              </Link>

              <Link
                href="/tools/calculators/history"
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <span className="text-4xl mb-2 block">📊</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  View History
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Compare and export past calculations
                </p>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
