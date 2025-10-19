'use client'

import WizardWrapper from '@/components/WizardWrapper'
import { useEffect, useState } from 'react'

// ... (interfaces remain the same)

export default function ROICalculator() {
  // ... (state and functions remain the same)

  useEffect(() => {
    // ... (useEffect remains the same)
  }, [])

  const handleNext = () => {
    // ... (handleNext remains the same)
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
          {/* ... (content) */}
        </div>

        {/* Crop Input Cards */}
        {crops.map((crop, index) => (
          <div
            key={crop.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm"
          >
            {/* ... (content) */}
          </div>
        ))}

        {/* Results Summary */}
        {results.totalInvestment > 0 && (
          <div className="mb-8">
            {/* ... (content) */}
          </div>
        )}

        {/* Year-by-Year Analysis */}
        {results.totalInvestment > 0 &&
          results.yearResults &&
          results.yearResults.length > 0 && (
            <div className="mb-8">
              {/* ... (content) */}
            </div>
          )}

        {/* Per-Crop ROI Breakdown */}
        {results.totalInvestment > 0 && crops.length > 1 && (
          <div className="mb-8">
            {/* ... (content) */}
          </div>
        )}

        {/* Save Calculation Section */}
        {results.totalInvestment > 0 && (
          <div className="mb-8 border-t dark:border-gray-700 pt-6">
            {/* ... (content) */}
          </div>
        )}

        {/* Tips */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
          {/* ... (content) */}
        </div>
      </div>
    </WizardWrapper>
  )
}
