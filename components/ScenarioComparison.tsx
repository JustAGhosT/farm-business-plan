'use client'

import React from 'react'
import { CropTemplate, Scenario } from '@/types'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'

interface ScenarioComparisonProps {
  scenarios: Scenario[]
  cropTemplates?: CropTemplate[]
  onSelectScenario?: (scenarioId: string) => void
}

export function ScenarioComparison({
  scenarios,
  cropTemplates = [],
  onSelectScenario,
}: ScenarioComparisonProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getTemplateMetrics = (templateId: string) => {
    const template = cropTemplates.find((t) => t.id === templateId)
    if (!template) {
      return {
        investment: 0,
        revenue: 0,
        costs: 0,
      }
    }

    return {
      investment: template.investment || 0,
      revenue: template.revenuePerHectare || 0,
      costs: template.costsPerHectare || 0,
    }
  }

  const calculateScenarioMetrics = (scenario: Scenario) => {
    let totalInvestment = 0
    let totalRevenue = 0
    let totalCosts = 0

    scenario.crops.forEach((crop) => {
      const metrics = getTemplateMetrics(crop.id)
      const area = crop.plantingArea || 1

      totalInvestment += metrics.investment * area
      totalRevenue += metrics.revenue * area
      totalCosts += metrics.costs * area
    })

    const netProfit = totalRevenue - totalCosts - totalInvestment
    const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0

    return {
      totalInvestment,
      totalRevenue,
      totalCosts,
      netProfit,
      roi,
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Scenario Comparison</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario) => {
          const metrics = calculateScenarioMetrics(scenario)

          return (
            <Card key={scenario.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{scenario.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {scenario.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      scenario.status === 'approved'
                        ? 'success'
                        : scenario.status === 'rejected'
                          ? 'error'
                          : 'default'
                    }
                  >
                    {scenario.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Investment:</span>
                    <span className="font-medium">{formatCurrency(metrics.totalInvestment)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Revenue:</span>
                    <span className="font-medium">{formatCurrency(metrics.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Costs:</span>
                    <span className="font-medium">{formatCurrency(metrics.totalCosts)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold">Net Profit:</span>
                    <span
                      className={`font-semibold ${
                        metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(metrics.netProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">ROI:</span>
                    <span
                      className={`font-medium ${
                        metrics.roi >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {metrics.roi.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Crops: {scenario.crops.length}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {scenario.crops.slice(0, 3).map((crop) => (
                      <Badge key={crop.id} variant="outline" className="text-xs">
                        {crop.cropName}
                      </Badge>
                    ))}
                    {scenario.crops.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{scenario.crops.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {onSelectScenario && (
                  <Button
                    onClick={() => onSelectScenario(scenario.id)}
                    className="w-full mt-4"
                    variant={scenario.status === 'approved' ? 'primary' : 'secondary'}
                  >
                    {scenario.status === 'approved' ? 'View Details' : 'Select Scenario'}
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {scenarios.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No scenarios to compare yet.</p>
          <p className="text-sm mt-2">Create scenarios to see them here.</p>
        </div>
      )}
    </div>
  )
}
