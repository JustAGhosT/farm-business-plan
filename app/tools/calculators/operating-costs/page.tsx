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

export default function OperatingCostsCalculator() {
  const [hectares, setHectares] = useState<number>(1)
  const [crops, setCrops] = useState<string[]>(['All Crops'])
  const [newCropName, setNewCropName] = useState('')

  const [fixedCosts, setFixedCosts] = useState<CostCategory>({
    utilities: { amount: '', month: '1', crop: 'All Crops' },
    labor: { amount: '', month: '1', crop: 'All Crops' },
    maintenance: { amount: '', month: '1', crop: 'All Crops' },
    insurance: { amount: '', month: '1', crop: 'All Crops' },
    rent: { amount: '', month: '1', crop: 'All Crops' },
    other: { amount: '', month: '1', crop: 'All Crops' },
  })

  const [variableCosts, setVariableCosts] = useState<CostCategory>({
    seeds: { amount: '', month: '1', crop: 'All Crops' },
    fertilizer: { amount: '', month: '1', crop: 'All Crops' },
    pesticides: { amount: '', month: '1', crop: 'All Crops' },
    packaging: { amount: '', month: '1', crop: 'All Crops' },
    fuel: { amount: '', month: '1', crop: 'All Crops' },
    other: { amount: '', month: '1', crop: 'All Crops' },
  })

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
      // Reset costs assigned to this crop back to 'All Crops'
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

  const handleFixedChange = (
    name: string,
    field: 'amount' | 'month' | 'crop',
    value: string
  ) => {
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
              <p className="text-gray-600">
                Calculate monthly and annual operating expenses per hectare
              </p>
            </div>
          </div>

          {/* Hectares and Crop Management */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="hectares" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
                    value={fixedCosts.utilities.amount}
                    onChange={(e) => handleFixedChange('utilities', 'amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 2000"
                  />
                  <div className="flex gap-2 mt-1">
                    <select
                      value={fixedCosts.utilities.month}
                      onChange={(e) => handleFixedChange('utilities', 'month', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {months.map((month, idx) => (
                        <option key={idx} value={(idx + 1).toString()}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      value={fixedCosts.utilities.crop}
                      onChange={(e) => handleFixedChange('utilities', 'crop', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {crops.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="labor" className="block text-sm font-medium text-gray-700 mb-1">
                    Labor (ZAR)
                  </label>
                  <input
                    type="number"
                    id="labor"
                    name="labor"
                    value={fixedCosts.labor.amount}
                    onChange={(e) => handleFixedChange('labor', 'amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 15000"
                  />
                  <div className="flex gap-2 mt-1">
                    <select
                      value={fixedCosts.labor.month}
                      onChange={(e) => handleFixedChange('labor', 'month', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {months.map((month, idx) => (
                        <option key={idx} value={(idx + 1).toString()}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      value={fixedCosts.labor.crop}
                      onChange={(e) => handleFixedChange('labor', 'crop', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {crops.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    value={fixedCosts.maintenance.amount}
                    onChange={(e) => handleFixedChange('maintenance', 'amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 3000"
                  />
                  <div className="flex gap-2 mt-1">
                    <select
                      value={fixedCosts.maintenance.month}
                      onChange={(e) => handleFixedChange('maintenance', 'month', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {months.map((month, idx) => (
                        <option key={idx} value={(idx + 1).toString()}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      value={fixedCosts.maintenance.crop}
                      onChange={(e) => handleFixedChange('maintenance', 'crop', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {crops.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    value={fixedCosts.insurance.amount}
                    onChange={(e) => handleFixedChange('insurance', 'amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 1500"
                  />
                  <div className="flex gap-2 mt-1">
                    <select
                      value={fixedCosts.insurance.month}
                      onChange={(e) => handleFixedChange('insurance', 'month', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {months.map((month, idx) => (
                        <option key={idx} value={(idx + 1).toString()}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      value={fixedCosts.insurance.crop}
                      onChange={(e) => handleFixedChange('insurance', 'crop', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {crops.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="rent" className="block text-sm font-medium text-gray-700 mb-1">
                    Rent/Lease (ZAR)
                  </label>
                  <input
                    type="number"
                    id="rent"
                    name="rent"
                    value={fixedCosts.rent.amount}
                    onChange={(e) => handleFixedChange('rent', 'amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 5000"
                  />
                  <div className="flex gap-2 mt-1">
                    <select
                      value={fixedCosts.rent.month}
                      onChange={(e) => handleFixedChange('rent', 'month', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {months.map((month, idx) => (
                        <option key={idx} value={(idx + 1).toString()}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      value={fixedCosts.rent.crop}
                      onChange={(e) => handleFixedChange('rent', 'crop', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {crops.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    value={fixedCosts.other.amount}
                    onChange={(e) => handleFixedChange('other', 'amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 1000"
                  />
                  <div className="flex gap-2 mt-1">
                    <select
                      value={fixedCosts.other.month}
                      onChange={(e) => handleFixedChange('other', 'month', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {months.map((month, idx) => (
                        <option key={idx} value={(idx + 1).toString()}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      value={fixedCosts.other.crop}
                      onChange={(e) => handleFixedChange('other', 'crop', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {crops.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    value={variableCosts.seeds.amount}
                    onChange={(e) => handleVariableChange('seeds', 'amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 3000"
                  />
                  <div className="flex gap-2 mt-1">
                    <select
                      value={variableCosts.seeds.month}
                      onChange={(e) => handleVariableChange('seeds', 'month', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {months.map((month, idx) => (
                        <option key={idx} value={(idx + 1).toString()}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      value={variableCosts.seeds.crop}
                      onChange={(e) => handleVariableChange('seeds', 'crop', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {crops.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    value={variableCosts.fertilizer.amount}
                    onChange={(e) => handleVariableChange('fertilizer', 'amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 4000"
                  />
                  <div className="flex gap-2 mt-1">
                    <select
                      value={variableCosts.fertilizer.month}
                      onChange={(e) => handleVariableChange('fertilizer', 'month', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {months.map((month, idx) => (
                        <option key={idx} value={(idx + 1).toString()}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      value={variableCosts.fertilizer.crop}
                      onChange={(e) => handleVariableChange('fertilizer', 'crop', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {crops.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    value={variableCosts.pesticides.amount}
                    onChange={(e) => handleVariableChange('pesticides', 'amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 2000"
                  />
                  <div className="flex gap-2 mt-1">
                    <select
                      value={variableCosts.pesticides.month}
                      onChange={(e) => handleVariableChange('pesticides', 'month', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {months.map((month, idx) => (
                        <option key={idx} value={(idx + 1).toString()}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      value={variableCosts.pesticides.crop}
                      onChange={(e) => handleVariableChange('pesticides', 'crop', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {crops.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    value={variableCosts.packaging.amount}
                    onChange={(e) => handleVariableChange('packaging', 'amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 1500"
                  />
                  <div className="flex gap-2 mt-1">
                    <select
                      value={variableCosts.packaging.month}
                      onChange={(e) => handleVariableChange('packaging', 'month', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {months.map((month, idx) => (
                        <option key={idx} value={(idx + 1).toString()}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      value={variableCosts.packaging.crop}
                      onChange={(e) => handleVariableChange('packaging', 'crop', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {crops.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="fuel" className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel/Transport (ZAR)
                  </label>
                  <input
                    type="number"
                    id="fuel"
                    name="fuel"
                    value={variableCosts.fuel.amount}
                    onChange={(e) => handleVariableChange('fuel', 'amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 2500"
                  />
                  <div className="flex gap-2 mt-1">
                    <select
                      value={variableCosts.fuel.month}
                      onChange={(e) => handleVariableChange('fuel', 'month', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {months.map((month, idx) => (
                        <option key={idx} value={(idx + 1).toString()}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      value={variableCosts.fuel.crop}
                      onChange={(e) => handleVariableChange('fuel', 'crop', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {crops.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    value={variableCosts.other.amount}
                    onChange={(e) => handleVariableChange('other', 'amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 1000"
                  />
                  <div className="flex gap-2 mt-1">
                    <select
                      value={variableCosts.other.month}
                      onChange={(e) => handleVariableChange('other', 'month', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {months.map((month, idx) => (
                        <option key={idx} value={(idx + 1).toString()}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      value={variableCosts.other.crop}
                      onChange={(e) => handleVariableChange('other', 'crop', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    >
                      {crops.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>
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

                {hectares > 0 && (
                  <>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-sm text-gray-600 mb-1">Cost per Hectare (Monthly)</div>
                      <div className="text-2xl font-bold text-green-700">
                        {formatCurrency(totalPerHectare)}/ha
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-sm text-gray-600 mb-1">Cost per Hectare (Annual)</div>
                      <div className="text-2xl font-bold text-green-700">
                        {formatCurrency(annualPerHectare)}/ha
                      </div>
                    </div>
                  </>
                )}

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
                      <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                        100%
                      </td>
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
