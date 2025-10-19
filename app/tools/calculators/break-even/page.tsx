'use client'

import WizardWrapper from '@/components/WizardWrapper'
import { useEffect, useState } from 'react'

// ... (interfaces remain the same)

export default function BreakEvenCalculator() {
  // ... (state and functions remain the same)

  useEffect(() => {
    // ... (useEffect remains the same)
  }, [])

  const handleNext = () => {
    // ... (handleNext remains the same)
  }

  return (
    <WizardWrapper
      title="Break-Even Analysis"
      description="Determine the break-even point for your farm with multi-year projections."
      step={5}
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

        {/* Break-Even Summary */}
        {results.breakEvenUnits > 0 && (
          <div className="mb-8">
            {/* ... (content) */}
          </div>
        )}

        {/* Multi-Year Projections */}
        {results.breakEvenUnits > 0 &&
          results.yearBreakEvens &&
          results.yearBreakEvens.length > 0 && (
            <div className="mb-8">
              {/* ... (content) */}
            </div>
          )}

        {/* Per-Crop Break-Even Analysis */}
        {results.breakEvenUnits > 0 && crops.length > 1 && (
          <div className="mb-8">
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
