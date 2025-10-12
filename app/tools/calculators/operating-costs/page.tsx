'use client'

import { useState } from 'react'
import Link from 'next/link'

interface CostItem {
  amount: string
  month: string
  crop: string
}

interface CostCategory {
  [key: string]: CostItem
}

const costCategories = {
  fixed: [
    { key: 'utilities', label: 'Utilities', placeholder: '2000' },
    { key: 'labor', label: 'Labor', placeholder: '15000' },
    { key: 'maintenance', label: 'Maintenance', placeholder: '3000' },
    { key: 'insurance', label: 'Insurance', placeholder: '1500' },
    { key: 'rent', label: 'Rent/Lease', placeholder: '5000' },
    { key: 'other', label: 'Other Fixed', placeholder: '1000' },
  ],
  variable: [
    { key: 'seeds', label: 'Seeds/Plants', placeholder: '3000' },
    { key: 'fertilizer', label: 'Fertilizer', placeholder: '4000' },
    { key: 'pesticides', label: 'Pesticides', placeholder: '2000' },
    { key: 'packaging', label: 'Packaging', placeholder: '1500' },
    { key: 'fuel', label: 'Fuel/Transport', placeholder: '2500' },
    { key: 'other', label: 'Other Variable', placeholder: '1000' },
  ],
}

export default function OperatingCostsCalculator() {
  const [hectares, setHectares] = useState<number>(1)
  const [crops, setCrops] = useState<string[]>(['All Crops'])
  const [newCropName, setNewCropName] = useState('')

  const initCostCategory = (keys: string[]) => {
    const category: CostCategory = {}
    keys.forEach((key) => {
      category[key] = { amount: '', month: '1', crop: 'All Crops' }
    })
    return category
  }

  const [fixedCosts, setFixedCosts] = useState<CostCategory>(
    initCostCategory(costCategories.fixed.map((c) => c.key))
  )

  const [variableCosts, setVariableCosts] = useState<CostCategory>(
    initCostCategory(costCategories.variable.map((c) => c.key))
  )

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const addCrop = () => {
    if (newCropName.trim() && !crops.includes(newCropName.trim())) {
      setCrops([...crops, newCropName.trim()])
      setNewCropName('')
    }
  }

  const removeCrop = (cropName: string) => {
    if (cropName !== 'All Crops') {
      setCrops(crops.filter((c) => c !== cropName))
      const resetFixedCosts = { ...fixedCosts }
      const resetVariableCosts = { ...variableCosts }
      Object.keys(resetFixedCosts).forEach((key) => {
        if (resetFixedCosts[key].crop === cropName) {
          resetFixedCosts[key].crop = 'All Crops'
        }
      })
      Object.keys(resetVariableCosts).forEach((key) => {
        if (resetVariableCosts[key].crop === cropName) {
          resetVariableCosts[key].crop = 'All Crops'
        }
      })
      setFixedCosts(resetFixedCosts)
      setVariableCosts(resetVariableCosts)
    }
  }

  const handleFixedChange = (name: string, field: 'amount' | 'month' | 'crop', value: string) => {
    setFixedCosts({
      ...fixedCosts,
      [name]: { ...fixedCosts[name], [field]: value },
    })
  }

  const handleVariableChange = (
    name: string,
    field: 'amount' | 'month' | 'crop',
    value: string
  ) => {
    setVariableCosts({
      ...variableCosts,
      [name]: { ...variableCosts[name], [field]: value },
    })
  }

  const totalFixed = Object.values(fixedCosts).reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  )
  const totalVariable = Object.values(variableCosts).reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  )
  const totalMonthly = totalFixed + totalVariable
  const totalAnnual = totalMonthly * 12
  const totalPerHectare = hectares > 0 ? totalMonthly / hectares : 0
  const annualPerHectare = hectares > 0 ? totalAnnual / hectares : 0

  // Calculate costs by month
  const costsByMonth: Record<string, number> = {}
  months.forEach((_, index) => {
    costsByMonth[(index + 1).toString()] = 0
  })
  Object.values(fixedCosts).forEach((item) => {
    const amount = parseFloat(item.amount) || 0
    costsByMonth[item.month] = (costsByMonth[item.month] || 0) + amount
  })
  Object.values(variableCosts).forEach((item) => {
    const amount = parseFloat(item.amount) || 0
    costsByMonth[item.month] = (costsByMonth[item.month] || 0) + amount
  })

  // Calculate costs by crop
  const costsByCrop: Record<string, number> = {}
  crops.forEach((crop) => {
    costsByCrop[crop] = 0
  })
  Object.values(fixedCosts).forEach((item) => {
    const amount = parseFloat(item.amount) || 0
    costsByCrop[item.crop] = (costsByCrop[item.crop] || 0) + amount
  })
  Object.values(variableCosts).forEach((item) => {
    const amount = parseFloat(item.amount) || 0
    costsByCrop[item.crop] = (costsByCrop[item.crop] || 0) + amount
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CostRow = ({ category, costKey, label, placeholder, isFixed }: any) => {
    const costs = isFixed ? fixedCosts : variableCosts
    const handleChange = isFixed ? handleFixedChange : handleVariableChange
    const item = costs[costKey]

    return (
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm">{label}</td>
        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2">
          <input
            type="number"
            value={item.amount}
            onChange={(e) => handleChange(costKey, 'amount', e.target.value)}
            className="w-full px-3 py-2 text-sm border-0 focus:ring-2 focus:ring-primary-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder={placeholder}
          />
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <select
            value={item.month}
            onChange={(e) => handleChange(costKey, 'month', e.target.value)}
            className="w-full px-2 py-2 text-sm border-0 focus:ring-2 focus:ring-primary-500 rounded"
          >
            {months.map((month, idx) => (
              <option key={idx} value={(idx + 1).toString()}>
                {month.substring(0, 3)}
              </option>
            ))}
          </select>
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <select
            value={item.crop}
            onChange={(e) => handleChange(costKey, 'crop', e.target.value)}
            className="w-full px-2 py-2 text-sm border-0 focus:ring-2 focus:ring-primary-500 rounded"
          >
            {crops.map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </select>
        </td>
      </tr>
    )
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

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <span className="text-4xl mr-4">💸</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Operating Costs Calculator</h1>
              <p className="text-gray-600">
                Calculate monthly and annual operating expenses per hectare
              </p>
            </div>
          </div>

          {/* Hectares and Crop Management */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="hectares" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Total Hectares
                </label>
                <input
                  type="number"
                  id="hectares"
                  value={hectares}
                  onChange={(e) => setHectares(parseFloat(e.target.value) || 0)}
                  min="0.1"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crops</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCropName}
                    onChange={(e) => setNewCropName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCrop()
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add crop name..."
                  />
                  <button
                    onClick={addCrop}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {crops.map((crop) => (
                    <span
                      key={crop}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                    >
                      {crop}
                      {crop !== 'All Crops' && (
                        <button
                          onClick={() => removeCrop(crop)}
                          className="ml-2 text-primary-600 hover:text-primary-800"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cost Input Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 w-1/4">
                    Category
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 w-1/4">
                    Amount (ZAR)
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 w-1/4">
                    Month
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 w-1/4">
                    Crop
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Fixed Costs Section */}
                <tr className="bg-blue-50">
                  <td
                    colSpan={4}
                    className="border border-gray-300 px-4 py-2 font-semibold text-blue-900"
                  >
                    Fixed Costs (Monthly)
                  </td>
                </tr>
                {costCategories.fixed.map((cat) => (
                  <CostRow
                    key={cat.key}
                    category="fixed"
                    costKey={cat.key}
                    label={cat.label}
                    placeholder={cat.placeholder}
                    isFixed={true}
                  />
                ))}
                <tr className="bg-gray-100 dark:bg-gray-700 font-semibold">
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm">Total Fixed Costs</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-right">
                    {formatCurrency(totalFixed)}/mo
                  </td>
                  <td colSpan={2} className="border border-gray-300 dark:border-gray-600"></td>
                </tr>

                {/* Variable Costs Section */}
                <tr className="bg-green-50">
                  <td
                    colSpan={4}
                    className="border border-gray-300 px-4 py-2 font-semibold text-green-900"
                  >
                    Variable Costs (Monthly)
                  </td>
                </tr>
                {costCategories.variable.map((cat) => (
                  <CostRow
                    key={cat.key}
                    category="variable"
                    costKey={cat.key}
                    label={cat.label}
                    placeholder={cat.placeholder}
                    isFixed={false}
                  />
                ))}
                <tr className="bg-gray-100 dark:bg-gray-700 font-semibold">
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm">Total Variable Costs</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-right">
                    {formatCurrency(totalVariable)}/mo
                  </td>
                  <td colSpan={2} className="border border-gray-300 dark:border-gray-600"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cost Summary Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-primary-50 rounded-lg p-4 border-2 border-primary-200">
              <div className="text-sm text-gray-600 mb-1">Total Monthly Costs</div>
              <div className="text-2xl font-bold text-primary-700">
                {formatCurrency(totalMonthly)}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Annual Costs</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalAnnual)}</div>
            </div>

            {hectares > 0 && (
              <>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="text-sm text-gray-600 mb-1">Cost/Ha (Monthly)</div>
                  <div className="text-2xl font-bold text-green-700">
                    {formatCurrency(totalPerHectare)}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-gray-600 mb-1">Cost/Ha (Annual)</div>
                  <div className="text-2xl font-bold text-green-700">
                    {formatCurrency(annualPerHectare)}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Cost Breakdown */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
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

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-2">Working Capital Needed</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-800">3 months reserve:</span>
                  <strong className="text-yellow-900">{formatCurrency(totalMonthly * 3)}</strong>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-800">6 months reserve:</span>
                  <strong className="text-yellow-900">{formatCurrency(totalMonthly * 6)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Costs by Month */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📅 Costs by Month</h2>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Month
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                        Total Costs
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                        % of Annual
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {months.map((month, idx) => {
                      const monthKey = (idx + 1).toString()
                      const monthTotal = costsByMonth[monthKey] || 0
                      const percentage = totalAnnual > 0 ? (monthTotal / totalAnnual) * 100 : 0
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{month}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatCurrency(monthTotal)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">
                            {percentage.toFixed(1)}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-gray-100">
                    <tr>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                        {formatCurrency(totalAnnual)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Costs by Crop */}
          {crops.length > 1 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🌾 Costs by Crop</h2>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Crop
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          Monthly Costs
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          Annual Costs
                        </th>
                        {hectares > 0 && (
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                            Cost/Ha (Monthly)
                          </th>
                        )}
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          % of Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {crops.map((crop) => {
                        const cropTotal = costsByCrop[crop] || 0
                        const annualCropTotal = cropTotal * 12
                        const percentage = totalMonthly > 0 ? (cropTotal / totalMonthly) * 100 : 0
                        const perHectare = hectares > 0 ? cropTotal / hectares : 0
                        return (
                          <tr key={crop} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{crop}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">
                              {formatCurrency(cropTotal)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">
                              {formatCurrency(annualCropTotal)}
                            </td>
                            {hectares > 0 && (
                              <td className="px-4 py-3 text-sm text-right text-green-700 font-medium">
                                {formatCurrency(perHectare)}
                              </td>
                            )}
                            <td className="px-4 py-3 text-sm text-right text-gray-600">
                              {percentage.toFixed(1)}%
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                          {formatCurrency(totalMonthly)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                          {formatCurrency(totalAnnual)}
                        </td>
                        {hectares > 0 && (
                          <td className="px-4 py-3 text-sm text-right font-bold text-green-700">
                            {formatCurrency(totalPerHectare)}
                          </td>
                        )}
                        <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                          100%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <h3 className="font-semibold text-green-900 mb-2">💡 Cost Management Tips</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
              <li>Track all expenses monthly to identify cost-saving opportunities</li>
              <li>Negotiate bulk discounts for inputs and supplies</li>
              <li>Consider seasonal variations in costs (labor, utilities)</li>
              <li>Maintain 3-6 months of operating expenses as working capital</li>
              <li>Review and optimize costs quarterly based on actual data</li>
              <li>Use per-hectare costs to compare efficiency across different crop areas</li>
              <li>Plan cash flow based on monthly cost breakdown to ensure adequate liquidity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
