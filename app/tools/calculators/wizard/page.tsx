'use client'

import WizardWrapper from '@/components/WizardWrapper'
import {
  CROP_TEMPLATES,
  getBalancedPortfolio,
  getHighProfitPortfolio,
  getLowWaterPortfolio,
} from '@/lib/cropTemplates'
import { useWizardSessions } from '@/lib/hooks/useWizardSessions'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

// ... (interfaces remain the same)

export default function CalculatorWizard() {
  const router = useRouter()
  const [crops, setCrops] = useState([
    { id: '1', name: '', percentage: 100 },
  ])
  const totalPercentage = crops.reduce(
    (sum, c) => sum + (parseFloat(String(c.percentage)) || 0),
    0
  )

  const handleNext = () => {
    const setupData = {
      years: '5', // Assuming a default value
      crops: crops.filter((c) => c.name.trim() !== ''),
      totalPercentage,
    }
    sessionStorage.setItem('calculatorWizardData', JSON.stringify(setupData))
    router.push('/tools/calculators/wizard/location')
  }

  // ... (other state and functions remain the same)

  return (
    <WizardWrapper
      title="Calculator Wizard"
      description="Set up your crops and timeline once, then navigate through all calculators."
      step={1}
      isFormValid={totalPercentage === 100 && crops.filter((c) => c.name.trim()).length > 0}
      onNext={handleNext}
    >
      {/* ... (all the JSX from the original component) */}
    </WizardWrapper>
  )
}
