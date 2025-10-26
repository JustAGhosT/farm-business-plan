'use client'

import WizardWrapper from '@/components/WizardWrapper'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

// Unified calculator configuration
interface CalculatorConfig {
  id: string
  name: string
  description: string
  icon: string
  fields: CalculatorField[]
  calculate: (data: any) => any
  resultsComponent: (results: any) => JSX.Element
}

interface CalculatorField {
  id: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea'
  required?: boolean
  options?: string[]
  placeholder?: string
  min?: number
  max?: number
  step?: number
}

interface Crop {
  id: string
  name: string
  percentage: number
  [key: string]: any
}

// Calculator configurations
const CALCULATOR_CONFIGS: CalculatorConfig[] = [
  {
    id: 'roi',
    name: 'ROI Calculator',
    description: 'Calculate Return on Investment for your farm operations',
    icon: '📈',
    fields: [
      {
        id: 'years',
        label: 'Investment Period (years)',
        type: 'number',
        required: true,
        min: 1,
        max: 20,
      },
      {
        id: 'initialInvestment',
        label: 'Initial Investment (R)',
        type: 'number',
        required: true,
        min: 0,
      },
      { id: 'annualRevenue', label: 'Annual Revenue (R)', type: 'number', required: true, min: 0 },
      { id: 'annualCosts', label: 'Annual Costs (R)', type: 'number', required: true, min: 0 },
      { id: 'discountRate', label: 'Discount Rate (%)', type: 'number', required: false, min: 0, max: 100, placeholder: 'e.g., 8 for 8%' },
      { id: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes...' },
    ],
    calculate: (data) => {
      const years = parseInt(data.years) || 1
      const initialInvestment = parseFloat(data.initialInvestment) || 0
      const annualRevenue = parseFloat(data.annualRevenue) || 0
      const annualCosts = parseFloat(data.annualCosts) || 0
      const discountRate = parseFloat(data.discountRate) || 0

      const annualProfit = annualRevenue - annualCosts
      const totalProfit = annualProfit * years - initialInvestment
      const roi = initialInvestment > 0 ? (totalProfit / initialInvestment) * 100 : 0
      const paybackPeriod = annualProfit > 0 ? initialInvestment / annualProfit : 0

      // Calculate NPV: -initialInvestment + sum of discounted annual profits
      let npv = -initialInvestment
      if (discountRate > 0) {
        for (let t = 1; t <= years; t++) {
          npv += annualProfit / Math.pow(1 + discountRate / 100, t)
        }
      } else {
        // If no discount rate, NPV = total profit
        npv = totalProfit
      }

      return {
        roi: roi.toFixed(2),
        totalProfit: totalProfit.toLocaleString(),
        annualProfit: annualProfit.toLocaleString(),
        paybackPeriod: paybackPeriod.toFixed(1),
        netPresentValue: npv.toLocaleString(),
      }
    },
    resultsComponent: (results) => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 dark:text-green-200">ROI</h4>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">{results.roi}%</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200">Total Profit</h4>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            R {results.totalProfit}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-800 dark:text-purple-200">Payback Period</h4>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {results.paybackPeriod} years
          </p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-orange-800 dark:text-orange-200">Annual Profit</h4>
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
            R {results.annualProfit}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'break-even',
    name: 'Break-Even Analysis',
    description: 'Determine your break-even point for production and sales',
    icon: '⚖️',
    fields: [
      { id: 'fixedCosts', label: 'Fixed Costs (R)', type: 'number', required: true, min: 0 },
      {
        id: 'variableCosts',
        label: 'Variable Costs per Unit (R)',
        type: 'number',
        required: true,
        min: 0,
      },
      {
        id: 'sellingPrice',
        label: 'Selling Price per Unit (R)',
        type: 'number',
        required: true,
        min: 0,
      },
      { id: 'units', label: 'Expected Units Sold', type: 'number', required: true, min: 0 },
      { id: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes...' },
    ],
    calculate: (data) => {
      const fixedCosts = parseFloat(data.fixedCosts) || 0
      const variableCosts = parseFloat(data.variableCosts) || 0
      const sellingPrice = parseFloat(data.sellingPrice) || 0
      const units = parseFloat(data.units) || 0

      const breakEvenUnits =
        sellingPrice > variableCosts ? fixedCosts / (sellingPrice - variableCosts) : 0
      const totalRevenue = units * sellingPrice
      const totalCosts = fixedCosts + units * variableCosts
      const profit = totalRevenue - totalCosts

      return {
        breakEvenUnits: breakEvenUnits.toFixed(0),
        breakEvenRevenue: (breakEvenUnits * sellingPrice).toLocaleString(),
        totalRevenue: totalRevenue.toLocaleString(),
        totalCosts: totalCosts.toLocaleString(),
        profit: profit.toLocaleString(),
      }
    },
    resultsComponent: (results) => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-red-800 dark:text-red-200">Break-Even Units</h4>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100">
            {results.breakEvenUnits}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200">Break-Even Revenue</h4>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            R {results.breakEvenRevenue}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 dark:text-green-200">Expected Profit</h4>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            R {results.profit}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'investment',
    name: 'Investment Calculator',
    description: 'Plan your startup investment and funding requirements',
    icon: '💰',
    fields: [
      { id: 'landPrep', label: 'Land Preparation (R)', type: 'number', min: 0 },
      { id: 'infrastructure', label: 'Infrastructure (R)', type: 'number', min: 0 },
      { id: 'equipment', label: 'Equipment (R)', type: 'number', min: 0 },
      { id: 'initialInputs', label: 'Initial Inputs (R)', type: 'number', min: 0 },
      { id: 'workingCapital', label: 'Working Capital (R)', type: 'number', min: 0 },
      { id: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes...' },
    ],
    calculate: (data) => {
      const landPrep = parseFloat(data.landPrep) || 0
      const infrastructure = parseFloat(data.infrastructure) || 0
      const equipment = parseFloat(data.equipment) || 0
      const initialInputs = parseFloat(data.initialInputs) || 0
      const workingCapital = parseFloat(data.workingCapital) || 0

      const totalInvestment = landPrep + infrastructure + equipment + initialInputs + workingCapital

      return {
        totalInvestment: totalInvestment.toLocaleString(),
        landPrep: landPrep.toLocaleString(),
        infrastructure: infrastructure.toLocaleString(),
        equipment: equipment.toLocaleString(),
        initialInputs: initialInputs.toLocaleString(),
        workingCapital: workingCapital.toLocaleString(),
      }
    },
    resultsComponent: (results) => (
      <div className="space-y-4">
        <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg">
          <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">
            Total Investment Required
          </h4>
          <p className="text-3xl font-bold text-primary-900 dark:text-primary-100">
            R {results.totalInvestment}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h5 className="font-medium text-gray-800 dark:text-gray-200">Land Preparation</h5>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              R {results.landPrep}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h5 className="font-medium text-gray-800 dark:text-gray-200">Infrastructure</h5>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              R {results.infrastructure}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h5 className="font-medium text-gray-800 dark:text-gray-200">Equipment</h5>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              R {results.equipment}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h5 className="font-medium text-gray-800 dark:text-gray-200">Initial Inputs</h5>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              R {results.initialInputs}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h5 className="font-medium text-gray-800 dark:text-gray-200">Working Capital</h5>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              R {results.workingCapital}
            </p>
          </div>
        </div>
      </div>
    ),
  },
]

export default function UnifiedCalculator() {
  const searchParams = useSearchParams()
  const [selectedCalculator, setSelectedCalculator] = useState<string>('roi')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [results, setResults] = useState<any>(null)
  const [savedMessage, setSavedMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Handle URL parameter for pre-selecting calculator
  useEffect(() => {
    const calculatorParam = searchParams.get('calculator')
    if (calculatorParam && CALCULATOR_CONFIGS.find((config) => config.id === calculatorParam)) {
      setSelectedCalculator(calculatorParam)
    }
  }, [searchParams])

  const currentConfig = CALCULATOR_CONFIGS.find((config) => config.id === selectedCalculator)

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
    setResults(null) // Clear results when input changes
  }

  const calculateResults = () => {
    if (!currentConfig) return

    const calculatedResults = currentConfig.calculate(formData)
    setResults(calculatedResults)
  }

  const saveResults = async () => {
    if (!currentConfig || !results) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/calculator-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calculator_type: selectedCalculator,
          input_data: formData,
          results: results,
          notes: formData.notes || '',
        }),
      })

      if (response.ok) {
        setSavedMessage('Results saved successfully!')
        setTimeout(() => setSavedMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error saving results:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <WizardWrapper>
      <div className="max-w-4xl mx-auto">
        {/* Calculator Selection */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Financial Calculators
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CALCULATOR_CONFIGS.map((config) => (
              <button
                key={config.id}
                onClick={() => {
                  setSelectedCalculator(config.id)
                  setFormData({})
                  setResults(null)
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedCalculator === config.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                }`}
              >
                <div className="text-3xl mb-2">{config.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{config.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {config.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Calculator Form */}
        {currentConfig && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-4">{currentConfig.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentConfig.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">{currentConfig.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {currentConfig.fields.map((field) => (
                <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={field.placeholder}
                      rows={3}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      aria-label={field.label}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={field.placeholder}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={calculateResults}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Calculate
              </button>
              {results && (
                <button
                  onClick={saveResults}
                  disabled={isSaving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Results'}
                </button>
              )}
            </div>

            {savedMessage && (
              <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg">
                {savedMessage}
              </div>
            )}
          </div>
        )}

        {/* Results Display */}
        {results && currentConfig && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Results</h3>
            {currentConfig.resultsComponent(results)}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link
            href="/tools/calculators"
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            ← Back to Calculators
          </Link>
          <Link
            href="/tools/reports"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            View Reports →
          </Link>
        </div>
      </div>
    </WizardWrapper>
  )
}
