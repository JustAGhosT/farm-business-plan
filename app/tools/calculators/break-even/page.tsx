'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function BreakEvenCalculator() {
  const [values, setValues] = useState({
    fixedCosts: '',
    variableCostPerUnit: '',
    pricePerUnit: '',
  })

  const [results, setResults] = useState<{
    breakEvenUnits: number
    breakEvenRevenue: number
    contributionMargin: number
    contributionMarginRatio: number
  } | null>(null)

  const calculateBreakEven = () => {
    const fixed = parseFloat(values.fixedCosts) || 0
    const variable = parseFloat(values.variableCostPerUnit) || 0
    const price = parseFloat(values.pricePerUnit) || 0

    if (price <= variable) {
      setResults(null)
      return
    }

    const contributionMargin = price - variable
    const contributionMarginRatio = (contributionMargin / price) * 100
    const breakEvenUnits = fixed / contributionMargin
    const breakEvenRevenue = breakEvenUnits * price

    setResults({
      breakEvenUnits,
      breakEvenRevenue,
      contributionMargin,
      contributionMarginRatio
    })
  }

  useEffect(() => {
    if (values.fixedCosts && values.variableCostPerUnit && values.pricePerUnit) {
      calculateBreakEven()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link 
          href="/tools/calculators" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Calculators
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <span className="text-4xl mr-4">⚖️</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Break-Even Analysis</h1>
              <p className="text-gray-600">Determine your break-even point for production and sales</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Input Values</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="fixedCosts" className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Fixed Costs (ZAR) *
                  </label>
                  <input
                    type="number"
                    id="fixedCosts"
                    name="fixedCosts"
                    value={values.fixedCosts}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 100000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Total annual fixed costs (rent, salaries, insurance, etc.)</p>
                </div>

                <div>
                  <label htmlFor="variableCostPerUnit" className="block text-sm font-medium text-gray-700 mb-2">
                    Variable Cost per Unit (ZAR) *
                  </label>
                  <input
                    type="number"
                    id="variableCostPerUnit"
                    name="variableCostPerUnit"
                    value={values.variableCostPerUnit}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 25.50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Cost per kg/unit (materials, packaging, labor per unit)</p>
                </div>

                <div>
                  <label htmlFor="pricePerUnit" className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price per Unit (ZAR) *
                  </label>
                  <input
                    type="number"
                    id="pricePerUnit"
                    name="pricePerUnit"
                    value={values.pricePerUnit}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 50.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Price you charge per kg/unit to customers</p>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              
              {results ? (
                <div className="space-y-4">
                  <div className="bg-primary-50 rounded-lg p-4 border-2 border-primary-200">
                    <div className="text-sm text-gray-600 mb-1">Break-Even Units</div>
                    <div className="text-3xl font-bold text-primary-700">
                      {results.breakEvenUnits.toFixed(0)} units
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Units needed to cover all costs
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Break-Even Revenue</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(results.breakEvenRevenue)}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Contribution Margin</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(results.contributionMargin)} per unit
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {results.contributionMarginRatio.toFixed(1)}% margin ratio
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Interpretation:</strong> {
                        results.contributionMarginRatio > 50 
                          ? 'Excellent margin! You have strong pricing power.' 
                          : results.contributionMarginRatio > 30 
                          ? 'Good margin. Consider ways to reduce costs or increase prices.' 
                          : 'Low margin. Review pricing strategy and cost structure.'
                      }
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">What This Means</h3>
                    <p className="text-sm text-green-800">
                      You need to sell at least <strong>{results.breakEvenUnits.toFixed(0)} units</strong> to cover all your costs. 
                      Every unit sold beyond this point contributes <strong>{formatCurrency(results.contributionMargin)}</strong> to profit.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p>Enter your values to see break-even analysis</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold text-yellow-900 mb-2">💡 Tips for Break-Even Analysis</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
              <li>Include all fixed costs: rent, utilities, insurance, salaries</li>
              <li>Variable costs should only include costs that change with production</li>
              <li>Consider seasonal price variations in your selling price</li>
              <li>Calculate break-even for different pricing scenarios</li>
              <li>Monitor your actual sales against break-even targets monthly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
