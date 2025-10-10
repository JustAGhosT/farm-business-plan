'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface CalculatorResult {
  id: string
  calculator_type: string
  input_data: any
  results: any
  notes?: string
  created_at: string
  farm_plan_name?: string
  crop_name?: string
}

export default function CalculatorHistoryPage() {
  const [results, setResults] = useState<CalculatorResult[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedResults, setSelectedResults] = useState<string[]>([])

  useEffect(() => {
    fetchResults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const url =
        filter === 'all'
          ? '/api/calculator-results?limit=50'
          : `/api/calculator-results?calculator_type=${filter}&limit=50`

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setResults(data.data)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this calculation?')) return

    try {
      const response = await fetch(`/api/calculator-results?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchResults()
      }
    } catch (error) {
      console.error('Error deleting result:', error)
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedResults((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const getComparisonData = () => {
    const selected = results.filter((r) => selectedResults.includes(r.id))
    return selected.map((r, index) => ({
      name: `Calc ${index + 1}`,
      date: new Date(r.created_at).toLocaleDateString(),
      roi: r.results.roi || 0,
      netProfit: r.results.netProfit || r.results.profit || 0,
      payback: r.results.paybackPeriod || 0,
    }))
  }

  const getRoiTrendData = () => {
    const roiResults = results.filter((r) => r.calculator_type === 'roi')
    return roiResults
      .slice(0, 10)
      .reverse()
      .map((r, index) => ({
        name: `${index + 1}`,
        date: new Date(r.created_at).toLocaleDateString(),
        roi: r.results.roi || 0,
      }))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const calculatorTypes = [
    { value: 'all', label: 'All Calculators' },
    { value: 'roi', label: 'ROI' },
    { value: 'break-even', label: 'Break-Even' },
    { value: 'investment', label: 'Investment' },
    { value: 'loan', label: 'Loan' },
    { value: 'operating-costs', label: 'Operating Costs' },
    { value: 'revenue', label: 'Revenue' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <span className="text-4xl mr-4">📊</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Calculator History</h1>
                <p className="text-gray-600">View, compare, and analyze your saved calculations</p>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Calculator Type
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {calculatorTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* ROI Trend Chart */}
          {filter === 'roi' && getRoiTrendData().length > 0 && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">ROI Trend Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getRoiTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
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
          )}

          {/* Comparison Chart */}
          {selectedResults.length > 1 && (
            <div className="mb-8 p-6 bg-blue-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">
                Comparison View ({selectedResults.length} selected)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getComparisonData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="roi" fill="#10b981" name="ROI %" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-gray-600">
                Select 2 or more calculations below to compare their results
              </div>
            </div>
          )}

          {/* Results List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading calculations...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-600">No saved calculations yet</p>
              <Link
                href="/tools/calculators"
                className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Go to Calculators →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                          checked={selectedResults.includes(result.id)}
                          onChange={() => toggleSelection(result.id)}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-primary-600 rounded-full">
                          {result.calculator_type.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(result.created_at).toLocaleString()}
                        </span>
                      </div>

                      {result.notes && (
                        <p className="text-sm text-gray-700 mb-2 italic">
                          &ldquo;{result.notes}&rdquo;
                        </p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                        {result.calculator_type === 'roi' && (
                          <>
                            <div>
                              <div className="text-xs text-gray-500">ROI</div>
                              <div className="font-semibold text-green-600">
                                {result.results.roi?.toFixed(2)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Net Profit</div>
                              <div className="font-semibold">
                                {formatCurrency(result.results.netProfit || 0)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Payback Period</div>
                              <div className="font-semibold">
                                {result.results.paybackPeriod?.toFixed(1)} years
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Investment</div>
                              <div className="font-semibold">
                                {formatCurrency(result.input_data.initialInvestment || 0)}
                              </div>
                            </div>
                          </>
                        )}
                        {result.calculator_type !== 'roi' && (
                          <div className="col-span-4">
                            <div className="text-xs text-gray-500 mb-1">Results:</div>
                            <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                              {JSON.stringify(result.results, null, 2).substring(0, 200)}...
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(result.id)}
                      className="ml-4 text-red-600 hover:text-red-700 p-2"
                      title="Delete"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
