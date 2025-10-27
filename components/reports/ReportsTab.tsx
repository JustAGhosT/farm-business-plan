'use client'

import { Card } from '@/components/Card'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface ReportsTabProps {
  results: any[]
  summary: any
  loading: boolean
  dateRange: string
  setDateRange: (range: string) => void
  exportToPDF: () => void
  exportToCSV: () => void
}

export default function ReportsTab({
  results,
  summary,
  loading,
  dateRange,
  setDateRange,
  exportToPDF,
  exportToCSV,
}: ReportsTabProps) {
  // Safe defaults to prevent runtime errors
  const safeResults = results || []
  const safeSummary = summary || {
    totalInvestment: 0,
    totalRevenue: 0,
    netProfit: 0,
    avgROI: 0,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Loading financial data...</p>
      </div>
    )
  }

  return (
    <>
      {/* Date Range Filter */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          aria-label="Select time period"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="text-sm text-green-700 mb-1">Average ROI</div>
          <div className="text-3xl font-bold text-green-900">
            {safeSummary.avgRoi?.toFixed(1) || '0.0'}%
          </div>
          <div className="text-xs text-green-600 mt-2">Across all ROI calculations</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="text-sm text-blue-700 mb-1">Total Investment</div>
          <div className="text-2xl font-bold text-blue-900">
            {formatCurrency(safeSummary.totalInvestment || 0)}
          </div>
          <div className="text-xs text-blue-600 mt-2">Projected capital requirements</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="text-sm text-purple-700 mb-1">Net Profit</div>
          <div className="text-2xl font-bold text-purple-900">
            {formatCurrency(safeSummary.totalNetProfit || 0)}
          </div>
          <div className="text-xs text-purple-600 mt-2">Expected returns</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="text-sm text-orange-700 mb-1">Payback Period</div>
          <div className="text-2xl font-bold text-orange-900">
            {safeSummary.avgPayback?.toFixed(1) || '0.0'} years
          </div>
          <div className="text-xs text-orange-600 mt-2">Average recovery time</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* ROI Distribution */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">ROI Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={safeResults.map((r) => ({ name: r.calculator_type, value: r.roi || 0 }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {safeResults.map((entry, index) => (
                  <Pie key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Investment vs Revenue */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Investment vs Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={results}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="calculator_type" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="initial_investment" fill="#8884d8" name="Investment" />
              <Bar dataKey="total_revenue" fill="#82ca9d" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Calculations */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Recent Calculations</h3>
        <div className="space-y-4">
          {safeResults.slice(0, 5).map((result, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{result.calculator_type}</h4>
                  <p className="text-sm text-gray-600">
                    Created: {new Date(result.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    {result.roi ? `${result.roi.toFixed(1)}% ROI` : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {result.initial_investment ? formatCurrency(result.initial_investment) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Summary Insights */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <ul className="space-y-2 text-sm text-blue-800">
            <li>
              • Average ROI of {safeSummary.avgRoi?.toFixed(1) || '0.0'}% across all investments
            </li>
            <li>
              • Total projected investment: {formatCurrency(safeSummary.totalInvestment || 0)}
            </li>
            <li>• Total projected net profit: {formatCurrency(safeSummary.totalNetProfit || 0)}</li>
            <li>• Average payback period: {safeSummary.avgPayback?.toFixed(1) || '0.0'} years</li>
          </ul>
        </div>
      </Card>
    </>
  )
}
