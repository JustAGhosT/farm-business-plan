'use client'

import HistoryTab from '@/components/reports/HistoryTab'
import ReportsHeader from '@/components/reports/ReportsHeader'
import ReportsTab from '@/components/reports/ReportsTab'
import { jsPDF } from 'jspdf'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

export default function ReportsPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'reports' | 'history'>('reports')
  const [dateRange, setDateRange] = useState('30')
  const [filter, setFilter] = useState('')
  const [selectedResults, setSelectedResults] = useState<any[]>([])
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/calculator-results?filter=${encodeURIComponent(filter)}`)
      if (!response.ok) throw new Error('Failed to fetch results')
      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  // Fetch on mount and when filter changes (for history tab)
  useEffect(() => {
    fetchResults()
    if (activeTab === 'history') {
      setSelectedResults([]) // Clear selections when filter changes
    }
  }, [filter, fetchResults, activeTab])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    setNotification(null)

    try {
      const response = await fetch(`/api/calculator-results/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete result')
      }

      setResults(results.filter((r) => r.id !== id))
      setSelectedResults(selectedResults.filter((r) => r.id !== id))
      setNotification({ type: 'success', message: 'Calculation deleted successfully' })

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error('Error deleting result:', error)
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete calculation',
      })

      // Clear error notification after 5 seconds
      setTimeout(() => setNotification(null), 5000)
    } finally {
      setDeletingId(null)
    }
  }

  const exportToPDF = (selectedResults?: any[]) => {
    const resultsToExport = selectedResults || results
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text('Farm Financial Reports', 20, 20)

    doc.setFontSize(12)
    let y = 40

    resultsToExport.forEach((result, index) => {
      if (y > 280) {
        doc.addPage()
        y = 20
      }

      doc.text(`${index + 1}. ${result.calculator_type}`, 20, y)
      y += 10

      if (Number.isFinite(result.roi)) {
        doc.text(`ROI: ${result.roi.toFixed(1)}%`, 30, y)
        y += 7
      }

      if (Number.isFinite(result.initial_investment)) {
        doc.text(`Investment: R${result.initial_investment.toLocaleString()}`, 30, y)
        y += 7
      }

      if (Number.isFinite(result.total_revenue)) {
        doc.text(`Revenue: R${result.total_revenue.toLocaleString()}`, 30, y)
        y += 7
      }

      y += 10
    })

    doc.save('farm-financial-reports.pdf')
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Calculator Type', 'ROI (%)', 'Investment', 'Revenue', 'Net Profit', 'Created Date'],
      ...results.map((result) => [
        result.calculator_type,
        result.roi?.toFixed(1) || '',
        result.initial_investment || '',
        result.total_revenue || '',
        result.net_profit || '',
        new Date(result.created_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'farm-financial-reports.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const summary = {
    avgRoi: results.reduce((sum, r) => sum + (r.roi || 0), 0) / results.length || 0,
    totalInvestment: results.reduce((sum, r) => sum + (r.initial_investment || 0), 0),
    totalNetProfit: results.reduce((sum, r) => sum + (r.net_profit || 0), 0),
    avgPayback: results.reduce((sum, r) => sum + (r.payback_period || 0), 0) / results.length || 0,
  }

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
          <ReportsHeader exportToPDF={exportToPDF} exportToCSV={exportToCSV} />

          {/* Notification */}
          {notification && (
            <div
              className={`mb-4 p-4 rounded-lg border ${
                notification.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-center">
                <span className="mr-2">{notification.type === 'success' ? '✅' : '❌'}</span>
                {notification.message}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6" role="tablist">
            <button
              onClick={() => setActiveTab('reports')}
              role="tab"
              aria-selected={activeTab === 'reports'}
              aria-controls="reports-panel"
              tabIndex={activeTab === 'reports' ? 0 : -1}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Reports & Analytics
            </button>
            <button
              onClick={() => setActiveTab('history')}
              role="tab"
              aria-selected={activeTab === 'history'}
              aria-controls="history-panel"
              tabIndex={activeTab === 'history' ? 0 : -1}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 Calculation History
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'reports' && (
            <div role="tabpanel" id="reports-panel" aria-labelledby="reports-tab">
              <ReportsTab
                results={results}
                summary={summary}
                loading={loading}
                dateRange={dateRange}
                setDateRange={setDateRange}
                exportToPDF={exportToPDF}
                exportToCSV={exportToCSV}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div role="tabpanel" id="history-panel" aria-labelledby="history-tab">
              <HistoryTab
                results={results}
                filter={filter}
                setFilter={setFilter}
                selectedResults={selectedResults}
                setSelectedResults={setSelectedResults}
                handleDelete={handleDelete}
                deletingId={deletingId}
                exportToPDF={exportToPDF}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
