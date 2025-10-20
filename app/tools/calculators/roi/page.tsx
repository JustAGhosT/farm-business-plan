'use client'

import WizardWrapper from '@/components/WizardWrapper'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Crop {
  id: string
  name: string
  percentage: number
  initialInvestment: string
  annualRevenue: string
  annualCosts: string
}

interface YearResults {
  year: number
  revenue: number
  costs: number
  profit: number
  cumulativeProfit: number
}

export default function ROICalculator() {
  const [years, setYears] = useState('5')
  const [crops, setCrops] = useState<Crop[]>([
    {
      id: '1',
      name: '',
      percentage: 100,
      initialInvestment: '',
      annualRevenue: '',
      annualCosts: '',
    },
  ])

  const [savedMessage, setSavedMessage] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const addCrop = () => {
    setCrops([
      ...crops,
      {
        id: Date.now().toString(),
        name: '',
        percentage: 0,
        initialInvestment: '',
        annualRevenue: '',
        annualCosts: '',
      },
    ])
  }

  const removeCrop = (id: string) => {
    if (crops.length > 1) {
      setCrops(crops.filter((c) => c.id !== id))
    }
  }

  const updateCrop = (id: string, field: keyof Crop, value: string | number) => {
    setCrops(crops.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const calculateTotalROI = () => {
    const numYears = parseInt(years) || 1
    const totalInvestment = crops.reduce((sum, crop) => {
      const investment = parseFloat(crop.initialInvestment) || 0
      const percentage = crop.percentage / 100
      return sum + investment * percentage
    }, 0)

    const yearResults: YearResults[] = []
    let cumulativeProfit = -totalInvestment

    for (let year = 1; year <= numYears; year++) {
      const yearRevenue = crops.reduce((sum, crop) => {
        const revenue = parseFloat(crop.annualRevenue) || 0
        const percentage = crop.percentage / 100
        return sum + revenue * percentage
      }, 0)

      const yearCosts = crops.reduce((sum, crop) => {
        const costs = parseFloat(crop.annualCosts) || 0
        const percentage = crop.percentage / 100
        return sum + costs * percentage
      }, 0)

      const yearProfit = yearRevenue - yearCosts
      cumulativeProfit += yearProfit

      yearResults.push({
        year,
        revenue: yearRevenue,
        costs: yearCosts,
        profit: yearProfit,
        cumulativeProfit,
      })
    }

    const totalRevenue = yearResults.reduce((sum, yr) => sum + yr.revenue, 0)
    const totalCosts = yearResults.reduce((sum, yr) => sum + yr.costs, 0)
    const totalNetProfit = totalRevenue - totalCosts
    const annualNetProfit = totalNetProfit / numYears
    const roi =
      totalInvestment > 0 ? ((totalNetProfit - totalInvestment) / totalInvestment) * 100 : 0
    const paybackPeriod = annualNetProfit > 0 ? totalInvestment / annualNetProfit : 0

    return {
      totalInvestment,
      roi,
      netProfit: totalNetProfit,
      annualNetProfit,
      paybackPeriod,
      yearResults,
    }
  }

  const results = calculateTotalROI()
  const totalPercentage = crops.reduce((sum, c) => sum + (parseFloat(String(c.percentage)) || 0), 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleSaveCalculation = async () => {
    if (!results || results.totalInvestment === 0) return

    setIsSaving(true)
    setSavedMessage('')

    try {
      const response = await fetch('/api/calculator-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calculator_type: 'roi',
          input_data: { crops, years },
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

  useEffect(() => {
    const raw = sessionStorage.getItem('calculatorWizardData')
    if (!raw) return

    try {
      const wizardData = JSON.parse(raw)
      if (wizardData.crops && wizardData.crops.length > 0) {
        setCrops(
          wizardData.crops.map((c: any) => ({
            ...c,
            initialInvestment: '',
            annualRevenue: '',
            annualCosts: '',
          }))
        )
      }
      if (wizardData.years) {
        setYears(wizardData.years.toString())
      }
    } catch (e) {
      console.error('Failed to parse wizard data', e)
    }
  }, [])

  const handleNext = () => {
    const wizardData = JSON.parse(sessionStorage.getItem('calculatorWizardData') || '{}')
    wizardData.roi = {
      years,
      crops,
      results,
    }
    sessionStorage.setItem('calculatorWizardData', JSON.stringify(wizardData))
  }

  return (
    <WizardWrapper
      title="ROI Calculator"
      description="Calculate Return on Investment for multiple crops with year-by-year analysis."
      step={6}
      isFormValid={totalPercentage === 100}
      onNext={handleNext}
    >
      <div className="space-y-6">
        {/* Global Settings */}
        <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="years"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Time Period (Years)
              </label>
              <input
                type="number"
                id="years"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                min="1"
                max="20"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Number of years for ROI calculation
              </p>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Allocation
              </div>
              <div
                className={`text-2xl font-bold ${
                  totalPercentage === 100
                    ? 'text-green-600 dark:text-green-400'
                    : totalPercentage > 100
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                }`}
              >
                {totalPercentage.toFixed(0)}%
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {totalPercentage === 100
                  ? '✓ Allocation complete'
                  : totalPercentage > 100
                    ? '⚠ Over 100% - adjust percentages'
                    : '⚠ Under 100% - add more crops or increase percentages'}
              </p>
            </div>
          </div>
        </div>

        {/* Crop Input Cards */}
        {crops.map((crop, index) => (
          <div
            key={crop.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Crop {index + 1}
                {crop.name ? `: ${crop.name}` : ''}
              </h3>
              {crops.length > 1 && (
                <button
                  onClick={() => removeCrop(crop.id)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                  aria-label="Remove crop"
                  title="Remove crop"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Crop Name
                </label>
                <input
                  type="text"
                  value={crop.name}
                  onChange={(e) => updateCrop(crop.id, 'name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Dragon Fruit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  % of Land/Resources
                </label>
                <input
                  type="number"
                  value={crop.percentage}
                  onChange={(e) =>
                    updateCrop(crop.id, 'percentage', parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 50"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Allocation percentage
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Initial Investment (ZAR)
                </label>
                <input
                  type="number"
                  value={crop.initialInvestment}
                  onChange={(e) => updateCrop(crop.id, 'initialInvestment', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 150000"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Startup costs at 100%
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Annual Revenue (ZAR)
                </label>
                <input
                  type="number"
                  value={crop.annualRevenue}
                  onChange={(e) => updateCrop(crop.id, 'annualRevenue', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 250000"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Expected yearly revenue at 100%
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Annual Operating Costs (ZAR)
                </label>
                <input
                  type="number"
                  value={crop.annualCosts}
                  onChange={(e) => updateCrop(crop.id, 'annualCosts', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 120000"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Yearly expenses at 100%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </WizardWrapper>
  )
}
