'use client'

import WizardWrapper from '@/components/WizardWrapper'
import { useEffect, useState } from 'react'

interface FundingSource {
  name: string
  amount: string
}

interface Crop {
  id: string
  name: string
  percentage: number
  landPrep: string
  infrastructure: string
  equipment: string
  initialInputs: string
  workingCapital: string
}

interface YearInvestment {
  year: number
  newInvestment: number
  cumulativeInvestment: number
}

export default function InvestmentCalculator() {
  const [years, setYears] = useState('5')
  const [expansionRate, setExpansionRate] = useState('0')

  const [crops, setCrops] = useState<Crop[]>([
    {
      id: '1',
      name: '',
      percentage: 100,
      landPrep: '',
      infrastructure: '',
      equipment: '',
      initialInputs: '',
      workingCapital: '',
    },
  ])

  const [fundingSources, setFundingSources] = useState<FundingSource[]>([
    { name: 'Personal Savings', amount: '' },
    { name: 'Bank Loan', amount: '' },
  ])

  const addCrop = () => {
    setCrops([
      ...crops,
      {
        id: Date.now().toString(),
        name: '',
        percentage: 0,
        landPrep: '',
        infrastructure: '',
        equipment: '',
        initialInputs: '',
        workingCapital: '',
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

  const handleFundingChange = (index: number, value: string) => {
    const newSources = [...fundingSources]
    newSources[index].amount = value
    setFundingSources(newSources)
  }

  const addFundingSource = () => {
    setFundingSources([...fundingSources, { name: '', amount: '' }])
  }

  const calculateTotalInvestment = () => {
    return crops.reduce((sum, crop) => {
      const percentage = crop.percentage / 100
      const cropTotal =
        (parseFloat(crop.landPrep) || 0) +
        (parseFloat(crop.infrastructure) || 0) +
        (parseFloat(crop.equipment) || 0) +
        (parseFloat(crop.initialInputs) || 0) +
        (parseFloat(crop.workingCapital) || 0)
      return sum + cropTotal * percentage
    }, 0)
  }

  const calculateYearInvestments = (): YearInvestment[] => {
    const numYears = parseInt(years) || 5
    const expansion = parseFloat(expansionRate) / 100
    const initialInvestment = calculateTotalInvestment()
    const yearInvestments: YearInvestment[] = []

    let cumulativeInvestment = initialInvestment
    yearInvestments.push({
      year: 1,
      newInvestment: initialInvestment,
      cumulativeInvestment,
    })

    for (let year = 2; year <= numYears; year++) {
      const newInvestment = initialInvestment * expansion
      cumulativeInvestment += newInvestment
      yearInvestments.push({
        year,
        newInvestment,
        cumulativeInvestment,
      })
    }

    return yearInvestments
  }

  const totalInvestment = calculateTotalInvestment()
  const yearInvestments = calculateYearInvestments()
  const totalPercentage = crops.reduce((sum, c) => sum + (parseFloat(String(c.percentage)) || 0), 0)

  const totalFunding = fundingSources.reduce(
    (sum, source) => sum + (parseFloat(source.amount) || 0),
    0
  )

  const fundingGap = totalInvestment - totalFunding

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
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
            landPrep: '',
            infrastructure: '',
            equipment: '',
            initialInputs: '',
            workingCapital: '',
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
    wizardData.investment = {
      years,
      expansionRate,
      crops,
      fundingSources,
      totalInvestment,
    }
    sessionStorage.setItem('calculatorWizardData', JSON.stringify(wizardData))
  }

  return (
    <WizardWrapper
      title="Investment Calculator"
      description="Plan startup investment and funding with a multi-year timeline."
      step={3}
      isFormValid={totalPercentage === 100}
      onNext={handleNext}
    >
      <div className="space-y-6">
        {/* Global Settings */}
        <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="years"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Investment Timeline (Years)
              </label>
              <input
                type="number"
                id="years"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                min="1"
                max="10"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label
                htmlFor="expansionRate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Annual Expansion Rate (%)
              </label>
              <input
                type="number"
                id="expansionRate"
                value={expansionRate}
                onChange={(e) => setExpansionRate(e.target.value)}
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Additional investment each year
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
                  ? '✓ Complete'
                  : totalPercentage > 100
                    ? '⚠ Over 100%'
                    : '⚠ Under 100%'}
              </p>
            </div>
          </div>
        </div>

        {/* Crop Investment Cards */}
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

            <div className="grid md:grid-cols-3 gap-4">
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
                  % of Investment
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
                  Land Preparation (ZAR)
                </label>
                <input
                  type="number"
                  value={crop.landPrep}
                  onChange={(e) => updateCrop(crop.id, 'landPrep', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 50000"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">At 100% allocation</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Infrastructure (ZAR)
                </label>
                <input
                  type="number"
                  value={crop.infrastructure}
                  onChange={(e) => updateCrop(crop.id, 'infrastructure', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 150000"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Irrigation, fencing, structures
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Equipment & Tools (ZAR)
                </label>
                <input
                  type="number"
                  value={crop.equipment}
                  onChange={(e) => updateCrop(crop.id, 'equipment', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 80000"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Tractors, implements, tools
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Initial Inputs (ZAR)
                </label>
                <input
                  type="number"
                  value={crop.initialInputs}
                  onChange={(e) => updateCrop(crop.id, 'initialInputs', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 30000"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Seeds, fertilizers, pesticides
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Working Capital (ZAR)
                </label>
                <input
                  type="number"
                  value={crop.workingCapital}
                  onChange={(e) => updateCrop(crop.id, 'workingCapital', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 40000"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  3-6 months operating expenses
                </p>
              </div>
            </div>
          </div>
        ))}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Investment Summary */}
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Investment Summary</h2>
            <div className="space-y-4">
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 border-2 border-primary-200 dark:border-primary-700">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Total Initial Investment
                </div>
                <div className="text-3xl font-bold text-primary-700 dark:text-primary-400">
                  {formatCurrency(totalInvestment)}
                </div>
              </div>

              {/* Multi-Year Investment Timeline */}
              {yearInvestments.length > 1 && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Investment Timeline
                  </h3>
                  <div className="space-y-2">
                    {yearInvestments.map((year) => (
                      <div key={year.year} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Year {year.year}:</span>
                        <div className="text-right">
                          <span className="font-medium dark:text-white">
                            {formatCurrency(year.newInvestment)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            (Total: {formatCurrency(year.cumulativeInvestment)})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Per-Crop Breakdown */}
              {crops.length > 1 && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Investment by Crop
                  </h3>
                  <div className="space-y-2">
                    {crops.map((crop) => {
                      const percentage = crop.percentage / 100
                      const cropTotal =
                        (parseFloat(crop.landPrep) || 0) +
                        (parseFloat(crop.infrastructure) || 0) +
                        (parseFloat(crop.equipment) || 0) +
                        (parseFloat(crop.initialInputs) || 0) +
                        (parseFloat(crop.workingCapital) || 0)
                      const cropInvestment = cropTotal * percentage
                      return (
                        <div key={crop.id} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {crop.name || 'Unnamed'} ({crop.percentage}%):
                          </span>
                          <span className="font-medium dark:text-white">
                            {formatCurrency(cropInvestment)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Funding Sources */}
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Funding Sources</h2>

            <div className="space-y-4 mb-4">
              {fundingSources.map((source, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={source.name}
                    onChange={(e) => {
                      const newSources = [...fundingSources]
                      newSources[index].name = e.target.value
                      setFundingSources(newSources)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Source name"
                  />
                  <input
                    type="number"
                    value={source.amount}
                    onChange={(e) => handleFundingChange(index, e.target.value)}
                    className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Amount"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={addFundingSource}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-700 dark:hover:border-primary-400 dark:hover:text-primary-400 transition-colors"
            >
              + Add Funding Source
            </button>

            <div className="mt-6 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Total Funding Secured
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalFunding)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {totalInvestment > 0
                    ? `${((totalFunding / totalInvestment) * 100).toFixed(1)}% of required`
                    : '0% of required'}
                </div>
              </div>

              <div
                className={`rounded-lg p-4 border-2 ${
                  fundingGap > 0
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                    : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                }`}
              >
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Funding Gap</div>
                <div
                  className={`text-2xl font-bold ${
                    fundingGap > 0
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-green-700 dark:text-green-400'
                  }`}
                >
                  {formatCurrency(Math.abs(fundingGap))}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {fundingGap > 0 ? 'Additional funding needed' : 'Fully funded'}
                </div>
              </div>

              {totalInvestment > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Funding Breakdown
                  </h3>
                  {fundingSources
                    .filter((s) => parseFloat(s.amount) > 0)
                    .map((source, index) => {
                      const amount = parseFloat(source.amount) || 0
                      const percentage = (amount / totalInvestment) * 100
                      return (
                        <div key={index} className="mb-2">
                          <div className="flex justify-between text-sm mb-1 dark:text-gray-300">
                            <span>{source.name || 'Unnamed Source'}</span>
                            <span className="font-medium">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Financing Tips */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Financing Tips</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300">
            <li>Include 10-15% contingency in your investment plan</li>
            <li>Working capital should cover 3-6 months of operating expenses</li>
            <li>Explore agricultural development banks and government grants</li>
            <li>Consider phased investment to reduce upfront capital needs</li>
            <li>Get multiple quotes for equipment and infrastructure</li>
          </ul>
        </div>
      </div>
    </WizardWrapper>
  )
}
