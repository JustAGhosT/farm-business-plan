'use client'

import { Card } from '@/components/Card'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface HistoryTabProps {
  results: any[]
  filter: string
  setFilter: (filter: string) => void
  selectedResults: any[]
  setSelectedResults: (results: any[]) => void
  handleDelete: (id: string) => void
  deletingId: string | null
  exportToPDF: (selectedResults?: any[]) => void
}

export default function HistoryTab({
  results,
  filter,
  setFilter,
  selectedResults,
  setSelectedResults,
  handleDelete,
  deletingId,
  exportToPDF,
}: HistoryTabProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount)
  }

  const toggleSelection = (result: any) => {
    if (selectedResults.find((r) => r.id === result.id)) {
      setSelectedResults(selectedResults.filter((r) => r.id !== result.id))
    } else {
      setSelectedResults([...selectedResults, result])
    }
  }

  const getComparisonData = () => {
    if (selectedResults.length < 2) return []

    return selectedResults.map((result) => ({
      name: result.calculator_type,
      roi: result.roi || 0,
      investment: result.initial_investment || 0,
      revenue: result.total_revenue || 0,
    }))
  }

  const filteredResults = filter ? results.filter((r) => r.calculator_type === filter) : results

  return (
    <>
      {/* Filter Controls */}
      <div className="mb-8 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Calculator
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            aria-label="Filter by calculator type"
          >
            <option value="">All Calculators</option>
            <option value="roi">ROI Calculator</option>
            <option value="break-even">Break-Even Analysis</option>
            <option value="investment">Investment Calculator</option>
            <option value="revenue">Revenue Projections</option>
            <option value="operating-costs">Operating Costs</option>
            <option value="loan">Loan Calculator</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportToPDF(selectedResults)}
            disabled={selectedResults.length === 0}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Export Selected ({selectedResults.length})
          </button>
          <button
            onClick={() => setSelectedResults([])}
            disabled={selectedResults.length === 0}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Comparison Chart */}
      {selectedResults.length >= 2 && (
        <Card className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Comparison Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getComparisonData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="investment" fill="#8884d8" name="Investment" />
              <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Results List */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Calculation History</h3>
        <div className="space-y-4">
          {filteredResults.map((result) => (
            <div key={result.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedResults.find((r) => r.id === result.id) !== undefined}
                    onChange={() => toggleSelection(result)}
                    className="mt-1"
                    aria-label={`Select ${result.calculator_type} calculation`}
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">
                      {result.calculator_type.replaceAll('-', ' ')} Calculator
                    </h4>
                    <p className="text-sm text-gray-600">
                      Created: {new Date(result.created_at).toLocaleDateString()}
                    </p>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {result.roi != null && (
                        <div>
                          <span className="text-gray-500">ROI:</span>
                          <span className="ml-1 font-medium text-green-600">
                            {result.roi.toFixed(1)}%
                          </span>
                        </div>
                      )}
                      {result.initial_investment != null && (
                        <div>
                          <span className="text-gray-500">Investment:</span>
                          <span className="ml-1 font-medium">
                            {formatCurrency(result.initial_investment)}
                          </span>
                        </div>
                      )}
                      {result.total_revenue != null && (
                        <div>
                          <span className="text-gray-500">Revenue:</span>
                          <span className="ml-1 font-medium">
                            {formatCurrency(result.total_revenue)}
                          </span>
                        </div>
                      )}
                      {result.net_profit != null && (
                        <div>
                          <span className="text-gray-500">Net Profit:</span>
                          <span className="ml-1 font-medium text-green-600">
                            {formatCurrency(result.net_profit)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(result.id)}
                  disabled={deletingId === result.id}
                  className={`transition-colors ${
                    deletingId === result.id
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-red-600 hover:text-red-800'
                  }`}
                >
                  {deletingId === result.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
