'use client'

import WizardWrapper from '@/components/WizardWrapper'
import { useEffect, useState } from 'react'

export default function LoanCalculator() {
  // ... (state and functions remain the same)

  useEffect(() => {
    // ... (useEffect remains the same)
  }, [values])

  const handleNext = () => {
    // ... (handleNext remains the same)
  }

  return (
    <WizardWrapper
      title="Loan Calculator"
      description="Calculate loan payments and interest costs."
      step={7}
      isFormValid={!!results}
      onNext={handleNext}
    >
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div>
            {/* ... (content) */}
          </div>

          {/* Results Section */}
          <div>
            {/* ... (content) */}
          </div>
        </div>

        {/* Amortization Schedule */}
        {results && results.schedule.length > 0 && (
          <div>
            {/* ... (content) */}
          </div>
        )}

        {/* Tips */}
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
          {/* ... (content) */}
        </div>
      </div>
    </WizardWrapper>
  )
}
