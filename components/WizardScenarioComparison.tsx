'use client'

import { CropTemplate } from '@/lib/cropTemplates'
import { useState } from 'react'

interface Scenario {
  id: string
  name: string
  crops: Array<{
    name: string
    percentage: number
  }>
  years: number
  totalHectares: number
  color: string
}

interface WizardScenarioComparisonProps {
  cropTemplates: Map<string, CropTemplate>
  onClose: () => void
}

interface ScenarioMetrics {
  totalInvestment: number
  annualRevenue: number
  annualCosts: number
  annualProfit: number
  roi: number
  paybackYears: number
  totalNetProfit: number
}

export default function WizardScenarioComparison({
  cropTemplates,
  onClose,
}: WizardScenarioComparisonProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: '1',
      name: 'Base Scenario',
      crops: [],
      years: 5,
      totalHectares: 10,
      color: '#10b981',
    },
  ])

  const calculateScenarioMetrics = (scenario: Scenario): ScenarioMetrics => {
    let totalInvestment = 0
    let annualRevenue = 0
    let annualCosts = 0

    scenario.crops.forEach((crop) => {
      const template = cropTemplates.get(crop.name)
      if (template) {
        const hectares = (crop.percentage / 100) * scenario.totalHectares
        totalInvestment += template.initialInvestmentPerHa * hectares
        const cropRevenue = template.baseProduction * template.basePrice
        const cropCosts =
          template.fixedCostsPerHa + template.variableCostPerUnit * template.baseProduction
        annualRevenue += cropRevenue * hectares
        annualCosts += cropCosts * hectares
      }
    })

    const annualProfit = annualRevenue - annualCosts
    const roi = totalInvestment > 0 ? (annualProfit / totalInvestment) * 100 : 0
    const paybackYears = annualProfit > 0 ? totalInvestment / annualProfit : 999
    const totalNetProfit = annualProfit * scenario.years

    return {
      totalInvestment,
      annualRevenue,
      annualCosts,
      annualProfit,
      roi,
      paybackYears,
      totalNetProfit,
    }
  }

  const addScenario = () => {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: `Scenario ${scenarios.length + 1}`,
      crops: [],
      years: 5,
      totalHectares: 10,
      color: colors[scenarios.length % colors.length],
    }
    setScenarios([...scenarios, newScenario])
  }

  const removeScenario = (id: string) => {
    if (scenarios.length > 1) {
      setScenarios(scenarios.filter((s) => s.id !== id))
    }
  }

  const updateScenario = (id: string, updates: Partial<Scenario>) => {
    setScenarios(scenarios.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const addCropToScenario = (scenarioId: string) => {
    setScenarios(
      scenarios.map((s) => {
        if (s.id === scenarioId) {
          return {
            ...s,
            crops: [...s.crops, { name: '', percentage: 0 }],
          }
        }
        return s
      })
    )
  }

  const updateCrop = (
    scenarioId: string,
    cropIndex: number,
    field: 'name' | 'percentage',
    value: any
  ) => {
    setScenarios(
      scenarios.map((s) => {
        if (s.id === scenarioId) {
          const newCrops = [...s.crops]
          if (field === 'percentage') {
            newCrops[cropIndex][field] = parseFloat(value) || 0
          } else {
            newCrops[cropIndex][field] = value
          }
          return { ...s, crops: newCrops }
        }
        return s
      })
    )
  }

  const removeCrop = (scenarioId: string, cropIndex: number) => {
    setScenarios(
      scenarios.map((s) => {
        if (s.id === scenarioId) {
          return { ...s, crops: s.crops.filter((_, i) => i !== cropIndex) }
        }
        return s
      })
    )
  }

  const getTotalPercentage = (scenario: Scenario) => {
    return scenario.crops.reduce((sum, crop) => sum + crop.percentage, 0)
  }

  const findBestScenario = () => {
    let best = scenarios[0]
    let bestROI = 0

    scenarios.forEach((scenario) => {
      const metrics = calculateScenarioMetrics(scenario)
      if (metrics.roi > bestROI) {
        bestROI = metrics.roi
        best = scenario
      }
    })

    return best
  }

  const bestScenario = scenarios.length > 0 ? findBestScenario() : null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🔄 Scenario Comparison
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Compare multiple farm portfolios side-by-side
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addScenario}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              + Add Scenario
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Scenarios Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {scenarios.map((scenario) => {
              const totalPercentage = getTotalPercentage(scenario)
              const isValid = totalPercentage === 100
              const metrics = calculateScenarioMetrics(scenario)
              const isBest = bestScenario?.id === scenario.id && scenarios.length > 1

              return (
                <div
                  key={scenario.id}
                  className={`border-2 rounded-lg p-4 ${
                    isBest
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {/* Scenario Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={scenario.name}
                        onChange={(e) => updateScenario(scenario.id, { name: e.target.value })}
                        className="text-lg font-bold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary-500 outline-none w-full"
                        aria-label="Scenario name"
                      />
                      {isBest && (
                        <span className="inline-block mt-1 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                          ⭐ Best ROI
                        </span>
                      )}
                    </div>
                    {scenarios.length > 1 && (
                      <button
                        onClick={() => removeScenario(scenario.id)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Configuration */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label
                        htmlFor={`years-${scenario.id}`}
                        className="text-xs text-gray-600 dark:text-gray-400"
                      >
                        Years
                      </label>
                      <input
                        id={`years-${scenario.id}`}
                        type="number"
                        value={scenario.years}
                        onChange={(e) =>
                          updateScenario(scenario.id, { years: parseInt(e.target.value) || 5 })
                        }
                        min="1"
                        max="20"
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`hectares-${scenario.id}`}
                        className="text-xs text-gray-600 dark:text-gray-400"
                      >
                        Hectares
                      </label>
                      <input
                        id={`hectares-${scenario.id}`}
                        type="number"
                        value={scenario.totalHectares}
                        onChange={(e) =>
                          updateScenario(scenario.id, {
                            totalHectares: parseFloat(e.target.value) || 10,
                          })
                        }
                        min="0.1"
                        step="0.1"
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                      />
                    </div>
                  </div>

                  {/* Crops */}
                  <div className="mb-3 space-y-2">
                    {scenario.crops.map((crop, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={crop.name}
                          onChange={(e) => updateCrop(scenario.id, idx, 'name', e.target.value)}
                          placeholder="Crop name"
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                        />
                        <input
                          type="number"
                          value={crop.percentage}
                          onChange={(e) =>
                            updateCrop(scenario.id, idx, 'percentage', e.target.value)
                          }
                          placeholder="%"
                          min="0"
                          max="100"
                          className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                        />
                        <button
                          onClick={() => removeCrop(scenario.id, idx)}
                          className="text-red-600 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addCropToScenario(scenario.id)}
                      className="w-full py-1 text-sm border-2 border-dashed border-gray-300 dark:border-gray-600 rounded hover:border-primary-500 transition-colors"
                    >
                      + Add Crop
                    </button>
                  </div>

                  {/* Allocation Status */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Allocation: {totalPercentage.toFixed(1)}%
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          totalPercentage === 100
                            ? 'bg-green-500'
                            : totalPercentage > 100
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics */}
                  {isValid && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Investment:</span>
                        <span className="font-semibold">
                          R{' '}
                          {metrics.totalInvestment.toLocaleString('en-ZA', {
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Annual Profit:</span>
                        <span className="font-semibold text-green-600">
                          R{' '}
                          {metrics.annualProfit.toLocaleString('en-ZA', {
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">ROI:</span>
                        <span className="font-bold text-primary-600">
                          {metrics.roi.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Payback:</span>
                        <span>
                          {metrics.paybackYears < 50
                            ? `${metrics.paybackYears.toFixed(1)} years`
                            : 'Not viable'}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-300 dark:border-gray-700">
                        <span>Total Net Profit:</span>
                        <span className="text-green-600">
                          R{' '}
                          {metrics.totalNetProfit.toLocaleString('en-ZA', {
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Comparison Table */}
          {scenarios.length > 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <h3 className="text-lg font-bold p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                📊 Side-by-Side Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Metric</th>
                      {scenarios.map((scenario) => (
                        <th
                          key={scenario.id}
                          className="px-4 py-3 text-right text-sm font-semibold"
                        >
                          {scenario.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {[
                      { label: 'Total Investment', key: 'totalInvestment' },
                      { label: 'Annual Revenue', key: 'annualRevenue' },
                      { label: 'Annual Costs', key: 'annualCosts' },
                      { label: 'Annual Profit', key: 'annualProfit' },
                      { label: 'ROI (%)', key: 'roi' },
                      { label: 'Payback (years)', key: 'paybackYears' },
                      { label: 'Total Net Profit', key: 'totalNetProfit' },
                    ].map((row) => (
                      <tr key={row.key}>
                        <td className="px-4 py-3 text-sm font-medium">{row.label}</td>
                        {scenarios.map((scenario) => {
                          const metrics = calculateScenarioMetrics(scenario)
                          const value = metrics[row.key as keyof ScenarioMetrics]
                          const isBest = scenarios.every(
                            (s) =>
                              calculateScenarioMetrics(s)[row.key as keyof ScenarioMetrics] <= value
                          )

                          return (
                            <td
                              key={scenario.id}
                              className={`px-4 py-3 text-sm text-right ${isBest && scenarios.length > 1 ? 'font-bold bg-green-50 dark:bg-green-900/20' : ''}`}
                            >
                              {row.key === 'roi'
                                ? `${value.toFixed(1)}%`
                                : row.key === 'paybackYears'
                                  ? value < 50
                                    ? value.toFixed(1)
                                    : 'N/A'
                                  : `R ${value.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
