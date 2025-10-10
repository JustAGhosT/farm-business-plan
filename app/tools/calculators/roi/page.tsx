'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ROICalculator() {
  const [values, setValues] = useState({
    initialInvestment: '',
    annualRevenue: '',
    annualCosts: '',
    years: '5',
  })

  const [results, setResults] = useState<{
    roi: number
    netProfit: number
    annualNetProfit: number
    paybackPeriod: number
  } | null>(null)

  const [savedMessage, setSavedMessage] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const calculateROI = () => {
    const investment = parseFloat(values.initialInvestment) || 0
    const revenue = parseFloat(values.annualRevenue) || 0
    const costs = parseFloat(values.annualCosts) || 0
    const years = parseFloat(values.years) || 1

    const annualNetProfit = revenue - costs
    const totalNetProfit = annualNetProfit * years
    const roi = investment > 0 ? ((totalNetProfit - investment) / investment) * 100 : 0
    const paybackPeriod = annualNetProfit > 0 ? investment / annualNetProfit : 0

    setResults({
      roi,
      netProfit: totalNetProfit,
      annualNetProfit,
      paybackPeriod,
    })
  }

  useEffect(() => {
    if (values.initialInvestment && values.annualRevenue && values.annualCosts) {
      calculateROI()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleSaveCalculation = async () => {
    if (!results) return

    setIsSaving(true)
    setSavedMessage('')

    try {
      const response = await fetch('/api/calculator-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calculator_type: 'roi',
          input_data: values,
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
          <div className="flex items-center mb-6">
            <span className="text-4xl mr-4">📈</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ROI Calculator</h1>
              <p className="text-gray-600">
                Calculate Return on Investment for your farm operation
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Input Values</h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="initialInvestment"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Initial Investment (ZAR) *
                  </label>
                  <input
                    type="number"
                    id="initialInvestment"
                    name="initialInvestment"
                    value={values.initialInvestment}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 150000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Total startup costs and capital investment
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="annualRevenue"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Annual Revenue (ZAR) *
                  </label>
                  <input
                    type="number"
                    id="annualRevenue"
                    name="annualRevenue"
                    value={values.annualRevenue}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 250000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Expected yearly sales revenue</p>
                </div>

                <div>
                  <label
                    htmlFor="annualCosts"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Annual Operating Costs (ZAR) *
                  </label>
                  <input
                    type="number"
                    id="annualCosts"
                    name="annualCosts"
                    value={values.annualCosts}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 120000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Yearly operating expenses (labor, inputs, utilities, etc.)
                  </p>
                </div>

                <div>
                  <label htmlFor="years" className="block text-sm font-medium text-gray-700 mb-2">
                    Time Period (Years)
                  </label>
                  <input
                    type="number"
                    id="years"
                    name="years"
                    value={values.years}
                    onChange={handleChange}
                    min="1"
                    max="20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of years for ROI calculation</p>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Results</h2>

              {results ? (
                <div className="space-y-4">
                  <div className="bg-primary-50 rounded-lg p-4 border-2 border-primary-200">
                    <div className="text-sm text-gray-600 mb-1">Return on Investment (ROI)</div>
                    <div
                      className={`text-3xl font-bold ${results.roi > 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {results.roi.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {results.roi > 0 ? 'Positive return' : 'Negative return'} over {values.years}{' '}
                      years
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Annual Net Profit</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(results.annualNetProfit)}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">
                      Total Net Profit ({values.years} years)
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(results.netProfit)}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Payback Period</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {results.paybackPeriod > 0
                        ? `${results.paybackPeriod.toFixed(1)} years`
                        : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Time to recover initial investment
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
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

                  {/* Save Calculation Section */}
                  <div className="mt-6 border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Save This Calculation</h3>
                    <div className="space-y-3">
                      <div>
                        <label
                          htmlFor="notes"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
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
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
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
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <p>Enter your values to see ROI calculations</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold text-yellow-900 mb-2">
              💡 Tips for Accurate ROI Calculation
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
              <li>
                Include all startup costs: land prep, infrastructure, equipment, initial inputs
              </li>
              <li>Be conservative with revenue estimates - factor in yield variability</li>
              <li>Account for all operating costs including labor, utilities, maintenance</li>
              <li>Consider seasonal variations and market price fluctuations</li>
              <li>Review and update your calculations regularly with actual data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
