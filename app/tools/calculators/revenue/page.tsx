'use client'

import { useState } from 'react'
import Link from 'next/link'

interface YearProjection {
  year: number
  production: string
  price: string
  revenue: number
}

export default function RevenueCalculator() {
  const [cropName, setCropName] = useState('')
  const [baseProduction, setBaseProduction] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [growthRate, setGrowthRate] = useState('10')
  const [priceInflation, setPriceInflation] = useState('5')
  const [years, setYears] = useState('5')

  const calculateProjections = (): YearProjection[] => {
    const projections: YearProjection[] = []
    const base = parseFloat(baseProduction) || 0
    const price = parseFloat(basePrice) || 0
    const growth = parseFloat(growthRate) / 100
    const inflation = parseFloat(priceInflation) / 100
    const numYears = parseInt(years) || 5

    for (let year = 1; year <= numYears; year++) {
      const production = base * Math.pow(1 + growth, year - 1)
      const yearPrice = price * Math.pow(1 + inflation, year - 1)
      const revenue = production * yearPrice

      projections.push({
        year,
        production: production.toFixed(0),
        price: yearPrice.toFixed(2),
        revenue
      })
    }

    return projections
  }

  const projections = calculateProjections()
  const totalRevenue = projections.reduce((sum, p) => sum + p.revenue, 0)

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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
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
            <span className="text-4xl mr-4">📊</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Revenue Projections</h1>
              <p className="text-gray-600">Project revenue based on yield and market prices</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Input Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Input Parameters</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="cropName" className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Name
                  </label>
                  <input
                    type="text"
                    id="cropName"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Dragon Fruit"
                  />
                </div>

                <div>
                  <label htmlFor="baseProduction" className="block text-sm font-medium text-gray-700 mb-2">
                    Year 1 Production (kg/units) *
                  </label>
                  <input
                    type="number"
                    id="baseProduction"
                    value={baseProduction}
                    onChange={(e) => setBaseProduction(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 5000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Expected production in first year</p>
                </div>

                <div>
                  <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Year 1 Price per Unit (ZAR) *
                  </label>
                  <input
                    type="number"
                    id="basePrice"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 45.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Current market price per kg/unit</p>
                </div>

                <div>
                  <label htmlFor="growthRate" className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Production Growth (%)
                  </label>
                  <input
                    type="number"
                    id="growthRate"
                    value={growthRate}
                    onChange={(e) => setGrowthRate(e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Expected annual increase in production</p>
                </div>

                <div>
                  <label htmlFor="priceInflation" className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Price Increase (%)
                  </label>
                  <input
                    type="number"
                    id="priceInflation"
                    value={priceInflation}
                    onChange={(e) => setPriceInflation(e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Expected annual price growth (inflation)</p>
                </div>

                <div>
                  <label htmlFor="years" className="block text-sm font-medium text-gray-700 mb-2">
                    Projection Period (Years)
                  </label>
                  <input
                    type="number"
                    id="years"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    min="1"
                    max="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Revenue Summary</h2>
              
              {baseProduction && basePrice ? (
                <div className="space-y-4">
                  <div className="bg-primary-50 rounded-lg p-4 border-2 border-primary-200">
                    <div className="text-sm text-gray-600 mb-1">Total {years}-Year Revenue</div>
                    <div className="text-3xl font-bold text-primary-700">
                      {formatCurrency(totalRevenue)}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Average Annual Revenue</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(totalRevenue / projections.length)}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Year 1 Revenue</div>
                    <div className="text-xl font-bold text-gray-900">
                      {projections[0] ? formatCurrency(projections[0].revenue) : 'N/A'}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Final Year Revenue</div>
                    <div className="text-xl font-bold text-gray-900">
                      {projections[projections.length - 1] ? formatCurrency(projections[projections.length - 1].revenue) : 'N/A'}
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Growth Trajectory:</strong> Your revenue is projected to {
                        projections.length > 1 && projections[projections.length - 1].revenue > projections[0].revenue * 1.5 
                          ? 'increase significantly over the period.' 
                          : 'grow steadily over the period.'
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>Enter production and price to see projections</p>
                </div>
              )}
            </div>
          </div>

          {/* Projection Table */}
          {projections.length > 0 && baseProduction && basePrice && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Year-by-Year Projections</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead className="bg-primary-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Year</th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Production (units)</th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Price per Unit</th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Revenue</th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projections.map((proj, index) => {
                      const growth = index > 0 
                        ? ((proj.revenue - projections[index - 1].revenue) / projections[index - 1].revenue) * 100 
                        : 0
                      return (
                        <tr key={proj.year} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-medium">{proj.year}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">{parseInt(proj.production).toLocaleString()}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">R {parseFloat(proj.price).toFixed(2)}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-semibold">{formatCurrency(proj.revenue)}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {index > 0 ? (
                              <span className={growth > 0 ? 'text-green-600' : 'text-red-600'}>
                                {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                              </span>
                            ) : '-'}
                          </td>
                        </tr>
                      )
                    })}
                    <tr className="bg-gray-100 font-bold">
                      <td className="border border-gray-300 px-4 py-2" colSpan={3}>Total</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(totalRevenue)}</td>
                      <td className="border border-gray-300 px-4 py-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold text-yellow-900 mb-2">💡 Tips for Revenue Projections</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
              <li>Be conservative with growth rates - use realistic estimates</li>
              <li>Consider crop maturity periods - many crops take years to reach full production</li>
              <li>Factor in market price volatility and seasonal variations</li>
              <li>Include multiple scenarios (optimistic, base, pessimistic)</li>
              <li>Update projections regularly based on actual performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
