'use client'

import WizardWrapper from '@/components/WizardWrapper'
import { useEffect, useState } from 'react'

// ... (interfaces remain the same)

export default function InvestmentCalculator() {
  // ... (state and functions remain the same)

  useEffect(() => {
    // ... (useEffect remains the same)
  }, [])

  const handleNext = () => {
    // ... (handleNext remains the same)
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
          {/* ... (content) */}
        </div>

        {/* Crop Investment Cards */}
        {crops.map((crop, index) => (
          <div
            key={crop.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm"
          >
            {/* ... (content) */}
          </div>
        ))}

        {/* Investment Summary & Funding Sources */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* ... (content) */}
        </div>

        {/* Financing Tips */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
          {/* ... (content) */}
        </div>
      </div>
    </WizardWrapper>
  )
}
