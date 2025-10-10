'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function OperatingCostsCalculator() {
  const [fixedCosts, setFixedCosts] = useState({
    utilities: '',
    labor: '',
    maintenance: '',
    insurance: '',
    rent: '',
    other: '',
  })

  const [variableCosts, setVariableCosts] = useState({
    seeds: '',
    fertilizer: '',
    pesticides: '',
    packaging: '',
    fuel: '',
    other: '',
  })

  const handleFixedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFixedCosts({
      ...fixedCosts,
      [e.target.name]: e.target.value,
    })
  }

  const handleVariableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVariableCosts({
      ...variableCosts,
      [e.target.name]: e.target.value,
    })
  }

  const totalFixed = Object.values(fixedCosts).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
  const totalVariable = Object.values(variableCosts).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  )
  const totalMonthly = totalFixed + totalVariable
  const totalAnnual = totalMonthly * 12

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
            <span className="text-4xl mr-4">💸</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Operating Costs Calculator</h1>
              <p className="text-gray-600">Calculate monthly and annual operating expenses</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Fixed Costs */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Fixed Costs (Monthly)</h2>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="utilities"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Utilities (ZAR)
                  </label>
                  <input
                    type="number"
                    id="utilities"
                    name="utilities"
                    value={fixedCosts.utilities}
                    onChange={handleFixedChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 2000"
                  />
                </div>

                <div>
                  <label htmlFor="labor" className="block text-sm font-medium text-gray-700 mb-1">
                    Labor (ZAR)
                  </label>
                  <input
                    type="number"
                    id="labor"
                    name="labor"
                    value={fixedCosts.labor}
                    onChange={handleFixedChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 15000"
                  />
                </div>

                <div>
                  <label
                    htmlFor="maintenance"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Maintenance (ZAR)
                  </label>
                  <input
                    type="number"
                    id="maintenance"
                    name="maintenance"
                    value={fixedCosts.maintenance}
                    onChange={handleFixedChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 3000"
                  />
                </div>

                <div>
                  <label
                    htmlFor="insurance"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Insurance (ZAR)
                  </label>
                  <input
                    type="number"
                    id="insurance"
                    name="insurance"
                    value={fixedCosts.insurance}
                    onChange={handleFixedChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 1500"
                  />
                </div>

                <div>
                  <label htmlFor="rent" className="block text-sm font-medium text-gray-700 mb-1">
                    Rent/Lease (ZAR)
                  </label>
                  <input
                    type="number"
                    id="rent"
                    name="rent"
                    value={fixedCosts.rent}
                    onChange={handleFixedChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 5000"
                  />
                </div>

                <div>
                  <label
                    htmlFor="fixedOther"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Other Fixed (ZAR)
                  </label>
                  <input
                    type="number"
                    id="fixedOther"
                    name="other"
                    value={fixedCosts.other}
                    onChange={handleFixedChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 1000"
                  />
                </div>

                <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                  <div className="text-xs text-gray-600 mb-1">Total Fixed Costs</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(totalFixed)}/mo
                  </div>
                </div>
              </div>
            </div>

            {/* Variable Costs */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Variable Costs (Monthly)</h2>

              <div className="space-y-3">
                <div>
                  <label htmlFor="seeds" className="block text-sm font-medium text-gray-700 mb-1">
                    Seeds/Plants (ZAR)
                  </label>
                  <input
                    type="number"
                    id="seeds"
                    name="seeds"
                    value={variableCosts.seeds}
                    onChange={handleVariableChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 3000"
                  />
                </div>

                <div>
                  <label
                    htmlFor="fertilizer"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Fertilizer (ZAR)
                  </label>
                  <input
                    type="number"
                    id="fertilizer"
                    name="fertilizer"
                    value={variableCosts.fertilizer}
                    onChange={handleVariableChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 4000"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pesticides"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Pesticides (ZAR)
                  </label>
                  <input
                    type="number"
                    id="pesticides"
                    name="pesticides"
                    value={variableCosts.pesticides}
                    onChange={handleVariableChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 2000"
                  />
                </div>

                <div>
                  <label
                    htmlFor="packaging"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Packaging (ZAR)
                  </label>
                  <input
                    type="number"
                    id="packaging"
                    name="packaging"
                    value={variableCosts.packaging}
                    onChange={handleVariableChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 1500"
                  />
                </div>

                <div>
                  <label htmlFor="fuel" className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel/Transport (ZAR)
                  </label>
                  <input
                    type="number"
                    id="fuel"
                    name="fuel"
                    value={variableCosts.fuel}
                    onChange={handleVariableChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 2500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="variableOther"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Other Variable (ZAR)
                  </label>
                  <input
                    type="number"
                    id="variableOther"
                    name="other"
                    value={variableCosts.other}
                    onChange={handleVariableChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 1000"
                  />
                </div>

                <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                  <div className="text-xs text-gray-600 mb-1">Total Variable Costs</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(totalVariable)}/mo
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Cost Summary</h2>

              <div className="space-y-4">
                <div className="bg-primary-50 rounded-lg p-4 border-2 border-primary-200">
                  <div className="text-sm text-gray-600 mb-1">Total Monthly Costs</div>
                  <div className="text-3xl font-bold text-primary-700">
                    {formatCurrency(totalMonthly)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Total Annual Costs</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalAnnual)}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Cost Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fixed Costs</span>
                      <span className="font-medium">
                        {totalMonthly > 0 ? ((totalFixed / totalMonthly) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${totalMonthly > 0 ? (totalFixed / totalMonthly) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-sm mt-3">
                      <span>Variable Costs</span>
                      <span className="font-medium">
                        {totalMonthly > 0 ? ((totalVariable / totalMonthly) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${totalMonthly > 0 ? (totalVariable / totalMonthly) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Cost Structure:</strong>{' '}
                    {totalFixed > totalVariable
                      ? 'Fixed costs dominate. Focus on increasing production to spread fixed costs.'
                      : totalVariable > totalFixed * 1.5
                        ? 'High variable costs. Look for ways to reduce per-unit costs.'
                        : 'Balanced cost structure. Monitor both fixed and variable expenses.'}
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h3 className="font-semibold text-yellow-900 mb-2">Working Capital Needed</h3>
                  <p className="text-sm text-yellow-800 mb-2">
                    Reserve for 3 months: <strong>{formatCurrency(totalMonthly * 3)}</strong>
                  </p>
                  <p className="text-sm text-yellow-800">
                    Reserve for 6 months: <strong>{formatCurrency(totalMonthly * 6)}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <h3 className="font-semibold text-green-900 mb-2">💡 Cost Management Tips</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
              <li>Track all expenses monthly to identify cost-saving opportunities</li>
              <li>Negotiate bulk discounts for inputs and supplies</li>
              <li>Consider seasonal variations in costs (labor, utilities)</li>
              <li>Maintain 3-6 months of operating expenses as working capital</li>
              <li>Review and optimize costs quarterly based on actual data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
