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
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface CalculatorResult {
  id: string
  calculator_type: string
  input_data: any
  results: any
  notes?: string
  created_at: string
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function FinancialReportsPage() {
  const [results, setResults] = useState<CalculatorResult[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<string>('30')

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/calculator-results?limit=100')
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

  const filterByDateRange = (results: CalculatorResult[]) => {
    const days = parseInt(dateRange)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    return results.filter((r) => new Date(r.created_at) >= cutoff)
  }

  const getCalculatorTypeDistribution = () => {
    const filtered = filterByDateRange(results)
    const distribution: { [key: string]: number } = {}

    filtered.forEach((r) => {
      distribution[r.calculator_type] = (distribution[r.calculator_type] || 0) + 1
    })

    return Object.entries(distribution).map(([name, value]) => ({
      name: name.replace('-', ' ').toUpperCase(),
      value,
    }))
  }

  const getRoiOverTime = () => {
    const roiResults = filterByDateRange(results.filter((r) => r.calculator_type === 'roi'))
    return roiResults
      .slice(0, 20)
      .reverse()
      .map((r, index) => ({
        date: new Date(r.created_at).toLocaleDateString(),
        roi: r.results.roi || 0,
        netProfit: r.results.netProfit || 0,
      }))
  }

  const getFinancialSummary = () => {
    const filtered = filterByDateRange(results)
    const roiCalcs = filtered.filter((r) => r.calculator_type === 'roi')

    const avgRoi =
      roiCalcs.length > 0
        ? roiCalcs.reduce((sum, r) => sum + (r.results.roi || 0), 0) / roiCalcs.length
        : 0

    const totalInvestment = roiCalcs.reduce(
      (sum, r) => sum + (parseFloat(r.input_data.initialInvestment) || 0),
      0
    )

    const totalNetProfit = roiCalcs.reduce((sum, r) => sum + (r.results.netProfit || 0), 0)

    const avgPayback =
      roiCalcs.length > 0
        ? roiCalcs.reduce((sum, r) => sum + (r.results.paybackPeriod || 0), 0) / roiCalcs.length
        : 0

    return {
      avgRoi,
      totalInvestment,
      totalNetProfit,
      avgPayback,
      totalCalculations: filtered.length,
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

  const exportToPDF = () => {
    const doc = new jsPDF()
    const summary = getFinancialSummary()

    // Title
    doc.setFontSize(20)
    doc.text('Financial Report', 14, 20)

    // Date
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
    doc.text(`Period: Last ${dateRange} days`, 14, 34)

    // Summary
    doc.setFontSize(14)
    doc.text('Executive Summary', 14, 45)

    doc.setFontSize(10)
    const summaryData = [
      ['Total Calculations', summary.totalCalculations.toString()],
      ['Average ROI', `${summary.avgRoi.toFixed(2)}%`],
      ['Total Investment', formatCurrency(summary.totalInvestment)],
      ['Total Net Profit', formatCurrency(summary.totalNetProfit)],
      ['Average Payback Period', `${summary.avgPayback.toFixed(1)} years`],
    ]

    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
    })

    // Calculator Distribution
    const finalY = (doc as any).lastAutoTable.finalY || 90
    doc.text('Calculator Usage Distribution', 14, finalY + 10)

    const distData = getCalculatorTypeDistribution().map((d) => [d.name, d.value.toString()])
    autoTable(doc, {
      startY: finalY + 15,
      head: [['Calculator Type', 'Count']],
      body: distData,
      theme: 'striped',
    })

    // Recent ROI Calculations
    const finalY2 = (doc as any).lastAutoTable.finalY || 140
    if (finalY2 < 250) {
      doc.text('Recent ROI Trends', 14, finalY2 + 10)

      const roiData = getRoiOverTime()
        .slice(0, 10)
        .map((d) => [d.date, `${d.roi.toFixed(2)}%`, formatCurrency(d.netProfit)])

      autoTable(doc, {
        startY: finalY2 + 15,
        head: [['Date', 'ROI %', 'Net Profit']],
        body: roiData,
        theme: 'grid',
      })
    }

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    }

    doc.save(`financial-report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const exportToCSV = () => {
    const filtered = filterByDateRange(results)
    const csvData = [
      ['Date', 'Calculator Type', 'Notes', 'Results'],
      ...filtered.map((r) => [
        new Date(r.created_at).toLocaleString(),
        r.calculator_type,
        r.notes || '',
        JSON.stringify(r.results),
      ]),
    ]

    const csvContent = csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial-data-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const summary = getFinancialSummary()

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
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center">
              <span className="text-4xl mr-4">📈</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
                <p className="text-gray-600">
                  Comprehensive analysis of your farm financial calculations
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToPDF}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                PDF
              </button>
              <button
                onClick={exportToCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                CSV
              </button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
              <option value="10000">All time</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading financial data...</p>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                  <div className="text-sm text-green-700 mb-1">Average ROI</div>
                  <div className="text-3xl font-bold text-green-900">
                    {summary.avgRoi.toFixed(1)}%
                  </div>
                  <div className="text-xs text-green-600 mt-2">Across all ROI calculations</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                  <div className="text-sm text-blue-700 mb-1">Total Investment</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(summary.totalInvestment)}
                  </div>
                  <div className="text-xs text-blue-600 mt-2">Sum of all investments</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                  <div className="text-sm text-purple-700 mb-1">Total Net Profit</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {formatCurrency(summary.totalNetProfit)}
                  </div>
                  <div className="text-xs text-purple-600 mt-2">Projected profit</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
                  <div className="text-sm text-orange-700 mb-1">Calculations</div>
                  <div className="text-3xl font-bold text-orange-900">
                    {summary.totalCalculations}
                  </div>
                  <div className="text-xs text-orange-600 mt-2">Total saved</div>
                </div>
              </div>

              {/* ROI Trend Chart */}
              {getRoiOverTime().length > 0 && (
                <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                  <h2 className="text-xl font-semibold mb-4">ROI Trend Over Time</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getRoiOverTime()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="roi"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="ROI %"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="netProfit"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Net Profit"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Calculator Distribution */}
              {getCalculatorTypeDistribution().length > 0 && (
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Calculator Usage Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getCalculatorTypeDistribution()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => entry.name}
                          outerRadius={80}
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

                  <div className="p-6 bg-gray-50 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Usage by Type</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getCalculatorTypeDistribution()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#10b981" name="Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Summary Stats */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
                <h3 className="font-semibold text-blue-900 mb-3">📊 Report Summary</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>
                    • {summary.totalCalculations} total financial calculations saved in the selected
                    period
                  </li>
                  <li>• Average ROI of {summary.avgRoi.toFixed(1)}% across all investments</li>
                  <li>• Total projected investment: {formatCurrency(summary.totalInvestment)}</li>
                  <li>• Total projected net profit: {formatCurrency(summary.totalNetProfit)}</li>
                  <li>• Average payback period: {summary.avgPayback.toFixed(1)} years</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
